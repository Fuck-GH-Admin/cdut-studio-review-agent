---
path: apps/electron/src/renderer/components/tabs/TabPreviewPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1a7938e9ec4544563cc629ab07778601cca9ba00
sha256: b694adc1445aac222e8fd60c0e336f19515f347c4b2cea599ad0834d43fc3910
lines: 110
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabPreviewPanel.tsx

## 1. 结论与边界

Tab 悬浮预览面板（头注释 :2-8）：hover 弹出标题+消息列表（minimap 风格）；无搜索、无最小条目限制。

## 2. 导出与关键符号

导出 1 条（`export` :67）：`TabPreviewPanel({title, items, isLeaving})`（:67-110）。内部：`ItemIcon`（:30-49，user 头像/assistant 模型 logo/status 警告）、`Preview`（:51-63，MarkdownPreview 两行 clamp）。

## 3. 内部逻辑与关键流程

isLeaving 动画二分支（:72-74）；标题+计数（:79-86）；列表/空态（:90-106）。模型 logo 三参解析（:39，getModelLogo/resolveModelProvider）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`TabBarItem.tsx:18`→:488；index.ts:5 死桶。出向：UserAvatar（:14）、model-logo（:15）、channelsAtom（:17）、MarkdownPreview（:12）。

## 5-7. 数据/分支/权限

纯渲染；不适用。

## 8. 修改影响面

- 消费面：TabBar 悬浮预览。
- 依赖面：model-logo 解析。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；三类图标/动画 | 已证实 | :30-74 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+列表渲染 | §2/§3 | :30-110 | covered |
