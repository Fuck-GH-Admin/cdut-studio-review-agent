import { describe, expect, test } from 'bun:test'
import type { ReviewCase, SourceDocument } from '@profer/shared'
import { w1MaterialHistory } from './w1-material-history'

const doc = (id: string, parseStatus: SourceDocument['parseStatus'] = 'parsed') =>
  ({ id, fileName: id + '.md', parseStatus }) as SourceDocument
describe('W1 crash-aware material history is derived from actual versions', () => {
  test('archived previous original and active replacement are recognized after persisted transition', () => {
    const rows = w1MaterialHistory({
      documents: [doc('new')], archivedDocuments: [doc('old')],
      d4IntakeOrigins: [
        { documentId: 'old', originLabel: 'first.zip/old.md', sha256: 'a'.repeat(64) },
        { documentId: 'new', originLabel: 'later/new.md', sha256: 'b'.repeat(64) },
      ],
      d4MaterialTransitions: [{
        previousDocumentId: 'old', newDocumentId: 'new', kind: 'replace',
        originLabel: 'later/new.md', status: 'archived',
      }],
    })
    expect(rows.find(row => row.documentId === 'new')!.needsReconciliation).toBe(false)
    expect(rows.find(row => row.documentId === 'old')!.location).toBe('archived')
  })
  test('crash during archive leaves two active originals and explicit reconciliation', () => {
    const rows = w1MaterialHistory({
      documents: [doc('old'), doc('new')], archivedDocuments: [],
      d4IntakeOrigins: [{ documentId: 'new', originLabel: 'batch.zip/new.md', sha256: 'a'.repeat(64) }],
      d4MaterialTransitions: [{
        previousDocumentId: 'old', newDocumentId: 'new', kind: 'replace',
        originLabel: 'batch.zip/new.md', status: 'pending',
      }],
    })
    expect(rows.find(row => row.documentId === 'new')!.description).toContain('新旧两版')
    expect(rows.find(row => row.documentId === 'new')!.needsReconciliation).toBe(true)
    expect(rows.find(row => row.documentId === 'old')!.location).toBe('untracked')
  })
  test('historical originals without W1 source SHA are visible, not silently discarded', () => {
    const rows = w1MaterialHistory({
      documents: [], archivedDocuments: [doc('legacy-archived')], d4IntakeOrigins: [],
      d4MaterialTransitions: [],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]!.location).toBe('archived')
    expect(rows[0]!.needsReconciliation).toBe(true)
  })
  test('active partial source and orphaned source do not pretend to be completed', () => {
    const rows = w1MaterialHistory({
      documents: [doc('partial', 'partial')], archivedDocuments: [],
      d4IntakeOrigins: [
        { documentId: 'partial', originLabel: 'photo.png', sha256: 'b'.repeat(64) },
        { documentId: 'orphan', originLabel: 'stale.zip/x.pdf', sha256: 'c'.repeat(64) },
      ], d4MaterialTransitions: [],
    } as Pick<ReviewCase, 'documents' | 'archivedDocuments' | 'd4IntakeOrigins' | 'd4MaterialTransitions'>)
    expect(rows.every(row => row.needsReconciliation)).toBe(true)
    expect(rows.find(row => row.documentId === 'orphan')!.location).toBe('missing')
  })
})
