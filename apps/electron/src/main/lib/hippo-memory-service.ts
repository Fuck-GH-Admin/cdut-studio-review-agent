/**
 * hippo-memory-service.ts — 海马体终身记忆检索服务（纯内存图谱 + 个性化 PageRank）
 *
 * 本服务是 HippoRAG 增强链路的检索入口，与经典 FTS5 引擎（memory-archive-search.ts）
 * 完全解耦：经典实现保持 100% 不动，本服务作为可选增强以策略路由器按用户设置调用。
 *
 * 设计要点：
 * - 纯 TypeScript + 原生 Float32Array，零外部数据库、零新依赖；
 * - 文档节点命名 `doc::<相对路径>` 且 isDoc=true，实体节点为 `cutForMemoryIndex` 切出的 token；
 * - 文档↔实体加无向边（权重=词频），Query 经同一套切分得到种子实体，触发多跳激活扩散；
 * - 图结构以 archivePath 为键做进程内 Map 缓存，带目录指纹，目录变更时自动失效重建；
 * - 内存守卫：最多 2000 个文件、单文件 2MB、单文档实体 token 上限 200。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, extname } from 'node:path'
import { cutForMemoryIndex, type MemoryArchiveSearchHit } from './memory-archive-search'
import { HippoMemoryGraph } from './hippo-memory-graph'

/** 索引覆盖的最大文件数，防止异常目录拖垮检索 */
const MAX_FILES = 2_000
/** 单文件过大保护：超过该字节数不参与图谱构建 */
const MAX_FILE_BYTES = 2 * 1024 * 1024
/** 单文档实体节点上限，控制常驻内存 */
const MAX_TOKENS_PER_DOC = 200
/** 命中片段最大字符数 */
const MAX_SNIPPET_CHARS = 1_500
/** 文档节点名前缀，避免与实体 token 命名冲突 */
const DOC_PREFIX = 'doc::'
/** PPR 阻尼重启因子（标准 0.15） */
const PPR_ALPHA = 0.15
/** PPR 幂迭代次数 */
const PPR_MAX_ITER = 15

/** 单个记忆文档的元信息 */
interface DocEntry {
  absPath: string
  /** 相对 memory-archive 的路径（统一用 / 归一） */
  relativePath: string
  size: number
  mtimeMs: number
}

/** 图谱缓存项 */
interface GraphCacheEntry {
  /** 目录指纹，用于失效判断 */
  fingerprint: string
  graph: HippoMemoryGraph
  /** 文档节点名 -> 绝对路径 */
  docAbsPaths: Map<string, string>
  /** 文档节点名 -> 归一相对路径 */
  docRelPaths: Map<string, string>
}

/** 递归收集 memory-archive 下所有 .md 文件（跳过点文件，带文件数上限） */
function collectDocs(dir: string): DocEntry[] {
  const out: DocEntry[] = []
  const walk = (current: string) => {
    let entries: import('node:fs').Dirent[]
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const abs = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md' && out.length < MAX_FILES) {
        let st
        try { st = statSync(abs) } catch { continue }
        if (!st.isFile() || st.size > MAX_FILE_BYTES) continue
        const rel = relative(resolve(dir), resolve(abs)).split(/[\\/]/).join('/')
        out.push({ absPath: abs, relativePath: rel, size: st.size, mtimeMs: Math.floor(st.mtimeMs) })
      }
    }
  }
  walk(dir)
  return out
}

/** 由文档元信息计算目录指纹（数量 + 每个文件的路径/大小/修改时间） */
function fingerprintOfDocs(docs: DocEntry[]): string {
  return `${docs.length}|${docs.map((d) => `${d.relativePath}:${d.size}:${d.mtimeMs}`).join(';')}`
}

/** 在全文里截取首个 query token 命中处附近 ≤ MAX_SNIPPET_CHARS 字符作为 content */
function extractSnippet(full: string, queryTokens: string[]): { content: string; startIndex: number; endIndex: number } {
  const lowerFull = full.toLowerCase()
  let hitIndex = -1
  for (const token of queryTokens) {
    if (!token) continue
    let idx = full.indexOf(token)
    if (idx < 0) idx = lowerFull.indexOf(token.toLowerCase())
    if (idx >= 0 && (hitIndex < 0 || idx < hitIndex)) hitIndex = idx
  }

  const start = hitIndex >= 0 ? Math.max(0, hitIndex - 150) : 0
  const end = Math.min(full.length, start + MAX_SNIPPET_CHARS)
  return { content: full.slice(start, end), startIndex: start, endIndex: end }
}

export class HippoMemoryService {
  /** 以 memory-archive 绝对路径为键的图谱缓存 */
  private cache = new Map<string, GraphCacheEntry>()

  /**
   * 构建（或复用缓存）海马体图谱。
   * @param archivePath - memory-archive 绝对路径
   */
  private ensureGraph(archivePath: string, docs: DocEntry[]): GraphCacheEntry {
    const key = resolve(archivePath)
    const fingerprint = fingerprintOfDocs(docs)
    const cached = this.cache.get(key)
    if (cached && cached.fingerprint === fingerprint) return cached

    const graph = new HippoMemoryGraph()
    const docAbsPaths = new Map<string, string>()
    const docRelPaths = new Map<string, string>()

    for (const doc of docs) {
      const docNodeName = DOC_PREFIX + doc.relativePath
      graph.getOrCreateNode(docNodeName, true)
      docAbsPaths.set(docNodeName, doc.absPath)
      docRelPaths.set(docNodeName, doc.relativePath)

      let text = ''
      try { text = readFileSync(doc.absPath, 'utf-8') } catch { continue }

      // 统计词频，取 Top MAX_TOKENS_PER_DOC 个实体词以控内存
      const freq = new Map<string, number>()
      for (const token of cutForMemoryIndex(text)) {
        freq.set(token, (freq.get(token) ?? 0) + 1)
      }
      const topTokens = [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_TOKENS_PER_DOC)

      for (const [token, count] of topTokens) {
        // 文档与实体之间无向边，权重=词频
        graph.addUndirectedEdge(docNodeName, token, count)
      }
    }

    const entry: GraphCacheEntry = { fingerprint, graph, docAbsPaths, docRelPaths }
    this.cache.set(key, entry)
    return entry
  }

  /**
   * 海马体检索：Query → 种子实体 → 个性化 PageRank → 文档节点降序召回。
   * @param memoryArchivePath - memory-archive 绝对路径
   * @param query - 原始查询词
   * @param topK - 返回条数上限
   */
  public async search(memoryArchivePath: string, query: string, topK = 5): Promise<MemoryArchiveSearchHit[]> {
    const docs = collectDocs(memoryArchivePath)
    const entry = this.ensureGraph(memoryArchivePath, docs)

    // Query 种子：切分后仅保留图谱中真实存在的实体节点
    const queryTokens = cutForMemoryIndex(query)
    const seeds = queryTokens.filter((token) => entry.graph.nodeIndices.has(token))
    if (seeds.length === 0) return []

    const ppr = entry.graph.computePersonalizedPageRank(seeds, PPR_ALPHA, PPR_MAX_ITER)
    const limit = Math.max(1, Math.min(topK, MAX_FILES))
    const ranked = [...ppr.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)

    const hits: MemoryArchiveSearchHit[] = []
    for (const [docNodeName, score] of ranked) {
      const absPath = entry.docAbsPaths.get(docNodeName)
      const relPath = entry.docRelPaths.get(docNodeName)
      if (!absPath || !relPath) continue

      let full = ''
      try { full = readFileSync(absPath, 'utf-8') } catch { continue }

      const { content, startIndex, endIndex } = extractSnippet(full, queryTokens)
      hits.push({
        relativePath: relPath,
        content,
        startIndex,
        endIndex,
        score,
        matchedTokens: seeds,
      })
    }
    return hits
  }

  /** 清空缓存（测试/显式刷新用） */
  public clearCache(): void {
    this.cache.clear()
  }
}

/** 全进程单例：路由器与其他调用方直接复用同一份图谱缓存 */
export const hippoMemoryService = new HippoMemoryService()
