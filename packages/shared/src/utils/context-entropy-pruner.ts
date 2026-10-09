/**
 * context-entropy-pruner.ts — 本地轻量语义熵上下文剪枝引擎
 */

export interface EntropyPruneOptions {
  /** 目标压缩率（默认 0.5，即保留约 50% 最核心信息） */
  targetRatio?: number
  /** 单块文本触发剪枝的最小字符阈值（默认 2000） */
  minCharsToPrune?: number
  /** 强制保留的头部行数（保留上下文环境，默认 20） */
  keepHeadLines?: number
  /** 强制保留的尾部行数（保留最终执行结果/错误现场，默认 30） */
  keepTailLines?: number
}

/** 结构不变式特征正则（命中行绝对不剔除） */
const INVARIANT_PATTERNS = [
  /^(?:import|export|from|package|using)\s+/i,
  /^(?:class|interface|type|function|def|enum|struct)\s+/i,
  /(?:error|exception|fail|panic|fatal|traceback|syntaxerror):/i,
  /^\s*at\s+.+\(?.+:\d+:\d+\)?/i, // 调用栈帧
  /^[+*#-]\s+/, // Markdown 列表项与标题
  /^\s*[{}[\]();]\s*$/, // 语法闭合括号
  /[a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]{1,6}(?::\d+)?/, // 文件路径与行号
]

export function pruneToolOutputByEntropy(rawText: string, options: EntropyPruneOptions = {}): string {
  const {
    targetRatio = 0.5,
    minCharsToPrune = 2000,
    keepHeadLines = 20,
    keepTailLines = 30,
  } = options

  if (!rawText || rawText.length < minCharsToPrune) {
    return rawText
  }

  const lines = rawText.split(/\r?\n/)
  if (lines.length <= keepHeadLines + keepTailLines + 10) {
    return rawText
  }

  // 1. 划分受保护的头尾区域与中间可剪枝候选池
  const head = lines.slice(0, keepHeadLines)
  const tail = lines.slice(-keepTailLines)
  const middle = lines.slice(keepHeadLines, lines.length - keepTailLines)

  // 2. 模式指纹哈希与重复行折叠（去重 npm 进度条、冗余轮询、递归栈）
  const compressedMiddle: string[] = []
  let repeatCount = 0
  let lastPattern = ''

  for (let i = 0; i < middle.length; i++) {
    const line = middle[i]!
    const normalizedPattern = line.replace(/\d+/g, '#').trim()

    if (normalizedPattern.length > 5 && normalizedPattern === lastPattern) {
      repeatCount++
      continue
    }

    if (repeatCount > 0) {
      compressedMiddle.push(`  [... 省略 ${repeatCount} 行相似输出 ...]`)
      repeatCount = 0
    }

    lastPattern = normalizedPattern
    compressedMiddle.push(line)
  }
  if (repeatCount > 0) {
    compressedMiddle.push(`  [... 省略 ${repeatCount} 行相似输出 ...]`)
  }

  // 3. 计算行级信息熵并排序保留
  // 信息熵简易评估：字符丰富度 / 长度比，结构不变式行权重赋予极大值
  interface ScoredLine {
    index: number
    text: string
    isInvariant: boolean
    score: number
  }

  const scoredLines: ScoredLine[] = compressedMiddle.map((text, idx) => {
    const isInvariant = INVARIANT_PATTERNS.some((p) => p.test(text))
    if (isInvariant) {
      return { index: idx, text, isInvariant: true, score: 9999 }
    }

    // 统计字符集分布估算行自信息
    const charMap = new Map<string, number>()
    for (let c of text) charMap.set(c, (charMap.get(c) ?? 0) + 1)
    let entropy = 0
    for (const count of charMap.values()) {
      const p = count / text.length
      entropy -= p * Math.log2(p)
    }
    const score = entropy * Math.log10(Math.max(2, text.trim().length))
    return { index: idx, text, isInvariant: false, score }
  })

  // 按目标比例裁剪：保留所有不变式行 + Top 分数的非结构行
  const budget = Math.max(10, Math.floor(scoredLines.length * targetRatio))
  const invariants = scoredLines.filter((l) => l.isInvariant)
  const nonInvariants = scoredLines.filter((l) => !l.isInvariant).sort((a, b) => b.score - a.score)

  const selectedIndices = new Set<number>([
    ...invariants.map((l) => l.index),
    ...nonInvariants.slice(0, Math.max(0, budget - invariants.length)).map((l) => l.index),
  ])

  // 按原顺序重建文本
  const finalMiddle: string[] = []
  let skipping = false
  let skippedInBlock = 0

  for (let idx = 0; idx < scoredLines.length; idx++) {
    if (selectedIndices.has(idx)) {
      if (skipping) {
        finalMiddle.push(`[... 语义剪枝省略 ${skippedInBlock} 行低信息输出 ...]`)
        skipping = false
        skippedInBlock = 0
      }
      finalMiddle.push(scoredLines[idx]!.text)
    } else {
      skipping = true
      skippedInBlock++
    }
  }
  if (skipping) {
    finalMiddle.push(`[... 语义剪枝省略 ${skippedInBlock} 行低信息输出 ...]`)
  }

  return [...head, ...finalMiddle, ...tail].join('\n')
}
