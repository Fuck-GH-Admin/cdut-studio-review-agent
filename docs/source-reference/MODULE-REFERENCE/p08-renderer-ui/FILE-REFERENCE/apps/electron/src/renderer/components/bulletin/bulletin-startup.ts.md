---
path: apps/electron/src/renderer/components/bulletin/bulletin-startup.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71a1ad3c39ecc38ca9a5b0bbebae3dae4f40c7c2
sha256: 25bda7302a7765025d10ab084fda99ed69ab760480b5da6c39944a7e3977690f
lines: 53
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/bulletin/bulletin-startup.ts

## 1. 结论与边界

公告栏启动弹出的纯判定逻辑（渲染层，无副作用纯函数）：`pickLatestBulletin`（最新公告）、`sortBulletinsForDisplay`（展示排序）、`shouldAutoOpenBulletin`（自动弹出条件）。独立成纯函数以便单测，`useBulletinStartupTrigger` 消费判定结果（文件头 `apps/electron/src/renderer/components/bulletin/bulletin-startup.ts:1-6`）。

边界：不拉数据/不弹 UI（hook+BulletinDialog）；不存已读状态（atoms/settings）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 3 函数 = 4 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `pickLatestBulletin` | 函数（导出） | 13-16 | `(items: BulletinItem[]) => BulletinItem \| null` | date 倒序第一条 |
| `sortBulletinsForDisplay` | 函数（导出） | 19-26 | `(items) => BulletinItem[]` | 置顶优先+日期倒序 |
| `BulletinStartupGuard` | 接口（导出） | 28-41 | 6 个布尔守卫字段 | §3.3 |
| `shouldAutoOpenBulletin` | 函数（导出） | 44-53 | `(guard) => boolean` | 弹出判定 |

## 3. 内部逻辑与关键流程

1. `pickLatestBulletin`（`:13-16`）：空→null；`[...items].sort((a,b)=>b.date.localeCompare(a.date))[0]`——**pinned 不参与「最新」判定**（注释 `:11-12`）。
2. `sortBulletinsForDisplay`（`:19-26`）：pinned 优先（Boolean 比较），同组 date 倒序。
3. `shouldAutoOpenBulletin`（`:44-53`）：`hasBulletins && hasUnreadLatest && !sessionDismissed && !coachTourActive && !coachTourPending && !welcomeReplayActive`——任一引导态激活即推迟（注释 `:43`）。Guard 字段语义（`:28-41`）：`hasUnreadLatest`=最新 id ≠ lastReadBulletinId；`coachTourPending`=已排定 800ms 定时器竞态窗口（测试注释）。

## 4. 调用者与调用链

入向（全树检索，证实）：

- `pickLatestBulletin`/`shouldAutoOpenBulletin`：`hooks/useBulletinStartupTrigger.ts:24`（import）、`:56`/`:66`（调用）。
- `sortBulletinsForDisplay`：`components/bulletin/BulletinDialog.tsx:28`（import）、`:113`（调用）。唯一两消费文件。

出向：`@profer/shared` `BulletinItem` 类型（`:7`）。无其它依赖。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O、无状态、无副作用（依据：全文读）。幂等、可并行。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 空数组 null | items.length===0 | 14 |
| pinned 排序 | Boolean 不等 | 21-23 |
| 六守卫合取 | 任一 false | 44-53 |

无异常/取消/恢复概念，依据：纯函数。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；判定输入（已读/引导态）权威在调用方组装。

## 8. 修改影响面

- 消费方 2 个（useBulletinStartupTrigger、BulletinDialog）：改签名/语义影响启动弹出与列表排序。
- `BulletinStartupGuard` 字段与 hook 组装耦合（`:66` 处传入）。
- 需同步的测试：`bulletin-startup.test.ts`（11 用例，本批）。

## 9. 测试证据

直接测试：`apps/electron/src/renderer/components/bulletin/bulletin-startup.test.ts`（本批，11 用例，逐条见该手册）。真实断言：空数组 null（测试 `:35`）、乱序取最新（`:44`）、pinned 不影响最新（`:52`）、排序四元素全序（`:64-69`）、六守卫逐一 false + 全 true（`:75-99`）。

未覆盖：date 相同并列、非法 date、items 非数组防御。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 纯函数语义 | 已证实 | `:13-53` 逐行读 |
| pinned 不参与最新判定 | 已证实 | `:11-12` 注释 + 测试 `:47-53` |
| 六守卫合取 | 已证实 | `:44-53` + 测试 `:73-100` |
| 两消费文件 | 已证实 | `useBulletinStartupTrigger.ts:24,56,66`；`BulletinDialog.tsx:28,113` |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `pickLatestBulletin` | §3.1 | 13-16 | covered |
| `sortBulletinsForDisplay` | §3.2 | 19-26 | covered |
| `BulletinStartupGuard`/`shouldAutoOpenBulletin` | §3.3 | 28-53 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
