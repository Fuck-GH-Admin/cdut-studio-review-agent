---
path: packages/shared/src/types/review-d3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a47040c6d4dd7221c8dd1e933b0c79740cc38823
sha256: de23849084465d7f190f9382fefee55dcbe29ac6a4e000cebcbc92441ad58fc7
lines: 43
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-d3.ts

## 1. 结论与边界

**D3 跨工作区共享模块最小固定契约**（`packages/shared/src/types/review-d3.ts:1-5` 注释）：纯声明。红线（`:3-4`）：D1 workspace revision 是可编辑草稿，D3 `(moduleId, version, digest)` 是冻结复用资产；这些资产**只约束制作、技术预审与追溯，不授予学校制度或行政审批权**。

## 2. 导出与关键符号（4 条）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewD3ModuleLock` | interface（export） | `:8-12` | `{ moduleId; version; digest }` | 锁定三元组 |
| `ReviewD3FrozenModule` | interface（export） | `:14-22` | `{ schemaVersion:1; status:'shared-frozen'; module: ReviewAuthoringModuleV1; digest; dependencies: ReviewD3ModuleLock[]; exampleIds: string[] }` | `exampleIds` 明示"不表示真实业务审核已经合格"（`:20`） |
| `ReviewD3TransferBundle` | interface（export） | `:24-33` | `{ schemaVersion:1; status:'technical-authoring-only'; publicationAllowed:false; workspace: ReviewAuthoringWorkspaceV1; frozen: ReviewD3FrozenModule[]; fingerprint }` | `fingerprint` 非数字签名（`:31`）；递归依赖内联可离线（`:29`） |
| `ReviewD3Usage` | interface（export） | `:35-43` | `{ workspaceId; templateId; templateVersion; moduleId; moduleVersion; digest; usePath }` | 使用记账 |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）；字面量收窄：`status:'shared-frozen'`、`publicationAllowed:false`、`schemaVersion:1` 用字面量类型锁死。

## 4. 调用者与调用链

- 出向：`./review-authoring-v1`（`ReviewAuthoringModuleV1/ReviewAuthoringWorkspaceV1`，`:6`，本批同组）。
- 入向：经 `@profer/shared` barrel（D3 制作/传输工具，跨批实现未读）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；bundle 离线传输语义（`:29`）由实现方承担。

## 6. 分支、失败、取消与恢复

不适用，依据：纯类型。

## 7. 权限与权威状态

**权威边界是本文件核心**：D3 资产不授予学校/行政权（`:4`）、exampleIds 非业务合格（`:20`）、fingerprint 非签名（`:31`）、publicationAllowed 恒 false（`:26`）。

## 8. 修改影响面

改形状 → D3 制作/导入/使用记账工具（跨批）；`publicationAllowed:false`/digest 契约变化会动摇冻结资产的权威边界。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewD3` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出形状+权威红线 | 已证实 | 逐行读 `:1-43` |
| digest 计算/递归依赖展开实现 | 未知 | 实现方未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | `:8-43` | covered |
| 权威红线 | §7 | `:4/:20/:26/:31` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
