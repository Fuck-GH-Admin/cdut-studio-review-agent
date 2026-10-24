import { describe, expect, test } from 'bun:test'
import { buildHierarchicalCommunities, HierarchicalLeidenEngine } from './hierarchical-graphrag'

/** 构造一个完全图（K_size），节点前缀为 prefix。 */
function completeGraph(prefix: string, size: number): { ids: string[]; edges: Array<{ source: string; target: string; weight: number }> } {
  const ids = Array.from({ length: size }, (_, i) => `${prefix}${i}`)
  const edges: Array<{ source: string; target: string; weight: number }> = []
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      edges.push({ source: ids[i]!, target: ids[j]!, weight: 1 })
    }
  }
  return { ids, edges }
}

/** 两个互不相连的完全图：Leiden 应稳定聚为 2 个社区。 */
describe('分层 Leiden 社区聚类', () => {
  test('两个完全图聚成 2 个社区', () => {
    const left = completeGraph('a', 3)
    const right = completeGraph('b', 3)
    const edges = [...left.edges, ...right.edges]

    const partitions = new HierarchicalLeidenEngine().partitionCommunities(edges)

    expect(partitions.size).toBe(6)
    const distinct = new Set(partitions.values())
    expect(distinct.size).toBe(2)
    // 同一完全图的节点必须落在同一社区
    expect(partitions.get('a0')).toBe(partitions.get('a1'))
    expect(partitions.get('a1')).toBe(partitions.get('a2'))
    expect(partitions.get('b0')).toBe(partitions.get('b1'))
    expect(partitions.get('b2')).toBe(partitions.get('b0'))
    // 两个完全图分属不同社区
    expect(partitions.get('a0')).not.toBe(partitions.get('b0'))
  })

  test('确定性：相同输入多次划分结果一致', () => {
    const edges = [...completeGraph('a', 3).edges, ...completeGraph('b', 3).edges]
    const engine = new HierarchicalLeidenEngine()
    const first = engine.partitionCommunities(edges)
    const second = engine.partitionCommunities(edges)
    expect([...first.entries()].sort()).toEqual([...second.entries()].sort())
  })

  test('孤立点自成一社区', () => {
    const partitions = new HierarchicalLeidenEngine().partitionCommunities([
      { source: 'a0', target: 'a1', weight: 1 },
      { source: 'a1', target: 'a2', weight: 1 },
      { source: 'a2', target: 'a0', weight: 1 },
      { source: 'lonely', target: 'lonely', weight: 1 },
    ])
    expect(partitions.get('lonely')).toBeDefined()
    // 孤立点社区仅包含自身，不与 a 组同社区
    expect(partitions.get('lonely')).not.toBe(partitions.get('a0'))
  })
})

describe('分层社区构建', () => {
  test('产出 level 0/1/2 三层，且每层两个社群', () => {
    const left = completeGraph('a', 3)
    const right = completeGraph('b', 3)
    const nodes = [
      { id: 'a0', title: '极限' },
      { id: 'a1', title: '极限的运算法则' },
      { id: 'a2', title: '极限存在准则' },
      { id: 'b0', title: '导数' },
      { id: 'b1', title: '导数定义' },
      { id: 'b2', title: '求导法则' },
    ]
    const communities = buildHierarchicalCommunities({
      nodes,
      edges: [...left.edges, ...right.edges],
    })

    const byLevel = new Map<number, typeof communities>()
    for (const community of communities) {
      const list = byLevel.get(community.level) ?? []
      list.push(community)
      byLevel.set(community.level, list)
    }

    // 层数正确：三层齐备
    expect([...byLevel.keys()].sort()).toEqual([0, 1, 2])
    // 每层恰有两个社群
    expect(byLevel.get(0)!.length).toBe(2)
    expect(byLevel.get(1)!.length).toBe(2)
    expect(byLevel.get(2)!.length).toBe(2)

    // 成员并集覆盖全部节点
    const allMembers = new Set(communities.flatMap((community) => community.memberEntities))
    expect(allMembers.size).toBe(6)
  })

  test('title/summary 只能由成员标题派生，不编造事实', () => {
    const left = completeGraph('a', 2)
    const communities = buildHierarchicalCommunities({
      nodes: [
        { id: 'a0', title: '柯西中值定理' },
        { id: 'a1', title: '柯西中值定理的证明' },
      ],
      edges: left.edges,
    })

    const level0 = communities.filter((community) => community.level === 0)
    expect(level0.length).toBe(1)
    const community = level0[0]!
    // 标题取自成员标题的公共前缀
    expect(community.title).toBe('柯西中值定理')
    // 摘要仅陈述成员构成
    expect(community.summary).toContain('柯西中值定理')
    expect(community.memberEntities.sort()).toEqual(['a0', 'a1'])
  })
})
