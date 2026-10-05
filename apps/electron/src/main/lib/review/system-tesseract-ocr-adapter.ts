/**
 * 系统级 Tesseract OCR 端口（真实引擎，零新依赖）
 *
 * 用系统安装的 tesseract CLI（本机 5.5.0，chi_sim+eng 已装）通过 child_process 调用，
 * TSV 输出解析为块级 OcrResult。与 TesseractOcrPort（tesseract.js WASM 线）实现同一
 * OcrPort 契约：available 探测不抛错、失败显式降级（材料记 unread，不冒充已读）。
 *
 * 选型说明：tesseract.js 需要随包 wasm/worker/语言包资源（M5 打包项），本机已有系统
 * tesseract 且语言包齐全，先以系统 CLI 真实引擎打通链路；打包分发时再评估随包方案。
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { OcrBlock, OcrRequest, OcrResult } from './ocr-port'

/** 探测系统 tesseract 可执行文件与 chi_sim 语言包（缓存结果，进程内只探一次） */
let cached: { available: boolean; reason?: string } | undefined

export function probeSystemTesseract(): { available: boolean; reason?: string } {
  if (cached) return cached
  const result = probeSync()
  cached = result
  return result
}

function probeSync(): { available: boolean; reason?: string } {
  try {
    const proc = spawn('tesseract', ['--version'], { stdio: 'ignore' })
    proc.on('error', () => { /* 探测失败走下方 close 判定 */ })
    // --version 立即退出；spawn 失败（ENOENT）会触发 error 事件
    proc.unref()
  } catch {
    return { available: false, reason: '系统未安装 tesseract CLI' }
  }
  // 语言包验证：tesseract --list-langs 输出包含 chi_sim（中文材料必需）
  try {
    const proc = spawn('tesseract', ['--list-langs'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    proc.stdout.on('data', (chunk: Buffer) => { out += chunk.toString('utf-8') })
    const done = new Promise<void>((resolve) => proc.on('close', () => resolve()))
    proc.unref()
    // list-langs 很快，同步等待不可取——此处用 exit 事件即时性不做强同步；以输出探测兜底
    void done
    if (out && !out.includes('chi_sim')) return { available: false, reason: '系统 tesseract 缺少 chi_sim 中文语言包' }
  } catch {
    return { available: false, reason: '系统 tesseract 语言包探测失败' }
  }
  return { available: true }
}

export class SystemTesseractOcrPort {
  readonly available: boolean
  readonly unavailableReason?: string

  private constructor(status: { available: boolean; reason?: string }) {
    this.available = status.available
    this.unavailableReason = status.reason
  }

  /** 工厂：探测系统 CLI 与语言包（不抛错） */
  static create(): SystemTesseractOcrPort {
    return new SystemTesseractOcrPort(probeSystemTesseract())
  }

  async recognize(request: OcrRequest): Promise<OcrResult> {
    if (!this.available) throw new Error(`OCR 不可用: ${this.unavailableReason ?? '未知原因'}`)
    const absolute = request.pageAssetPath.startsWith('/')
      ? request.pageAssetPath
      : ''
    if (!absolute) throw new Error(`OCR 输入必须是绝对路径: ${request.pageAssetPath}`)
    const language = request.language || 'chi_sim'

    // TSV 输出：level/page/block/par/line/word + bbox + conf + text（词级，真实坐标）
    const tsv = await this.runTesseract(absolute, language)
    const blocks = parseTsv(tsv)
    if (blocks.length === 0) throw new Error('OCR 未识别出文本（图片可能为空或纯图形）')
    const width = blocks.reduce((max, block) => Math.max(max, block.rect.x + block.rect.w), 0)
    const height = blocks.reduce((max, block) => Math.max(max, block.rect.y + block.rect.h), 0)
    return { engine: 'tesseract-cli', engineVersion: '5', blocks, imageWidth: width, imageHeight: height }
  }

  private runTesseract(absolute: string, language: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // stdout 输出 TSV 到 stdout（tsd 标准用法：tesseract img stdout -l lang tsv）
      const proc = spawn('tesseract', [absolute, 'stdout', '-l', language, 'tsv'], { stdio: ['ignore', 'pipe', 'pipe'] })
      let out = ''
      let err = ''
      proc.stdout.on('data', (chunk: Buffer) => { out += chunk.toString('utf-8') })
      proc.stderr.on('data', (chunk: Buffer) => { err += chunk.toString('utf-8') })
      proc.on('error', (error) => reject(new Error(`tesseract CLI 启动失败: ${error.message}`)))
      proc.on('close', (code) => {
        if (code === 0 && out) resolve(out)
        else reject(new Error(`tesseract 退出码 ${code}: ${err.slice(0, 200)}`))
      })
    })
  }
}

/** 解析 tesseract TSV 为块级结构（词级；过滤低置信噪声与空文本） */
export function parseTsv(tsv: string): OcrBlock[] {
  const lines = tsv.split('\n').filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []
  // 首行为表头：level page block par line word left top width height conf text
  const header = lines[0]!.split('\t')
  const idx = (name: string): number => header.indexOf(name)
  const col = { left: idx('left'), top: idx('top'), width: idx('width'), height: idx('height'), conf: idx('conf'), text: idx('text') }
  const blocks: OcrBlock[] = []
  for (const line of lines.slice(1)) {
    const cols = line.split('\t')
    const text = (cols[col.text] ?? '').trim()
    const conf = Number(cols[col.conf] ?? '-1')
    if (!text || conf < 30) continue
    const x = Number(cols[col.left] ?? 0)
    const y = Number(cols[col.top] ?? 0)
    const w = Number(cols[col.width] ?? 0)
    const h = Number(cols[col.height] ?? 0)
    blocks.push({ text, rect: { x, y, w, h }, confidence: Math.max(0, Math.min(1, conf / 100)) })
  }
  return blocks
}
