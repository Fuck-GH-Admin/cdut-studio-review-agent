import * as React from 'react'
import { useAtomValue, useStore } from 'jotai'
import { toast } from 'sonner'
import type { SourceDocument } from '@profer/shared'
import { reviewCaseAtom, selectedCaseIdAtom } from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'

/** Deliberate, case-version-checked reparse of the stored original.
 * No browser File or Renderer filesystem path crosses the IPC boundary.
 */
export function D4RetryDocumentButton({ document, actions }: {
  document: Pick<SourceDocument, 'id' | 'fileName' | 'parseStatus' | 'origin' | 'parseError'>
  actions: ReviewActions
}): React.ReactElement | null {
  const current = useAtomValue(reviewCaseAtom)
  const store = useStore()
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  if (!current?.id.startsWith('d4-') || document.origin !== 'upload' ||
      (document.parseStatus !== 'failed' && document.parseStatus !== 'partial') ||
      !current.d4IntakeOrigins?.some(origin => origin.documentId === document.id)) return null

  const retry = async (): Promise<void> => {
    if (busy || store.get(selectedCaseIdAtom) !== current.id) return
    setBusy(true); setError('')
    try {
      const result = await window.reviewAPI.retryD4Document({
        caseId: current.id, documentId: document.id, expectedRevision: current.revision ?? 0,
      })
      if (store.get(selectedCaseIdAtom) === current.id) await actions.selectCase(current.id)
      if (result.status === 'replaced') toast.success(result.message)
      else toast.warning(result.message)
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause)
      setError(reason)
      toast.error('原件重新解析失败，旧材料未被主动撤下')
    } finally {
      setBusy(false)
    }
  }

  return <div className="mt-1.5 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-xs"
    data-testid={`d4-retry-document-${document.id}`}>
    <p className="font-medium text-amber-700 dark:text-amber-300">
      {document.parseStatus === 'failed' ? '原件解析失败' : '仅部分解析'}：{document.fileName}
    </p>
    <p className="mt-1 text-muted-foreground">
      {document.parseError || '该材料未形成完整可核验文本。原件已保留。'}
    </p>
    <p className="mt-1 text-muted-foreground">
      重新解析使用案卷内已保存的原件，核对字节哈希后产生新版本；仅新版本完整解析成功时撤下旧版。
      图片与扫描件仍可能需要视觉核验，重试不代表事实自动确认。
    </p>
    <button type="button" className="mt-1.5 rounded border px-2 py-1 disabled:opacity-50"
      disabled={busy} onClick={() => void retry()}>
      {busy ? '正在重试解析…' : '重新解析案卷内原件'}
    </button>
    {error && <p role="alert" className="mt-1 text-destructive">{error}</p>}
  </div>
}
