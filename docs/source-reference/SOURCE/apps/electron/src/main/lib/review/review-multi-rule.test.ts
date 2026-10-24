/**
 * M0/H02 多依据消费 + M0/H03 演示降级限定（对应 K02/K03 回归）
 *
 * 隔离策略：PROFER_CONFIG_DIR 指向唯一临时目录（无渠道配置 → 走无出口分支）。
 */

import { afterAll, describe, expect, test } from 'bun:test'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCase } from '@profer/shared'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { renderRuleDocuments } from './ai-review-service'
import { extractItems, generateRuleOutline, runAiReview } from './ai-review-service'
import { computeCaseInputHash, getCase, saveCase, saveRun } from './case-store'
import { startReviewRun } from './run-service'
import { exportReport } from './report-service'

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

describe('真实界面验收回归：无模型与未识别对象不代表审核通过', () => {
  test('Given 真实案卷无模型 When 识别及运行 Then 明确失败，拒绝导出成功报告', async () => {
    const reviewCase = buildTwoRuleCase('qa-no-model')
    saveCase(reviewCase)
    await expect(extractItems(reviewCase.id)).rejects.toThrow('尚未检查待审文件')
    const run = await startReviewRun(reviewCase.id)
    expect(run.status).toBe('failed')
    expect(run.findings).toHaveLength(0)
    expect(run.error).toContain('真实案卷不能使用演示模拟审核')
    await expect(exportReport(reviewCase.id)).rejects.toThrow('尚未成功完成')
  })

  test('Given 零条目案卷 When 开始审核 Then 失败并要求先识别对象', async () => {
    const reviewCase = { ...buildTwoRuleCase('qa-zero-items'), items: [], isDemo: true }
    saveCase(reviewCase)
    const run = await startReviewRun(reviewCase.id)
    expect(run.status).toBe('failed')
    expect(run.error).toContain('尚未识别可审核条目')
  })

  test('Given 内置演示案卷无模型 When 开始审核 Then 保持离线演示可用', async () => {
    const reviewCase = buildDemoCase()
    saveCase(reviewCase)
    const run = await startReviewRun(reviewCase.id)
    expect(run.status).toBe('completed')
    expect(run.engine).toBe('mock-engine')
    expect(run.findings.length).toBeGreaterThan(0)
  })

  test('Given 自定义审核及未处理文件 When 导出 Then 类型、修改建议、出处与覆盖缺口都可读', async () => {
    const reviewCase = { ...buildDemoCase(), id: 'qa-human-report', type: '自定义审核' as const, isDemo: false }
    saveCase(reviewCase)
    const run = await startReviewRun(reviewCase.id) // 无模型先产生真实失败记录
    const demo = buildDemoCase()
    saveCase(demo)
    const finding = (await startReviewRun(demo.id)).findings[0]!
    saveRun(reviewCase.id, { ...run, status: 'completed', engine: 'ai', inputHash: computeCaseInputHash(reviewCase), findings: [finding], coverage: { ...run.coverage, unprocessedMaterials: [{ documentId: 'unread', fileName: '扫描件.pdf', reason: '无文本层' }] } })
    const paths = await exportReport(reviewCase.id)
    const markdown = readFileSync(paths.markdownPath, 'utf8')
    expect(markdown).toContain('| 审核类型 | 自定义审核 |')
    expect(markdown).toContain('修改建议：')
    expect(markdown).toContain('依据位置：')
    expect(markdown).toContain('证明位置：')
    expect(markdown).toContain('扫描件.pdf（无文本层）')
    expect(markdown).toContain('不能表示全部材料符合要求')
  })
})
