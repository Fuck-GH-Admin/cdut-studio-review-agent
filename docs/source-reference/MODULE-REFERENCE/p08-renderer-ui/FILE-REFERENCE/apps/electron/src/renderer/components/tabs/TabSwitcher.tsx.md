---
path: apps/electron/src/renderer/components/tabs/TabSwitcher.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d68827973301e73c1462217ac5aac92c6ad6640e
sha256: ea6c713d17163dc409140721a3bf4480f79f98953b0edfd1796652da2eda71c4
lines: 447
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabSwitcher.tsx

## 1. 结论与边界

Ctrl+Tab 会话快速切换器（头注释 :2-5）：MRU 顺序；**键盘和鼠标共享同一套选择模型**。

## 2. 导出与关键符号

导出 1 条（`export` :58）：`TabSwitcher(): ReactElement | null`（:58-）。内部：`SwitchCandidate`（:36）/`SwitchSection`（:46）/`SwitcherModel`（:53）/`SwitcherCandidateRow`（:378）/`Kbd`（:434）/`getIndicatorColor`（:442）。

## 3. 内部逻辑与关键流程

（头+大纲级，447 行）：tabMruAtom+getInitialTabSwitchIndex/promoteTabMru（:19）、activateTabWithSideEffects（:20）、会话指示色（:442）。未打开返 null。

## 4. 调用者与调用链

入向（子agent 交叉核）：`renderer/main.tsx:121`→:1142 全局挂载（**不参与 MainArea 装配**）。出向：tab-atoms（:12-18）、agent-atoms（:21-27）、tab-switching（:19）、tab-activation（:20）。

## 5-7. 数据/分支/权限

纯渲染+键盘交互；不适用。

## 8. 修改影响面

- 消费面：Ctrl+Tab 切换。
- 依赖面：MRU/激活副作用 lib。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；MRU+共享选择模型 | 已证实 | :2-5 |
| 切换器实现逐行 | 推断（头+大纲级） | :58-446 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+契约 | §2/§7 | :2-58 | covered |
| 切换器实现 | §3/§10 | :58-446 | 推断 |
