import { describe, expect, test } from 'bun:test'
import { parseTsv } from './system-tesseract-ocr-adapter'

describe('system-tesseract-ocr-adapter', () => {
  test('TSV 解析：词级行→OcrBlock，低置信与空文本过滤', () => {
    const tsv = [
      'level\tpage\tblock\tpar\tline\tword\tleft\ttop\twidth\theight\tconf\ttext',
      '5\t1\t1\t1\t1\t1\t10\t20\t30\t40\t95.5\t证书',
      '5\t1\t1\t1\t1\t2\t50\t20\t30\t40\t88.0\t张旅程',
      '5\t1\t1\t1\t1\t3\t90\t20\t30\t40\t12.0\t噪声',
      '5\t1\t1\t1\t1\t4\t130\t20\t30\t40\t-1\t',
    ].join('\n')
    const blocks = parseTsv(tsv)
    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.text).toBe('证书')
    expect(blocks[0]!.confidence).toBeCloseTo(0.955)
    expect(blocks[0]!.rect).toEqual({ x: 10, y: 20, w: 30, h: 40 })
    expect(blocks[1]!.text).toBe('张旅程')
  })

  test('空输入返回空数组', () => {
    expect(parseTsv('')).toHaveLength(0)
    expect(parseTsv('level\tpage\tblock\tpar\tline\tword\tleft\ttop\twidth\theight\tconf\ttext\n')).toHaveLength(0)
  })
})
