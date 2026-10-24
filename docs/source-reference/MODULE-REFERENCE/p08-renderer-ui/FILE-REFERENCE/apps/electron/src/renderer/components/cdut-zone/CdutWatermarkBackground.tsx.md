---
path: apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3aeb4a13ef867be11aa2e3ddf59c4b240ae3dc69
sha256: 5294dbd0fdc69cf71e49996705538b2d2863a53d5e19257b7ff6a44cd254c554
lines: 38
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx

## 1. 结论与边界

CDUT 专区左下角校宠立绘艺术环境水印（文件头 `apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx:1-10`）：非阻断式（`pointer-events-none`）融入底纹；浅色白底 JPEG+multiply 滤白+径向渐变羽化；**深色改原生 RGBA 真透明立绘（与桌宠「砚小龙」同源）**——不用 invert/hue-rotate/screen 等破坏明度的反相滤镜；两模式各只渲染一张，绝不遮挡交互与文字。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutWatermarkBackground` | 组件（导出） | 16-38 | 双 `<img>`（浅色 `:23-28` multiply+羽化；深色 `:30-35` 真透明+羽化），`aria-hidden`+`draggable={false}` |

## 3. 内部逻辑与关键流程

纯静态渲染；深浅模式用 `dark:hidden`/`dark:block` 切换；遮罩 `mask-image:radial-gradient(circle_at_bottom_left,…)` 羽化。

## 4. 调用者与调用链

入向：CDUT 专区内容区底纹；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@assets/IP/IP_1.jpg`、`@assets/IP/Cute_IP/Breathing.png`。

## 5. 数据 I/O、读写与副作用

静态图片资源；无 IO/状态。

## 6. 分支、失败、取消与恢复

无分支（双模式 CSS 切换）。

## 7. 权限与权威状态

非阻断契约=`pointer-events-none`+`aria-hidden`（`:19-20`）。

## 8. 修改影响面

改样式影响专区观感；换资源影响深浅色一致性。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 非阻断/不遮挡 | 已证实 | `:9,19-20` |
| 深色真透明不用反相 | 已证实 | `:6-7,29-35` |
| 实际渲染 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 16-38 | covered |
