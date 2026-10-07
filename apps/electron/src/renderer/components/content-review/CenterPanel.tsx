/**
 * CenterPanel — 中栏「申请与证明」
 *
 * 结构：
 * - 头部：栏目名 + 条目统计（N 条 / M 份证明）
 * - 申报事项区：开始审核时自动识别 → 条目卡列表
 *   每张条目卡：标题 / 类别 badge / 申报分数 / 日期 / 组织方 + 关联证据缩略名 + 该条 findings 的红/黄圆点
 *   + 卡下方直接渲染该条目的申报原文行（SourceBlockView dense）
 *   点击条目卡 → 写 reviewFocusAtom 定位其申报行（severity 取该条最高严重度）
 * - 证明区：每份证据一张卡（文件名 + recognizedFacts + parseStatus badge + 关联条目名）。
 *   按 T6 简化决定（决策日志 #16）：不渲染 SVG 原图，以识别事实与状态徽标为准。
 */

import * as React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Award, Layers, Link2, Unlink2 } from 'lucide-react'
import type {
  CaseAggregateV2,
  EvidenceDocument,
  EvidenceParseStatus,
  FindingSeverity,
  ReviewFinding,
  ReviewItem,
  FieldValue,
  TemplateVersion,
} from '@profer/shared'
import {
  currentEvidencesAtom,
  currentItemsAtom,
  documentsByRoleAtom,
  findBlockByAnchor,
  reviewRunAtom,
  reviewCaseAtom,
  reviewWorkspaceAggregateAtom,
  reviewWorkspaceExtractedObservationsAtom,
  reviewWorkspaceRunStaleAtom,
  reviewWorkspaceRunAtom,
  reviewWorkspaceTemplateAtom,
  reviewAdjudicationEditorSubjectAtom,
} from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import type { ReviewActions } from './use-review-actions'
import { SourceBlockView } from './SourceBlockView'
import { useReviewWorkspaceActions } from './use-review-workspace-actions'

/** 证明识别状态 → 徽标样式/文案 */
const EVIDENCE_STATUS: Record<EvidenceParseStatus, { label: string; className: string }> = {
  recognized: { label: '已识别', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  unclear: { label: '看不清', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  unrecognized: { label: '未提取事实', className: 'bg-muted text-muted-foreground' },
}

interface CenterPanelProps {
  actions: ReviewActions
}

export function CenterPanel({ actions }: CenterPanelProps): React.ReactElement {
  const items = useAtomValue(currentItemsAtom)
  const evidences = useAtomValue(currentEvidencesAtom)
  const documentsByRole = useAtomValue(documentsByRoleAtom)
  const run = useAtomValue(reviewRunAtom)
  const reviewCase = useAtomValue(reviewCaseAtom)
  const aggregate = useAtomValue(reviewWorkspaceAggregateAtom)
  const extractedObservations = useAtomValue(reviewWorkspaceExtractedObservationsAtom)
  const workspaceRunStale = useAtomValue(reviewWorkspaceRunStaleAtom)
  const workspaceRun = useAtomValue(reviewWorkspaceRunAtom)
  const workspaceTemplate = useAtomValue(reviewWorkspaceTemplateAtom)
  const workspaceActions = useReviewWorkspaceActions()

  const renderedBlockIds = new Set(items.map((item) => item.anchor.blockId))

  /** 按条目聚合 findings（联动圆点 + 最高严重度用） */
  const findingsByItemId = React.useMemo(() => {
    const map = new Map<string, ReviewFinding[]>()
    if (!run) return map
    for (const finding of run.findings) {
      const list = map.get(finding.itemId)
      if (list) list.push(finding)
      else map.set(finding.itemId, [finding])
    }
    return map
  }, [run])

  /** 点击条目卡：写 focus 定位申报行（severity 取该条最高严重度；无发现时按黄=待确认处理） */
  const handleItemClick = (item: ReviewItem): void => {
    const itemFindings = findingsByItemId.get(item.id) ?? []
    const severity: FindingSeverity = itemFindings.some((f) => f.severity === 'red') ? 'red' : 'yellow'
    actions.focusFinding({
      id: `item-focus-${item.id}`,
      itemId: item.id,
      kind: 'info-incomplete',
      severity,
      title: item.title,
      detail: '',
      suggestion: 'manual-review',
      suggestionText: '',
      subjectAnchor: item.anchor,
      ruleAnchors: [],
      ruleItemIds: [],
      generatedBy: 'fixture',
    }, { select: false })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 头部：栏目名 + 统计 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-primary" />
          <h2 className="text-[13px] font-semibold text-foreground">申请与证明</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} 条 / {evidences.length} 份证明
        </p>
      </header>

      {/* 申报事项（开始审核时自动识别） */}
      <section className="shrink-0 px-3 py-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            申报事项
          </p>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            导入待审材料后，系统会在开始审核时自动识别申报事项。
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const itemFindings = findingsByItemId.get(item.id) ?? []
              const evidenceNames = item.evidenceDocumentIds
                .map((documentId) => documentsByRole.evidence.find((doc) => doc.id === documentId)?.fileName)
                .filter((name): name is string => Boolean(name))
              const itemBlock = findBlockByAnchor(documentsByRole.application, item.anchor)

              return (
                <div key={item.id} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                  {/* 条目卡主体（整卡可点击定位） */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full flex-col gap-1.5 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-foreground/[0.03] focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    title="定位到申报原文行"
                  >
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                        {item.title}
                      </span>
                      {/* 该条 findings 的红/黄小圆点 */}
                      {itemFindings.map((finding) => (
                        <span
                          key={finding.id}
                          title={finding.title}
                          className={cn(
                            'size-2 shrink-0 rounded-full',
                            finding.severity === 'red' ? 'bg-red-500' : 'bg-amber-400',
                          )}
                        />
                      ))}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-600 dark:text-blue-400">
                        {item.category}
                      </span>
                      <span className="tabular-nums">申报 {item.declaredScore} 分</span>
                      {item.activityDate && <span className="tabular-nums">{item.activityDate}</span>}
                      {item.organizer && <span className="truncate">{item.organizer}</span>}
                    </span>
                    {evidenceNames.length > 0 && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        关联证明：{evidenceNames.join('、')}
                      </span>
                    )}
                  </button>

                  {/* 该条目的申报原文行（联动高亮落点） */}
                  {itemBlock && (
                    <div className="mt-1.5 rounded-md bg-muted/40 p-1">
                      <SourceBlockView document={itemBlock.document} block={itemBlock.block} dense />
                    </div>
                  )}
                  {aggregate && (
                    <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
                      {[...aggregate.observations.filter((observation) => observation.subjectId === item.id).map((observation) => observation as unknown as Record<string, unknown>), ...extractedObservations.filter((observation) => observation.subjectId === item.id)]
                        .reduce<Array<Record<string, unknown>>>((list, observation) => {
                          const fieldKey = String(observation.fieldKey ?? '')
                          const existingIndex = list.findIndex((candidate) => candidate.fieldKey === fieldKey)
                          if (existingIndex >= 0 && observation.extractedBy !== 'user') return list
                          if (existingIndex >= 0) list[existingIndex] = observation
                          else list.push(observation)
                          return list
                        }, [])
                        .map((observation, index) => (
                          <WorkspaceObservationCard
                            key={`${String(observation.fieldKey)}-${String(observation.createdAt ?? index)}`}
                            observation={observation}
                            aggregate={aggregate}
                            onConfirm={(value, reason) => workspaceActions.confirmObservation(observation, value, reason)}
                          />
                        ))}
                      <ManualFactEntry
                        subjectId={item.id}
                        subjectTitle={item.title}
                        aggregate={aggregate}
                        onSave={(fieldKey, value, sourceVersionId, reason) => workspaceActions.confirmObservation({ subjectId: item.id, fieldKey, value, sourceRefs: sourceVersionId ? [{ documentVersionId: sourceVersionId }] : [] }, value, reason)}
                      />
                    </div>
                  )}
                  {aggregate?.caseV2.subjects.find((subject) => subject.id === item.id) && (
                    <SubjectAdjudicationCard
                      aggregate={aggregate}
                      subject={aggregate.caseV2.subjects.find((subject) => subject.id === item.id)!}
                      template={workspaceTemplate}
                      canEdit={!!workspaceRun && !workspaceRunStale}
                      actions={workspaceActions}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 未被条目卡引用的原文仍可见：识别失败与漏项不能使待审文件从界面消失。 */}
      {documentsByRole.application.map((document) => {
        const blocks = document.blocks.filter((block) => !renderedBlockIds.has(block.id))
        if (blocks.length === 0 && !document.parseError) return null
        return (
          <section key={document.id} className="shrink-0 px-3 pb-3">
            <p className="mb-2 text-xs font-medium">待审原文 · {document.fileName}</p>
            <div className="rounded-lg bg-muted/40 p-2">
              {blocks.map((block) => (
                <SourceBlockView key={block.id} document={document} block={block} dense />
              ))}
              {document.parseError && <p className="text-xs text-amber-600">{document.parseError}</p>}
            </div>
          </section>
        )
      })}

      {/* 证明区 */}
      <section className="shrink-0 px-3 pb-4">
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          证明材料
        </p>
        <div className="grid grid-cols-1 gap-2">
          {evidences.map((evidence) => {
            const document = documentsByRole.evidence.find((doc) => doc.id === evidence.documentId)
            const linkedItemTitles = items
              .filter((item) => item.evidenceDocumentIds.includes(evidence.documentId))
              .map((item) => item.title)
            return (
              <div key={evidence.documentId}>
                <EvidenceCard
                  evidence={evidence}
                  fileName={document?.fileName ?? evidence.documentId}
                  linkedItemTitles={linkedItemTitles}
                />
                {aggregate && document && (
                  <EvidenceLinkControls
                    aggregate={aggregate}
                    documentVersionId={`${document.id}-v1`}
                    actions={workspaceActions}
                  />
                )}
                {document && (
                  <div className="mt-1 rounded-lg bg-muted/40 p-2">
                    {document.blocks.map((block) => (
                      <SourceBlockView key={block.id} document={document} block={block} dense />
                    ))}
                    {document.parseError && <p className="text-xs text-amber-600">{document.parseError}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
      {workspaceRunStale && (
        <p className="mx-3 mb-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          人工事实或证明关联已修改，当前审核结果已过期；请重新审核后再形成决定。
        </p>
      )}
    </div>
  )
}

function SubjectAdjudicationCard({
  aggregate,
  subject,
  template,
  canEdit,
  actions,
}: {
  aggregate: CaseAggregateV2
  subject: CaseAggregateV2['caseV2']['subjects'][number]
  template: TemplateVersion | null
  canEdit: boolean
  actions: ReturnType<typeof useReviewWorkspaceActions>
}): React.ReactElement {
  const rootRef = React.useRef<HTMLElement>(null)
  const editorSubject = useAtomValue(reviewAdjudicationEditorSubjectAtom)
  const setEditorSubject = useSetAtom(reviewAdjudicationEditorSubjectAtom)
  const records = aggregate.adjudications ?? []
  const supersededIds = new Set(records.flatMap((record) => record.supersedesAdjudicationId ? [record.supersedesAdjudicationId] : []))
  const current = records.filter((record) => record.subjectId === subject.id && !supersededIds.has(record.id)).sort((a, b) => a.at.localeCompare(b.at)).at(-1)
  const [editing, setEditing] = React.useState(false)
  const [reason, setReason] = React.useState('')
  const [values, setValues] = React.useState<Record<string, string>>(() => initialSubjectValues(subject.fields, current?.finalFields))
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const specs = editableSubjectFields(subject.fields, template)

  React.useEffect(() => {
    if (editorSubject !== subject.id) return
    setValues(initialSubjectValues(subject.fields, current?.finalFields))
    setReason('')
    setEditing(true)
    setEditorSubject(null)
    requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [editorSubject, subject.id, subject.fields, current?.id, current?.finalFields, setEditorSubject])

  const submit = async (outcome: 'accepted' | 'rejected' | 'modified', finalFields?: Record<string, FieldValue>, why?: string): Promise<void> => {
    if (!canEdit || busy) return
    const explanation = why ?? window.prompt('填写本事项最终认定理由', outcome === 'accepted' ? '核对材料后确认申报事项' : '依据当前材料不予认定')
    if (!explanation?.trim()) return
    setBusy(true)
    setError(null)
    try {
      await actions.adjudicateSubject({ subjectId: subject.id, outcome, finalFields, reason: explanation.trim() })
      setEditing(false)
      setReason('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const saveModified = async (): Promise<void> => {
    if (!reason.trim()) { setError('请填写修改认定理由'); return }
    const finalFields: Record<string, FieldValue> = {}
    for (const field of specs) {
      const value = values[field.key]
      if (value === undefined) continue
      const previous = current?.finalFields?.[field.key] ?? subject.fields[field.key]
      const converted = parseFieldValue(field.kind, value, previous)
      if (converted) finalFields[field.key] = converted
    }
    if (!Object.keys(finalFields).length) { setError('当前模板没有可编辑的最终认定字段'); return }
    await submit('modified', finalFields, reason)
  }

  return (
    <section ref={rootRef} className="mt-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold">最终认定</p>
        {current ? <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-700 dark:text-green-400">{current.outcome === 'accepted' ? '认可' : current.outcome === 'modified' ? '已修改' : '不予认定'}</span> : <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-400">待处理</span>}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">申报：{displaySubjectFields(subject.fields, template)}</p>
      {current?.outcome === 'accepted' && <p className="mt-1 text-[11px]">认定：与申报内容一致</p>}
      {current?.outcome === 'rejected' && <p className="mt-1 text-[11px] text-destructive">认定：不予认定（最终分值 0）</p>}
      {current?.outcome === 'modified' && current.finalFields && <p className="mt-1 text-[11px]">认定：{displaySubjectFields(current.finalFields, template)}</p>}
      {current && <p className="mt-1 text-[10px] text-muted-foreground">理由：{current.reason}</p>}
      {!editing ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" disabled={!canEdit || busy} onClick={() => void submit('accepted')} className="rounded border px-2 py-1 text-[11px] disabled:opacity-40">确认认定</button>
          <button type="button" disabled={!canEdit || busy || specs.length === 0} onClick={() => { setValues(initialSubjectValues(subject.fields, current?.finalFields)); setEditing(true); setError(null) }} className="rounded border px-2 py-1 text-[11px] disabled:opacity-40">修改认定</button>
          <button type="button" disabled={!canEdit || busy} onClick={() => void submit('rejected')} className="rounded border border-destructive/40 px-2 py-1 text-[11px] text-destructive disabled:opacity-40">不予认定</button>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {specs.map((field) => <label key={field.key} className="block text-[11px]">{field.label}
            {field.kind === 'enum' && field.options.length > 0 ? <select value={values[field.key] ?? ''} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))} className="mt-1 h-8 w-full rounded border bg-background px-2">{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'} value={values[field.key] ?? ''} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))} className="mt-1 h-8 w-full rounded border bg-background px-2" />}
          </label>)}
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-14 w-full resize-y rounded border bg-background px-2 py-1.5 text-[11px]" placeholder="修改理由（必填）" aria-label="修改认定理由" />
          {error && <p role="alert" className="text-[11px] text-destructive">{error}</p>}
          <div className="flex gap-1.5"><button type="button" disabled={!canEdit || busy || !reason.trim()} onClick={() => void saveModified()} className="rounded bg-primary px-2 py-1 text-[11px] text-primary-foreground disabled:opacity-50">保存认定</button><button type="button" disabled={busy} onClick={() => setEditing(false)} className="rounded border px-2 py-1 text-[11px]">取消</button></div>
        </div>
      )}
    </section>
  )
}

function editableSubjectFields(fields: Record<string, FieldValue>, template: TemplateVersion | null): Array<{ key: string; label: string; kind: FieldValue['kind']; options: Array<{ value: string; label: string }> }> {
  const specs = new Map((template?.fields ?? []).filter((field) => field.scope !== 'case').map((field) => [field.key, field]))
  return Object.entries(fields).flatMap(([key, value]) => {
    const spec = specs.get(key)
    const kind = spec?.kind ?? value.kind
    if (!['text', 'number', 'date', 'enum', 'multi', 'boolean'].includes(kind)) return []
    return [{ key, label: spec?.label ?? key, kind, options: spec?.options ?? [] }]
  })
}

function initialSubjectValues(fields: Record<string, FieldValue>, finalFields?: Record<string, FieldValue>): Record<string, string> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fieldValueText(finalFields?.[key] ?? value)]))
}

function fieldValueText(value: FieldValue): string {
  if ('value' in value) return Array.isArray(value.value) ? value.value.join('、') : String(value.value ?? '')
  return ''
}

function parseFieldValue(kind: FieldValue['kind'], value: string, previous?: FieldValue): FieldValue | undefined {
  if (kind === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? { kind, value: number, ...((previous?.kind === 'number' && previous.unit) ? { unit: previous.unit } : {}) } : undefined
  }
  if (kind === 'multi') return { kind, value: value.split(/[，,、]/).map((item) => item.trim()).filter(Boolean) }
  if (kind === 'boolean') return { kind, value: value === 'true' }
  if (kind === 'date') return { kind, value }
  if (kind === 'enum') return { kind, value }
  return kind === 'text' ? { kind, value } : undefined
}

function displaySubjectFields(fields: Record<string, FieldValue>, template: TemplateVersion | null): string {
  const entries = Object.entries(fields).filter(([, value]) => !['object', 'rows', 'attachment'].includes(value.kind)).slice(0, 4)
  return entries.map(([key, value]) => `${template?.fields.find((field) => field.key === key)?.label ?? key} ${fieldValueText(value)}`).join(' / ') || '暂无可展示字段'
}

function displayValue(raw: unknown): string {
  if (raw && typeof raw === 'object' && 'value' in raw) return String((raw as { value: unknown }).value ?? '')
  return raw == null ? '' : String(raw)
}

function ManualFactEntry({
  subjectId,
  subjectTitle,
  aggregate,
  onSave,
}: {
  subjectId: string
  subjectTitle: string
  aggregate: CaseAggregateV2
  onSave(fieldKey: string, value: string, sourceVersionId: string, reason: string): Promise<void>
}): React.ReactElement {
  const [open, setOpen] = React.useState(false)
  const [fieldKey, setFieldKey] = React.useState('')
  const [value, setValue] = React.useState('')
  const [sourceVersionId, setSourceVersionId] = React.useState(aggregate.caseV2.documents.find((doc) => doc.role === 'evidence')?.versionId ?? '')
  const [reason, setReason] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const save = async (): Promise<void> => {
    if (!fieldKey.trim() || !value.trim() || !reason.trim()) return
    setBusy(true)
    try {
      await onSave(fieldKey.trim(), value.trim(), sourceVersionId, reason.trim())
      setOpen(false); setFieldKey(''); setValue(''); setReason('')
    } catch (error) {
      console.error(`[审核工作台] 手工录入 ${subjectTitle} 事实失败`, error)
    } finally { setBusy(false) }
  }
  return (
    <div className="pt-1">
      {!open ? <button onClick={() => setOpen(true)} className="rounded border px-2 py-1 text-[11px] hover:bg-background">手工录入事实</button> : (
        <div className="space-y-1.5 rounded-lg border bg-background p-2">
          <p className="text-[11px] font-medium">为“{subjectTitle}”添加人工核实事实</p>
          <input value={fieldKey} onChange={(event) => setFieldKey(event.target.value)} className="h-7 w-full rounded border px-2" placeholder="事实字段，如 awardLevel" aria-label="事实字段" />
          <input value={value} onChange={(event) => setValue(event.target.value)} className="h-7 w-full rounded border px-2" placeholder="事实值" aria-label="事实值" />
          <select value={sourceVersionId} onChange={(event) => setSourceVersionId(event.target.value)} className="h-7 w-full rounded border bg-background px-2" aria-label="事实来源材料">
            <option value="">不关联材料来源</option>
            {aggregate.caseV2.documents.map((doc) => <option key={doc.versionId} value={doc.versionId}>{doc.fileName}</option>)}
          </select>
          <input value={reason} onChange={(event) => setReason(event.target.value)} className="h-7 w-full rounded border px-2" placeholder="核实理由（必填）" aria-label="核实理由" />
          <div className="flex gap-1.5">
            <button disabled={busy || !fieldKey.trim() || !value.trim() || !reason.trim()} onClick={() => void save()} className="rounded bg-primary px-2 py-1 text-primary-foreground disabled:opacity-50">保存事实</button>
            <button disabled={busy} onClick={() => setOpen(false)} className="rounded border px-2 py-1">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}

function WorkspaceObservationCard({
  observation,
  aggregate,
  onConfirm,
}: {
  observation: Record<string, unknown>
  aggregate: CaseAggregateV2
  onConfirm(value: unknown, reason: string): Promise<void>
}): React.ReactElement {
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(displayValue(observation.value))
  const [reason, setReason] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const subjectId = String(observation.subjectId ?? '')
  const fieldKey = String(observation.fieldKey ?? '事实')
  const refs = Array.isArray(observation.sourceRefs) ? observation.sourceRefs : []
  const sourceNames = refs.flatMap((raw) => {
    if (!raw || typeof raw !== 'object' || !('documentVersionId' in raw)) return []
    const doc = aggregate.caseV2.documents.find((item) => item.versionId === String((raw as { documentVersionId: unknown }).documentVersionId))
    return doc ? [doc.fileName] : []
  })
  const confirmed = observation.confirmed === true || observation.extractedBy === 'user'
  const run = async (nextValue: unknown, nextReason: string): Promise<void> => {
    setBusy(true)
    try {
      await onConfirm(nextValue, nextReason)
      setEditing(false)
      setReason('')
    } catch (error) {
      console.error('[审核工作台] 保存事实失败', error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="rounded-lg bg-muted/35 px-2.5 py-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">材料事实 · {fieldKey}</span>
        <span className={cn('rounded px-1.5 py-0.5 text-[10px]', confirmed ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400')}>
          {confirmed ? '人工确认' : `待确认${typeof observation.confidence === 'number' ? ` · ${Math.round(observation.confidence * 100)}%` : ''}`}
        </span>
      </div>
      {!editing ? <p className="mt-1 text-foreground">{displayValue(observation.value) || '未识别'}</p> : (
        <div className="mt-1.5 space-y-1.5">
          <input className="h-7 w-full rounded border bg-background px-2" value={value} onChange={(event) => setValue(event.target.value)} aria-label={`${fieldKey} 更正值`} />
          <input className="h-7 w-full rounded border bg-background px-2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="更正理由（必填）" aria-label="更正理由" />
          <div className="flex gap-1.5">
            <button disabled={busy || !reason.trim()} onClick={() => void run(value, reason)} className="rounded bg-primary px-2 py-1 text-primary-foreground disabled:opacity-50">保存更正</button>
            <button disabled={busy} onClick={() => setEditing(false)} className="rounded border px-2 py-1">取消</button>
          </div>
        </div>
      )}
      {sourceNames.length > 0 && <p className="mt-1 text-muted-foreground">来源：{[...new Set(sourceNames)].join('、')}</p>}
      {!confirmed && !editing && (
        <div className="mt-1.5 flex gap-1.5">
          <button disabled={busy} onClick={() => void run(observation.value, '审核员核对原始材料后确认该事实')} className="rounded border px-2 py-1 text-[11px] hover:bg-background disabled:opacity-50">确认无误</button>
          <button disabled={busy} onClick={() => { setValue(displayValue(observation.value)); setEditing(true) }} className="rounded border px-2 py-1 text-[11px] hover:bg-background disabled:opacity-50">更正</button>
        </div>
      )}
    </div>
  )
}

function EvidenceLinkControls({
  aggregate,
  documentVersionId,
  actions,
}: {
  aggregate: CaseAggregateV2
  documentVersionId: string
  actions: ReturnType<typeof useReviewWorkspaceActions>
}): React.ReactElement {
  const [subjectId, setSubjectId] = React.useState(aggregate.caseV2.subjects[0]?.id ?? '')
  const [busy, setBusy] = React.useState(false)
  const links = aggregate.evidenceLinks.filter((link) => link.documentVersionId === documentVersionId)
  const doc = aggregate.caseV2.documents.find((item) => item.versionId === documentVersionId)
  const titles = new Map(aggregate.caseV2.subjects.map((subject) => [subject.id, subject.title]))
  const update = async (input: Parameters<typeof actions.transitionEvidenceLink>[0]): Promise<void> => {
    setBusy(true)
    try { await actions.transitionEvidenceLink(input) } catch (error) { console.error('[审核工作台] 更新证明关联失败', error) } finally { setBusy(false) }
  }
  return (
    <div className="mt-1 rounded-lg border border-border/50 bg-card px-2.5 py-2 text-xs">
      {links.map((link) => (
        <div key={link.id} className="flex items-center justify-between gap-2 py-1">
          <span className="min-w-0 truncate">{titles.get(link.subjectId) ?? link.subjectId} · {link.supportsFact} <span className="text-muted-foreground">({link.status === 'candidate' ? '待确认' : link.status === 'confirmed' ? '已确认' : '已取消'})</span></span>
          {link.status !== 'rejected' && <button disabled={busy} title={link.status === 'candidate' ? '确认关联' : '取消关联'} onClick={() => void update({ id: link.id, documentVersionId, subjectId: link.subjectId, supportsFact: link.supportsFact, status: link.status === 'candidate' ? 'confirmed' : 'rejected' })} className="shrink-0 rounded border p-1 hover:bg-muted disabled:opacity-50">{link.status === 'candidate' ? <Link2 size={13} /> : <Unlink2 size={13} />}</button>}
        </div>
      ))}
      <div className="mt-1 flex gap-1.5">
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="min-w-0 flex-1 rounded border bg-background px-1.5 py-1" aria-label="关联到申报事项">
          {aggregate.caseV2.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
        </select>
        <button disabled={busy || !subjectId || !doc} onClick={() => void update({ documentVersionId, subjectId, supportsFact: doc?.fileName ?? '人工关联证明', status: 'confirmed' })} className="inline-flex shrink-0 items-center gap-1 rounded border px-2 py-1 hover:bg-muted disabled:opacity-50"><Link2 size={12} />添加证明</button>
      </div>
    </div>
  )
}

interface EvidenceCardProps {
  evidence: EvidenceDocument
  fileName: string
  linkedItemTitles: string[]
}

/** 证明卡：文件名 + 识别事实 + 状态徽标 + 关联条目（按 T6 简化：不渲染原图） */
function EvidenceCard({ evidence, fileName, linkedItemTitles }: EvidenceCardProps): React.ReactElement {
  const status = EVIDENCE_STATUS[evidence.parseStatus]

  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
      {/* 证书占位图标（无原图渲染：以识别事实为准） */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-500 shadow-sm">
        <Award size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground" title={fileName}>
            {fileName}
          </span>
          <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium', status.className)}>
            {status.label}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{evidence.recognizedFacts}</p>
        {linkedItemTitles.length > 0 && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            关联条目：{linkedItemTitles.join('、')}
          </p>
        )}
      </div>
    </div>
  )
}
