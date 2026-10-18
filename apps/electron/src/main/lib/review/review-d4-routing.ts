/** P1-C: deterministic, non-authoritative intake recommendation.
 * No policy findings, applicant identity, or scenario decision may be inferred here. */
import type { D4ClientTemplate } from '@profer/shared'

export interface D4RouteFile {
  name: string
  textSample?: string
}
export interface D4RouteSuggestion {
  templateId: string
  templateVersion: number
  score: number
  basis: string[]
}
export interface D4RouteResult {
  status: 'suggested' | 'manual-required' | 'multiple-tasks'
  suggestion?: D4RouteSuggestion
  reason: string
}
/** Explicit, auditable vocabulary. All other frozen candidates remain manually selectable. */
const SIGNALS: Record<string, readonly string[]> = {
  'g03-t01': ['教室借用', '临时借用教室', '公共教学教室', '教室申请', '研究生教室'],
  'g08-t02': ['失物招领', '失物认领', '物品认领', '遗失物品', '领取失物'],
}
const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, '').slice(0, 16384)
function rank(file: D4RouteFile, templates: D4ClientTemplate[]): D4RouteSuggestion | undefined {
  const name = normalize(file.name)
  // Only plain-text snippets are inspected. PDF/Office/image bodies never become "extracted evidence" here.
  const sample = normalize(file.textSample ?? '')
  const ranked: D4RouteSuggestion[] = []
  for (const template of templates) {
    const basis: string[] = []
    // W1: extend navigation to the actual frozen catalog, not just two hardcoded
    // domains. Only a sufficiently specific FULL authored template name counts;
    // never infer scenario, identity, policy or evidence from this text.
    const authoredName = normalize(template.name ?? '')
    if (authoredName.length >= 5 && name.includes(authoredName)) {
      basis.push('文件名与完整候选名称一致')
    } else if (authoredName.length >= 8 && sample.includes(authoredName)) {
      basis.push('文本片段与完整候选名称一致')
    }
    const signals = SIGNALS[template.templateId] ?? []
    for (const signal of signals) {
      if (name.includes(signal.toLowerCase())) basis.push('文件名关键词：' + signal)
      else if (sample.includes(signal.toLowerCase())) basis.push('文本片段关键词：' + signal)
    }
    // An exact technical template ID is another explicit signal, not an authoritative assertion.
    if (name.includes(template.templateId.toLowerCase())) basis.push('文件名含候选 ID')
    if (basis.length) ranked.push({ templateId: template.templateId, templateVersion: template.version,
      score: basis.reduce((score, b) => score + (b.startsWith('文件名') ? 12 : 9), 0), basis })
  }
  ranked.sort((a, b) => b.score - a.score || a.templateId.localeCompare(b.templateId))
  if (!ranked[0] || ranked[0].score < 9 ||
      (ranked[1] && ranked[0].score - ranked[1].score < 6)) return undefined
  return ranked[0]
}
export function recommendD4Intake(files: D4RouteFile[], templates: D4ClientTemplate[]): D4RouteResult {
  if (!files.length) return { status: 'manual-required', reason: '请先选择材料' }
  const matched = files.map(file => rank(file, templates))
  const distinct = [...new Set(matched.filter((x): x is D4RouteSuggestion => !!x).map(x => x.templateId))]
  if (distinct.length > 1) return { status: 'multiple-tasks', reason: '材料明确指向多个不同的审核事项，请分开创建案卷' }
  if (distinct.length === 1 && matched.some(x => !x) && files.length > 1) {
    return { status: 'manual-required', reason: '部分材料无法确认属于同一事项；请人工检查后再选择模板' }
  }
  if (!distinct.length) return { status: 'manual-required', reason: '材料不足以唯一确定审核事项，请人工选择候选模板' }
  const selected = matched.find(x => x?.templateId === distinct[0])!
  return { status: 'suggested', suggestion: selected,
    reason: '仅凭可观察关键词作技术候选建议；不会据此确认任何审核事实' }
}
