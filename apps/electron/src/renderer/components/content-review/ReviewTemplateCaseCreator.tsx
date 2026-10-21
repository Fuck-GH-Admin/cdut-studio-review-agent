import * as React from 'react'
import type { Actor, FieldSpec, TemplateVersion } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'
import { templatesRefreshAtom } from './review-v2-state'
import { reviewV2AggregateAtom } from './review-v2-state'

interface SubjectDraft {
  id: string
  title: string
  sectionId?: string
  fieldValues: Record<string, string>
}

const localActor: Actor = { actorId: 'local-user', actorSource: 'local', role: 'reviewer' }

function newSubjectId(sectionId = 'item'): string {
  return `item-${sectionId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function initialSubjectRows(template: TemplateVersion): SubjectDraft[] {
  const requiredSections = (template.sections ?? []).filter((section) => section.required)
  if (requiredSections.length > 0) {
    return requiredSections.map((section) => ({ id: newSubjectId(section.id), title: '', sectionId: section.id, fieldValues: {} }))
  }
  if ((template.sections ?? []).length > 0) return []
  return template.fields.some((field) => (field.scope ?? 'subject') === 'subject')
    ? [{ id: newSubjectId(), title: '', fieldValues: {} }]
    : []
}

function renderFieldInput(field: FieldSpec, value: string, onChange: (value: string) => void): JSX.Element {
  if (field.kind === 'boolean') {
    return <select aria-label={field.label} className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">请选择</option><option value="true">是</option><option value="false">否</option>
    </select>
  }
  if (field.kind === 'enum' && field.options?.length) {
    return <select aria-label={field.label} className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">请选择</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  }
  return <input aria-label={field.label} className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm"
    type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
    value={value} onChange={(event) => onChange(event.target.value)} />
}

function parseFieldValue(field: FieldSpec, value: string): unknown {
  if (field.kind === 'number') return value === '' ? '' : Number(value)
  if (field.kind === 'boolean') return value === 'true'
  return value
}

/** 从已发布模板建案的完整入口；不把“选择模板”误当成已经完成材料导入或审核。 */
export function ReviewTemplateCaseCreator({ onCreated }: { onCreated: (caseId: string) => Promise<void> | void }): JSX.Element {
  const refreshVersion = React.useAtomValue(templatesRefreshAtom)
  const setAggregate = React.useSetAtom(reviewV2AggregateAtom)
  const [templates, setTemplates] = React.useState<TemplateVersion[]>([])
  const [templateKey, setTemplateKey] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [caseFields, setCaseFields] = React.useState<Record<string, string>>({})
  const [subjects, setSubjects] = React.useState<SubjectDraft[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let active = true
    void window.reviewAPI.listTemplateVersionsV2().then((items) => {
      if (!active) return
      const latest = new Map<string, TemplateVersion>()
      for (const item of [...items].filter((candidate) => candidate.status === 'published').sort((a, b) => b.version - a.version)) {
        if (!latest.has(item.templateId)) latest.set(item.templateId, item)
      }
      setTemplates([...latest.values()])
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : String(cause))
    })
    return () => { active = false }
  }, [refreshVersion])

  const template = templates.find((item) => `${item.templateId}@${item.version}` === templateKey) ?? null
  const selectTemplate = (key: string): void => {
    setTemplateKey(key)
    const selected = templates.find((item) => `${item.templateId}@${item.version}` === key)
    setCaseFields({})
    setSubjects(selected ? initialSubjectRows(selected) : [])
    setError('')
  }
  const updateSubject = (id: string, update: (subject: SubjectDraft) => SubjectDraft): void => {
    setSubjects((current) => current.map((subject) => subject.id === id ? update(subject) : subject))
  }

  const create = async (): Promise<void> => {
    if (!template || !title.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const filledSubjects = subjects.filter((subject) => subject.title.trim() ||
        Object.values(subject.fieldValues).some((value) => String(value ?? '').trim()))
      const payloadSubjects = filledSubjects.map((subject) => ({
        ...subject,
        type: 'item' as const,
        fieldValues: Object.fromEntries(Object.entries(subject.fieldValues).map(([key, value]) => {
          const spec = template.fields.find((field) => field.key === key)
          return [key, spec ? parseFieldValue(spec, value) : value]
        })),
      }))
      for (const section of template.sections ?? []) {
        if (section.required && !payloadSubjects.some((subject) => subject.sectionId === section.id && subject.title.trim())) {
          throw new Error(`请先为必需分项“${section.name}”添加至少一项申报事项`)
        }
      }
      const caseId = `case-${Date.now().toString(36)}`
      await window.reviewAPI.createCaseV2({
        caseId,
        templateId: template.templateId,
        version: template.version,
        payload: {
          title: title.trim(),
          fieldValues: Object.fromEntries(Object.entries(caseFields).map(([key, value]) => {
            const spec = template.fields.find((field) => field.key === key)
            return [key, spec ? parseFieldValue(spec, value) : value]
          })),
          subjects: payloadSubjects,
        },
        actor: localActor,
      })
      const aggregate = await window.reviewAPI.getAggregateV2(caseId)
      if (!aggregate || aggregate.caseV2.id !== caseId) throw new Error('案卷已创建，但未能读取最新业务记录；请从首页案卷列表重新打开')
      setAggregate(aggregate)
      toast.success(`已创建案卷：${title.trim()}`)
      await onCreated(caseId)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      setError(message)
      toast.error(`创建案卷失败：${message}`)
    } finally {
      setBusy(false)
    }
  }

  return <section className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
    <header className="space-y-1">
      <h2 className="text-base font-semibold">按审核模板新建</h2>
      <p className="text-sm text-muted-foreground">适合已经明确审核类型、需要先登记申报事项的情况。模板只提供审核结构，不代表材料已齐全或审核已完成。</p>
    </header>
    {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">选择已发布模板</span>
      <select className="w-full rounded-md border bg-background px-3 py-2" value={templateKey} onChange={(event) => selectTemplate(event.target.value)}>
        <option value="">选择模板…</option>
        {templates.map((item) => <option key={`${item.templateId}@${item.version}`} value={`${item.templateId}@${item.version}`}>{item.name} · v{item.version}</option>)}
      </select>
    </label>
    {template && <>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">案卷名称</span>
        <input className="w-full rounded-md border bg-background px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这次审核起一个容易识别的名称" />
      </label>
      {template.fields.filter((field) => (field.scope ?? 'subject') === 'case').map((field) => <label key={field.key} className="flex items-center gap-3 text-sm">
        <span className="w-32 shrink-0">{field.label}{field.required ? ' *' : ''}</span>
        {renderFieldInput(field, caseFields[field.key] ?? '', (value) => setCaseFields((current) => ({ ...current, [field.key]: value })))}
      </label>)}
      {(template.sections ?? []).map((section) => {
        const rows = subjects.filter((subject) => subject.sectionId === section.id)
        const fields = template.fields.filter((field) => (field.scope ?? 'subject') === 'subject' && (!field.sectionId || field.sectionId === section.id))
        return <section key={section.id} className="space-y-2 rounded-lg bg-muted/30 p-3">
          <header className="flex items-start justify-between gap-3">
            <div><h3 className="text-sm font-medium">{section.name}{section.required ? ' · 必需' : ''}</h3>{section.description && <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>}</div>
            <Button type="button" variant="outline" size="sm" onClick={() => setSubjects((current) => [...current, { id: newSubjectId(section.id), title: '', sectionId: section.id, fieldValues: {} }])}>添加事项</Button>
          </header>
          {section.criteria.length > 0 && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">查看审核标准</summary><ol className="mt-1 list-decimal space-y-1 pl-5">{section.criteria.map((criterion) => <li key={criterion.id}><span className="font-medium">{criterion.title}</span>：{criterion.requirement}</li>)}</ol></details>}
          {rows.map((subject) => <div key={subject.id} className="space-y-2 rounded-lg bg-background p-3">
            <div className="flex gap-2"><input className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="申报事项名称" value={subject.title} onChange={(event) => updateSubject(subject.id, (old) => ({ ...old, title: event.target.value }))} /><Button type="button" variant="ghost" size="sm" onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}>删除</Button></div>
            {fields.map((field) => <label key={field.key} className="flex items-center gap-3 text-sm"><span className="w-32 shrink-0">{field.label}{field.required ? ' *' : ''}</span>{renderFieldInput(field, subject.fieldValues[field.key] ?? '', (value) => updateSubject(subject.id, (old) => ({ ...old, fieldValues: { ...old.fieldValues, [field.key]: value } }))}</label>)}
          </div>)}
          {rows.length === 0 && <p className="text-xs text-muted-foreground">还没有添加事项{section.required ? '；创建前需要补齐。' : '。'}</p>}
        </section>
      })}
      {(template.sections ?? []).length === 0 && template.fields.some((field) => (field.scope ?? 'subject') === 'subject') && <section className="space-y-2 rounded-lg bg-muted/30 p-3">
        <header className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">申报事项</h3><Button type="button" size="sm" variant="outline" onClick={() => setSubjects((current) => [...current, { id: newSubjectId(), title: '', fieldValues: {} }])}>添加事项</Button></header>
        {subjects.map((subject) => <div key={subject.id} className="space-y-2 rounded-lg bg-background p-3">
          <div className="flex gap-2"><input className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="事项名称" value={subject.title} onChange={(event) => updateSubject(subject.id, (old) => ({ ...old, title: event.target.value }))} /><Button type="button" size="sm" variant="ghost" onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}>删除</Button></div>
          {template.fields.filter((field) => (field.scope ?? 'subject') === 'subject').map((field) => <label key={field.key} className="flex items-center gap-3 text-sm"><span className="w-32 shrink-0">{field.label}{field.required ? ' *' : ''}</span>{renderFieldInput(field, subject.fieldValues[field.key] ?? '', (value) => updateSubject(subject.id, (old) => ({ ...old, fieldValues: { ...old.fieldValues, [field.key]: value } }))}</label>)}
        </div>)}
      </section>}
      <Button type="button" disabled={busy || !title.trim()} onClick={() => void create()}>{busy ? '正在创建…' : '创建案卷并继续办理'}</Button>
    </>}
  </section>
}
