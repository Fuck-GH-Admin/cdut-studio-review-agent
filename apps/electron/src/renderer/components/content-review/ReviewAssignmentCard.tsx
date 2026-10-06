/**
 * 审核操作可信指派卡片（C1：显式指派入口）
 *
 * - 「交给 Agent」按钮：为当前案卷创建结构化指派（sessionId/turnId/案卷/动作范围/工作角色）
 * - 指派列表：状态（有效/已撤销）+ 撤销按钮
 * - 会话绑定：使用当前应用会话上下文（无多会话场景用 local 单例会话标识）
 */
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'

interface AssignmentRow {
  id: string
  sessionId: string
  caseId?: string
  actions: string[]
  workRole: string
  createdAt: string
  revokedAt?: string
}

/** 本地单用户场景的会话标识（多会话接入后由会话上下文替换） */
const LOCAL_SESSION_ID = 'local-main'

export function ReviewAssignmentCard({ caseId }: { caseId: string }): JSX.Element {
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [creating, setCreating] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    try {
      const list = await window.reviewAPI.listAssignmentsV2(LOCAL_SESSION_ID)
      setRows((list ?? []) as unknown as AssignmentRow[])
    } catch (error) {
      console.error('[V2] 指派列表加载失败', error)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const createAssignment = useCallback(async (): Promise<void> => {
    setCreating(true)
    try {
      const created = await window.reviewAPI.createAssignmentV2({
        sessionId: LOCAL_SESSION_ID,
        turnId: `turn-${Date.now().toString(36)}`,
        caseId,
        actions: ['list', 'create-case', 'register-material', 'submit-case', 'start-run', 'get-run-status', 'cancel-run', 'export-report'],
        workRole: 'reviewer',
      })
      toast.success(`已指派给 Agent：${created.id}（操作范围：查询/建案/登记/提交/运行/导出；不含决定类）`)
      await load()
    } catch (error) {
      toast.error(`指派失败：${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setCreating(false)
    }
  }, [caseId, load])

  const revoke = useCallback(async (assignmentId: string): Promise<void> => {
    try {
      const ok = await window.reviewAPI.revokeAssignmentV2(assignmentId)
      if (ok) { toast.success(`已撤销指派 ${assignmentId}（新写入将被拒；已完成动作保留）`) } else { toast.error('撤销失败（可能已撤销）') }
      await load()
    } catch (error) {
      toast.error(`撤销失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }, [load])

  const activeCount = rows.filter((row) => !row.revokedAt && row.caseId === caseId).length

  return (
    <div className="space-y-1.5 rounded-lg border-t pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Agent 指派（显式授权）</p>
        <Button size="sm" variant="outline" disabled={creating || activeCount > 0} onClick={() => void createAssignment()}>
          {activeCount > 0 ? `已有 ${activeCount} 个有效指派` : creating ? '指派中…' : '交给 Agent'}
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground">尚无指派。Agent 只有在你显式指派后才能操作此案卷（查询/建案/登记/提交/运行/导出；决定类始终需人工）。</p>}
      {rows.filter((row) => row.caseId === caseId).map((row) => (
        <div key={row.id} className="flex items-center justify-between rounded bg-muted/40 px-2 py-1.5 text-xs">
          <div className="min-w-0 flex-1">
            <span className="font-medium">{row.id}</span>
            <span className="mx-1">·</span>
            <span>{row.revokedAt ? '已撤销' : '有效'}</span>
            <span className="ml-1 text-muted-foreground">（{row.actions.length} 项动作 · {row.workRole} · {row.createdAt.slice(11, 19)}）</span>
          </div>
          {!row.revokedAt && <Button size="sm" variant="ghost" onClick={() => void revoke(row.id)}>撤销</Button>}
        </div>
      ))}
    </div>
  )
}
