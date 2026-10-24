/**
 * 默认工具结果渲染器 — Key-Value 表格 / 纯文本 / 通用图片
 *
 * 用于未匹配到专属渲染器的工具（包括 MCP 工具）。
 * 图片来源：结构化附件 + 历史 marker + 文本内嵌图片（data URL / 图片地址）。
 */

import * as React from 'react'
import { CollapsibleResult } from './collapsible-result'
import { parseAgentImageAttachmentMarkers, type ParsedAgentImageAttachment } from '../image-attachment-marker'
import {
  AgentImageThumb,
  dedupeImages,
  toRenderableFromAttachment,
  type AgentRenderableImage,
} from '../agent-renderable-image'
import { parseInlineImageCandidates } from '../inline-image-sources'

interface DefaultResultRendererProps {
  result: string
  isError: boolean
  imageAttachments?: ParsedAgentImageAttachment[]
}

/** 尝试将结果解析为 key-value 对 */
function tryParseKeyValue(text: string): Array<{ key: string; value: string }> | null {
  // 尝试 JSON 解析
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      }))
    }
  } catch {
    // 非 JSON
  }
  return null
}

export function DefaultResultRenderer({ result, isError, imageAttachments = [] }: DefaultResultRendererProps): React.ReactElement {
  if (isError) {
    return (
      <pre className="rounded-md p-3 text-[12px] font-mono text-destructive/80 bg-destructive/5 whitespace-pre-wrap break-all overflow-x-auto">
        {result}
      </pre>
    )
  }

  // 解析受控图片附件标记；仅加载 PNG/JPEG/GIF/WebP。
  const { images: legacyImages, cleanText } = React.useMemo(() => parseAgentImageAttachmentMarkers(result), [result])

  // 从剩余文本中提取内嵌图片（data URL / 图片地址）
  const { cleanText: textAfterInline, images: inlineImages } = React.useMemo(
    () => parseInlineImageCandidates(cleanText),
    [cleanText],
  )

  const images = React.useMemo<AgentRenderableImage[]>(
    () => dedupeImages([
      imageAttachments.map(toRenderableFromAttachment),
      legacyImages.map(toRenderableFromAttachment),
      inlineImages,
    ]),
    [imageAttachments, legacyImages, inlineImages],
  )

  // 纯文本 fallback
  if (images.length === 0) {
    const keyValues = tryParseKeyValue(textAfterInline)

    if (keyValues && keyValues.length > 0) {
      return (
        <div className="rounded-md bg-muted/20 overflow-hidden">
          <table className="w-full text-[12px]">
            <tbody>
              {keyValues.map(({ key, value }, i) => (
                <tr key={i} className="border-b border-border/20 last:border-b-0">
                  <td className="px-3 py-1.5 text-muted-foreground/60 font-mono whitespace-nowrap align-top">
                    {key}
                  </td>
                  <td className="px-3 py-1.5 text-foreground/70 font-mono whitespace-pre-wrap break-all">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <CollapsibleResult
        content={textAfterInline}
        // 这个 <pre> 自带 max-h + 纵向滚动，限高交给容器；
        // 再按行折叠会与内部滚动重复，故仅按字符数折叠。
        foldByLines={false}
        renderContent={(text) => (
          <pre className="rounded-md p-3 text-[12px] font-mono text-foreground/60 bg-muted/30 whitespace-pre-wrap break-all overflow-x-auto max-h-[400px] overflow-y-auto">
            {text}
          </pre>
        )}
      />
    )
  }

  // 有图片时：先渲染图片缩略图，再渲染剩余文本
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <AgentImageThumb key={`${img.kind}:${i}`} image={img} maxWidthClass="max-w-[300px]" maxHeightClass="max-h-[250px]" />
        ))}
      </div>
      {textAfterInline && (
        <CollapsibleResult
          content={textAfterInline}
          // 同上：内部滚动负责限高，不叠加按行折叠
          foldByLines={false}
          renderContent={(text) => (
            <pre className="rounded-md p-3 text-[12px] font-mono text-foreground/60 bg-muted/30 whitespace-pre-wrap break-all overflow-x-auto max-h-[400px] overflow-y-auto">
              {text}
            </pre>
          )}
        />
      )}
    </div>
  )
}
