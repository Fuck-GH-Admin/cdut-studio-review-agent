#!/usr/bin/env node
/**
 * D3-R0: read-only handoff integrity verifier, NOT another authoring schema.
 *
 * Usage from repository root:
 *   node apps/electron/scripts/review-d3-r0-verify.cjs
 *   node apps/electron/scripts/review-d3-r0-verify.cjs --expect-sha <40-hex-SHA>
 *   node apps/electron/scripts/review-d3-r0-verify.cjs --business-file I /path/to/original.md --expect-sha <SHA>
 *
 * The five private business MDs live outside the repository. Without a
 * --business-file argument, business-source validation is NOT-RUN, not PASS.
 */
'use strict'
const { createHash } = require('node:crypto')
const { readFileSync } = require('node:fs')
const { resolve, sep, basename } = require('node:path')
const { execFileSync } = require('node:child_process')

const root = resolve(__dirname, '../../..')
const manifestPath = resolve(root, 'docs/design/review-agent/fixtures/d3-r0-handoff-manifest.json')
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const assert = (ok, reason) => { if (!ok) throw new Error('D3_R0_VERIFY_FAILED: ' + reason) }
const safeRepoFile = (p) => {
  const full = resolve(root, p)
  assert(full.startsWith(root + sep), 'fixture path escapes repository: ' + p)
  return full
}
function verify() {
  const args = process.argv.slice(2)
  let expectedSha, businessKey, businessPath
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--expect-sha') {
      expectedSha = args[++i]
      assert(typeof expectedSha === 'string' && /^[0-9a-f]{40}$/.test(expectedSha), 'invalid expected code SHA')
    } else if (args[i] === '--business-file') {
      businessKey = args[++i]
      businessPath = args[++i]
      assert(typeof businessKey === 'string' && /^[IACSP]$/.test(businessKey) &&
        typeof businessPath === 'string' && businessPath.trim(), 'usage: --business-file I|A|C|S|P /path/to/original.md')
    } else throw new Error('D3_R0_USAGE: unknown argument ' + args[i])
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert(manifest.schemaVersion === 1 && manifest.releaseId === 'D3-R0', 'invalid manifest identity')
  const currentSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  assert(/^[0-9a-f]{40}$/.test(currentSha), 'not in a Git checkout')
  if (expectedSha) assert(currentSha === expectedSha, 'actual HEAD ' + currentSha + ' != fixed release SHA ' + expectedSha)
  assert(manifest.moduleLocks.length === 2 && new Set(manifest.moduleLocks.map(m => m.moduleId + '@' + m.version)).size === 2,
    'expected distinct B01/B02 synthetic module locks')
  const verifiedLocks = manifest.moduleLocks.map(lock => {
    assert(lock.version === 1 && /^[0-9a-f]{64}$/.test(lock.digest), 'bad version/digest for ' + lock.moduleId)
    const module = JSON.parse(readFileSync(safeRepoFile(lock.path), 'utf8'))
    assert(module.moduleId === lock.moduleId && module.version === lock.version,
      'module identity drift: ' + lock.moduleId)
    assert(module.source && module.source.kind === 'synthetic',
      'synthetic source authority unexpectedly changed: ' + lock.moduleId)
    const actual = sha256(Buffer.from(JSON.stringify(module), 'utf8'))
    assert(actual === lock.digest, 'module digest drift: ' + lock.moduleId)
    return { moduleId: lock.moduleId, version: lock.version, digest: actual, sourceKind: 'synthetic' }
  })
  const sources = manifest.businessSources
  assert(sources.length === 5 && new Set(sources.map(x => x.key)).size === 5,
    'five distinct business MD source locks required')
  let sourceCheck = { verdict: 'NOT-RUN', reason: 'original MD is not bundled in repository; provide --business-file' }
  if (businessKey) {
    const locked = sources.find(x => x.key === businessKey)
    assert(!!locked, 'unknown business MD ' + businessKey)
    assert(basename(businessPath) === locked.fileName,
      'business source filename mismatch: expected ' + locked.fileName)
    const actualHash = sha256(readFileSync(resolve(businessPath)))
    assert(actualHash === locked.sha256, 'business source changed: ' + businessKey)
    sourceCheck = { verdict: 'PASS', business: businessKey, filename: locked.fileName, sha256: actualHash }
  }
  return {
    ok: true,
    release: manifest.releaseId,
    actualHead: currentSha,
    exactCodeShaVerified: Boolean(expectedSha),
    moduleLocks: verifiedLocks,
    businessSource: sourceCheck,
    formalPolicyApproval: false,
    completeBusinessGold: 'NOT-RUN',
  }
}
try { process.stdout.write(JSON.stringify(verify(), null, 2) + '\n') }
catch (e) { process.stderr.write((e instanceof Error ? e.message : String(e)) + '\n'); process.exitCode = 1 }
