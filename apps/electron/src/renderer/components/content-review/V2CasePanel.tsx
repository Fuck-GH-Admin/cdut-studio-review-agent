/**
 * 案卷原子与面板（审核命令的可操作入口）
 *
 * Jotai 状态：当前案卷聚合（按 caseId 缓存）+ 动作回调；组件只做展示与触发命令，
 * 不散落 IPC 调用（仓库四层约定）。U01 部分走通：seed 样例 → 创建案卷 → 改字段 → 重启保留。
 */

import { atom, useAtomValue, useStore, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Actor, CaseAggregateV2, FieldSpec, ReviewCommandResult, ReviewRunV2, TemplateVersion } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'
import { RunResultPanel } from './RunResultPanel'
import { ObservationConfirmPanel } from './ObservationConfirmPanel'
import { ReviewAssignmentCard } from './ReviewAssignmentCard'
import { CaseTimelinePanel } from './CaseTimelinePanel'
import { ReviewV3T02CoverageSection } from './ReviewV3T02CoverageSection'
import { ReviewV3T03FactWorkbench } from './ReviewV3T03FactWorkbench'
import { ReviewV3TemplateRuleRun } from './ReviewV3TemplateRuleRun'
import { ReviewV3T05HumanWorkflow } from './ReviewV3T05HumanWorkflow'
import { ReviewV3T09OfflineSection } from './ReviewV3T09OfflineSection'
import { humanizeReviewError } from './review-error-text'
import { ReviewV3T05RunDecision } from './ReviewV3T05RunDecision'
import { MaterialDropZone } from './MaterialDropZone'
import { ReviewV3UnifiedRun } from './ReviewV3UnifiedRun'
import { ReviewV3T08ReportPanel } from './ReviewV3T08ReportPanel'
import { ReviewV3TemplateRoutingAssistant } from './ReviewV3TemplateRoutingAssistant'
import { ReviewV3LocalManualItem } from './ReviewV3LocalManualItem'
import { ReviewCaseMaterials } from './ReviewCaseMaterials'
import { reviewWorkspaceAggregateAtom, reviewWorkspaceSectionAtom } from '@/atoms/review-atoms'

/** 当前案卷聚合 */
export const reviewV2AggregateAtom = atom<CaseAggregateV2 | null>(null)
export const reviewV2BusyAtom = atom(false)
export const reviewV2NoticeAtom = atom<string | null>(null)
/** 模板发布后通知 V2CasePanel 重载模板列表（面板常驻挂载，tab 切换不触发 effect） */
export const templatesRefreshAtom = atom(0)

const localActor: Actor = { actorId: 'local-user', actorSource: 'local', role: 'reviewer' }

interface CaseListEntry { caseId: string; title: string; stage: string; revision: number; templateId: string; templateVersion: number; updatedAt: string }
interface SubjectDraft { id: string; title: string; sectionId?: string; fieldValues: Record<string, string> }

function subjectId(sectionId = 'item'): string {
  return `item-${sectionId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function initialSubjectRows(template: TemplateVersion): SubjectDraft[] {
  const requiredSections = (template.sections ?? []).filter((section) => section.required)
  if (requiredSections.length > 0) {
    return requiredSections.map((section) => ({ id: subjectId(section.id), title: '', sectionId: section.id, fieldValues: {} }))
  }
  if ((template.sections ?? []).length > 0) return []
  return template.fields.some((field) => (field.scope ?? 'subject') === 'subject')
    ? [{ id: subjectId(), title: '', fieldValues: {} }]
    : []
}

function renderTemplateFieldInput(
  field: FieldSpec,
  value: string,
  onChange: (value: string) => void,
): JSX.Element {
  if (field.kind === 'boolean') {
    return <select className="flex-1 rounded border bg-background px-2 py-1 text-xs" value={value} onChange={(event) => onChange(event.target.value)}><option value="">请选择</option><option value="true">是</option><option value="false">否</option></select>
  }
  if (field.kind === 'enum' && field.options?.length) {
    return <select className="flex-1 rounded border bg-background px-2 py-1 text-xs" value={value} onChange={(event) => onChange(event.target.value)}><option value="">请选择</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  }
  return <input className="flex-1 rounded border bg-background px-2 py-1 text-xs" type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'} value={value} onChange={(event) => onChange(event.target.value)} />
}

/** 各步骤显示独立，但始终操作同一份 Main-owned 案卷聚合。 */
export type ReviewCaseStep = 'materials' | 'review' | 'decision' | 'report' | 'advanced'
export function V2CasePanel({
  onCaseOpened, step = 'materials', onStepChange,
}: {
  onCaseOpened?: (caseId: string) => void
  step?: ReviewCaseStep
  onStepChange?: (step: ReviewCaseStep) => void
} = {}): JSX.Element {
  const store = useStore()
  const aggregate = useAtomValue(reviewV2AggregateAtom)
  const workspaceAggregate = useAtomValue(reviewWorkspaceAggregateAtom)
  const setNotice = useSetAtom(reviewV2NoticeAtom)
  const setWorkspaceSection = useSetAtom(reviewWorkspaceSectionAtom)

  const [caseList, setCaseList] = useState<CaseListEntry[]>([])
  const [templates, setTemplates] = useState<TemplateVersion[]>([])
  const publishedTemplates = useMemo(() => {
    const latestByTemplate = new Map<string, TemplateVersion>()
    for (const template of [...templates].filter((item) => item.status === 'published').sort((a, b) => b.version - a.version)) {
      if (!latestByTemplate.has(template.templateId)) latestByTemplate.set(template.templateId, template)
    }
    return [...latestByTemplate.values()]
  }, [templates])
  const templatesRefresh = useAtomValue(templatesRefreshAtom)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateVersion | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [subjectRows, setSubjectRows] = useState<SubjectDraft[]>([])
  const [newTitle, setNewTitle] = useState('')


  const refreshList = useCallback(async (): Promise<void> => {
    try {
      setCaseList(await window.reviewAPI.listCasesV2())
    } catch (error) {
      console.error('[V2] 案卷列表加载失败', error)
    }
  }, [])
  useEffect(() => { void refreshList() }, [refreshList])

  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    store.set(reviewV2BusyAtom, true)
    try {
      await action()
    } catch (error) {
      // 展示层翻译成可执行的一句话；未识别的错误保留原文，避免掩盖真实原因
      if (error instanceof Error) console.error('[审核] 操作失败原始错误:', error)
      const message = humanizeReviewError(error)
      setNotice(message)
      toast.error(`操作失败：${message}`)
    } finally {
      store.set(reviewV2BusyAtom, false)
    }
  }, [store, setNotice, toast])

  const applyResult = useCallback((result: ReviewCommandResult | undefined): void => {
    if (!result) return
    if (result.ok) {
      store.set(reviewV2AggregateAtom, result.aggregate)
      toast.success(`已保存：${result.receipt.summary}`)
    } else {
      // 冲突/校验错误如实呈现（不静默重试，07 §3.1）
      setNotice(`${result.code}: ${result.message}`)
      toast.error(`${result.code}：${result.message}`)
    }
  }, [store, setNotice, toast])

  const openCase = useCallback((caseId: string) => run(async () => {
    const loaded = await window.reviewAPI.openAggregateV2(caseId)
    if (!loaded) { toast.error(`案卷不存在: ${caseId}`); return }
    store.set(reviewV2AggregateAtom, loaded)
    onCaseOpened?.(caseId)
    toast.success(`已打开案卷：${loaded.caseV2.title}`)
  }), [run, store, onCaseOpened])

  const loadTemplates = useCallback(async (): Promise<void> => {
    try {
      const all = await window.reviewAPI.listTemplateVersionsV2()
      setTemplates(all)
    } catch (error) {
      console.error('[V2] 模板列表加载失败', error)
    }
  }, [])
  useEffect(() => { void loadTemplates() }, [loadTemplates, templatesRefresh])

  const createFromTemplate = useCallback(() => run(async () => {
    if (!selectedTemplate) { toast.error('请先选择已发布模板'); return }
    if (!newTitle.trim()) { toast.error('请填写案卷标题'); return }
    const caseId = `case-${Date.now().toString(36)}`
    // 只提交用户真正填写的事项：模板没有事项级字段时列表里仍有一个空白行，
    // 直接提交会被「申报事项名称不能为空」拒绝，导致整类案例无法建案。
    const filledSubjectRows = subjectRows.filter((subject) => subject.title.trim()
      || Object.values(subject.fieldValues).some((value) => String(value ?? '').trim()))
    const subjects = filledSubjectRows.map((subject) => ({
      ...subject,
      type: 'item' as const,
      fieldValues: Object.fromEntries(Object.entries(subject.fieldValues).map(([key, value]) => {
        const spec = selectedTemplate.fields.find((field) => field.key === key)
        return [key, spec?.kind === 'number' && value !== '' ? Number(value) : spec?.kind === 'boolean' ? value === 'true' : value]
      })),
    }))
    await window.reviewAPI.createCaseV2({
      caseId,
      templateId: selectedTemplate.templateId,
      version: selectedTemplate.version,
      payload: {
        title: newTitle.trim(),
        fieldValues: Object.fromEntries(Object.entries(fieldValues).map(([key, value]) => {
          const spec = selectedTemplate.fields.find((field) => field.key === key)
          return [key, spec?.kind === 'number' && value !== '' ? Number(value) : spec?.kind === 'boolean' ? value === 'true' : value]
        })),
        subjects,
      },
      actor: localActor,
    })
    const aggregate = await window.reviewAPI.getAggregateV2(caseId)
    store.set(reviewV2AggregateAtom, aggregate ?? null)
    if (aggregate) onCaseOpened?.(caseId)
    await refreshList()
    setNewTitle(''); setFieldValues({}); setSubjectRows([])
    toast.success(`案卷已创建：${caseId}（${selectedTemplate.name}）`)
  }), [selectedTemplate, newTitle, fieldValues, subjectRows, run, store, refreshList, onCaseOpened])
  const seedAndCreate = useCallback(() => run(async () => {
    await window.reviewAPI.seedFixtureV2()
    const caseId = `v2-demo-${Date.now().toString(36)}`
    const result = await window.reviewAPI.createCaseV2({
      caseId,
      templateId: 'comprehensive-assessment-v2',
      version: 2,
      payload: {
        title: '示例审核任务（综合测评）',
        fieldValues: { studentName: '张三', studentId: '20260101', academicYear: '2025-2026', applicant: '张三' },
        subjects: [{ id: 's1', title: '省级竞赛一等奖', type: 'item', fieldValues: { category: 'competition', level: 'national-1', declaredScore: 8, activityDate: '2026-09-01', eventId: 'E1' } }],
      },
      actor: localActor,
    })
    const aggregate = await window.reviewAPI.getAggregateV2(caseId)
    store.set(reviewV2AggregateAtom, aggregate ?? null)
    if (aggregate) onCaseOpened?.(caseId)
    await refreshList()
    if (result) toast.success(`审核任务已创建：${caseId}`)
  }), [run, store, toast, refreshList, onCaseOpened])

  const current = aggregate

  // ===== T05 可信阶段端口（CR-T05-04）=====
  // 渲染层只声明角色；actor、Run 与规则准备度全部由 Main 重核。
  const [localStageRole, setLocalStageRole] = useState<'reviewer' | 'teacher'>('reviewer')
  const [stageCapability, setStageCapability] = useState<{
    mode: 'local-business'; actorLabel: string; actorRole: 'reviewer' | 'teacher'
    eligibleTaskIds: string[]; hasCurrentRun: boolean
  } | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const caseId = current?.caseV2.id
    if (!caseId) { setStageCapability(undefined); return }
    void window.reviewAPI.getT05StageCapability({ caseId, claim: { role: localStageRole } })
      .then((value) => { if (!cancelled) setStageCapability(value) })
      // 技术预审与 CanonicalPlan 案卷按设计不可办理业务阶段：不展示能力，也不伪造
      .catch(() => { if (!cancelled) setStageCapability(undefined) })
    return () => { cancelled = true }
  }, [current?.caseV2.id, current?.caseV2.revision, localStageRole])

  const recordTrustedStageDecision = useCallback(async (input: {
    caseId: string; templateId: string; version: number; expectedRevision: number
    taskId: string; action: string; reason: string
    supplementRequiredElements?: string[]; supplementReason?: string
  }) => {
    try {
      const result = await window.reviewAPI.recordT05StageDecision({
        ...input,
        requestId: `t05-stage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        claim: { role: localStageRole },
      })
      // 写入后重新读取案卷：回执与聚合都以唯一权威状态为准，不用前端拼接
      const refreshed = await window.reviewAPI.getAggregateV2(input.caseId)
      if (!refreshed) return undefined
      store.set(reviewV2AggregateAtom, refreshed)
      const receipt = refreshed.receiptLog.at(-1)
      if (!receipt) return undefined
      return { ok: true as const, receipt, aggregate: refreshed, entity: { ...result } }
    } catch (cause) {
      // 可信 Main 的拒绝原因原样回传，界面不得改写成「已完成」
      return {
        ok: false as const,
        code: 'INVALID_TRANSITION' as const,
        message: cause instanceof Error ? cause.message : String(cause),
      }
    }
  }, [localStageRole, store])


  const [slotId, setSlotId] = useState('')
  const [runNonce, setRunNonce] = useState(0)
  const [latestRun, setLatestRun] = useState<ReviewRunV2 | null>(null)
  const [latestRunStale, setLatestRunStale] = useState(true)
  useEffect(() => {
    const caseId = current?.caseV2.id
    if (!caseId) { setLatestRun(null); setLatestRunStale(true); return }
    let active = true
    void (async () => {
      const runs = await window.reviewAPI.listRunsV2(caseId)
      // 当前 Run 只从持久账本取得，不凭渲染端的运行按钮猜测状态。
      const newest = [...runs].sort((a,b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null
      if (!active) return
      setLatestRun(newest)
      if (!newest || newest.status === 'running' || newest.status === 'queued') { setLatestRunStale(true); return }
      try {
        const stale = await window.reviewAPI.getWorkspaceRunValidityV2({caseId,runId:newest.id})
        if (active) setLatestRunStale(stale)
      } catch {
        if (active) setLatestRunStale(true)
      }
    })().catch(() => { if (active) {setLatestRun(null);setLatestRunStale(true)} })
    return () => { active = false }
  }, [current?.caseV2.id, current?.caseV2.revision, runNonce])
  const refreshCurrentRun = useCallback(async (): Promise<void> => {
    const caseId = current?.caseV2.id
    if (!caseId) return
    const fresh = await window.reviewAPI.getAggregateV2(caseId)
    if (fresh && fresh.caseV2.id === caseId) store.set(reviewV2AggregateAtom, fresh)
    setRunNonce((nonce) => nonce + 1)
  }, [current?.caseV2.id, store])
  const currentTemplate = templates.find((template) => template.templateId === current?.caseV2.templateId && template.version === current?.caseV2.templateVersion)
  // 模板只有一个材料槽时自动选中：普通用户不该先学会「选槽位」才能上传材料
  useEffect(() => {
    const slots = currentTemplate?.materialSlots ?? []
    if (slots.length === 1 && !slotId) setSlotId(slots[0]!.id)
    if (slots.length > 1 && slotId && !slots.some((slot) => slot.id === slotId)) setSlotId('')
  }, [currentTemplate?.materialSlots, slotId])

  const selectTemplate = (templateKey: string): void => {
    const [templateId, versionText] = templateKey.split('@')
    const version = Number(versionText)
    const template = templates.find((candidate) => candidate.templateId === templateId && candidate.version === version && candidate.status === 'published') ?? null
    setSelectedTemplate(template)
    setFieldValues({})
    setSubjectRows(template ? initialSubjectRows(template) : [])
  }

  const updateSubject = (id: string, update: (subject: SubjectDraft) => SubjectDraft): void => {
    setSubjectRows((subjects) => subjects.map((subject) => subject.id === id ? update(subject) : subject))
  }

  const submitCase = useCallback(() => run(async () => {
    if (!current) return
    const result = await window.reviewAPI.submitCaseV2(current.caseV2.id)
    if (result && !result.ok) { toast.error(result.message ?? '提交失败'); return }
    const loaded = await window.reviewAPI.openAggregateV2(current.caseV2.id)
    if (loaded) store.set(reviewV2AggregateAtom, loaded)
    await refreshList()
    toast.success('案卷已提交，进入审核')
  }), [current, run, store, refreshList])

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 pb-8">
      {current ? (
        <>
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-4 shadow-sm">
            <div className="min-w-0 space-y-1">
              <h2 className="truncate text-base font-semibold">{current.caseV2.title}</h2>
              <p className="text-xs text-muted-foreground">
                当前阶段：{current.caseV2.stage} · 有效材料 {current.caseV2.documents.filter(doc => doc.active !== false).length} 份 ·
                已保存 {current.receiptLog.length} 条操作记录
              </p>
              <p className="text-xs text-muted-foreground">
                {current.caseV2.templateId === 'pending-template-v3'
                  ? '审核模板尚未确认'
                  : '审核方案：' + current.caseV2.templateId + ' v' + current.caseV2.templateVersion}
                {latestRun && (latestRunStale ? ' · 旧审核记录已过期' : ' · 有审核记录')}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline"
              onClick={() => void refreshCurrentRun().catch((error) => setNotice(humanizeReviewError(error)))}>
              刷新本案
            </Button>
          </header>

          {step === 'materials' && <div className="space-y-4">
            <section className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
              <div>
                <h3 className="font-semibold">材料与申请事项</h3>
                <p className="text-xs text-muted-foreground">先核对原件，再确认审核模板。补充材料仍登记在这份案卷，不会创建新案。</p>
              </div>
              <ReviewCaseMaterials key={current.caseV2.id} aggregate={current} />
              <Button type="button" size="sm" variant="outline" onClick={() => void run(async () => {
                const result = await window.reviewAPI.importDocument({ caseId: current.caseV2.id, role: 'application' })
                if (result.failures.length > 0) setNotice('导入异常：' + result.failures.map(x => x.fileName + '：' + x.message).join('；'))
                if (result.documents.length > 0) await refreshCurrentRun()
              })}>添加申请原件</Button>
              {currentTemplate?.materialSlots.length ? <label className="flex items-center gap-2 text-xs">
                证明材料所属类别
                <select className="max-w-full rounded border bg-background px-2 py-1" value={slotId} onChange={event => setSlotId(event.target.value)}>
                  <option value="">共用或待确认</option>
                  {currentTemplate.materialSlots.map(slot => <option key={slot.id} value={slot.id}>{slot.name}</option>)}
                </select>
              </label> : null}
              <MaterialDropZone caseId={current.caseV2.id} slotId={slotId}
                hasSlots={!!currentTemplate?.materialSlots.length}
                slotLabel={currentTemplate?.materialSlots.find(slot => slot.id === slotId)?.name}
                onRegistered={() => void refreshCurrentRun()} />
              {current.caseV2.stage === 'draft' && !current.d2RuntimePlan && !current.canonicalPlan
                && current.receiptLog[0]?.type === 'CreateNativeWorkspaceCaseV3'
                && <ReviewV3LocalManualItem key={current.caseV2.id} caseId={current.caseV2.id} />}
              {current.caseV2.subjects.length > 0 && <div className="rounded-lg bg-muted/30 p-3">
                <h4 className="mb-1 text-sm font-medium">已登记事项（{current.caseV2.subjects.length}）</h4>
                {current.caseV2.subjects.map(subject => <p className="py-0.5 text-xs" key={subject.id}>
                  {subject.title} · {subject.status}
                </p>)}
              </div>}
            </section>
            {current.caseV2.templateId === 'pending-template-v3' && !current.d2RuntimePlan && !current.canonicalPlan
              && <ReviewV3TemplateRoutingAssistant key={current.caseV2.id} caseId={current.caseV2.id}
                onPlanInstalled={() => { void refreshCurrentRun() }}
                onTemplateBound={() => { void refreshCurrentRun() }} />}
            {(current.caseV2.stage === 'draft' || (current.caseV2.stage === 'submitted' && current.tasks.length === 0))
              && !current.d2RuntimePlan && !current.canonicalPlan && current.caseV2.templateId !== 'pending-template-v3' &&
              <Button size="sm" onClick={submitCase}>
                {current.caseV2.stage === 'draft' ? '提交案卷' : '恢复审核任务'}
              </Button>}
            <div className="flex justify-end">
              <Button onClick={() => onStepChange?.('review')}>继续：执行审核</Button>
            </div>
          </div>}

          {step === 'review' && <div className="space-y-4">
            <section className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
              <h3 className="font-semibold">执行与结果</h3>
              <ReviewV3UnifiedRun key={current.caseV2.id}
                caseId={current.caseV2.id} stage={current.caseV2.stage}
                documentCount={current.caseV2.documents.filter(doc => doc.active !== false).length}
                technicalPlan={!!current.d2RuntimePlan} onUpdated={refreshCurrentRun}
                canRun={current.caseV2.templateId !== 'pending-template-v3'} />
              <RunResultPanel caseId={current.caseV2.id} refreshNonce={runNonce} showActions={false} />
              <ObservationConfirmPanel caseId={current.caseV2.id}
                aggregate={current} onResult={applyResult} refreshNonce={runNonce} />
            </section>
            <ReviewV3T02CoverageSection caseId={current.caseV2.id} />
            {workspaceAggregate?.caseV2.id === current.caseV2.id && <ReviewV3T03FactWorkbench />}
            <div className="flex justify-end"><Button onClick={() => onStepChange?.('decision')}>继续：处理审核结果</Button></div>
          </div>}

          {step === 'decision' && <div className="space-y-4">
            <section className="space-y-4 rounded-xl bg-card p-4 shadow-sm">
              <h3 className="font-semibold">待办与人工办理</h3>
              <p className="text-xs text-muted-foreground">先确认审核发现和证据，再办理阶段决定、补件或申诉。AI 运行完成不等于人工审批通过。</p>
              <ReviewV3T05HumanWorkflow key={current.caseV2.id}
                aggregate={current} onResult={applyResult} stageCapability={stageCapability}
                recordTrustedStageDecision={recordTrustedStageDecision}
                submitAppeal={input => window.reviewAPI.submitLocalF13Appeal(input)}
                reviewAppeal={input => window.reviewAPI.reviewLocalF13Appeal(input)}
                withdrawAppeal={input => window.reviewAPI.withdrawLocalF13Appeal(input)} />
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer text-sm font-medium">逐条检查与旧式人工处置</summary>
                <ReviewV3T05RunDecision aggregate={current} onResult={applyResult} />
              </details>
            </section>
            <div className="flex justify-end"><Button onClick={() => onStepChange?.('report')}>查看报告与记录</Button></div>
          </div>}

          {step === 'report' && <div className="space-y-4">
            <section className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
              <h3 className="font-semibold">报告与交付</h3>
              {latestRun
                ? <ReviewV3T08ReportPanel aggregate={current} currentRun={latestRun} currentStale={latestRunStale} template={currentTemplate ?? null} />
                : <p className="text-sm text-muted-foreground">尚无可供生成报告的真实运行。请先完成审核。</p>}
            </section>
            <section className="space-y-2 rounded-xl bg-card p-4 shadow-sm">
              <h3 className="font-semibold">操作和决定历史</h3>
              <CaseTimelinePanel caseId={current.caseV2.id} refreshNonce={runNonce} />
            </section>
          </div>}
        </>
      ) : <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        当前没有打开案卷。请从首页导入材料或选择历史案卷。
      </p>}

      {step === 'advanced' && <div className="space-y-4">
        {current && <>
          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-2 font-semibold">高级处理与离线任务</h3>
            <ReviewV3T09OfflineSection />
            <ReviewAssignmentCard caseId={current.caseV2.id} />
            <details className="rounded-lg border p-3 text-xs">
              <summary className="cursor-pointer font-medium">仅运行模板规则</summary>
              <ReviewV3TemplateRuleRun caseId={current.caseV2.id} />
            </details>
          </section>
          <Button size="sm" variant="outline"
            onClick={() => setWorkspaceSection('local-candidates')}>打开候选方案与技术试跑</Button>
        </>}
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h3 className="mb-2 font-semibold">从已发布模板创建案卷 / 查看完整案卷列表</h3>
      <details open={!current} className="mb-3 rounded-md border border-border/60 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium">打开其他案卷 / 从已发布模板新建</summary>
        <div className="mt-3">
      <div className="mb-2 space-y-1.5 rounded-lg border-t pt-2">
        <p className="text-xs font-medium text-muted-foreground">从模板新建审核任务</p>
        <select className="w-full rounded-md border bg-background px-2 py-1 text-xs" value={selectedTemplate ? `${selectedTemplate.templateId}@${selectedTemplate.version}` : ''} onChange={(event) => selectTemplate(event.target.value)}>
          <option value="">选择已发布模板…</option>
          {publishedTemplates.map((template) => (
            <option key={`${template.templateId}@${template.version}`} value={`${template.templateId}@${template.version}`}>{template.name} v{template.version}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">当前有 {publishedTemplates.length} 套已发布模板可创建案卷；草稿和参考范本需先在模板库配置并发布。</p>
        {selectedTemplate && (
          <>
            <input className="w-full rounded-md border bg-background px-2 py-1 text-xs" placeholder="案卷标题" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
            {selectedTemplate.fields.filter((field) => (field.scope ?? 'subject') === 'case').map((field) => (
              <div key={field.key} className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 truncate text-xs">{field.label}{field.required ? ' *' : ''}</span>
                {renderTemplateFieldInput(field, fieldValues[field.key] ?? '', (value) => setFieldValues({ ...fieldValues, [field.key]: value }))}
              </div>
            ))}
            {(selectedTemplate.sections ?? []).map((section) => {
              const rows = subjectRows.filter((subject) => subject.sectionId === section.id)
              const specs = selectedTemplate.fields.filter((field) => (field.scope ?? 'subject') === 'subject' && (!field.sectionId || field.sectionId === section.id))
              return (
                <div key={section.id} className="space-y-2 rounded-lg border bg-muted/20 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium">{section.order + 1}. {section.name}{section.required ? ' · 必需分项' : ''}</p>
                      {section.description && <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSubjectRows((current) => [...current, { id: subjectId(section.id), title: '', sectionId: section.id, fieldValues: {} }])}>添加事项</Button>
                  </div>
                  {section.criteria.length > 0 && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">本分项审核标准（{section.criteria.length}）</summary><ol className="mt-1 list-decimal space-y-1 pl-5">{section.criteria.map((criterion) => <li key={criterion.id}><span className="font-medium">{criterion.title}</span>：{criterion.requirement}</li>)}</ol></details>}
                  {rows.length === 0 && <p className="rounded bg-background px-2 py-2 text-xs text-muted-foreground">此分项暂未添加申报事项{section.required ? '（创建案卷前需要添加）' : ''}。</p>}
                  {rows.map((subject) => (
                    <div key={subject.id} className="space-y-1.5 rounded-md bg-background p-2">
                      <div className="flex items-center gap-2">
                        <input className="flex-1 rounded border px-2 py-1 text-xs" placeholder="申报事项名称" value={subject.title} onChange={(event) => updateSubject(subject.id, (current) => ({ ...current, title: event.target.value }))} />
                        <Button size="sm" variant="ghost" onClick={() => setSubjectRows((current) => current.filter((item) => item.id !== subject.id))}>删除事项</Button>
                      </div>
                      {specs.map((field) => (
                        <div key={field.key} className="flex items-center gap-2">
                          <span className="w-28 shrink-0 truncate text-xs">{field.label}{field.required ? ' *' : ''}</span>
                          {renderTemplateFieldInput(field, subject.fieldValues[field.key] ?? '', (value) => updateSubject(subject.id, (current) => ({ ...current, fieldValues: { ...current.fieldValues, [field.key]: value } })))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            })}
            {(selectedTemplate.sections ?? []).length === 0 && selectedTemplate.fields.some((field) => (field.scope ?? 'subject') === 'subject') && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-2">
                <p className="text-xs font-medium">申报事项</p>
                {subjectRows.map((subject) => (
                  <div key={subject.id} className="space-y-1.5 rounded-md bg-background p-2">
                    <div className="flex items-center gap-2"><input className="flex-1 rounded border px-2 py-1 text-xs" placeholder="事项名称" value={subject.title} onChange={(event) => updateSubject(subject.id, (current) => ({ ...current, title: event.target.value }))} /><Button size="sm" variant="ghost" onClick={() => setSubjectRows((current) => current.filter((item) => item.id !== subject.id))}>删除</Button></div>
                    {selectedTemplate.fields.filter((field) => (field.scope ?? 'subject') === 'subject').map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 text-xs">{field.label}{field.required ? ' *' : ''}</span>
                        {renderTemplateFieldInput(field, subject.fieldValues[field.key] ?? '', (value) => updateSubject(subject.id, (current) => ({ ...current, fieldValues: { ...current.fieldValues, [field.key]: value } })))}
                      </div>
                    ))}
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setSubjectRows((current) => [...current, { id: subjectId(), title: '', fieldValues: {} }])}>添加事项</Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">保存后可在案卷材料区分别选择共用材料或分项材料槽；整份案卷只需启动一次审核。</p>
            <Button size="sm" disabled={!newTitle.trim() || store.get(reviewV2BusyAtom)} onClick={() => void createFromTemplate()}>创建一份案卷</Button>
          </>
        )}
      </div>
      {caseList.length > 0 && (
        <div className="mb-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">已保存案卷（重启可恢复）</p>
          {caseList.map((entry: CaseListEntry) => (
            <div key={entry.caseId} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <span className="truncate text-xs">{entry.title} · {entry.stage}</span>
              <Button size="sm" variant="outline" onClick={() => void openCase(entry.caseId)}>打开</Button>
            </div>
          ))}
        </div>
      )}
        </div>
      </details>

          {!current && <Button size="sm" variant="outline" onClick={seedAndCreate}>载入示例并创建审核任务</Button>}
        </section>
      </div>}
    </div>
  )
}
