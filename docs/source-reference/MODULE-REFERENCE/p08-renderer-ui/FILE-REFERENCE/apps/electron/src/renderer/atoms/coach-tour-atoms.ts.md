---
path: apps/electron/src/renderer/atoms/coach-tour-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6edb467b8ea3a22d75e408bbbc6ef830059f5e42
sha256: 39a62240ebeda7c99ba7a5af33af782be84597156cc3f7278b78b31f617d50ee
lines: 13
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/coach-tour-atoms.ts

## 1. 结论与边界

界面蒙层引导触发状态（头注释 :2-9）：顶栏「界面引导」置 true→CoachTourOverlay 渲染；完成/跳过（Esc）重置。**纯会话内状态不持久化**；「首次进入自动接力播放」需 settings 字段另行接入（:8-9 注释，未实现边界）。

## 2. 导出与关键符号

导出 1 条（`export` :13）：`coachTourOpenAtom = atom(false)`。

## 3-7. 不适用

纯原子（不适用逻辑分支）——依据：13 行全文。

## 8. 修改影响面

- 消费面：CoachTourOverlay。
- 依赖面：无（预留 settings 持久化）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；非持久化+预留边界 | 已证实 | :2-13 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2 | :13 | covered |
