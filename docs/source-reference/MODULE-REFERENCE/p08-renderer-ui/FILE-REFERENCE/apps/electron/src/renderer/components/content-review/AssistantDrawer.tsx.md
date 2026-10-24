---
path: apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd4513c30d50f9280363330dde3e53f78c2d483d
sha256: 2e6568fb43afc283b7721c8086c6925cfa8c1a33543d70e7f1a208cdb0224c13
lines: 423
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx

## 1. 结论与边界

**审核助手对话抽屉**（`apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx:1-10`，D9）：固定右侧抽屉（`reviewAssistantOpenAtom`）；消息按案卷隔离（`reviewAssistantThreadsAtom[caseId]`）；**degraded 消息顶部显示「离线解答（未连接模型）」灰条**（`:7`）；快捷提问 3 个（`:9`）；快捷键 Ctrl/Cmd+Shift+A 由主视图监听（`:10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AssistantDrawer` | 组件 | `:52-…` | `{actions}` 对话抽屉 |
| （消息气泡） | 内部组件 | `:366-423` | 含 degraded 灰条与 references 徽标 |

内部：快捷提问三题（`:45-51`）。

## 3. 内部逻辑与关键流程

- 头部：标题+关闭+上下文（案卷名+选中问题卡）。
- 消息列表：`reviewAssistantThreadsAtom[caseId]` 按案卷隔离；degraded 显式灰条（**离线解答标注**，`:7`）；references 小 badge。
- 输入区：Textarea+发送（pending spinner）；3 个快捷提问。
- 开关：`reviewAssistantOpenAtom`（快捷键在主视图，`:10`）。

## 4. 调用者与调用链

- 消费方：审核工作台（右侧抽屉）。
- 出向：`use-review-actions`（发送）、atom 状态。

## 5. 数据 I/O、读写与副作用

经 actions 发送消息（模型调用在服务层）；无直写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 模型未连接 | `:7` | degraded 灰条「离线解答」 |
| pending | — | spinner |

## 7. 权限与权威状态

**degraded 显式标注**（离线解答≠模型结论）——证据分级红线；无权限语义。

## 8. 修改影响面

- `reviewAssistantThreadsAtom` 形状；degraded 语义改动影响证据分级。
- 快捷键绑定在主视图（跨文件）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、按案卷隔离/degraded 标注 | 已证实 | `:1-423` |
| 模型回答质量 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `AssistantDrawer` | `:52-…` | covered |
| 消息气泡/degraded | `:366-423` | covered |
