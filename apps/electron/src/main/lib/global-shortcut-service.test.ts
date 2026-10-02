/**
 * 全局快捷键服务测试（重点覆盖 2026-08-08 快速任务开关化改造）
 *
 * 快速任务已移除；保留全局快捷键通用机制回归。
 * show-main-window 始终注册（voice-dictation 已随语音功能移除）。
 */

import { beforeAll, beforeEach, describe, expect, mock, test } from 'bun:test'

// preload 统一 electron mock 的测试钩子（类型声明与 test/preload-electron-mock.ts 保持一致）
declare global {
  var __proferElectronTestHooks: {
    createdWindows: Array<{ destroyed: boolean; visible: boolean; opts: Record<string, unknown> }>
    registeredAccelerators: string[]
    exposedApi: Record<string, unknown>
    ipcRendererInvoke: ((channel: string, ...args: unknown[]) => Promise<unknown>) | null
    reset: () => void
  }
}

/** 已注册 accelerator 记录来自 preload 统一 electron mock 的测试钩子 */
let registeredAccelerators: string[] = []
/** 当前模拟设置（测试内可变） */
let mockSettings: Record<string, unknown> = {}

beforeAll(() => {
  registeredAccelerators = globalThis.__proferElectronTestHooks.registeredAccelerators

  mock.module('./settings-service', () => ({
    getSettings: () => mockSettings,
  }))
})

beforeEach(() => {
  globalThis.__proferElectronTestHooks.reset()
  mockSettings = {}
})

describe('show-main-window 始终注册（不受开关影响）', () => {
  test('无任何开关设置时也注册', async () => {
    const { registerGlobalShortcut } = await import('./global-shortcut-service')
    const ok = registerGlobalShortcut('show-main-window', () => {})
    expect(ok).toBe(true)
  })
})


