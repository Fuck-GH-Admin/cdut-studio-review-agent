/**
 * hippo-memory-graph.ts — 纯内存海马体关系图与个性化 PageRank 求解器
 *
 * 数学原理 (HippoRAG NeurIPS 2024)：海马体负责形成索引节点，并通过激活扩散检索新皮层
 * 中的关联记忆。本模块在纯内存中定义无向实体共现图 G=(V, E)，利用幂迭代法计算稳态分布：
 *
 *   p^(t+1) = alpha * p^(0) + (1 - alpha) * Wᵀ p^(t)
 *
 * 其中 p^(0) 为根据 Query 种子实体分配的个性化向量，alpha = 0.15 为重置概率，
 * W 为行归一化邻接权重矩阵。经过 15 次迭代后，文档节点上的概率值即代表与查询
 * 意图具备多跳隐式推理关系的置信度。
 *
 * 零外部依赖：仅使用原生 Float32Array 与 Map，无任何数据库或图计算引擎。
 */

/** 邻接表出边 */
export interface HippoEdge {
  target: number
  weight: number
}

export class HippoMemoryGraph {
  public nodeNames: string[] = []
  public nodeIndices = new Map<string, number>()
  /** 记录节点是否为文档节点（仅文档节点参与最终记忆召回排序） */
  public isDocumentNode = new Set<number>()
  /** 邻接表：节点下标 -> 出边集合 */
  public adjacency: HippoEdge[][] = []

  /** 获取节点下标，不存在则创建（幂等：重复调用返回同一下标，且不会覆盖既有 isDoc 标记） */
  public getOrCreateNode(name: string, isDoc = false): number {
    let idx = this.nodeIndices.get(name)
    if (idx === undefined) {
      idx = this.nodeNames.length
      this.nodeNames.push(name)
      this.nodeIndices.set(name, idx)
      this.adjacency.push([])
      if (isDoc) this.isDocumentNode.add(idx)
    }
    return idx
  }

  /** 添加无向边（双向各写一条出边）；自环直接忽略 */
  public addUndirectedEdge(sourceName: string, targetName: string, weight = 1.0): void {
    const u = this.getOrCreateNode(sourceName)
    const v = this.getOrCreateNode(targetName)
    if (u === v) return

    this.adjacency[u]!.push({ target: v, weight })
    this.adjacency[v]!.push({ target: u, weight })
  }

  /**
   * 求解个性化 PageRank (PPR)
   * @param seedNames 查询 Query 提取的关键词种子列表
   * @param alpha 阻尼重启因子，标准为 0.15
   * @param maxIter 幂迭代次数，默认 15 次
   * @returns 文档节点名 -> PPR 概率（仅包含文档节点）
   */
  public computePersonalizedPageRank(seedNames: string[], alpha = 0.15, maxIter = 15): Map<string, number> {
    const n = this.nodeNames.length
    if (n === 0) return new Map()

    const p0 = new Float32Array(n)
    let validSeeds = 0

    for (const name of seedNames) {
      const idx = this.nodeIndices.get(name)
      if (idx !== undefined) {
        p0[idx] = (p0[idx] ?? 0) + 1.0
        validSeeds++
      }
    }

    // 若 Query 未命中任何图谱节点，退化为均匀分布
    if (validSeeds === 0) {
      p0.fill(1.0 / n)
    } else {
      for (let i = 0; i < n; i++) p0[i] = (p0[i] ?? 0) / validSeeds
    }

    let p = new Float32Array(p0)
    let nextP = new Float32Array(n)

    // 幂迭代循环（单次执行 < 3ms）
    for (let iter = 0; iter < maxIter; iter++) {
      nextP.fill(0)

      for (let u = 0; u < n; u++) {
        const edges = this.adjacency[u]!
        if (edges.length === 0) {
          // 悬空节点将概率贡献给随机跳转
          for (let i = 0; i < n; i++) nextP[i] = (nextP[i] ?? 0) + (1 - alpha) * p[u]! * p0[i]!
          continue
        }

        let totalWeight = 0
        for (const e of edges) totalWeight += e.weight
        const outProb = ((1 - alpha) * p[u]!) / totalWeight

        for (const e of edges) {
          nextP[e.target] = (nextP[e.target] ?? 0) + outProb * e.weight
        }
      }

      for (let i = 0; i < n; i++) {
        nextP[i] = (nextP[i] ?? 0) + alpha * p0[i]!
      }

      p = new Float32Array(nextP)
    }

    // 仅提取文档节点的结果
    const results = new Map<string, number>()
    for (let i = 0; i < n; i++) {
      if (this.isDocumentNode.has(i)) {
        results.set(this.nodeNames[i]!, p[i]!)
      }
    }
    return results
  }
}
