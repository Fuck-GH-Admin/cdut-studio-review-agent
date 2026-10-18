import * as React from 'react'
import type { D4IntakePreview } from '@profer/shared'

/** 20-second auto-adoption is only a template-selection convenience, NEVER case submission. */
export function D4IntakePicker({
  intake, onIntake, onApplyRoute, manuallyOverridden,
}: {
  intake: D4IntakePreview | null
  onIntake: (value: D4IntakePreview | null) => void
  onApplyRoute: (templateId: string) => void
  manuallyOverridden: boolean
}): React.ReactElement {
  const [working, setWorking] = React.useState(false)
  const [error, setError] = React.useState('')
  const [seconds, setSeconds] = React.useState<number | null>(null)
  const applied = React.useRef(false)
  const [dragging, setDragging] = React.useState(false)
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
    if (working) return
    setError('')
    setWorking(true)
    try {
      const next = await window.reviewAPI.stageD4Intake()
      if (!next) return
      if (intake?.token) await window.reviewAPI.discardD4Intake(intake.token)
      onIntake(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setWorking(false) }
  }
  const discard = async (): Promise<void> => {
    if (intake?.token) await window.reviewAPI.discardD4Intake(intake.token).catch(() => false)
    onIntake(null)
    setError('')
  }
  return <section className="space-y-2 rounded-md border p-3" data-testid="d4-intake-picker">
    <div className="flex items-center justify-between gap-2">
      <strong className="text-sm">先选申请材料（可选）</strong>
      <div className="flex gap-2">
        {intake && <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => void discard()} disabled={working}>清除暂存</button>}
        <button type="button" disabled={working} className="rounded border px-2 py-1 text-xs" onClick={() => void pick()}>
          {working ? '正在读取…' : intake ? '重新选择材料' : '系统选择文件'}
        </button>
      </div>
    </div>
    <div role="region" aria-label="D4 路由材料入口"
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { e.preventDefault(); setDragging(false) }}
      onDrop={e => { e.preventDefault(); setDragging(false); void pick() }}
      className={'rounded-md border border-dashed p-2 text-xs ' + (dragging ? 'bg-muted' : 'text-muted-foreground')}>
      支持拖入触发系统文件选择确认，或点击“系统选择文件”。文件由 Main 暂存，尚未建案或审核。
    </div>
    {intake && <>
      <p className="text-xs" data-testid="d4-intake-files">{intake.files.map(file => file.name).join('、')}</p>
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
