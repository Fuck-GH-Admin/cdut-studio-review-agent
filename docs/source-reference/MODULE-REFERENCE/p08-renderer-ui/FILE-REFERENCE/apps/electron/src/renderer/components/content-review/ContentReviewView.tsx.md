---
path: apps/electron/src/renderer/components/content-review/ContentReviewView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d400888e8a90529cf93d70b30ec4efdc73aea03
sha256: 7b7ed76e47983f14f90b4149aed909f4a413ccbc2aa95b7951825eb9b67871af
lines: 551
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ContentReviewView.tsx

## 1. 结论与边界

本文件是 CDUT 专区「材料审核」子页面的**容器组件**：它把 8 个工作页（`home`/`case-task`/`workbench`/`case-v2`/`templates`/`batches`/`local-candidates`/`settings`）用 Jotai 的 `reviewWorkspaceSectionAtom` 做切换，并在页面内组合三栏工作台、案卷办理、模板编排、批次管理、方案试跑、审核设置、助手抽屉与底部错误条（`apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:69-466`）。

它是**运行时 UI 组件**，不承载任何业务权威：案卷、运行、模板、设置全部来自 Main（经 `useReviewActions()` 与 `window.reviewAPI`），本文件只做展示、路由与少量界面状态（`narrow`/`quickCaseId`/`errorExpanded`/`errorDismissed`/`demoPublishing`/`reviewReadinessVisible`，见 `:84-88`、`:164`、`:184`）。

明确不做的事：

- **不自管窗口按钮与拖拽层**。统一顶栏与 `WindowControlsHost` 由外层 `CdutZoneView`（cdut-subview）统管，避免同为 priority 20 争抢（`:1-6`；调用点 `apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:330`）。
- **不自动选中列表首案**。挂载时只刷新列表与模型出口自检；若存在上次**显式**选择过的案卷则恢复它（`readLastSelectedCaseId()`，`review-actions-controller.ts:457`），没有恢复目标时保持未选，绝不把列表首案设为当前案卷（`:14-16`；实现见 `:129` 与 `review-actions-controller.ts:453-464`；测试 `review-actions-controller.test.ts:224-245`）。
- **不执行审核、不写盘、不持有 Pi 生命周期**。所有写操作经 `actions` 交给 Main（`:82`；`use-review-actions.ts:1`）。
- **不产生模型选择权威**。设置页只是复用 `ReviewFirstUseReadiness`，渠道与密钥仍由应用模型设置管理（`:61`、`ReviewSettingsPanel.tsx:1-11`）。

## 2. 导出与关键符号

顶层 `export` 只有 1 个函数；其余为文件内私有类型/常量/子组件（逐条核过 `grep -n "^export "`，本文件 `export` 行仅 `:69`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ContentReviewView` | 导出函数组件 | `:69` | `(): React.ReactElement` | 页面根组件；无 props，全部状态取自 atom 与 `useReviewActions()` |
| `Pane` | 内部 type | `:64` | `'left' \| 'center' \| 'right'` | 窄屏单栏标识，与 `reviewActivePaneAtom` 同域 |
| `NARROW_BREAKPOINT_PX` | 内部 const | `:67` | `1100` | 窄屏阈值，用**容器宽度**而非整窗宽度判定 |
| `GatewayBadge` | 内部组件 | `:469-489` | `{status: ReviewModelGatewayStatus \| null; onOpenSettings: () => void}` | 出口徽标；`status` 为 null 时返回 `null` |
| `PaneTab` | 内部组件 | `:492-518` | `{label; icon; active; onClick}` | 窄屏 `role="tab"` 按钮 |
| `PaneWrapper` | 内部组件 | `:521-551` | `{pane; className; narrow; active; showSeparator; children}` | 宽屏 flex 比例 + 1px 分隔；窄屏按当前栏显隐 |
| `quickStart` | 内部回调 | `:92-96` | `(caseId: string) => void` | 导入完成后落 `case-task` 页并清空 V2 聚合 |
| `openBusinessCase` | 内部回调 | `:99-121` | `() => Promise<void>` | 打开「案卷办理」，含同案复用与竞态校验 |
| `openPane` | 内部回调 | `:123-126` | `(pane: Pane) => void` | 切到 `workbench` 并设定当前栏 |
| `publishDemoTemplates` | 内部回调 | `:165-181` | `() => Promise<void>` | 调用 `publishD4DemoTemplates` 并汇总 toast |
| `dismissReviewReadiness` | 内部回调 | `:187-190` | `() => void` | 关闭首次准备浮层并写 localStorage |

## 3. 内部逻辑与关键流程

### 3.1 挂载与刷新（`:129`）

```tsx
React.useEffect(() => { void actions.initialize() }, [actions, channels])
```

- 依赖 `channelsAtom`（`apps/electron/src/renderer/atoms/conversation-atoms.ts:16`）：渠道列表变化会重新执行 `initialize()`，从而刷新顶栏出口徽标（注释 `:128`）。
- `actions.initialize()` 的真实行为在 `review-actions-controller.ts:453-472`：先 `refreshCaseList()`；只恢复用户上次**显式**选择过的案卷（`readLastSelectedCaseId()`，`:457`），恢复目标不在列表中则清空选中（`:461-464`）；随后 `api.getModelGatewayStatus()` 写入 `reviewGatewayStatusAtom`（`:466-467`），失败时写 `{available:false, protocol:'none', reason:'出口自检失败'}`（`:468-471`）。
- `refreshCaseList()` 自己 try/catch：`api.listCases()` 失败时 `reportError('读取案卷列表失败', error)` 并返回 `[]`（`review-actions-controller.ts:362-370`），所以 `initialize()` 在列表失败时仍会继续执行后续恢复与网关自检，**不会把异常抛给本文件**。`selectCaseInternal` 同样全程 try/catch，失败返回 `false`（`:310-357`）。
- 本文件不读 `getModuleSettingsV2`；设置页的读写由 `ReviewFirstUseReadiness` 自己完成（`ReviewFirstUseReadiness.tsx:34-40`、`:59-63`）。

### 3.2 窄屏判定（`:132-144`）

- 以 `rootRef.current.clientWidth < 1100` 判定 `narrow`（`:135`）。
- 有 `ResizeObserver` 时观察根节点（`:141-143`）；没有时退回 `window.addEventListener('resize')`（`:137-140`）。
- 该 effect 依赖数组为空（`:144`），只测一次根节点；根节点引用在组件生命周期内不变。
- 窄屏只在 `section === 'workbench'` 时渲染三栏切换条（`:325-335`）；`PaneWrapper` 在 `narrow` 且非当前栏时直接返回空 Fragment（`:536-538`），因此隐藏栏是**卸载**而不是 CSS 隐藏，重新显示会按保留的焦点重放定位（注释 `:537`）。

### 3.3 键盘快捷键（`:147-161`）

- 条件依次为：`event.shiftKey`（`:149`）→ 平台修饰键（Mac 用 `metaKey`，否则 `ctrlKey`，`:150-152`）→ `event.key.toLowerCase() === 'a'`（`:153`）。
- 目标可编辑时直接返回，避免吞掉 Ctrl+A 全选（`:155`；`isEditableTarget` 见 `apps/electron/src/renderer/lib/navigation-controller.ts:20-32`（含 `INPUT`/`TEXTAREA`/`isContentEditable`/`[contenteditable="true"], .ProseMirror` 四个分支））。
- 命中后 `preventDefault()` 并 toggle `reviewAssistantOpenAtom`（`:156-157`）；监听器在卸载时移除（`:159-160`）。
- 只在 `ContentReviewView` 挂载期间生效（`:146`）。

### 3.4 页面切换与「案卷办理」打开逻辑（`:99-126`、`:244-249`）

`openBusinessCase` 的目标案卷选择顺序（`:102`）：

1. `reviewCase?.id`（V1 工作台当前案卷）；
2. 否则 `businessAggregate?.caseV2.id`（V2 聚合当前案卷）；
3. 都没有 → 清空聚合、直接切 `case-v2`（`:103-107`）。

已缓存聚合且 `caseV2.id === targetId` 时直接切页、不重复 IPC（`:108-111`）。否则**先清空聚合**（`:112`）再切页（`:113`），然后 `openAggregateV2(targetId)`；只有返回聚合的 `caseV2.id` 与目标一致才写入 atom，否则 toast「当前案卷的业务记录暂不可读取」（`:114-117`），异常时 toast 带原始 message（`:118-120`）。注释明确这是 UI-01 的修复：不允许旧单例把办理对象反选回上一案（`:100-101`）。

导航按钮（`:228-253`）：

- `case-v2` 不直接 `setSection`，而是走 `openBusinessCase()`（`:245`）。
- `case-task` 在既无 `quickCaseId` 也无 `businessAggregate.caseV2.id` 时回落到 `workbench`，避免空白页（`:247`）。
- 其余 section 直接 `setSection(id)`（`:248`）。

### 3.5 页面条件挂载（`:303-443`）

| 区块 | 行 | 挂载策略 |
| --- | --- | --- |
| `ReviewV3T10WorkspaceOverview` | `:303-309` | `section !== 'home' && section !== 'settings'` 时渲染（本轮新增排除 settings） |
| 模板工作区子导航 | `:311-322` | 仅 `templates` / `local-candidates` |
| 窄屏 tab 条 | `:325-335` | 仅 `narrow && section === 'workbench'` |
| 审核首页 | `:338-368` | 始终渲染，非 home 时加 `hidden` |
| 三栏主体 | `:371-399` | 始终渲染，非 workbench 时加 `hidden`；无案卷时渲染 `ReviewV3QuickIntake`（`:372-375`） |
| `V2CasePanel` | `:401-405` | `section === 'case-v2'` 才挂载 |
| `TemplateWizardPanel` | `:406-408` | **始终挂载**（只加 `hidden`），与 `templatesRefreshAtom` 的「面板常驻挂载」注释一致（`V2CasePanel.tsx:31`） |
| `ReviewV3LocalCandidateWorkbench` | `:409-411` | 仅 `local-candidates`，传入 `initialCaseId={quickCaseId ?? undefined}` |
| `BatchPanel` + `ReviewV3T07Workbench` | `:412-433` | 面板常驻；T07 仅在 `section === 'batches'` 时挂载（UI-16，`:427-432`） |
| `ReviewV3CaseTaskView` | `:434-440` | 仅 `case-task` 且有案卷 ID |
| `ReviewSettingsPanel` | `:441-443` | 仅 `settings`；`onSaved` 重新 `actions.initialize()` |
| `AssistantDrawer` | `:446` | 始终挂载 |
| 底部错误条 | `:449-463` | `visibleError` 非空时渲染 |

`case-task` 的案卷 ID 取 `quickCaseId ?? businessAggregate?.caseV2.id`（`:435-436`）；`BatchPanel.onOpenProject` 会先试 `openAggregateV2(caseId)`，成功则设聚合并切 `case-v2` 返回 `true`，否则退回 `actions.selectCase(caseId)` 并在成功时切 `workbench`（`:415-425`）。

### 3.6 首次准备浮层（`:183-220`）

- 初值由 `localStorage.getItem('cdut.review.readinessAcknowledged') !== '1'` 决定，读失败时默认 `true`（`:184-186`）。
- 浮层为 `absolute inset-0 z-20` 的全屏 section，内部滚动 `ReviewFirstUseReadiness`（`:200-220`）。
- 「跳过，稍后设置」与「完成，开始审核」两个按钮调用同一个 `dismissReviewReadiness()`（`:212-216`），**语义相同**：关闭并写 `'1'`（`:187-190`），不校验模型是否真的可用。
- 写入 localStorage 的异常被吞掉（`:189`）。

### 3.7 错误条（`:87-89`、`:449-463`）

- `visibleError = errorMessage && errorMessage !== errorDismissed ? errorMessage : null`（`:89`）：关闭只记住**当前那条文本**，新的不同文本会再次显示。
- 「展开/收起」切换 `errorExpanded`（`:457-459`）；展开时 `whitespace-pre-wrap break-all`，收起时 `truncate`（`:454`）。
- 「复制」调用 `navigator.clipboard?.writeText(visibleError)`，可选链失败时静默（`:460`）。
- 「关闭」写 `errorDismissed = visibleError`（`:461`），不调用 `setReviewError`，因此 atom 里的错误仍保留，只是不再显示。

## 4. 调用者与调用链

**入向（谁挂载本文件）**

- `apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:330`：在 `CdutZoneErrorBoundary` 内、`CdutSubViewContainer` 中渲染 `<ContentReviewView />`；当 `activeSubView` 不是 `ai-class`/`yanhu-express` 时即材料审核（`:322-331`）。
- `apps/electron/src/renderer/lib/window-controls-host-coverage.test.ts:31` 以注释形式声明「材料审核工作台不再自管窗口按钮」——这是静态覆盖检查的约束来源，不是运行时调用者。

**出向（本文件调用谁）**

| 目标 | 行 | 说明 |
| --- | --- | --- |
| `useReviewActions()` | `:82` | 产出 `actions`，传入 `LeftPanel`/`CenterPanel`/`RightPanel`/`AssistantDrawer` 与设置页 `onSaved` |
| `actions.initialize()` | `:129`、`:442` | 列表刷新 + 出口自检 |
| `actions.selectCase(caseId)` | `:403`、`:422` | V2 面板打开案卷后同步 V1 选中；批次打开回落路径 |
| `window.reviewAPI.openAggregateV2` | `:115`、`:416` | preload `apps/electron/src/preload/index.ts:5080` → `REVIEW_IPC_CHANNELS.GET_AGGREGATE_V2` |
| `window.reviewAPI.publishD4DemoTemplates` | `:168` | preload `:4932-4940` → `D4_DEMO_PUBLISH_V3`，Main 侧 `apps/electron/src/main/lib/review/review-ipc.ts:960-964`，先 `assertC0ReviewMainSender(event)` |
| `humanizeReviewError` | `:177` | 仅用于发布模板失败文案 |
| 子组件 | `:384/393/396/403/407/410/413/430/435/442/446` | `LeftPanel`/`CenterPanel`/`RightPanel`/`V2CasePanel`/`TemplateWizardPanel`/`ReviewV3LocalCandidateWorkbench`/`BatchPanel`/`ReviewV3T07Workbench`/`ReviewV3CaseTaskView`/`ReviewSettingsPanel`/`AssistantDrawer` |

**子组件契约（用于判断修改影响）**

- `BatchPanel` 需要 `{active: boolean; onOpenProject: (caseId) => Promise<boolean>}`（`BatchPanel.tsx:37-38`），且 `active` 才刷新（`:144`）。
- `V2CasePanel` 需要 `{onCaseOpened?: (caseId: string) => void}`（`V2CasePanel.tsx:208`）。
- `ReviewV3T10WorkspaceOverview` 需要 5 个无参回调（`ReviewV3T10WorkspaceOverview.tsx:28-34`）。
- `ReviewV3CaseTaskView` 需要 `{caseId: string; onOpenCase?; onOpenAdvanced?}`（`ReviewV3CaseTaskView.tsx:16-21`）。

## 5. 数据 I/O、读写与副作用

**读（atom）**

`reviewCaseAtom`、`reviewGatewayStatusAtom`、`reviewErrorAtom`、`reviewWorkspaceSectionAtom`、`reviewV2AggregateAtom`、`channelsAtom`、`reviewActivePaneAtom`（`:70-80`）。

**写（atom）**

`reviewWorkspaceSectionAtom`（`:95`、`:105`、`:109`、`:113`、`:125`、`:247-248`、`:277`、`:307`、`:313-314`、`:345`、`:360`、`:419`、`:423`、`:438`）、`reviewV2AggregateAtom`（`:94`、`:112`、`:116`、`:418`）、`reviewActivePaneAtom`（`:124` 的 `openPane` 写入；`:331-333` 的窄屏 `PaneTab` onClick 写 `setActivePane('left'/'center'/'right')`）、`reviewAssistantOpenAtom`（`:157`、`:296`）。

**本地存储**

仅 `localStorage['cdut.review.readinessAcknowledged']`，读 `:185`、写 `:189`；键不存在/读异常都按「未确认」处理。

**剪贴板 / 通知**

`navigator.clipboard.writeText`（`:460`）；`toast.success`（`:169`）、`toast.error`（`:117`、`:119`、`:174`、`:177`）。

**副作用**

- 全局 `keydown` 监听（`:159`），卸载移除（`:160`）。
- `ResizeObserver` 或 `resize` 监听（`:137-143`）。
- 无磁盘写、无网络直连、无定时器。

**原子性/并发**

本文件不写磁盘，无锁语义。并发只体现在两处：`openBusinessCase` 用返回值 `caseV2.id` 二次核对（`:116`），以及 section 切换是同步 atom 写。真正的选择代次保护在 `review-actions-controller.ts:310-321`（`selectionGeneration`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| `actions.initialize()` 内部失败 | `review-actions-controller.ts:362-370`、`:465-471` | 列表失败在 `refreshCaseList()` 内 try/catch：`reportError('读取案卷列表失败', error)` 后返回 `[]`（`:362-370`），**不会向上抛**；`selectCaseInternal` 全程 try/catch 并返回 `false`（`:310-357`）；网关失败写 `available:false, reason:'出口自检失败'`（`:465-471`）。本文件 `void actions.initialize()`（`:129`）因此不会因这些 IPC 失败产生未处理 rejection；仅同步/store 异常仍可能逃逸（未证实，无对应测试） |
| 打开办理无目标案卷 | `:103-107` | 清空聚合，仍切到 `case-v2`（面板自身显示空态） |
| 打开办理返回错案卷 | `:116-117` | 不写聚合，toast「当前案卷的业务记录暂不可读取」 |
| `openAggregateV2` 抛错 | `:118-120` | toast 带 `Error.message`；聚合保持已清空状态 |
| 批次打开项目失败 | `:422-424` | 退回 `selectCase`；两者都失败返回 `false`，由 `BatchPanel.tsx:228` toast |
| 发布模板部分失败 | `:169-175` | 成功 toast 汇总 published/renamed/skipped/failed 数量；`failed` 非空再追加第一条失败原因 |
| 发布模板整体抛错 | `:176-178` | `humanizeReviewError` 后 toast；`finally` 复位 `demoPublishing`（`:178-180`） |
| localStorage 不可用 | `:185`、`:189` | 读取异常 → 显示浮层；写入异常 → 忽略（下次仍显示） |
| 无模型出口 | `:482-488` | 渲染可点击按钮「审核模型不可用 / 设置」，点击 `setSection('settings')`（`:277`） |

**恢复路径**：本文件无持久化状态可恢复；`quickCaseId`、`errorDismissed` 等只存在于组件生命周期，页面卸载即丢。真正的恢复（上次选中案卷、运行有效性）由 controller 读 Main（`review-actions-controller.ts:455-464`、`:335-340`）。

**不可恢复点**：`quickCaseId` 一旦被 `quickStart` 写入就不会被清空（`:86`、`:92-96`，全文件无 `setQuickCaseId(null)`）；此后 `case-task` 页优先使用它而非当前办理案卷（`:435`）。这会带来「切到别的案卷后，材料与审核页仍显示先前导入案卷」的显示错位风险——**推断**，依据是上述行号与取值顺序，未运行验证。

## 7. 权限与权威状态

- 本文件**无 sender/role/actor 检查**，也没有任何 IPC handler；所有权限判定在 Main。
- 写操作所经通道在 Main 侧有统一守卫：`openAggregateV2` 走 `GET_AGGREGATE_V2`；`publishD4DemoTemplates` 的 handler 先 `assertC0ReviewMainSender(event)`（`review-ipc.ts:960-961`），该守卫要求「主窗口 sender + 主帧」（`review-c0-authority.ts:21-27`）。
- 权威状态来源：案卷/聚合 = Main 存储；出口可用性 = `getReviewModelGatewayStatus()`（`review-model-gateway.ts:207-238`）；界面只做**展示与跳转**，`GatewayBadge` 不改变任何状态（`:469-489`）。
- 前端门禁仅两处：`case-task` 无案卷时回落（`:247`）、`报告与交付` 与「继续当前案卷」按钮在无案卷时 `disabled`（`:283`、`:350`）。这些是可用性约束，不是授权。

## 8. 修改影响面

- **section 枚举**：`ReviewWorkspaceSection` 定义在 `apps/electron/src/renderer/atoms/review-atoms.ts:34`；本文件是最大消费者。新增/删除 section 需同步：`ContentReviewView.tsx:228-237`（导航表）、各 `section === 'x'` 条件（`:303`、`:311`、`:325`、`:338`、`:371`、`:401`、`:406`、`:409`、`:412`、`:434`、`:441`），以及 `TemplateWizardPanel.tsx:10`（`useSetAtom` 在 `:131`）、`CaseManagerBar.tsx:31`（`:58`）、`ReviewV3LocalCandidateWorkbench.tsx:7`（`:24`）、`AssistantDrawer.tsx:40`（`:69`）这些**实际写入**该 atom 的组件。注意区分 import 行与写入行：`ReviewV3T10WorkspaceOverview.tsx:18` 只是 import、`:51` 用 `useAtomValue` 读取，**T10 是只读消费者，不写该 atom**。
- **`quickStart` 落点**：`:92-96` 从 `local-candidates` 改为 `case-task`（本轮改动）。依赖该落点的行为在 `ReviewV3QuickIntake.tsx:7`（`onCreated`）与 `:65/115/143`（创建、打开草稿后回调）；改回会直接影响「导入后默认页」。
- **`GatewayBadge` 签名**：新增必填 `onOpenSettings`（`:469-472`），本文件唯一调用点 `:277`。
- **`ReviewV3CaseTaskView` / `ReviewSettingsPanel`**：本文件是唯一挂载点（`:435`、`:442`）；删除/改 props 需同步这两个文件。
- **窗口按钮约束**：`window-controls-host-coverage.test.ts:31` 依赖「本文件不声明 `WindowControlsHost`」；若新增窗口按钮宿主会破坏该静态检查。
- **迁移/兼容**：无 schema、无存储格式、无版本号，纯 UI 组合，不涉及数据迁移。

## 9. 测试证据

**直接测试**：无。`grep -rln "ContentReviewView" apps/electron/src --include=*.test.*` 只命中 `window-controls-host-coverage.test.ts` 的一行注释（`:31`），不渲染本组件。

**间接证据（读断言，未运行）**

| 测试 | 行 | 与本文件的关系 |
| --- | --- | --- |
| `review-actions-controller.test.ts`「重新打开工作台时恢复用户上次明确选择过的案卷」 | `:224-235` | 断言 `store.get(selectedCaseIdAtom) === 'case-restore'` 与缓存标题；对应本文件 `:129` 调用的 `initialize()` |
| 同文件「UI-09 没有恢复目标时不把列表首案自动设为当前案卷」 | `:238-245` | 断言 `selectedCaseIdAtom` 为 `null`、首案未进缓存；对应本文件「不自动选中」边界 |
| `review-actions-controller.test.ts` 其余用例 | `:134-300+` | 覆盖 `reviewCasesByIdAtom`、`reviewRunStaleByCaseAtom`、`reviewErrorAtom` 等本文件读写的 atom，但均直接调 controller，不经过本组件 |

**未覆盖**：section 切换、窄屏 `ResizeObserver` 分支、Ctrl+Shift+A、错误条展开/复制/关闭、`publishDemoTemplates` 的 toast 分支、`openBusinessCase` 的错案卷校验、首次准备浮层的 localStorage 读写，均无断言。

**NOT_RUN**：本轮未执行任何测试/构建/Electron/GUI；以上仅为静态阅读结论。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 本文件是唯一导出组件，无 props，状态来自 atom 与 `useReviewActions` | 已证实 | `:69-82` |
| 挂载时执行 `initialize()`，并在渠道列表变化时重跑 | 已证实 | `:129`、`channelsAtom` 定义 `conversation-atoms.ts:16` |
| `initialize()` 不自动选中列表首案 | 已证实 | `review-actions-controller.ts:453-464` |
| 窄屏以容器宽度 1100px 判定，优先 `ResizeObserver` | 已证实 | `:67`、`:132-144` |
| 快捷键仅在非可编辑目标上 toggle 助手抽屉 | 已证实 | `:147-161`、`navigation-controller.ts:20-32` |
| `case-task` 无案卷时回落到 `workbench` | 已证实 | `:247` |
| `openBusinessCase` 拒绝写入 ID 不匹配的聚合 | 已证实 | `:116` |
| 两个 readiness 按钮行为完全相同，且不校验模型可用性 | 已证实 | `:212-216`、`:187-190` |
| `TemplateWizardPanel` 常驻挂载，`V2CasePanel` 条件挂载 | 已证实 | `:406-408`、`:401-405` |
| `publishD4DemoTemplates` 的 Main 入口要求主窗口主帧 | 已证实 | `review-ipc.ts:960-961`、`review-c0-authority.ts:21-27` |
| `quickCaseId` 永不复位，可能造成 `case-task` 页显示旧案 | 推断 | `:86`、`:92-96`、`:435`（无清空语句） |
| 仅当首次准备浮层可见（`localStorage['cdut.review.readinessAcknowledged'] !== '1'`）且子组件挂载时，`ReviewFirstUseReadiness` 才并行发 3 个 IPC | 已证实 | 本文件 `:184-186` 决定浮层是否渲染、`:209` 挂载子组件；子组件 `ReviewFirstUseReadiness.tsx:34-36` 在 `reload()` 内并行调用。浮层被关闭/已确认时不会挂载，也就不会发这 3 个请求 |
| `actions.initialize()` 的列表/网关失败已在 controller 内部兜底，不会因 IPC 失败成为未处理 rejection | 已证实 | `review-actions-controller.ts:362-370`（列表 catch 后返回 `[]`）、`:310-357`（选择 catch）、`:465-471`（网关 catch）；本文件 `:129` 的 `void` 只对同步/store 异常保留未处理可能（未证实） |
| 是否存在依赖 section 字符串的外部持久化 | 未知 | 已检索 `reviewWorkspaceSectionAtom` 的 7 个写入方，未见持久化；未检索全部动态字符串 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ContentReviewView` 导出与状态订阅 | 2、3.1 | `:69-82` | covered |
| 首次准备浮层与 localStorage | 3.6、6 | `:183-220` | covered |
| `quickStart` 落点 | 3.4、8 | `:92-96` | covered |
| `openBusinessCase` 目标选择与校验 | 3.4、6 | `:99-121` | covered |
| `openPane` | 3.4 | `:123-126` | covered |
| `initialize` effect | 3.1 | `:129` | covered |
| 窄屏测量与监听回退 | 3.2 | `:132-144` | covered |
| Ctrl+Shift+A | 3.3 | `:147-161` | covered |
| `publishDemoTemplates` | 3.5、6 | `:165-181` | covered |
| 导航按钮分支 | 3.4 | `:228-253` | covered |
| T10 概览挂载条件 | 3.5 | `:303-309` | covered |
| 模板子导航 | 3.5 | `:311-322` | covered |
| 三栏/QuickIntake 分支 | 3.5 | `:371-399` | covered |
| 各 section 条件挂载 | 3.5 | `:401-443` | covered |
| 错误条三按钮 | 3.7 | `:449-463` | covered |
| `GatewayBadge` | 3.7、7 | `:469-489` | covered |
| `PaneTab` | 3.2 | `:492-518` | covered |
| `PaneWrapper` 卸载语义 | 3.2 | `:521-551` | covered |
| 测试证据 | 9 | — | partial（无直接测试） |
| 运行时实际渲染/交互 | — | — | unknown（NOT_RUN） |
