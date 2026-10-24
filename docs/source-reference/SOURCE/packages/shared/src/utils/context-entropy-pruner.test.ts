import { describe, expect, test } from 'bun:test'
import { pruneToolOutputByEntropy } from './context-entropy-pruner'

const HEAD_LINES = 20
const TAIL_LINES = 30

function pad(text: string, length: number): string {
  return text + 'x'.repeat(Math.max(0, length - text.length))
}

function makeHead(prefix = 'header'): string[] {
  return Array.from({ length: HEAD_LINES }, (_, i) => `${prefix} line ${i}`)
}

function makeTail(prefix = 'footer'): string[] {
  return Array.from({ length: TAIL_LINES }, (_, i) => `${prefix} line ${i}`)
}

function letters(n: number): string {
  let s = ''
  let x = n
  do {
    s = String.fromCharCode(97 + (x % 26)) + s
    x = Math.floor(x / 26)
  } while (x > 0)
  return s
}

describe('语义熵上下文剪枝引擎', () => {
  test('短文本（<2000 字符）原样返回', () => {
    const shortText = 'const answer = 42\n'.repeat(10)
    expect(shortText.length).toBeLessThan(2000)
    expect(pruneToolOutputByEntropy(shortText)).toBe(shortText)
    expect(pruneToolOutputByEntropy('')).toBe('')
  })

  test('字符数达标但行数过少时原样返回', () => {
    const fewLines = Array.from({ length: 40 }, (_, i) => pad(`line-${i}-`, 120)).join('\n')
    expect(fewLines.length).toBeGreaterThan(2000)
    expect(pruneToolOutputByEntropy(fewLines)).toBe(fewLines)
  })

  test('结构性不变式行在压缩后仍存在', () => {
    const invariants = [
      "import { createHash } from 'node:crypto'",
      'export function computeEntropy(): number {',
      'class ContextPruner {',
      'Error: semantic pruning pipeline crashed',
      '    at prune (/repo/src/pruner.ts:128:9)',
      'src/utils/context-entropy-pruner.ts:42',
    ]

    const middle: string[] = []
    for (let i = 0; i < 400; i++) {
      middle.push(`payload ${letters(i)} body ${letters(i * 3 + 1)}`)
      if (i % 60 === 0 && i / 60 < invariants.length) {
        middle.push(invariants[i / 60]!)
      }
    }

    const raw = [...makeHead(), ...middle, ...makeTail()].join('\n')
    const pruned = pruneToolOutputByEntropy(raw, { targetRatio: 0.25 })

    expect(pruned.length).toBeLessThan(raw.length)
    for (const invariant of invariants) {
      expect(pruned).toContain(invariant)
    }
  })

  test('连续重复行被折叠为「省略 N 行」', () => {
    const repeated = 'progress: step 42 completed successfully with no errors'
    const middle = Array.from({ length: 40 }, () => repeated)
    const raw = [...makeHead(), ...middle, ...makeTail()].join('\n')

    expect(raw.length).toBeGreaterThan(2000)
    const pruned = pruneToolOutputByEntropy(raw)

    expect(pruned).toContain('省略')
    expect(pruned).toMatch(/行相似输出/)
    expect(pruned.split('\n').filter((l) => l === repeated).length).toBeLessThan(40)
  })

  test('大文本输出长度明显小于输入', () => {
    const middle = Array.from(
      { length: 500 },
      (_, i) => `${letters(i)} ${letters(i + 7)} ${letters(i * 2 + 3)} ${letters(i + 11)}`,
    )
    const raw = [...makeHead(), ...middle, ...makeTail()].join('\n')

    const pruned = pruneToolOutputByEntropy(raw, { targetRatio: 0.2 })

    expect(pruned.length).toBeLessThan(raw.length * 0.6)
  })
})
