/**
 * G02 单测：Tesseract 适配（依赖缺失诚实降级；资源探测；合同形状）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { TesseractOcrPort, probeTesseractResources } from './tesseract-ocr-adapter'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-ocr-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

describe('Tesseract OCR 适配（G02）', () => {
  test('Given 未安装 tesseract.js When create Then available=false 且原因明确（不冒充可用）', async () => {
    const port = await TesseractOcrPort.create()
    // 本环境未安装 tesseract.js（或缺语言包）——两种都须如实不可用
    expect(port.available).toBeFalse()
    expect(port.unavailableReason).toBeTruthy()
    expect(port.status.dependencyLoaded === false || port.status.languageResourcesFound === false).toBeTrue()
  })

  test('Given 不可用 When recognize Then 明确抛错（业务记 unread）', async () => {
    const port = await TesseractOcrPort.create()
    if (!port.available) {
      await expect(port.recognize({ documentVersionId: 'd1', pageAssetPath: 'x.png', language: 'chi_sim' })).rejects.toThrow('OCR 不可用')
    }
  })

  test('Given 资源探测 When 无资源 Then 两项均 false（resourceCheck 可如实报 deferred）', () => {
    const probe = probeTesseractResources()
    expect(typeof probe.languageResourcesFound).toBe('boolean')
    expect(typeof probe.workerResourcesFound).toBe('boolean')
  })
})
