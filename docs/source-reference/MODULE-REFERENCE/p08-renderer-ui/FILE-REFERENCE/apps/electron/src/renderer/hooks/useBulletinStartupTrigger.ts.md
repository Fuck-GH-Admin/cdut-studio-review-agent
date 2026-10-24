---
path: apps/electron/src/renderer/hooks/useBulletinStartupTrigger.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d10857a4c238910ffc66b0fc1776ee56e93d4f0
sha256: d7a2f5d637bddf79d5fb004b3e43dd4df7066f8926ac90c7ba42e945c75df570
lines: 88
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useBulletinStartupTrigger.ts

## 1. 结论与边界

**公告栏启动自动弹出触发器**（88 行，头注释 `:1-11` 生命周期规则）：仅主界面分支挂载；就绪后 **600ms** 检测（存在公告且最新≠lastReadBulletinId 弹一次）；**CoachTour 竞态保护**（App 800ms 才置 coachTourOpen，此处凭 `coachTourVersion<CURRENT` 识别"已排定"并推迟，引导后接力）；关闭后本次会话绝不重弹。

## 2. 导出与关键符号

1 导出：`useBulletinStartupTrigger(): void`（`:29`）。常量 `BULLETIN_STARTUP_DELAY_MS=600`（`:27`）。

## 3. 内部逻辑与关键流程

effect（`:35-87`）：引导态/会话已关→不调度（`:37`）→setTimeout 600ms 内**双重检查** atom 当前值防回调期翻转（`:43-47`）→`Promise.all([getBulletins, getSettings])`→写缓存供弹窗复用（`:57-59`）→`coachTourPending` 判定（`:64`）→`shouldAutoOpenBulletin({hasBulletins, hasUnreadLatest, sessionDismissed, coachTourActive, coachTourPending, welcomeReplayActive})`（`:66-73`）→置 selectedBulletinId+dialogOpen。cleanup cancelled+clearTimeout。

## 4. 调用者与调用链

- 入向：主界面分支（注释 `:4`，域外）。
- 出向：bulletin/coach-tour/intro atoms、`@/components/bulletin/bulletin-startup`（pickLatestBulletin/shouldAutoOpenBulletin）、`@/lib/...coach-tour-steps`（CURRENT_COACH_TOUR_VERSION）。

## 5. 数据 I/O、读写与副作用

IPC 拉公告/设置；写 bulletin atoms（列表缓存/lastRead/弹窗）。

## 6. 分支、失败、取消与恢复

引导态短路/双重检查/失败 console.error（`:78-79`）；cleanup 防泄漏。

## 7. 权限与权威状态

弹出决策权威=`shouldAutoOpenBulletin` 纯函数（6 条件）；CoachTour 优先级=版本字段识别（`:62-64` 竞态关键注释）。

## 8. 修改影响面

公告首弹时序（与 CoachTour/欢迎导览互斥）；竞态窗口正确性依赖 600ms+双重检查+版本识别三层防护。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三层竞态防护/接力弹出/会话内不重弹 | 已证实 | `:1-88` 全文 |
| 实际弹出时序效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+触发 effect | §2/§3 | 27-87 | covered |
