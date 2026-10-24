---
path: apps/electron/src/renderer/components/agent-skills/WorkspaceScopeSelectDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad91a354b08d785dcc91901209f561a958cf13b3
sha256: 718fb81972f927c50ca781366625355422c7683427f852c96eea2cb71c923dd9
lines: 72
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/WorkspaceScopeSelectDialog.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

能力提升两步选择器（72 行，头注 :14-15）：**先选目标工作区，再明确选择保留或删除当前工作区副本**（第二步提示「此选择会立即影响当前工作区」）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkspaceScopeSelectDialog` | 组件 | 17-72 | 两步 Dialog |

内部：`Props`（:6-14）。

## 3. 内部逻辑与关键流程

Step1：搜索过滤（name+slug 小写包含）+全选/清空+勾选集合（slug）；Step2：radio 二选一——「保留并关闭原工作区能力」（默认，原排序位置保留但立即关闭）/「删除原工作区能力」（删除后不可恢复，预设仍执行引用保护，红字警示）。确认→`onConfirm([...selected], keepWorkspaceCopy)`；busy 防重入（关闭/返回均 disabled）。

## 4. 调用者与调用链

入向：全局能力页「提升到全局」动作。出向：`@profer/ui/primitives/dialog`、`@profer/shared`（AgentWorkspace）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（onConfirm 由上层执行 IPC）。

## 6. 分支、失败、取消与恢复

busy 期间锁交互；onConfirm 异常 finally 复位 busy；不抛。

## 7. 权限与权威状态

- 破坏性操作前置确认权威：删除选项必须显式选择且红字警示不可恢复+引用保护声明（:56-58）；默认保底（keepWorkspaceCopy=true）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：全局能力提升流程（skill/preset 两域）。
- 回归关注：默认保留、删除警示文案、busy 锁。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/行号 | 已证实 | 逐行核对 |
| 两步确认/默认保留语义 | 已证实 | :14-15/:50-58 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WorkspaceScopeSelectDialog` 双步 | §3 | 17-72 | covered（未测） |
