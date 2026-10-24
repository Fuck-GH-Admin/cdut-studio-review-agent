import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { searchMemoryArchiveRouted } from './memory-search-router'

let root = ''
let archiveDir = ''

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'cdut-hipporag-router-test-'))
  archiveDir = join(root, 'memory-archive')
  mkdirSync(archiveDir, { recursive: true })
  writeFileSync(join(archiveDir, 'skin.md'), '皮肤引擎相关经验：主题切换与皮肤包加载流程。')
  writeFileSync(join(archiveDir, 'weather.md'), '天气观测记录：多云转晴，气压稳定。')
})

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true })
  root = ''
  archiveDir = ''
})

describe('searchMemoryArchiveRouted（HippoRAG 路由）', () => {
  test('engineType=hipporag 时返回与 query 相关的命中且不抛错', async () => {
    const hits = await searchMemoryArchiveRouted(archiveDir, '皮肤引擎', 'hipporag', 5)

    expect(Array.isArray(hits)).toBe(true)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]!.relativePath).toBe('skin.md')
  })

  test('query 无任何种子命中时返回空数组而非抛错', async () => {
    const hits = await searchMemoryArchiveRouted(archiveDir, 'zzz-unknown-token-xyz', 'hipporag', 5)

    expect(hits).toEqual([])
  })
})
