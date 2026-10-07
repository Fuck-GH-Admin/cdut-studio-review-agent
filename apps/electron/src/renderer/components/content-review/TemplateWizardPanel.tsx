/** 审核模板库与编辑器：案卷字段、材料槽、综测分项、审核标准与流程均可在界面配置。 */

import { useCallback, useEffect, useState } from 'react'
import type { FieldSpec, MaterialSlotSpec, TemplateCriterionSpec, TemplateSectionSpec, TemplateVersion, WorkflowStageSpec } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'
import { useSetAtom } from 'jotai'
import { templatesRefreshAtom, reviewV2BusyAtom } from './V2CasePanel'
import { useStore } from 'jotai'

type EditableFieldKind = 'text' | 'number' | 'date' | 'boolean' | 'enum'
const FIELD_KINDS: Array<{ value: EditableFieldKind; label: string }> = [
  { value: 'text', label: '文本' }, { value: 'number', label: '数字' }, { value: 'date', label: '日期' },
  { value: 'boolean', label: '是/否' }, { value: 'enum', label: '单选' },
]
const STAGE_KINDS: Array<{ value: WorkflowStageSpec['kind']; label: string }> = [
  { value: 'auto-check', label: '自动核对' }, { value: 'manual-review', label: '人工审核' },
  { value: 'independent-rating', label: '独立评分' }, { value: 'supplement-wait', label: '等待补件' },
  { value: 'summary', label: '汇总' }, { value: 'finalize', label: '定稿' }, { value: 'handoff', label: '交接' },
]
const ROLE_OPTIONS: Array<{ value: WorkflowStageSpec['executorRole']; label: string }> = [
  { value: 'system', label: '系统/Agent' }, { value: 'reviewer', label: '审核员' }, { value: 'teacher', label: '教师' },
  { value: 'judge', label: '评委' }, { value: 'organizer', label: '负责人' },
]

function generatedId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function newStage(name: string, kind: WorkflowStageSpec['kind'], role: WorkflowStageSpec['executorRole']): WorkflowStageSpec {
  return { id: generatedId('stage'), name, kind, executorRole: role }
}

function newTemplate(kind: 'blank' | 'comprehensive'): TemplateVersion {
  const isComprehensive = kind === 'comprehensive'
  const sections: TemplateSectionSpec[] = isComprehensive
    ? ['综测分项一', '综测分项二', '综测分项三'].map((name, index) => ({
      id: `section-${index + 1}`, name, description: '请按本单位、本年度实际综测要求修改分项名称和审核标准。', order: index, required: true, criteria: [],
    }))
    : []
  const fields: FieldSpec[] = isComprehensive
    ? [
      { key: 'studentName', label: '学生姓名', kind: 'text', required: true, visibility: 'public', scope: 'case' },
      { key: 'studentId', label: '学号', kind: 'text', required: true, visibility: 'public', scope: 'case' },
      { key: 'academicYear', label: '综测学年', kind: 'text', required: true, visibility: 'public', scope: 'case' },
      { key: 'category', label: '申报类别', kind: 'text', required: false, visibility: 'public', scope: 'subject' },
      { key: 'level', label: '申报等级', kind: 'text', required: false, visibility: 'public', scope: 'subject' },
      { key: 'declaredScore', label: '申报分数', kind: 'number', required: false, visibility: 'public', scope: 'subject' },
    ]
    : [{ key: 'applicantName', label: '申请人', kind: 'text', required: true, visibility: 'public', scope: 'case' }]
  const slots: MaterialSlotSpec[] = isComprehensive
    ? [
      { id: 'application-form', name: '综测申报汇总表', purpose: '读取本次综测申报信息', requiredElements: ['姓名', '学号', '申报事项'], acceptedKinds: ['pdf', 'image', 'office', 'sheet', 'text'], minCount: 1, maxCount: 10, requiredAt: 'submission', allowReuseAcrossSubjects: true },
      ...sections.map((section) => ({ id: `${section.id}-proof`, name: `${section.name}证明材料`, purpose: `核对${section.name}的申报事项`, requiredElements: ['申报事项', '证明内容'], acceptedKinds: ['pdf', 'image', 'office', 'sheet', 'text'] as MaterialSlotSpec['acceptedKinds'], minCount: 1, maxCount: 20, requiredAt: 'submission' as const, allowReuseAcrossSubjects: false, sectionId: section.id })),
    ]
    : [{ id: 'main-document', name: '主要材料', purpose: '本次申请依据材料', requiredElements: [], acceptedKinds: ['pdf', 'image', 'office', 'sheet', 'text'], minCount: 1, maxCount: 10, requiredAt: 'submission', allowReuseAcrossSubjects: false }]
  const stages = [
    newStage('材料与标准核对', 'auto-check', 'system'),
    newStage('初审', 'manual-review', 'reviewer'),
    newStage('终审', 'manual-review', 'teacher'),
  ]
  return {
    templateId: `review-${generatedId(isComprehensive ? 'comprehensive' : 'template')}`,
    version: 1, schemaVersion: 2, name: isComprehensive ? '学生综合测评（待配置）' : '新审核模板',
    objectType: 'person', displayName: { template: isComprehensive ? '{{studentName}}' : '{{applicantName}}' },
    fields, materialSlots: slots, ...(sections.length > 0 ? { sections } : {}),
    policyVersionIds: [], stages, outputs: [{ id: 'approval', kind: 'approval', audience: 'teacher' }],
    status: 'draft', createdAt: new Date().toISOString(),
  }
}

function nextDraft(source: TemplateVersion, version: number): TemplateVersion {
  const { publishedAt: _publishedAt, ...base } = source
  return { ...base, version, status: 'draft', createdAt: new Date().toISOString() }
}

function reordered<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  return next
}

function normalizeOrder(sections: TemplateSectionSpec[]): TemplateSectionSpec[] {
  return sections.map((section, order) => ({ ...section, order }))
}

function validateEditor(template: TemplateVersion): string[] {
  const issues: string[] = []
  if (!template.name.trim()) issues.push('请填写模板名称')
  const keys = template.fields.map((field) => field.key.trim())
  if (keys.some((key) => !key)) issues.push('字段编号不能为空')
  if (new Set(keys).size !== keys.length) issues.push('字段编号不能重复')
  if (template.sections?.some((section) => !section.id.trim() || !section.name.trim())) issues.push('每个分项都需要编号和名称')
  if (template.sections?.some((section) => section.required && section.criteria.length === 0)) issues.push('每个必需分项至少需要一条审核标准')
  if (template.sections?.some((section) => section.criteria.some((criterion) => !criterion.title.trim() || !criterion.requirement.trim()))) issues.push('审核标准的名称和具体要求不能为空')
  if (template.materialSlots.some((slot) => !slot.id.trim() || !slot.name.trim())) issues.push('材料槽编号和名称不能为空')
  if (template.stages.length === 0) issues.push('至少保留一个审核流程节点')
  return issues
}

function linkedStages(stages: WorkflowStageSpec[]): WorkflowStageSpec[] {
  return stages.map((stage, index) => ({ ...stage, nextStageId: stages[index + 1]?.id }))
}

export function TemplateWizardPanel(): JSX.Element {
  const bumpTemplatesRefresh = useSetAtom(templatesRefreshAtom)
  const store = useStore()
  const [templates, setTemplates] = useState<TemplateVersion[]>([])
  const [editing, setEditing] = useState<TemplateVersion | null>(null)
  const [message, setMessage] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const refreshTemplates = useCallback(async (): Promise<void> => {
    try { setTemplates(await window.reviewAPI.listTemplateVersionsV2()) }
    catch (error) { toast.error(`模板列表加载失败：${error instanceof Error ? error.message : String(error)}`) }
  }, [])
  useEffect(() => { void refreshTemplates() }, [refreshTemplates])

  const startNew = (kind: 'blank' | 'comprehensive'): void => {
    setEditing(newTemplate(kind))
    setMessage([])
  }

  const openTemplate = (template: TemplateVersion): void => {
    const nextVersion = Math.max(0, ...templates.filter((candidate) => candidate.templateId === template.templateId).map((candidate) => candidate.version)) + 1
    setEditing(template.status === 'draft' ? template : nextDraft(template, nextVersion))
    setMessage([])
  }

  const updateTemplate = (update: (current: TemplateVersion) => TemplateVersion): void => {
    setEditing((current) => current ? update(current) : current)
    setMessage([])
  }

  const saveDraft = async (): Promise<TemplateVersion | null> => {
    if (!editing) return null
    const problems = validateEditor(editing)
    if (problems.some((problem) => problem !== '每个必需分项至少需要一条审核标准')) {
      setMessage(problems)
      return null
    }
    setLoading(true)
    store.set(reviewV2BusyAtom, true)
    try {
      const saved = await window.reviewAPI.saveTemplateDraftV2({ ...editing, stages: linkedStages(editing.stages) })
      setEditing(saved)
      await refreshTemplates()
      bumpTemplatesRefresh(Date.now())
      toast.success(`草稿已保存：${saved.name} v${saved.version}`)
      return saved
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setMessage([errorMessage])
      toast.error(`保存失败：${errorMessage}`)
      return null
    } finally {
      store.set(reviewV2BusyAtom, false)
      setLoading(false)
    }
  }

  const publish = async (): Promise<void> => {
    if (!editing) return
    const problems = validateEditor(editing)
    if (problems.length > 0) { setMessage(problems); return }
    setLoading(true)
    store.set(reviewV2BusyAtom, true)
    try {
      await window.reviewAPI.saveTemplateDraftV2({ ...editing, stages: linkedStages(editing.stages) })
      const published = await window.reviewAPI.publishTemplateV2(editing.templateId, editing.version)
      setEditing(null)
      setMessage([])
      await refreshTemplates()
      bumpTemplatesRefresh(Date.now())
      toast.success(`模板已发布：${published.name} v${published.version}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setMessage([errorMessage])
      toast.error(`发布失败：${errorMessage}`)
    } finally {
      store.set(reviewV2BusyAtom, false)
      setLoading(false)
    }
  }

  const moveSection = (index: number, offset: -1 | 1): void => updateTemplate((current) => ({ ...current, sections: normalizeOrder(reordered(current.sections ?? [], index, offset)) }))

  return (
    <div className="mx-3 mb-4 space-y-3">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">审核模板</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">一个模板定义一类案卷。综测的多个分项、各自要求和材料槽会进入同一案卷，并在一次审核运行中统一处理。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => startNew('comprehensive')}>从综测开始</Button>
            <Button size="sm" onClick={() => startNew('blank')}>新建空白模板</Button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={`${template.templateId}@${template.version}`} className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{template.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">v{template.version} · {template.sections?.length ?? 0} 个分项 · {template.fields.length} 个字段</p>
                </div>
                <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[11px]">{template.status === 'published' ? '已发布' : template.status === 'deprecated' ? '已停用' : '草稿'}</span>
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => openTemplate(template)}>{template.status === 'draft' ? '继续编辑' : '基于此版本编辑'}</Button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-muted-foreground">还没有审核模板，可从综测模板或空白模板开始。</p>}
        </div>
      </div>

      {editing && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">{editing.status === 'draft' ? '编辑草稿' : '已发布模板'}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{editing.templateId} · v{editing.version}{editing.status !== 'draft' ? ' · 正在编辑新草稿' : ''}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>关闭</Button>
          </div>

          {editing.sections?.some((section) => section.name.startsWith('综测分项')) && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">分项名称只是可编辑起点。请依据本校、本年度实际制度填写审核标准；模板不会替你编造综测政策。</p>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs">模板名称
              <input className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" value={editing.name} onChange={(event) => updateTemplate((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="text-xs">审核对象
              <select className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" value={editing.objectType} onChange={(event) => updateTemplate((current) => ({ ...current, objectType: event.target.value as TemplateVersion['objectType'] }))}>
                <option value="person">个人</option><option value="organization">组织</option><option value="project">项目</option><option value="document">文件</option><option value="transaction">交易</option><option value="custom">自定义</option>
              </select>
            </label>
          </div>

          <details open className="mt-4 rounded-lg bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">案卷与申报字段（{editing.fields.length}）</summary>
            <p className="mb-2 mt-2 text-xs text-muted-foreground">案卷字段每份案卷填写一次；申报字段随每个分项事项填写。</p>
            <div className="space-y-2">
              {editing.fields.map((field, index) => (
                <div key={`${field.key}-${index}`} className="grid gap-2 rounded-md bg-background p-2 sm:grid-cols-[1fr_1fr_110px_125px_auto] sm:items-center">
                  <input aria-label="字段编号" className="min-w-0 rounded border px-2 py-1 text-xs" placeholder="字段编号，如 studentId" value={field.key} onChange={(event) => updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, key: event.target.value.trim() } : item) }))} />
                  <input aria-label="字段名称" className="min-w-0 rounded border px-2 py-1 text-xs" placeholder="显示名称" value={field.label} onChange={(event) => updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, label: event.target.value } : item) }))} />
                  <select aria-label="字段类型" className="rounded border bg-background px-2 py-1 text-xs" value={field.kind} onChange={(event) => updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, kind: event.target.value as FieldSpec['kind'], options: event.target.value === 'enum' ? item.options ?? [] : undefined } : item) }))}>
                    {FIELD_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                  </select>
                  <select aria-label="字段归属" className="rounded border bg-background px-2 py-1 text-xs" value={`${field.scope ?? 'subject'}:${field.sectionId ?? ''}`} onChange={(event) => {
                    const [scope, sectionId] = event.target.value.split(':')
                    updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, scope: scope as FieldSpec['scope'], sectionId: sectionId || undefined } : item) }))
                  }}>
                    <option value="case:">整份案卷</option>
                    <option value="subject:">所有分项事项</option>
                    {(editing.sections ?? []).map((section) => <option key={section.id} value={`subject:${section.id}`}>{section.name}事项</option>)}
                  </select>
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1 whitespace-nowrap text-xs"><input type="checkbox" checked={field.required} onChange={(event) => updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, required: event.target.checked } : item) }))} />必填</label>
                    <Button size="sm" variant="ghost" onClick={() => updateTemplate((current) => ({ ...current, fields: current.fields.filter((_, i) => i !== index) }))}>删除</Button>
                  </div>
                  {field.kind === 'enum' && <input className="sm:col-span-5 rounded border px-2 py-1 text-xs" placeholder="选项，以中文逗号分隔" value={(field.options ?? []).map((option) => option.label).join('，')} onChange={(event) => {
                    const options = event.target.value.split(/[，,]/).map((label) => label.trim()).filter(Boolean).map((label) => ({ value: label, label }))
                    updateTemplate((current) => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, options } : item) }))
                  }} />}
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => updateTemplate((current) => ({ ...current, fields: [...current.fields, { key: `field${current.fields.length + 1}`, label: '', kind: 'text', required: false, visibility: 'public', scope: current.sections?.length ? 'subject' : 'case' }] }))}>添加字段</Button>
          </details>

          <details open className="mt-3 rounded-lg bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">审核分项与标准（{editing.sections?.length ?? 0}）</summary>
            <p className="mb-2 mt-2 text-xs text-muted-foreground">分项和标准都可调整顺序。每条标准会形成独立检查，所有检查在同一案卷运行中执行。</p>
            <div className="space-y-2">
              {(editing.sections ?? []).map((section, sectionIndex) => (
                <details key={section.id} open className="rounded-lg border bg-background p-3">
                  <summary className="cursor-pointer text-sm font-medium">{section.order + 1}. {section.name || '未命名分项'} · {section.criteria.length} 条标准</summary>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <label className="text-xs">分项名称
                      <input className="mt-1 w-full rounded border px-2 py-1.5 text-sm" value={section.name} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, name: event.target.value } : item) }))} />
                    </label>
                    <label className="text-xs">分项说明
                      <input className="mt-1 w-full rounded border px-2 py-1.5 text-sm" placeholder="这类事项如何归入本分项" value={section.description ?? ''} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, description: event.target.value } : item) }))} />
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={section.required} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, required: event.target.checked } : item) }))} />每份案卷都必须包含此分项</label>
                    <Button size="sm" variant="outline" disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)}>上移</Button>
                    <Button size="sm" variant="outline" disabled={sectionIndex === (editing.sections?.length ?? 1) - 1} onClick={() => moveSection(sectionIndex, 1)}>下移</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateTemplate((current) => {
                      const sections = normalizeOrder((current.sections ?? []).filter((_, i) => i !== sectionIndex))
                      return { ...current, sections, fields: current.fields.filter((field) => field.sectionId !== section.id), materialSlots: current.materialSlots.filter((slot) => slot.sectionId !== section.id) }
                    })}>删除分项</Button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {section.criteria.map((criterion, criterionIndex) => (
                      <div key={criterion.id} className="rounded-md bg-muted/30 p-2">
                        <div className="grid gap-2 md:grid-cols-[1fr_150px_150px_auto]">
                          <input aria-label="标准名称" className="rounded border bg-background px-2 py-1 text-xs" placeholder="标准名称，如等级核对" value={criterion.title} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: item.criteria.map((entry, j) => j === criterionIndex ? { ...entry, title: event.target.value } : entry) } : item) }))} />
                          <select aria-label="执行方式" className="rounded border bg-background px-2 py-1 text-xs" value={criterion.execution} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: item.criteria.map((entry, j) => j === criterionIndex ? { ...entry, execution: event.target.value as TemplateCriterionSpec['execution'] } : entry) } : item) }))}>
                            <option value="semantic">Agent 核对</option><option value="manual">人工确认</option>
                          </select>
                          <select aria-label="检查范围" className="rounded border bg-background px-2 py-1 text-xs" value={criterion.targetScope} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: item.criteria.map((entry, j) => j === criterionIndex ? { ...entry, targetScope: event.target.value as TemplateCriterionSpec['targetScope'] } : entry) } : item) }))}>
                            <option value="subject">逐条申报事项</option><option value="group">本分项汇总</option><option value="case">本分项整体</option>
                          </select>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" disabled={criterionIndex === 0} onClick={() => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: reordered(item.criteria, criterionIndex, -1) } : item) }))}>↑</Button>
                            <Button size="sm" variant="ghost" disabled={criterionIndex === section.criteria.length - 1} onClick={() => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: reordered(item.criteria, criterionIndex, 1) } : item) }))}>↓</Button>
                            <Button size="sm" variant="ghost" onClick={() => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: item.criteria.filter((_, j) => j !== criterionIndex) } : item) }))}>删除</Button>
                          </div>
                        </div>
                        <textarea className="mt-2 w-full rounded border bg-background px-2 py-1.5 text-xs" rows={2} placeholder="写清审核要求与判定边界；按本单位、本年度正式依据填写。" value={criterion.requirement} onChange={(event) => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: item.criteria.map((entry, j) => j === criterionIndex ? { ...entry, requirement: event.target.value } : entry) } : item) }))} />
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => updateTemplate((current) => ({ ...current, sections: (current.sections ?? []).map((item, i) => i === sectionIndex ? { ...item, criteria: [...item.criteria, { id: generatedId('criterion'), title: '', requirement: '', execution: 'semantic', targetScope: 'subject' }] } : item) }))}>添加审核标准</Button>
                  </div>
                </details>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => updateTemplate((current) => {
              const id = generatedId('section')
              return { ...current, sections: [...(current.sections ?? []), { id, name: `新分项 ${(current.sections?.length ?? 0) + 1}`, description: '', order: current.sections?.length ?? 0, required: false, criteria: [] }] }
            })}>添加审核分项</Button>
          </details>

          <details className="mt-3 rounded-lg bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">材料槽（{editing.materialSlots.length}）</summary>
            <p className="mb-2 mt-2 text-xs text-muted-foreground">案卷可登记共享材料，也可把证明材料归到某个分项，上传后仍属于同一案卷。</p>
            <div className="space-y-2">
              {editing.materialSlots.map((slot, index) => (
                <div key={slot.id} className="grid gap-2 rounded-md bg-background p-2 md:grid-cols-[1fr_1fr_1fr_170px_auto]">
                  <input aria-label="材料编号" className="rounded border px-2 py-1 text-xs" placeholder="材料编号" value={slot.id} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, id: event.target.value.trim() } : item) }))} />
                  <input aria-label="材料名称" className="rounded border px-2 py-1 text-xs" placeholder="材料名称" value={slot.name} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, name: event.target.value } : item) }))} />
                  <input aria-label="材料用途" className="rounded border px-2 py-1 text-xs" placeholder="审核用途" value={slot.purpose} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, purpose: event.target.value } : item) }))} />
                  <select aria-label="材料所属分项" className="rounded border bg-background px-2 py-1 text-xs" value={slot.sectionId ?? ''} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, sectionId: event.target.value || undefined } : item) }))}>
                    <option value="">整份案卷共用</option>{(editing.sections ?? []).map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.filter((_, i) => i !== index) }))}>删除</Button>
                  <input className="md:col-span-5 rounded border px-2 py-1 text-xs" placeholder="材料中需要核对的要素，以中文逗号分隔" value={slot.requiredElements.join('，')} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, requiredElements: event.target.value.split(/[，,]/).map((part) => part.trim()).filter(Boolean) } : item) }))} />
                  <div className="grid gap-2 md:col-span-5 md:grid-cols-4">
                    <label className="text-[11px] text-muted-foreground">最少份数（0 表示可选）<input type="number" min={0} className="mt-1 w-full rounded border bg-background px-2 py-1 text-xs text-foreground" value={slot.minCount} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, minCount: Math.max(0, Number(event.target.value) || 0) } : item) }))} /></label>
                    <label className="text-[11px] text-muted-foreground">最多份数<input type="number" min={1} className="mt-1 w-full rounded border bg-background px-2 py-1 text-xs text-foreground" value={slot.maxCount} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, maxCount: Math.max(1, Number(event.target.value) || 1) } : item) }))} /></label>
                    <label className="text-[11px] text-muted-foreground">要求提交时间<select className="mt-1 w-full rounded border bg-background px-2 py-1 text-xs text-foreground" value={slot.requiredAt ?? 'submission'} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, requiredAt: event.target.value as MaterialSlotSpec['requiredAt'] } : item) }))}><option value="submission">提交时</option><option value="decision">定稿前</option></select></label>
                    <label className="mt-4 flex items-center gap-1 text-[11px]"><input type="checkbox" checked={slot.allowReuseAcrossSubjects} onChange={(event) => updateTemplate((current) => ({ ...current, materialSlots: current.materialSlots.map((item, i) => i === index ? { ...item, allowReuseAcrossSubjects: event.target.checked } : item) }))} />允许事项共用</label>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => updateTemplate((current) => ({ ...current, materialSlots: [...current.materialSlots, { id: generatedId('material'), name: '新材料', purpose: '', requiredElements: [], acceptedKinds: ['pdf', 'image', 'office', 'sheet', 'text'], minCount: 1, maxCount: 10, requiredAt: 'submission', allowReuseAcrossSubjects: false }] }))}>添加材料槽</Button>
          </details>

          <details className="mt-3 rounded-lg bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">审核流程（{editing.stages.length} 个节点）</summary>
            <p className="mb-2 mt-2 text-xs text-muted-foreground">节点顺序就是流转顺序，保存时会把每个节点连接到下一个节点。</p>
            <div className="space-y-2">
              {editing.stages.map((stage, index) => (
                <div key={stage.id} className="grid gap-2 rounded-md bg-background p-2 md:grid-cols-[1fr_140px_130px_170px_auto]">
                  <input aria-label="流程节点名称" className="rounded border px-2 py-1 text-xs" value={stage.name} onChange={(event) => updateTemplate((current) => ({ ...current, stages: current.stages.map((item, i) => i === index ? { ...item, name: event.target.value } : item) }))} />
                  <select aria-label="流程节点类型" className="rounded border bg-background px-2 py-1 text-xs" value={stage.kind} onChange={(event) => updateTemplate((current) => ({ ...current, stages: current.stages.map((item, i) => i === index ? { ...item, kind: event.target.value as WorkflowStageSpec['kind'] } : item) }))}>{STAGE_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select>
                  <select aria-label="流程执行人" className="rounded border bg-background px-2 py-1 text-xs" value={stage.executorRole} onChange={(event) => updateTemplate((current) => ({ ...current, stages: current.stages.map((item, i) => i === index ? { ...item, executorRole: event.target.value as WorkflowStageSpec['executorRole'] } : item) }))}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>
                  <select aria-label="退回节点" className="rounded border bg-background px-2 py-1 text-xs" value={stage.returnToStageId ?? ''} onChange={(event) => updateTemplate((current) => ({ ...current, stages: current.stages.map((item, i) => i === index ? { ...item, returnToStageId: event.target.value || undefined } : item) }))}>
                    <option value="">不指定退回</option>{editing.stages.filter((target) => target.id !== stage.id).map((target) => <option key={target.id} value={target.id}>退回：{target.name}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => updateTemplate((current) => ({ ...current, stages: reordered(current.stages, index, -1) }))}>↑</Button>
                    <Button size="sm" variant="ghost" disabled={index === editing.stages.length - 1} onClick={() => updateTemplate((current) => ({ ...current, stages: reordered(current.stages, index, 1) }))}>↓</Button>
                    <Button size="sm" variant="ghost" disabled={editing.stages.length <= 1} onClick={() => updateTemplate((current) => ({ ...current, stages: current.stages.filter((_, i) => i !== index) }))}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => updateTemplate((current) => ({ ...current, stages: [...current.stages, newStage(`审核节点 ${current.stages.length + 1}`, 'manual-review', 'reviewer')] }))}>添加流程节点</Button>
          </details>

          {message.length > 0 && <ul className="mt-3 list-disc rounded-lg bg-red-500/10 px-8 py-2 text-xs text-red-700 dark:text-red-300">{message.map((item, index) => <li key={index}>{item}</li>)}</ul>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">草稿可继续修改；发布后版本不可覆盖，后续修改会创建新版本。</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={loading || editing.status !== 'draft'} onClick={() => void saveDraft()}>保存草稿</Button>
              <Button size="sm" disabled={loading || editing.status !== 'draft'} onClick={() => void publish()}>{loading ? '处理中…' : '校验并发布'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
