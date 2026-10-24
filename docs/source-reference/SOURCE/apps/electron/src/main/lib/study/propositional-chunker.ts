/**
 * propositional-chunker.ts — Dense X-Retrieval 原子命题化切块引擎
 *
 * 职责（离线教学速课堂 RAG Domain 1 增强切块）：
 *   彻底废弃「纯标点断句」导致的公式前提丢失问题——保证 LaTeX 数学环境、
 *   引理约束与所属章节全路径面包屑强力绑定，输出可直接检索的「命题块」。
 *
 * 算法流程：
 *   1. 公式保护：先抽取 `$$...$$` 与 `$...$` 两类 LaTeX 环境，替换为占位符，
 *      避免正文分句/标题识别误伤数学符号；
 *   2. 面包屑栈：按 Markdown 标题（H1–H6）维护层级栈，生成
 *      `[高等数学 > 第三章 > 柯西中值定理]` 形式的全路径前缀；
 *   3. 命题聚合：以「。！？；」句末标点与空行切句，聚合成目标
 *      300–1200 字符的命题块（过短并入相邻块，硬上限约 1600 字符）；
 *   4. 公式还原：把占位符还原为原始 LaTeX，并记录块内公式集合；
 *   5. 确定性 ID：以 FNV-1a 哈希生成稳定 chunkId。
 *
 * 设计红线：纯 TypeScript 内存算法，零新依赖；绝不截断/编造内容。
 */

/** 单块最小字符数（过短会与相邻命题块合并） */
const MIN_CHUNK_CHARS = 300
/** 单块目标最大字符数（超过则在句末边界切分） */
const TARGET_MAX_CHARS = 1200
/** 单块硬上限字符数（即使单句超长也不截断，仅作聚合上限） */
const HARD_MAX_CHARS = 1600

/** 数学占位符匹配（还原时按编号取回原始 LaTeX） */
const MATH_PLACEHOLDER_RE = /__MATH_BLOCK_(\d+)__/g

/** 原子命题块（与检索/图谱阶段一一对应） */
export interface PropositionalChunk {
  chunkId: string
  breadcrumb: string
  content: string
  mathBlocks: string[]
  charCount: number
}

/** FNV-1a 32 位哈希（零依赖、确定性、跨平台一致） */
function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** 抽取并保护所有 LaTeX 块（`$$...$$` 优先，其次 `$...$`） */
function protectMath(markdown: string): { text: string; mathMap: Map<string, string> } {
  const mathMap = new Map<string, string>()
  let mathCounter = 0
  const text = markdown.replace(/\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$/g, (match) => {
    const placeholder = `__MATH_BLOCK_${mathCounter++}__`
    mathMap.set(placeholder, match)
    return placeholder
  })
  return { text, mathMap }
}

/** 把占位符还原为原始 LaTeX */
function restoreMath(text: string, mathMap: Map<string, string>): string {
  return text.replace(MATH_PLACEHOLDER_RE, (placeholder) => mathMap.get(placeholder) ?? placeholder)
}

/** 收集段文本中出现的所有 LaTeX 公式（按出现顺序） */
function collectMathBlocks(text: string, mathMap: Map<string, string>): string[] {
  const blocks: string[] = []
  const re = new RegExp(MATH_PLACEHOLDER_RE.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    const value = mathMap.get(match[0])
    if (value !== undefined) blocks.push(value)
  }
  return blocks
}

/** 由标题栈生成面包屑前缀；栈为空时返回空串 */
function buildBreadcrumb(stack: Array<{ level: number; title: string }>): string {
  if (stack.length === 0) return ''
  return `[${stack.map((item) => item.title).join(' > ')}]`
}

/** 章节片段（含面包屑与正文） */
interface Section {
  breadcrumb: string
  body: string
}

/** 按 Markdown 标题栈切分为章节片段 */
function splitSections(text: string): Section[] {
  const sections: Section[] = []
  const stack: Array<{ level: number; title: string }> = []
  let buffer: string[] = []

  const flush = (): void => {
    const body = buffer.join('\n').trim()
    if (body) sections.push({ breadcrumb: buildBreadcrumb(stack), body })
    buffer = []
  }

  for (const line of text.split('\n')) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line)
    if (heading) {
      flush()
      const level = heading[1]!.length
      const title = heading[2]!.trim()
      while (stack.length > 0 && stack[stack.length - 1]!.level >= level) stack.pop()
      stack.push({ level, title })
      continue
    }
    buffer.push(line)
  }
  flush()
  return sections
}

/** 按句末标点（。！？；）与空行切句 */
function splitPropositions(body: string): string[] {
  return body
    .replace(/\r\n?/g, '\n')
    .split(/(?<=[。！？；])|\n{2,}/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

/** 将句子序列聚合为命题块（目标 300–1200，硬上限约 1600） */
function aggregatePropositions(sentences: string[]): string[] {
  const blocks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > TARGET_MAX_CHARS) {
      blocks.push(current)
      current = ''
    }
    current += sentence
    if (current.length >= HARD_MAX_CHARS) {
      blocks.push(current)
      current = ''
    }
  }
  if (current) blocks.push(current)
  return blocks
}

/** 过短命题块并入相邻块（不超过硬上限） */
function mergeShortBlocks(blocks: string[]): string[] {
  const merged: string[] = []
  for (const block of blocks) {
    if (merged.length > 0) {
      const previous = merged[merged.length - 1]!
      const eitherShort = previous.length < MIN_CHUNK_CHARS || block.length < MIN_CHUNK_CHARS
      if (eitherShort && previous.length + block.length <= HARD_MAX_CHARS) {
        merged[merged.length - 1] = `${previous}\n${block}`
        continue
      }
    }
    merged.push(block)
  }
  return merged
}

/**
 * 把规范化 Markdown 切分为强绑定的原子命题块。
 *
 * @param markdown 已纯化的 Markdown 纯文本
 * @returns 命题块列表（含面包屑、正文、公式集合与确定性 chunkId）
 */
export function chunkByPropositions(markdown: string): PropositionalChunk[] {
  if (!markdown || !markdown.trim()) return []

  const { text, mathMap } = protectMath(markdown)
  const sections = splitSections(text)
  const chunks: PropositionalChunk[] = []
  let index = 0

  for (const section of sections) {
    const sentences = splitPropositions(section.body)
    const blocks = mergeShortBlocks(aggregatePropositions(sentences))
    for (const block of blocks) {
      const body = restoreMath(block, mathMap)
      const mathBlocks = collectMathBlocks(block, mathMap)
      const prefix = section.breadcrumb
      const content = prefix ? `${prefix}\n${body}` : body
      chunks.push({
        chunkId: fnv1aHex(`${index}:${prefix}:${body}`),
        breadcrumb: prefix,
        content,
        mathBlocks,
        charCount: content.length,
      })
      index++
    }
  }

  return chunks
}
