---
path: packages/shared/src/utils/cslab-marginalia.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 817bf8d0aea376c4cb48208dd6365b30c7814a0a
sha256: bfbf76d6c2949e312cb84f03416fc547fa1cf9c026b5dea259ae2ec22df48c45
lines: 74
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-marginalia.ts

## 1. 结论与边界

CSLab 旁注（Marginalia）**一维区间排程纯函数**（`packages/shared/src/utils/cslab-marginalia.ts:1-8`）：主/渲染共用、零 DOM。按锚点目标 Y 自上而下「重力松弛」消除同段落批注重叠；输出 `actualTop`/`connectorOffset` 供 React `transform: translateY()` GPU 合成位移——**严禁**改 top/margin 触发布局抖动（`:6-7`）。

边界：只算 Y（一维）；卡片宽度/X 不管；不动画（调用方职责）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabCommentAnchor` | interface | 10-16 | `{id; targetTop; cardHeight}` | targetTop=容器相对坐标 |
| `CsLabPositionedComment` | interface | 18-23 | extends Anchor + `{actualTop; connectorOffset}` | connectorOffset=targetTop-actualTop（SVG 引线补偿） |
| `calculateMarginaliaLayout` | function | 29-56 | `(comments, gapMargin=16) => CsLabPositionedComment[]` | |
| `buildConnectorPath` | function | 62-70 | `(fromX,fromY,toX,toY) => string` | 三次贝塞尔 SVG path |

内部：`round`（`:72-74`，两位小数）。

## 3. 内部逻辑与关键流程

- `calculateMarginaliaLayout`（`:29-56`）：gap 非有限回 16、负→0（`:33`）；过滤非有限 targetTop/cardHeight（`:35-38`）；按 targetTop 升序；逐条 `resolvedTop=max(targetTop, minimumAllowedTop)`（重力松弛，`:46`），`connectorOffset=targetTop-resolvedTop`（≤0）；推进 `minimumAllowedTop=resolvedTop+height+gap`（`:52`）。
- `buildConnectorPath`（`:62-70`）：控制点取水平中点（`M… C mid,fromY mid,toY to…`），平滑且不穿正文（`:59-60`）。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:160-164`）：

- **renderer**：`apps/electron/src/renderer/components/cdut-science/CsLabReviewMarginalia.tsx:13-14,78,168`（布局+引线）、`:15,46,48`（`CsLabPositionedComment` 类型）。
- 测试（main 侧 test-only）：`apps/electron/src/main/lib/cslab/cslab-molstar-math.test.ts:9-10,144,160,170`（13 test 中旁注排布/引线 3 用例）。
- `CsLabCommentAnchor`：零外部引用（仅自用+barrel）。
- 无同名碰撞。产品入口仅 renderer；main 仅测试。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径（非法输入静默过滤/回退默认）；无异步/取消。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

输出形状（actualTop/connectorOffset）是 React 位移动画与 SVG 引线的契约；gap 语义改动影响排版密度。

## 9. 测试证据

无直接测试文件（本批无；外部覆盖见 UNVERIFIED 补记）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 重力松弛+gap 语义 | 已证实 | `:44-53` |
| connectorOffset 补偿语义 | 已证实 | `:50` |
| 贝塞尔中点控制点 | 已证实 | `:68-69` |
| 生产 caller / 测试覆盖 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 interface + 2 函数 | §2-§3 | 10-70 | covered |
