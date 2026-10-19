import * as React from 'react'
import type { D2RuntimePlan, D4ReviewerFieldSpec, ReviewCase } from '@profer/shared'
import { w1LatestReviewerForm } from './w1-reviewer-form'

const kinds: Array<{ value: D4ReviewerFieldSpec['kind']; label: string }> = [
  { value: 'text', label: '文本' }, { value: 'number', label: '数值' },
  { value: 'date', label: '日期 YYYY-MM-DD' }, { value: 'boolean', label: '是 / 否' },
  { value: 'enum', label: '单选枚举' }, { value: 'multi', label: '多值文本' },
]
/** Explicit reviewer typed field configuration; never writes frozen template. */
export function D4ReviewerFormEditor({ reviewCase, subjectId, plan, allowedKeys, reload }: {
  reviewCase: ReviewCase; subjectId: string; plan: D2RuntimePlan
  allowedKeys: string[]; reload(): Promise<unknown>
}): React.ReactElement {
  const current = w1LatestReviewerForm(reviewCase, subjectId, plan.fingerprint)
  const [fieldKey, setFieldKey] = React.useState('')
  const [label, setLabel] = React.useState('')
  const [kind, setKind] = React.useState<D4ReviewerFieldSpec['kind']>('text')
  const [required, setRequired] = React.useState(false)
  const [optionsText, setOptionsText] = React.useState('')
  const [min, setMin] = React.useState('')
  const [max, setMax] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const previous = current?.fields ?? []
  const load = (key: string): void => {
    setFieldKey(key); setError('')
    const existing = previous.find(field => field.key === key)
    setLabel(existing?.label ?? key)
    setKind(existing?.kind ?? 'text')
    setRequired(existing?.required ?? false)
    setOptionsText(existing?.options?.map(item => item.value + ':' + item.label).join('\n') ?? '')
    setMin(existing?.min === undefined ? '' : String(existing.min))
    setMax(existing?.max === undefined ? '' : String(existing.max))
  }
  const submit = async (remove = false): Promise<void> => {
    if (!fieldKey || busy) return
    setBusy(true); setError('')
    try {
      const fields = previous.filter(field => field.key !== fieldKey)
      if (!remove) {
        if (!label.trim()) throw new Error('字段显示名称不能为空')
        const options = kind === 'enum' ? optionsText.split(/\r?\n/).map(line => line.trim())
          .filter(Boolean).map(line => {
            const colon = line.indexOf(':')
            if (colon < 1 || !line.slice(colon + 1).trim())
              throw new Error('枚举选项使用每行 value:显示名称 的格式')
            return { value: line.slice(0, colon).trim(), label: line.slice(colon + 1).trim() }
          }) : undefined
        const minValue = min.trim() ? Number(min) : undefined
        const maxValue = max.trim() ? Number(max) : undefined
        fields.push({ key: fieldKey, label: label.trim(), kind, required,
          ...(options ? { options } : {}),
          ...(kind === 'number' && minValue !== undefined ? { min: minValue } : {}),
          ...(kind === 'number' && maxValue !== undefined ? { max: maxValue } : {}),
        })
      }
      await window.reviewAPI.saveD4ReviewerForm({
        caseId: reviewCase.id, subjectId, planFingerprint: plan.fingerprint,
        expectedRevision: reviewCase.revision ?? 0, fields,
      })
      await reload()
      load('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)) }
    finally { setBusy(false) }
  }
  return <details className="mt-2 rounded border border-border/50 p-2" data-testid="d4-reviewer-typed-form">
    <summary className="cursor-pointer font-medium">审核员业务字段表单配置（{previous.length} 项）</summary>
    <p className="mt-1 text-muted-foreground">只可配置冻结 D2 所声明的本对象责任键，记录修订历史。
      必填只提示补核，缺证据时仍为 unknown；不能替代学校审批或自动确认事实。</p>
    <div className="mt-2 grid gap-2">
      <label>本对象责任字段
        <select className="ml-2 max-w-full rounded border bg-background p-1"
          value={fieldKey} disabled={busy} onChange={e => load(e.target.value)}>
          <option value="">选择要配置的字段</option>
          {allowedKeys.map(key => <option key={key} value={key}>{key}</option>)}
        </select>
      </label>
      {!!fieldKey && <>
        <label>显示名称
          <input className="ml-2 rounded border bg-background p-1" maxLength={100}
            disabled={busy} value={label} onChange={e => setLabel(e.target.value)} />
        </label>
        <label>字段类型
          <select className="ml-2 rounded border bg-background p-1"
            value={kind} disabled={busy} onChange={e => setKind(e.target.value as D4ReviewerFieldSpec['kind'])}>
            {kinds.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label><input type="checkbox" disabled={busy} checked={required}
          onChange={e => setRequired(e.target.checked)} /> 需人工核对（不能自动推定缺失/违规）</label>
        {kind === 'enum' && <label>选项（每行 value:名称）
          <textarea rows={3} className="mt-1 w-full rounded border bg-background p-1"
            disabled={busy} value={optionsText} onChange={e => setOptionsText(e.target.value)} />
        </label>}
        {kind === 'number' && <div className="flex flex-wrap gap-2">
          <label>最小值<input className="ml-1 w-24 rounded border bg-background p-1" value={min}
            disabled={busy} onChange={e => setMin(e.target.value)} /></label>
          <label>最大值<input className="ml-1 w-24 rounded border bg-background p-1" value={max}
            disabled={busy} onChange={e => setMax(e.target.value)} /></label>
        </div>}
        <div className="flex gap-2">
          <button type="button" className="rounded border px-2 py-1" disabled={busy}
            onClick={() => void submit(false)}>保存字段配置</button>
          {previous.some(item => item.key === fieldKey) && <button type="button" className="rounded border px-2 py-1"
            disabled={busy} onClick={() => void submit(true)}>移除此配置</button>}
        </div>
      </>}
      {!!previous.length && <p className="text-muted-foreground">当前配置：{previous.map(field =>
        field.label + ' (' + field.key + '/' + field.kind + (field.required ? '/需核对' : '') + ')').join('；')}</p>}
      {!!reviewCase.d4ReviewerFormSnapshots?.length && <p className="text-muted-foreground">
        历史配置快照：{reviewCase.d4ReviewerFormSnapshots.filter(item => item.subjectId === subjectId).length} 版；旧版保留在案卷记录中。
      </p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
  </details>
}
