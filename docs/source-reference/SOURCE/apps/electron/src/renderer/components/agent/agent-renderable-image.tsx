/**
 * 通用图片渲染组件
 *
 * 统一渲染三种来源的图片：
 *   - local  ：会话内的本地图片文件（经 IPC readAttachment 读取为 base64）
 *   - dataUrl：内嵌的 base64 data URL（如 CDUT 登录时缓存的证件照）
 *   - remote ：网络图片地址（经主进程确认是图片后返回 data URL，渲染层不直连外网）
 *
 * 仅渲染受支持的位图（PNG/JPEG/GIF/WebP）；无法确认来源的远程地址自动不渲染。
 */

import * as React from 'react'
import { Download } from 'lucide-react'
import { ImageLightbox } from '@profer/ui/primitives/image-lightbox'
import type { AgentImageAttachmentMediaType, ParsedAgentImageAttachment } from './image-attachment-marker'

export type AgentRenderableImage =
  | { kind: 'local'; localPath: string; filename: string; mediaType: AgentImageAttachmentMediaType }
  | { kind: 'dataUrl'; dataUrl: string; filename: string }
  | { kind: 'remote'; url: string; filename: string }

/** 受支持位图的 data URL 前缀（拒绝 SVG 等类型） */
const DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,/i

/** 结构化附件 → 可渲染图片 */
export function toRenderableFromAttachment(attachment: ParsedAgentImageAttachment): AgentRenderableImage {
  return {
    kind: 'local',
    localPath: attachment.localPath,
    filename: attachment.filename,
    mediaType: attachment.mediaType,
  }
}

/** 校验内嵌图片 data URL（仅接受受支持位图），返回可渲染模型或 null */
export function dataUrlImage(dataUrl: string, filename: string): AgentRenderableImage | null {
  if (typeof dataUrl !== 'string' || !DATA_URL_RE.test(dataUrl)) return null
  return { kind: 'dataUrl', dataUrl, filename }
}

/** 网络图片候选（是否最终渲染由主进程确认结果决定） */
export function remoteImageSource(url: string, filename: string): AgentRenderableImage {
  return { kind: 'remote', url, filename }
}

/** 稳定的图片去重键 */
export function imageKey(image: AgentRenderableImage): string {
  switch (image.kind) {
    case 'local':
      return `local:${image.localPath}`
    case 'dataUrl':
      return `data:${image.filename}:${image.dataUrl.length}:${image.dataUrl.slice(0, 64)}`
    case 'remote':
      return `remote:${image.url}`
  }
}

/** 按去重键合并多组图片 */
export function dedupeImages(groups: AgentRenderableImage[][]): AgentRenderableImage[] {
  const seen = new Set<string>()
  const result: AgentRenderableImage[] = []
  for (const group of groups) {
    for (const image of group) {
      const key = imageKey(image)
      if (seen.has(key)) continue
      seen.add(key)
      result.push(image)
    }
  }
  return result
}

interface AgentImageThumbProps {
  image: AgentRenderableImage
  /** 缩略图最大宽度类名 */
  maxWidthClass?: string
  /** 缩略图最大高度类名 */
  maxHeightClass?: string
}

/** 通用图片缩略图：点击可预览大图；本地图片支持另存 */
export function AgentImageThumb({
  image,
  maxWidthClass = 'max-w-[400px]',
  maxHeightClass = 'max-h-[350px]',
}: AgentImageThumbProps): React.ReactElement | null {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  React.useEffect(() => {
    let active = true
    setImageSrc(null)
    setFailed(false)

    const resolveSource = async (): Promise<string | null> => {
      if (image.kind === 'local') {
        const base64 = await window.electronAPI.readAttachment(image.localPath)
        return `data:${image.mediaType};base64,${base64}`
      }
      if (image.kind === 'dataUrl') return image.dataUrl
      const confirmed = await window.electronAPI.resolveImageUrl(image.url)
      return confirmed?.ok && confirmed.dataUrl ? confirmed.dataUrl : null
    }

    void resolveSource()
      .then((src) => {
        if (!active) return
        if (src) setImageSrc(src)
        else setFailed(true)
      })
      .catch((err) => {
        if (!active) return
        console.error('[AgentImage] 解析图片失败:', err)
        setFailed(true)
      })

    return () => {
      active = false
    }
  }, [image])

  const handleSave = React.useCallback((): void => {
    if (image.kind === 'local') window.electronAPI.saveImageAs(image.localPath, image.filename)
  }, [image])

  // 无法确认来源的远程图片：静默不显示
  if (failed) return null

  if (!imageSrc) {
    return <div className="w-full max-w-[240px] h-[160px] rounded-lg bg-muted/30 animate-pulse shrink-0" />
  }

  return (
    <div className="relative group inline-block">
      <img
        src={imageSrc}
        alt={image.filename}
        className={`${maxWidthClass} ${maxHeightClass} rounded-lg object-contain cursor-pointer border border-border/50`}
        onClick={() => setLightboxOpen(true)}
      />
      {image.kind === 'local' && (
        <button
          type="button"
          onClick={handleSave}
          className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          title="保存图片"
        >
          <Download className="size-4" />
        </button>
      )}
      <ImageLightbox
        src={imageSrc}
        alt={image.filename}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onSave={image.kind === 'local' ? handleSave : undefined}
      />
    </div>
  )
}
