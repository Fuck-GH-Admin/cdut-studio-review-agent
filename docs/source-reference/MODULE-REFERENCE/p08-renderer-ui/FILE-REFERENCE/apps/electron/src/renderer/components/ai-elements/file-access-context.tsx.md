---
path: apps/electron/src/renderer/components/ai-elements/file-access-context.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d5f94155fa0bba69c690a9f40c7a0f50fe485c89
sha256: 5bc19f7966693f7c0622f78b7f8971424d45844c76469de51eb7748c693b8994
lines: 12
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/file-access-context.tsx

## 1. 结论与边界

文件引用所属 Agent 会话的 **React Context**（12 行）："缺失时必须 fail closed"（`:3`）——文件路径芯片等组件据此取得 sessionId 作为文件访问/预览的会话边界。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `FileAccessSessionProvider` | `:6-8` | `({sessionId?, children})` 提供会话 id（可 undefined） |
| `useFileAccessSessionId` | `:10-12` | 消费 hook，返回 `string|undefined` |

内部：`FileAccessSessionContext:4`（默认 undefined）。

## 3. 内部逻辑与关键流程

标准 createContext+Provider/useContext 对；无状态。

## 4. 调用者与调用链

会话视图（Provider 挂载）→`apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx`（`apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx:69` useFileAccessSessionId）等文件引用组件。

## 5. 数据 I/O、读写与副作用

纯 React context；无 IO。

## 6. 分支、失败、取消与恢复

sessionId 缺失→undefined，由消费方 fail closed（如 chip 拒绝搜索/预览）。

## 7. 权限与权威状态

**fail closed 契约**（`:3`）：文件访问必须绑定会话；无会话即无权限。

## 8. 修改影响面

改 context 影响全部文件引用组件的会话绑定语义。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/fail closed 契约 | 已证实 | 12 行全读 |
| 消费方落实情况 | 部分证实 | `apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx:135` 拒绝（同批）；其余未知 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；消费面/实效 unknown。
