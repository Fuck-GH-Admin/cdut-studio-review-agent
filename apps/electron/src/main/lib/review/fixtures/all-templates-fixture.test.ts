/**
 * N4 单测（R02：六模板依赖完整可发布；幂等 seed；发布后全部 published）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { buildAllTemplateFixtures, publishAllTemplateFixtures, seedAllTemplateFixtures } from './all-templates-fixture'
import { getPolicy, publishPolicy } from '../policy-store'
import { getTemplate, publishTemplate, saveDraft, validateTemplate } from '../template-store'

const CONFIG_DIR = join(import.meta.dir, '../../../../../..', 'work/tmp', `profer-test-n4-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const store = { getTemplate, saveDraft, publish: publishTemplate }

describe('六模板完整政策（N4/R02）', () => {
  test('Given 六套虚构政策+精确引用 When 发布后校验 Then 全部 error 清零', () => {
    const fixtures = buildAllTemplateFixtures()
    expect(fixtures).toHaveLength(6)
    seedAllTemplateFixtures(store)
    for (const { policy } of fixtures) publishPolicy(policy.policyId, 1)
    for (const { template } of fixtures) {
      const errors = validateTemplate(template).filter((issue) => issue.level === 'error')
      expect(errors).toEqual([])
    }
  })

  test('Given seed+publish When 检查 Then 六政策与六模板全部 published', () => {
    publishAllTemplateFixtures(store)
    for (const { policy, template } of buildAllTemplateFixtures()) {
      expect(getPolicy(policy.policyId, 1)?.status).toBe('published')
      expect(getTemplate(template.templateId, template.version)?.status).toBe('published')
    }
  })

  test('Given 重复 seed When 再执行 Then 幂等不覆盖', () => {
    seedAllTemplateFixtures(store)
    seedAllTemplateFixtures(store)
    expect(getTemplate('expense-check-v2', 1)?.policyRefs).toHaveLength(1)
  })

  test('Given 政策内容 When 校验 Then 含虚构声明（不冒充真实校规）', () => {
    const { policy } = buildAllTemplateFixtures()[0]!
    expect(policy.content).toContain('虚构演示')
    expect(policy.origin.kind).toBe('owner-statement')
  })
})
