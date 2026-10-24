/**
 * V2 启动引导检查（M5，设计 03 §11.1 M5 打包与引导）
 *
 * 应用启动时执行一次（幂等）：
 * - 内置模板草稿落盘（缺失即注入，不覆盖用户改动）
 * - 统计可迁移的 V1 案卷（尚无 case.v2.json）
 * - 产出注记（缺失模板/未知领域等），UI 引导页据此展示
 */

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseSummary, TemplateVersion } from '@profer/shared'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import { getTemplate, listTemplates, saveDraft } from './template-store'
import { getConfigDir } from '../config-paths'

export interface BootCheckResultV2 {
  templatesSeeded: number
  templatesPublished: number
  migratableCases: string[]
  notes: string[]
}

export function runBootCheckV2(): BootCheckResultV2 {
  const notes: string[] = []
  const before = listTemplates().length
  ensureBuiltinTemplateDrafts({ getTemplate, saveDraft })
  const templates = listTemplates()
  const seeded = templates.length - before
  if (seeded > 0) notes.push(`已注入 ${seeded} 个内置模板草稿`)

  const published = templates.filter((template: TemplateVersion) => template.status === 'published').length
  if (published === 0) notes.push('尚无已发布模板：发布后才能创建批次与运行审核')

  // 可迁移案卷：存在 case.json（V1）且无 case.v2.json
  const migratableCases: string[] = []
  const casesDir = join(getConfigDir(), 'review-cases')
  if (existsSync(casesDir)) {
    for (const entry of readdirSync(casesDir)) {
      const hasV1 = existsSync(join(casesDir, entry, 'case.json'))
      const hasV2 = existsSync(join(casesDir, entry, 'case.v2.json'))
      if (hasV1 && !hasV2) migratableCases.push(entry)
    }
  }
  if (migratableCases.length > 0) notes.push(`${migratableCases.length} 个 V1 案卷可迁移到 V2（迁移保留原文件与历史运行）`)
  return { templatesSeeded: seeded, templatesPublished: published, migratableCases, notes }
}

/** 供 UI 汇总：案卷摘要列表中的可迁移标记（本地无数据库，读目录即得） */
export function filterMigratable(summaries: ReviewCaseSummary[]): string[] {
  return summaries.filter((summary) => !existsSync(join(getConfigDir(), 'review-cases', summary.id, 'case.v2.json'))).map((summary) => summary.id)
}
