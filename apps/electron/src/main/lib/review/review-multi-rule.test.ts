/**
 * M0/H02 多依据消费 + M0/H03 演示降级限定（对应 K02/K03 回归）
 *
 * 隔离策略：PROFER_CONFIG_DIR 指向唯一临时目录（无渠道配置 → 走无出口分支）。
 */

import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCase } from '@profer/shared'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { renderRuleDocuments } from './ai-review-service'
import { extractItems, generateRuleOutline, runAiReview } from './ai-review-service'
import { getCase, saveCase } from './case-store'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-multi-rule-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR

afterAll(() => {
  rmSync(CONFIG_DIR, { recursive: true, force: true })
})

/** 构造双依据案卷：两份规则文档、两个规则包（各带大纲） */
function buildTwoRuleCase(id: string): ReviewCase {
  const base = buildDemoCase()
  const firstDoc = base.documents.find((doc) => doc.role === 'rule')!
  const secondDoc = {
    ...firstDoc,
    id: `${id}-doc-rule-2`,
    fileName: '学院补充细则.md',
    blocks: firstDoc.blocks.map((block, index) => ({
      ...block,
      id: `${id}-blk-rule2-${String(index + 1).padStart(3, '0')}`,
      text: index === 0 ? '第二条 学院专项加分上限为 3 分（仅学院细则规定）。' : block.text,
    })),
  }
  return {
    ...base,
    id,
    isDemo: false,
    documents: [...base.documents, secondDoc],
    rulePacks: [
      { ...base.rulePacks[0]!, id: `${id}-pack-1`, documentId: firstDoc.id, name: '校级办法', outline: [{ ...base.rulePacks[0]!.outline[0]!, id: `${id}-rule-1` }] },
      {
        id: `${id}-pack-2`,
        documentId: secondDoc.id,
        name: '学院细则',
        publisher: '学院',
        academicYear: base.academicYear,
        version: 'v1',
        outline: [{ id: `${id}-rule-2`, title: '学院专项上限', category: '其他', summary: '', anchors: [], generatedBy: 'fixture' }],
        confirmed: false,
      },
    ],
  }
}

describe('renderRuleDocuments（M0/H02 多依据消费）', () => {
  test('Given 两份依据 When 渲染 Then 两份全文与两包大纲都在列（不再首包代表全部）', () => {
    const reviewCase = buildTwoRuleCase('case-k02')
    const text = renderRuleDocuments(reviewCase)
    expect(text).toContain('case-k02-doc-rule-2')
    expect(text).toContain('学院补充细则')
    expect(text).toContain('学院专项上限')
    expect(text).toContain('依据 1/2')
    expect(text).toContain('依据 2/2')
    // 唯一条款文本可被引用
    expect(text).toContain('学院专项加分上限为 3 分')
  })
})

describe('generateRuleOutline 演示降级门控（M0/H03）', () => {
  test('Given 真实案卷且无模型出口 When 生成大纲 Then 抛错而非回填演示校规（K03）', async () => {
    const reviewCase = buildTwoRuleCase('case-k03-real')
    saveCase(reviewCase)
    try {
      await generateRuleOutline({ caseId: reviewCase.id, rulePackId: reviewCase.rulePacks[0]!.id })
      expect.unreachable()
    } catch (error) {
      expect(String(error)).toContain('未回填任何预置规则')
    }
    // 案卷已有大纲保持不动
    const fresh = getCase(reviewCase.id)!
    expect(fresh.rulePacks[0]!.outline).toHaveLength(1)
  })

  test('Given 演示案卷且无模型出口 When 生成大纲 Then 允许回退预置大纲（显式演示语义）', async () => {
    const demo = buildDemoCase()
    saveCase(demo)
    const outline = await generateRuleOutline({ caseId: demo.id, rulePackId: demo.rulePacks[0]!.id })
    expect(outline.length).toBeGreaterThan(0)
  })
})

// ===== M0/H14：未知领域不默认综测执行（K14） =====
describe('未知领域守卫（M0/H14）', () => {
  test('Given 显式未知领域包 When 审核/识别/大纲 Then 如实失败而非套用综测', async () => {
    const reviewCase = buildTwoRuleCase('case-k14')
    const unknown = { ...reviewCase, domainPackId: 'not-a-pack' as never }
    saveCase(unknown)
    await expect(generateRuleOutline({ caseId: unknown.id, rulePackId: unknown.rulePacks[0]!.id })).rejects.toThrow('审核领域未配置')
    await expect(extractItems(unknown.id)).rejects.toThrow('审核领域未配置')
    await expect(runAiReview(unknown)).rejects.toThrow('审核领域未配置')
  })
})
