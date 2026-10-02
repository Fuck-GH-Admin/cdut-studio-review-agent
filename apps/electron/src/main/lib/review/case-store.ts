/**
 * 案卷存储
 *
 * 内容审核专区的本地持久化层：`getConfigDir()/review-cases/{caseId}/`。
 * - `case.json` 案卷本体（原子写：先写 `.tmp` 再 rename 覆盖）
 * - `runs/{runId}.json` 审核运行记录（同样原子写）
 *
 * 安全约束：caseId / runId 直接参与路径拼接，必须先过 `assertSafeId`
 * （只允许 [a-zA-Z0-9_-]），否则视为路径穿越攻击直接 throw。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCase, ReviewCaseSummary, ReviewRun } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'

/** 演示案卷固定 ID（载入/重审/报告锚定同一个 ID） */
export const DEMO_CASE_ID = 'demo-zhangsan-2026'

/** 安全 ID 白名单：字母数字 + 连字符 + 下划线，杜绝路径穿越 */
const SAFE_ID_RE = /^[a-zA-Z0-9_-]+$/

/**
 * 校验案卷/运行 ID 是否安全。
 *
 * @throws ID 含路径分隔符、点号等任何非法字符时抛出中文错误
 */
export function assertSafeId(id: string): void {
  if (typeof id !== 'string' || id.length === 0 || !SAFE_ID_RE.test(id)) {
    throw new Error(`无效的 ID: ${JSON.stringify(String(id))}（仅允许字母、数字、连字符与下划线）`)
  }
}

/** 案卷存储根目录（getConfigDir 会自动创建配置目录） */
export function getReviewCasesDir(): string {
  const dir = join(getConfigDir(), 'review-cases')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

/** 案卷目录：{review-cases}/{caseId}/ */
function getCaseDir(caseId: string): string {
  assertSafeId(caseId)
  return join(getReviewCasesDir(), caseId)
}

/** 案卷本体路径 */
function getCaseFilePath(caseId: string): string {
  return join(getCaseDir(caseId), 'case.json')
}

/** 运行记录目录（只读语义：不建目录，供读取路径使用，避免幽灵目录） */
function getRunsDirReadOnly(caseId: string): string {
  return join(getCaseDir(caseId), 'runs')
}

/** 运行记录目录（写语义：写入前确保目录存在） */
function ensureRunsDir(caseId: string): string {
  const dir = getRunsDirReadOnly(caseId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * 原子写 JSON：写 `{目标}.tmp` 再 rename 覆盖目标。
 *
 * 中断只会留下 `.tmp` 残片，绝不出现写了一半的 `case.json`。
 */
function writeJsonAtomic(filePath: string, data: unknown): void {
  const tmpPath = `${filePath}.tmp`
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmpPath, filePath)
}

/** 读取 JSON；文件缺失返回 undefined，损坏记 warn 并返回 undefined（不吞栈） */
function readJsonFile<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T
  } catch (error) {
    console.warn(`[审核专区] 案卷文件解析失败，已跳过: ${filePath}`, error)
    return undefined
  }
}

/** 列出 runs/ 下可解析的运行文件名（仅 .json，字典序） */
function listRunFileNames(caseId: string): string[] {
  const runsDir = getRunsDirReadOnly(caseId)
  if (!existsSync(runsDir)) return []
  try {
    return readdirSync(runsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()
  } catch (error) {
    console.warn(`[审核专区] 读取运行目录失败: ${runsDir}`, error)
    return []
  }
}

/**
 * 取某案卷最近一次运行的状态。
 *
 * 「最近」按 runs/ 目录下文件名字典序最大者（runId 形如 `run-{时间戳}-{随机}`，
 * 时间戳定长所以字典序即时间序）。读不到任何运行 → undefined。
 */
function readLastRunStatus(caseId: string): ReviewRun['status'] | undefined {
  const names = listRunFileNames(caseId)
  for (let i = names.length - 1; i >= 0; i--) {
    const name = names[i]!
    const run = readJsonFile<ReviewRun>(join(getRunsDirReadOnly(caseId), name))
    if (run && typeof run.status === 'string') return run.status
  }
  return undefined
}

/**
 * 列出全部已存储案卷（摘要，不含重文档）。
 *
 * 读不到 / 解析失败的案卷逐个 console.warn 后跳过，不让单个坏文件拖垮列表。
 */
export function listCases(): ReviewCaseSummary[] {
  const root = getReviewCasesDir()
  let entries: string[]
  try {
    entries = readdirSync(root)
  } catch (error) {
    console.warn(`[审核专区] 读取案卷目录失败: ${root}`, error)
    return []
  }

  const summaries: ReviewCaseSummary[] = []
  for (const name of entries) {
    // 跳过非目录与临时文件
    if (name.endsWith('.tmp')) continue
    const caseFile = join(root, name, 'case.json')
    if (!existsSync(caseFile)) continue

    const reviewCase = readJsonFile<ReviewCase>(caseFile)
    if (!reviewCase || typeof reviewCase.id !== 'string') {
      console.warn(`[审核专区] 案卷不可读，已跳过: ${caseFile}`)
      continue
    }

    summaries.push({
      id: reviewCase.id,
      title: reviewCase.title,
      type: reviewCase.type,
      applicant: reviewCase.applicant,
      academicYear: reviewCase.academicYear,
      updatedAt: reviewCase.updatedAt,
      isDemo: reviewCase.isDemo,
      documentCount: reviewCase.documents?.length ?? 0,
      lastRunStatus: readLastRunStatus(reviewCase.id),
      // 列表展示领域标签（未标注的历史案卷由 UI 回落缺省包名）
      domainPackId: reviewCase.domainPackId,
    })
  }

  // updatedAt 倒序：最近更新的案卷排前面
  summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
  return summaries
}

/** 读取单个案卷；不存在或不可读返回 undefined */
export function getCase(caseId: string): ReviewCase | undefined {
  assertSafeId(caseId)
  const filePath = getCaseFilePath(caseId)
  if (!existsSync(filePath)) return undefined

  const reviewCase = readJsonFile<ReviewCase>(filePath)
  if (!reviewCase) {
    console.warn(`[审核专区] 案卷读取失败（文件损坏）: ${filePath}`)
    return undefined
  }
  return reviewCase
}

/** 保存案卷（原子写；目录不存在则创建） */
export function saveCase(reviewCase: ReviewCase): void {
  const filePath = getCaseFilePath(reviewCase.id)
  mkdirSync(getCaseDir(reviewCase.id), { recursive: true })
  try {
    writeJsonAtomic(filePath, reviewCase)
  } catch (error) {
    console.error(`[审核专区] 保存案卷失败: ${filePath}`, error)
    throw new Error(`保存案卷失败: ${reviewCase.id}`)
  }
}

/** 删除案卷（整目录 rm -rf；不存在时静默） */
export function deleteCase(caseId: string): void {
  const dir = getCaseDir(caseId)
  if (!existsSync(dir)) return
  try {
    rmSync(dir, { recursive: true, force: true })
    console.log(`[审核专区] 已删除案卷: ${caseId}`)
  } catch (error) {
    console.error(`[审核专区] 删除案卷失败: ${caseId}`, error)
    throw new Error(`删除案卷失败: ${caseId}`)
  }
}

/** 保存一次审核运行（原子写 runs/{runId}.json） */
export function saveRun(caseId: string, run: ReviewRun): void {
  assertSafeId(run.id)
  const filePath = join(ensureRunsDir(caseId), `${run.id}.json`)
  try {
    writeJsonAtomic(filePath, run)
  } catch (error) {
    console.error(`[审核专区] 保存运行记录失败: ${filePath}`, error)
    throw new Error(`保存运行记录失败: ${run.id}`)
  }
}

/** 列出某案卷的全部运行记录（按 runId 字典序，即时间序升序） */
export function listRuns(caseId: string): ReviewRun[] {
  const names = listRunFileNames(caseId)
  const runs: ReviewRun[] = []
  for (const name of names) {
    const run = readJsonFile<ReviewRun>(join(getRunsDirReadOnly(caseId), name))
    if (run && typeof run.id === 'string') runs.push(run)
    else console.warn(`[审核专区] 运行记录不可读，已跳过: ${name}`)
  }
  return runs
}

/**
 * 载入演示案卷。
 *
 * 首次调用把 fixture 复制进案卷目录（此后运行期只读案卷目录）；
 * 已存在则直接读盘返回，保证 demo 的 ID/锚点跨会话稳定。
 */
export function loadDemoCase(): ReviewCase {
  const existing = getCase(DEMO_CASE_ID)
  if (existing) return existing

  const demoCase = buildDemoCase()
  saveCase(demoCase)
  console.log(`[审核专区] 已载入演示案卷: ${demoCase.id}（文档 ${demoCase.documents.length} / 条目 ${demoCase.items.length}）`)
  return demoCase
}
