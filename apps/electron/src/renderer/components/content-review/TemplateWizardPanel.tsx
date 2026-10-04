/**
 * 模板向导面板（N4b，docs/design/review-agent/06 §6.1 六步向导的最小可操作版；U08 入口）
 *
 * 负责人不写 JSON/不改源码：填名称/对象类型/字段行/材料槽 → 自动生成虚构政策引用 →
 * 校验（悬空引用/流程/量表）→ 保存草稿 → 发布。评分可选（无评分=纯检查业务）。
 */

import { useCallback, useState } from 'react'
import type { TemplateVersion } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'
import { useStore } from 'jotai'
import { reviewV2BusyAtom } from './V2CasePanel'

interface WizardField { key: string; label: string; kind: 'text' | 'number' | 'date'; required: boolean }
interface WizardSlot { id: string; name: string; requiredElements: string }

export function TemplateWizardPanel(): JSX.Element {
  const store = useStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [objectType, setObjectType] = useState<TemplateVersion['objectType']>('organization')
  const [scored, setScored] = useState(false)
  const [fields, setFields] = useState<WizardField[]>([{ key: 'applicantName', label: '申请人', kind: 'text', required: true }])
  const [slots, setSlots] = useState<WizardSlot[]>([{ id: 'main-doc', name: '主要材料', requiredElements: '要素1,要素2' }])
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [policyText, setPolicyText] = useState('')

  const finish = useCallback(async (): Promise<void> => {
    store.set(reviewV2BusyAtom, true)
    try {
      const templateId = `wizard-${name.trim().replace(/\s+/g, '-')}-${Date.now().toString(36)}`.toLowerCase()
      const policyId = `policy-${templateId}`
      // G10：负责人自有规则（录入为依据来源，不再固定演示文本）
      const content = policyText.trim() || `【虚构演示】${name}审核政策（向导生成 v1）\n\nF1 材料要素齐全；F2 字段一致；F3 两级人工审核。`
      const ref = await window.reviewAPI.createPolicyV2({ policyId, title: `${name}审核政策`, content, enteredBy: 'local-user' })
      const template: TemplateVersion = {
        templateId, version: 1, schemaVersion: 2, name: name.trim(), objectType,
        displayName: { template: '{{applicantName}}' },
        fields: fields.map((field) => ({ key: field.key, label: field.label, kind: field.kind, required: field.required, visibility: 'public' as const, scope: 'case' as const })),
        materialSlots: slots.filter((slot) => slot.id && slot.name).map((slot) => ({ id: slot.id, name: slot.name, purpose: slot.name, requiredElements: slot.requiredElements.split(/[,，]/).map((element) => element.trim()).filter(Boolean), acceptedKinds: ['pdf', 'image', 'office', 'text'] as const, minCount: 1, maxCount: 10, allowReuseAcrossSubjects: false })),
        policyVersionIds: [ref.policyId],
        policyRefs: [{ policyId: ref.policyId, version: ref.version, contentHash: ref.contentHash }],
        rubric: scored ? { dimensions: [{ id: 'overall', name: '总体', min: 1, max: 5, weight: 1 }], totalPrecision: 2, missingStrategy: 'block' } : undefined,
        stages: [
          { id: 'auto-check', name: '自动核对', kind: 'auto-check', executorRole: 'system', nextStageId: 'first-review' },
          { id: 'first-review', name: '初审', kind: 'manual-review', executorRole: 'reviewer', nextStageId: scored ? 'rating' : 'final-review' },
          ...(scored ? [{ id: 'rating', name: '独立评分', kind: 'independent-rating' as const, executorRole: 'judge' as const, nextStageId: 'final-review' }] : []),
          { id: 'final-review', name: '终审', kind: 'manual-review', executorRole: 'teacher' },
        ],
        outputs: [{ id: 'approval', kind: 'approval', audience: 'teacher' }],
        status: 'draft',
        createdAt: new Date().toISOString(),
      }
      await window.reviewAPI.saveTemplateDraftV2(template)
      const published = await window.reviewAPI.publishTemplateV2(templateId, 1)
      setPublishedId(`${published.templateId}@${published.version}`)
      toast.success(`模板已发布：${name}`)
      setStep(6)
    } catch (error) {
      toast.error(`向导失败：${error instanceof Error ? error.message : String(error)}`)
    } finally {
      store.set(reviewV2BusyAtom, false)
    }
  }, [name, objectType, scored, fields, slots, store])

  return (
    <div className="mx-3 mb-3 rounded-xl border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold">模板向导（无代码创建业务）</p>
      {step === 1 && (
        <div className="space-y-2 text-xs">
          <input className="w-full rounded-md border bg-background px-2 py-1" placeholder="业务名称（如：实验室使用申请）" value={name} onChange={(event) => setName(event.target.value)} />
          <select className="rounded-md border bg-background px-2 py-1" value={objectType} onChange={(event) => setObjectType(event.target.value as TemplateVersion['objectType'])}>
            <option value="organization">组织</option>
            <option value="person">个人</option>
            <option value="project">项目</option>
            <option value="document">文件</option>
            <option value="transaction">交易</option>
          </select>
          <Button size="sm" disabled={!name.trim()} onClick={() => setStep(2)}>下一步</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2 text-xs">
          <p className="text-muted-foreground">案卷字段（key/名称/类型/必填）</p>
          {fields.map((field, index) => (
            <div key={index} className="flex gap-1">
              <input className="w-20 rounded border px-1" value={field.key} onChange={(event) => setFields(fields.map((f, i) => (i === index ? { ...f, key: event.target.value } : f)))} placeholder="key" />
              <input className="w-24 rounded border px-1" value={field.label} onChange={(event) => setFields(fields.map((f, i) => (i === index ? { ...f, label: event.target.value } : f)))} placeholder="名称" />
              <select className="rounded border" value={field.kind} onChange={(event) => setFields(fields.map((f, i) => (i === index ? { ...f, kind: event.target.value as WizardField['kind'] } : f)))}>
                <option value="text">文本</option><option value="number">数字</option><option value="date">日期</option>
              </select>
              <label className="flex items-center gap-1"><input type="checkbox" checked={field.required} onChange={(event) => setFields(fields.map((f, i) => (i === index ? { ...f, required: event.target.checked } : f)))} />必填</label>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setFields([...fields, { key: '', label: '', kind: 'text', required: false }])}>+字段</Button>
          <div className="flex gap-1.5"><Button size="sm" onClick={() => setStep(1)}>上一步</Button><Button size="sm" disabled={fields.some((field) => !field.key)} onClick={() => setStep(3)}>下一步</Button></div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-2 text-xs">
          <p className="text-muted-foreground">材料槽（id/名称/关键要素，逗号分隔）</p>
          {slots.map((slot, index) => (
            <div key={index} className="flex gap-1">
              <input className="w-24 rounded border px-1" value={slot.id} onChange={(event) => setSlots(slots.map((s, i) => (i === index ? { ...s, id: event.target.value } : s)))} placeholder="id" />
              <input className="w-28 rounded border px-1" value={slot.name} onChange={(event) => setSlots(slots.map((s, i) => (i === index ? { ...s, name: event.target.value } : s)))} placeholder="名称" />
              <input className="flex-1 rounded border px-1" value={slot.requiredElements} onChange={(event) => setSlots(slots.map((s, i) => (i === index ? { ...s, requiredElements: event.target.value } : s)))} placeholder="要素1,要素2" />
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setSlots([...slots, { id: '', name: '', requiredElements: '' }])}>+材料槽</Button>
          <div className="flex gap-1.5"><Button size="sm" onClick={() => setStep(2)}>上一步</Button><Button size="sm" onClick={() => setStep(4)}>下一步</Button></div>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-1"><input type="checkbox" checked={scored} onChange={(event) => setScored(event.target.checked)} />需要评分（独立评委量表）</label>
          <textarea className="w-full rounded-md border bg-background px-2 py-1" rows={3} placeholder="负责人自有规则（每行一条，如：F1 材料要素齐全）——留空则使用演示政策" value={policyText} onChange={(event) => setPolicyText(event.target.value)} />
          <p className="text-muted-foreground">依据：录入内容将作为负责人声明政策发布（origin=owner-statement）；留空则生成虚构演示政策。</p>
          <div className="flex gap-1.5"><Button size="sm" onClick={() => setStep(3)}>上一步</Button><Button size="sm" onClick={() => setStep(5)}>下一步</Button></div>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2 text-xs">
          <p>确认：{name}（{objectType}）· {fields.length} 字段 · {slots.length} 材料槽 · {scored ? '含评分' : '无评分'} · 两级审核{scored ? '+独立评分' : ''}</p>
          <div className="flex gap-1.5"><Button size="sm" onClick={() => setStep(4)}>上一步</Button><Button size="sm" onClick={() => void finish()}>校验并发布</Button></div>
        </div>
      )}
      {step === 6 && publishedId && (
        <p className="text-xs text-emerald-600">已发布：{publishedId}（可在创建案卷时选用）</p>
      )}
    </div>
  )
}
