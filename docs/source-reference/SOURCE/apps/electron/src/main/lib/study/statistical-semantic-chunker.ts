/**
 * statistical-semantic-chunker.ts — 统计语义切块引擎（离线 RAG Domain 1：Chunking）
 *
 * 算法（Markdown 骨架感知 + 统计语义切块）：
 *   1. 粗粒度骨架：先按 Markdown 标题（H1–H6）切分章节；
 *   2. 句级拆分：在每个章节内部把正文拆成独立句子；
 *   3. 局部语义相关性：以「中文 bigram + 英文词元」的 Jaccard 相似度衡量相邻句子相关性
 *      （轻量、零依赖、纯本地，避免引入重型句向量模型）；
 *   4. 统计突变点：计算相邻相似度的滑动窗口均值与标准差，在相似度低于
 *      `均值 - 阈值 × 标准差` 处判定为主题漂移（Thematic Drift），划定语义边界；
 *   5. 尺寸约束：保证不截断句子，单块字符数自适应稳定在 MIN ~ MAX 区间。
 *
 * 设计红线：全流程 100% 本地；绝不截断句子；绝不新增/猜测内容。
 */

/** 单块最小目标字符数（过短则与相邻块合并） */
const MIN_CHUNK_CHARS = 800
/** 单块最大字符数（超过则按已有语义边界强制切分） */
const MAX_CHUNK_CHARS = 1500
/** 统计突变点阈值（相似度低于 均值 - K×标准差 处切分） */
const DRIFT_K = 0.6
/** 滑动窗口半径 */
const WINDOW_RADIUS = 2

/** 切块结果（与大纲树节点一一对应） */
export interface SemanticChunk {
  title: string
  level: number
  content: string
}

/** 中文 bigram + 英文词元分词（与图谱阶段保持同一套轻量方案） */
function tokenize(text: string): Set<string> {
  const tokens = new Set<string>()
  const lower = text.toLowerCase()
  for (const word of lower.match(/[a-z0-9]{2,}/g) ?? []) tokens.add(word)
  const han = lower.match(/[\u4e00-\u9fa5]/g) ?? []
  for (let i = 0; i < han.length; i++) {
    tokens.add(han[i]!)
    if (i + 1 < han.length) tokens.add(`${han[i]}${han[i + 1]}`)
  }
  return tokens
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const token of a) if (b.has(token)) inter++
  return inter / (a.size + b.size - inter)
}

/** 把正文拆成句子（中文/英文句末标点 + 换行） */
function splitSentences(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, '\n')
  const sentences: string[] = []
  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // 保留句末标点：以标点切分后再拼回
    const parts = trimmed.split(/(?<=[。！？!?；;…])/)
    for (const part of parts) {
      const sentence = part.trim()
      if (sentence) sentences.push(sentence)
    }
  }
  return sentences
}

/** 句式标题识别（用于无显式标题时的兜底标题） */
function isHeadingLine(line: string): boolean {
  return /^#{1,6}\s+\S/.test(line)
}

/**
 * 按 Markdown 标题骨架切分为粗粒度章节。
 * 保留标题层级；无正文的纯标题行并入相邻章节，避免空块。
 */
function splitBySkeleton(markdown: string): Array<{ title: string; level: number; body: string }> {
  const sections: Array<{ title: string; level: number; body: string }> = []
  let title = '前言'
  let level = 1
  let buffer: string[] = []

  const flush = (): void => {
    const body = buffer.join('\n').trim()
    if (body) sections.push({ title, level, body })
    buffer = []
  }

  for (const line of markdown.split('\n')) {
    if (isHeadingLine(line)) {
      flush()
      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line)!
      level = match[1]!.length
      title = match[2]!.trim()
      continue
    }
    buffer.push(line)
  }
  flush()

  if (sections.length === 0) {
    const body = markdown.trim()
    if (body) sections.push({ title: '正文', level: 1, body })
  }
  return sections
}

/**
 * 统计语义切分：对单个章节正文按主题漂移点切块。
 * 保证不截断句子，块尺寸自适应稳定在 MIN ~ MAX。
 */
function chunkSectionBody(body: string): string[] {
  const sentences = splitSentences(body)
  if (sentences.length === 0) return []
  if (body.length <= MAX_CHUNK_CHARS) return [body]

  // 相邻句子相似度序列
  const tokenSets = sentences.map(tokenize)
  const sims: number[] = []
  for (let i = 1; i < sentences.length; i++) {
    sims.push(jaccard(tokenSets[i - 1]!, tokenSets[i]!))
  }

  // 计算每个边界处的滑动窗口均值与标准差，判定是否为主题漂移点
  const isBoundary: boolean[] = new Array(sentences.length).fill(false)
  for (let i = 1; i < sentences.length; i++) {
    const start = Math.max(0, i - 1 - WINDOW_RADIUS)
    const end = Math.min(sims.length, i - 1 + WINDOW_RADIUS)
    const window = sims.slice(start, end)
    if (window.length === 0) continue
    const mean = window.reduce((sum, value) => sum + value, 0) / window.length
    const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / window.length
    const std = Math.sqrt(variance)
    const similarity = sims[i - 1]!
    // 相似度显著低于窗口均值 → 主题漂移，作为语义边界
    if (similarity < mean - DRIFT_K * std) isBoundary[i] = true
  }

  // 依据边界累积句子成块，并在尺寸约束内自适应
  const chunks: string[] = []
  let current: string[] = []
  let currentChars = 0

  const flush = (): void => {
    const content = current.join('').trim()
    if (content) chunks.push(content)
    current = []
    currentChars = 0
  }

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]!
    // 达到最小块且命中语义边界 / 达到硬上限 → 切分
    if (currentChars >= MIN_CHUNK_CHARS && (isBoundary[i] || currentChars + sentence.length > MAX_CHUNK_CHARS)) {
      flush()
    } else if (currentChars + sentence.length > MAX_CHUNK_CHARS && currentChars >= MIN_CHUNK_CHARS / 2) {
      // 无边界但已达上限：就近切分（仍保证不截断句子）
      flush()
    }
    current.push(sentence)
    currentChars += sentence.length
  }
  flush()

  // 收尾：过短的尾块与前一组合并，避免碎块
  if (chunks.length >= 2 && chunks[chunks.length - 1]!.length < MIN_CHUNK_CHARS / 2) {
    const last = chunks.pop()!
    chunks[chunks.length - 1] = `${chunks[chunks.length - 1]!}\n\n${last}`
  }
  return chunks
}

/**
 * 把规范化 Markdown 切分为高内聚语义块。
 *
 * @param markdown 已纯化的 Markdown 纯文本
 * @returns 语义切块列表（title / level / content）
 */
export function chunkMarkdownSemantically(markdown: string): SemanticChunk[] {
  if (!markdown.trim()) return []
  const skeleton = splitBySkeleton(markdown)
  const chunks: SemanticChunk[] = []

  for (const section of skeleton) {
    const bodies = chunkSectionBody(section.body)
    if (bodies.length <= 1) {
      const content = bodies[0] ?? section.body
      if (content.trim()) chunks.push({ title: section.title, level: section.level, content })
      continue
    }
    bodies.forEach((content, index) => {
      const title = index === 0 ? section.title : `${section.title}（续 ${index + 1}）`
      chunks.push({ title, level: section.level, content })
    })
  }

  return chunks
}
