---
path: apps/electron/src/main/lib/cslab/cslab-canvas.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 338d67dc79b03bfc6752feb618dbe6e662d3ee16
sha256: a7df2e937950fc30d6634547159184f1c01b5900b69c569ce9aa28e0315c1436
lines: 535
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-canvas.test.ts

## 1. 测试目标

CSLab **画布全链**（`apps/electron/src/main/lib/cslab/cslab-canvas.test.ts`）：JSON Canvas 无损读写、DAG 拓扑推演（AND/OR 门限/环路/复活）、Windows 原子写降级、同步引擎（Obsidian 互操作）、Vault 索引缓存。

## 2. 用例清单

5 describe / 19 test。

| describe | # | 断言要点 | 行 |
| --- | --- | --- | --- |
| JSON Canvas 无损读写 | 1-2 | 解析/序列化保留未知字段与 `cdut_science`；画布→DAG 仅含推演标记节点 | `:55-115` |
| DAG 拓扑推演 | 3-10 | AND 门限任一上游死路即折叠（`:117-128`）；OR 门限存活父节点不折叠（`:129-139`）；上游恢复 pruned 复活（`:140-148`）；自环/双节点互指检测（`:149-162`）；有环不剪枝（`:163-173`）；新增边前防环（`:174-183`）；**pruned 不污染人工事实、恢复回 verified**（`:184-226`）；剪枝节点带 `gpu_task_id` 进待取消列表（`:227-247`） |
| Windows 原子写降级 | 11-13 | rename 连续 EPERM 后重试成功（`:249-266`）；永久失败原地写（`:267-279`）；双失败抛可识别错误（`:280-297`） |
| Canvas 同步引擎 | 14-17 | 创建/读写保留 Obsidian 未知字段（`:299-334`）；外部新增节点仅合并元数据（`:335-383`）；**CDUT 独有节点遇 Obsidian 重构写冲突副本**（`:384-421`）；外部仅改文本只合并 `cdut_science`（`:422-468`）；`mergeCanvasScienceMeta` 标 orphan（`:469-487`） |
| Vault 索引缓存 | 18 | 增量复用、双链、坏缓存自愈、删除清理（`:489-534`） |

（用例编号为跨 describe 连续计数，共 18 个 `test`。）

## 3. 真实断言

- `:184-226`（pruned 不污染人工事实组）；`:280-297`（双失败抛 `CsLabFileBusyError` 类可识别错误）；`:384-421`（冲突副本组）；`:55-91`（未知字段保留）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Obsidian 文件格式全集；watcher 并发抖动。
- 脆弱点：DAG 门限语义（AND/OR）与折叠规则强耦合；Windows 降级断言与 `cslab-atomic` 三级降级一一对应。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 用例覆盖无损/DAG/原子写/同步/索引 | 已证实 | `:55-534` |
| 不污染人工事实/冲突副本红线 | 已证实（断言） | `:184-226`、`:384-421` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 无损读写 | 1-2 | `:55-115` | covered |
| DAG 推演 | 3-10 | `:117-247` | covered |
| 原子写降级 | 11-13 | `:249-297` | covered |
| 同步引擎 | 14-17 | `:299-487` | covered |
| Vault 索引 | 18 | `:489-534` | covered |
