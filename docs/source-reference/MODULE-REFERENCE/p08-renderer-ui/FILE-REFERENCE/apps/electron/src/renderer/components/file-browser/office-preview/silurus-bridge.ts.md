---
path: apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cc8fa72a48e223127fc22c8dbd6b83ab7888379a
sha256: 2be87b2b0bf4f7c44878f1cabefdfb51e359f5ab740925d36c5b6c829ad7e984
lines: 853
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.ts

## 1. 结论与边界

Silurus OOXML WASM viewer（docx/xlsx/pptx）桥接层：动态加载 vendor 模块/wasm、创建/销毁 viewer、几何测量与聚光（spotlight）辅助。**vendor 路径必须相对页面解析**（文件头 `:1-5`：Vite dev `localhost:5174` vs 打包 `file:///`，按 TS 模块路径解析会误命中 `/src/.../vendor` 触发旧 HTML fallback；延迟读 `location` 使纯函数可在 Node 测试加载）。

不做的事：不做 Office 解析（WASM 负责）；`_slots` 私有访问严格封装于本层（`:159-162`）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `OfficeFormat` | `:12` | docx/xlsx/pptx |
| `normalizeOfficeFormat` | `:73-79` | 扩展名族→格式（docm/dotx/dotm→docx 等 12 扩展三族） |
| `clampOfficeScale` | `:81-84` | 缩放钳 [0.25,4]、非有限→1 |
| `createOfficeViewer` | `:114-` | 动态 import 模块+构造 viewer（错误包装“加载 Silurus … 失败”） |
| `destroyOfficeViewer` | `:145-` | 安全销毁（null 容忍） |
| `getRenderedPptxSlideCanvas` | `:164-` | 取已像素渲染的目标页 canvas——**校验 renderedSlide/renderedScale 防虚拟列表复用旧帧**（`:159-162`） |
| `OfficeSpotlightTarget` | `:171` | 聚光目标 |
| `readXlsxGeometry` | `:450-` | XLSX 单元格区域几何（兼容 `{x,y,w,h}` 与 `{x,y,width,height}`） |
| `matchTextLayerGeometry` | `:492-` | textLayer span 行框**精确匹配**（消除行高累积误差；`exactFromTextLayer` 优先于估算 bbox，`:582`） |
| `applyOfficeCitationSpotlight` | `:605-` | 引用聚光引擎（async） |
| `OfficeViewerHandle` | 类型 | viewer 句柄（official-preview-session 据此取 canvas/scrollToSlide） |

内部：`vendorBase`（`:7-10`）、`loadManifest`/`loadModule`（单飞缓存，失败删缓存可重试）、`getViewerConstructor`（缺 viewer 抛）、`ensureSpotlightStyle`（`:181`，注入样式单例）、`parseA1CellAddress`（`:248`）、`nextFrame/delay/pollFrames`（多帧递增轮询）、`ensurePositioned`、`measureSlotPageBox`（`:313`，**信任 wrapper 尺寸而非未渲染 canvas 的默认 300×150**，`:305-311`）、`measureOffsetWithin`（offsetParent 链累积、越界回退零偏移）、`waitForMountedPage`（`:392`，虚拟列表 slot 就绪+`renderedScale>0`）、`extractSpotlightKeywords`（`:476`，从 label 提取 textLayer 检索词）。

## 3. 内部逻辑与关键流程

1. **加载**：manifest（wasm-manifest.mjs，失败空对象）+按格式动态 import `{format}.mjs`（单飞、失败清缓存）。
2. **viewer 生命周期**：`createOfficeViewer`（构造+选项：wasmUrl/文本选择/缩放范围/回调族）/`destroyOfficeViewer`。
3. **几何与聚光**：slot 页框测量（wrapper 优先）、相对偏移累积、A1 地址解析、XLSX 几何读取、聚光样式/关键词匹配（Spotlight 尾段）。

### 3.4 `applyOfficeCitationSpotlight`（`:605-`，聚光引擎要点）

- **自愈重锚**：ResizeObserver（`:812`）+MutationObserver（`:821`）驱动 reposition，**排除自身注入节点防回环**；
- **DOCX 分页自适应**：估算页与 WASM 实际分页差 1 页时跨页校准（`:730-734` 多候选 slot 匹配）；
- **XLSX wheel/scroll 同步刷新**；
- **6.5s fade**（fadeTimer，`:627-628`）后结束；视口中央滚动定位；
- 匹配优先 `matchTextLayerGeometry` 精确行框（`:582/:730`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`office-preview/`（OfvPreview/official-preview-session）与 file-browser 预览链；直接测试 `silurus-bridge.test.ts`（详见其手册）。出向：`@profer/shared`（limits/类型）、vendor OOXML 模块（运行时动态 import）。

## 5. 数据 I/O、读写与副作用

动态 import 网络/文件加载（vendor）；DOM 测量/样式注入；viewer 创建销毁。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 模块加载失败 | `:95-104` | 包装错误抛（清缓存可重试） |
| viewer 缺失 | `:108-111` | 抛 |
| 未渲染 canvas | `:159-164` | 返回 null/校验旧帧 |
| 测量越界 | `:365-386` | 回退零偏移 |

## 7. 权限与权威状态

诚实边界：`_slots` 私有 API 只在本层封装并校验旧帧；canvas 默认 300×150 陷阱显式规避；vendor 路径解析口径注明。

## 8. 修改影响面

改桥接 → 影响全部 Office 预览/AI 观察；Silurus 版本（0.71 无 capture/wait API，`:161`）升级需回核。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `silurus-bridge.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| vendor 路径口径 | 已证实 | 文件头 |
| 旧帧校验/300×150 陷阱 | 已证实 | `:159-162/:305-311` |
| 单飞加载/失败重试 | 已证实 | `:86-106` |
| 运行行为 | 未知 | NOT_RUN（WASM） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 加载/生命周期 | 2/3.1-3.2 | `:7-158` | covered |
| canvas 读取 | 2 | `:159-168` | covered |
| 几何/聚光族 | 3.3 | `:171-853` | covered |
