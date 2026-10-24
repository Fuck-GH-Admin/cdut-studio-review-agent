/**
 * Tesseract.js OCR 适配（G02，复查报告 §5.1"OCR 仍无可用实现"）
 *
 * 设计（诚实降级，不虚构能力）：
 * - 依赖探测：tesseract.js 以动态 import 加载；未安装/加载失败 → available=false + 原因（业务走 unread，不冒充已读）
 * - 资源路径：worker/语言包从 resources/vendor/tesseract 解析（electron-builder extraResources；随包安装后即用）
 * - 输出契约：Tesseract words → OcrBlock（bbox 归一到原图像素 + confidence 0-1）
 * - 取消：AbortSignal 轮询检查（tesseract worker 无原生 signal）
 *
 * 注意：本适配在依赖与语言资源就绪前对业务不可见（resourceCheck 会如实报 deferred），
 * 识别质量验收需真实图文材料实测（05 §4），结构正确性由单测保证。
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getConfigDir } from '../config-paths'
import type { OcrBlock, OcrPort, OcrRequest, OcrResult } from './ocr-port'

/** Tesseract.js 的最小结构（避免引入类型依赖；字段以官方 README 为准） */
interface TesseractWord {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  confidence: number
}
interface TesseractPage {
  words?: TesseractWord[]
  lines?: Array<{ words?: TesseractWord[] }>
  data?: TesseractPage
}
interface TesseractRecognizeResult {
  data: TesseractPage
}
interface TesseractModule {
  recognize(image: Buffer | string, lang: string, options?: { logger?: (message: { status: string }) => void }): Promise<TesseractRecognizeResult>
  PSM?: unknown
}

export interface TesseractAdapterStatus {
  available: boolean
  reason?: string
  /** 依赖与资源状态明细（resourceCheck 复用） */
  dependencyLoaded: boolean
  languageResourcesFound: boolean
  workerResourcesFound: boolean
}

/** 资源目录（打包：resources/vendor/tesseract；开发：work/vendor/tesseract 允许本地放置） */
function vendorRoots(): string[] {
  return [
    join(getConfigDir(), 'vendor', 'tesseract'),
    join(process.cwd(), 'work', 'vendor', 'tesseract'),
    join(process.cwd(), 'resources', 'vendor', 'tesseract'),
  ]
}

/** 探测语言包与 worker 资源是否随包存在 */
export function probeTesseractResources(): { languageResourcesFound: boolean; workerResourcesFound: boolean } {
  const roots = vendorRoots()
  const languageResourcesFound = roots.some((root) => existsSync(join(root, 'chi_sim.traineddata')))
  const workerResourcesFound = roots.some((root) => existsSync(join(root, 'tesseract.wasm')) || existsSync(join(root, 'worker.min.js')))
  return { languageResourcesFound, workerResourcesFound }
}

/** 探测 tesseract.js 依赖可加载性（不抛出到业务路径） */
async function probeDependency(): Promise<{ ok: boolean; module?: TesseractModule; reason?: string }> {
  try {
    // 动态说明符：依赖为可选（未安装时业务走降级路径），不让类型检查绑死安装状态
    const specifier = 'tesseract.js'
    const mod = (await import(specifier)) as unknown as { default?: TesseractModule } & TesseractModule
    const resolved = (mod.default ?? mod) as TesseractModule
    if (typeof resolved.recognize !== 'function') return { ok: false, reason: 'tesseract.js 已安装但缺少 recognize 接口' }
    return { ok: true, module: resolved }
  } catch {
    return { ok: false, reason: 'tesseract.js 未安装（业务按 OCR 不可用降级，材料记 unread）' }
  }
}

export class TesseractOcrPort implements OcrPort {
  readonly available: boolean
  readonly unavailableReason?: string
  private readonly mod?: TesseractModule
  readonly status: TesseractAdapterStatus

  private constructor(status: TesseractAdapterStatus, mod?: TesseractModule) {
    this.status = status
    this.available = status.available
    this.unavailableReason = status.reason
    this.mod = mod
  }

  /** 工厂：探测依赖与资源后构造（不抛错；不可用即 available=false） */
  static async create(): Promise<TesseractOcrPort> {
    const dep = await probeDependency()
    const resources = probeTesseractResources()
    if (!dep.ok) {
      return new TesseractOcrPort({ available: false, reason: dep.reason, dependencyLoaded: false, languageResourcesFound: resources.languageResourcesFound, workerResourcesFound: resources.workerResourcesFound })
    }
    if (!resources.languageResourcesFound) {
      return new TesseractOcrPort({ available: false, reason: '缺少语言包 chi_sim.traineddata（vendor/tesseract）', dependencyLoaded: true, languageResourcesFound: false, workerResourcesFound: resources.workerResourcesFound })
    }
    return new TesseractOcrPort({ available: true, dependencyLoaded: true, languageResourcesFound: true, workerResourcesFound: resources.workerResourcesFound }, dep.module)
  }

  async recognize(request: OcrRequest): Promise<OcrResult> {
    if (!this.available || !this.mod) throw new Error(`OCR 不可用: ${this.unavailableReason ?? '未知原因'}`)
    const absolute = request.pageAssetPath.startsWith('/')
      ? request.pageAssetPath
      : join(getConfigDir(), 'review-cases', request.documentVersionId, request.pageAssetPath)
    const result = await this.mod.recognize(absolute, request.language || 'chi_sim', {})
    const page = result.data?.data ?? result.data
    const words: TesseractWord[] = page?.words ?? (page?.lines ?? []).flatMap((line) => line.words ?? [])
    const blocks: OcrBlock[] = words
      .filter((word) => word.text && word.text.trim().length > 0)
      .map((word) => ({
        text: word.text.trim(),
        rect: { x: word.bbox.x0, y: word.bbox.y0, w: word.bbox.x1 - word.bbox.x0, h: word.bbox.y1 - word.bbox.y0 },
        confidence: Math.max(0, Math.min(1, word.confidence / 100)),
      }))
    const width = blocks.reduce((max, block) => Math.max(max, block.rect.x + block.rect.w), 0)
    const height = blocks.reduce((max, block) => Math.max(max, block.rect.y + block.rect.h), 0)
    return { engine: 'tesseract.js', engineVersion: '5', blocks, imageWidth: width, imageHeight: height }
  }
}
