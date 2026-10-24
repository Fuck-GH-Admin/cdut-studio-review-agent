import { describe, expect, test } from 'bun:test'
import { chunkByPropositions } from './propositional-chunker'

/** 覆盖「公式绑定」与「面包屑」两大核心契约的原子命题化切块测试。 */
describe('原子命题化切块引擎', () => {
  test('公式与所属章节绑定的同时保留原始 LaTeX', () => {
    const markdown = [
      '# 高等数学',
      '## 第三章 微分中值定理',
      '### 柯西中值定理',
      '若函数 $f(x)$ 与 $g(x)$ 在闭区间上连续、在开区间内可导，则存在一点 $\\xi$ 使得',
      '$$\\frac{f\'(\\xi)}{g\'(\\xi)} = \\frac{f(b)-f(a)}{g(b)-g(a)}$$',
      '成立。该定理是拉格朗日中值定理的推广。',
    ].join('\n')

    const chunks = chunkByPropositions(markdown)

    expect(chunks.length).toBe(1)
    const chunk = chunks[0]!
    // 面包屑为全路径标题栈拼接
    expect(chunk.breadcrumb).toBe('[高等数学 > 第三章 微分中值定理 > 柯西中值定理]')
    // 正文已完成 LaTeX 还原，绝不残留占位符
    expect(chunk.content).not.toContain('__MATH_BLOCK_')
    expect(chunk.content).toContain('\\frac{f\'(\\xi)}{g\'(\\xi)}')
    // 块内公式集合完整（3 个行内 + 1 个行间）
    expect(chunk.mathBlocks.length).toBe(4)
    expect(chunk.mathBlocks.some((block) => block.startsWith('$$'))).toBe(true)
    expect(chunk.charCount).toBe(chunk.content.length)
    expect(chunk.content.startsWith(chunk.breadcrumb)).toBe(true)
  })

  test('按标题栈生成多个独立面包屑，且过短正文并入同块', () => {
    const markdown = [
      '# 线性代数',
      '## 行列式',
      '行列式是描述线性变换伸缩因子的核心工具，其几何意义与向量组围成的有向体积一一对应。',
      '',
      '# 概率论',
      '## 随机变量',
      '随机变量是把样本空间映射到实数轴的可测函数，它是连接概率与分析的桥梁。',
    ].join('\n')

    const chunks = chunkByPropositions(markdown)
    const breadcrumbs = chunks.map((chunk) => chunk.breadcrumb)

    expect(breadcrumbs).toContain('[线性代数 > 行列式]')
    expect(breadcrumbs).toContain('[概率论 > 随机变量]')
    // 每个命题块均带有合法前缀
    for (const chunk of chunks) {
      expect(chunk.content.startsWith(chunk.breadcrumb)).toBe(true)
      expect(chunk.charCount).toBe(chunk.content.length)
    }
  })

  test('chunkId 为确定性哈希（重复调用结果稳定且唯一）', () => {
    const markdown = '# 数据结构\n## 二叉树\n二叉树是每个节点最多拥有两个子节点的树形结构。'
    const first = chunkByPropositions(markdown)
    const second = chunkByPropositions(markdown)

    expect(first.map((chunk) => chunk.chunkId)).toEqual(second.map((chunk) => chunk.chunkId))
    expect(new Set(first.map((chunk) => chunk.chunkId)).size).toBe(first.length)
  })

  test('空输入返回空数组', () => {
    expect(chunkByPropositions('')).toEqual([])
    expect(chunkByPropositions('   \n  ')).toEqual([])
  })
})
