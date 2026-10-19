/**
 * B3 conservative intake route planner. A route suggestion never creates a Case.
 * Main must verify the referenced staged candidates and template authorization;
 * only Dev-C's Case command can apply a selected route.
 */
import type { B2MaterialCandidate } from './review-intake-adapter-v3-b2'

export interface B3RouteSuggestion {
  templateId: string
  templateVersion: string
  /** Not inferred authorization. Trusted catalog must supply status. */
  availability: 'authorized-for-technical-selection' | 'candidate-held'
  confidence: number
  evidence: Array<{ materialCandidateId: string; rawSha256: string; reason: string }>
  /** Supplied by conservative classifier; no role guessing or hidden Subject. */
  caseCandidateId: string
}
export interface B3RoutingInput {
  startedAtMs: number
  nowMs: number
  automaticSelectionEnabled: boolean
  userInterrupted: boolean
  userChoseTemplateId?: string
  userChoseTemplateVersion?: string
  materialCandidates: B2MaterialCandidate[]
  suggestions: B3RouteSuggestion[]
}
export interface B3RouteState {
  status: 'awaiting-evidence' | 'countdown' | 'needs-user-confirmation' | 'manually-selected' | 'default-selected'
  remainingMs: number
  chosen?: { templateId: string; templateVersion: string }
  reason: string
}
const SHA = /^[a-f0-9]{64}$/
const validTime = (x: number): boolean => Number.isFinite(x) && x >= 0
const confident = (score: number): boolean => Number.isFinite(score) && score >= 0.95 && score <= 1
/**
 * This only chooses a technical template suggestion; no CurrentCase is created.
 * Any multiple business type, unclear case/Subject/role or unresolved file stays manual.
 */
export function planB3ConservativeRouting(input: B3RoutingInput): B3RouteState {
  if (!input || !validTime(input.startedAtMs) || !validTime(input.nowMs) ||
      input.nowMs < input.startedAtMs ||
      !Array.isArray(input.materialCandidates) || !Array.isArray(input.suggestions)) {
    throw new Error('B3_ROUTING_INVALID')
  }
  const remainingMs = Math.max(0, 20_000 - (input.nowMs - input.startedAtMs))
  const materials = new Map(input.materialCandidates.map(m=>[m.candidateId,m]))
  if (materials.size!==input.materialCandidates.length || input.materialCandidates.length===0) {
    return {status:'awaiting-evidence',remainingMs,reason:'No unique valid staged files'}
  }
  if (input.userChoseTemplateId) {
    if (!input.userChoseTemplateVersion) return {
      status:'needs-user-confirmation',remainingMs,reason:'Manual template version is required',
    }
    return {status:'manually-selected',remainingMs,chosen:{
      templateId:input.userChoseTemplateId,templateVersion:input.userChoseTemplateVersion,
    },reason:'Manual selection; Dev-C must still authorize and create Case'}
  }
  if (input.userInterrupted || !input.automaticSelectionEnabled) return {
    status:'needs-user-confirmation',remainingMs,reason:'User interrupted or auto-selection disabled',
  }
  const owners = new Set(input.materialCandidates.map(m=>m.ownerId+'::'+m.ownerGeneration))
  const scopes = new Set(input.materialCandidates.map(m=>m.caseCandidateId))
  if (owners.size!==1 || scopes.size!==1 || input.materialCandidates.some(m=>
    m.role==='unassigned' || m.subjectId === null || !SHA.test(m.rawSha256))) return {
    status:'needs-user-confirmation',remainingMs,
    reason:'File role, subject or owner scope ambiguous',
  }
  if (input.suggestions.length===0) return {
    status:'awaiting-evidence',remainingMs,reason:'No evidenced business suggestion',
  }
  const unique = new Set(input.suggestions.map(s=>s.templateId+'@'+s.templateVersion))
  const evidenceValid = (suggestion:B3RouteSuggestion):boolean =>
    suggestion.evidence.length>0 && suggestion.caseCandidateId===input.materialCandidates[0]!.caseCandidateId &&
    suggestion.evidence.every(e=>{
      const material=materials.get(e.materialCandidateId)
      return Boolean(material && e.rawSha256===material.rawSha256 && e.reason?.trim())
    })
  if (unique.size!==1 || input.suggestions.length!==1 ||
      input.suggestions.some(s=> !confident(s.confidence) ||
        s.availability !== 'authorized-for-technical-selection' || !evidenceValid(s))) return {
    status:'needs-user-confirmation',remainingMs,
    reason:'Non-unique, low confidence, unsupported evidence or unauthorized candidate',
  }
  if (remainingMs>0) return {
    status:'countdown',remainingMs,reason:'Single evidenced, technically authorized suggestion; user may interrupt',
  }
  const only=input.suggestions[0]!
  return {status:'default-selected',remainingMs:0,
    chosen:{templateId:only.templateId,templateVersion:only.templateVersion},
    reason:'Technical route selected, not a Case/Run/administrative decision',
  }
}
