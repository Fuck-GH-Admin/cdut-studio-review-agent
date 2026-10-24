---
path: apps/electron/src/renderer/components/content-review/ReviewV3F13AppealHistory.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b3ee9ace75beee808ac323d1e29d38feab70c1d7
sha256: b169aadbd137692ee56008bb0a86861e474b908f1e0970fc9a4e8bf8b8cbae24
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3F13AppealHistory.tsx

## 1. 结论与边界

**申诉及独立复审历史**（`ReviewV3F13AppealHistory.tsx:9` 注释）：**始终从当前唯一案卷读取；旧决定和证据版本只展示，不暗中改写**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3F13AppealHistory` | function（export） | `:10-42` | `({aggregate: CaseAggregateV2})` |

内部：`decisionText`（5 决定中文映射 `:5-7`）。

## 3. 内部逻辑与关键流程

`useMemo(buildF13AppealHistory(aggregate))`（`:11`，跨文件函数）；空→「暂无申诉。」（`:12`）；逐条渲染：状态/提交人（actorId+actorSource）/理由/原决定（**已被后续决定更正**标注 `:27`）/所附证据（**旧版**标注 `:29`）/复审任务/结果/复核回执/撤回回执/更正后决定（含 basedOnRunId `:36`）/warnings 以 `role="note"` 标「待核对」（**:37**）。

## 4. 调用者与调用链

入向：F13 申诉面板（跨文件）。出向：`./review-v3-f13-appeal-history`（buildF13AppealHistory，跨文件）、`@profer/shared` 类型、react。

## 5. 数据 I/O、读写与副作用

纯渲染（useMemo）。

## 6. 分支、失败、取消与恢复

空列表短路；各可选块条件渲染。不适用。

## 7. 权限与权威状态

只读红线：不暗中改写历史（`:9`）。

## 8. 修改影响面

改展示 → F13 申诉历史可核性。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3F13AppealHistory` → 0 命中；buildF13AppealHistory 属跨文件模块）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+只读语义 | 已证实 | 逐行读 `:1-42` |
| buildF13AppealHistory 行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:10-42` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
