---
path: packages/shared/src/utils/mindmap-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5e83ff821497c89ad280bf0a634f76c37980c048
sha256: 673d619625f2a1c0f89f03c219727f76c2165d2e5ef7982e4c646a9d31362cee
lines: 439
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/mindmap-engine.ts

## 1. 结论与边界

思维导图引擎（`packages/shared/src/utils/mindmap-engine.ts:1-13`）：径向整齐树布局 + 贝塞尔连线 + OPML 2.0 导出 + ```mindmap 代码块解析。纯函数（无 Electron/DOM），主/渲染共用。**锁定契约**（`:9`）：连线路径数学公式锁定不可变更；气泡节点允许用户自由拖拽覆盖坐标。尺寸唯一真源 `estimateMindMapNodeSize`（布局/包围盒/连线锚点三处同口径，`:6,63-71`）。

边界：布局是「线性等距环+径向/切向双约束」（弃 tanh 双曲压缩——结构性重叠缺陷，`:82-92` 注释论证）；解析失败返回 null 由调用方回退代码块（`:375`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MindMapPoint` | interface | 18-25 | `{x;y;depth;angle}` | |
| `MindMapLayoutOptions` | interface | 28-37 | `{centerX?;centerY?;baseRadius?=120;diskRadius?=460;scale?(@deprecated)}` | |
| `estimateMindMapNodeSize` | function | 68-78 | `(label) => {width;height}` | 视觉宽度：CJK 1.0/ASCII 0.55×11.5px |
| `layoutMindMap` | function | 97-161 | `(root, options?) => Map<string, MindMapPoint>` | 径向整齐树 |
| `buildBezierPath` | function | 182-237 | `(from, to, center?) => string` | 三次贝塞尔 |
| `computeAnchorZoomPan` | function | 242-258 | `(prev, anchor, nextZoom) => {zoom;pan}` | 光标锚定缩放矩阵 |
| `flattenMindMap` | function | 261-269 | 前序遍历展开 | |
| `buildNodeStudyPrompt` | function | 272-289 | 深度伴学 Prompt（点击气泡写剪贴板） | |
| `mindMapToOpml` | function | 302-321 | OPML 2.0 导出（`dateCreated` 默认 now） | |
| `stripMermaidNodeLabel` | function | 328-346 | 剥 Mermaid 形状包装（`((x))`/`[x]`/`>x]`/id 前缀等） | |
| `parseMindMapText` | function | 382-439 | Mermaid 缩进语法 + JSON 容错双解析 | |

内部：`countLeaves`（`:40-46`）、`isWideChar`（`:49-51`）、气泡常量 5 个（`:54-58`）、`escapeXml`（`:292-298`）、`normalizeJsonNode`（`:349-367`，深度 ≤8、label≤60、notes≤200）。

## 3. 内部逻辑与关键流程

### 3.1 `layoutMindMap`（`:97-161`）

Pass1（`:107-131`）：按**子树叶子数占比**切分角度扇区（相邻子树不重叠），同时统计每层最大半宽/节点数。Pass2（`:133-147`）：逐层半径 = `max(prev+ringGap, 径向约束(prev+父半宽+本层半宽+ringGap×0.5), 切向约束(本层节点数×(半宽×2+24)/2π))`——严格单调递增。超出 diskRadius 整体等比压缩（`:150-151`）。

### 3.2 `buildBezierPath`（`:182-237`）

`handle=min(dist×0.38,140)`；带 center 时径向模式：根（r0<2）沿连线直射（规避 atan2(0,0) 退化）；分支节点=极径 0.6+连线方向 0.4 加权混合；**终点切线严禁反向拉向原点**（`:197-199` 注释：旧实现会凹陷「蠕动」）。无 center 走水平 S 曲线。零距退化直线（`:190-192`）。

### 3.3 解析（`:372-439`）

`parseMindMapText`：剥代码围栏→JSON 形态（`{title, root|label|text, children}` 容错，`normalizeJsonNode`）或 Mermaid 缩进（`mindmap` 关键字可选、Tab=4 空格、栈式缩进挂树）；失败 null。

## 4. 调用者与调用链

出向：`../types/study`（MindMapData/MindMapNode，`:15`）。入向（检索=符号名+模块名，全冻结树）：

- **main**：`apps/electron/src/main/ipc.ts:196,6555`（mindMapToOpml）。
- **renderer**：`ai-elements/mindmap-canvas.tsx:14-18,46-462`（6 符号）、`AiClassMindMapTab.tsx:14,46-135`（flatten/buildPrompt）、`ai-elements/message.tsx:43,861-872`、`MindMapBlock.tsx:18,37`、`diff/markdown-preview-extensions.tsx:23,659`（parseMindMapText）。
- 测试：`mindmap-engine.test.ts`（本批 15 it）+ 批外 `cognition-engine.test.ts`（25 test，160-285 多例）。
- `MindMapPoint`/`MindMapLayoutOptions`：零外部引用（仅 barrel/自用）。
- preload/core/cli 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

解析失败=null（调用方回退代码块）；`computeAnchorZoomPan` 非法输入原样返回（`:248-250`）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；锁定契约（`:9`）：连线公式不可变（拖拽仅覆盖气泡坐标）。

## 8. 修改影响面

- 尺寸口径 5 常量（`:54-58`）与 mindmap-canvas 气泡样式严格对齐（`:65` 注释）——样式改动须同步。
- 连线公式改动=违锁定契约。
- 测试：本批 15 it + 批外 25 test。

## 9. 测试证据

直接测试 `packages/shared/src/utils/mindmap-engine.test.ts`（本批，209 行/15 it，断言见该篇）；批外 `cognition-engine.test.ts`。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 锁定契约（连线公式） | 已证实 | `:9` |
| 双约束环距+弃 tanh 论证 | 已证实 | `:82-92,133-147` |
| 终点切线防回弯 | 已证实 | `:197-210` |
| 尺寸唯一真源三处共用 | 已证实 | `:63-71` |
| `MindMapPoint`/`MindMapLayoutOptions` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实渲染效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2 | 18-439 | covered |
| 布局双约束 | §3.1 | 97-161 | covered |
| 贝塞尔两模式 | §3.2 | 182-237 | covered |
| 双格式解析 | §3.3 | 372-439 | covered |
