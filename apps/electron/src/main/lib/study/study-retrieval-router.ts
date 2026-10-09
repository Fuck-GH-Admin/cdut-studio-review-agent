/**
 * study-retrieval-router.ts — 速课堂双引擎策略路由器
 *
 * 职责：
 *   保持既有经典混合检索（hybrid-retriever.ts）与新增分层图谱检索
 *   （hierarchical-graphrag-retriever.ts）两条链路完全解耦，由调用方按用户
 *   设置选择引擎，并在增强引擎异常时无缝回退到经典引擎。
 *
 * 契约：默认走 classic；graphrag 抛错时安全回退 classic，绝不向上抛出异常。
 */

import type { StudySearchKnowledgeResult } from '@profer/shared'
import { getGlobalStudyRetriever } from './hybrid-retriever'
import { getHierarchicalGraphRagRetriever } from './hierarchical-graphrag-retriever'

/** 速课堂检索引擎类型：classic 经典混合检索 / graphrag 分层图谱检索 */
export type StudyRetrievalEngineType = 'classic' | 'graphrag'

/**
 * 按引擎类型分发速课堂全域检索。
 *
 * @param sessionId 速课堂会话标识
 * @param query 检索查询词或学生的具体提问
 * @param engineType 引擎类型（默认 classic）
 * @param options 可选：限定文档与返回条数
 */
export function searchStudyRouted(
  sessionId: string,
  query: string,
  engineType: StudyRetrievalEngineType = 'classic',
  options: { targetDocumentId?: string; topK?: number } = {},
): StudySearchKnowledgeResult {
  if (engineType === 'graphrag') {
    try {
      return getHierarchicalGraphRagRetriever().search(sessionId, query, options)
    } catch (error) {
      console.warn('[速课堂检索路由] GraphRAG 增强引擎异常，安全回退到经典引擎:', error)
      return getGlobalStudyRetriever().searchHybrid(sessionId, query, options)
    }
  }
  return getGlobalStudyRetriever().searchHybrid(sessionId, query, options)
}
