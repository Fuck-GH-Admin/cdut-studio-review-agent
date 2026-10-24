---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/pet-geometry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1276c03a0562980221360c46f548e47f7404fc91
sha256: 7e4be646832ebacd481e59927255556a579308e7d8b2b0bec23f8242d5377920
lines: 270
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/pet-geometry.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

桌宠几何物理边界（头注 :1-7）：紧凑包裹矩形、右缘推移、极窄视口翻转、Y 轴上下推回、仅立绘剪裁夹取、交互命中并集（碰撞箱稳定性）。

## 2. 用例清单

29 用例 / 9 describe。纯函数。

| describe（行） | # | 用例与核心断言（代表性） |
| --- | --- | --- |
| computeCardHeight（:31-36） | 1 | 气泡/历史高度=panel+gap+inputBar（:33-35） |
| computePushBackCoordinates（:38-99） | 7 | 右缘推移 `nextXp=1000-16-420-12-160=392`（:40-48）；极窄翻转 left（:50-55）；Y 底越界 `400-16-160`（:57-61）；无推回原样（:63-68）；卡片高立绘抬升 `16+(cardH-160)`（:70-75）；左越界右推（:77-82）；历史态更高推回（:84-99） |
| computePetCardLayout（:101-135） | 3 | 朝右底对齐（winWidth=160+12+420+32、petLocalY=BUBBLE_CARD-160+16）（:103-114）；朝左（:116-122）；历史态向上生长**底边不变**（:124-135） |
| computePetOnlyLayout（:137-153） | 1 | 仅包裹立绘+阴影留白全字段断言（:139-152） |
| clampPetPosition（:155-163） | 2 | 越界夹回（`{xp:24,yp:16}`）；正常不动（:157-162） |
| PET_UNION_WIDTH（:165-171） | 1 | =592=160+12+420（:167-170） |
| computeCenterPetPosition（:173-214） | 5 | 1200×800 联合居中 y=320；多分辨率线性平移；`x+592/2===vw/2`；收起按 160 居中（x=520）；朝左立绘取联合右缘；极窄退化 margin 保护 |
| isLegacyDefaultPosition（:216-232） | 3 | (24,24) 命中；历史坐标不误判；null/undefined/NaN 视为未初始化 |
| computeInteractionUnionRect / isPointInsideRect（:234-269） | 5 | 并集宽=592 且**不含阴影留白**（height<BUBBLE_CARD+32）；朝左并集左缘=卡片左缘；**间隙点判定命中**（穿透抖动修复口径）；滞后余量 10px 边界；卡片收起仅立绘 |

## 3. 真实断言

如 §2 表（逐条读自 :33-269）。

## 4. 未覆盖与脆弱点

- 未覆盖：`computeCardHeight` 缺省、超大 margin 组合。
- 脆弱点：无（纯确定性断言）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 29 用例断言如 §2 | 已证实 | 本文件逐行 |
| 碰撞箱/底对齐/推回被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 9 个导出函数 | §2 | covered |
| 边缘组合（超大 margin） | §4 | unknown（未测） |
