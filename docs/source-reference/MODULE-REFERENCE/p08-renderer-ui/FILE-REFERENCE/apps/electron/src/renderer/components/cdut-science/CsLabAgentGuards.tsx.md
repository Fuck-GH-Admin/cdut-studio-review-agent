---
path: apps/electron/src/renderer/components/cdut-science/CsLabAgentGuards.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 91d2c854f66e985998e2728116b3ff6e3d0d5f3b
sha256: fd42db5d87dc6bfedbc9606b0e58829343b2a69f1e16d76b88b5cd8c257a4c24
lines: 38
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabAgentGuards.tsx

## 1. 结论与边界

**CDUT Science 实验室会话访问管控展示组件**（`apps/electron/src/renderer/components/cdut-science/CsLabAgentGuards.tsx:1-7`）：受控展示（不含业务状态，父级决定渲染时机）——`CsLabComposerLock`：实验室绑定会话在主界面打开时的**输入区锁定占位**（模型/附件/发送均不可用，`:19`），引导前往 CDUT Science。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabComposerLock` | 组件 | `:22-38` | `{onEnter}` 锁定占位 |

内部：`CsLabComposerLockProps`（`:13-16`）。

## 3. 内部逻辑与关键流程

锁定占位（`:19-21`）：视觉沿用输入卡片（圆角/底色），**替换整个 composer**；按钮 Atom 图标（与侧边栏品牌一致）；「前往 CDUT Science」→`onEnter`（直达实验室工作台）。

## 4. 调用者与调用链

- 消费方：主界面 composer（实验室绑定会话）。
- 出向：`@profer/ui/primitives`。

## 5. 数据 I/O、读写与副作用

无 I/O（展示+回调）。

## 6. 分支、失败、取消与恢复

受控展示（`:4`，父级决定时机）。

## 7. 权限与权威状态

**实验室绑定会话仅科学工作台内交互**（`:30`）——输入区锁定是访问管控。

## 8. 修改影响面

`onEnter` 回调合同；品牌图标一致性（`:20`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、锁定占位 | 已证实 | `:1-38` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabComposerLock` | `:22-38` | covered |
