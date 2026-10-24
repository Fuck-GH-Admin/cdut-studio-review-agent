---
path: apps/electron/src/renderer/components/agent/PermissionModeSelector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96599f7c4705658802f3f843783e8286d6dfed4d
sha256: 3fa5997ee4941c01432e9de0e14822e153104fe0fca83cad9916c30e159a2f90
lines: 290
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/PermissionModeSelector.tsx

## 1. 结论与边界

**Agent 权限模式切换器**（`apps/electron/src/renderer/components/agent/PermissionModeSelector.tsx:1-14`）：弹层显式选择（自动审批/完全自动/计划模式），**不再单击循环**（循环在「完全自动」与「计划模式」相邻时易误触放宽权限，`:5-6`）。权限显示规则**与主进程 EffectiveAgentPresetPolicy 同语义**（`:8`）：预设 `permissionMode` 是本会话权限上限；用户切换属**显式 override 只能保持或收紧**，不能 auto/plan 放宽到 `bypassPermissions`；未 override 显示预设上限（不掩盖真实权限）；超上限模式可见但禁用+说明受限原因。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PermissionModeSelector` | 组件 | 后段 | 切换器 |

## 3. 内部逻辑与关键流程

- 弹层三模式显式选择（防误触）。
- 显示=预设上限或显式 override（更严）；超上限项禁用+受限原因。
- 每会话独立维护权限模式（`:7`）。

## 4. 调用者与调用链

- 消费方：AgentView 输入工具栏。
- 出向：权限模式 API/预设策略。

## 5. 数据 I/O、读写与副作用

经 API 切换模式；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| override 更松 | `:10-11` | 拒（保持/收紧） |
| 超预设上限 | `:14` | 可见但禁用+原因 |
| 未 override | `:12-13` | 显示预设上限 |

## 7. 权限与权威状态

**与 EffectiveAgentPresetPolicy 同语义**（`:8`）——渲染层权限口径与主进程一致；「不掩盖真实运行权限」（`:13`）。

## 8. 修改影响面

- 权限显示口径必须与主进程策略同步（preset-policy 手册对应）。
- 弹层交互（防误触）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、只降不升显示 | 已证实 | `:1-290` |
| 与主进程同语义 | 已证实（注释） | `:8-14` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `PermissionModeSelector` | 全文 | covered |
| 权限显示规则 | `:8-14` | covered |
