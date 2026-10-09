/**
 * memory-sleep-consolidator.ts — 空闲期睡眠反思消歧整合服务
 *
 * 借鉴人脑海马体在睡眠期对记忆的离线重放与巩固：在设备接电且系统空闲时，周期性扫描
 * memory-archive 目录，做时间衰减打分、Wikilink 稠密化与同主题聚合统计，帮助发现
 * 可合并/可清理的陈旧记忆。
 *
 * 严格红线：
 * - 绝不删除用户文件、绝不伪造内容，仅返回统计数据并可选地写入索引文件；
 * - 定时器必须 `.unref()`，避免阻塞进程退出；不得在模块加载时自动启动。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, extname } from 'node:path'
import { powerMonitor } from 'electron'
import { readJsonFileSafe, writeJsonFileAtomic } from './safe-file'

/** 索引文件名（写入 memory-archive 根目录，非 .md 不会被再次扫描） */
const INDEX_FILE_NAME = 'index.json'
/** 单文件过大保护 */
const MAX_FILE_BYTES = 2 * 1024 * 1024
/** 扫描文件数上限 */
const MAX_FILES = 2_000
/** 时间衰减半衰期（天）：decayWeight = 0.5 ^ (ageDays / 半衰期) */
const DECAY_HALF_LIFE_DAYS = 30
/** 衰减判定阈值：权重低于该值视为「陈旧衰减」记忆 */
const DECAYED_THRESHOLD = 0.5
/** 空闲判定阈值（秒）：系统空闲达到该时长才执行整合 */
const IDLE_THRESHOLD_SEC = 5 * 60
/** 默认定时间隔（毫秒）：30 分钟 */
const DEFAULT_INTERVAL_MS = 30 * 60 * 1000

/** 整合统计结果 */
export interface MemoryConsolidationResult {
  /** 扫描的 .md 文件数 */
  scanned: number
  /** 检测到的可合并同主题文件组数（同一主题键下 ≥2 个文件） */
  merged: number
  /** 按 mtime 距离衰减后低于阈值的陈旧文件数 */
  decayed: number
  /** wikilink 稠密化发现的跨文档连接数（同一链接名出现在 ≥2 个文件） */
  densified: number
}

/** 单个记忆文档的解析结果 */
interface ConsolidationDoc {
  absPath: string
  relativePath: string
  mtimeMs: number
  /** 时间衰减权重（1 表示新鲜，越小越陈旧） */
  decayWeight: number
  /** 文档主题键（优先 frontmatter name，其次一级标题，最后文件名） */
  topicKey: string
  /** 文档内出现的 wikilink 名称集合 */
  linkNames: Set<string>
}

/** 索引文件结构（仅统计与聚合，不承载/伪造记忆正文） */
interface ConsolidationIndex {
  version: number
  generatedAt: string
  memoryArchivePath: string
  stats: MemoryConsolidationResult
  topics: Array<{ topic: string; files: string[] }>
  links: Array<{ name: string; files: string[] }>
}

/** 递归收集目录下所有 .md 文件（跳过点文件，带文件数与单文件大小上限） */
function collectMarkdownFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (current: string) => {
    let entries: import('node:fs').Dirent[]
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const abs = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md' && out.length < MAX_FILES) {
        try {
          const st = statSync(abs)
          if (!st.isFile() || st.size > MAX_FILE_BYTES) continue
        } catch { continue }
        out.push(abs)
      }
    }
  }
  walk(dir)
  return out
}

/** 解析 frontmatter 中的 name 字段（简化实现：仅匹配 --- 之间的 name: xxx） */
function parseFrontmatterName(text: string): string | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return null
  const nameLine = /(?:^|\n)\s*name\s*:\s*(.+?)\s*(?:\r?\n|$)/.exec(match[1] ?? '')
  return nameLine?.[1]?.trim().replace(/^["']|["']$/g, '') || null
}

/** 解析一级标题（# 标题） */
function parseFirstHeading(text: string): string | null {
  const match = /^#\s+(.+)$/m.exec(text)
  return match?.[1]?.trim() || null
}

/** 抽取全部 [[wikilink]] 名称（忽略 | 别名与 # 锚点） */
function extractWikilinks(text: string): Set<string> {
  const names = new Set<string>()
  const re = /\[\[([^\]\n]+?)\]\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const raw = m[1] ?? ''
    const name = raw.split('|')[0]!.split('#')[0]!.trim()
    if (name) names.add(name)
  }
  return names
}

export class MemorySleepConsolidator {
  private timer: NodeJS.Timeout | null = null
  private running = false
  private targetPath: string | null = null

  /**
   * 执行一次睡眠整合：扫描 → 时间衰减打分 → Wikilink 稠密化 → 同主题聚合。
   * 仅返回统计，并可选写入 index.json；绝不修改或删除用户记忆文件。
   */
  public async consolidate(memoryArchivePath: string): Promise<MemoryConsolidationResult> {
    const files = collectMarkdownFiles(memoryArchivePath)
    const now = Date.now()
    const docs: ConsolidationDoc[] = []

    for (const absPath of files) {
      let text = ''
      try { text = readFileSync(absPath, 'utf-8') } catch { continue }
      let mtimeMs = now
      try { mtimeMs = Math.floor(statSync(absPath).mtimeMs) } catch { /* 保留默认值 */ }

      const ageDays = Math.max(0, (now - mtimeMs) / 86_400_000)
      const decayWeight = 0.5 ** (ageDays / DECAY_HALF_LIFE_DAYS)
      const baseName = extname(absPath) ? absPath.slice(0, -extname(absPath).length) : absPath
      const topicKey =
        parseFrontmatterName(text) ??
        parseFirstHeading(text) ??
        baseName.split(/[\\/]/).pop() ??
        ''
      const relPath = relative(resolve(memoryArchivePath), resolve(absPath)).split(/[\\/]/).join('/')

      docs.push({
        absPath,
        relativePath: relPath,
        mtimeMs,
        decayWeight,
        topicKey,
        linkNames: extractWikilinks(text),
      })
    }

    // 时间衰减统计：低于阈值的陈旧文件数
    let decayed = 0
    for (const doc of docs) {
      if (doc.decayWeight < DECAYED_THRESHOLD) decayed++
    }

    // 同主题聚合：同一主题键下 ≥2 个文件的组即为可合并簇
    const topicMap = new Map<string, string[]>()
    for (const doc of docs) {
      if (!doc.topicKey) continue
      const list = topicMap.get(doc.topicKey) ?? []
      list.push(doc.relativePath)
      topicMap.set(doc.topicKey, list)
    }
    const topics = [...topicMap.entries()]
      .map(([topic, topicFiles]) => ({ topic, files: topicFiles }))
      .sort((a, b) => b.files.length - a.files.length)
    const merged = topics.filter((t) => t.files.length >= 2).length

    // Wikilink 稠密化：统计每个链接名出现在哪些文档，跨文档（≥2）即为一条稠密化连接
    const linkMap = new Map<string, string[]>()
    for (const doc of docs) {
      for (const name of doc.linkNames) {
        const list = linkMap.get(name) ?? []
        list.push(doc.relativePath)
        linkMap.set(name, list)
      }
    }
    const links = [...linkMap.entries()]
      .map(([name, linkFiles]) => ({ name, files: [...new Set(linkFiles)] }))
      .filter((l) => l.files.length >= 2)
      .sort((a, b) => b.files.length - a.files.length)
    const densified = links.length

    const stats: MemoryConsolidationResult = {
      scanned: docs.length,
      merged,
      decayed,
      densified,
    }

    // 可选索引写入：仅写聚合统计，绝不覆盖用户正文
    try {
      const indexPath = join(memoryArchivePath, INDEX_FILE_NAME)
      const existing = readJsonFileSafe<ConsolidationIndex>(indexPath)
      const index: ConsolidationIndex = {
        version: (existing?.version ?? 0) + 1,
        generatedAt: new Date().toISOString(),
        memoryArchivePath,
        stats,
        topics,
        links,
      }
      writeJsonFileAtomic(indexPath, index)
    } catch (err) {
      console.warn('[记忆整合] 索引写入失败（不影响统计结果）:', err)
    }

    return stats
  }

  /**
   * 启动空闲期定时整合。
   * 触发条件：设备未使用电池（isOnBatteryPower() === false）且系统空闲达到阈值。
   * 定时器 `.unref()`，不阻塞进程退出。
   */
  public start(memoryArchivePath?: string, intervalMs = DEFAULT_INTERVAL_MS): void {
    this.targetPath = memoryArchivePath ?? null
    if (this.timer) return

    this.timer = setInterval(() => {
      void this.tick()
    }, Math.max(60_000, intervalMs))
    // 关键：不阻塞 Node/Electron 事件循环退出
    this.timer.unref()
  }

  /** 停止定时整合 */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** 单次定时回调：仅在接电且空闲时执行，且避免重入 */
  private async tick(): Promise<void> {
    if (this.running || !this.targetPath) return

    try {
      if (powerMonitor.isOnBatteryPower()) return
      if (powerMonitor.getSystemIdleTime() < IDLE_THRESHOLD_SEC) return
    } catch {
      // powerMonitor 在部分环境下不可用，跳过本次整合
      return
    }

    this.running = true
    try {
      await this.consolidate(this.targetPath)
    } catch (err) {
      console.warn('[记忆整合] 空闲期整合异常:', err)
    } finally {
      this.running = false
    }
  }
}
