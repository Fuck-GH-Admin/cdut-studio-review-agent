---
path: apps/electron/src/renderer/lib/active-tab-content.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d4abae5cc6b24f1ab136da2f18b83fa5d41e9fe5
sha256: 4e41389d8bf8730d1db99760b9929e5745e87b86ed8a7cca9f8c6334bdc6511f
lines: 32
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/active-tab-content.ts

## 1. 结论与边界

主内容 Tab 解析（32 行）：只接受仍存在的同步 activeTabId（防标签高亮与内容分叉 :4-5）。

## 2. 导出与关键符号

导出 2 条（`export` :7/:23）：
- `resolveContentTabId(tabs, activeTabId)`（:7-10）：不存在→null。
- `shouldShowWelcomeLauncher(tabs, activeTabId)`（:23-32）：无真实内容标签且非后台常驻 Tab 才显 WelcomeView；**历史缺陷注释**（:20-21）：曾只排除 Scratch Pad 致教程 Tab 被当空态顶掉正文——教程/Scratch 均为有效内容。

## 3. 内部逻辑与关键流程

二函数各单分支；tutoral/Scratch 判定（:28/:31）。

## 4. 调用者与调用链

入向：主内容区渲染链。出向：`@/atoms/tab-atoms`（SCRATCH_PAD_ID/TUTORIAL_TAB_ID）。

## 5-7. 数据/分支/权限

纯函数；不适用。

## 8. 修改影响面

- 消费面：MainArea 内容判定。
- 依赖面：tab-atoms 标识常量。
- 需同步测试：`active-tab-content.test.ts`（64 行，姊妹手册）。

## 9. 测试证据

`active-tab-content.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；教程缺陷契约 | 已证实 | :20-21 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | :7-32 | covered |
