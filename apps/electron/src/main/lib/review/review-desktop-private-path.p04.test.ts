/**
 * P04-PATH-01 path-only desktop preview / filesystem protocol boundary.
 * Synthetic fixtures, no real Electron window and no actual user files.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  createAgentSession, createReviewOwnedAgentSession, deleteAgentSession,
} from '../agent-session-manager'
import { createAgentWorkspace } from '../agent-workspace-manager'
import { getAgentSessionMessagesPath, getAgentSessionWorkspacePath, getAgentWorkspacesDir, getConfigDir, getPiCheckpointsDir, getWorkspaceFilesDir } from '../config-paths'
import { filterOrdinaryDesktopFileEntries, isReviewPrivateDesktopPath, isUnsafeAgentWorkspaceMutationPath } from '../review-private-file-access'
import { isReadOnlyPreviewPathAllowed } from '../preview-path-policy'
import { registerProferDirectoryPath, registerProferFilePath, handleProferFileRequest } from '../local-file-protocol'

const sandbox = mkdtempSync(join(tmpdir(), 'p04-path-sandbox-'))
process.env.PROFER_CONFIG_DIR = sandbox
afterAll(() => rmSync(sandbox, { recursive: true, force: true }))
function file(path: string, content = 'synthetic') {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  return path
}
function fixture() {
  const key = randomUUID().slice(0, 9)
  const ws = createAgentWorkspace('P04 Path ' + key)
  const normal = createAgentSession('ordinary-' + key, 'mock', ws.id)
  const owner = createReviewOwnedAgentSession({
    caseId: 'p04-' + key, title: 'private-' + key, channelId: 'mock', workspaceId: ws.id,
  })
  const root = getAgentSessionWorkspacePath(ws.slug, owner.id)
  const normalFile = file(join(getAgentSessionWorkspacePath(ws.slug, normal.id), 'normal.md'), 'ordinary-data')
  const secret = file(join(root, 'private.md'), 'secret-data')
  const shared = file(join(getWorkspaceFilesDir(ws.slug), 'shared.md'), 'shared-data')
  return { ws, owner, normal, root, normalFile, secret, shared }
}
describe('P04-PATH-01 desktop path-only private owner exclusion', () => {
  test('private folder and file are denied even when ordinary same-workspace files are allowed', () => {
    const { root, secret, shared, normalFile } = fixture()
    expect(isReviewPrivateDesktopPath(root)).toBe(true)
    expect(isReviewPrivateDesktopPath(secret)).toBe(true)
    expect(isReadOnlyPreviewPathAllowed(secret)).toBe(false)
    expect(isReadOnlyPreviewPathAllowed(root)).toBe(false)
    expect(isReviewPrivateDesktopPath(shared)).toBe(false)
    expect(isReadOnlyPreviewPathAllowed(shared)).toBe(true)
    expect(isReadOnlyPreviewPathAllowed(normalFile)).toBe(true)
  })

  test('realpath symlink aliases from a shared workspace or outside config cannot bypass the fence', () => {
    const { ws, root, secret, shared } = fixture()
    const alias = join(getWorkspaceFilesDir(ws.slug), 'link-private.md')
    const dirAlias = join(getWorkspaceFilesDir(ws.slug), 'link-private-dir')
    symlinkSync(secret, alias)
    symlinkSync(root, dirAlias, 'dir')
    const outerAlias = join(sandbox + '-outer-alias', 'private.md')
    mkdirSync(dirname(outerAlias), { recursive: true })
    symlinkSync(secret, outerAlias)
    for (const path of [alias, dirAlias, join(dirAlias, 'private.md'), outerAlias]) {
      expect(isReviewPrivateDesktopPath(path)).toBe(true)
      expect(isReadOnlyPreviewPathAllowed(path)).toBe(false)
    }
    expect(isReviewPrivateDesktopPath(shared)).toBe(false)
  })

  test('review transcript and checkpoint paths rejected; deleted owner tombstones remain guarded', () => {
    const { owner, root, secret } = fixture()
    const transcript = file(getAgentSessionMessagesPath(owner.id), 'synthetic-review-msg')
    const checkpoint = file(join(getPiCheckpointsDir(), owner.id, 'snapshot.bin'))
    for (const path of [transcript, checkpoint, root, secret]) expect(isReviewPrivateDesktopPath(path)).toBe(true)
    deleteAgentSession(owner.id)
    file(secret, 'synthetic-residual')
    for (const path of [transcript, checkpoint, root, secret]) {
      expect(isReviewPrivateDesktopPath(path)).toBe(true)
      expect(isReadOnlyPreviewPathAllowed(path)).toBe(false)
    }
  })

  test('listing policy hides private child entry names, not only read contents', () => {
    const { root, secret, normalFile, shared } = fixture()
    const visible = filterOrdinaryDesktopFileEntries([
      { path: root, name: 'owner-private' },
      { path: secret, name: 'private.md' },
      { path: normalFile, name: 'normal.md' },
      { path: shared, name: 'shared.md' },
    ])
    expect(visible.map(x => x.name)).toEqual(['normal.md', 'shared.md'])
  })

  test('destructive IPC must not mutate private roots or shared workspace containers', () => {
    const { ws, root, secret, normalFile, shared } = fixture()
    expect(isUnsafeAgentWorkspaceMutationPath(getAgentWorkspacesDir())).toBe(true)
    expect(isUnsafeAgentWorkspaceMutationPath(join(getAgentWorkspacesDir(), ws.slug))).toBe(true)
    expect(isUnsafeAgentWorkspaceMutationPath(root)).toBe(true)
    expect(isUnsafeAgentWorkspaceMutationPath(secret)).toBe(true)
    expect(isUnsafeAgentWorkspaceMutationPath(normalFile)).toBe(false)
    expect(isUnsafeAgentWorkspaceMutationPath(shared)).toBe(false)
  })

  test('token-gated local file protocol cannot register private direct file or root', () => {
    const { root, secret, shared } = fixture()
    expect(() => registerProferFilePath(secret)).toThrow('审核内部会话路径不可注册')
    expect(() => registerProferDirectoryPath(root)).toThrow('审核内部会话路径不可注册')
    expect(registerProferFilePath(shared)).toMatch(/^cdut-file:\/\//)
  })

  test('directory URL registered for ordinary shared parent cannot fetch a private descendant', async () => {
    const { ws, owner, secret } = fixture()
    const parent = join(getAgentWorkspacesDir(), ws.slug)
    const url = registerProferDirectoryPath(parent)
    const request = new Request(url + '/' + encodeURIComponent(owner.id) + '/private.md')
    const response = await handleProferFileRequest(request)
    expect(response.status).toBe(403)
    expect(existsSync(secret)).toBe(true)
  })

  test('directory URL remains denied after owner deletion even if original token stays valid', async () => {
    const { ws, owner, secret } = fixture()
    const url = registerProferDirectoryPath(join(getAgentWorkspacesDir(), ws.slug))
    deleteAgentSession(owner.id)
    file(secret, 'residual-secret')
    const response = await handleProferFileRequest(new Request(url + '/' + owner.id + '/private.md'))
    expect(response.status).toBe(403)
  })
})
