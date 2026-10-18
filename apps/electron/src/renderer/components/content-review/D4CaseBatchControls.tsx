import * as React from 'react'
import { useAtomValue, useStore } from 'jotai'
import { toast } from 'sonner'
import type { D4CaseBatchAssessment, D4CaseBatchChoice, D4IntakePreview } from '@profer/shared'
import { reviewCaseAtom, selectedCaseIdAtom } from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'

/** W1: the Main picker owns paths, and the reviewer explicitly resolves collisions. */
export function D4CaseBatchControls({ role, actions }: {
  role: 'application' | 'evidence'
  actions: ReviewActions
}): React.ReactElement | null {
  const currentCase = useAtomValue(reviewCaseAtom)
  const store = useStore()
  const caseId = currentCase?.id
  const [preview, setPreview] = React.useState<D4IntakePreview | null>(null)
  const [assessment, setAssessment] = React.useState<D4CaseBatchAssessment | null>(null)
  const [choices, setChoices] = React.useState<D4CaseBatchChoice[]>([])
  const [acknowledged, setAcknowledged] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const activeToken = React.useRef<string | null>(null)
  const sessionGeneration = React.useRef(0)

  React.useEffect(() => {
    return () => {
      sessionGeneration.current += 1
      const previous = activeToken.current
      activeToken.current = null
      if (previous) void window.reviewAPI.discardD4Intake(previous).catch(() => false)
    }
  }, [caseId, role])

  if (!caseId || !caseId.startsWith('d4-')) return null

  const close = async (): Promise<void> => {
    if (activeToken.current) await window.reviewAPI.discardD4Intake(activeToken.current).catch(() => false)
    activeToken.current = null
    setPreview(null); setAssessment(null); setChoices([]); setAcknowledged(false); setError('')
  }
  const open = async (mode: 'files' | 'folder'): Promise<void> => {
    if (busy) return
    setBusy(true); setError('')
    try {
      await close()
      const generation = sessionGeneration.current
      const next = await window.reviewAPI.stageD4Intake(mode)
      if (!next) return
      if (sessionGeneration.current !== generation || store.get(selectedCaseIdAtom) !== caseId) {
        await window.reviewAPI.discardD4Intake(next.token).catch(() => false)
        return
      }
      // No callbacks may write an arbitrary path: only an opaque Main token.
      activeToken.current = next.token
      const proposed = await window.reviewAPI.assessD4CaseBatch({ caseId, role, token: next.token })
      if (sessionGeneration.current !== generation || store.get(selectedCaseIdAtom) !== caseId) {
        await window.reviewAPI.discardD4Intake(next.token).catch(() => false)
        activeToken.current = null
        return
      }
      setPreview(next)
      setAssessment(proposed)
      setChoices(proposed.files.map(file => file.duplicateOf || file.nameConflicts.length
        ? { kind: 'skip' } : { kind: 'append' }))
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)) }
    finally { setBusy(false) }
  }
  const apply = async (): Promise<void> => {
    if (!assessment || !preview || busy) return
    setBusy(true); setError('')
    try {
      const result = await window.reviewAPI.applyD4CaseBatch({
        caseId, token: preview.token, role, expectedRevision: assessment.expectedRevision,
        choices, acknowledgeSkipped: acknowledged,
      })
      activeToken.current = null
      setPreview(null); setAssessment(null); setChoices([]); setAcknowledged(false)
      if (store.get(selectedCaseIdAtom) === caseId) await actions.selectCase(caseId)
      toast.success(`已收录 ${result.documents.length} 份，修订替换 ${result.replacements.length} 份`)
      if (result.skipped.length) toast.warning(`有 ${result.skipped.length} 项跳过或需要人工处理，已保存案卷记录`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)) }
    finally { setBusy(false) }
  }
  return <section className="mt-2 rounded-lg border border-dashed p-2 text-xs" data-testid={`d4-post-case-batch-${role}`}>
    <div className="flex flex-wrap items-center gap-2">
      <strong>批量追加{role === 'application' ? '申报材料' : '证明材料'}</strong>
      <button type="button" className="rounded border px-2 py-1" disabled={busy}
        onClick={() => void open('files')}>文件 / ZIP</button>
      <button type="button" className="rounded border px-2 py-1" disabled={busy}
        onClick={() => void open('folder')}>文件夹</button>
    </div>
    <p className="mt-1 text-muted-foreground">本机确认文件后先预检哈希、同名冲突和案卷版本，再由你决定。审核依据仍由左栏独立管理。</p>
    {assessment && preview && <div className="mt-2 space-y-2">
      <p className="font-medium">批次预检：{assessment.files.length} 份可读，{assessment.skipped.length} 项已跳过</p>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {assessment.files.map((file, i) => <div key={i} className="rounded border p-2">
          <p className="break-all font-medium">{file.originLabel}</p>
          {file.duplicateOf && <p className="text-amber-700 dark:text-amber-300">与当前案卷文件内容相同：{file.duplicateOf}（只允许跳过）</p>}
          {!file.duplicateOf && file.nameConflicts.length > 0 && <p className="text-amber-700 dark:text-amber-300">同名但内容不同，必须明确替换目标或跳过。旧版原件会保留在历史中。</p>}
          <select className="mt-1 w-full rounded border bg-background px-2 py-1"
            aria-label={`处理文件 ${i + 1}`} disabled={busy || !!file.duplicateOf}
            value={choices[i]?.kind === 'replace' ? `replace:${choices[i]!.kind === 'replace' ? choices[i]!.documentId : ''}` : choices[i]?.kind ?? 'skip'}
            onChange={e => setChoices(previous => previous.map((old, j) => j !== i ? old :
              e.target.value.startsWith('replace:') ? { kind: 'replace', documentId: e.target.value.slice(8) }
                : e.target.value === 'append' ? { kind: 'append' } : { kind: 'skip' }))}>
            <option value="skip">跳过此文件</option>
            {!file.duplicateOf && !file.nameConflicts.length && <option value="append">追加新材料</option>}
            {!file.duplicateOf && file.nameConflicts.map(item => <option key={item.documentId}
              value={`replace:${item.documentId}`}>替换现有材料：{item.fileName}（归档旧版）</option>)}
          </select>
        </div>)}
      </div>
      {!!assessment.skipped.length && <div className="rounded border border-amber-500/50 p-2">
        <strong>未加入批次的文件</strong>
        <ul className="mt-1 max-h-32 list-disc overflow-y-auto pl-4">
          {assessment.skipped.map((x, i) => <li key={i} className="break-all">{x.originLabel}：{x.reason}</li>)}
        </ul>
        <label className="mt-2 flex gap-2"><input type="checkbox" disabled={busy}
          checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}/>
          我已核对跳过材料并同意保留历史缺失记录</label>
      </div>}
      <div className="flex gap-2">
        <button type="button" className="rounded border px-3 py-1" disabled={busy} onClick={() => void close()}>取消</button>
        <button type="button" className="rounded bg-primary px-3 py-1 text-primary-foreground"
          disabled={busy || (!!assessment.skipped.length && !acknowledged)}
          onClick={() => void apply()}>{busy ? '正在处理…' : '确认应用本批次决定'}</button>
      </div>
    </div>}
    {error && <p role="alert" className="mt-2 text-destructive">{error}</p>}
  </section>
}
