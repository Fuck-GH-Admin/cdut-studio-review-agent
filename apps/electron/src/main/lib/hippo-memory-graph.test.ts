import { describe, expect, test } from 'bun:test'
import { HippoMemoryGraph } from './hippo-memory-graph'

describe('HippoMemoryGraph（纯内存海马体图谱）', () => {
  test('getOrCreateNode 幂等：重复调用返回同一下标且不重复建点', () => {
    const graph = new HippoMemoryGraph()
    const first = graph.getOrCreateNode('皮肤引擎')
    const second = graph.getOrCreateNode('皮肤引擎')

    expect(first).toBe(second)
    expect(graph.nodeNames.length).toBe(1)
    expect(graph.nodeNames[0]).toBe('皮肤引擎')
  })

  test('getOrCreateNode 已存在节点不会覆盖既有 isDoc 标记', () => {
    const graph = new HippoMemoryGraph()
    const idx = graph.getOrCreateNode('doc::a.md', true)
    const again = graph.getOrCreateNode('doc::a.md')

    expect(again).toBe(idx)
    expect(graph.isDocumentNode.has(idx)).toBe(true)
  })

  test('addUndirectedEdge 双向：两端邻接表都能互相找到对方', () => {
    const graph = new HippoMemoryGraph()
    graph.addUndirectedEdge('doc::a.md', '皮肤', 3)

    const docIdx = graph.nodeIndices.get('doc::a.md')!
    const entityIdx = graph.nodeIndices.get('皮肤')!

    expect(graph.adjacency[docIdx]).toEqual([{ target: entityIdx, weight: 3 }])
    expect(graph.adjacency[entityIdx]).toEqual([{ target: docIdx, weight: 3 }])
  })

  test('addUndirectedEdge 忽略自环', () => {
    const graph = new HippoMemoryGraph()
    graph.addUndirectedEdge('重复', '重复')

    const idx = graph.nodeIndices.get('重复')!
    expect(graph.adjacency[idx]).toEqual([])
  })

  test('PPR：种子命中时其相邻文档节点得分最高', () => {
    const graph = new HippoMemoryGraph()
    // doc-1 仅与种子实体相连；doc-2 与无关实体相连
    graph.getOrCreateNode('doc::hit.md', true)
    graph.getOrCreateNode('doc::noise.md', true)
    graph.addUndirectedEdge('doc::hit.md', '皮肤', 2)
    graph.addUndirectedEdge('doc::noise.md', '天气', 1)

    const result = graph.computePersonalizedPageRank(['皮肤'], 0.15, 15)

    expect(result.has('doc::hit.md')).toBe(true)
    expect(result.has('doc::noise.md')).toBe(true)
    expect(result.get('doc::hit.md')!).toBeGreaterThan(result.get('doc::noise.md')!)
  })

  test('空图返回空 Map', () => {
    const graph = new HippoMemoryGraph()
    const result = graph.computePersonalizedPageRank(['任意'], 0.15, 15)

    expect(result.size).toBe(0)
  })
})
