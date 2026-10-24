/**
 * speculative-tool-engine.test.ts — 推测式只读工具预热引擎单测
 *
 * 覆盖（对应规格书 2.2）：
 *   - feedThinkingChunk 预测出只读文件后，consumePrewarmed 能命中预读内容；
 *   - 一次性消费语义：命中后再次消费返回 null；
 *   - TTL 过期（20s）后返回 null。
 */

import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { SpeculativeToolEngine } from './speculative-tool-engine'
import { setSystemTime } from 'bun:test'

/** 测试专用：以类型断言窥探引擎内部缓存，仅用于断言，不改变被测行为 */
interface EngineInternals {
  prewarmCache: Map<string, { timestamp: number }>
}

const roots: string[] = []

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'profer-speculative-'))
  roots.push(root)
  return root
}

/** 轮询等待条件成立（预读为后台异步 fire-and-forget） */
async function waitFor(condition: () => boolean, timeoutMs = 2000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (condition()) return true
    await Bun.sleep(10)
  }
  return condition()
}

afterEach(() => {
  setSystemTime()
  while (roots.length > 0) rmSync(roots.pop()!, { recursive: true, force: true })
})

describe('SpeculativeToolEngine 预热命中', () => {
  test('Given 思考流内预测只读文件 When 预读完成 Then consumePrewarmed 命中内容', async () => {
    const root = makeRoot()
    const fileName = 'sample.txt'
    const content = '推测式预读命中内容'
    writeFileSync(join(root, fileName), content, 'utf-8')
    const absPath = resolve(root, fileName)

    const engine = SpeculativeToolEngine.getInstance()
    engine.feedThinkingChunk('s1', root, `Let me read ${fileName} first.`)

    const internals = engine as unknown as EngineInternals
    const cached = await waitFor(() => internals.prewarmCache.has(absPath))
    expect(cached).toBe(true)

    expect(engine.consumePrewarmed(absPath)).toBe(content)
    // 一次性消费：第二次返回 null
    expect(engine.consumePrewarmed(absPath)).toBeNull()
  })

  test('Given 未预热路径 When 消费 Then 返回 null', () => {
    const engine = SpeculativeToolEngine.getInstance()
    expect(engine.consumePrewarmed(resolve(makeRoot(), 'never-warmed.ts'))).toBeNull()
  })
})

describe('SpeculativeToolEngine TTL 过期', () => {
  test('Given 预读项超过 20s 未消费 When 消费 Then 返回 null', async () => {
    const root = makeRoot()
    const fileName = 'stale.ts'
    writeFileSync(join(root, fileName), 'export const a = 1', 'utf-8')
    const absPath = resolve(root, fileName)

    const base = Date.now()
    setSystemTime(base)

    const engine = SpeculativeToolEngine.getInstance()
    engine.feedThinkingChunk('s2', root, `I need to inspect ${fileName}`)

    const internals = engine as unknown as EngineInternals
    const cached = await waitFor(() => internals.prewarmCache.has(absPath))
    expect(cached).toBe(true)

    // 推进系统时间超过 TTL（20s）
    setSystemTime(base + 25_000)
    expect(engine.consumePrewarmed(absPath)).toBeNull()
    expect(internals.prewarmCache.has(absPath)).toBe(false)
  })
})
