---
path: apps/electron/src/renderer/components/cdut-zone/CdutPrivatePhoto.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 44eceb4acdc0ae1dafa86b3bf3f6cec5d7d84e1e
sha256: ad4238ffaa964046fcd848186fd4ddbf6db1bca5d353093bd498731354e3e80e
lines: 47
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutPrivatePhoto.tsx

## 1. 结论与边界

特区账户真实照片**隐私蒙版**（47 行）：默认模糊蒙版护隐私；单击去蒙版看原图，再击恢复（`:3-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutPrivatePhoto` | `:15-47` | `({src, alt})`：`masked`（默认 true）/`loaded` 双 state；`<button aria-label>`（`:23` 动态文案"点击查看原图/点击遮挡照片"）；加载占位 pulse（`:26-31`）；`<img draggable={false}>`（onLoad 置 loaded）；`loaded && masked` 时 `backdrop-blur-[3px]` 蒙版（`:39-44`） |

## 3. 内部逻辑与关键流程

单组件双 state 状态机：加载（占位）→就绪（蒙版/原图切换）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/cdut-zone/CdutProfileFields.tsx`（头像位 `apps/electron/src/renderer/components/cdut-zone/CdutProfileFields.tsx:90`）；纯组件无出向依赖（仅 React）。

## 5. 数据 I/O、读写与副作用

图片加载（src 外部资源）；无其他 IO。

## 6. 分支、失败、取消与恢复

加载失败→占位持续（无 onError 处理——照实记录）。

## 7. 权限与权威状态

**隐私默认遮挡**（默认 masked=true）；aria-label 动态可访问文案。

## 8. 修改影响面

改蒙版交互影响隐私体验；ProfileFields 头像展示。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件状态机/隐私默认 | 已证实 | 47 行全读 |
| **边界**：img 无 onError 兜底（加载失败占位不退） | 已证实 | `:32-38` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
