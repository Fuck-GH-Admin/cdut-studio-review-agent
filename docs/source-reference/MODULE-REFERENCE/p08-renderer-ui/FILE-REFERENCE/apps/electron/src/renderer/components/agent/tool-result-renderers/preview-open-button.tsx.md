---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/preview-open-button.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8af0804048ae286e637a986168656a1ba1f0eaa1
sha256: 3c582a0eac3885d5f8db007581c933f0fea4f3e17e9964e6d1e4286b23b50656
lines: 57
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/preview-open-button.tsx

## 1. 结论与边界

预览面板**打开文件扩展按钮**（57 行）：显示在 Read/Edit/Write 工具结果预览区 chevron 旁；点击按用户偏好（标签页/右侧分屏）打开文件预览（`:1-7`）。用 `span[role=button]` 避免嵌套 button 非法 + stopPropagation 防冒泡到外层 header button（`:4`，子agent 与 ContentBlock.tsx 对拍证实动机成立）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `PreviewOpenButton` | `:20-56` | `({filePath, className?}) => ReactElement\|null`：无 sessionId/filePath→null（`:24`）；`openPreview(sessionId, {filePath, previewOnly:true, readOnly:true})`（`:26-28`）；`<span role="button" tabIndex={0}>`+Enter/空格键盘激活（`:45-51`）+stopPropagation（`:41-44`）；title"预览文件"、文案"预览" |

内部：`PreviewOpenButtonProps:15`（未导出）。

## 3. 内部逻辑与关键流程

atom（`currentAgentSessionIdAtom`）+hook（`useOpenPreview`）→null 闸→点击/键盘→openPreview（previewOnly+readOnly）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/agent/ContentBlock.tsx:619`（唯一调用，**未传 className**——孤儿 prop 照实）；出向 `@/atoms/agent-atoms`、`@/components/diff/preview-opener`、`@/lib/utils`。

## 5. 数据 I/O、读写与副作用

纯渲染+点击触发预览打开（副作用在 preview-opener）。

## 6. 分支、失败、取消与恢复

!sessionId||!filePath→null；键盘 Enter/空格 preventDefault+stopPropagation。

## 7. 权限与权威状态

`previewOnly:true, readOnly:true`（只读预览不落编辑态）；span+stopPropagation 防外层按钮误触。

## 8. 修改影响面

改交互影响预览入口；previewOnly/readOnly 语义影响预览面板行为。

## 9. 测试证据

无直接测试（**整体零测试**，对比 grep-preview 有配套测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件交互/键盘路径 | 已证实 | 57 行全读（子agent 字节核对） |
| **⑤** `className` prop 孤儿（唯一调用未传） | 已证实 | ContentBlock.tsx:619 grep |
| 头注释与实际一致（Read/Edit/Write+chevron+span 动机） | 已证实 | 子agent 对拍 `apps/electron/src/renderer/components/agent/ContentBlock.tsx:406-410`/`apps/electron/src/renderer/components/agent/ContentBlock.tsx:611-621` |
| 交互实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9、实效 unknown。
