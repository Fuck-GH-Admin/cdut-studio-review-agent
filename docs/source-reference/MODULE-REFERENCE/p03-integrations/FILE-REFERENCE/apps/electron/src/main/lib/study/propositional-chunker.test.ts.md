---
path: apps/electron/src/main/lib/study/propositional-chunker.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c36b5258f6d9ed42f2ec110b93150d10b83b98f
sha256: 3c13ccb44b3618f7aa13b117144870b1e232d971a6f6ff0307b1f8d26a348dae
lines: 68
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/propositional-chunker.test.ts

## 1. 测试目标

**原子命题化切块引擎**（`apps/electron/src/main/lib/study/propositional-chunker.test.ts:5`）：公式与章节绑定且保留原始 LaTeX、标题栈面包屑、chunkId 确定性哈希。

## 2. 用例清单

1 describe / 4 test。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 公式与章节绑定、保留 LaTeX | `chunks.length===1`；`breadcrumb==='[高等数学 > 第三章 微分中值定理 > 柯西中值定理]'`；`content` 不含 `__MATH_BLOCK_`、含 `\\frac{f'(\\xi)}{g'(\\xi)}`；`mathBlocks.length===4`（含 `$$` 开头）；`charCount===content.length`；`content.startsWith(breadcrumb)` | `:6-30` |
| 2 | 标题栈多面包屑、过短正文并入同块 | 含 `[线性代数 > 行列式]`、`[概率论 > 随机变量]`；每块 `startsWith(breadcrumb)`、`charCount===content.length` | `:32-53` |
| 3 | chunkId 确定性哈希 | 两次调用 chunkId 数组相等且唯一（`Set.size===length`） | `:55-63` |

| 4 | 空输入返回空数组 | `:64` |
## 3. 真实断言

- `expect(chunk.content).not.toContain('__MATH_BLOCK_')`（`:23`）。
- `expect(chunk.mathBlocks.length).toBe(4)`（`:26`）。
- `expect(new Set(first.map((chunk) => chunk.chunkId)).size).toBe(first.length)`（`:61`）。

## 4. 未覆盖与脆弱点

- 未覆盖：HARD_MAX 截断、空文档。
- 脆弱点：面包屑文案断言绑定标题栈实现。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖公式/面包屑/确定性 ID | 已证实 | `:6-63` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 公式绑定/还原 | 1 | `:6-30` | covered |
| 面包屑/合并 | 2 | `:32-53` | covered |
| 确定性 ID | 3 | `:55-63` | covered |
