---
path: apps/electron/src/renderer/components/agent/permission-mode-selector-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3188ab66e961a3f94fc2a2c78f310bc5d777d78c
sha256: e9a602006149bffd7fe93f2920a9a9f335eadbe3e5e5f082c69261123218ca41
lines: 53
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/permission-mode-selector-utils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

权限模式选择器纯逻辑层（53 行，头注 :1-6「无 React/Electron 依赖可直接单测」）：**预设权限上限门禁是渲染层唯一防线**——IPC `UPDATE_SESSION_PERMISSION_MODE` 不做上限收敛，此处放行更宽松值会让 UI 显示与实际运行权限不符（:4-6 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `canSelectPermissionMode` | fn | 12-15 | `resolve(cap, candidate)===candidate`（更宽松即不可选） |
| `resolveSelectorMode` | fn | 24-27 | `requestedMode===undefined`→直接显 cap（**不回落全局默认**，注释 :19-23）；否则按 cap 收紧 |
| `PermissionModeMenuEntry` | interface | 29-33 | mode+selectable |
| `buildPermissionModeMenu` | fn | 38-43 | 顺序恒取 `PROFER_PERMISSION_MODE_ORDER`（双端同源，注释 :35-37） |
| `describePermissionModeRestriction` | fn | 46-53 | disabled 项与越权 toast 共用文案 |

## 3. 内部逻辑与关键流程

菜单按共享 ORDER 逐项标 selectable；限制文案 `当前预设将权限限制为「{label}」，不能切换到更宽松的模式`。

## 4. 调用者与调用链

入向：权限模式选择器组件（Radix/Jotai 版，头注 :5-6 说明抽出动机）。出向：`@profer/shared`（`PROFER_PERMISSION_MODE_CONFIG/ORDER`、`resolveEffectivePermissionMode`，:8）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；全部布尔/字符串/数组。

## 7. 权限与权威状态

- 上限门禁权威：渲染层是**唯一**阻止持久化更宽松模式的关卡（:4-6）；`undefined` 不回落全局默认防「显示与实际脱节」（:19-23）。无 sender/role 检查。

## 8. 修改影响面

工具栏权限模式下拉/越权 toast。同测：`permission-mode-selector-utils.test.ts`（8 用例，标注「验收 C-4 代码级证据」）。

## 9. 测试证据

直接测试 `permission-mode-selector-utils.test.ts`（8 用例 / 1 describe；纯函数+共享常量；NOT_RUN）：
1. `:17-22` 菜单顺序恒等于 `PROFER_PERMISSION_MODE_ORDER`（全 cap）。
2. `:24-27` bypassPermissions 上限三选全可。
3. `:29-33` auto 上限：bypass 拒、auto/plan 可。
4. `:35-42` plan 上限：仅 plan 可（C-4 核心回归）。
5. `:44-51` 可选项不被 resolve 收紧（全 cap×entry）。
6. `:53-57` 无 override 显 cap 本身（不回落全局默认）。
7. `:59-66` 有 override 按上限收敛（plan/bypass→plan 等四断言）。
8. `:68-74` 限制文案含 cap label。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/行号 | 已证实 | 逐行核对 |
| C-4 门禁语义 | 已证实 | 测试族逐条 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `canSelectPermissionMode`/`resolveSelectorMode` | §3/§9 | 12-27 | covered |
| `buildPermissionModeMenu` | §3/§9 | 38-43 | covered |
| `describePermissionModeRestriction` | §3/§9 | 46-53 | covered |
