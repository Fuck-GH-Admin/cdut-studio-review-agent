---
path: apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a9b7382971f4b9117d1ad670bbdfc71e4f702aae
sha256: 7eb9d41c00a3b661a276655fd3f0d00b0e30c1ba99af900486cf27ca588b8549
lines: 220
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx

## 1. 结论与边界

B1+B3 候选工作区的**双模式外壳**：有 `product` 端口时渲染 R30–R32 的 `ReviewV3ProductWorkspace`；没有时退回「路由确认面板 + B1 作者向导」两页（`apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx:198-220`）。

运行时 UI 组件。它自己**不发 IPC**：`grep -c reviewAPI` 在本文件为 0，所有 Main 调用都来自 props 回调（`:44-46`、`:194`）。文件头声明「Not mounted in the C-owned Case workbench and does not issue ApplyMaterial, InstallPlan, Case, Run or Policy publisher calls」（`:1-5`）。

明确不做的事：

- **不建案、不安装计划、不发布政策**：全部动作只是「技术选择」提案（`:14-20`、`:99-106`）。
- **不决定倒计时结果**：轮询只请求 Main 重算，注释写明「Renderer never decides timeout success」（`:43`）。
- **不把 held 模板变成可选**：搜索只在既有分组内过滤（`review-v3-route-view.ts:55-61`）。

## 2. 导出与关键符号

`export` 共 **7 个**（5 interface + 2 function），逐行核过。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B3TechnicalChoice` | 导出 interface | `:14-20` | `{proposalOnly:true; caseCandidateId; sessionKey; templateId; templateVersion}` | 提交给 Main 的技术提案 |
| `B3TechnicalChoiceAck` | 导出 interface | `:22-25` | `{candidateOnly:true; technicalChoiceRecorded:true; caseCandidateId; templateId; templateVersion}` | Main 回执 |
| `assertB3TechnicalChoiceAck` | 导出 function | `:26-36` | `(response: B3TechnicalChoiceAck\|void, choice: B3TechnicalChoice) => boolean` | `undefined`→`false`；字段不符→抛 `B3_MAIN_TECHNICAL_ACK_MISMATCH` |
| `B3RoutePanelProps` | 导出 interface | `:37-48` | 8 个字段：4 数据（`caseCandidateId`/`sessionKey`/`route`/`manualCatalog`）+ 4 回调（`onRequestRefresh`/`onInterrupt`/`onManualChoice`/`onOpenCustomAuthor`） | 路由面板契约 |
| `ReviewV3RouteReviewPanel` | 导出 function | `:50-191` | `(props: B3RoutePanelProps) => ReactNode` | 路由/人工选择面板 |
| `B1B3CandidateWorkspaceProps` | 导出 interface | `:192-197` | `Omit<B3RoutePanelProps,'onOpenCustomAuthor'> & {author: B1AuthorWizardProps; product?: B32ProductPorts}` | 外壳契约 |
| `ReviewV3CandidateIntakeSurface` | 导出 function | `:198-220` | `(props: B1B3CandidateWorkspaceProps) => ReactNode` | 唯一默认导出的组件 |

内部：`action` 类名常量（`:49`）。

## 3. 内部逻辑与关键流程

### 3.1 `ReviewV3RouteReviewPanel`：视图与作用域（`:50-66`）

- `view = buildB3RouteView(route, manualCatalog)`（`:52`）——纯函数，校验失败抛 `B3_VIEW_INPUT_INVALID`（`review-v3-route-view.ts:17-20`）。
- `scope = sessionKey + '::' + caseCandidateId`（`:53`）；`scopeRef` 每渲染同步（`:54-55`）。
- `refreshInFlight` ref 防重入（`:56`）；`refreshRef` 保存最新 `onRequestRefresh`（`:57-58`）。
- 局部 state：`chosenKey`、`catalogQuery`、`busy`、`error`、`notice`（`:59-63`）。
- scope 变化时清空这五项（`:64-66`）。

### 3.2 倒计时轮询（`:67-78`）

仅当 `route.status === 'countdown'` 时启动 `setInterval(..., 500)`（`:68-70`）。每个 tick：`refreshInFlight` 为真则跳过；否则置真、`Promise.resolve().then(refresh)`、错误写入 `error`、`finally` 复位（`:71-75`）。清理时 `active=false` 并 `clearInterval`（`:77`）。

依赖 `[route.status, scope]`（`:78`）。**注意**：进入 countdown 时**不会立即刷新一次**，第一次刷新发生在 500ms 后；停止条件只有 Main 下次返回的状态改变（本文件不自行判定超时）。

### 3.3 中断（`:82-92`）

`busy` 互斥 → 清错/提示 → `await props.onInterrupt()` → scope 未变才写「已请求停止自动选择，请以 Main 下次返回的路由状态为准」（`:88`）；异常同样按 scope 判定后写 `error`；`finally` 复位 `busy`（`:91`）。

### 3.4 人工选择（`:93-113`）

1. `!selected || busy` 直接返回（`:94`）。
2. `requireB3VisibleManualChoice(manualCatalog, selected.templateId, selected.templateVersion)`——若该模板不在 `eligible`（`availability==='authorized-for-technical-selection'`）分组内，抛 `B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE`（`review-v3-route-view.ts:63-71`）。
3. 组提案 `{proposalOnly:true, caseCandidateId, sessionKey, ...technical}`（`:99-101`）。
4. `await props.onManualChoice(proposal)` → `assertB3TechnicalChoiceAck(reply, proposal)`（`:102-103`）。
5. `undefined` 回执 → `confirmed=false` → 提示「选择请求已发送，但 Main 尚未返回已记录回执；请重新读取当前路由状态」（`:105-106`）。
6. 异常 → `error`；`finally` 复位 `busy`（`:107-112`）。

### 3.5 渲染分支（`:114-191`）

- 头部：标题、`view.heading`、`view.guidance`、状态行（`route.status` / `caseCandidateId` / 「仅供技术候选使用」）（`:116-123`）。
- `unmatched`：说明块 + 「创建新的候选审核模板（非正式发布）」（`:124-133`）。
- `countdown`：剩余秒数 + `<progress max={20} value={20-Math.min(20,remainingSeconds)}/>` + 中断按钮（`:134-141`）。
- `default-selected`：技术候选名称或「当前建议已不可用」，并声明不代表已建案（`:142-150`）。
- 人工选择区：检索框、`<select>`（选项来自 `filterB3Catalog(view.eligible, query)`）、确认按钮（`disabled={!selected||busy}`）（`:151-173`）。
- `held` 分组用 `<details>` 折叠，只读列出、不可提交（`:174-181`）。
- 两个「自建」入口都调 `props.onOpenCustomAuthor`（`:182-183`）。
- 错误/提示行（`:185-186`）、尾部声明（`:187-189`）。

### 3.6 外壳 `ReviewV3CandidateIntakeSurface`（`:198-220`）

- `section` state 初值 `'route'`（`:199`）；`scope` 同前（`:200`）；scope 变化时重置 `section`（`:201`）。
- **product 分支优先**（`:202-211`）：直接 `return <ReviewV3ProductWorkspace key={scope} ... />`，此时 `section` 完全未被使用（`:201` 的重置对该分支无效果）。
- 非 product 且 `section==='author'`：渲染返回按钮 + `<ReviewV3AuthorWizard key={scope} {...props.author} />`（`:212-218`）。
- 否则：`<ReviewV3RouteReviewPanel key={scope} {...props} onOpenCustomAuthor={()=>setSection('author')} />`（`:219`）。

**注意**：`:206-207` 把 `{...props}` 展开进 `ReviewV3RouteReviewPanel`，其中包含 `author` 与 `product` 两个不属于 `B3RoutePanelProps` 的键——运行时被忽略，但类型上依赖 `B3RoutePanelProps` 是 `B1B3CandidateWorkspaceProps` 的子集这一事实（`:192`）。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx:384-427`：`product` 非空时挂载，`key={localCaseId + '-' + product.sessionKey}`，传 `caseCandidateId`、`sessionKey`、`route`、`manualCatalog`、四个回调、`author`、`product`。
- 全树无其它引用（`grep -rn "ReviewV3CandidateIntakeSurface"` 仅本文件与上述 Workbench）。

**出向**

| 目标 | 本文件行 | 说明 |
| --- | --- | --- |
| `buildB3RouteView` / `filterB3Catalog` / `requireB3VisibleManualChoice` | `:52`、`:79-80`、`:98` | `review-v3-route-view.ts` 的纯函数 |
| `ReviewV3AuthorWizard` | `:11`、`:208`、`:217` | B1 作者向导；product 分支传 `initialRevision={0}` |
| `ReviewV3ProductWorkspace` | `:12`、`:202` | R30–R32 工作台 |
| `props.onRequestRefresh` | `:73` | 轮询；由父级接到 `readProduct()` |
| `props.onInterrupt` | `:87` | 父级接 `interruptLocalNativeProductV3` |
| `props.onManualChoice` | `:102` | 父级接 `chooseLocalNativeProductTemplateV3` |
| `props.onOpenCustomAuthor` | `:132`、`:183`、`:219` | 父级切到作者页或 ProductWorkspace 的 `openAuthor` |

## 5. 数据 I/O、读写与副作用

- **输入**：`caseCandidateId`、`sessionKey`、`route`（`B3RouteState`）、`manualCatalog`（`B3ManualCatalogEntry[]`）4 个数据字段 + `onRequestRefresh`/`onInterrupt`/`onManualChoice`/`onOpenCustomAuthor` 4 个回调（`B3RoutePanelProps` 共 8 字段）、`author`、可选 `product`。
- **读**：无直接 IO；`view` 是 `route + catalog` 的纯派生。
- **写**：无持久化、无 atom、无 localStorage；只写本地 state。
- **副作用**：`setInterval` 500ms（`:70`，仅 countdown）；`<progress>` 视觉。
- **并发**：`refreshInFlight` 防重入（`:56`、`:71-72`）；`scopeRef` 丢弃跨 scope 结果（`:85`、`:89`、`:104`、`:108`、`:111`）。
- **幂等**：轮询本身幂等（只是请求 Main 重算）；`manual()` 每次都会发一次选择请求，是否去重取决于 Main。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 目录/路由非法 | `:52` → `review-v3-route-view.ts:19` | `B3_VIEW_INPUT_INVALID`（渲染期抛出，本文件未 catch） |
| 轮询请求失败 | `:73-75` | 写 `error`，轮询继续（下一 tick 仍会尝试） |
| 人工选择非 eligible 模板 | `:98` → `review-v3-route-view.ts:69` | `B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE` |
| Main 回执缺字段 | `:30-34` | `B3_MAIN_TECHNICAL_ACK_MISMATCH` |
| Main 无回执 | `:29` | 返回 `false`，提示「尚未返回已记录回执」 |
| 中断失败 | `:89-90` | 写 `error` |
| scope 切换 | `:64-66`、`:201` | 清空面板/外壳的局部状态 |

**恢复**：无持久状态；重进需父级重新读。**不可恢复**：`chosenKey`、`catalogQuery`、`error`、`notice` 都是易失 state。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查、无 IPC，依据：无 `ipcRenderer`/`reviewAPI`/`assertC0*`。
- 权威状态全部来自 Main：`route.status` 与 `remainingMs` 由 Main 计算（`:43` 注释、`:136`）；`technicalChoiceRecorded` 只能由 Main 回执给出（`:23`、`:30`）。
- 前端只做两件事：把 `availability==='authorized-for-technical-selection'` 的候选放进可选组（`review-v3-route-view.ts:36-40`），以及要求回执字段匹配（`:26-36`）。二者都是可用性/一致性约束，不是授权。

## 8. 修改影响面

- **唯一调用方** `ReviewV3LocalCandidateWorkbench.tsx:384-427`：改 props 需同步该处。
- **`product` 分支**：把 `product` 传空即可退回旧两页模式（`:202`），但会失去 R30–R32 工作台；反之接通 `product` 后 `section` 状态失效。
- **`B3RoutePanelProps`**：`ReviewV3RouteReviewPanel` 也被 product 分支通过 `renderRoute` 复用（`:206-207`），改签名会同时影响两条路径。
- **`assertB3TechnicalChoiceAck`**：唯一调用点是 `:103`；放宽字段校验会让「未记录」的回执被当成已记录。
- **依赖类型**：`B3RouteState`/`B3ManualCatalogEntry`（`review-intake-routing-adapter-v3-b3.ts:31-36`、`:117-122`）、`B1AuthorWizardProps`（`ReviewV3AuthorWizard.tsx:27-40`）、`B32ProductPorts`（`ReviewV3ProductWorkspace.tsx:36-53`）。
- 无存储格式/迁移。

## 9. 测试证据

**直接测试**：无。全树检索 `--include=*.test.ts --include=*.test.tsx --include=*.test.mjs`，`ReviewV3CandidateIntakeSurface`、`ReviewV3RouteReviewPanel`、`assertB3TechnicalChoiceAck`、`buildB3RouteView` 命中均为 0。

**间接证据**：无测试导入 `review-v3-route-view.ts`（`grep -rl review-v3-route-view --include=*.test.*` = 0）。

**未覆盖**：500ms 轮询的启动/停止/重入、`undefined` 回执分支、`requireB3VisibleManualChoice` 的拒绝分支、`held` 折叠组、progress 值域。

**NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出（5 interface + 2 function） | 已证实 | `grep -c "^export"` = 7；`:14`、`:22`、`:26`、`:37`、`:50`、`:192`、`:198` |
| 本文件无 `reviewAPI` 调用 | 已证实 | `grep -c reviewAPI` = 0 |
| 轮询仅在 countdown 且间隔 500ms | 已证实 | `:68-70` |
| 进入 countdown 后首个刷新在 500ms 后 | 已证实 | `:70-76`（无立即调用） |
| `undefined` 回执不算成功 | 已证实 | `:29`、`:105-106` |
| product 分支忽略 `section` | 已证实 | `:199-211` |
| product 分支向 RouteReviewPanel 展开多余 props | 已证实 | `:206-207` vs `:37-48` |
| 轮询失败后仍继续重试 | 已证实 | `:73-75` 的 catch 不 clearInterval |
| Main 侧如何把 countdown 推进为 default-selected | 未知 | 未读 B3 session 时间推进实现；本文件只轮询 |
| 500ms 轮询在真实 Main 下的请求放大程度 | 未知 | 需运行测量（NOT_RUN） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B3TechnicalChoice` | 2 | `:14-20` | covered |
| `B3TechnicalChoiceAck` / `assertB3TechnicalChoiceAck` | 2、6 | `:22-36` | covered |
| `B3RoutePanelProps` | 2 | `:37-48` | covered |
| 视图与作用域 | 3.1 | `:50-66` | covered |
| 轮询 | 3.2、6 | `:67-78` | covered |
| 中断 | 3.3 | `:82-92` | covered |
| 人工选择 | 3.4 | `:93-113` | covered |
| 渲染分支 | 3.5 | `:114-191` | covered |
| 外壳三分支 | 3.6 | `:198-220` | covered |
| 调用者/出向 | 4 | — | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| 运行期行为 | — | — | unknown（NOT_RUN） |
