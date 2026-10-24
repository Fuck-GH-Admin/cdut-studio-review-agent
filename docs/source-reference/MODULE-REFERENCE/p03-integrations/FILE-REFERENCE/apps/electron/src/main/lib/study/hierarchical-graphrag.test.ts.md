---
path: apps/electron/src/main/lib/study/hierarchical-graphrag.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 807379217f4bba99c6e367cf0174ea7bba0035db
sha256: 99c9964ad5702d2a61652fe74528e186115ccfaf61d255cc8ae8d0b9516b2411
lines: 113
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/study/hierarchical-graphrag.test.ts

## 1. 测试目标

分层 Leiden 社区聚类与分层社区构建（`apps/electron/src/main/lib/study/hierarchical-graphrag.test.ts:17,58`）。被测 `buildHierarchicalCommunities`/`HierarchicalLeidenEngine`——**来自 `./hierarchical-graphrag`（⚠ 非本批 18 清单内文件）**，测试作为 retriever 的间接依赖锚照实记录。夹具：`completeGraph()` 完全图工厂（`:5-15`）。

## 2. 用例清单

共 **5 个 `test(`**（2 个 `describe`）：

### 分层 Leiden 社区聚类（3）

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 18-35 | 两完全图聚 2 社区 | partitions.size 6、distinct 2、同图同社区×4、异图异社区 | 独立 |
| 2 | 37-43 | 确定性：同输入多次一致 | sorted entries toEqual | 独立 |
| 3 | 45-56 | 孤立点自成社区 | 'lonely' defined、≠ a0 社区 | 独立 |

### 分层社区构建（2）

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 4 | 59-85 | 三层各两社群 | levels [0,1,2]、每层 2 个、成员并集 6 | 独立 |
| 5 | 87-111 | title/summary 只由成员派生不编造 | level0 1 个、title toBe '柯西中值定理'（公共前缀）、summary 含标题、members ['a0','a1'] | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:24-34` 8 断言；`:41` sorted toEqual；`:53-55`；`:75-83` 4 断言；`:103-110` 4 断言（**不编造事实锚**）。

## 4. 未覆盖与脆弱点

- 用例 5 的「摘要仅陈述成员构成」断言弱（仅 toContain 标题）。
- 自环边（lonely-lonely）语义为孤立点识别。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test/2 describe | 已证实 | 全文 |
| 确定性/孤立点/三层构建 | 已证实 | `:37-85` |
| 派生不编造锚 | 已证实 | `:103-110` |
| 被测文件在批外（照实记录） | 已证实 | import 行+清单核对 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| Leiden 划分 | §2 | 1-3 | covered |
| 分层构建 | §2 | 4-5 | covered |
| 摘要生成细节 | §4 | — | unknown |
