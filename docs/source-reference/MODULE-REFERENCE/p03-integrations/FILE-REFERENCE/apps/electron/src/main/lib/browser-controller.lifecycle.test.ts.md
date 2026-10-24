---
path: apps/electron/src/main/lib/browser-controller.lifecycle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db90f09237aac82b14315d29a8c34dfabe8dd4be
sha256: d793741580e5e143ce88bf2505779ea7240734f1c55e83cbc4c679b0e73277a3
lines: 170
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller.lifecycle.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

生命周期与只读查询：末标签关闭必须移除原生 hostView（透明残留会拦截全局点击）且**保留前台所有权**（否则同会话重开被误判后台空白）；`listTabs` 严格只读。

## 2. 用例清单

4 用例（顶层 test，无 describe）。替身 owner/hostView/webContents 注入（记录副作用调用）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 末标签关闭清理 | 3-62 | closeTab→null、getState null、**foregroundSessionId 保留**、hostView setVisible(false)+bounds 归零、removeChildView 各 1、tabClosed 1 |
| 2 | 无会话 listTabs 只读 | 64-97 | `{exists:false,…}`；sessions 0；`sent:[]`（addChildView 直接 throw 兜底） |
| 3 | 有会话只投影 | 99-141 | 2 标签元数据投影、不新建不广播、`sent:[]` |
| 4 | 失效 activeTabId | 143-163 | `activeTabId:null`、`agentTabId:null`、仅现存标签 |

## 3. 真实断言

如 §2 表（逐条读自 :3-163）；用例 1 注释 :58-60 明示前台所有权保留原因（新 layout 否则被误判后台）。

## 4. 未覆盖与脆弱点

- 未覆盖：`dispose()` 全局清理、`hideAll` 路径。
- 脆弱点：`controller as unknown` 注入内部字段（结构性耦合）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §2 | 已证实 | 本文件逐行 |
| hostView 移除/所有权保留/listTabs 只读被固定 | 已证实 | 用例 1-4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `closeTab`→`disposeSession` 清理链 | §2 | covered |
| `listTabs` 三态 | §2 | covered |
| `dispose`/`hideAll` | §4 | unknown（未测） |
