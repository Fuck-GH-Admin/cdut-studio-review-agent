---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 28dae827ad94ba59305512db229d972e77491d65
sha256: d66f6c84063944910e118195ae0cd66cacb14197acfa03560efae4e46e0ab33d
lines: 1854
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.ts

## 1. 结论与边界

**无视感知（Vision-Less）DOM 蒸馏引擎**（1854 行）：四级算法流水线（语义降噪→可视性剪枝→遮挡校验→功能区解构，`:4-8`）+ 双射 BID 编号（`[1] [2]…`，`:10-11`）+ 极简 PageDigest 序列化（1k~1.8k Token）。纯函数部分无 Electron 依赖可单测（`:13`）；`YanhuDomDistillationEngine` 类仅做缓存与编排（`:1656-1815`）。

不做的事：不做定位执行（browser-tools 侧）；采集脚本注入在调用方；AXTree 数据源在 CDP 侧。

## 2. 导出与关键符号

**类型/常量**：`BidNodeRecord:19-26`（YanhuBidNode + backendNodeId/selector/stale）、`YanhuRawElement:29-50`（采集回传元素）、`YanhuCollectedPage:53-67`（含 dataTables/textDigest/textSample/closedShadowHosts/unrendered）；常量：`MAX_COLLECTED_ELEMENTS=1000:70`、`MAX_NAV_FRAME_ELEMENTS=120:78`（导航框架独立配额防饿死主框架，`:71-77`）、`MAX_NAME_CHARS=80:80`、`YANHU_ACCESSIBLE_NAME_SNIPPET:98-290`（**采集/定位共用**可访问名推导脚本，`:83-88` 历史缺陷注释）、`CLICKABLE_CONTAINER_SPLIT_MAX_ITEM_CHARS=24:300`、`NAV_REGION_FOLD_THRESHOLD=15:302`、`NAV_INLINE_ITEMS_PER_LINE=4:304`、`MAX_DATA_TABLES=4:306`/`MAX_DATA_ROWS=40:308`/`MAX_DATA_COLS=10:309`/`MAX_DATA_CELL_CHARS=30:310`、`DIFF_MAX_ADDED_ITEMS=8:312`、`MAX_TEXT_SAMPLE_CHARS=480:314`、`YANHU_POPUP_SELECTORS:322-338`（**单一真源**浮层选择器 12 项，`:317-320` 两端必须共用）、`MAX_COLLECTED_POPUP_OPTIONS=60:341`。

**函数**：`buildYanhuCollectorScript:351-1345`（页面内采集脚本生成器，四级采集+浮层纳管+表格直提+文本指纹）、`filterActionableElements:1355-1360`（渲染红线过滤）、`assignBids:1366-1382`（双射编号）、`enrichRolesFromAx:1397-1424`（AX 语义增强，多义不臆造）、`serializePageDigest:1483-1572`（四级解构序列化）、`formatBidLine:1575-1590`（单条 BID 文本）、`computePageFingerprint:1617-1623`（多要素指纹）、`normalizeStateString:1632-1637`（WebRollback 剥挥发属性）。类：`YanhuDomDistillationEngine:1656-1815`（distill/getCached/resolveBid/resolveBidWithFallback/listBidsWithFallback/markDirty/recordDelivery/getDeliveredFingerprint/release）；`yanhuDomDistillationEngine:1854` 单例。

## 3. 内部逻辑与关键流程

### 采集脚本（`:351-1345`）要点

- **DOM Clobbering 防线**（`:367-417`）：原型方法脱敏切片+`Reflect.apply`（safeGetAttr/safeTitle/safeHref），防 `name=title` 类污染。
- **Shadow DOM 穿透**（`queryAllDeep:428-458`）+ 闭合宿主打标（`:439-447`，上限 40）；组合树遮挡判定（`__inComposedChain:469-483`）。
- **可访问名推导**（`YANHU_ACCESSIBLE_NAME_SNIPPET` 五阶：ARIA→原生 label→按钮 value→显示文本→data-caption 兜底；占位文本"请选择..."不配当名 `:164-193`、泛化占位让位权威标签 `:274-276`）；空间近邻投影限定字段作用域（`__yanhuFieldScopeOf:589-606` 防跨列串扰）。
- **渲染红线**（`isRenderedElement:527-539`）：display/visibility/opacity/content-visibility/getClientRects 五道闸；隐藏控件**可见代理重绑定**（`__yanhuRenderedProxyOf:554-579`，勾选态随代理投递 `:1055-1061`）；未渲染只计数不分配 BID（`:1088-1101`）。
- **浮层统一纳管**（`isPopupOwned:971-978` 两硬约束+`emitPopupOptions:1229-1297` 双去重，追加在台账末尾保 BID 稳定 `:1225`）。
- **表格直提**（`extractDataTables:845-918`，30ms 软熔断 `:847-848`）；可点击容器拆分（`splitContainerItems:794-837`）；导航配额倾斜（`:998-1003`）；循环引用熔断（WeakSet+深度 6 `:920-923`）。
- **文本指纹**（`:1300-1329`，FNV-1a）。

### 主进程纯函数与类

`assignBids` 前序双射；`serializePageDigest` 分组排序（核心业务区优先、导航折叠为行内紧凑 `:1552-1561`）；`computePageFingerprint` = URL+BID 序列+表格+textDigest（`:1617-1623`，防假"无变化"）；引擎四缓存（cache/lastValidIndex/deliveredFingerprints/deliveredSnapshots），`markDirty` 转入历史回退池（`:1772-1776`）、`resolveBidWithFallback` 标 stale（`:1747-1752`）、`recordDelivery` 出 unchanged/diffText（Git-Diff 增量 `buildDiffOnlyText:1823-1851`）。

## 4. 调用者与调用链

`yanhu-browser-tools`（read_page/click/fill 的 BID 解析）、express-manager（采集编排）、CDP 调用方；出向 `@profer/shared`（YanhuBidNode/YanhuDistilledPage）。

## 5. 数据 I/O、读写与副作用

纯函数+内存缓存；采集脚本在页面内执行（副作用由注入方承担）；无持久化、无网络。

## 6. 分支、失败、取消与恢复

采集脚本整体 try/catch 回空结构（`:1341-1343`）；30ms 表格熔断；递归深度 6+WeakSet；`markDirty`→回退池→`resolveBidWithFallback` 恢复链（消除"点击→失效→重读"冗余）。

## 7. 权限与权威状态

- **单一真源红线**：`YANHU_ACCESSIBLE_NAME_SNIPPET` 两端共用（`:83-88`）、`YANHU_POPUP_SELECTORS` 两端共用（`:317-320`）——防"采集能见、定位不可达"。
- **渲染红线**：未渲染不分配 BID（`:1350-1353`）；BID 双射不变式（追加编号 `:1225`）。
- **防误导**：占位文本不当名、聚合容器短文本口径（`:144-163`）、布局表格与数据表格区分（`isLayoutTable:701-716`）。

## 8. 修改影响面

改采集脚本影响 BID 台账质量与 Token；改名推导必须两端同步（历史事故源）；指纹口径改动影响"无变化"短路与重复点击护栏；类缓存语义影响点击成功率。

## 9. 测试证据

**有直接测试** `apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.test.ts`（批外，属后续批次；三符号 filterActionableElements/assignBids/serializePageDigest 均命中，主根 grep 复核 37 行——此前"0 命中"为检索失误）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件结构/导出/红线/缓存语义 | 已证实 | 1854 行全读 |
| 历史缺陷注释群（名字不匹配/身份突变/双胞胎/跨列串扰/聚合名误导等） | 已证实 | `:85-88`、`:264-266`、`:282-286`、`:585-588`、`:928-935` 等 |
| 规格书（《Vision-Less Web Perception》/CI4A/GUI-AIMA）引用 | 推断 | 注释自述，文档不在冻结树 |
| 页面内脚本实际行为（Clobbering 防线等） | 未知 | NOT_RUN |
| 直接测试存在（批外） | 已证实 | `apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.test.ts` 主根复核 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/常量 | §2 | covered |
| 采集脚本各防线 | §3 | covered |
| 纯函数/类缓存语义 | §3 | covered |
| 红线/影响面 | §7/§8 | covered |
| 测试/未知 | §9/§10 | covered |
