---
path: apps/electron/src/renderer/components/bulletin/BulletinDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 309ec561f341395715da2975bf01ecd79a6fd876
sha256: 1a5c5ec640e7069980fa45cdd1590be66271a3db2919f047ca527d22e87c61ff
lines: 204
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/bulletin/BulletinDialog.tsx

## 1. 结论与边界

本地系统公告栏弹窗（渲染层运行时）：双栏模态——左栏公告导航（分类徽标/时间/标题/置顶/未读红点）、右栏 Markdown 详情；关闭时写 `lastReadBulletinId` 并标记本会话已读，下次无新公告静默（文件头 `apps/electron/src/renderer/components/bulletin/BulletinDialog.tsx:1-9`）。手动入口：设置→关于→查看系统公告。开关自管理 `bulletinDialogOpenAtom`（App 零 props 挂载）。

边界：启动弹出判定在 `bulletin-startup`+`useBulletinStartupTrigger`；公告数据经 `getBulletins` IPC（本地数据无网络，`:197` 文案）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（其余内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `BulletinDialog` | 函数/组件（导出） | 75-204 | `() => React.ReactElement` | 公告弹窗 |
| `CATEGORY_META` | 常量（内部） | 31-36 | 4 类目徽标文案/配色 | notice/feature/tip/maintenance |
| `BulletinListItem` | 组件（内部） | 39-73 | 左栏条目 | 徽标/置顶/未读点 |

## 3. 内部逻辑与关键流程

1. 打开兜底 effect（`:85-111`）：列表空→`getBulletins()` 拉取（失败 `console.error`，`:103`）；选中项缺失→`pickLatestBulletin` 回退（`:89-93`）；`cancelled` 防竞态。
2. 排序/选中 memo：`sortBulletinsForDisplay(items)`（`:113`）；selected 按 id（`:114-117`）。
3. `handleClose`（`:120-128`）：`pickLatestBulletin(items)` 有则 `setLastReadId(latest.id)` + `updateSettings({lastReadBulletinId})`（`.catch(console.error)` `:124`）；`setSessionDismissed(true)`；关弹窗。Esc/遮罩/「我知道了」统一走 `onOpenChange(false)→handleClose`（`:131,:199`）。
4. 渲染：sr-only 标题满足 Radix 无障碍（`:133-135`）；左栏 `unread = item.id !== lastReadId`（`:151`，**注意：未读判定为「不等于 lastReadId」而非「新于」**——旧公告也显示红点，照实记录）；右栏 `MessageResponse` 渲染 content（`:180`）；底栏「共 N 条公告 · 本地数据，无网络请求」（`:197`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`renderer/App.tsx:24`（`React.lazy` 动态 import）、`:131`（`<BulletinDialog/>`）。唯一调用方。

出向：`./bulletin-startup`（`pickLatestBulletin`/`sortBulletinsForDisplay`，`:28`）、`@/atoms/bulletin-atoms`（5 个 atom，`:21-27`）、`@/components/ai-elements/message`（`MessageResponse`，`:19`）、`window.electronAPI.getBulletins`/`updateSettings`（`:96,124`）。

## 5. 数据 I/O、读写与副作用

- IPC 读公告/写设置（`lastReadBulletinId`）；内存 atom 5 个；DOM 无直接写。
- 副作用：`console.error`；Markdown 渲染（MessageResponse）。
- 并发：`cancelled` 标志（`:87,99`）；无锁。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 拉取失败 | getBulletins reject | 103 |
| 选中回退最新 | selectedId 失效 | 89-93 |
| 空列表 | items 空 | 95-106, 186-189 |
| 关闭写已读 | pickLatest 有值 | 121-125 |
| 关闭跳过写 | pickLatest null | 121-122 |

无恢复概念，依据：一次性弹窗。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；已读权威=`lastReadBulletinId` 设置项+会话级 `bulletinSessionDismissedAtom`。

## 8. 修改影响面

- App.tsx 挂载（lazy）；与 `useBulletinStartupTrigger`（启动弹出）共享 atom/判定（bulletin-startup）。
- `lastReadBulletinId` 设置键与主进程 settings 契约（updateSettings）。
- 需同步的测试：无直接测试（bulletin-startup.test 覆盖判定函数，非本组件）。

## 9. 测试证据

直接测试：**无**（本组件无专属测试）。间接证据：`bulletin-startup.test.ts`（本批）覆盖 `pickLatestBulletin`/`sortBulletinsForDisplay`（本组件 `:28` 的两个依赖），不覆盖本组件渲染/关闭写入逻辑。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实 IPC。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 关闭写已读流程 | 已证实 | `:75-204` 逐行读 |
| 未读判定=不等于 lastReadId | 已证实 | `:151` |
| 唯一调用方 lazy 挂载 | 已证实 | `App.tsx:24,131` |
| 公告数据源实现 | 未知 | 主进程 getBulletins（非本批） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `BulletinDialog` | §2-3 | 75-204 | covered |
| `CATEGORY_META`/`BulletinListItem` | §2, §3.4 | 31-73 | covered |
| 关闭写已读/兜底拉取 | §3.1-3.3 | 85-128 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
