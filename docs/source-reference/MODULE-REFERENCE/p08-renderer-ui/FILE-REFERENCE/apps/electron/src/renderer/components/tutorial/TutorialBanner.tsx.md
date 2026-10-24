---
path: apps/electron/src/renderer/components/tutorial/TutorialBanner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d063f06d75adb10a80b2725cc706182aefcbea0
sha256: f19db54d056c6ea67d5c9bc4d6d632f50124adc1620754b9eefb0fc44e848c09
lines: 105
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tutorial/TutorialBanner.tsx

## 1. 结论与边界

**教程推荐横幅**（105 行，`:1-8`）：右下角浮动卡片；`tutorialBannerDismissed` 字段控制，点任一按钮后**永不再显示**；提示下次访问位置=设置>教程（底注 `:100`）。

## 2. 导出与关键符号

1 导出：`TutorialBanner`（`:17`）。状态：`visible`（1500ms 延迟入场 `:28`）、`dismissed`（初始 true 防闪烁）。

## 3. 内部逻辑与关键流程

- 加载（`:22-32`）：`getSettings`→未 dismiss 才 `setTimeout(1500)` 显示。
- `handleDismiss`（`:34-37`）：`updateSettings({tutorialBannerDismissed:true})` 永久关闭。
- `handleLearnNow`（`:39-42`）：`openTutorialTab(store)`+dismiss；`handleLater`=dismiss。
- 渲染（`:51-104`）：Z_LAYER.dialog 固定定位+滑入过渡；X/立即学习/稍后再学。

## 4. 调用者与调用链

- 入向：应用外壳（main.tsx 级挂载，域外）。
- 出向：`@/lib/tab-activation`（openTutorialTab）、`window.electronAPI.getSettings/updateSettings`。

## 5. 数据 I/O、读写与副作用

读写 settings.tutorialBannerDismissed（一次性布尔）。

## 6. 分支、失败、取消与恢复

dismissed→null；加载失败 console.error（`:31`）；无回滚。

## 7. 权限与权威状态

无权限分支，依据：本地设置。

## 8. 修改影响面

教程入口引导（一次性展示）：上游=应用外壳常驻挂载（域外）+`openTutorialTab` 顶栏教程标签；修改本文件波及首次引导体验与 `tutorialBannerDismissed` 持久化语义；回归面=1500ms 延迟入场与三按钮（立即学习/稍后再学/X）全部走 dismiss 的一次性关闭路径（`:34-47`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 一次性语义/1500ms 延迟/三按钮 | 已证实 | `:1-105` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+3 处理函数 | §2/§3 | 17-104 | covered |
