---
path: apps/electron/src/renderer/components/agent/CsLabToolTrustBadge.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab656c4b6e25dfbb47a9c43e6e7f04509a38fd46
sha256: eeade4b1e7a066c498f2cdf9421520a1cb225573625432b2f6d0a14937d7058d
lines: 136
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/CsLabToolTrustBadge.tsx

## 1. 结论与边界

实验室 Python 工具免审批状态常驻徽章（文件头 `:1-9`）：仅在会话绑定实验室且权限模式为 `bypassPermissions` 时显示——已信任：高对比警示色+一键恢复逐次确认；未信任（含冷启动）：提示仍需逐次审批+显式启用入口（**二次确认后生效**）。**信任状态只在主进程内存，本组件不持久化**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabToolTrustBadge` | function 组件 | `:26-136` | `({sessionId, labId, permissionMode, revision?}) => ReactElement \| null` |

内部：`active = permissionMode==='bypassPermissions'`（`:32`）；`trusted/busy/confirmOpen` 本地态；`restorePerCallApproval`（`:58-68`）、`enableBypass`（`:70-82`）。

## 3. 内部逻辑与关键流程

1. **信任态读取**（`:37-54`）：active 时 `window.electronAPI.cslab.getToolTrust(sessionId)`（失败 warn 不冒充）；非 active 置 false；effect 清理防竞态（cancelled 标记）。
2. 非 active → null（`:56`）。
3. **恢复逐次确认**：`updateSessionPermissionMode(sessionId,'auto',revision)` → trusted=false；失败 toast。
4. **启用免审批**：`updateSessionPermissionMode(…,'bypassPermissions',revision)`（同模式调用也会触发主进程写入显式信任，`:73`）→ trusted=true；失败 toast；finally 关确认框。
5. 渲染：trusted=琥珀警示（AlertTriangle+“免审批全自动模式”+“执行记录写入 runtime/logs/tool-executions.jsonl”）；未信任=ShieldCheck+“待授权”+“启用后仅本次运行期免审批，重启或切换实验室即失效”（`:104-106`）；按钮切换两动作；启用走 `ConfirmDialog`（destructive，文案明示失效条件，`:123-133`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话视图（权限模式指示区）。出向：`window.electronAPI.{cslab.getToolTrust, updateSessionPermissionMode}`（IPC）、`@profer/shared.ProferPermissionMode`、`@profer/ui`（Button/ConfirmDialog）、`sonner` toast。

## 5. 数据 I/O、读写与副作用

读主进程信任态（IPC）；写权限模式/信任（IPC）；toast。组件本身不持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非 bypassPermissions | `:56` | 不渲染 |
| 信任读取失败 | `:48-50` | warn（trusted 保持 false） |
| 模式切换失败 | `:63-66/:76-78` | toast 错误 |
| 二次确认 | `:123-133` | ConfirmDialog（destructive） |

## 7. 权限与权威状态

- **信任权威在主进程内存**（组件不持久化，`:8`）；启用仅本次运行期、重启/换实验室失效（文案+确认框双披露）。
- 启用需二次确认（destructive）；执行留痕（tool-executions.jsonl）如实提示。

## 8. 修改影响面

改流程 → 影响免审批信任管理；IPC 契约（cslab.getToolTrust/updateSessionPermissionMode）联动主进程。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 信任态不持久化/主进程权威 | 已证实 | 文件头、`:43-50` |
| 二次确认+失效披露 | 已证实 | `:123-133`、`:104-106` |
| 同模式写显式信任 | 已证实 | `:73` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CsLabToolTrustBadge` 全流程 | 2/3 | `:26-136` | covered |
