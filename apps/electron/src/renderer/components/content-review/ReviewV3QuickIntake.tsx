/** Material-first intake. These roles are provisional until the chosen template defines its slots. */
import * as React from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'

type IntakeRole = 'application' | 'evidence' | 'rule' | 'attachment'
interface PendingPath { path:string; name:string; role:IntakeRole }
interface Props { onCreated: (caseId: string) => void }

export function ReviewV3QuickIntake({ onCreated }: Props): JSX.Element {
  const [busy, setBusy] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [applicant, setApplicant] = React.useState('')
  const [pendingPaths, setPendingPaths] = React.useState<PendingPath[]>([])
  // 导入中途失败也保留已经创建的真实案卷入口；重试不应默默再建空案。
  const [recoveryCaseId, setRecoveryCaseId] = React.useState('')
  const [error, setError] = React.useState('')
  const [notice, setNotice] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const createCase = React.useCallback(async (fallbackTitle: string): Promise<string> => {
    const created = await window.reviewAPI.createCase({
      title: title.trim() || fallbackTitle,
      type: '自定义审核',
      applicant: applicant.trim() || '待核实申请人',
      academicYear: String(new Date().getFullYear()),
      reviewTemplate: null,
    })
    if (!created?.id) throw new Error('Main 未返回真实案卷 ID')
    return created.id
  }, [applicant, title])

  const queueFiles = (files: File[]): void => {
    if (!files.length) return
    const paths: Array<{path:string;name:string}> = []
    const missing: string[] = []
    const seen = new Set<string>()
    for (const file of files) {
      try {
        const path = window.electronAPI.getPathForFile(file)
        if (!path) { missing.push(file.name); continue }
        if (seen.has(path)) continue
        seen.add(path)
        paths.push({ path, name: file.name })
      } catch { missing.push(file.name) }
    }
    if (missing.length) {
      setError('这些文件没有可读取的本机路径：' + missing.join('、') + '。为避免漏件，已取消本次选择，请改用系统文件选择器。')
      setPendingPaths([]);setNotice('')
      return
    }
    setError('')
    if (!paths.length) return
    const likelyApplication=(name:string):boolean=>
      /(申请书|申请表|申报书|申报表|申请单|申报单|application(?:-form)?|proposal|request-form)/i.test(name)
    const namedApplications=paths.filter(item=>likelyApplication(item.name))
    const initialApplicationPaths=new Set(namedApplications.map(item=>item.path))
    setPendingPaths(paths.map(item=>({...item,
      role:initialApplicationPaths.has(item.path)?'application':'attachment'})))
    setNotice('已读取 ' + paths.length + ' 份文件。文件名仅提供临时用途建议；请在选定模板后确认真正的材料类别和槽位。')
  }

  const startWithPaths = React.useCallback(async (): Promise<void> => {
    if (busy || pendingPaths.length === 0 || recoveryCaseId) return
    setBusy(true); setError(''); setNotice('正在保存原件并建立本地案卷…')
    let caseId = ''
    try {
      caseId = await createCase(pendingPaths[0]!.name.replace(/\.[^.]+$/, '') || '本地材料审核')
      setRecoveryCaseId(caseId)
      const failures: string[] = []
      let accepted = 0
      for (const file of pendingPaths) {
        try {
          const registered = await window.reviewAPI.registerMaterialPathV2({
            caseId, sourcePath: file.path, role: file.role, fileName: file.name,
          })
          if (!registered) throw new Error('Main 未确认文件版本')
          accepted++
        } catch (cause) {
          failures.push(file.name + '：' + (cause instanceof Error ? cause.message : String(cause)))
        }
      }
      if (!accepted) throw new Error('没有成功导入的材料。' + failures.join('；'))
      setNotice('已导入 ' + accepted + '/' + pendingPaths.length + ' 份原件。')
      setPendingPaths([])
      if (failures.length) {
        setError('部分材料未导入，需要补充：' + failures.join('；'))
        toast.error('有 ' + failures.length + ' 份材料未导入', {description:failures.join('；').slice(0,220)})
        // 先显示失败清单和已经创建的案卷入口，用户决定何时继续；
        // 跳页会把当前 UI 的失败清单一并卸载，造成不可见的漏件。
      } else {
        setRecoveryCaseId('')
        onCreated(caseId)
      }
    } catch (cause) {
      setError('材料导入未完成' + (caseId ? '（已建立草稿 ' + caseId + '）' : '') + '：' +
        (cause instanceof Error ? cause.message : String(cause)))
      setNotice('')
    } finally { setBusy(false) }
  }, [busy, createCase, onCreated, pendingPaths, recoveryCaseId])

  const onDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault(); setDragging(false)
    queueFiles(Array.from(event.dataTransfer.files ?? []))
  }
  const pickFiles = (): void => {
    if (busy) return
    fileInputRef.current?.click()
  }

  return <section aria-label="从材料开始审核" className="mx-auto w-full max-w-3xl space-y-3 rounded-xl border border-primary/30 bg-card p-5 shadow-sm">
    <input ref={fileInputRef} type="file" multiple className="hidden" aria-label="选择审核材料"
      onChange={event => {
        queueFiles(Array.from(event.currentTarget.files ?? []))
        event.currentTarget.value = ''
      }} />
    <div>
      <h2 className="text-base font-semibold">从材料开始审核</h2>
      <p className="mt-1 text-sm text-muted-foreground">先导入真实原件，再根据事项匹配模板。模板决定本事项需要哪些材料，不会统一套用综测案卷的要求。</p>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <label className="space-y-1 text-xs">案卷名称（可留空）
        <input className="w-full rounded border bg-background px-2 py-2 text-sm" value={title}
          onChange={event => setTitle(event.target.value)} placeholder="默认取第一份文件名" />
      </label>
      <label className="space-y-1 text-xs">申请人（可稍后核实）
        <input className="w-full rounded border bg-background px-2 py-2 text-sm" value={applicant}
          onChange={event => setApplicant(event.target.value)} placeholder="不知道时标记为待核实" />
      </label>
    </div>
    <div role="button" tabIndex={0} aria-label="拖入文件开始材料审核"
      onDragOver={event => {event.preventDefault();setDragging(true)}}
      onDragLeave={event => {event.preventDefault();setDragging(false)}}
      onDrop={onDrop} onClick={pickFiles}
      onKeyDown={event => {if (event.key==='Enter' || event.key===' ') pickFiles()}}
      className={'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-5 py-7 text-center '+
        (dragging?'border-primary bg-primary/10':'border-border hover:border-primary/60')+
        (busy?' pointer-events-none opacity-60':'')}>
      <Upload size={24} className="text-primary" />
      <p className="font-medium">{busy?'正在准备审核材料…':'把材料拖到这里，或点击选择文件'}</p>
      <p className="text-xs text-muted-foreground">支持任意数量材料。此时不用确定申请件数量，后续按匹配模板分类。</p>
    </div>
    {pendingPaths.length>0&&<div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">待导入原件 · {pendingPaths.length} 份</p>
        <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
          disabled={busy} onClick={()=>{setPendingPaths([]);setNotice('');setError('')}}>清空</button>
      </div>
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {pendingPaths.map((file,index)=><div key={file.path} className="flex items-center gap-2 rounded border border-border/70 px-2 py-1.5">
          <span className="min-w-0 flex-1 truncate text-xs" title={file.path}>{file.name}</span>
          <select aria-label={file.name+' 材料角色'} className="rounded border bg-background px-1.5 py-1 text-xs"
            disabled={busy} value={file.role}
            onChange={event=>setPendingPaths(current=>current.map((item,i)=>i===index
              ?{...item,role:event.target.value as IntakeRole}:item))}>
            <option value="application">可能的申报材料</option>
            <option value="evidence">可能的证明材料</option>
            <option value="rule">可能的规则依据</option>
            <option value="attachment">用途待定</option>
          </select>
          <button type="button" aria-label={'移除 '+file.name} disabled={busy}
            className="rounded p-1 text-muted-foreground hover:bg-muted" onClick={()=>setPendingPaths(current=>current.filter((_,i)=>i!==index))}>
            <X size={14}/>
          </button>
        </div>)}
      </div>
      <p className="text-xs text-muted-foreground">导入不代表材料分类已确认；一个事项可以有多份申报材料，是否需要申报主件由模板决定。</p>
      <Button size="sm" disabled={busy||!!recoveryCaseId||pendingPaths.length===0}
        onClick={event=>{event.stopPropagation();void startWithPaths()}}>
        {busy?'正在导入…':'确认材料并匹配模板'}
      </Button>
    </div>}
    {notice && <p role="status" className="text-xs text-muted-foreground">{notice}</p>}
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    {recoveryCaseId && <div className="rounded-lg bg-amber-500/10 p-3 text-sm" role="status">
      <p>案卷已在本机保存：<code>{recoveryCaseId}</code>。失败材料尚未成功入库，可进入此案卷后重新补传；不会因再次点击导入创建另一份空案卷。</p>
      <Button size="sm" className="mt-2" onClick={()=>onCreated(recoveryCaseId)}>打开已保存的案卷继续处理</Button>
    </div>}
    <Button size="sm" variant="outline" disabled={busy} onClick={pickFiles}>选择材料开始审核</Button>
  </section>
}
