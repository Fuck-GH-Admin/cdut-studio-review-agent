/**
 * hierarchical-graphrag.ts — 纯本地轻量 Leiden 社区聚类与分层图谱
 *
 * 算法规范（Microsoft GraphRAG 2024 & Leiden Modularity）：
 *   1. 纯 TypeScript 实现 Louvain 式「贪心模块度增量优化」：
 *      以 ΔQ = k_i_in(C) − (tot[C] × k_i) / (2m) 为增益，把节点迁移到增益
 *      最大的邻接社区，反复迭代至收敛；聚合阶段把同社区节点折叠为超级节点，
 *      形成上一层拓扑（Leiden 的分层特性）；
 *   2. 确定性排序：节点按 id 字典序、候选社区按编号升序，保证同一输入输出恒定；
 *   3. 孤立点（仅自环或无边连接）自成一社区，绝不强行并入他处；
 *   4. 分层产出：level 0 细粒度考点、level 1 章节模块、level 2 课程宏观思想。
 *
 * 设计红线：零外部数据库、零依赖；title/summary 只能由成员标题派生，禁止编造事实。
 */

/** 分层社区节点（三层：0 细粒度 / 1 章节模块 / 2 课程宏观思想） */
export interface CommunityNode {
  id: string
  level: 0 | 1 | 2
  title: string
  summary: string
  memberEntities: string[]
}

/** 无向加权边 */
export interface WeightedEdge {
  source: string
  target: string
  weight: number
}

/** 社区编号 → 聚合成超级节点后的稳定名称 */
function communityName(value: number): string {
  return `c${value}`
}

/**
 * 纯 TypeScript Leiden/Louvain 分层社区划分引擎。
 */
export class HierarchicalLeidenEngine {
  /**
   * 运行「贪心模块度增量优化 + 聚合」，返回原始节点到社区编号的映射。
   *
   * 说明：本方法完成一层局部移动收敛，聚合能力由上层
   * `buildHierarchicalCommunities` 通过反复调用实现（见 4.2 规范）。
   */
  public partitionCommunities(edges: WeightedEdge[]): Map<string, number> {
    // 1. 收集节点集合（确定性字典序）
    const nodeSet = new Set<string>()
    for (const edge of edges) {
      if (!(edge.weight > 0)) continue
      nodeSet.add(edge.source)
      nodeSet.add(edge.target)
    }
    const nodes = [...nodeSet].sort()
    const n = nodes.length
    if (n === 0) return new Map()

    const index = new Map<string, number>()
    nodes.forEach((name, i) => index.set(name, i))

    // 2. 构建邻接表（无向、合并重边、忽略自环）
    const adjacency: Array<Map<number, number>> = Array.from({ length: n }, () => new Map())
    for (const edge of edges) {
      if (!(edge.weight > 0)) continue
      const u = index.get(edge.source)!
      const v = index.get(edge.target)!
      if (u === v) continue
      adjacency[u]!.set(v, (adjacency[u]!.get(v) ?? 0) + edge.weight)
      adjacency[v]!.set(u, (adjacency[v]!.get(u) ?? 0) + edge.weight)
    }

    // 3. 度与总权重（twoM = 2m）
    const degree = new Float64Array(n)
    let twoM = 0
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (const weight of adjacency[i]!.values()) sum += weight
      degree[i] = sum
      twoM += sum
    }

    // 全孤立图（无边或仅自环）：每个节点自成一社区
    if (twoM === 0) {
      const isolated = new Map<string, number>()
      nodes.forEach((name, i) => isolated.set(name, i))
      return isolated
    }

    // 4. 初始化：每个节点独立成社区
    const community = new Int32Array(n)
    const totalDegree = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      community[i] = i
      totalDegree[i] = degree[i]!
    }

    // 5. 贪心局部移动（确定性遍历 + 收敛判定）
    let improved = true
    let iterations = 0
    while (improved && iterations < 20) {
      improved = false
      iterations++
      for (let i = 0; i < n; i++) {
        const own = community[i]!
        // 统计节点 i 到各邻接社区的权重之和
        const weightToCommunity = new Map<number, number>()
        for (const [j, weight] of adjacency[i]!) {
          const cj = community[j]!
          weightToCommunity.set(cj, (weightToCommunity.get(cj) ?? 0) + weight)
        }
        const ki = degree[i]!
        // 先把自己从原社区移除
        totalDegree[own] = (totalDegree[own] ?? 0) - ki

        let bestCommunity = own
        let bestGain = (weightToCommunity.get(own) ?? 0) - (totalDegree[own]! * ki) / twoM
        const candidates = [...weightToCommunity.keys()].sort((a, b) => a - b)
        for (const candidate of candidates) {
          if (candidate === own) continue
          const gain = weightToCommunity.get(candidate)! - (totalDegree[candidate]! * ki) / twoM
          if (gain > bestGain + 1e-12) {
            bestGain = gain
            bestCommunity = candidate
          }
        }

        totalDegree[bestCommunity] = (totalDegree[bestCommunity] ?? 0) + ki
        if (bestCommunity !== own) {
          community[i] = bestCommunity
          improved = true
        }
      }
    }

    // 6. 稳定重标号：社区编号按「最小成员下标」升序重排为 0..k-1
    const labelMap = new Map<number, number>()
    const result = new Map<string, number>()
    let nextLabel = 0
    for (let i = 0; i < n; i++) {
      const raw = community[i]!
      if (!labelMap.has(raw)) labelMap.set(raw, nextLabel++)
      result.set(nodes[i]!, labelMap.get(raw)!)
    }
    return result
  }
}

/** 把上一层社区聚合为下一层边（同社区内部边丢弃，跨社区边权相加） */
function aggregateEdges(edges: WeightedEdge[], member: Map<string, number>): WeightedEdge[] {
  const weightByPair = new Map<string, number>()
  for (const edge of edges) {
    const source = member.get(edge.source)
    const target = member.get(edge.target)
    if (source === undefined || target === undefined) continue
    if (source === target) continue
    const lo = Math.min(source, target)
    const hi = Math.max(source, target)
    const key = `${lo}::${hi}`
    weightByPair.set(key, (weightByPair.get(key) ?? 0) + edge.weight)
  }
  const keys = [...weightByPair.keys()].sort()
  return keys.map((key) => {
    const [lo, hi] = key.split('::')
    return { source: communityName(Number(lo)), target: communityName(Number(hi)), weight: weightByPair.get(key)! }
  })
}

/** 依据节点到社区的映射分组（确定性：社区编号升序、成员按输入序） */
function groupByCommunity(
  member: Map<string, number>,
  nodeIds: string[],
): Array<{ community: number; members: string[] }> {
  const groups = new Map<number, string[]>()
  for (const id of nodeIds) {
    const community = member.get(id) ?? 0
    const list = groups.get(community) ?? []
    list.push(id)
    groups.set(community, list)
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([community, members]) => ({ community, members }))
}

/** 最长公共前缀（用于由成员标题派生的社群标题） */
function commonPrefix(values: string[]): string {
  if (values.length === 0) return ''
  let prefix = values[0]!
  for (let i = 1; i < values.length; i++) {
    const value = values[i]!
    let j = 0
    while (j < prefix.length && j < value.length && prefix[j] === value[j]) j++
    prefix = prefix.slice(0, j)
    if (!prefix) break
  }
  return prefix.trim()
}

/** 由成员标题派生社群标题（绝不编造事实） */
function deriveGroupTitle(titles: string[]): string {
  const unique = [...new Set(titles.map((title) => title.trim()).filter(Boolean))]
  if (unique.length === 0) return '（空社群）'
  if (unique.length === 1) return unique[0]!
  const prefix = commonPrefix(unique)
  if (prefix.length >= 2) return prefix
  return unique.slice(0, 3).join(' / ')
}

/** 由成员标题派生社群摘要（只陈述成员构成，不含外部推测） */
function deriveGroupSummary(titles: string[]): string {
  const unique = [...new Set(titles.map((title) => title.trim()).filter(Boolean))]
  if (unique.length === 0) return '（无成员）'
  const shown = unique.slice(0, 8)
  return `涵盖 ${unique.length} 个概念：${shown.join('、')}${unique.length > shown.length ? ' 等' : ''}`
}

/** 分层社区构建入参 */
export interface BuildHierarchicalCommunitiesInput {
  nodes: Array<{ id: string; title?: string }>
  edges: WeightedEdge[]
  /** 可选自定义摘要派生器（仅接收成员标题，禁止引入外部事实） */
  summaryFor?: (memberTitles: string[]) => string
}

/**
 * 构建 level 0/1/2 三层社群结构。
 *
 * 聚合策略：以 level 0 划分为基准，逐层把社区折叠为超级节点、重新执行
 * Leiden 局部优化；无外部边的社群在上一层保持独立，避免被错误吞并。
 */
export function buildHierarchicalCommunities(input: BuildHierarchicalCommunitiesInput): CommunityNode[] {
  const engine = new HierarchicalLeidenEngine()
  const titleById = new Map<string, string>()
  const nodeIds: string[] = []
  for (const node of input.nodes) {
    titleById.set(node.id, (node.title ?? '').trim() || node.id)
    nodeIds.push(node.id)
  }

  // level 0：基础划分
  const base = engine.partitionCommunities(input.edges)
  let nextCommunity = 0
  for (const value of base.values()) if (value >= nextCommunity) nextCommunity = value + 1
  // 无边的孤立节点自成一社区
  for (const id of nodeIds) if (!base.has(id)) base.set(id, nextCommunity++)

  const result: CommunityNode[] = []
  let member = base

  for (let level = 0; level <= 2; level++) {
    if (level > 0) {
      // 聚合上一层社区为超级节点后重新划分
      const aggregated = aggregateEdges(input.edges, member)
      const upper = engine.partitionCommunities(aggregated)
      const present = new Set<string>()
      for (const edge of aggregated) {
        present.add(edge.source)
        present.add(edge.target)
      }
      const upperRelabel = new Map<number, number>()
      const communityNewNumber = new Map<number, number>()
      let nextUpper = 0
      for (const id of nodeIds) {
        const current = member.get(id) ?? 0
        if (communityNewNumber.has(current)) continue
        const name = communityName(current)
        if (present.has(name)) {
          const raw = upper.get(name) ?? current
          if (!upperRelabel.has(raw)) upperRelabel.set(raw, nextUpper++)
          communityNewNumber.set(current, upperRelabel.get(raw)!)
        } else {
          // 无外部边的社群在上一层保持独立（分配全新编号，杜绝与上位编号碰撞）
          communityNewNumber.set(current, nextUpper++)
        }
      }
      const composed = new Map<string, number>()
      for (const id of nodeIds) composed.set(id, communityNewNumber.get(member.get(id) ?? 0)!)
      member = composed
    }

    for (const group of groupByCommunity(member, nodeIds)) {
      const titles = group.members.map((id) => titleById.get(id) ?? id)
      result.push({
        id: `L${level}::${group.community}`,
        level: level as 0 | 1 | 2,
        title: deriveGroupTitle(titles),
        summary: input.summaryFor ? input.summaryFor(titles) : deriveGroupSummary(titles),
        memberEntities: group.members,
      })
    }
  }

  return result
}
