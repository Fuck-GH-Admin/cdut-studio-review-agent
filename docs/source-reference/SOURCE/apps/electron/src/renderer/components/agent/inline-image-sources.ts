/**
 * 从文本中提取内联图片候选（通用图片渲染能力）
 *
 * 支持两类：
 *   - 内嵌 base64 data URL（会从展示文本中剥离，避免超大串污染界面）；
 *   - http(s) 图片地址（路径以图片扩展名结尾；是否渲染由主进程确认后决定）。
 *
 * 网络地址仅做"候选"提取，真正的"是否为图片"确认交给主进程的内容类型/魔数探测。
 */

import { dataUrlImage, imageKey, remoteImageSource, type AgentRenderableImage } from './agent-renderable-image'

/** 内嵌图片 data URL（受支持位图） */
const DATA_URL_RE = /data:image\/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+/gi

/** 以图片扩展名结尾的 http(s) 地址（忽略 query/hash） */
const IMAGE_URL_RE = /https?:\/\/[^\s"'<>()]+?\.(?:png|jpe?g|gif|webp)(?:\?[^\s"'<>()]*)?(?:#[^\s"'<>()]*)?/gi

/** 单条文本最多渲染的图片数量，避免异常内容造成界面拥挤 */
const MAX_INLINE_IMAGES = 12

/** 从 URL 推断用于展示的文件名 */
function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const base = pathname.split('/').filter(Boolean).pop()
    return base ? decodeURIComponent(base) : '网络图片'
  } catch {
    return '网络图片'
  }
}

/**
 * 解析文本中的图片候选。
 * @returns cleanText：剥离内嵌 data URL 后的可展示文本；images：识别到的图片候选
 */
export function parseInlineImageCandidates(text: string): { cleanText: string; images: AgentRenderableImage[] } {
  if (!text) return { cleanText: text, images: [] }

  const images: AgentRenderableImage[] = []
  const seen = new Set<string>()

  // 1) 内嵌 data URL：提取并从展示文本中剥离
  const withoutDataUrls = text.replace(DATA_URL_RE, (match) => {
    const image = dataUrlImage(match, '内嵌图片')
    if (image) {
      const key = imageKey(image)
      if (!seen.has(key)) {
        seen.add(key)
        images.push(image)
      }
    }
    return ''
  })

  // 2) 网络图片地址：保留原文，额外渲染（数量受限）
  IMAGE_URL_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = IMAGE_URL_RE.exec(text)) !== null) {
    if (images.length >= MAX_INLINE_IMAGES) break
    const url = match[0]
    const key = `remote:${url}`
    if (seen.has(key)) continue
    seen.add(key)
    images.push(remoteImageSource(url, filenameFromUrl(url)))
  }

  const cleanText = withoutDataUrls.replace(/[ \t]+\n/g, '\n').trim()
  return { cleanText, images }
}
