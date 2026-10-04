/**
 * 内联图片候选解析测试
 */

import { describe, expect, it } from 'bun:test'
import { parseInlineImageCandidates } from './inline-image-sources'

describe('parseInlineImageCandidates', () => {
  it('提取内嵌 data URL 并从展示文本中剥离', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    const { cleanText, images } = parseInlineImageCandidates(`结果如下：${dataUrl} 完毕`)
    expect(images).toHaveLength(1)
    expect(images[0]?.kind).toBe('dataUrl')
    expect(cleanText.includes('base64')).toBe(false)
    expect(cleanText.includes('结果如下')).toBe(true)
  })

  it('识别带 query 的图片 URL（保留原文）', () => {
    const { cleanText, images } = parseInlineImageCandidates('见 https://a.com/x.png?size=2 谢谢')
    expect(images).toHaveLength(1)
    expect(images[0]).toMatchObject({ kind: 'remote', url: 'https://a.com/x.png?size=2' })
    expect(cleanText.includes('https://a.com/x.png?size=2')).toBe(true)
  })

  it('非图片扩展名的 URL 不作为候选', () => {
    const { images } = parseInlineImageCandidates('见 https://a.com/report.pdf')
    expect(images).toHaveLength(0)
  })

  it('相同图片去重', () => {
    const url = 'https://a.com/same.jpg'
    const { images } = parseInlineImageCandidates(`${url} 与 ${url}`)
    expect(images).toHaveLength(1)
  })
})
