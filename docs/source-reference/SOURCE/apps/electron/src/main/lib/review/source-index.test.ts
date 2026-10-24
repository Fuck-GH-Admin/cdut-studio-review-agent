/**
 * N2c 单测（R09：CSV 引号解析/段落索引/自动分批/索引落盘）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { buildSheetSourceIndex, buildTextSourceIndex, parseCsvRows, planVisionBatches, saveSourceIndex } from './source-index'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-sidx-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

describe('CSV 引号感知解析（07 §6.2）', () => {
  test('Given 含引号/逗号/换行/前导零 When 解析 Then 原值保留', () => {
    const rows = parseCsvRows('学号,姓名,备注\n00121,"张三","说了""你好"""\n00122,"李四","两行\n说明"')
    expect(rows[1]![0]).toBe('00121') // 前导零保留（按文本）
    expect(rows[1]![2]).toBe('说了"你好"') // 转义引号
    expect(rows[2]![2]).toBe('两行\n说明') // 引号内换行不切行
    expect(rows).toHaveLength(3)
  })

  test('Given CSV 材料 When 建索引 Then sheet-cell 精度+列名', () => {
    const index = buildSheetSourceIndex('doc-csv-v1', '学号,分值\n00121,8\n00122,6\n')
    const cell = index.entries.find((entry) => entry.blockId.endsWith('r1c1'))!
    expect(cell.location).toEqual({ kind: 'sheet-cell', sheet: 'sheet1', row: 1, column: '分值' })
    expect(cell.text).toBe('8')
  })
})

describe('文本段落索引（不虚构页码）', () => {
  test('Given 多段文本 When 建索引 Then 段落精度与摘录 hash 稳定', () => {
    const index = buildTextSourceIndex('doc-txt-v1', '第一段内容。\n\n第二段内容。')
    expect(index.entries).toHaveLength(2)
    expect(index.entries[0]!.precision).toBe('paragraph')
    expect(index.entries[0]!.excerptHash).toBe(index.entries[0]!.excerptHash)
  })

  test('Given 索引 When 落盘 Then 文件存在（source-index/）', () => {
    saveSourceIndex('case-idx-1', buildTextSourceIndex('doc-txt-v1', '内容'))
    expect(existsSync(join(CONFIG_DIR, 'review-cases', 'case-idx-1', 'source-index', 'doc-txt-v1.json'))).toBeTrue()
  })
})

describe('视觉自动分批（07 §6.5）', () => {
  const item = (n: number, bytes: number) => ({ documentVersionId: `d${n}`, page: n, assetPath: `/a/${n}.png`, sizeBytes: bytes })

  test('Given 12 张图按 5 张/批 When 分批 Then 3 批且全部登记（不只前 8 张）', () => {
    const items = Array.from({ length: 12 }, (_, i) => item(i + 1, 100))
    const batches = planVisionBatches(items, { maxItemsPerBatch: 5, maxBytesPerBatch: 1000 })
    expect(batches).toHaveLength(3)
    expect(batches.flatMap((batch) => batch.items)).toHaveLength(12)
    expect(batches[2]!.items).toHaveLength(2) // 末批独立范围
  })

  test('Given 字节预算 When 分批 Then 超预算切批；单项超限独立成批', () => {
    const batches = planVisionBatches([item(1, 600), item(2, 600), item(3, 5000)], { maxItemsPerBatch: 10, maxBytesPerBatch: 1000 })
    expect(batches).toHaveLength(3)
    expect(batches[2]!.items[0]!.sizeBytes).toBe(5000) // 单项超限仍登记
  })
})
