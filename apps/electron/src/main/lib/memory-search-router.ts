/**
 * memory-search-router.ts — 记忆检索双引擎策略路由器
 *
 * 保持 memory-archive-search.ts（经典 FTS5 全文检索）100% 不动：本路由仅按用户选择的
 * 引擎类型分发调用，并在增强引擎异常时安全回退到经典引擎，确保检索永不失败。
 */

import { searchMemoryArchive, type MemoryArchiveSearchHit } from './memory-archive-search'
import { hippoMemoryService } from './hippo-memory-service'

/** 记忆检索引擎类型：classic 为经典 FTS5，hipporag 为海马体图谱增强 */
export type MemoryRetrievalEngineType = 'classic' | 'hipporag'

/**
 * 按引擎类型路由记忆检索。
 * @param memoryArchivePath - memory-archive 绝对路径
 * @param query - 原始查询词
 * @param engineType - 引擎类型，默认 classic
 * @param topK - 返回条数上限
 */
export async function searchMemoryArchiveRouted(
  memoryArchivePath: string,
  query: string,
  engineType: MemoryRetrievalEngineType = 'classic',
  topK = 5,
): Promise<MemoryArchiveSearchHit[]> {
  if (engineType === 'hipporag') {
    try {
      return await hippoMemoryService.search(memoryArchivePath, query, topK)
    } catch (err) {
      console.warn('[记忆路由] HippoRAG 增强引擎异常，安全回退到经典引擎:', err)
      return searchMemoryArchive(memoryArchivePath, query, topK)
    }
  }
  return searchMemoryArchive(memoryArchivePath, query, topK)
}
