/**
 * OCR 与原件预览端口（M2，设计 03 §8 结构化解析端口）
 *
 * 端口模式：M2 定义契约 + Null 实现（如实声明不可用），真实引擎（打包 OCR）在 M5 接入。
 * 端口失败必须显式（available=false + 原因），调用方把对应材料记为 unread/待处理，不冒充已读。
 */

/** OCR 端口：把图片页转成带位置的文本块 */
export interface OcrPort {
  readonly available: boolean
  readonly unavailableReason?: string
  recognize(assetPath: string): Promise<{ text: string; pages: Array<{ page: number; text: string }> }>
}

/** 空实现：M2 阶段如实声明无 OCR（材料进覆盖账本 unread，不冒充已读） */
export class NullOcrPort implements OcrPort {
  readonly available = false
  readonly unavailableReason = 'OCR 引擎未接入（M5 打包阶段提供）'
  async recognize(_assetPath: string): Promise<{ text: string; pages: Array<{ page: number; text: string }> }> {
    throw new Error(`OCR 不可用: ${this.unavailableReason}`)
  }
}

/** 原件预览描述符（A03：预览不等于解析；各自独立状态） */
export interface PreviewDescriptor {
  documentVersionId: string
  assetPath: string
  mime: string
  /** 图片可直接预览；PDF/Office 预览需页面渲染器（M5），如实标注 */
  preview: 'image' | 'needs-renderer'
  sizeBytes: number
}

export function describePreview(documentVersionId: string, assetPath: string, mime: string, sizeBytes: number): PreviewDescriptor {
  const isImage = mime.startsWith('image/')
  return {
    documentVersionId,
    assetPath,
    mime,
    preview: isImage ? 'image' : 'needs-renderer',
    sizeBytes,
  }
}
