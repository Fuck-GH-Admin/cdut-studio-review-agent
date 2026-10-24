---
path: apps/electron/src/renderer/components/cdut-science/CsLabToolsPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b38a4b457a73edf56720cad8bba5e8ac322fb2da
sha256: a5a57b1492b4b4f143db84da206f5727b873b9c12afa08fd97f2998eb2f40cbe
lines: 457
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabToolsPanel.tsx

## 1. 结论与边界

实验室 Python 工具与运行时面板（头注释 :2-6）：仅展示真实扫描/执行结果（无工具/无 Python/失败如实标注 :4）；**会话绑定是唯一注入路径，禁止全局 activeLabId**（:5）。

## 2. 导出与关键符号

导出 1 条（`export` :80）：`CsLabToolsPanel({labId, onToast, ...})`（:80-）。内部：`ENGINE_LABEL`（:35）、`PROFILE_OPTIONS`（:41）、`signature`（:47）、`buildArgsText`（:55）。

## 3. 内部逻辑与关键流程

（头部+大纲级，457 行）：jotai 三原子（customTools/toolDepsProgress/toolRuntime :22-26）；扫描结果列表+执行/刷新/解绑操作；进度展示（依赖安装）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:96` → :2249（drawer.mode=tools）。出向：jotai 三原子（:85-87）；electronAPI 10 处（getToolRuntime:114/refreshCustomTools:125/listCustomTools:126/onToolsChanged:160/ensureUv:176/installToolDeps:189/runCustomTool:215/bindSessionLab:241/unbindSessionLab:242）。

## 5. 数据 I/O、读写与副作用

触发扫描/执行 IPC（真实结果展示）。

## 6. 分支、失败、取消与恢复

失败如实标注（:4）；不适用取消/恢复。

## 7. 权限与权威状态

会话绑定唯一注入（:5）；如实标注契约（:4）。

## 8. 修改影响面

- 消费面：CSLab 工具面板。
- 依赖面：cslab 工具 IPC 族、cslab-atoms。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；如实标注+会话绑定契约 | 已证实 | :2-6 |
| 面板实现逐行 | 推断（头+大纲级） | :80-456 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+契约 | §2/§7 | :2-80 | covered |
| 面板实现 | §3/§10 | :80-456 | 推断 |
