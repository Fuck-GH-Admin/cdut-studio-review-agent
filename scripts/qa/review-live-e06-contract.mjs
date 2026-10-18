import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { isAbsolute, resolve } from 'node:path'

export const E06_LOCAL_LANES = Object.freeze([
  'E06-PI-READ-TOOL',
  'E06-PI-PERMISSION-DENY-RECOVER',
  'E06-PI-STOP-IN-FLIGHT',
  'E06-DESKTOP-TEXT-PREVIEW',
])

/** Never accept a marker from a previous cached ordinary Pi transcript. */
export function makeE06SyntheticMarker() {
  return 'P06_TOOL_READ_REAL_OK_' + randomUUID().replaceAll('-', '')
}

const VALID_STATUSES = new Set(['RUNNING', 'PASS', 'FAIL', 'NOT-RUN', 'BLOCKED', 'INFO'])

/** A PASS applies to one witnessed lane, never the full P06 E06 umbrella. */
export function summarizeE06Rows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('E06 rows must be an array')
  const seen = new Set()
  const invalid = []
  const failed = []
  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || !row.id || !VALID_STATUSES.has(row.status)
      || seen.has(row.id)) {
      invalid.push(row?.id ?? '(missing)')
      continue
    }
    seen.add(row.id)
    if (row.status === 'FAIL') failed.push(row.id)
    if (row.status === 'PASS' && (
      !Array.isArray(row.assertions) || row.assertions.length === 0
      || row.assertions.some(check => !check || check.pass !== true)
    )) invalid.push(row.id)
  }
  const missing = E06_LOCAL_LANES.filter(id => !seen.has(id))
  return {
    // E06 also includes Claude/fork/cross-window/OS, real original documents,
    // and P05 external conditions. Local Pi lanes can never grant release.
    status: invalid.length || failed.length ? 'FAIL' : 'PARTIAL',
    localLanesComplete: missing.length === 0 && E06_LOCAL_LANES.every(id => rows.some(row => row.id === id && row.status === 'PASS')),
    failed, invalid, missing,
    completedLocalLanes: E06_LOCAL_LANES.filter(id => rows.some(row => row.id === id && row.status === 'PASS')).length,
  }
}

/** Fail before writing synthetic files or sending chargeable model traffic. */
export function assertE06IsolatedPreflight({ reportDir, profileRoot, applicationSha, isolatedProfileConfirmed, selection }) {
  if (isolatedProfileConfirmed !== '1') throw new Error('E06 requires QA_E06_ISOLATED_PROFILE=1 for explicit isolated-profile consent')
  if (typeof reportDir !== 'string' || !isAbsolute(reportDir)
    || typeof profileRoot !== 'string' || !isAbsolute(profileRoot)) {
    throw new Error('E06 requires absolute QA_REPORT_DIR and QA_PROFILE_ROOT paths')
  }
  const selectedProfile = resolve(profileRoot)
  if ([resolve(homedir(), '.cdutai'), resolve(homedir(), '.cdutai-dev')].includes(selectedProfile)) {
    throw new Error('E06 refuses the live default CDUT profile: create an isolated test copy')
  }
  if (resolve(reportDir) === selectedProfile) throw new Error('E06 report destination must differ from the test profile root')
  if (!/^[a-fA-F0-9]{40}$/.test(String(applicationSha ?? ''))) {
    throw new Error('E06 requires a full fixed QA_APPLICATION_SHA (40 hex characters)')
  }
  if (!selection || typeof selection.channelId !== 'string' || !selection.channelId.trim()
    || typeof selection.modelId !== 'string' || !selection.modelId.trim()) {
    throw new Error('E06 requires an existing authorized Pi channel/model in isolated profile')
  }
  // No credentials or channel IDs leave the isolated profile in the QA JSON.
  return { fixedApplicationSha: applicationSha, isolatedProfile: true, approvedModelSelection: true }
}
