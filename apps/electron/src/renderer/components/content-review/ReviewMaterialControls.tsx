import * as React from 'react'
import { useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import type { SourceDocument } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { ConfirmDialog } from '@profer/ui/primitives/confirm-dialog'
import { reviewCaseAtom } from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'

const ROLE_NAMES: Record<SourceDocument['role'], string> = {
  rule: '审核依据',
  application: '申报材料',
  evidence: '证明材料',
}

export function ReviewMaterialLaneActions({
  role,
  documentIds,
  actions,
}: {
  role: SourceDocument['role']
  documentIds: string[]
  actions: ReviewActions
}): React.ReactElement {
  const reviewCase = useAtomValue(reviewCaseAtom)
  const [importing, setImporting] = React.useState(false)
  const [clearOpen, setClearOpen] = React.useState(false)
  const [clearing, setClearing] = React.useState(false)
  const name = ROLE_NAMES[role]

  const importOne = async (): Promise<void> => {
    if (!reviewCase || importing) return
    setImporting(true)
    try {
      const document = await actions.importDocument(role)
      if (document) toast.success(`已添加${name}：${document.fileName}`)
    } finally {
      setImporting(false)
    }
  }

  const clearLane = async (): Promise<void> => {
    setClearing(true)
    try {
      if (await actions.clearDocuments(role)) {
        toast.success(`已从当前审核中清空${name}`)
        setClearOpen(false)
      } else {
        toast.error(`清空${name}失败，请查看页面提示`)
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1 px-2 text-[11px]"
        disabled={!reviewCase || importing}
        title={reviewCase ? `只添加到${name}` : '请先新建审核任务'}
        onClick={() => void importOne()}
      >
        {importing ? <LoaderCircle size={12} className="animate-spin" /> : <Plus size={12} />}
        {importing ? '选择中…' : `添加${name}`}
      </Button>
      {documentIds.length > 0 && (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-1.5 text-[11px] text-muted-foreground hover:text-destructive"
            disabled={clearing}
            onClick={() => setClearOpen(true)}
          >
            清空
          </Button>
          <ConfirmDialog
            open={clearOpen}
            onOpenChange={setClearOpen}
            title={`清空${name}`}
            description={`确认从当前审核中移除全部 ${documentIds.length} 份${name}？关联内容会同步撤下，案卷原文件和历史记录会保留。`}
            confirmLabel="清空材料"
            loadingLabel="正在清空…"
            loading={clearing}
            onConfirm={() => void clearLane()}
          />
        </>
      )}
    </div>
  )
}

export function RemoveReviewDocumentButton({
  document,
  actions,
}: {
  document: Pick<SourceDocument, 'id' | 'fileName'>
  actions: ReviewActions
}): React.ReactElement {
  const [open, setOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  const remove = async (): Promise<void> => {
    setRemoving(true)
    try {
      if (await actions.removeDocument(document.id)) {
        toast.success(`已移除：${document.fileName}`)
        setOpen(false)
      } else {
        toast.error('移除材料失败，请查看页面提示')
      }
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`删除材料 ${document.fileName}`}
        title={`移除 ${document.fileName}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={13} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="移除这份材料？"
        description={`确认将「${document.fileName}」从当前审核中移除？关联内容会同步撤下，案卷原文件和历史记录会保留。`}
        confirmLabel="移除材料"
        loadingLabel="正在移除…"
        loading={removing}
        onConfirm={() => void remove()}
      />
    </>
  )
}

export function MoveReviewDocumentButtons({
  role,
  documentIds,
  documentId,
  actions,
}: {
  role: SourceDocument['role']
  documentIds: string[]
  documentId: string
  actions: ReviewActions
}): React.ReactElement {
  const [busy, setBusy] = React.useState(false)
  const index = documentIds.indexOf(documentId)
  const move = async (direction: -1 | 1): Promise<void> => {
    const targetIndex = index + direction
    if (busy || index < 0 || targetIndex < 0 || targetIndex >= documentIds.length) return
    const next = [...documentIds]
    ;[next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!]
    setBusy(true)
    try {
      if (await actions.reorderDocuments(role, next)) toast.success('材料顺序已更新')
      else toast.error('调整材料顺序失败，请查看页面提示')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="flex shrink-0 items-center">
      <Button type="button" variant="ghost" size="icon-sm" className="size-6" aria-label="材料上移" title="上移" disabled={busy || index <= 0} onClick={() => void move(-1)}>
        <ChevronUp size={13} />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" className="size-6" aria-label="材料下移" title="下移" disabled={busy || index < 0 || index >= documentIds.length - 1} onClick={() => void move(1)}>
        <ChevronDown size={13} />
      </Button>
    </span>
  )
}
