/** 当前案卷材料入口：读取同一持久化 DocumentVersion，允许随时查看真实原件。 */
import * as React from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import type { CaseAggregateV2 } from '@profer/shared'
import { FilePreviewDialog } from '@/components/file-browser/FilePreviewDialog'

const roleName: Record<string, string> = {
  application: '申请原件', evidence: '证明材料', rule: '审核依据',
}

export function ReviewCaseMaterials({ aggregate }: { aggregate: CaseAggregateV2 }): React.ReactElement {
  const caseId = aggregate.caseV2.id
  const [preview, setPreview] = React.useState<{ path: string; fileName: string } | null>(null)
  const [busyId, setBusyId] = React.useState('')
  const [error, setError] = React.useState('')
  const requestSeq = React.useRef(0)

  React.useEffect(() => {
    requestSeq.current += 1
    setPreview(null)
    setBusyId('')
    setError('')
  }, [caseId])

  const open = async (versionId: string, fileName: string): Promise<void> => {
    const seq = ++requestSeq.current
    setBusyId(versionId)
    setError('')
    try {
      const path = await window.reviewAPI.getWorkspaceDocumentPreviewPath({
        caseId, documentVersionId: versionId,
      })
      if (!path) throw new Error('主进程未能读取这份原件')
      if (requestSeq.current === seq) setPreview({ path, fileName })
    } catch (cause) {
      if (requestSeq.current === seq) setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      if (requestSeq.current === seq) setBusyId('')
    }
  }

  return <div className="space-y-2" aria-label="当前案卷原件">
    {aggregate.caseV2.documents.length === 0 && <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
      尚未登记材料，可在下方添加申请原件或证明材料。
    </p>}
    {aggregate.caseV2.documents.map(doc => <div key={doc.versionId}
      className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/35 px-3 py-3">
      <FileText size={17} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={doc.fileName}>{doc.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {roleName[doc.role] ?? doc.role}
          {doc.active === false ? ' · 历史版本' : ''}
          {' · '}解析块 {doc.blocks.length}
          {' · '}版本 {doc.versionId.slice(-8)}
        </p>
      </div>
      <button type="button" className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-40"
        disabled={!!busyId}
        onClick={() => void open(doc.versionId, doc.fileName)}>
        <ExternalLink size={13}/>{busyId === doc.versionId ? '读取中' : '查看原件'}
      </button>
    </div>)}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {preview && <FilePreviewDialog open filePath={preview.path} fileName={preview.fileName} onClose={() => setPreview(null)} />}
  </div>
}
