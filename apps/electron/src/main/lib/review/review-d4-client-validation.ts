/** P1-B: authoring-source and per-object decision fence before D2 freezes the case. */
import type { D4ClientSelection, D4ClientTemplate } from '@profer/shared'

const SAFE_ID = /^[a-z][a-z0-9-]{0,79}$/
const ALLOWED = new Set(['kind', 'objectKey', 'subjectId', 'title', 'businessType', 'scenario', 'scenarioSource', 'conditions'])

export function validateD4UserSelection(input: D4ClientSelection, template: D4ClientTemplate): void {
  if (input.reviewerConfirmation !== 'explicit-ui-confirmation') throw new Error('D4_REVIEWER_CONFIRMATION_REQUIRED')
  const selected = input.selection
  if (!selected || selected.templateId !== template.templateId || selected.version !== template.version ||
      !Array.isArray(selected.targets) || !selected.targets.length || selected.targets.length > 100) {
    throw new Error('D4_SELECTION_INVALID')
  }
  if (selected.targets.some(target => target.kind !== 'generic-object')) {
    if (JSON.stringify(selected) !== JSON.stringify(template.selection)) {
      throw new Error('D4_SPECIAL_SCOPE_HELD: 非通用对象仅使用已冻结的独立技术输入')
    }
    return
  }
  if (selected.scenario || selected.scenarios || selected.scenarioObjectKey ||
      !template.businessTypes?.length) throw new Error('D4_GENERIC_SCOPE_INVALID')
  const ids = new Set<string>(), subjects = new Set<string>()
  for (const target of selected.targets) {
    if (!target || Object.keys(target).some(key => !ALLOWED.has(key)) ||
        !SAFE_ID.test(target.objectKey ?? '') || !SAFE_ID.test(target.subjectId ?? '') ||
        ids.has(target.objectKey) || subjects.has(target.subjectId) ||
        typeof target.title !== 'string' || !target.title.trim() || target.title.length > 160 ||
        !template.businessTypes.includes(target.businessType ?? '')) {
      throw new Error('D4_GENERIC_OBJECT_INVALID')
    }
    ids.add(target.objectKey)
    subjects.add(target.subjectId)
    if (template.primary.length) {
      const source = template.selectionSource
      if (!source || !template.primary.includes(target.scenario ?? '') ||
          target.scenarioSource?.decidedBy !== 'reviewer' ||
          target.scenarioSource.sourceId !== source.sourceId ||
          target.scenarioSource.sourceVersionId !== source.sourceVersionId) {
        throw new Error('D4_GENERIC_PRIMARY_SOURCE_INVALID')
      }
      if (!Array.isArray(target.conditions) || target.conditions.length !== template.conditions.length ||
          new Set(target.conditions.map(c => c.id)).size !== template.conditions.length) {
        throw new Error('D4_GENERIC_CONDITIONS_INCOMPLETE')
      }
      for (const condition of target.conditions) {
        if (!template.conditions.includes(condition.id) ||
            !['applicable', 'not-applicable', 'unknown'].includes(condition.applicability) ||
            condition.decidedBy !== (condition.applicability === 'unknown' ? 'undetermined' : 'reviewer') ||
            condition.sourceId !== source.sourceId || condition.sourceVersionId !== source.sourceVersionId) {
          throw new Error('D4_GENERIC_CONDITION_SOURCE_INVALID')
        }
      }
    } else if (target.scenario || target.scenarioSource || target.conditions?.length) {
      throw new Error('D4_GENERIC_SCENARIO_UNDECLARED')
    }
  }
}
