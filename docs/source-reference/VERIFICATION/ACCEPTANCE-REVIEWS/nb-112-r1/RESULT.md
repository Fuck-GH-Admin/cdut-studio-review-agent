# nb-112-r1 返修复核报告（RESULT.md）

- **批次**：nb-112-r1（revisionOf nb-112；18 文件）｜ **结论：`accepted`（18/18）**
- **封版**：sealId `seal-03a993464a709291` @2026-10-23T20:24:42Z ｜ 复核：docs-r07-qa-extra-05-20261024

## 复验内容（对应 reviews/nb-112 F-1）

| finding | 修正 | 复验 |
| --- | --- | --- |
| F-1 getDraftSignature "18 字段"≠17 | §2/§8 两处→"17 字段" | ✓ 源码 :91-108 恰 17 键（id/name/prompt/scheduleType/intervalMinutes/timeOfDay/dayOfWeek/dayOfMonth/channelId/modelId/agentRuntime/workspaceId/permissionMode/presetId/sessionMode/notificationTargets/active）回源属实 |

## 字节核验

- 修订篇 before-hash=父版锚、after-hash=READY=stage 实测（双向一致）。
- 17 篇 accepted 与父版逐字节相同，沿用原 accepted（"旧接受不套新字节"合规）。
- G0：MANIFEST→READY→DONE→ZIP 链复算全对、sealId 复算一致、ZIP 21 条目合规。

## 边界

NOT_RUN：产品测试（11 用例）/typecheck/构建/GUI/真实 IPC/下载/导入。父版 G2 结论（1324 行 AutomationFormView 全链、5 无调用者模块、fixed 变体零渲染点、4 项事实记录等）在 17 篇未变字节+修订篇未变事实上继续有效。
