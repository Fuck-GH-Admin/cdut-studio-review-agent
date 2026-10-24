/**
 * speculative-tool-engine.ts — 推测式只读工具预热引擎
 *
 * 机制设计（Anticipatory Pre-warm）：
 * 利用 DeepSeek / Claude 在流式输出 Thinking 思考内容时的数十秒计算间隙，
 * 实时检测其中打算调用的「只读文件路径与符号」，并发执行 `fs.promises.readFile`
 * 预加载至操作系统内存 PageCache 与内部 LRU 缓存中。
 *
 * 当紧随其后的真实工具调用命中缓存时，即可零等待直接返回内容，
 * 从而把串行的「思考 → 读文件」链路折叠为「思考期间已完成 I/O」。
 */

import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

/** 预热的单条缓存项 */
interface PrewarmedItem {
  content: string
  timestamp: number
  byteLength: number
}

/**
 * 推测式只读工具预热引擎（全局单例）。
 */
export class SpeculativeToolEngine {
  private static instance: SpeculativeToolEngine
  /** 文件绝对路径 -> 预读内容 */
  private prewarmCache = new Map<string, PrewarmedItem>()
  /** 正在预读中的路径集合，避免同一文件并发重复读取 */
  private inflightReads = new Set<string>()
  /** 50MB 内存硬上限（当前实现以 TTL 为主，字节上限用于未来扩展） */
  private readonly MAX_CACHE_BYTES = 50 * 1024 * 1024
  /** 20 秒不命中自动丢弃 */
  private readonly CACHE_TTL_MS = 20_000

  public static getInstance(): SpeculativeToolEngine {
    if (!this.instance) this.instance = new SpeculativeToolEngine()
    return this.instance
  }

  /**
   * 监听思考流增量，纳秒级正则匹配预测只读文件。
   *
   * @param sessionId 会话 ID（预留：用于按会话隔离预读策略）
   * @param cwd 相对路径解析基准目录（通常是工作区根目录）
   * @param chunk 本次思考流增量文本
   */
  public feedThinkingChunk(sessionId: string, cwd: string, chunk: string): void {
    if (!chunk || chunk.length < 5) return

    // 匹配如: "I need to view src/main.ts", "check package.json", "read `/path/file.ext`"
    const filePatterns = /(?:read|view|check|inspect|open|examine)\s+(?:file\s+)?["'`]?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]{1,8})["'`]?/gi
    let match: RegExpExecArray | null

    while ((match = filePatterns.exec(chunk)) !== null) {
      const candidatePath = match[1]
      if (candidatePath && !candidatePath.includes('*')) {
        const targetAbs = isAbsolute(candidatePath) ? candidatePath : resolve(cwd, candidatePath)
        this.speculativePreload(targetAbs)
      }
    }
  }

  /** 后台静默预读单个文件（失败一律忽略，绝不影响思考流） */
  private async speculativePreload(absPath: string): Promise<void> {
    if (this.prewarmCache.has(absPath) || this.inflightReads.has(absPath)) return
    this.inflightReads.add(absPath)

    try {
      const stat = await fs.stat(absPath).catch(() => null)
      // 安全守卫：只预读 <= 3MB 的常规代码文件
      if (stat && stat.isFile() && stat.size <= 3 * 1024 * 1024) {
        const content = await fs.readFile(absPath, 'utf8')
        this.prewarmCache.set(absPath, {
          content,
          timestamp: Date.now(),
          byteLength: stat.size,
        })
      }
    } catch {
      // 静默忽略
    } finally {
      this.inflightReads.delete(absPath)
      this.evictStale()
    }
  }

  /**
   * 实际工具调用时读取命中：零等待直接返回。
   *
   * @returns 命中且未过期的文件内容；否则返回 null
   */
  public consumePrewarmed(absPath: string): string | null {
    const item = this.prewarmCache.get(absPath)
    if (!item) return null
    if (Date.now() - item.timestamp > this.CACHE_TTL_MS) {
      this.prewarmCache.delete(absPath)
      return null
    }
    this.prewarmCache.delete(absPath) // 一次性消费
    return item.content
  }

  /** 清理超过 TTL 的陈旧缓存项 */
  private evictStale(): void {
    const now = Date.now()
    for (const [k, v] of this.prewarmCache.entries()) {
      if (now - v.timestamp > this.CACHE_TTL_MS) this.prewarmCache.delete(k)
    }
  }
}

/** 全局单例 */
export const speculativeToolEngine = SpeculativeToolEngine.getInstance()
