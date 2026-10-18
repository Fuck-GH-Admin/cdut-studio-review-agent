/** D4 候选 → 原 D2 建案 → 原工作台材料投影，复用现有 Pi 与权限门禁。 */
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import type { D2ScenarioSelection, D2TrustedStudentSnapshotV1, D4ClientTemplate, D4ClientSelection, ReviewCase } from '@profer/shared'
import { loadD4UnifiedCatalog, loadD4UnifiedWorkspace, resolveD4SourcePath } from './review-d4-catalog'
import { createD2TechnicalCase, makeD2CandidateShell } from './review-d2-runtime'
import { getTemplate, isAuthoringCandidateDraft, saveAuthoringCandidateDraft } from './template-store'
import { getCase, saveCase, updateCase } from './case-store'
import { ensureWorkspaceAggregateV2 } from './workspace-service-v2'
import { validateD4UserSelection } from './review-d4-client-validation'
import { claimD4Intake, releaseD4Intake } from './review-d4-intake'
import { resolveD4IntakeRoles } from './review-d4-intake-roles'
import { importDocumentFromPath } from './case-import'

const json = <T>(path: string): T => JSON.parse(readFileSync(resolveD4SourcePath(path), 'utf8')) as T
const basePath = (path: string): string => path.replace(/\/workspace(?:\/workspace)?\.json$/, '')

export function listD4ClientTemplates(): D4ClientTemplate[] {
  return loadD4UnifiedCatalog().templates.map(entry => {
    const workspace = loadD4UnifiedWorkspace(entry)
    const template = workspace.definitions.templates[0]!
    const base = basePath(entry.workspacePath)
    const controlledStudentFixture = entry.templateId === 'g01-student-identity-correction'
    const fixture = ['selection.json', 'synthetic-selection.json', 'fixtures/selection.json']
      .map(name => `${base}/${name}`).find(path => existsSync(resolveD4SourcePath(path)))
    const selection = controlledStudentFixture
      ? json<{ two: D2ScenarioSelection }>(`${base}/fixtures/selections.json`).two
      : fixture ? json<D2ScenarioSelection>(fixture) : { templateId: entry.templateId, version: entry.templateVersion, targets: [] }
    return { templateId: entry.templateId, version: entry.templateVersion, domain: entry.domain,
      name: template.name, workspaceGitBlobSha: entry.workspaceGitBlobSha,
      primary: template.genericScenarioAxes?.primary ?? [], conditions: template.genericScenarioAxes?.conditions ?? [],
      selection, controlledStudentFixture,
      businessTypes: [...new Set(workspace.sourceBindings.flatMap(binding => binding.genericScope?.businessTypes ?? []))].sort(),
      selectionSource: selection.targets.find(target => target.kind === 'generic-object')?.scenarioSource
        ? { sourceId: selection.targets.find(target => target.kind === 'generic-object')!.scenarioSource!.sourceId,
            sourceVersionId: selection.targets.find(target => target.kind === 'generic-object')!.scenarioSource!.sourceVersionId }
        : undefined }
  })
}

export async function createD4ClientCase(input: {
  title: string; applicant: string; academicYear: string; d4: D4ClientSelection
}, ownerWebContentsId?: number): Promise<ReviewCase> {
  const selection = input.d4?.selection
  if (!selection || !input.title?.trim() || !input.applicant?.trim() || !input.academicYear?.trim()) {
    throw new Error('D4 技术预审需要标题、申请人和明确的对象/场景选择')
  }
  const entry = loadD4UnifiedCatalog().templates.find(e => e.templateId === selection.templateId && e.templateVersion === selection.version)
  if (!entry) throw new Error('D4_TEMPLATE_NOT_IN_CATALOG')
  const workspace = loadD4UnifiedWorkspace(entry)
  const choices = listD4ClientTemplates().find(item => item.templateId === entry.templateId && item.version === entry.templateVersion)
  if (!choices) throw new Error('D4_CHOICES_UNAVAILABLE')
  validateD4UserSelection(input.d4, choices)
  let trustedStudentSnapshot: D2TrustedStudentSnapshotV1 | undefined
  if (input.d4.useControlledStudentFixture) {
    if (entry.templateId !== 'g01-student-identity-correction') throw new Error('D4_SYNTHETIC_REGISTRY_SCOPE_INVALID')
    trustedStudentSnapshot = json<D2TrustedStudentSnapshotV1>(`${basePath(entry.workspacePath)}/fixtures/controlled-registry.json`)
  }
  // P1-C/W1: only a Main-owned OS picker can supply staged files.
  // A role plan without a token is never an authority or material source.
  if (input.d4.acknowledgeSkippedFiles !== undefined && !input.d4.intakeToken) {
    throw new Error('D4_INTAKE_ACK_WITHOUT_TOKEN')
  }
  if (input.d4.intakeRoles !== undefined && !input.d4.intakeToken) {
    throw new Error('D4_INTAKE_ROLE_PLAN_INVALID: no staged file token')
  }
  const intake = input.d4.intakeToken
    ? claimD4Intake(input.d4.intakeToken, ownerWebContentsId ?? -1) : undefined
  let createdCaseId: string | undefined
  try {
    // Validate inside try so a rejected role plan releases the claimed token for
    // correction, instead of consuming the file or creating a partial case.
    const intakeRoles = intake ? resolveD4IntakeRoles(intake.files.length, input.d4.intakeRoles) : []
    if (intake?.skipped.length && input.d4.acknowledgeSkippedFiles !== true) {
      throw new Error('D4_INTAKE_SKIPS_ACK_REQUIRED: 已跳过材料，须明确确认不完整输入清单')
    }
    const old = getTemplate(entry.templateId, entry.templateVersion)
    if (old && !isAuthoringCandidateDraft(entry.templateId, entry.templateVersion)) throw new Error('D4_EXISTING_TEMPLATE_NOT_CANDIDATE')
    if (!old) saveAuthoringCandidateDraft(makeD2CandidateShell(workspace, entry.templateId, entry.templateVersion))
    const caseId = `d4-${randomUUID()}`
    const result = await createD2TechnicalCase({ caseId, title: input.title,
      actor: { actorId: 'local-reviewer', actorSource: 'local', role: 'reviewer' },
      workspace, selection, trustedStudentSnapshot })
    if (!result.ok) throw new Error(`${result.code}: ${result.message}`)
    const now = new Date().toISOString()
    const reviewCase: ReviewCase = { id: caseId, title: input.title.trim(), type: '自定义审核',
      applicant: input.applicant.trim(), academicYear: input.academicYear.trim(), createdAt: now, updatedAt: now,
      documents: [], rulePacks: [], items: [], evidences: [], isDemo: false,
      ...(intake?.skipped.length ? { d4IntakeWarnings: intake.skipped } : {}),
      reviewTemplate: { templateId: entry.templateId, version: entry.templateVersion } }
    saveCase(reviewCase)
    createdCaseId = caseId
    await ensureWorkspaceAggregateV2(caseId)
    const d4IntakeFailures: string[] = []
    const d4IntakeOrigins: NonNullable<ReviewCase['d4IntakeOrigins']> = []
    if (intake) {
      for (const [index, file] of intake.files.entries()) {
        try {
          const parsed = await importDocumentFromPath({ caseId, sourcePath: file.sourcePath, role: intakeRoles[index]! })
          d4IntakeOrigins.push({ documentId: parsed.id, originLabel: file.originLabel, sha256: file.sha256 })
          if (parsed.parseStatus !== 'parsed') d4IntakeFailures.push(file.name + ': ' + parsed.parseStatus)
        } catch (error) {
          d4IntakeFailures.push(file.name + ': ' + (error instanceof Error ? error.message : String(error)))
        }
      }
    }
    // An omitted or failed document must remain visible after reopening this
    // case, not only in a one-time success toast.
    if (d4IntakeFailures.length || d4IntakeOrigins.length) {
      await updateCase(caseId, fresh => ({
        ...fresh,
        ...(d4IntakeOrigins.length ? { d4IntakeOrigins: [
          ...(fresh.d4IntakeOrigins ?? []), ...d4IntakeOrigins,
        ] } : {}),
        d4IntakeWarnings: [
          ...(fresh.d4IntakeWarnings ?? []),
          ...d4IntakeFailures.map(item => ({ originLabel: item.split(': ')[0] ?? item, reason: item })),
        ],
      }), { reason: 'W1 文件批次导入/解析失败，保留未完成清单' })
    }
    const omissions = [...(intake?.skipped.map(item => item.originLabel + ': ' + item.reason) ?? []), ...d4IntakeFailures]
    return { ...(getCase(caseId) ?? reviewCase), ...(omissions.length ? { d4IntakeFailures: omissions } : {}) }
  } catch (error) {
    if (createdCaseId) throw new Error('D4_CASE_CREATED_INCOMPLETE: ' + createdCaseId + ': ' + String(error))
    throw error
  } finally {
    if (intake) releaseD4Intake(intake, !!createdCaseId)
  }
}
