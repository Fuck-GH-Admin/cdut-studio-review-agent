---
path: apps/electron/src/renderer/atoms/migration-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 87f9378e702ecb95d4bdc5995a3c5dbdaef10b52
sha256: 423b825d7f42cdf15cead69e558c772a7daa6bb29b233afa7ae670c855da4b9d
lines: 5
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/migration-atoms.ts

## 1. 结论与边界

迁移导入对话框状态（5 行）：开关 + 初始文件路径两个 atom。纯内存，无逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `migrationImportDialogOpenAtom` | atom（导出） | 3 | `boolean` 初值 false | 导入对话框开关 |
| `migrationImportInitialFilePathAtom` | atom（导出） | 5 | `string \| null` 初值 null | 打开时携带的初始文件路径 |

导出合计 2。

## 3. 内部逻辑与关键流程

无（不适用，依据：两个纯 atom）。

## 4. 调用者与调用链

入向（全冻结树检索 `migration-atoms`，4 文件）：`components/migration/MigrationImportDialog.tsx:22`（两者）、`components/settings/DataManagementSettings.tsx:41`（open）、`components/settings/MigrationSettings.tsx:30`（open）、`components/onboarding/OnboardingView.tsx:23`（open）。出向：`jotai`。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯内存）。

## 6. 分支、失败、取消与恢复

无（不适用）。

## 7. 权限与权威状态

无（不适用）。

## 8. 修改影响面

4 个消费方的迁移导入入口（对话框/数据管理/迁移设置/引导）；导入本体在 `MigrationImportDialog` 与 migration-service（跨批）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `migration-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/初值 | 已证实 | `:1-5` 全文 |
| 4 个调用方 | 已证实 | 全树检索（§4） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 个导出 | §2/§4 | 3-5 | covered |
