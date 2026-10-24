/**
 * 普通用户的单案审核入口：确定性模板检查与 Pi 语义检查共用同一份
 * Main-owned ReviewRunV2。Renderer 不单独启动 run-tpl-* 旁路。
 */
import * as React from 'react'
import type { MaterialSlotSpec, ReviewBackgroundPiRunState, ReviewRunV2 } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'

interface Props {
  caseId: string
  stage: string
  documentCount: number
  technicalPlan?: boolean
  canRun?: boolean
  materialSlots?: MaterialSlotSpec[]
  onUpdated: () => Promise<void>
}

const terminalStatuses = new Set(['completed', 'partially-completed', 'failed', 'stopped', 'cancelled'])

export function ReviewV3UnifiedRun({ caseId, stage, documentCount, technicalPlan, canRun = true, materialSlots = [], onUpdated }: Props): JSX.Element {
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [supplementBusy, setSupplementBusy] = React.useState(false)
  const [piError, setPiError] = React.useState('')
  const [piState, setPiState] = React.useState<ReviewBackgroundPiRunState | null>(null)
  const [piRun, setPiRun] = React.useState<ReviewRunV2 | null>(null)
  const [runStale, setRunStale] = React.useState(false)
  const running = !!piState?.runId && ['queued', 'running', 'awaiting-input', 'awaiting-decision'].includes(piState.runStatus ?? '')

  const refresh = React.useCallback(async (): Promise<void> => {
    const state = await window.reviewAPI.getBackgroundPiReviewStateV2(caseId)
    if (state.caseId !== caseId) throw new Error('审核状态与当前案卷不一致')
    const run = state.runId ? await window.reviewAPI.getRunV2(caseId, state.runId) : undefined
    if (run && run.caseId !== caseId) throw new Error('审核结果与当前案卷不一致')
    setPiState(state)
    setPiRun(run ?? null)
    setRunStale(run ? await window.reviewAPI.getWorkspaceRunValidityV2({caseId, runId:run.id}) : false)
    if (run && terminalStatuses.has(run.status)) {
      setMessage('本轮 AI 审核已结束；请核对待确认项、证据和人工决定。')
      await onUpdated()
    }
  }, [caseId, onUpdated])

  React.useEffect(() => {
    setPiError(''); setPiState(null); setPiRun(null); setRunStale(false); setMessage('')
    void refresh().catch(() => { /* 尚未运行 Pi 时没有状态，不阻止第一次审核 */ })
  }, [caseId])

  React.useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      void refresh().catch((cause) => setPiError(cause instanceof Error ? cause.message : String(cause)))
    }, 2500)
    return () => clearInterval(timer)
  }, [running, refresh])

  const start = async (mode: 'update' | 'restart'): Promise<void> => {
    if (busy || running || !caseId) return
    if (!canRun) { setPiError('请先根据材料匹配并确认审核模板，再开始执行'); return }
    if (documentCount === 0) { setPiError('请先导入实际材料，不能审核空案卷'); return }
    setBusy(true); setPiError(''); setMessage('正在准备本案初审…')
    try {
      // The first review analyzes the current case; it is NOT a formal
      // submission transaction. Missing ordinary evidence is reported after
      // the review rather than making submission fail before checks start.
      // Formal stage transitions remain explicitly Main-authorized operations.
      setMessage('正在启动当前案卷的确定性规则与 Pi 语义初审…')
      try {
        const admitted = await window.reviewAPI.startBackgroundPiReviewV2({ caseId, mode })
        if (admitted.caseId !== caseId || !admitted.runId) throw new Error('后台未返回本案真实审核运行')
        setPiState(admitted)
        setMessage('初审已受理，下面会展示同一轮运行的真实进度。')
        await refresh()
      } catch (cause) {
        setPiError(cause instanceof Error ? cause.message : String(cause))
        setMessage('统一审核未能受理；本轮没有可用的运行回执。')
      }
      await onUpdated()
    } catch (cause) {
      setPiError(cause instanceof Error ? cause.message : String(cause))
      setMessage('初审未正常开始，请根据下方原因修正后重试。')
    } finally {
      setBusy(false)
    }
  }

  const summary = piRun?.coverage
  const awaitingSupplement=piRun?.checks.filter(check=>check.status==='awaiting-supplement')??[]
  const supplementSlotIds=[...new Set(awaitingSupplement.map(check=>
    check.ruleId.startsWith('required-material-')?check.ruleId.slice('required-material-'.length):''
  ).filter(Boolean))]
  const createInitialSupplementRequests=async():Promise<number>=>{
    if(!caseId||!piRun)throw new Error('当前没有可关联的真实初审 Run')
    const result=await window.reviewAPI.openInitialReviewSupplementV3({caseId,runId:piRun.id})
    if(!result.ok)throw new Error(result.message)
    return result.entity?.length??0
  }
  const requestSupplements=async():Promise<void>=>{
    if(supplementBusy||!caseId||!piRun||runStale)return
    setSupplementBusy(true);setPiError('')
    try{
      const count=await createInitialSupplementRequests()
      setMessage('已建立/复用 '+count+' 条持久补件请求。请在下方“补件周期”中逐项回复并等待人工核验；补件核结不等于审核通过。')
      await onUpdated()
    }catch(cause){setPiError(cause instanceof Error?cause.message:String(cause))}
    finally{setSupplementBusy(false)}
  }
  const addSupplement=async (slotId:string):Promise<void>=>{
    if(supplementBusy||!caseId||!piRun||runStale)return
    setSupplementBusy(true);setPiError('')
    try{
      // Create the durable request BEFORE importing, so its material-version
      // baseline excludes the incoming file and F12 can verify the response.
      await createInitialSupplementRequests()
      // Refresh the durable request before opening the picker, so cancellation
      // does not leave a newly-created request invisible until a manual refresh.
      await onUpdated()
      const imported=await window.reviewAPI.pickRegisterMaterialV2({
        caseId,role:'evidence',materialSlotId:slotId,
      })
      if(imported.length){
        setRunStale(true)
        setMessage('补件请求已持久化，原件已登记。请在下方“补件周期”将新材料关联为回复并等待人工核验，再更新审核生成新 Run。')
        await onUpdated()
      }else{
        setMessage('补件请求已持久化；本次未选择新材料。可稍后在下方“补件周期”提交回复。')
      }
    }catch(cause){setPiError(cause instanceof Error?cause.message:String(cause))}
    finally{setSupplementBusy(false)}
  }
  return <section aria-label="统一审核执行" className="space-y-2 rounded-lg border border-primary/30 bg-primary/[0.03] p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-semibold">初审当前材料</p>
        <p className="text-xs text-muted-foreground">确定性规则、材料槽位检查与 Pi 语义检查写入同一份真实 Run；补件后以当前材料版本重审</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={busy || running || !canRun || documentCount === 0 || stage === 'archived'} onClick={() => void start('update')}>
          {busy ? '正在启动…' : running ? '初审进行中' : piRun ? '更新审核' : '开始初审'}
        </Button>
        {!!piRun && <Button size="sm" variant="outline" disabled={busy || running || !canRun} onClick={() => void start('restart')}>重新审核全部</Button>}
      </div>
    </div>
    {documentCount === 0 && <p className="text-xs text-amber-700">请先把材料拖入上面的材料区，随后即可开始审核。</p>}
    {!canRun && <p className="text-xs text-amber-700">已保存材料，请先确认匹配的审核模板和实际审核对象。</p>}
    {message && <p role="status" className="text-xs">{message}</p>}
    {stage==='draft'&&!technicalPlan&&<p className="text-xs text-muted-foreground">初审仅检查当前材料，不会自动提交、批准或创建校方决定。少量缺件在初审结果中列出，补件后更新审核。</p>}
    {piState?.runId && <p className="text-xs">AI 审核：{piRun?.status ?? piState.runStatus ?? '已受理'} · <span className="font-mono">{piState.runId}</span></p>}
    {summary && <p className="text-xs">已完成 {summary.completedChecks}/{summary.plannedChecks} 项；待处理 {summary.pendingChecks} 项；有依据的判断 {summary.effectiveVerdicts} 项</p>}
    {runStale&&piRun&&<p role="alert" className="text-xs text-amber-700">
      当前材料或分类已变化，旧运行 {piRun.id} 已过期；请更新审核获取对应新原件版本的结果。
    </p>}
    {awaitingSupplement.length>0&&!running&&<div className="space-y-2 rounded-md border border-amber-600/30 p-3">
      <p className="font-medium">本轮初审发现 {awaitingSupplement.length} 项待补件</p>
      {awaitingSupplement.map(check=><p key={check.checkId} className="text-xs">
        {check.reason||check.ruleId}
      </p>)}
      {!runStale&&piRun&&['completed','partially-completed'].includes(piRun.status)&&supplementSlotIds.length>0&&
        <Button size="sm" variant="outline" disabled={supplementBusy} onClick={()=>void requestSupplements()}>
          {supplementBusy?'正在创建补件请求…':'建立持久补件请求'}
        </Button>}
      {!runStale&&supplementSlotIds.map(slotId=>{
        const slot=materialSlots.find(item=>item.id===slotId)
        return slot?<Button size="sm" key={slotId} variant="outline"
          disabled={supplementBusy} onClick={()=>void addSupplement(slotId)}>
          补传：{slot.name}
        </Button>:null
      })}
      <p className="text-xs text-muted-foreground">系统会先创建/复用持久补件请求，再登记新原件。请在下方补件周期提交回复并等待人工核验；补件后旧 Run 失效，必须点击“更新审核”生成新 Run。</p>
    </div>}
    {summary && summary.documents.some((item) => item.status !== 'read') &&
      <p role="alert" className="text-xs text-red-600">有 {summary.documents.filter((item) => item.status !== 'read').length} 份材料尚未确认读取成功；本轮结果不可视为完整审核。</p>}
    {piError && <p role="alert" className="text-xs text-red-600">AI 审核未完成：{piError}</p>}
    <Button size="sm" variant="ghost" disabled={busy || !caseId} onClick={() => void refresh().catch((cause) => setPiError(cause instanceof Error ? cause.message : String(cause)))}>刷新审核进度和结果</Button>
  </section>
}
