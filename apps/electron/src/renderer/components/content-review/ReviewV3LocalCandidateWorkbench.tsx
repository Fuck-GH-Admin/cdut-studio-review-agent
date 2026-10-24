/**
 * C-owned renderer entry for B's actual B1 candidate author and Main IPC.
 * The saved B1 revision survives app restart; no school publication is implied.
 */
import * as React from 'react'
import { useSetAtom } from 'jotai'
import { reviewWorkspaceSectionAtom } from '@/atoms/review-atoms'
import { reviewV2AggregateAtom } from './V2CasePanel'
import { ReviewV3LocalManualItem } from './ReviewV3LocalManualItem'
import { ReviewV3LocalPiControls } from './ReviewV3LocalPiControls'
import { ReviewV3UnifiedRun } from './ReviewV3UnifiedRun'
import { ReviewV3T08ReportPanel } from './ReviewV3T08ReportPanel'
import { ReviewV3TemplateRoutingAssistant } from './ReviewV3TemplateRoutingAssistant'
import { REVIEW_V3_OTHER_MATERIAL_SLOT_ID, type CaseAggregateV2, type ReviewRunV2, type TemplateVersion } from '@profer/shared'
import { ReviewV3AuthorWizard, emptyB1AuthorDocument } from '../review-v3-dev-b/ReviewV3AuthorWizard'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
import type { B1CandidateReadResponse } from '../review-v3-dev-b/review-v3-author-revision-read'

type ClassifiedMaterialRole='application'|'evidence'|'rule'
type MaterialClassificationDraft={role:ClassifiedMaterialRole;materialSlotId:string}
function normalizedMaterialLabel(value:string):string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi,'')
}
function suggestMaterialSlot(fileName:string,template:TemplateVersion):TemplateVersion['materialSlots'][number]|undefined {
  const stem=fileName.replace(/\.[^.]+$/,'')
  const normalized=normalizedMaterialLabel(stem)
  if(normalized.length<3)return undefined
  const matches=(template.materialSlots??[]).filter(slot=>{
    const name=normalizedMaterialLabel(slot.name)
    return name.length>=3&&(normalized.includes(name)||name.includes(normalized))
  })
  return matches.length===1?matches[0]:undefined
}

export function ReviewV3LocalCandidateWorkbench({initialCaseId}:{initialCaseId?:string}={}):React.ReactElement {
  const goToCase=useSetAtom(reviewWorkspaceSectionAtom)
  const showCase=useSetAtom(reviewV2AggregateAtom)
  const [caseTitle,setCaseTitle]=React.useState('本地人工审核')
  const [caseApplicant,setCaseApplicant]=React.useState('本机用户')
  const [caseYear,setCaseYear]=React.useState(String(new Date().getFullYear()))
  const [localCaseId,setLocalCaseId]=React.useState('')
  React.useEffect(()=>{
    if (initialCaseId) setLocalCaseId(initialCaseId)
  },[initialCaseId])
  const [savedCases,setSavedCases]=React.useState<Array<{id:string;title:string}>>([])
  const [b1Frozen,setB1Frozen]=React.useState<{templateId:string;fingerprint:string}|null>(null)
  const [b1Notice,setB1Notice]=React.useState('')
  const [b1Error,setB1Error]=React.useState('')
  const [materialsEpoch,setMaterialsEpoch]=React.useState(0)
  const [activePlan,setActivePlan]=React.useState<{
    templateId:string;templateVersion:number;checks:number;fingerprint:string
  }|null>(null)
  const [nativeAggregate,setNativeAggregate]=React.useState<CaseAggregateV2|null>(null)
  const [currentTemplate,setCurrentTemplate]=React.useState<TemplateVersion|null>(null)
  const [materialDrafts,setMaterialDrafts]=React.useState<Record<string,MaterialClassificationDraft>>({})
  const [classificationBusy,setClassificationBusy]=React.useState(false)
  const [classificationError,setClassificationError]=React.useState('')
  const [classificationNotice,setClassificationNotice]=React.useState('')
  const [nativeRun,setNativeRun]=React.useState<ReviewRunV2|null>(null)
  const [nativeRunStale,setNativeRunStale]=React.useState(true)
  const [runEpoch,setRunEpoch]=React.useState(0)
  React.useEffect(()=>{
    setActivePlan(null);setNativeAggregate(null)
    if(!localCaseId)return
    let mounted=true
    void (async()=>{
      try{
        const aggregate=await window.reviewAPI.getAggregateV2(localCaseId)
        if(!mounted)return
        setNativeAggregate(aggregate??null)
        if(aggregate?.d2RuntimePlan){
          const plan=aggregate.d2RuntimePlan
          setActivePlan({templateId:plan.templateId,templateVersion:plan.templateVersion,
            checks:plan.mapping.length,fingerprint:plan.fingerprint})
        }
      }catch(e){if(mounted)setCaseError(e instanceof Error?e.message:String(e))}
    })()
    return ()=>{mounted=false}
  },[localCaseId,materialsEpoch])
  React.useEffect(()=>{
    setNativeRun(null);setNativeRunStale(true)
    if (!localCaseId) return
    let live=true
    void (async()=>{
      const runs=await window.reviewAPI.listRunsV2(localCaseId)
      const latest=[...runs].sort((a,b)=>b.startedAt.localeCompare(a.startedAt))[0]??null
      if (!live) return
      setNativeRun(latest)
      if (!latest || latest.status==='queued' || latest.status==='running') return
      const stale=await window.reviewAPI.getWorkspaceRunValidityV2({caseId:localCaseId,runId:latest.id})
      if (live) setNativeRunStale(stale)
    })().catch(()=>{if(live)setNativeRunStale(true)})
    return()=>{live=false}
  },[localCaseId,materialsEpoch,runEpoch])
  const refreshNativeAggregate=React.useCallback(async()=>{
    if (!localCaseId)return
    const refreshed=await window.reviewAPI.getAggregateV2(localCaseId)
    if(refreshed)setNativeAggregate(refreshed)
    setRunEpoch(epoch=>epoch+1)
  },[localCaseId])
  const [dropActive,setDropActive]=React.useState(false)
  const [dropRole,setDropRole]=React.useState<'application'|'evidence'>('application')
  const [caseBusy,setCaseBusy]=React.useState(false)
  const [caseNotice,setCaseNotice]=React.useState('')
  const [caseError,setCaseError]=React.useState('')
  React.useEffect(()=>{
    setCurrentTemplate(null)
    if(!nativeAggregate||nativeAggregate.d2RuntimePlan||nativeAggregate.caseV2.templateVersion<1)return
    let live=true
    void window.reviewAPI.getTemplateV2(nativeAggregate.caseV2.templateId,nativeAggregate.caseV2.templateVersion)
      .then(template=>{if(live)setCurrentTemplate(template??null)})
      .catch(cause=>{if(live)setClassificationError(cause instanceof Error?cause.message:String(cause))})
    return()=>{live=false}
  },[nativeAggregate?.caseV2.templateId,nativeAggregate?.caseV2.templateVersion,Boolean(nativeAggregate?.d2RuntimePlan)])
  React.useEffect(()=>{
    if(!nativeAggregate){setMaterialDrafts({});return}
    const validSlots=new Set([
      REVIEW_V3_OTHER_MATERIAL_SLOT_ID,
      ...(currentTemplate?.materialSlots??[]).map(slot=>slot.id),
    ])
    const active=nativeAggregate.caseV2.documents.filter(document=>document.active!==false)
    setMaterialDrafts(Object.fromEntries(active.map(document=>{
      const role:ClassifiedMaterialRole=document.role==='application'||document.role==='rule'?document.role:'evidence'
      const materialSlotId=document.materialSlotId&&validSlots.has(document.materialSlotId)?document.materialSlotId:''
      return [document.versionId,{role,materialSlotId}]
    })))
    setClassificationError('')
  },[nativeAggregate?.caseV2.id,nativeAggregate?.caseV2.revision,currentTemplate?.templateId,currentTemplate?.version])
  const [templateId,setTemplateId]=React.useState('')
  const [loaded,setLoaded]=React.useState<{document:B1AuthorDocument;revision:number}|null>(null)
  const [key,setKey]=React.useState(0)
  const [busy,setBusy]=React.useState(false)
  const [error,setError]=React.useState('')
  const [message,setMessage]=React.useState('')
  const readLatest=React.useCallback(async (id:string):Promise<B1CandidateReadResponse>=>{
    const response=await window.reviewAPI.readCurrentAuthorRevisionV3({templateId:id})
    return {schemaVersion:'review-b1-author-read/1',templateId:response.templateId,
      revision:response.revision,digest:response.sourceDigest,
      document:response.document as B1AuthorDocument,candidateStatus:'candidate-held'}
  },[])
  const reopen=async ():Promise<void>=>{
    if(busy)return
    if(loaded && !window.confirm('切换作者修订可能舍弃编辑器中尚未保存的修改，确定继续？'))return
    setBusy(true);setError('');setMessage('')
    try{
      const source=await readLatest(templateId.trim())
      setLoaded({document:source.document,revision:source.revision})
      // A preview is not a frozen candidate. The existing B1 editor must
      // explicitly freeze the loaded revision before the install button enables.
      setB1Frozen(null)
      setKey(k=>k+1)
      setMessage('已从 Main 重新读取本机保存的候选修订 '+source.revision)
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }
  const listSavedCases=async ():Promise<void>=>{
    if(caseBusy)return
    setCaseBusy(true);setCaseError('')
    try{
      const cases=await window.reviewAPI.listCases()
      setSavedCases(cases.map(item=>({id:item.id,title:item.title})))
      setCaseNotice('已列出本地已保存案卷（含只读历史）；选择后可以重新打开。')
    }catch(e){setCaseError(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const createCase=async ():Promise<void>=>{
    if(caseBusy)return
    setCaseBusy(true);setCaseError('');setCaseNotice('')
    try{
      const created=await window.reviewAPI.createCase({
        title:caseTitle.trim(),type:'自定义审核',
        applicant:caseApplicant.trim(),academicYear:caseYear.trim(),
        reviewTemplate:null,
      })
      setLocalCaseId(created.id)
      setSavedCases([])
      setCaseNotice('本机原生案卷已创建：'+created.id+'；未绑定校方模板，请先导入材料并人工审核。')
    }catch(e){setCaseError(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const freezeB1=async(document:B1AuthorDocument,expectedRevision:number):Promise<{fingerprint:string}>=>{
    const result=await window.reviewAPI.freezeLocalCandidateAuthorV3({document,expectedRevision})
    setB1Frozen({templateId:document.templateId,fingerprint:result.fingerprint})
    setB1Notice('第51套已冻结，可绑定当前本机案卷。')
    return result
  }
  const attachB1=async():Promise<void>=>{
    if(caseBusy||!localCaseId||!b1Frozen)return
    setCaseBusy(true);setB1Error('');setB1Notice('')
    try{
      const ack=await window.reviewAPI.attachB1TechnicalPlanV3({caseId:localCaseId,...b1Frozen})
      setB1Notice('本案已安装 '+ack.checks+' 项真实 Pi 检查；可以启动审核')
      setMaterialsEpoch(x=>x+1)
    }catch(e){setB1Error(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const importMaterial=async (role:'application'|'evidence'):Promise<void>=>{
    if(caseBusy||!localCaseId)return
    setCaseBusy(true);setCaseError('');setCaseNotice('')
    try{
      const imported=await window.reviewAPI.importDocument({caseId:localCaseId,role})
      if(imported.canceled){setCaseNotice('已取消选择，没有导入原件')}
      else{
        setMaterialsEpoch(x=>x+1)
        setCaseNotice((role==='application'?'申请原件':'证明材料')+'：成功导入 '+imported.documents.length+' 份；失败 '+imported.failures.length+' 份')
        if(imported.failures.length)
          setCaseError(imported.failures.map(x=>x.fileName+': '+x.message).join('；').slice(0,500))
      }
    }catch(e){setCaseError(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const dropMaterials=async(event:React.DragEvent<HTMLDivElement>):Promise<void>=>{
    event.preventDefault()
    event.stopPropagation()
    setDropActive(false)
    if(!localCaseId||caseBusy)return
    const files=Array.from(event.dataTransfer.files)
    if(!files.length)return
    setCaseBusy(true);setCaseNotice('');setCaseError('')
    let imported=0
    const errors:string[]=[]
    try{
      for(const file of files){
        try{
          const sourcePath=window.electronAPI.getPathForFile(file)
          if(!sourcePath)throw new Error('无法读取系统拖拽文件路径')
          await window.reviewAPI.registerMaterialPathV2({
            caseId:localCaseId,sourcePath,role:dropRole,fileName:file.name,
          })
          imported++
        }catch(reason){
          errors.push(file.name+': '+(reason instanceof Error?reason.message:String(reason)))
        }
      }
      if(imported)setMaterialsEpoch(x=>x+1)
      setCaseNotice('拖入 '+files.length+' 份材料，成功 '+imported+' 份，失败 '+errors.length+' 份；已记录到当前案卷')
      if(errors.length)setCaseError(errors.join('；').slice(0,800))
    }finally{setCaseBusy(false)}
  }
  const exportLocalMd=async ():Promise<void>=>{
    if(caseBusy||!localCaseId)return
    setCaseBusy(true);setCaseError('');setCaseNotice('')
    try{
      const fresh=await window.reviewAPI.getAggregateV2(localCaseId)
      if(!fresh||fresh.caseV2.id!==localCaseId)
        throw new Error('案卷不存在；请重新读取当前原生案卷')
      const exported=await window.reviewAPI.exportReportV2(localCaseId)
      setCaseNotice('已生成本地 Markdown 报告：'+exported.file)
    }catch(e){setCaseError(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const openCase=async ():Promise<void>=>{
    if(caseBusy||!localCaseId)return
    setCaseBusy(true);setCaseError('')
    try{
      const aggregate=await window.reviewAPI.openAggregateV2(localCaseId)
      if(!aggregate)throw new Error('未找到该原生案卷；请确认本机案卷 ID。')
      showCase(aggregate)
      goToCase('case-v2')
    }catch(e){setCaseError(e instanceof Error?e.message:String(e))}
    finally{setCaseBusy(false)}
  }
  const start=():void=>{
    if(loaded && !window.confirm('新建编辑器会舍弃尚未保存的修改，确定继续？'))return
    setLoaded(null);setKey(k=>k+1);setError('');setMessage('本地未发布候选草稿')
  }
  const activeMaterialDocs=nativeAggregate?.caseV2.documents.filter(document=>document.active!==false)??[]
  const validMaterialSlotIds=new Set((currentTemplate?.materialSlots??[]).map(slot=>slot.id))
  const classificationComplete=!!currentTemplate&&currentTemplate.status==='published'&&activeMaterialDocs.length>0&&
    activeMaterialDocs.every(document=>document.materialSlotId===REVIEW_V3_OTHER_MATERIAL_SLOT_ID||
      (typeof document.materialSlotId==='string'&&validMaterialSlotIds.has(document.materialSlotId)))&&
    activeMaterialDocs.filter(document=>document.role==='application').length===1
  const draftClassificationReady=!!currentTemplate&&activeMaterialDocs.length>0&&
    activeMaterialDocs.every(document=>{
      const draft=materialDrafts[document.versionId]
      return !!draft?.materialSlotId&&(draft.materialSlotId===REVIEW_V3_OTHER_MATERIAL_SLOT_ID||
        validMaterialSlotIds.has(draft.materialSlotId))
    })&&activeMaterialDocs.filter(document=>materialDrafts[document.versionId]?.role==='application').length===1
  const saveMaterialClassification=async():Promise<void>=>{
    if(classificationBusy||!localCaseId||!currentTemplate||!nativeAggregate)return
    if(!draftClassificationReady){
      setClassificationError('请为每份当前材料选择一个模板槽位或“其他/通用附件”，并且恰好保留一份申请主件。')
      return
    }
    setClassificationBusy(true);setClassificationError('');setClassificationNotice('')
    try{
      for(const document of activeMaterialDocs){
        const draft=materialDrafts[document.versionId]!
        const oldRole:ClassifiedMaterialRole=document.role==='application'||document.role==='rule'?document.role:'evidence'
        if(draft.role===oldRole&&draft.materialSlotId===(document.materialSlotId??''))continue
        await window.reviewAPI.classifyNativeMaterialV3({
          caseId:localCaseId,documentVersionId:document.versionId,
          role:draft.role,materialSlotId:draft.materialSlotId,
        })
      }
      const refreshed=await window.reviewAPI.getAggregateV2(localCaseId)
      if(refreshed)setNativeAggregate(refreshed)
      setMaterialsEpoch(epoch=>epoch+1)
      setClassificationNotice('材料分类已保存为可追溯的新材料版本。现在可以按当前模板判断哪些槽位确实缺件；原有运行会因输入变化而过期。')
    }catch(cause){
      setClassificationError(cause instanceof Error?cause.message:String(cause))
      try{
        const refreshed=await window.reviewAPI.getAggregateV2(localCaseId)
        if(refreshed)setNativeAggregate(refreshed)
        setMaterialsEpoch(epoch=>epoch+1)
      }catch{/* 保留原始分类错误 */}
    }finally{setClassificationBusy(false)}
  }
  return <div className="mx-auto max-w-5xl space-y-4 px-4 pb-8">
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-base font-semibold">新建本地审核案卷与原件导入</h2>
      <p className="text-xs text-muted-foreground">调用已有 C 原生案卷存储与系统文件选择器。原生案卷保存材料和已选择的已发布模板；候选作者草稿单独保存，需完成模板选择后再运行 Pi。</p>
      <div className="flex flex-wrap gap-2">
        <input aria-label="本地案卷标题" value={caseTitle} onChange={e=>setCaseTitle(e.target.value)}
          className="min-w-44 flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm" placeholder="案卷标题"/>
        <input aria-label="申请主体" value={caseApplicant} onChange={e=>setCaseApplicant(e.target.value)}
          className="min-w-32 flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm" placeholder="申请主体"/>
        <input aria-label="学年" value={caseYear} onChange={e=>setCaseYear(e.target.value)}
          className="w-24 rounded border border-border bg-background px-2 py-1.5 text-sm" placeholder="学年"/>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!caseTitle.trim()||!caseApplicant.trim()||!caseYear.trim()}
          onClick={()=>void createCase()}>创建原生无绑定案卷</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="当前本机案卷 ID" className="min-w-44 flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm"
          placeholder="本机已有案卷 ID 可直接粘贴重开" value={localCaseId} onChange={e=>setLocalCaseId(e.target.value)}/>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy} onClick={()=>void listSavedCases()}>列出本机历史案卷</button>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!localCaseId} onClick={()=>void importMaterial('application')}>选择并导入真实申请材料</button>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!localCaseId} onClick={()=>void importMaterial('evidence')}>选择并导入证明材料</button>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!localCaseId} onClick={()=>void openCase()}>打开案卷历史/人工流程</button>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!localCaseId} onClick={()=>void exportLocalMd()}>导出本地 MD 报告</button>
      </div>
      {localCaseId&&<div className={`rounded-lg border-2 border-dashed p-4 ${dropActive?'border-primary bg-primary/10':'border-border'}`}
        data-testid="review-v3-native-file-drop" onDragOver={event=>{
          event.preventDefault();event.dataTransfer.dropEffect='copy';setDropActive(true)
        }} onDragLeave={event=>{event.preventDefault();setDropActive(false)}}
        onDrop={event=>void dropMaterials(event)}>
        <p className="text-sm font-medium">把申请材料或证明文件直接拖到这里</p>
        <p className="text-xs text-muted-foreground">多个文件会依次进入当前原生案卷；仍使用现有材料服务、真实原件和 V3 解析链。</p>
        <div className="mt-2 flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" checked={dropRole==='application'} onChange={()=>setDropRole('application')}/>
            申请材料
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={dropRole==='evidence'} onChange={()=>setDropRole('evidence')}/>
            证明材料
          </label>
        </div>
      </div>}
      {savedCases.length>0&&<select aria-label="从历史案卷重开" value="" 
        onChange={e=>{setLocalCaseId(e.target.value);setCaseNotice('已选择历史案卷 '+e.target.value) }}
        className="w-full rounded border border-border bg-background px-2 py-2 text-sm">
        <option value="">选择一份本机历史案卷</option>
        {savedCases.map(c=><option key={c.id} value={c.id}>{c.title} · {c.id}</option>)}
      </select>}
      {caseNotice&&<p role="status" className="text-xs">{caseNotice}</p>}
      {caseError&&<p role="alert" className="text-xs text-red-600">{caseError}</p>}
    </div>
    {localCaseId&&!activePlan&&<ReviewV3TemplateRoutingAssistant
      caseId={localCaseId}
      onPlanInstalled={plan=>{
        setActivePlan(plan)
        setMaterialsEpoch(x=>x+1)
      }}
      onTemplateBound={()=>setMaterialsEpoch(x=>x+1)}
    />}
    {localCaseId&&nativeAggregate&&!nativeAggregate.d2RuntimePlan&&currentTemplate?.status==='published'&&<section
      className="space-y-3 rounded-lg border border-border p-4" aria-label="模板驱动材料分类">
      <div>
        <h2 className="text-base font-semibold">材料分类与缺件核对 · {currentTemplate.name}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          按当前模板把每份原件归入对应材料槽位；文件名只给出可选提示，必须由你确认。
          未分类前不会把空槽误判成缺件。确认分类后，少量缺件可以进入初审并形成待补件项。
        </p>
      </div>
      {activeMaterialDocs.map(document=>{
        const draft=materialDrafts[document.versionId]??{
          role:document.role==='application'||document.role==='rule'?document.role:'evidence',
          materialSlotId:document.materialSlotId??'',
        }
        const suggestion=suggestMaterialSlot(document.fileName,currentTemplate)
        return <div key={document.versionId} className="space-y-2 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-all text-sm font-medium">{document.fileName}</p>
              <p className="text-xs text-muted-foreground">{document.versionId} · {document.parseStatus}</p>
            </div>
            <span className="text-xs text-muted-foreground">当前原件</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-xs">材料用途
              <select className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm"
                value={draft.role} onChange={event=>setMaterialDrafts(current=>({...current,[document.versionId]:{
                  ...draft,role:event.target.value as ClassifiedMaterialRole,
                }}))}>
                <option value="application">申请主件</option>
                <option value="evidence">证明/提交材料</option>
                <option value="rule">规则/办理依据</option>
              </select>
            </label>
            <label className="text-xs">对应模板材料槽位
              <select className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm"
                value={draft.materialSlotId} onChange={event=>setMaterialDrafts(current=>({...current,[document.versionId]:{
                  ...draft,materialSlotId:event.target.value,
                }}))}>
                <option value="">待分类（必须确认）</option>
                {(currentTemplate.materialSlots??[]).map(slot=><option key={slot.id} value={slot.id}>
                  {slot.name}{slot.minCount>0?' · 至少 '+slot.minCount+' 份':''}
                </option>)}
                <option value={REVIEW_V3_OTHER_MATERIAL_SLOT_ID}>其他/通用附件（确认不对应模板槽位）</option>
              </select>
            </label>
          </div>
          {suggestion&&draft.materialSlotId===''&&<p className="text-xs text-muted-foreground">
            文件名建议：{suggestion.name}。这只是提示，不会自动绑定。
            <button type="button" className="ml-2 underline" onClick={()=>setMaterialDrafts(current=>({...current,[document.versionId]:{
              ...draft,materialSlotId:suggestion.id,
            }}))}>采用建议</button>
          </p>}
          {draft.materialSlotId&&draft.materialSlotId!==REVIEW_V3_OTHER_MATERIAL_SLOT_ID&&
            <p className="text-xs text-muted-foreground">
              {currentTemplate.materialSlots.find(slot=>slot.id===draft.materialSlotId)?.purpose}
            </p>}
        </div>
      })}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="rounded border border-primary/50 px-3 py-2 text-sm disabled:opacity-50"
          disabled={classificationBusy||!draftClassificationReady} onClick={()=>void saveMaterialClassification()}>
          {classificationBusy?'正在保存分类…':'确认并保存材料分类'}
        </button>
        <span className="text-xs text-muted-foreground">
          {classificationComplete?'已确认当前材料分类':('仍有 '+activeMaterialDocs.filter(document=>
            !document.materialSlotId||(!validMaterialSlotIds.has(document.materialSlotId)&&document.materialSlotId!==REVIEW_V3_OTHER_MATERIAL_SLOT_ID)
          ).length+' 份材料尚未完成分类')}
        </span>
      </div>
      {classificationNotice&&<p role="status" className="text-xs text-green-700">{classificationNotice}</p>}
      {classificationError&&<p role="alert" className="text-xs text-red-600">{classificationError}</p>}
      {currentTemplate.materialSlots.some(slot=>slot.minCount>0)&&<p className="text-xs text-muted-foreground">
        缺件数量与关键性由该模板的材料槽位和办理阶段决定；本界面不硬编码任何单一业务规则。
      </p>}
    </section>}
    {activePlan&&<div className="space-y-2 rounded-lg border border-border p-4">
      <h2 className="text-base font-semibold">本案已绑定审核计划</h2>
      <p className="text-sm">{activePlan.templateId}@{activePlan.templateVersion} · 已固定 {activePlan.checks} 项检查</p>
      <p className="break-all text-xs text-muted-foreground">任务指纹：{activePlan.fingerprint}</p>
      <p className="text-xs">不必重新选择模板。继续导入材料、在下方启动 Pi，或打开案卷进行人工复核。</p>
    </div>}
    <details className="rounded-lg border border-border px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium">高级：第 51 套候选模板编辑与绑定</summary>
      <div className="mt-3 space-y-2">
      <h2 className="text-base font-semibold">本地候选审核模板 · 第 51 套</h2>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={caseBusy||!localCaseId||!b1Frozen||!!activePlan} onClick={()=>void attachB1()}>
          将已冻结第 51 套安装为当前案卷的审核任务
        </button>
        <span className="text-xs">{b1Frozen?.templateId??'请先在下方保存并冻结模板'}</span>
      </div>
      {b1Notice&&<p role="status" className="text-xs">{b1Notice}</p>}
      {b1Error&&<p role="alert" className="text-xs text-red-600">{b1Error}</p>}
      <p className="text-xs text-muted-foreground">审核目的不在既有 50 套方案时，可直接编辑、编译、保存并固定本机方案。</p>
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="重开候选模板 ID" className="min-w-40 flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm"
          placeholder="输入已保存模板 ID" value={templateId} onChange={e=>setTemplateId(e.target.value)} />
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50" disabled={busy||!templateId.trim()}
          onClick={()=>void reopen()}>读取本机最新修订</button>
        <button type="button" className="rounded border border-border px-3 py-1.5 text-sm" onClick={start}>新建候选</button>
      </div>
      {message&&<p role="status" className="text-xs">{message}</p>}
      {error&&<p role="alert" className="text-xs text-red-600">{error}</p>}
      </div>
    </details>
    <ReviewV3LocalManualItem key={localCaseId+'-'+materialsEpoch} caseId={localCaseId} />
    {localCaseId&&<ReviewV3UnifiedRun
      caseId={localCaseId}
      stage={nativeAggregate?.caseV2.stage??'draft'}
      documentCount={nativeAggregate?.caseV2.documents.filter(item=>item.active!==false).length??0}
      technicalPlan={!!nativeAggregate?.d2RuntimePlan}
      nativeV3={nativeAggregate?.receiptLog[0]?.type === 'CreateNativeWorkspaceCaseV3'}
      canRun={!!activePlan||!!nativeAggregate?.d2RuntimePlan||classificationComplete}
      materialSlots={currentTemplate?.materialSlots}
      onUpdated={refreshNativeAggregate}
    />}
    {localCaseId&&<div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">审核完成后核对与交付</h2>
          <p className="text-xs text-muted-foreground">在原案卷修改证据、处理待办和作出人工决定；报告始终使用真实运行。</p>
        </div>
        <button type="button" className="rounded border border-primary/50 px-3 py-2 text-sm disabled:opacity-50"
          disabled={caseBusy} onClick={()=>void openCase()}>打开本案复核与人工办理</button>
      </div>
      {nativeRun&&<ReviewV3T08ReportPanel aggregate={nativeAggregate} currentRun={nativeRun} currentStale={nativeRunStale} template={null}/>}
      {!nativeRun&&<p className="text-xs text-muted-foreground">本案尚无真实运行，完成审核后可在这里直接下载报告。</p>}
    </div>}
    <details className="rounded-lg border border-border px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium">高级：Pi 详细账本与停止／续跑</summary>
      <ReviewV3LocalPiControls key={localCaseId+'-'+materialsEpoch} caseId={localCaseId} />
    </details>
    <details className="rounded-lg border border-border px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium">高级：编辑和冻结本机候选模板</summary>
      <div className="mt-3">
      <ReviewV3AuthorWizard key={key} initialDraft={loaded?.document??emptyB1AuthorDocument()}
        initialRevision={loaded?.revision??0}
        onSaveDraft={(document,expectedRevision)=>
          window.reviewAPI.saveLocalCandidateAuthorV3({document,expectedRevision})}
        onPreview={document=>window.reviewAPI.previewLocalCandidateAuthorV3({document})}
        onFreezeCandidate={freezeB1}
        onReadLatestCandidate={(id)=>readLatest(id)}
      />
      </div>
    </details>
  </div>
}
