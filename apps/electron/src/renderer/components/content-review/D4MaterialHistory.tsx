import * as React from 'react'
import type { ReviewCase } from '@profer/shared'
import { w1MaterialHistory } from './w1-material-history'

/** Persistent reconciliation panel: historical warnings are not current failure counts. */
export function D4MaterialHistory({ reviewCase }: { reviewCase: ReviewCase }): React.ReactElement {
  const records = w1MaterialHistory(reviewCase)
  const attention = records.filter(row => row.needsReconciliation).length
  return <section aria-label="材料版本与来源对账"
    className="shrink-0 border-b border-border/40 px-3 py-2 text-xs">
    <details>
      <summary className="cursor-pointer font-semibold">
        材料来源与历史：{records.filter(row => row.location === 'active').length} 份记录生效，
        {records.filter(row => row.location === 'archived').length} 份归档，
        {attention} 份需核对
      </summary>
      <p className="mt-2 text-muted-foreground">
        当前状态以案卷 active/archived 为准。历史失败记录不会自动消失，也不代表今天仍缺同一文件。
        对中断后双版生效、缺少来源或原件解析不完整的材料，请核验原件后使用下方追加/替换或重试入口。
      </p>
      <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
        {records.map(row => <li key={row.documentId} className="rounded border p-2 break-all">
          <p className="font-medium">{row.fileName} · {row.location === 'archived' ? '历史归档' :
            row.location === 'active' ? '当前材料' : '来源待核对'}</p>
          <p className={row.needsReconciliation ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}>
            {row.description} · {row.parseStatus === 'parsed' ? '解析完成' :
              row.parseStatus === 'partial' ? '部分解析' :
              row.parseStatus === 'failed' ? '解析失败' : '无可确认解析状态'}
          </p>
          <p className="text-muted-foreground">{row.originLabel}</p>
          <code className="block text-[10px] text-muted-foreground">ID: {row.documentId}{row.sha256 ? ' · SHA-256: ' + row.sha256 : ''}</code>
        </li>)}
      </ul>
    </details>
    {!!reviewCase.d4IntakeWarnings?.length && <details className="mt-2">
      <summary className="cursor-pointer text-amber-700 dark:text-amber-300">
        历史导入/跳过/修订异常 {reviewCase.d4IntakeWarnings.length} 条（不等于当前未补齐数）
      </summary>
      <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-4">
        {reviewCase.d4IntakeWarnings.map((item, i) =>
          <li key={i} className="break-all">{item.originLabel}：{item.reason}</li>)}
      </ul>
    </details>}
  </section>
}
