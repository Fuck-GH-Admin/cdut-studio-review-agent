---
path: apps/electron/src/renderer/components/cdut-zone/AiClassSessionPickerModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a6eef0e0b7d2ecd8af92101314cc170acd6d502
sha256: b712a98c6fe4604a74b58c687c84bbcbea63ad3e21fb948ee4a2ec7e379c5f61
lines: 234
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassSessionPickerModal.tsx

## 1. 结论与边界

AI 速课堂**会话选择前置弹窗**（234 行）：拦截式时序——点 Bento 卡片先弹本窗，「＋ 开始新课堂」+历史课堂列表（课程名/最近学习/资料数/删除），选定或新建后才进主页面（`:4-6`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassSessionPickerModal` | `:48` | 唯一 export：`({open, onOpenChange, onSelect(sessionId, courseName)})` |

内部：props `:31-36`；`formatLastActive:39-46`（刚刚/N 分钟前/N 小时前/日期）；state（sessions/loading/creating/newCourseName/error `:53-57`）；`refresh:62-74`（listSessions，失败 error 条）、`handleCreate:84-98`（creating 防重入→createSession→onSelect+关窗）、`handleDelete:100-107`（失败静默 warn+本地 filter）。

## 3. 内部逻辑与关键流程

`useGlobalOverlay(open)`（`:60`）→open 时清态+refresh→Dialog（新课堂卡片：Input Enter 触发+开启按钮；历史列表：error/loading/empty/列表四分支短路 `:168-224`）→行点击 onSelect+关窗。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx` 两挂载点（`apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:337` 顶栏切换课堂/`apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:609` Bento 唤起，互斥分支共享 handler——子agent 对拍）；出向 `@profer/ui`（Dialog/Input/Button）、`@/atoms/overlay-atoms`、`window.electronAPI.cdutAiClass`（listSessions/createSession/deleteSession）。

## 5. 数据 I/O、读写与副作用

IPC 三操作+overlay atom 登记。

## 6. 分支、失败、取消与恢复

list 失败→error 条（无重试钮须重开）；create 失败→error 槽（位于列表区非新建卡旁，矛盾④）；delete 失败→静默。

## 7. 权限与权威状态

课堂=独立学习空间（资料与对话隔离，`:122` 文案）；删除/新建权威在主进程。

## 8. 修改影响面

改弹窗影响课堂入口时序；`onSelect` 契约联动 CdutZoneView。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件状态机/IPC/四分支 | 已证实 | 234 行全读（字节核对） |
| **①** handleCreate 不校验空名（无 trim/required）；**②** 删除无确认+失败静默；**③** creating 期间可关窗，进行中 create 成功仍调 onSelect（竞态照实） | 已证实 | `:89`/`:100-107`/`:90-91` |
| **⑤** formatLastActive 未来时间戳返回'刚刚' | 已证实 | `:39-46` |
| createSession 空名策略/delete 级联 | 未知 | 主进程不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/状态机/IPC | §2/§3 | covered |
| 3 矛盾+边界 | §10 | covered |
