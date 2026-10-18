/**
 * W1 intake role selection: an OS-picked source is only applicant material.
 * Main indexes this plan against its own staged files, never paths/names from renderer.
 * Policy/rule authority and subject evidence links must be managed independently.
 */
export type D4IntakeRole = 'application' | 'evidence'

export function resolveD4IntakeRoles(fileCount: number, proposed: unknown): D4IntakeRole[] {
  if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > 8) {
    throw new Error('D4_INTAKE_ROLE_PLAN_INVALID: staged file count outside permitted range')
  }
  if (proposed === undefined) return Array.from({ length: fileCount }, () => 'application')
  if (!Array.isArray(proposed) || proposed.length !== fileCount ||
      proposed.some(role => role !== 'application' && role !== 'evidence')) {
    throw new Error('D4_INTAKE_ROLE_PLAN_INVALID: roles must match the native-picked files')
  }
  return [...proposed] as D4IntakeRole[]
}
