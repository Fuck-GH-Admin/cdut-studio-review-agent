---
path: packages/shared/src/types/browser.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c908d9da36bf30f9f81e1d8aa095c43a3144c92
sha256: 2ca2b50a0c3037f8374bba190989d754ed3fdb10fc5f39bf2ef495d3ca533b36
lines: 276
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/browser.ts

## 1. 结论与边界

浏览器（Browser）**类型模块**（`packages/shared/src/types/browser.ts`，276 行）：视图布局/执行追踪/标签/滚动/提取/书签历史/下载拦截等形状。纯声明，无逻辑。

## 2. 导出与关键符号

`export` 共 **28 个**（25 interface + 3 type），分 6 组：

**A. 视图布局（`:3-29`）**：`BrowserViewBounds`（`:3-8`）、`BrowserViewLayout`（`:10-29`，主/侧栏布局）。

**B. 执行追踪（`:31-61`）**：`BrowserExecutionSource`（`user/automation/delegation/goal`，`:31`）、`BrowserTraceAction`（12 动作：navigate/observe/wait/click/fill/press/dom/script/screenshot/scroll/extract/tab，`:33`）、`BrowserOperationStatus`（`dispatched/verified/failed/unknown`，`:34`）、`BrowserTraceItem`（`:37-55`）、`BrowserLocalFileInfo`（`:57-61`）。

**C. 标签（`:64-112`）**：`BrowserTabState`（`:64-81`）、`BrowserTabSummary`（`:83-102`）、`BrowserTabListResult`（`:104-112`）。

**D. 视图状态/输入（`:114-186`）**：`BrowserViewState`（`:114-146`）、`BrowserNavigateInput`（`:148`）、`BrowserTabInput`/`BrowserCreateTabInput`（`:154-162`）、`BrowserScrollDirection`（`:164`）、`BrowserScrollInput`/`BrowserScrollResult`（`:166-186`）。

**E. 提取/翻译（`:188-220`）**：`BrowserExtractMode`（`text/links/table/attributes`，`:188`）、`BrowserExtractInput`/`Item`/`Result`（`:190-212`）、`BrowserTranslateResult`（`:214-220`）。

**F. 书签/历史/起始页/事件（`:222-276`）**：`BrowserBookmark`（`:222`）、`BrowserHistoryEntry`（`:232`）、`BrowserStartPageState`（`:239`）、`BrowserAddBookmarkInput`（`:247`）、`BrowserDownloadBlockedEvent`（`:253`）、`BrowserLocalFileSelectionEvent`（`:268`）。

## 3. 内部逻辑与关键流程

无逻辑。`BrowserTraceItem`（`:37-55`）为操作追踪结构；`BrowserOperationStatus`（`:34`）区分 dispatched/verified/failed。

## 4. 调用者与调用链

消费方：Browser 执行器/视图桥/追踪导出。出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为（纯类型）。

## 6. 分支、失败、取消与恢复

不适用（无逻辑）。

## 7. 权限与权威状态

`BrowserExecutionSource` 四源（含 `goal`/`delegation`）是执行归属标签；权限判定在执行方。

## 8. 修改影响面

- `BrowserTraceAction`/`BrowserOperationStatus` 是追踪导出契约。
- 视图布局/状态形状与浏览器 UI 桥耦合。

## 9. 测试证据

纯类型无专属测试（全树检索命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

28 个导出、6 组已证实（`grep -n "^export"` 全表）；浏览器执行行为未知（不在本批）。

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 布局 | `:3-29` | covered |
| B 追踪 | `:31-61` | covered |
| C 标签 | `:64-112` | covered |
| D 视图/输入 | `:114-186` | covered |
| E 提取 | `:188-220` | covered |
| F 书签/事件 | `:222-276` | covered |
