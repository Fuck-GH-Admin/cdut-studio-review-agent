---
path: apps/electron/src/main/lib/browser-controller-fresh-session-tab.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8dc0c1978088577982044994909ea079c48bf4b
sha256: b6f50d86d2a65183212805c23a6a8e0a5f84b60178344bce52047a65793d4881
lines: 125
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller-fresh-session-tab.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

「新建标签页一次只落一个」回归（头注 :3-15）：根因是 `getOrCreateSession` 给空会话预建标签而 `createDisplayTab/createNewTab/previewOpen` 又建一次——修复为三调用方 `ensureInitialTab:false`。

## 2. 用例清单

4 用例（顶层 test，无 describe）。夹具 `harness()`（:25-84，真 mkdtemp+替身 createTab/emit/loadUrl 等，注释 :17-22「只数标签不造 WebContents」）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 冷会话+用户新建 | 86-93 | `['tab-1']`、首 tab 前未 emit |
| 2 | 冷会话+Agent 新建 | 95-101 | `['tab-1']` |
| 3 | 冷会话+本地预览 | 103-109 | 仅 1 个预览标签 |
| 4 | 已有会话加一 | 111-117 | `['tab-1','tab-2']` 不顶掉 |

## 3. 真实断言

如 §2 表（逐条读自 :86-117）；`emittedBeforeFirstTab()` 断言冷会话不提前广播（防 `buildState` 抛错，源 :975-983）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Electron 标签几何。
- 脆弱点：替身面较大（createTab/activateDisplayTab/buildState 全替）——聚焦「建几个标签」。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §2 | 已证实 | 本文件逐行 |
| 单标签回归被固定 | 已证实 | 用例 1-3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `ensureInitialTab:false` 三入口 | §2 | covered |
| 已有会话追加 | §2 | covered |
| 真实标签几何 | §4 | unknown（未测） |
