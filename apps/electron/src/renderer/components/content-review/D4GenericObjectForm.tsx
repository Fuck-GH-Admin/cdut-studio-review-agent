import * as React from 'react'
import type { D2ScenarioSelection, D2TargetBinding, D4ClientTemplate } from '@profer/shared'

const LABELS: Record<string, string> = {
  self: '本人办理', proxy: '代为办理',
  'p-public-classroom': '公共教学教室',
  'p-graduate-classroom': '研究生教室',
  'p-delegated-classroom': '委托管理教室',
  valuable: '贵重物品', dispute: '存在争议', card: '校园卡或证件',
  sensitive: '敏感物品', venue: '特殊场所', handover: '已进入交付阶段',
  'c-exam-period': '考试期间', 'c-holiday': '节假日期间',
  'c-multiple-slots': '多个时段', 'c-multimedia': '需要多媒体',
  'c-lecture': '讲座', 'c-student-club': '学生社团',
  'c-delegated': '委托办理', 'c-change': '变更申请',
}
const label = (id: string): string => LABELS[id] ? `${LABELS[id]}（${id}）` : id
const CLASS = 'h-9 w-full rounded-md border bg-background px-2 text-sm'

export function isValidD4GenericForm(template: D4ClientTemplate, selection: D2ScenarioSelection | undefined): boolean {
  if (!selection || selection.templateId !== template.templateId || selection.version !== template.version ||
      !selection.targets.length || selection.targets.length > 100 || !template.businessTypes?.length) return false
  const keys = new Set<string>()
  const subjects = new Set<string>()
  for (const target of selection.targets) {
    if (target.kind !== 'generic-object' || !target.title?.trim() || !target.objectKey || !target.subjectId ||
        keys.has(target.objectKey) || subjects.has(target.subjectId) ||
        !template.businessTypes.includes(target.businessType ?? '')) return false
    keys.add(target.objectKey)
    subjects.add(target.subjectId)
    if (template.primary.length) {
      if (!template.selectionSource || !template.primary.includes(target.scenario ?? '') ||
          !Array.isArray(target.conditions) || target.conditions.length !== template.conditions.length ||
          target.conditions.some(c => !template.conditions.includes(c.id) ||
            !['applicable', 'not-applicable', 'unknown'].includes(c.applicability)) ||
          new Set(target.conditions.map(c => c.id)).size !== template.conditions.length) return false
    } else if (target.scenario || target.conditions?.length) return false
  }
  return true
}

export function D4GenericObjectForm({
  template, selection, onChange,
}: {
  template: D4ClientTemplate
  selection: D2ScenarioSelection
  onChange: (selection: D2ScenarioSelection) => void
}): React.ReactElement {
  const targets = selection.targets
  const patchTarget = (index: number, patch: Partial<D2TargetBinding>): void => {
    onChange({ ...selection, targets: targets.map((item, i) => i === index ? { ...item, ...patch } : item) })
  }
  const addTarget = (): void => {
    if (targets.length >= 100 || !template.businessTypes?.length ||
        (template.primary.length > 0 && !template.selectionSource)) return
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const source = template.selectionSource
    const target: D2TargetBinding = {
      kind: 'generic-object',
      objectKey: `d4-object-${token}`,
      subjectId: `d4-subject-${token}`,
      title: '',
      businessType: template.businessTypes[0]!,
      ...(template.primary.length ? {
        scenario: '',
        scenarioSource: source ? { ...source, decidedBy: 'reviewer' as const } : undefined,
        conditions: template.conditions.map(id => ({
          id, applicability: 'unknown' as const,
          sourceId: source!.sourceId, sourceVersionId: source!.sourceVersionId,
          decidedBy: 'undetermined' as const,
        })),
      } : {}),
    }
    onChange({ ...selection, targets: [...targets, target] })
  }
  const blocked = !template.businessTypes?.length || (template.primary.length > 0 && !template.selectionSource)
  return <div className="space-y-3" data-testid="d4-object-form">
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs text-muted-foreground">审核对象：{targets.length} 个；对象之间的规则与材料责任分别记录。</div>
      <button type="button" className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
        disabled={blocked || targets.length >= 100} onClick={addTarget}>添加对象</button>
    </div>
    {blocked && <p role="alert" className="text-amber-700 dark:text-amber-300">
      此候选尚无可验证的通用对象类型或场景来源，不能生成真实对象；请切换模板。
    </p>}
    {targets.length === 0 && !blocked && <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      尚无业务对象。点击“添加对象”开始填写；不会自动使用合成示例中的两件对象。
    </p>}
    {targets.map((target, index) => <fieldset className="space-y-3 rounded-lg border bg-background p-3"
      key={target.subjectId}>
      <legend className="px-1 text-sm font-medium">审核对象 {index + 1}</legend>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">独立主体：{target.subjectId}</span>
        <button type="button" className="rounded-md border px-2 py-1 text-xs"
          onClick={() => onChange({ ...selection, targets: targets.filter((_, i) => i !== index) })}>
          删除此对象
        </button>
      </div>
      <label className="block space-y-1 text-sm">业务对象名称
        <input className={CLASS} value={target.title} maxLength={160}
          placeholder="如：图书馆一层教室第 3 时段"
          aria-label={`对象 ${index + 1} 名称`}
          onChange={e => patchTarget(index, { title: e.target.value })}/>
      </label>
      {template.businessTypes && template.businessTypes.length > 1 && <label className="block space-y-1 text-sm">
        对象业务类别
        <select className={CLASS} value={target.businessType}
          aria-label={`对象 ${index + 1} 业务类别`}
          onChange={e => patchTarget(index, { businessType: e.target.value })}>
          {template.businessTypes.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </label>}
      {template.primary.length > 0 && <label className="block space-y-1 text-sm">
        主场景（必选，互斥）
        <select className={CLASS} value={target.scenario ?? ''}
          aria-label={`对象 ${index + 1} 主场景`}
          onChange={e => patchTarget(index, { scenario: e.target.value })}>
          <option value="">请选择主场景…</option>
          {template.primary.map(id => <option value={id} key={id}>{label(id)}</option>)}
        </select>
      </label>}
      {template.conditions.length > 0 && <div className="space-y-2">
        <p className="text-xs text-muted-foreground">叠加条件：默认“未知·待核”。只有你明确确认时才选适用或不适用。</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(target.conditions ?? []).map(condition => <label key={condition.id} className="space-y-1 text-xs">
            {label(condition.id)}
            <select className={CLASS} value={condition.applicability}
              aria-label={`对象 ${index + 1} 条件 ${condition.id}`}
              onChange={e => {
                const applicability = e.target.value as 'applicable' | 'not-applicable' | 'unknown'
                patchTarget(index, { conditions: target.conditions!.map(item => item.id === condition.id
                  ? { ...item, applicability, decidedBy: applicability === 'unknown' ? 'undetermined' : 'reviewer' } : item) })
              }}>
              <option value="unknown">未知 · 待核</option>
              <option value="applicable">适用（本人确认）</option>
              <option value="not-applicable">不适用（本人确认）</option>
            </select>
          </label>)}
        </div>
      </div>}
    </fieldset>)}
  </div>
}
