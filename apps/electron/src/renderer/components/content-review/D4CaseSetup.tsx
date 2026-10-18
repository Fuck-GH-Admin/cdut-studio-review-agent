import * as React from 'react'
import type { D2ScenarioSelection, D4ClientSelection, D4ClientTemplate } from '@profer/shared'
import { D4GenericObjectForm, isValidD4GenericForm } from './D4GenericObjectForm'

/** P1-A/B: human-confirmed real object selections; no editable scenario JSON required. */
export function D4CaseSetup({ onChange, preferredTemplateId, onManualOverride }: {
  onChange: (value: D4ClientSelection | undefined) => void
  preferredTemplateId?: string
  onManualOverride?: () => void
}): React.ReactElement {
  const [templates, setTemplates] = React.useState<D4ClientTemplate[]>([])
  const [templateId, setTemplateId] = React.useState('')
  const [selection, setSelection] = React.useState<D2ScenarioSelection>()
  const [confirmed, setConfirmed] = React.useState(false)
  const [studentFixture, setStudentFixture] = React.useState(false)
  const [error, setError] = React.useState('')
  const template = templates.find(t => t.templateId === templateId)
  const generic = !!template?.businessTypes?.length
  const canConfirm = !!template && !!selection && (generic
    ? isValidD4GenericForm(template, selection)
    : selection.targets.length > 0 && JSON.stringify(selection) === JSON.stringify(template.selection))

  React.useEffect(() => {
    let active = true
    void window.reviewAPI.listD4Templates().then(items => { if (active) setTemplates(items) })
      .catch(e => { if (active) setError(String(e)) })
    return () => { active = false }
  }, [])
  React.useEffect(() => {
    onChange(confirmed && canConfirm && selection
      ? { selection, useControlledStudentFixture: studentFixture, reviewerConfirmation: 'explicit-ui-confirmation' }
      : undefined)
  }, [confirmed, canConfirm, selection, studentFixture, onChange])

  const selectTemplate = (id: string): void => {
    const next = templates.find(t => t.templateId === id)
    setTemplateId(id)
    setSelection(next ? next.businessTypes?.length
      ? { templateId: next.templateId, version: next.version, targets: [] }
      : structuredClone(next.selection) : undefined)
    setConfirmed(false)
    setStudentFixture(false)
  }
  React.useEffect(() => {
    if (preferredTemplateId && preferredTemplateId !== templateId &&
        templates.some(item => item.templateId === preferredTemplateId)) {
      selectTemplate(preferredTemplateId)
    }
  }, [preferredTemplateId, templates, templateId])
  const updateSelection = (value: D2ScenarioSelection): void => {
    setSelection(value)
    setConfirmed(false)
  }

  return <div className="space-y-3 rounded-lg bg-muted/40 p-3 text-sm" data-testid="d4-case-setup">
    <p className="text-amber-700 dark:text-amber-300">
      D4 候选 · 技术预审。业务选择不代表学校规则授权，条件未知时请保持“未知·待核”。
    </p>
    <label className="block">审核事项模板
      <select aria-label="D4 技术预审模板" className="mt-1 h-9 w-full rounded-md border bg-background px-2"
        value={templateId} onChange={e => { onManualOverride?.(); selectTemplate(e.target.value) }}>
        <option value="">选择受控 D4 候选（{templates.length} 套）…</option>
        {templates.map(t => <option key={t.templateId} value={t.templateId}>
          {t.domain} · {t.name} · {t.templateId}
        </option>)}
      </select>
    </label>
    {template && selection && (generic
      ? <D4GenericObjectForm template={template} selection={selection} onChange={updateSelection}/>
      : <div className="space-y-1 rounded border p-3">
        <p className="font-medium">此模板使用特殊对象合同，暂保留独立受控技术输入。</p>
        <p className="text-xs text-muted-foreground">
          不能把校园卡、档案操作或学籍字段伪装成通用业务对象；本轮尚不开放真实学籍登记接口。
        </p>
        <p className="text-xs text-muted-foreground">预设对象：{selection.targets.map(t => t.title).join('、')}</p>
      </div>)}
    {template?.controlledStudentFixture && <label className="flex gap-2">
      <input type="checkbox" checked={studentFixture}
        onChange={e => { setStudentFixture(e.target.checked); setConfirmed(false) }}/>
      使用随包受控合成学籍快照（仅技术测试，不是正式学籍底账）
    </label>}
    {template && selection && <details className="text-xs">
      <summary className="cursor-pointer">查看技术标识和固定场景输入（只读）</summary>
      <pre className="mt-2 max-h-40 overflow-auto rounded border bg-background p-2 whitespace-pre-wrap break-all">
        {JSON.stringify(selection, null, 2)}
      </pre>
    </details>}
    {template && <label className="flex gap-2">
      <input aria-label="确认 D4 对象和条件" type="checkbox" disabled={!canConfirm}
        checked={confirmed && canConfirm} onChange={e => setConfirmed(e.target.checked)}/>
      我已确认对象、主场景和条件选择；来源是作者态锚点，不证明事实或行政授权。确认后创建新固定案卷。
    </label>}
    {template && !canConfirm && <p role="alert" className="text-amber-700 dark:text-amber-300">
      请至少添加一个对象、填写名称并选择主场景，才能确认建案。
    </p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>
}
