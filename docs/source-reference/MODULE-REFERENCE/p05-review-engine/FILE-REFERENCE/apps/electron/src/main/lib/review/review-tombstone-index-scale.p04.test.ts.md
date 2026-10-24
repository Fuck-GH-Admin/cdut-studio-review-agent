---
path: apps/electron/src/main/lib/review/review-tombstone-index-scale.p04.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7d08b26bb0cf6500f23b134df877bfa1a1651be3
sha256: c57a488b4ad14701ce197b32c5f7af2a50ca6fe462a8d391e0312305bfe18441
lines: 153
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-tombstone-index-scale.p04.test.ts

## 1. 测试目标

P04-TECHDEBT-01：真实持久化索引缓存失效 + 有界合成规模测量（头注 :1-3「非生产 Electron、非 GC 策略」）——owner 归属与删除 tombstone 的单调性、外部索引替换重建、失败写不放权、新进程重载身份。

## 2. 用例清单

5 用例 / 1 describe（`P04-TECHDEBT-01 index-coupled owner membership` :22）。真实会话管理器+真实索引文件（mkdtemp）；第 4 例 spawn 真实 Bun 子进程；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 索引写/删除/tombstone 持久 | 24-41 | owner id 恒 true、普通恒 false；删除后 tombstone 数组含 owner.id；`assertOrdinaryAgentSession` throw `内部审核会话` |
| 2 | 外部替换索引强制重建 | 43-68 | 导入 tombstone→true；owner 字段→true；移除活 owner **不降级为普通**（P06-FIX-01，ID-only deny journal 单调） |
| 3 | 失败原子写不放权 | 70-84 | 目录占 `.tmp` → `deleteAgentSession` throw `写入 Agent 会话索引失败`；meta 仍在、身份仍 true；修复后删除成功、身份仍 true |
| 4 | 新进程重载持久身份 | 86-99 | spawn Bun（preload mock）断言 `isReviewOwnedOrDeletedAgentSessionId` 为 true，退出码 0 |
| 5 | 0/1k/10k/100k 基准（非门禁） | 101-151 | `P04_TECHDEBT_01_BENCHMARK=` JSON 输出（cold_load/seed_write/index_update/hot_guard/linear_reference p50/p95）；断言 answer 正确 |

## 3. 真实断言

如 §2 表（逐条读自 :24-151）；用例 5 注释 :132-134 明示 linear_reference 是显式参照对比「非 pre-change CI 结果」。

## 4. 未覆盖与脆弱点

- 未覆盖：并发写竞态、GC 策略（明确不在范围，头注 :3）。
- 脆弱点：基准为非门禁测量（`console.log` 输出）；spawn 依赖 preload 路径（:91）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §2 | 已证实 | 本文件逐行 |
| tombstone 单调/失败写不放权/重载 | 已证实 | 用例 1-4 |
| 性能数值 | 未知 | 基准非门禁、未运行 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 归属/删除持久化 | §2 | covered |
| 外部索引重建/P06-FIX-01 | §2 | covered |
| 失败写拒止 | §2 | covered |
| 跨进程重载 | §2 | covered |
| 基准 | §4 | unknown（非门禁） |
