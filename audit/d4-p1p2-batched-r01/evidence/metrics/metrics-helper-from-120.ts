/** Offline, read-only P2-B prompt measurement. No Provider usage, no output of document text. */
import { createHash } from 'node:crypto'

export interface PiReviewPromptMetricsV1 {
  schemaVersion: 1
  kind: 'actual-preparePiReviewRunV2-userMessage'
  sourceSha: string
  fixture: 'g08-t02-frozen-synthetic-selection'
  templateId: string
  templateVersion: number
  selectionHash: string
  subjects: number
  ruleIds: string[]
  checkIds: string[]
  ruleRequirementsHash: string
  promptSha256: string
  characters: number
  utf8Bytes: number
  rulesRegionCharacters: number
  rulesRegionUtf8Bytes: number
  mappingRegionCharacters: number
  fieldContractPresent: boolean
  unconfirmedRuleConstraintPresent: boolean
  sourceScopeConstraintPresent: boolean
  dictionaryMode: boolean
  modelInvoked: false
}

const digest = (value: string): string => createHash('sha256').update(value).digest('hex')
export function canonicalStringSet(values: readonly string[]): string[] { return [...values].sort() }
export function promptSegment(message: string, startMarker: string, endMarker: string): string {
  const start = message.indexOf(startMarker)
  if (start < 0) return ''
  const begin = start + startMarker.length
  const end = message.indexOf(endMarker, begin)
  return end < 0 ? '' : message.slice(begin, end)
}
export function buildPiReviewPromptMetrics(input: {
  message: string
  sourceSha: string
  templateId: string
  templateVersion: number
  selection: unknown
  subjects: number
  ruleIds: string[]
  checkIds: string[]
  ruleRequirements: Array<{ id: string; requirement: string }>
}): PiReviewPromptMetricsV1 {
  const message = input.message
  const rulesRegion = promptSegment(message, '【检查要求】\n', '\n\n【材料目录】')
  // Label is common to the old and new D2 prompt. End before the evidenceLink list.
  const mappingRegion = promptSegment(message, '业务对象与操作绑定', '\n\n审核员已确认')
  return {
    schemaVersion: 1, kind: 'actual-preparePiReviewRunV2-userMessage',
    sourceSha: input.sourceSha, fixture: 'g08-t02-frozen-synthetic-selection',
    templateId: input.templateId, templateVersion: input.templateVersion,
    selectionHash: digest(JSON.stringify(input.selection)),
    subjects: input.subjects,
    ruleIds: canonicalStringSet(input.ruleIds), checkIds: canonicalStringSet(input.checkIds),
    ruleRequirementsHash: digest(JSON.stringify(input.ruleRequirements.map(x => [x.id, x.requirement]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))))),
    promptSha256: digest(message),
    characters: message.length, utf8Bytes: Buffer.byteLength(message, 'utf8'),
    rulesRegionCharacters: rulesRegion.length, rulesRegionUtf8Bytes: Buffer.byteLength(rulesRegion, 'utf8'),
    mappingRegionCharacters: mappingRegion.length,
    fieldContractPresent: message.includes('【可提交事实字段】'),
    unconfirmedRuleConstraintPresent: message.includes('awaiting-confirmation'),
    sourceScopeConstraintPresent: message.includes('EvidenceLink') || message.includes('逐对象证据关联'),
    dictionaryMode: message.includes('【要求正文完整词典】'),
    modelInvoked: false,
  }
}
export interface PiReviewPromptComparison {
  status: 'PAIRED' | 'UNPAIRED'
  reasons: string[]
  oldSourceSha: string
  newSourceSha: string
  oldCharacters: number
  newCharacters: number
  characterDelta?: number
  characterReductionPercent?: number
  oldUtf8Bytes: number
  newUtf8Bytes: number
  oldRulesCharacters: number
  newRulesCharacters: number
  oldMappingCharacters: number
  newMappingCharacters: number
  modelInvoked: false
}
export function comparePiReviewPromptMetrics(oldMetric: PiReviewPromptMetricsV1, newMetric: PiReviewPromptMetricsV1): PiReviewPromptComparison {
  const reasons: string[] = []
  const both = [oldMetric, newMetric]
  if (both.some(x => x.schemaVersion !== 1 || x.kind !== 'actual-preparePiReviewRunV2-userMessage' || x.modelInvoked !== false)) reasons.push('INVALID_MEASUREMENT_SCHEMA')
  if (oldMetric.fixture !== newMetric.fixture) reasons.push('FIXTURE_MISMATCH')
  if (oldMetric.templateId !== newMetric.templateId || oldMetric.templateVersion !== newMetric.templateVersion) reasons.push('TEMPLATE_MISMATCH')
  if (oldMetric.selectionHash !== newMetric.selectionHash || oldMetric.subjects !== newMetric.subjects) reasons.push('SELECTION_OR_SUBJECT_MISMATCH')
  if (JSON.stringify(oldMetric.ruleIds) !== JSON.stringify(newMetric.ruleIds)) reasons.push('RULE_ID_SET_MISMATCH')
  if (JSON.stringify(oldMetric.checkIds) !== JSON.stringify(newMetric.checkIds)) reasons.push('CHECK_ID_SET_MISMATCH')
  if (oldMetric.ruleRequirementsHash !== newMetric.ruleRequirementsHash) reasons.push('REQUIREMENT_TEXT_MISMATCH')
  if (!oldMetric.characters || !newMetric.characters) reasons.push('EMPTY_PROMPT')
  return {
    status: reasons.length ? 'UNPAIRED' : 'PAIRED', reasons,
    oldSourceSha: oldMetric.sourceSha, newSourceSha: newMetric.sourceSha,
    oldCharacters: oldMetric.characters, newCharacters: newMetric.characters,
    oldUtf8Bytes: oldMetric.utf8Bytes, newUtf8Bytes: newMetric.utf8Bytes,
    oldRulesCharacters: oldMetric.rulesRegionCharacters, newRulesCharacters: newMetric.rulesRegionCharacters,
    oldMappingCharacters: oldMetric.mappingRegionCharacters, newMappingCharacters: newMetric.mappingRegionCharacters,
    ...(reasons.length ? {} : {
      characterDelta: newMetric.characters - oldMetric.characters,
      characterReductionPercent: Math.round((oldMetric.characters - newMetric.characters) * 10000 / oldMetric.characters) / 100,
    }),
    modelInvoked: false,
  }
}
