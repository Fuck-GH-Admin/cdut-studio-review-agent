import * as React from 'react'
import type { D4IntakePreview } from '@profer/shared'

/** 20-second auto-adoption is only a template-selection convenience, NEVER case submission. */
export function D4IntakePicker({
  intake, onIntake, onApplyRoute, manuallyOverridden, documentRoles, onDocumentRolesChange, enabled = true,
}: {
  intake: D4IntakePreview | null
  onIntake: (value: D4IntakePreview | null) => void
  onApplyRoute: (templateId: string) => void
  manuallyOverridden: boolean
  documentRoles: Array<'application' | 'evidence'>
  onDocumentRolesChange: (roles: Array<'application' | 'evidence'>) => void
  /** Freeze OS-picker operations while creating/closing the parent case. */
  enabled?: boolean
}): React.ReactElement {
  const [working, setWorking] = React.useState(false)
  const [error, setError] = React.useState('')
  const [seconds, setSeconds] = React.useState<number | null>(null)
  const applied = React.useRef(false)
  const [dragging, setDragging] = React.useState(false)
  const stillEnabled = React.useRef(enabled)
  // A native picker can complete after the dialog closed. Reject/discard its
  // late token instead of resurrecting staged originals in a later case.
  React.useEffect(() => {
    stillEnabled.current = enabled
    return () => { stillEnabled.current = false }
  }, [enabled])
  React.useEffect(() => {
    applied.current = false
    setSeconds(intake?.route.status === 'suggested' ? 20 : null)
  }, [intake?.token])
  React.useEffect(() => {
    if (seconds === null || seconds > 0 || manuallyOverridden || applied.current) return
    const recommendation = intake?.route.suggestion
    if (recommendation) {
      applied.current = true
      onApplyRoute(recommendation.templateId)
    }
  }, [seconds, intake, manuallyOverridden, onApplyRoute])
  React.useEffect(() => {
    if (!intake || intake.route.status !== 'suggested' || manuallyOverridden || applied.current || seconds === null || seconds <= 0) return
    const timer = window.setTimeout(() => setSeconds(s => s === null ? null : Math.max(0, s - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [intake, seconds, manuallyOverridden])
  const pick = async (): Promise<void> => {
    if (working || !enabled) return
    setError('')
    setWorking(true)
    try {
      const next = await window.reviewAPI.stageD4Intake()
      if (!next) return
      if (!stillEnabled.current) {
        await window.reviewAPI.discardD4Intake(next.token).catch(() => false)
        return
      }
      if (intake?.token) await window.reviewAPI.discardD4Intake(intake.token).catch(() => false)
      onIntake(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setWorking(false) }
  }
  const discard = async (): Promise<void> => {
    if (!enabled) return
    if (intake?.token) await window.reviewAPI.discardD4Intake(intake.token).catch(() => false)
    onIntake(null)
    setError('')
  }
  return <section className="space-y-2 rounded-md border p-3" data-testid="d4-intake-picker">
    <div className="flex items-center justify-between gap-2">
      <strong className="text-sm">先选申请材料（可选）</strong>
      <div className="flex gap-2">
        {intake && <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => void discard()} disabled={working || !enabled}>清除暂存</button>}
        <button type="button" disabled={working || !enabled} className="rounded border px-2 py-1 text-xs" onClick={() => void pick()}>
          {working ? '正在读取…' : intake ? '重新选择材料' : '系统选择文件'}
        </button>
      </div>
    </div>
    <div role="region" aria-label="D4 路由材料入口"
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { e.preventDefault(); setDragging(false) }}
      onDrop={e => { e.preventDefault(); setDragging(false); if (enabled) void pick() }}
      className={'rounded-md border border-dashed p-2 text-xs ' + (dragging ? 'bg-muted' : 'text-muted-foreground')}>
      松开拖入文件将打开系统选择框，由你再次确认本机文件；不会直接信任网页提供的文件路径。
    </div>
    {intake && <>
      <div className="space-y-2 rounded-md bg-muted/30 p-2" data-testid="d4-intake-files">
        <p className="text-xs font-medium">逐份材料用途（{intake.files.length} 份）</p>
        <p className="text-xs text-muted-foreground">
          默认作为申报材料；只有你明确选为“证明材料”时才放入证明区。
          不会自动关联某个审核对象，也不会把材料变为校方审核依据。
        </p>
        {intake.files.map((file, index) => <label key={`${intake.token}-${index}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded border bg-background p-2 text-xs">
          <span className="min-w-0 flex-1 break-all">{file.name} · {(file.sizeBytes / 1024).toFixed(1)} KiB</span>
          <select aria-label={`材料 ${index + 1} 的用途`}
            className="h-8 rounded border bg-background px-2 text-xs"
            disabled={!enabled}
            value={documentRoles[index] ?? 'application'}
            onChange={e => onDocumentRolesChange(intake.files.map((_, i) => i === index
              ? e.target.value as 'application' | 'evidence'
              : documentRoles[i] ?? 'application'))}>
            <option value="application">申报材料（待审）</option>
            <option value="evidence">证明材料（待关联）</option>
          </select>
        </label>)}
      </div>
      <p className="text-xs" data-testid="d4-route-status">{intake.route.reason}</p>
      {intake.route.suggestion && <p className="text-xs">
        建议模板：<strong>{intake.route.suggestion.templateId}</strong>；
        依据：{intake.route.suggestion.basis.join('、')}。
        {intake.route.status === 'suggested' && !manuallyOverridden && !applied.current && seconds !== null && <>
          {' '}<strong data-testid="d4-route-countdown">{seconds} 秒后自动采用建议</strong>
          <button className="ml-2 rounded border px-2 py-0.5" type="button" onClick={() => {
            applied.current = true
            setSeconds(null)
            onApplyRoute(intake.route.suggestion!.templateId)
          }}>立即采用</button>
        </>}
      </p>}
      {manuallyOverridden && <p className="text-xs">已人工选择模板，不再自动覆盖。</p>}
      {intake.route.status === 'multiple-tasks' && <p role="alert" className="text-destructive text-xs">
        多个审核事项不允许合并建案，请清除暂存并分别创建。
      </p>}
    </>}
    {error && <p role="alert" className="text-destructive text-xs">{error}</p>}
  </section>
}
