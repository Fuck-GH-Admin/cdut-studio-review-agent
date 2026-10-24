---
path: apps/electron/src/renderer/components/shared/CdutLogo.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7f07d791d449f17f99c7c4fd99ba1c3e4bb04c91
sha256: 492842ae42296923d6b95042690d3d856b9cf9675bf2977824e219b10441316a
lines: 47
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/CdutLogo.tsx

## 1. 结论与边界

成都理工大学品牌标识统一入口（文件头 `:1-7`）：校徽锁版（PNG）与矢量标识（SVG）深色背景均需反白——`CdutLogo` 浅色深墨绿原版/深色白版（**同尺寸裁切、几何完全重合**）；`CdutMark` 浅色墨黑描边/深色白色描边。纯展示。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutLogo` | function 组件 | `:24-34` | 校徽+中英文校名（PNG 锁版）；alt 缺省“成都理工大学校徽” |
| `CdutMark` | function 组件 | `:37-47` | 侧边栏/速课堂矢量标识；alt 缺省“CDUT Studio” |

内部：`BrandLogoProps`（`:18-21`）；四资源 import（CDUT-CE.png/white、cdut-logo.svg/dark）。

## 3. 内部逻辑与关键流程

`useIsDarkTheme()` 切换 src；`<img draggable={false} className=object-contain>`。无分支逻辑（三元选图）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：全局品牌处（启动/侧边栏/速课堂）。出向：`@/hooks/use-is-dark-theme`、静态资源四枚。

## 5. 数据 I/O、读写与副作用

无（静态资源加载）。

## 6. 分支、失败、取消与恢复

明暗双图分支；无异步。

## 7. 权限与权威状态

品牌锁版口径（PNG 锁版不可改、几何重合）如实注释。

## 8. 修改影响面

改资源/切换 → 影响品牌显示一致性。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 明暗双版/锁版口径 | 已证实 | 文件头、`:24-47` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两组件 | 2/3 | `:24-47` | covered |
