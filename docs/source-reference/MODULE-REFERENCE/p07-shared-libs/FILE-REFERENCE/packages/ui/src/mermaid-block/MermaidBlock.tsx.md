---
path: packages/ui/src/mermaid-block/MermaidBlock.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2d3735bc0687475f99dd9f64b1385d20e3fb939
sha256: 9dff4b149f9f1bbfe2c069bc4f14d239a4de2f5a75bb0e60946e9357316d1473
lines: 843
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/mermaid-block/MermaidBlock.tsx

## 1. 结论与边界

**Mermaid 图表渲染组件**（`packages/ui/src/mermaid-block/MermaidBlock.tsx:1-26` 注释）：beautiful-mermaid 优先、官方 mermaid 兜底；流式时源码自然增长零跳动、稳定 350ms 后台渲染、成功换 SVG/失败保源码（`:7-11`）；`generation` 计数器防竞态（`:13`）。内建缩放交互：头部按钮 + 溢出后滚轮缩放（光标锚点）+ 拖拽平移 + 全屏弹窗（`:15-25` 缩放模型注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MermaidBlock` | function（export） | `:486-843` | `({code}: {code: string}) => JSX` | 唯一导出 |
| `MermaidBlockProps` | interface（内部） | `:32-35` | `{ code: string }` | — |
| `MermaidZoomModal` | component（内部） | `:292-482` | `({open, onOpenChange, svg, code})` | 全屏查看弹窗（注释 `:285-287`：公共原语底层，全软件会话视图全局生效） |
| `isDarkMode`/`getThemeOptions`/`isUsableSvg` | function（内部） | `:46-65` | 明暗探测/主题选择/SVG 有效性 | — |
| `ensureOfficialExtensions` | function（内部） | `:76-96` | 注册 ELK+ZenUML，失败重置缓存 | `:88-92` 注释：不能永久 rejected |
| `estimateNodeCount` | function（内部） | `:105-118` | 粗估节点数 | 边两端+显式定义去重 |
| `smoothPolylineEdges`/`fmt` | function（内部） | `:127-166` | polyline→圆角 path | 二次贝塞尔拐角（draw.io 风格） |
| `renderWithOfficialMermaid`/`renderMermaidSvg` | function（内部） | `:168-208` | 官方渲染/双路渲染 | 见 §3.1 |
| `clamp` | function（内部） | `:210-212` | 数值钳制 | — |
| 常量 | const（内部） | `:38-43`、`:99`、`:270-273`、`:216-265` | DEBOUNCE_MS 350/ZOOM_MAX 3/ZOOM_STEP 0.15/PANEL_PADDING 16/SMALL_GRAPH_NODES 10/MODAL_* /图标 path | `mermaidRenderId` 计数 `:44` |

## 3. 内部逻辑与关键流程

### 3.1 渲染管线（`renderMermaidSvg` `:198-208`）

1. 动态 `import('beautiful-mermaid')`（`:200`）→ `renderMermaidSVGAsync(code, getThemeOptions(THEMES))`（`:201`；主题按明暗选 tokyo-night/catppuccin-latte `:50-56`）→ 有效则 `smoothPolylineEdges` 后返回（`:202`）。
2. 失败/不支持 → `renderWithOfficialMermaid`（`:207`）：`ensureOfficialExtensions`（ELK 布局 + ZenUML，`:76-96`，失败置空缓存允许重试）→ `mermaid.initialize({securityLevel:'strict', suppressErrorRendering:true, …})`（`:172-190`，小图 dagre/大图 ELK `:179`，`estimateNodeCount ≤ 10`）→ `mermaid.render(id, code)`（`:192-193`）→ `isUsableSvg` 校验（含 NaN/Infinity/错误标记检测 `:58-65`），无效即抛。
3. `smoothPolylineEdges`（`:127-162`）：`<polyline points>` 正则替换为 `<path d>`，拐角用 `Q` 二次贝塞尔（半径 10 自适应收缩 `:138-156`），<3 点原样返回（`:133`）。

### 3.2 主组件 `MermaidBlock`（`:486-843`）

- **防抖渲染 effect**（`:527-541`）：code 变化 → `generationRef++` 作废旧异步（`:529`）、清上一 timer、清 `renderedSvg`（显示源码 `:533`）、350ms 后 `renderCurrentCode(gen)`（`:534-536`）；结果仅当 generation 仍当前才生效（`:519-522`），异常置 null 回源码。
- **主题变化**（`:544-551`）：MutationObserver 监听 `documentElement.class` → 重渲染。
- **尺寸/初始缩放**（`:623-659`）：SVG 自然尺寸取 `width/height` 属性（缺失回退 offsetWidth `:634-638`）；首帧 `scale = min(fit, ZOOM_MAX)`、滚动归零（`:645-649`）；resize 只更新框尺寸**不重置用户缩放**（`:652-656`）。注释 `:620-622` 警告：不监听内容布局尺寸（滚动条引发无限重渲染）。
- **缩放模型**（`:553-563`）：不溢出维度居中、溢出维度顶格（tx/ty `:556-557`）；`minZoom = min(适配缩放, ZOOM_MAX)`（`:560-563`）。
- **applyZoom 锚定**（`:571-607`）：锚点（默认视口中心/滚轮传光标）→ 内容点反算（`:592-593`）→ 新平移量+待应用滚动（`pendingScrollRef` `:602-605`）→ `useLayoutEffect` 在 transform 提交后 clamp 应用（`:610-617`）。
- **滚轮缩放**（`:708-725`）：仅溢出时接管（未溢出不拦截，`:713-715` 注释防"卡住"页面滚动）；`exp(-delta*0.0015)` 倍率（`:717`）+ 光标锚定（`:721`）。
- **拖拽平移**（`:675-705`）：左右键（`:676`）、仅溢出启用（`:680`）、3px 死区分点击（`:692`）、拖动后抑制 click（`suppressClickRef` `:695`，`:743-749` 消费）；`scrollLeft/Top` 反向跟随（`:698-699`）。
- **按钮**：zoomIn/Out（±0.15 钳制 `:661-666`）、重置回适配（`:667-672`）、全屏（`:738-740`）、复制源码（`:727-735`，失败 console.error）。
- **渲染树**（`:753-842`）：根 div 阻断 mousedown/dblclick 冒泡（注释 `:754-756`：防宿主 ProseMirror 把双击当"请求编辑"）→ 头部栏（渲染后才显缩放/全屏按钮 `:766-790`）→ 未渲染 `<pre>{code}</pre>` / 已渲染滚动画布（`dangerouslySetInnerHTML` SVG `:825`，transform origin top-left `:823`）→ 悬浮"点击放大"胶囊（`:832-836`）→ `MermaidZoomModal`（`:840`）。

### 3.3 全屏弹窗 `MermaidZoomModal`（`:292-482`）

- 打开下一帧 `fitToViewport`（小图封顶 100% `:331`，`:336-343`）；滚轮无级缩放 0.2~4（光标锚点，`:346-362`）；`zoomByFactor` 视口中心（`:365-374`）；指针拖拽平移（`:376-394`，`preventDefault` 防选中文本 `:379`）；复制源码（`:396-404`）；工具栏（缩小/放大/重置/复制/关闭 `:425-453`）；`dangerouslySetInnerHTML` SVG（`:476`）。

## 4. 调用者与调用链

- 入向：`packages/ui/src/mermaid-block/index.ts:7`、`packages/ui/src/index.ts:9` 再导出；包外 3 文件：`ai-elements/MindMapBlock.tsx`、`ai-elements/message.tsx`（pre/code 分流后渲染）、`diff/markdown-preview-extensions.tsx`。
- 出向：`beautiful-mermaid`（动态 `:200`）、`mermaid`/`@mermaid-js/layout-elk`/`@mermaid-js/mermaid-zenuml`（动态 `:79-84`、`:170`）、`../primitives/dialog`（`:30`）、`navigator.clipboard`。

## 5. 数据 I/O、读写与副作用

- 输入 `code`（字符串）；无持久化。
- 副作用：动态 import（网络/打包加载）、`mermaid.render`（内部 DOM 临时节点，`suppressErrorRendering` 防残留 `:175-177`）、MutationObserver（`:545-549`）、wheel/resize 监听（`:723/:657`）、剪贴板写、`console.error`（`:91/:402/:733`）、`dangerouslySetInnerHTML`（SVG 注入 `:476/:825`——安全边界=渲染器输出，`securityLevel:'strict'` `:174`）。
- 并发：`generationRef` 单调递增防旧结果覆盖（`:499-500/:519`）；模块级 `mermaidRenderId`/`officialExtensionsReady` 共享（`:44/:68`）。

## 6. 分支、失败、取消与恢复

- beautiful 失败 → 官方兜底（`:203-207`）；官方扩展注册失败 → 缓存重置允许下次重试（`:87-93`）；`isUsableSvg` 拒绝 NaN/错误 SVG（`:58-65`）→ 渲染抛错 → `renderedSvg=null` 回源码展示（`:521-522`，文件头 `:11`"失败保持源码"）。
- 防抖窗口内 code 再变 → 旧 generation 作废（`:529`）。
- 取消：卸载清 timer（`:538-540`）、observer disconnect（`:550`）、监听移除（`:724`）；无 AbortController（动态 import 不可取消）。
- 事件隔离：mousedown/dblclick stopPropagation（`:759-760`）、按钮 onMouseDown preventDefault（`:768/:771/:774/:783/:791`）、右键菜单 preventDefault（`:815`）。

## 7. 权限与权威状态

无权限分支（纯展示）；`dangerouslySetInnerHTML` 的安全边界=mermaid/beautiful-mermaid 输出 + `securityLevel:'strict'`（`:174`）与 `isUsableSvg` 过滤（`:58-65`）。主题跟随 `documentElement.classList.contains('dark')`（`:46-48`）。

## 8. 修改影响面

改渲染管线/防抖 → 3 个消费者的图表渲染；改缩放模型 → 全软件会话视图交互（弹窗注释 `:285-287` 明示全局生效）；动态依赖版本（beautiful-mermaid/mermaid/ELK/ZenUML）→ 渲染兼容；`isUsableSvg` 放宽 → 错误 SVG 注入风险。无直接测试（§9）。

## 9. 测试证据

无直接测试（负向：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `MermaidBlock|renderMermaidSvg|smoothPolylineEdges` → 0 专属命中）。间接：`mermaid-detection.test.ts` 测的是识别层（进不进本组件），不测渲染。未覆盖：双路渲染/兜底、generation 竞态、缩放锚定、弹窗交互、isUsableSvg 各分支。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 10 内部符号；渲染/缩放/弹窗全逻辑 | 已证实 | 逐行读 `:1-843` |
| 失败保源码、generation 防竞态、扩展注册重试 | 已证实 | `:516-541`、`:87-93` |
| 未溢出不劫持滚轮/事件隔离 | 已证实 | `:708-725`、`:753-761` |
| 3 外部消费者 | 已证实（负向检索） | 全树检索 |
| beautiful-mermaid/mermaid 版本行为 | 未知 | 动态依赖 |
| dangerouslySetInnerHTML 的输出可信度 | 推断 | 依赖 securityLevel+isUsableSvg 双闸 |
| 缩放/动画实际观感 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 渲染管线（双路+smooth+isUsableSvg） | §3.1 | `:46-208` | covered |
| 主组件（防抖/测量/缩放/拖拽/渲染树） | §3.2 | `:486-843` | covered |
| MermaidZoomModal | §3.3 | `:292-482` | covered |
| 常量族 | §2 | `:38-44`、`:99`、`:270-273` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
| 依赖版本行为 | §10 | — | unknown |
