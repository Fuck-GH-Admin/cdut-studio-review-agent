---
path: apps/electron/src/renderer/components/ai-elements/MindMapBlock.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5e092c05265d588020867b146bbed14a68eddb3
sha256: 70bad951153f6c8b6e950a34221360537df4324ae31d8620e362df2cb4d71faf
lines: 178
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/MindMapBlock.tsx

## 1. 结论与边界

对话流 `​```mindmap` 块**专用渲染器**（178 行，方案 §7.2 交互契约 `:2-13`）：气泡内交互画布（缩放/平移/工具条/复制源码/展开大图）；点击图面（非拖拽）展开全屏；全屏允许拖拽气泡但**禁点击触发 Prompt 复制**（不传 onNodeClick）；拖拽坐标内存 Map（代码块指纹键控），进程退出清空。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `MindMapBlock` | `:36-178` | 唯一 export：`({code}) => ReactElement\|null`：解析→场景→气泡预览→全屏；解析失败返回 null |

内部：`BUBBLE_VIEWPORT_HEIGHT=260:21`、`memoryPositions:24`（内存级拖拽留存）、`codeFingerprint:27-34`（FNV-1a 32 位→base36）。

## 3. 内部逻辑与关键流程

`parseMindMapText(code)`→`buildMindMapScene(root, overrides)`→`useMindMapViewport`；`zoomByFactor:54-66`（视口中心锚点，setZoom+setPan **两次更新**）；`handleCopy:69-77`（clipboard+2s 复位/失败 toast）；气泡内点击展开（pressRef 位移 >3px 判拖拽 `:86-92`）；预览容器 260 高（interactive=false）；全屏挂 `MindMapFullscreenModal`（onOverridesChange/onPersist/onResetOverrides/onClose，**不传 onNodeClick/onExportOpml** `:160-175`）。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/ai-elements/message.tsx` MarkdownPre mindmap 分支（`apps/electron/src/renderer/components/ai-elements/message.tsx:857-864`，解析失败静默回退前先验证）；出向 `./mindmap-canvas`（7 符号）、`@profer/shared`（parseMindMapText）。

## 5. 数据 I/O、读写与副作用

剪贴板；内存 Map（无持久化）。

## 6. 分支、失败、取消与恢复

解析失败→**整块静默不渲染**（`:100`，无错误提示——上层回退代码块）；复制失败 toast。

## 7. 权限与权威状态

**对话流禁 Prompt 复制契约**（`:8-9`/`:160-175`）：不传 onNodeClick；导出按钮随之隐藏；拖拽坐标仅内存（隐私/生命周期边界）。

## 8. 修改影响面

改交互影响对话流导图体验；`zoomByFactor` 双更新与 canvas 原子契约冲突（矛盾③）。

## 9. 测试证据

无直接测试（mindmap 零测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件交互/指纹/全屏接线 | 已证实 | 178 行全读（export 仅 1 处核实） |
| **③** zoomByFactor 拆 setZoom+setPan 违反 `apps/electron/src/renderer/components/ai-elements/mindmap-canvas.tsx:276` 原子契约（靠批处理快照不漂移，脆弱） | 已证实 | `:54-66` |
| **④** 气泡滚轮用 React onWheel（passive 委托 preventDefault 可能失效→连带滚页，modal 有原生双保险而此处无）；**⑤** 拖拽阈值 >3px vs modal >2px；**⑥** 指纹重复计算 | 已证实 | `:146`/`:88`/`:38-39` |
| **⑪** 双消费者契约（AiClassMindMapTab 提供 onNodeClick 等）；指纹 32 位理论碰撞 | 已证实 | `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassMindMapTab.tsx:207-209` |
| 解析失败静默回退链 | 已证实 | `:100` + `apps/electron/src/renderer/components/ai-elements/message.tsx:857-864` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/交互链 | §2/§3 | covered |
| 禁复制契约 | §7 | covered |
| 矛盾+澄清 | §10 | covered |
