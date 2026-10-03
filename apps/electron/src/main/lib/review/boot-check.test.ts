/**
 * 启动引导检查单测（M5：幂等注入/发布统计/可迁移清单）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { runBootCheckV2 } from './boot-check'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import { getTemplate as getTemplateStored, saveDraft as saveDraftStored } from './template-store'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-boot-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

describe('runBootCheckV2（M5）', () => {
  test('Given 首次启动 When 检查 Then 注入 6 模板并提示发布', () => {
    const result = runBootCheckV2()
    expect(result.templatesSeeded).toBe(6)
    expect(result.templatesPublished).toBe(0)
    expect(result.notes.some((note) => note.includes('尚无已发布模板'))).toBeTrue()
  })

  test('Given 二次启动 When 检查 Then 幂等（不再注入）', () => {
    const result = runBootCheckV2()
    expect(result.templatesSeeded).toBe(0)
  })

  test('Given V1 案卷无 v2 文件 When 检查 Then 列入可迁移', () => {
    const caseDir = join(CONFIG_DIR, 'review-cases', 'case-mig-1')
    mkdirSync(caseDir, { recursive: true })
    writeFileSync(join(caseDir, 'case.json'), JSON.stringify({ id: 'case-mig-1', title: 'x' }), 'utf-8')
    const result = runBootCheckV2()
    expect(result.migratableCases).toContain('case-mig-1')
    expect(result.notes.some((note) => note.includes('可迁移'))).toBeTrue()
  })

  test('Given 内置草稿已存在 When ensureBuiltinTemplateDrafts Then 不覆盖', () => {
    ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
    const t = getTemplateStored('comprehensive-assessment-v2', 1)!
    const mutated = { ...t, name: '用户改过的名字' }
    saveDraftStored(mutated)
    ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
    expect(getTemplateStored('comprehensive-assessment-v2', 1)!.name).toBe('用户改过的名字')
  })
})
