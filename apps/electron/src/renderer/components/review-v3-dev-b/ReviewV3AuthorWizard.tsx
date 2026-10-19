/**
 * Dev-B's own no-code authoring surface, not mounted into Dev-C-owned workbench.
 * Dev-C must provide Main-authorized save/preview/freeze callbacks. This renderer
 * only edits author source; it cannot install a Case, publish policy or grant roles.
 */
import { useRef, useState, type ReactNode } from 'react'
import { B1BufferedIdentityInput } from './B1BufferedIdentityInput'
import {
  exportB1AuthorCandidate, parseB1TrialInput, prepareB1TechnicalTrial,
  type B1TrialValues,
} from './review-v3-author-trial'
import {
  b1AuthorHasUnsavedEdits, deleteB1AuthorIdentity, nextB1AuthorId, renameB1AuthorIdentity, renameB1TrialKey,
} from './review-v3-author-edit'
import type {
  B1AuthorDocument, B1Field, B1Obligation, B1Source, B1Target,
  ImmutablePlanDescriptorB1,
} from '../../../main/lib/review/review-template-plan-adapter-v3-b1'

export interface B1AuthorWizardProps {
  /** Main supplies verified author; never accept this identity from the UI. */
  onSaveDraft: (document: B1AuthorDocument, expectedRevision: number) => Promise<{ revision: number }>
  onPreview: (document: B1AuthorDocument) => Promise<ImmutablePlanDescriptorB1>
  onFreezeCandidate: (document: B1AuthorDocument, expectedRevision: number) => Promise<{ fingerprint: string }>
  initialDraft?: B1AuthorDocument
  initialRevision?: number
}

const sourceId = 'request'
export const emptyB1AuthorDocument = (): B1AuthorDocument => ({
  schemaVersion: 'review-b1/1', status: 'candidate-held', templateId: '',
  templateVersion: '1', name: '', purpose: '',
  sources: [{ sourceId, kind: 'user-declared', documentVersionId: 'author-user-declaration-v1',
    locator: 'author-wizard:explicit-input', recordedBy: 'local-author-unverified' }],
  fields: [], targets: [], modules: [{
    moduleId: 'core', version: '1', dependsOn: [], checks: [],
  }],
  stages: [{ stageId: 'manual-review', role: 'reviewer', mode: 'manual' }],
  outputs: [{ outputId: 'summary', kind: 'report' }],
})

const inputClass = 'w-full min-w-0 rounded border border-border bg-background px-2 py-1.5 text-sm'
const buttonClass = 'rounded border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40'
function Section({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return <section className="space-y-3 rounded-lg border border-border p-4">
    <h3 className="font-semibold">{title}</h3>{children}
  </section>
}
export function ReviewV3AuthorWizard({
  onSaveDraft, onPreview, onFreezeCandidate, initialDraft, initialRevision = 0,
}: B1AuthorWizardProps): ReactNode {
  const [draft, setDraft] = useState<B1AuthorDocument>(() => structuredClone(initialDraft ?? emptyB1AuthorDocument()))
  const [revision, setRevision] = useState(initialRevision)
  const [savedSnapshot, setSavedSnapshot] = useState<B1AuthorDocument|null>(()=>
    initialRevision>0 && initialDraft ? structuredClone(initialDraft) : null)
  const editEpoch = useRef(0)
  const isDirty = b1AuthorHasUnsavedEdits(draft,savedSnapshot)
  const [preview, setPreview] = useState<ImmutablePlanDescriptorB1 | null>(null)
  const [trial, setTrial] = useState<B1TrialValues>({})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const change = (update: (doc: B1AuthorDocument) => void): void => {
    editEpoch.current += 1
    setDraft((current) => { const next = structuredClone(current); update(next); return next })
    setPreview(null); setNotice(''); setError('')
  }
  const editIdentity = (
    type:'source'|'field'|'target',action:'rename'|'delete',from:string,to?:string,
  ):void => {
    try {
      const next=action==='rename'
        ? renameB1AuthorIdentity(draft,type,from,to??'')
        : deleteB1AuthorIdentity(draft,type,from)
      if(type==='field' || type==='target') {
        if(action==='rename') setTrial(current=>renameB1TrialKey(current,type,from,to??''))
        else if(type==='target') setTrial(current=>{
          const clone=structuredClone(current);delete clone[from];return clone
        })
        else setTrial(current=>{
          const clone=structuredClone(current)
          for(const values of Object.values(clone)) delete values[from]
          return clone
        })
      }
      editEpoch.current += 1
      setDraft(next);setPreview(null);setNotice('');setError('')
    } catch(reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    }
  }
  const sampleValue = (targetKey: string, fieldKey: string): string => {
    const value=trial[targetKey]?.[fieldKey]
    return value === null || value === undefined ? '' : String(value)
  }
  const setSampleValue = (targetKey: string, field: B1Field, raw: string): void => {
    try {
      const value=parseB1TrialInput(field,raw)
      editEpoch.current += 1
      setTrial(current => ({
        ...current, [targetKey]: {...current[targetKey], [field.key]:value},
      }))
      setPreview(null);setNotice('');setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    }
  }
  const exportCandidate = (): void => {
    try {
      const payload=exportB1AuthorCandidate(draft)
      const data=new Blob([payload],{type:'application/json;charset=utf-8'})
      const href=URL.createObjectURL(data)
      const anchor=document.createElement('a')
      anchor.href=href
      anchor.download=(draft.templateId || 'unpublished-business').replace(/[^A-Za-z0-9._-]/g,'_')+'.candidate.json'
      anchor.click()
      URL.revokeObjectURL(href)
      setNotice('候选作者配置已导出：仅记录声明，不包含试跑样例，也不代表政策发布')
    } catch (reason) {setError(reason instanceof Error ? reason.message : String(reason))}
  }
  const updateField = (index: number, key: keyof B1Field, value: unknown): void =>
    change((doc) => { (doc.fields[index] as unknown as Record<string, unknown>)[key] = value })
  const updateSource = (index: number, key: keyof B1Source, value: unknown): void =>
    change((doc) => { (doc.sources[index] as unknown as Record<string, unknown>)[key] = value })
  const updateTarget = (index: number, key: keyof B1Target, value: unknown): void =>
    change((doc) => { (doc.targets[index] as unknown as Record<string, unknown>)[key] = value })
  const updateCheck = (index: number, key: keyof B1Obligation, value: unknown): void =>
    change((doc) => { (doc.modules[0]!.checks[index] as unknown as Record<string, unknown>)[key] = value })
  const fieldForCheck = (check:B1Obligation):B1Field|undefined => {
    // Bind the discriminated union before entering find()'s callback. React
    // render closures must never assume an 'always' condition has fieldKey.
    const condition=check.condition
    if(condition.kind!=='field-equals')return undefined
    return draft.fields.find(field=>field.key===condition.fieldKey)
  }
  const defaultComparator = (fieldKey:string): string | number | boolean => {
    const field=draft.fields.find(f=>f.key===fieldKey)
    if (!field || field.type==='evidence') return 'example'
    switch(field.type) {
      case 'number': return 0
      case 'boolean': return true
      case 'enum': return field.enumValues?.[0] ?? 'example'
      case 'date': return '2026-01-01'
      default: return 'example'
    }
  }
  const updateConditionEquals = (index:number, fieldKey:string, raw:string): void => {
    try {
      const field=draft.fields.find(f=>f.key===fieldKey)
      if (!field || field.type==='evidence') throw new Error('B1_CONDITION_SOURCE_UNSUPPORTED')
      const value=parseB1TrialInput(field,raw)
      if (value===null) throw new Error('B1_CONDITION_VALUE_REQUIRED')
      updateCheck(index,'condition',{kind:'field-equals',fieldKey,equals:value})
    } catch(reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
  }
  const perform = async (mode: 'save' | 'preview' | 'freeze'): Promise<void> => {
    setBusy(true); setError(''); setNotice('')
    const epoch=editEpoch.current
    try {
      const copy = structuredClone(draft)
      if (mode === 'save') {
        const saved = await onSaveDraft(copy, revision)
        setRevision(saved.revision)
        setSavedSnapshot(copy)
        setNotice(epoch===editEpoch.current
          ? `草稿已保存为第 ${saved.revision} 次修订（未正式发布）`
          : '保存了操作开始时的修订；期间的新编辑仍未保存，请重新保存')
      } else if (mode === 'preview') {
        const result = await onPreview(prepareB1TechnicalTrial(copy,trial))
        if(epoch===editEpoch.current) {
          setPreview(result)
          setNotice('技术规则预览已生成；不代表学校制度审核通过')
        } else {
          setNotice('预览期间作者内容或样例已改变，请重新运行')
        }
      } else {
        if(isDirty) throw new Error('B1_AUTHOR_UNSAVED_CHANGES: 请先保存当前草稿，再冻结候选')
        const frozen = await onFreezeCandidate(copy, revision)
        if(epoch===editEpoch.current)
          setNotice('不可变候选已冻结：' + frozen.fingerprint.slice(0, 24) + '…（仍未发布）')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally { setBusy(false) }
  }
  const checks = draft.modules[0]?.checks ?? []
  return <div className="space-y-4 text-foreground" data-testid="review-v3-b1-author-wizard">
    <header className="space-y-2">
      <h2 className="text-xl font-bold">自建审核业务</h2>
      <p className="text-sm text-muted-foreground">从空白创建业务、材料字段、核验责任和工作流程。所有内容仅为作者候选；学校制度发布需另行授权。</p>
      <p className="text-xs text-muted-foreground">作者态修订 #{revision} · candidate-held · 未获政策批准 · {isDirty?'有未保存修改':'当前显示内容已保存'}</p>
    </header>
    <Section title="1. 业务定义">
      <label className="block text-sm">业务标识（英文/数字/连字符）
        <input className={inputClass} value={draft.templateId} placeholder="laboratory-use"
          onChange={(e) => change((d) => { d.templateId = e.target.value })} />
      </label>
      <label className="block text-sm">业务名称
        <input className={inputClass} value={draft.name} placeholder="实验室使用申请"
          onChange={(e) => change((d) => { d.name = e.target.value })} />
      </label>
      <label className="block text-sm">审核目的与范围
        <textarea className={inputClass} value={draft.purpose} rows={2}
          onChange={(e) => change((d) => { d.purpose = e.target.value })} />
      </label>
      <label className="block text-sm">候选版本
        <input className={inputClass} value={draft.templateVersion}
          onChange={(e) => change((d) => { d.templateVersion = e.target.value })} />
      </label>
    </Section>
    <Section title="2. 业务依据及材料来源">
      {draft.sources.map((source, i) => <div key={i} className="grid gap-2 rounded border border-border p-2 sm:grid-cols-2">
        <label className="text-xs">来源 ID
          <B1BufferedIdentityInput className={inputClass} value={source.sourceId}
            onCommit={next=>editIdentity('source','rename',source.sourceId,next)} />
        </label>
        <label className="text-xs">来源性质
          <select className={inputClass} value={source.kind}
            onChange={(e) => updateSource(i,'kind',e.target.value)}>
            <option value="user-declared">用户明确声明</option>
            <option value="policy-candidate">制度候选（未核实）</option>
          </select>
        </label>
        <label className="text-xs">原始版本标识
          <input className={inputClass} value={source.documentVersionId}
            onChange={(e) => updateSource(i,'documentVersionId',e.target.value)} />
        </label>
        <label className="text-xs">原文定位/声明输入
          <input className={inputClass} value={source.locator}
            onChange={(e) => updateSource(i,'locator',e.target.value)} />
        </label>
        <button type="button" className={buttonClass} onClick={() => editIdentity('source','delete',source.sourceId)}>删除来源</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={() => change((d) => {
        d.sources.push({sourceId:nextB1AuthorId(d.sources.map(s=>s.sourceId),'source'),kind:'user-declared',
          documentVersionId:'unverified-source-version', locator:'author-explicit-input',
          recordedBy:'local-author-unverified'})
      })}>添加来源</button>
    </Section>
    <Section title="3. 申请字段及材料要求">
      {draft.fields.map((field,i) => <div key={i} className="grid gap-2 rounded border border-border p-2 sm:grid-cols-2">
        <label className="text-xs">字段键
          <B1BufferedIdentityInput className={inputClass} value={field.key}
            onCommit={next=>editIdentity('field','rename',field.key,next)}/>
        </label>
        <label className="text-xs">显示名称
          <input className={inputClass} value={field.label} onChange={(e)=>updateField(i,'label',e.target.value)}/>
        </label>
        <label className="text-xs">字段类型
          <select className={inputClass} value={field.type} onChange={(e)=>change((d)=>{
            const f=d.fields[i]!
            f.type=e.target.value as B1Field['type']
            if(f.type==='enum') f.enumValues=['选项一','选项二']
            else delete f.enumValues
          })}>
            <option value="text">文本</option><option value="number">数字</option>
            <option value="date">日期</option><option value="boolean">是否</option>
            <option value="enum">枚举</option><option value="evidence">证明附件</option>
          </select>
        </label>
        <label className="text-xs">责任来源
          <select className={inputClass} value={field.sourceId}
            onChange={(e)=>updateField(i,'sourceId',e.target.value)}>
            {draft.sources.map((s)=> <option key={s.sourceId} value={s.sourceId}>{s.sourceId}</option>)}
          </select>
        </label>
        {field.type==='enum' && <label className="text-xs sm:col-span-2">选项（用逗号分隔）
          <input className={inputClass} value={field.enumValues?.join(',')??''}
            onChange={(e)=>updateField(i,'enumValues',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}/>
        </label>}
        <label className="text-sm"><input type="checkbox" checked={field.required}
          onChange={(e)=>updateField(i,'required',e.target.checked)}/> 必填字段</label>
        <button type="button" className={buttonClass} onClick={()=>editIdentity('field','delete',field.key)}>删除字段</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={()=>change((d)=>{
        d.fields.push({ key:nextB1AuthorId(d.fields.map(f=>f.key),'field'),label:'新字段',type:'text',required:true,
          sourceId:d.sources[0]?.sourceId??''})
      })}>添加字段</button>
    </Section>
    <Section title="4. 对象与预览样本">
      <p className="text-xs text-muted-foreground">对象用于技术预览；正式案卷绑定必须由 Main/Dev-C 按实际 Subject 再编译。</p>
      {draft.targets.map((target,i)=><div key={i} className="grid gap-2 rounded border border-border p-2 sm:grid-cols-2">
        {(['targetKey','objectKey','subjectId','scenario'] as const).map((key)=><label key={key} className="text-xs">{key}
          {key==='targetKey'
            ? <B1BufferedIdentityInput className={inputClass} value={target.targetKey}
                onCommit={next=>editIdentity('target','rename',target.targetKey,next)}/>
            : <input className={inputClass} value={target[key]}
                onChange={e=>updateTarget(i,key,e.target.value)}/>} 
        </label>)}
        <div className="space-y-2 sm:col-span-2">
          <p className="text-xs text-muted-foreground">试跑样例值，仅用于技术预览，不写入作者草稿或正式案卷；留空保持 unknown。</p>
          {draft.fields.map(field => <label key={field.key} className="block text-xs">{field.label}（{field.key}）
            {field.type === 'evidence' ? <p className="text-xs text-muted-foreground">证明附件需经 B2 真正原件/SourceIdentity 校验，不能以样例值代替。</p>
            : field.type === 'boolean' ? <select className={inputClass} value={sampleValue(target.targetKey,field.key)}
              onChange={e=>setSampleValue(target.targetKey,field,e.target.value)}>
              <option value="">未知 / 尚无证据</option><option value="true">是</option><option value="false">否</option>
            </select> : field.type === 'enum' ? <select className={inputClass} value={sampleValue(target.targetKey,field.key)}
              onChange={e=>setSampleValue(target.targetKey,field,e.target.value)}>
              <option value="">未知 / 尚未声明</option>
              {(field.enumValues??[]).map(v=><option key={v} value={v}>{v}</option>)}
            </select> : <input className={inputClass}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={sampleValue(target.targetKey,field.key)}
              onChange={e=>setSampleValue(target.targetKey,field,e.target.value)}/>}
          </label>)}
        </div>
        <button type="button" className={buttonClass} onClick={()=>editIdentity('target','delete',target.targetKey)}>删除对象</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={()=>change((d)=>{
        d.targets.push({
          targetKey:nextB1AuthorId(d.targets.map(t=>t.targetKey),'target'),
          objectKey:nextB1AuthorId(d.targets.map(t=>t.objectKey),'object'),
          subjectId:nextB1AuthorId(d.targets.map(t=>t.subjectId),'subject'),
          scenario:'generic-object',fieldValues:{},
        })
      })}>添加对象</button>
    </Section>
    <Section title="5. 核验责任与适用条件">
      {checks.map((check,i)=><div key={i} className="space-y-2 rounded border border-border p-2">
        <label className="block text-xs">Check ID
          <input className={inputClass} value={check.checkKey} onChange={(e)=>updateCheck(i,'checkKey',e.target.value)}/>
        </label>
        <label className="block text-xs">应履行的责任/核验要求
          <textarea className={inputClass} rows={2} value={check.requirement}
            onChange={(e)=>updateCheck(i,'requirement',e.target.value)}/>
        </label>
        <label className="block text-xs">责任承担者
          <input className={inputClass} value={check.responsibility}
            onChange={(e)=>updateCheck(i,'responsibility',e.target.value)}/>
        </label>
        <label className="block text-xs">规则依据
          <select className={inputClass} multiple value={check.sourceIds}
            onChange={(e)=>updateCheck(i,'sourceIds',Array.from(e.currentTarget.selectedOptions, o=>o.value))}>
            {draft.sources.map((s)=><option key={s.sourceId} value={s.sourceId}>{s.sourceId}</option>)}
          </select>
        </label>
        <div className="text-xs">适用对象（可多选）</div>
        <div className="flex flex-wrap gap-3">{draft.targets.map(t=><label key={t.targetKey} className="text-xs">
          <input type="checkbox" checked={check.targetKeys.includes(t.targetKey)} onChange={(e)=>change((d)=>{
            const keys=new Set(d.modules[0]!.checks[i]!.targetKeys)
            if(e.target.checked)keys.add(t.targetKey);else keys.delete(t.targetKey)
            d.modules[0]!.checks[i]!.targetKeys=[...keys]
          })}/> {t.targetKey}
        </label>)}</div>
        <label className="block text-xs">适用条件
          <select className={inputClass} value={check.condition.kind} onChange={(e)=>updateCheck(i,'condition',
            e.target.value==='always' ? {kind:'always'} : {
              kind:'field-equals',
              fieldKey:draft.fields.find(f=>f.type!=='evidence')?.key??'',
              equals:defaultComparator(draft.fields.find(f=>f.type!=='evidence')?.key??''),
            })}>
            <option value="always">始终适用</option><option value="field-equals">字段等于指定值</option>
          </select>
        </label>
        {check.condition.kind==='field-equals'&&<div className="grid gap-2 sm:grid-cols-2">
          <select className={inputClass} value={check.condition.fieldKey} onChange={(e)=>updateCheck(i,'condition',{
            kind:'field-equals',fieldKey:e.target.value,equals:defaultComparator(e.target.value),
          })}>{draft.fields.filter(f=>f.type!=='evidence').map(f=>
              <option key={f.key} value={f.key}>{f.label}</option>)}</select>
          {fieldForCheck(check)?.type==='boolean' ?
            <select className={inputClass} value={String(check.condition.equals)} onChange={e=>
              updateConditionEquals(i,check.condition.kind==='field-equals'?check.condition.fieldKey:'',e.target.value)}>
              <option value="true">是</option><option value="false">否</option>
            </select> :
            fieldForCheck(check)?.type==='enum' ?
            <select className={inputClass} value={String(check.condition.equals)} onChange={e=>
              updateConditionEquals(i,check.condition.kind==='field-equals'?check.condition.fieldKey:'',e.target.value)}>
              {fieldForCheck(check)?.enumValues?.map(v=>
                <option key={v} value={v}>{v}</option>)}
            </select> :
            <input className={inputClass}
              type={fieldForCheck(check)?.type==='number'?'number':
                fieldForCheck(check)?.type==='date'?'date':'text'}
              value={String(check.condition.equals)} onChange={e=>
                updateConditionEquals(i,check.condition.kind==='field-equals'?check.condition.fieldKey:'',e.target.value)}/>}
        </div>}
        <button type="button" className={buttonClass} onClick={()=>change((d)=>{d.modules[0]!.checks.splice(i,1)})}>删除 Check（版本升级需授权确认）</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={()=>change((d)=>{
        d.modules[0]!.checks.push({
          checkKey:nextB1AuthorId(d.modules.flatMap(m=>m.checks.map(c=>c.checkKey)),'check'),requirement:'请填写原始责任',responsibility:'reviewer',
          sourceIds:d.sources[0]?[d.sources[0].sourceId]:[],
          targetKeys:d.targets.map(t=>t.targetKey),condition:{kind:'always'},
        })
      })}>添加 Check</button>
    </Section>
    <Section title="6. 流程阶段与输出">
      {draft.stages.map((stage,i)=><div key={i} className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs">阶段标识
          <input className={inputClass} value={stage.stageId}
            onChange={(e)=>change((d)=>{d.stages[i]!.stageId=e.target.value})}/>
        </label>
        <label className="text-xs">执行角色
          <input className={inputClass} value={stage.role}
            onChange={(e)=>change((d)=>{d.stages[i]!.role=e.target.value})}/>
        </label>
        <label className="text-xs">执行模式
          <select className={inputClass} value={stage.mode}
            onChange={(e)=>change((d)=>{d.stages[i]!.mode=e.target.value as 'manual'|'technical'})}>
            <option value="manual">人工流程</option><option value="technical">技术审核</option>
          </select>
        </label>
        <button type="button" className={buttonClass} onClick={()=>change((d)=>{d.stages.splice(i,1)})}>删除阶段</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={()=>change((d)=>{d.stages.push({
        stageId:nextB1AuthorId(d.stages.map(s=>s.stageId),'stage'),role:'reviewer',mode:'manual',
      })})}>添加阶段</button>
      {draft.outputs.map((output,i)=><div key={i} className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs">输出 ID
          <input className={inputClass} value={output.outputId}
            onChange={(e)=>change((d)=>{d.outputs[i]!.outputId=e.target.value})}/>
        </label>
        <label className="text-xs">输出类型
          <input className={inputClass} value={output.kind}
            onChange={(e)=>change((d)=>{d.outputs[i]!.kind=e.target.value})}/>
        </label>
        <button type="button" className={buttonClass} onClick={()=>change((d)=>{d.outputs.splice(i,1)})}>删除输出</button>
      </div>)}
      <button type="button" className={buttonClass} onClick={()=>change((d)=>{d.outputs.push({
        outputId:nextB1AuthorId(d.outputs.map(o=>o.outputId),'output'),kind:'report',
      })})}>添加输出</button>
    </Section>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} className={buttonClass} onClick={()=>void perform('save')}>保存修订</button>
      <button type="button" disabled={busy} className={buttonClass} onClick={()=>void perform('preview')}>技术预览 / 试跑规则</button>
      <button type="button" disabled={busy || isDirty} title={isDirty?'先保存当前修改才能冻结':'冻结已保存修订'} className={buttonClass} onClick={()=>void perform('freeze')}>冻结候选（非正式发布）</button>
      <button type="button" disabled={busy} className={buttonClass} onClick={exportCandidate}>导出候选配置</button>
    </div>
    {error && <p role="alert" className="text-sm text-red-500">未执行：{error}</p>}
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {preview && <Section title="候选编译与三值适用性预览">
      <p className="text-xs">仅为样例试跑：结果随试跑字段改变，不是学校政策或正式材料符合性判断。</p>
      <p className="text-xs">fingerprint: {preview.canonicalPlan.fingerprint}</p>
      <p className="text-xs">Check × target 绑定：{preview.canonicalPlan.bindings.length} 条；unknown：
        {preview.canonicalPlan.bindings.filter(b=>b.applicability==='unknown').length} 条</p>
      <div className="space-y-1">{preview.canonicalPlan.bindings.map((b,i)=><p key={i} className="text-xs">
        {b.checkKey} → {b.targetKey} · {b.applicability} · {b.sourceVersionIds.join(', ')}
      </p>)}</div>
      <p className="text-xs">无权据此认定审批通过；真正的安装与签署由 Dev-C/授权政策门禁处理。</p>
    </Section>}
  </div>
}
