import { expect, test } from 'bun:test'
import { createStore } from 'jotai'
import type { BrowserViewState } from '@profer/shared'
import { agentSessionsAtom } from '@/atoms/agent-atoms'
import { tabsAtom } from '@/atoms/tab-atoms'
import { openFilePreviewTab } from '@/components/diff/preview-opener'
import { reconcileBrowserTabs } from './browser-tab'
import type { AgentSessionMeta } from '@profer/shared'
import { canOpenOrdinaryWorkTab, resolveOrdinaryTabSession, selectRestorableAgentTabs } from './agent-tab-access'

const session = (id: string, extra: Partial<AgentSessionMeta> = {}): AgentSessionMeta => ({
  id, title: id, createdAt: 1, updatedAt: 1, agentRuntime: 'pi', ...extra,
} as AgentSessionMeta)
const ordinary = session('ordinary')
const archived = session('archived', { archived: true })
const draft = session('draft', { draft: true })
const internal = session('internal', { owner: { kind: 'review-case', caseId: 'case-a' } })
const otherWorkspace = session('team', { workspaceId: 'hidden-workspace' })
const snap = (id: string) => ({ id, sessionId: id, type: 'agent', title: id })

test('historical and legacy persisted tabs restore ordinary, archived and project draft but not internal owners', () => {
  const tabs = [snap('internal'), snap('ordinary'), snap('archived'), snap('draft'), snap('deleted'),
    snap('team'), { ...snap('ordinary'), id: '__preview__:ordinary:file' },
    { ...snap('internal'), type: 'browser', id: '__browser__:internal:t' }, null, { type: 'agent' }]
  const result = selectRestorableAgentTabs(tabs, [ordinary, archived, draft, internal, otherWorkspace], new Set())
  expect(result.map(t => t.id)).toEqual(['ordinary', 'archived', 'draft'])
})

test('restoration permits only sessions from visible workspaces and validates tab identity', () => {
  const tabs = [snap('team'), snap('ordinary'), { ...snap('ordinary'), id: 'internal' }]
  expect(selectRestorableAgentTabs(tabs, [ordinary, otherWorkspace], new Set(['hidden-workspace']))
    .map(t => t.id)).toEqual(['team', 'ordinary'])
})

test('Preview/Browser work tabs require an already known, ordinary owner', () => {
  expect(canOpenOrdinaryWorkTab([ordinary, internal], 'ordinary')).toBe(true)
  expect(canOpenOrdinaryWorkTab([ordinary, internal], 'internal')).toBe(false)
  expect(canOpenOrdinaryWorkTab([ordinary, internal], 'stale')).toBe(false)
})

test('late Main metadata denies internal, deleted, mismatched and failing ID lookups', async () => {
  expect(await resolveOrdinaryTabSession('internal', async () => internal)).toBeNull()
  expect(await resolveOrdinaryTabSession('missing', async () => null)).toBeNull()
  expect(await resolveOrdinaryTabSession('ordinary', async () => archived)).toBeNull()
  expect(await resolveOrdinaryTabSession('ordinary', async () => { throw Error('stale window') })).toBeNull()
  expect(await resolveOrdinaryTabSession('', async () => ordinary)).toBeNull()
})

test('reopen accepts Main-authorized ordinary archived session without trusting stale local cache', async () => {
  const restored = await resolveOrdinaryTabSession('archived', async (id) => id === 'archived' ? archived : null)
  expect(restored?.id).toBe('archived')
})

test('Preview opener cannot resurrect a hidden or deleted owner from a stale file event', () => {
  const store = createStore()
  store.set(agentSessionsAtom, [ordinary])
  expect(openFilePreviewTab(store, 'internal', { filePath: '/tmp/secret.png' })).toBe('')
  expect(openFilePreviewTab(store, 'deleted', { filePath: '/tmp/deleted.png' })).toBe('')
  expect(store.get(tabsAtom)).toHaveLength(0)
  const allowed = openFilePreviewTab(store, 'ordinary', { filePath: '/tmp/regular.png' })
  expect(allowed).toContain('__preview__:ordinary:')
  expect(store.get(tabsAtom).some(t => t.sessionId === 'ordinary' && t.type === 'preview')).toBe(true)
})

test('Browser restore/push reconciliation refuses unknown review sessions without disrupting normal browser tabs', () => {
  const store = createStore()
  store.set(agentSessionsAtom, [ordinary])
  const makeState = (sessionId: string): BrowserViewState => ({
    sessionId, activeTabId: 'page-1',
    tabs: [{ tabId: 'page-1', url: 'https://example.com', title: 'Example' }],
  } as BrowserViewState)
  expect(reconcileBrowserTabs(store, makeState('internal'))).toBeNull()
  expect(store.get(tabsAtom)).toHaveLength(0)
  expect(reconcileBrowserTabs(store, makeState('ordinary'))).toBe('__browser__:ordinary:page-1')
  expect(store.get(tabsAtom).some(t => t.type === 'browser' && t.sessionId === 'ordinary')).toBe(true)
  expect(reconcileBrowserTabs(store, makeState('deleted'))).toBeNull()
  expect(store.get(tabsAtom).some(t => t.sessionId === 'deleted')).toBe(false)
})
