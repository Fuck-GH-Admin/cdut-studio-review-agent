import * as React from 'react'
import type { ReviewCase } from '@profer/shared'
import { w1MaterialHistory } from './w1-material-history'
import { FilePreviewDialog } from '@/components/file-browser/FilePreviewDialog'

/** Persistent reconciliation panel: historical warnings are not current failure counts. */
export function D4MaterialHistory({ reviewCase, reload }: {
  reviewCase: ReviewCase; reload(): Promise<unknown>
}): React.ReactElement {
  const records = w1MaterialHistory(reviewCase)
  const attention = records.filter(row => row.needsReconciliation).length
  const [preview, setPreview] = React.useState<{ path: string; fileName: string } | null>(null)
  const [error, setError] = React.useState('')
  const [opening, setOpening] = React.useState<string | null>(null)
  const [resolving, setResolving] = React.useState<string | null>(null)
  const currentCase = React.useRef(reviewCase.id)
  currentCase.current = reviewCase.id
  React.useEffect(() => { setPreview(null); setError(''); setOpening(null) }, [reviewCase.id])
  const previewOriginal = async (documentId: string, fileName: string): Promise<void> => {
    const caseId = reviewCase.id
    setOpening(documentId); setError('')
    try {
      // Only a Main-verified case asset path is accepted. The Renderer never
      // supplies a host path and the preview is always tied to a V2 version.
      const path = await window.reviewAPI.getWorkspaceDocumentPreviewPath({
        caseId, documentVersionId: documentId + '-v1',
      })
      if (currentCase.current !== caseId) return
      if (path) setPreview({ path, fileName })
      else setError('案卷中未找到可安全预览的原件，或版本尚未同步；请核对存档来源。')
    } catch (cause) {
      if (currentCase.current === caseId) setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      if (currentCase.current === caseId) setOpening(null)
    }
  }
  const resolveTransition = async (newDocumentId: string, decision: 'keep-old' | 'keep-new'): Promise<void> => {
    const caseId = reviewCase.id
    setResolving(newDocumentId); setError('')
    try {
      await window.reviewAPI.resolveD4MaterialTransition({
        caseId, newDocumentId, expectedRevision: reviewCase.revision ?? 0, decision,
      })
      if (currentCase.current === caseId) await reload()
    } catch (cause) {
      if (currentCase.current === caseId)
        setError((cause instanceof Error ? cause.message : String(cause)) +
          '。请刷新案卷并核对两个原件的有效版本，不能假定裁决已回滚。')
    } finally {
      if (currentCase.current === caseId) setResolving(null)
    }
  }
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
          {(() => {
            const transition = reviewCase.d4MaterialTransitions?.find(item =>
              item.newDocumentId === row.documentId &&
              (item.status === 'pending' || item.status === 'archive-failed'))
            const oldActive = transition && reviewCase.documents.some(item =>
              item.id === transition.previousDocumentId)
            const newActive = reviewCase.documents.some(item => item.id === row.documentId)
            if (!transition || !oldActive || !newActive) return null
            return <div className="mt-2 flex flex-wrap items-center gap-2 rounded border border-amber-500/40 p-2">
              <span>新旧版本均生效，需审核员选择保留哪一版；另一版仅归档，不删除原件。</span>
              <button type="button" className="rounded border px-2 py-1" disabled={resolving !== null}
                onClick={() => void resolveTransition(row.documentId, 'keep-old')}>
                保留旧版
              </button>
              <button type="button" className="rounded border px-2 py-1" disabled={resolving !== null}
                onClick={() => void resolveTransition(row.documentId, 'keep-new')}>
                校验新版并采用
              </button>
            </div>
          })()}
          {row.location !== 'missing' && <button type="button" className="mt-1 rounded border px-2 py-1 disabled:opacity-50"
            disabled={opening !== null} onClick={() => void previewOriginal(row.documentId, row.fileName)}>
            {opening === row.documentId ? '正在核验原件路径…' : '预览本版原件'}
          </button>}
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
    {error && <p role="alert" className="mt-2 text-destructive">{error}</p>}
    {preview && <FilePreviewDialog open={true} filePath={preview.path} fileName={preview.fileName}
      onClose={() => setPreview(null)} />}
  </section>
}
