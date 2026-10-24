---
path: apps/electron/src/renderer/components/agent/GraphQuestionInput.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f89a61f44077a7c5eb71577db49640f255734473
sha256: ce33dec0b682c90ff2b01f17118510daad775c76bb0f7f5fbe90669c19068d7b
lines: 192
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/GraphQuestionInput.tsx

## 1. 结论与边界

**画板底部紧凑追问输入条**（`apps/electron/src/renderer/components/agent/GraphQuestionInput.tsx:1-5`）：点击 Task 节点后浮出；左节点信息+右输入框/发送。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GraphQuestionInput` | 组件 | `:26-192` | 追问输入条（无节点选中返回 null） |

## 3. 内部逻辑与关键流程

选中 Task 节点→浮出输入条→发送追问（经 agent API）；无选中→null。

## 4. 调用者与调用链

- 消费方：项目画板（ProjectGraphPanel）。
- 出向：agent API（追问）。

## 5. 数据 I/O、读写与副作用

经 API 发送；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无选中节点 | — | null |
| 发送失败 | — | 错误显示 |

## 7. 权限与权威状态

无身份语义；追问经 API。

## 8. 修改影响面

节点选中协议；追问 API 契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出 | 已证实 | `:26-192` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `GraphQuestionInput` | `:26-192` | covered |
