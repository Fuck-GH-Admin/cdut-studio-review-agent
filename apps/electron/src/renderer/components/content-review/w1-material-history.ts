import type { ReviewCase, ReviewParseStatus } from '@profer/shared'

/** Derive actual material status from the current aggregate, never from an old toast or warning. */
export interface W1MaterialHistoryRow {
  documentId: string
  fileName: string
  originLabel: string
  sha256?: string
  parseStatus?: ReviewParseStatus
  location: 'active' | 'archived' | 'untracked' | 'missing'
  description: string
  needsReconciliation: boolean
}
export function w1MaterialHistory(reviewCase: Pick<ReviewCase,
  'documents' | 'archivedDocuments' | 'd4IntakeOrigins' | 'd4MaterialTransitions'>): W1MaterialHistoryRow[] {
  const active = new Map(reviewCase.documents.map(doc => [doc.id, doc]))
  const archived = new Map((reviewCase.archivedDocuments ?? []).map(doc => [doc.id, doc]))
  const origins = reviewCase.d4IntakeOrigins ?? []
  const transitions = reviewCase.d4MaterialTransitions ?? []
  const rows = origins.map((origin): W1MaterialHistoryRow => {
    const doc = active.get(origin.documentId) ?? archived.get(origin.documentId)
    const location = active.has(origin.documentId) ? 'active' :
      archived.has(origin.documentId) ? 'archived' : 'missing'
    const replacing = transitions.find(item => item.newDocumentId === origin.documentId)
    const replacedBy = transitions.find(item => item.previousDocumentId === origin.documentId)
    const oldActive = replacing ? active.has(replacing.previousDocumentId) : false
    const oldArchived = replacing ? archived.has(replacing.previousDocumentId) : false
    let description = location === 'active' ? '当前生效材料' :
      location === 'archived' ? '已归档的历史原件' : '来源存在，但当前/归档索引均未找到：需核对'
    let needsReconciliation = location === 'missing'
    if (replacing) {
      if (oldActive && location === 'active') {
        description = '新旧两版都在当前材料中：归档未确认，请人工对账'
        needsReconciliation = true
      } else if (oldArchived && location === 'active') {
        description = '旧版已归档，新版当前生效' +
          (replacing.status !== 'archived' ? '；操作记录未完成，需核对' : '')
        needsReconciliation = replacing.status !== 'archived'
      } else if (!oldActive && !oldArchived) {
        description = '替换关联的旧版未找到：需核对'
        needsReconciliation = true
      }
    }
    if (replacedBy && location === 'archived') description = '历史原件：已被 ' + replacedBy.newDocumentId + ' 替换'
    if (location === 'active' && doc?.parseStatus !== 'parsed') needsReconciliation = true
    return { documentId: origin.documentId, fileName: doc?.fileName ?? origin.documentId,
      originLabel: origin.originLabel, sha256: origin.sha256, parseStatus: doc?.parseStatus,
      location, description, needsReconciliation }
  })
  for (const doc of reviewCase.documents) {
    if (!origins.some(origin => origin.documentId === doc.id)) {
      rows.push({ documentId: doc.id, fileName: doc.fileName, originLabel: '当前案卷文件（无 W1 来源记录）',
        parseStatus: doc.parseStatus, location: 'untracked',
        description: '可能来自旧入口或中断导入：请核对原件和来源，不要自动忽略',
        needsReconciliation: true })
    }
  }
  for (const doc of reviewCase.archivedDocuments ?? []) {
    if (!origins.some(origin => origin.documentId === doc.id)) {
      rows.push({ documentId: doc.id, fileName: doc.fileName,
        originLabel: '历史归档原件（未登记 W1 来源哈希）', parseStatus: doc.parseStatus,
        location: 'archived', description: '历史版已归档；可预览原件但需人工复核其来源与旧版归属',
        needsReconciliation: true })
    }
  }
  return rows
}
