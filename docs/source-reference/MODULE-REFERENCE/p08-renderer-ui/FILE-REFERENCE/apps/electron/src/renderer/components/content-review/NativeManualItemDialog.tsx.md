---
path: apps/electron/src/renderer/components/content-review/NativeManualItemDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0bf5b766155b73615266c6617485260b0b714f8a
sha256: fe1af3cb1b38c82c0120e4c20f05a3d9256fc83c2cd8d9da4c98c0497bfb74fb
lines: 246
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/NativeManualItemDialog.tsx

## 1. 结论与边界

**C1-R09 人工事项对话框**（`apps/electron/src/renderer/components/content-review/NativeManualItemDialog.tsx:1-5`）：human-authored、物理落盘的原生 Subject 对话框。读当前 C 拥有的 aggregate；**所有写经 ReviewActions/Main CAS；渲染层 JSON 不能铸造 SourceIdentity 或教师权限**（`:3-4` 红线）。`caseId` 打开时捕获（案卷切换不能重定向写，`:24`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `nativeManualSourcesFromAggregate` | 函数 | `:29-…` | `(aggregate, caseId) => {sources, reason}` **可见源选择器**（安全核心） |
| `NativeManualItemDialog` | 组件 | 后段 | 人工事项对话框 |

内部：`NativeSource`（`:18`）、`LoadState`（`:19`）、`NativeManualItemDialogProps`（`:21-27`）。

## 3. 内部逻辑与关键流程

**`nativeManualSourcesFromAggregate` 安全漏斗**（`:29-…`）：

1. 聚合匹配（`caseV2.id===caseId`）且 `receiptLog[0].type==='CreateNativeWorkspaceCaseV3'`——**非原生 V3 拒**（`:33-36`）。
2. `stage==='draft'` 且无 `canonicalPlan`/`d2RuntimePlan`——**已冻结/计划绑定拒**（`:37-39`）。
3. `documents` 非数组→拒（`reason` 含「不可读」，test 锁定）。
4. 只暴露**当前 active 的 application 角色**物理版本（保留 parser block 标识）——旧版本/跨案/归档/冻结 Plan 记录全拒（test 锁定）。
5. 无可用源→`reason` 提示「系统文件选择器」（test 锁定）。

## 4. 调用者与调用链

- 消费方：人工事项入口（C1 面板）。
- 出向：`use-review-actions`（`ReviewActions`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

经 `actions` 走 ReviewActions/Main CAS 写；无直写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非原生 V3/跨案 | `:33-36` | 拒（reason） |
| 冻结/计划绑定 | `:37-39` | 拒 |
| documents 损坏 | `:40` | 拒（不可读） |
| 无可用源 | 后段 | reason 提示系统选择器 |

## 7. 权限与权威状态

**红线**（`:3-4`）：渲染层不能铸造 SourceIdentity/教师权限；写全经 Main CAS。`caseId` 捕获防重定向（`:24`）。

## 8. 修改影响面

- 安全漏斗改动影响 C1-R09 边界；test 3 用例锁定。
- `receiptLog[0].type` 依赖 aggregate 形状。

## 9. 测试证据

`NativeManualItemDialog.test.ts`（60 行，3 用例）直接覆盖选择器。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、安全漏斗 | 已证实 | `:29-…` |
| 渲染层无铸造权红线 | 已证实 | `:3-4` |
| 主进程 CAS | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `nativeManualSourcesFromAggregate` | `:29-…` | covered |
| 安全漏斗分支 | `:33-…` | covered |
| 测试证据 | 9 | covered |
