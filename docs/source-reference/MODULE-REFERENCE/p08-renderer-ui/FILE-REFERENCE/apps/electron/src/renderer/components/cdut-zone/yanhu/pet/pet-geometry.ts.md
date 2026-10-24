---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/pet-geometry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b9098ec34b7dcc2dc96e8e7194910146edc0797
sha256: bb86c4011a87fe3fc1179eb2ebad4d591e94aae2b0ad92307583c09649f6b001
lines: 339
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/pet-geometry.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

桌宠浮动窗口几何算法（339 行，头注 :1-11，纯函数无 Electron/React 依赖便于物理边界单测）：**160px 立绘 + 420px 伴随卡片**，卡片底边与立绘底边对齐、气泡/历史向上生长、输入条恒定底部。

## 2. 导出与关键符号

常量：`PET_WIDTH/HEIGHT=160`（:14-15）、`PET_GAP=12`、`CARD_WIDTH=420`、`BUBBLE_HEIGHT=150`、`HISTORY_HEIGHT=520`、`INPUT_BAR_HEIGHT=60`、`CARD_INNER_GAP=8`、`PET_MARGIN=16`、`SHADOW_PADDING=16`（防透明子窗口硬裁切投影，:30）、`PET_UNION_WIDTH=592`（:33-36）、`LEGACY_DEFAULT_PET_POSITION={24,24}`（:38）。

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `computeCardHeight` | 44-47 | panel+gap+inputBar |
| `computePushBackCoordinates` | 68-131 | 边界碰撞智能推回 |
| `computePetCardLayout` | 154-206 | 伴随态包裹外框+本地坐标 |
| `computePetOnlyLayout` | 209-228 | 仅立绘包裹 |
| `computeInteractionUnionRect` | 241-272 | 交互命中并集（含 PET_GAP） |
| `isPointInsideRect` | 275-283 | 命中判定（滞后余量） |
| `clampPetPosition` | 286-298 | 仅立绘视口夹取 |
| `computeCenterPetPosition` | 311-329 | 视口物理正中央 |
| `isLegacyDefaultPosition` | 335-339 | 旧版死值/未初始化判定 |

## 3. 内部逻辑与关键流程

1. **推回**（:68-131）：Y 轴 `minYp=margin+max(0,unionH-petH)`（卡片高于立绘时抬升起点）+上限钳制；X 轴 right 越界→左推、仍越界→**强制翻转 left**（对称逻辑）；结果取整。
2. **包裹布局**（:154-206）：`cardTopY=yp+petH-cardHeight`（底对齐）；方向决定 cardX/winX/winWidth；SHADOW_PADDING 外扩。
3. **命中并集**（:241-272）：注释 :234-239——**PET_GAP 间隙纳入并集**（消除立绘↔卡片穿越间隙的穿透抖动根因）；阴影留白不参与命中（四周透明区可点穿网页）。
4. **居中**（:311-329）：卡片可见按 PET_UNION_WIDTH 联合外框居中（direction 决定立绘在联合框内位置，注释 :304-308）；仅立绘按 160px 居中；纵向恒 `(vh-160)/2`。
5. **旧值判定**（:335-339）：null/非有限/`(24,24)` 命中→首帧迁移到正中央（消除「贴 Logo/顶栏盲区」偏倚）。

## 4. 调用者与调用链

入向：`YanhuPetFloatingHost`（布局/穿透/居中全链）。出向：无。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；视口极小时 margin 保护退化。

## 7. 权限与权威状态

- 物理边界权威：推回/夹取/命中并集单一收口（头注 :8-10）；碰撞箱稳定是「穿透抖动」修复口径。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：桌宠浮动窗口几何/拖拽/穿透全链。
- 回归关注：底对齐、间隙纳入并集、阴影不参与命中、联合居中。
- 同测：`pet-geometry.test.ts`（29 用例 / 9 describe）。

## 9. 测试证据

直接测试 `pet-geometry.test.ts`（29 用例 / 9 describe；纯函数；NOT_RUN）：9 组 describe 覆盖卡片高度/推回 7 例/包裹布局 3 例/仅立绘 1 例/夹取 2 例/联合宽 1 例/居中 5 例/旧值判定 3 例/命中并集 5 例（详见该测试手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出/常量/行号 | 已证实 | 逐行核对 |
| 底对齐/推回/并集语义 | 已证实 | 测试族逐条 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `computePushBackCoordinates` | §3.1/§9 | 68-131 | covered |
| `computePetCardLayout`/`computePetOnlyLayout` | §3.2/§9 | 154-228 | covered |
| `computeInteractionUnionRect`/`isPointInsideRect` | §3.3/§9 | 241-283 | covered |
| `computeCenterPetPosition`/`clampPetPosition` | §3.4/§9 | 286-329 | covered |
| `isLegacyDefaultPosition`/`computeCardHeight` | §3.5/§9 | 44-47/335-339 | covered |
