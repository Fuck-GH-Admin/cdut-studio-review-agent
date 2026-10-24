---
path: apps/electron/src/renderer/components/content-review/ReviewV3CaseTaskView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d15ed7f25a035fdeb7c05c77e34ef055cb930cf
sha256: aad89408bcd054855ca937f20512537d1d3ac2c849757578ea5770b11c9d5d54
lines: 204
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3CaseTaskView.tsx

## 1. 结论与边界

「材料与审核」普通案卷页：材料导入完成后的**默认落点**。只展示三件事——本案材料清单、自动识别/路由状态、一个主按钮（采用审核方案）；再把执行交给 `ReviewV3UnifiedRun`（`apps/electron/src/renderer/components/content-review/ReviewV3CaseTaskView.tsx:1-8`、`:144-203`）。

运行时 UI 组件。它**不产生**路由结论：自动识别由 Main 的 `readLocalNativeProductV3` 返回（`:5-6`、`:62`），是否已正式采用由 Main 的聚合 `d2RuntimePlan` 决定（`:71-74`）；界面只读、只触发采用动作。

明确不做的事：

- **不自行改判路由**。倒计时到点后只是「重新读取」，注释写明「由 Main 决定是否已正式采用，界面不自行改判」（`:87-88`）。
- **不保存模板编辑**。方案来自 `listD4Templates()` 的固定候选，`selectionIssue` 非空即不可选（`:98-100`、`:136`）。
- **不创建案卷**。案卷由父级 `ReviewV3QuickIntake` 创建并回调 `caseId`（`ReviewV3QuickIntake.tsx:7`、`:65`、`:115`）。

## 2. 导出与关键符号

顶层 `export` 仅 1 个函数；`Props`、`InstalledPlan`、`routeLabel` 均未导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewV3CaseTaskView` | 导出函数组件 | `:42` | `({ caseId, onOpenAdvanced?, onOpenCase? }: Props): JSX.Element` | 唯一导出 |
| `Props` | 内部 interface | `:16-21` | `{caseId: string; onOpenAdvanced?: () => void; onOpenCase?: () => void}` | `onOpenAdvanced` 打开旧「方案试跑」 |
| `InstalledPlan` | 内部 interface | `:23-26` | `{templateId: string; checks: number}` | 页面内计划视图模型 |
| `routeLabel` | 内部函数 | `:29-40` | `(read: C11MainLocalProductRead \| null) => {tone: 'idle'\|'wait'\|'ok'\|'warn'; text: string}` | 路由状态 → 一句话 + 色调 |
| `load` | 内部 useCallback | `:56-75` | `() => Promise<void>` | 并行读聚合与产品路由 |
| `applyPlan` | 内部 useCallback | `:97-108` | `(templateId: string) => Promise<void>` | 调 `attachD4TechnicalPlanV3` 并回填 plan |
| `applyChosen` | 内部 async | `:121-132` | `() => Promise<void>` | 手动选择后应用并重载 |

## 3. 内部逻辑与关键流程

### 3.1 `routeLabel` 的六种映射（`:29-40`）

| `read` / `route.status` | tone | 文案（原文） |
| --- | --- | --- |
| `read === null` | `idle` | 正在读取本案材料… |
| `default-selected` | `ok` | 已根据材料自动匹配到审核方案 |
| `countdown` | `wait` | 已匹配到一套审核方案，`Math.max(1, Math.ceil(remainingMs/1000))` 秒后自动采用；你也可以直接选择其他方案 |
| `manually-selected` | `ok` | 已选择审核方案 |
| `unmatched` | `warn` | 没有自动匹配到现成方案，请从下面选一套，或用「高级」自定义 |
| `awaiting-evidence` | `warn` | 材料还没准备好，请先导入申请材料 |
| 其它（含 `needs-user-confirmation`） | `warn` | 材料涉及多个业务或归属不明确，请手动选择审核方案 |

状态枚举定义在 `apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts:31-36`，六个值全部被覆盖，`default` 分支兜住 `needs-user-confirmation`。

### 3.2 加载与竞态（`:52-81`）

- `caseRef` 在每次渲染时同步为最新 `caseId`（`:52-53`）；`epochRef` 作为请求代次（`:54`）。
- `load()` 固定 `target = caseId`，`seq = ++epochRef.current`（`:57-59`）；`Promise.all` 同时发起 `getAggregateV2(target)` 与 `readLocalNativeProductV3(target)`（`:60-67`）。
- 产品路由读取失败被局部 catch：写入 `humanizeReviewError(cause)` 并返回 `null`，**不阻断材料展示**（`:62-66`，注释 `:63`）。
- 回写前双重核对 `seq !== epochRef.current || caseRef.current !== target` 即丢弃（`:68`）——旧案结果不会渲染进新案。
- `plan` 由 `fresh.d2RuntimePlan` 推导，`checks = mapping.length`（`:71-74`）。
- `caseId` 变化时清空 `read/plan/notice/error/chosenId`，无 `caseId` 直接返回（`:77-81`）。

### 3.3 模板目录（`:83-85`）

挂载时 `listD4Templates()` 写 `templates`；失败被吞（注释「目录不可用时仍可手动输入」，`:84`）。依赖数组为空，只读一次。

### 3.4 倒计时到点重读（`:88-95`）

`route.status === 'countdown'` 时设一个 `setTimeout`，延时为 `Math.min(Math.max(remainingMs ?? 0, 800), 20_000) + 120`（`:93`）：即最小延时 800ms（floor，**不是** debounce；剩余时间为 0 时也会等 800ms）、上限 20s、再留 120ms 余量。到点调用 `load()` 重新向 Main 求证；`read` 变化或卸载时清除定时器（`:94`）。

### 3.5 应用方案（`:97-119`）

`applyPlan(templateId)`：

1. 在 `templates` 中查找；找不到抛「这套审核方案在本机已不可用，请重新选择」（`:98-99`）。
2. `template.selectionIssue` 非空则抛「这套方案缺少必要的对象与场景数据，不能使用：…」（`:100`）。
3. 构造 `D4ClientSelection = {selection, ...(controlledStudentFixture ? {useControlledStudentFixture: true} : {})}`（`:101-104`）。
4. `attachD4TechnicalPlanV3({caseId, d4})`，用回执的 `templateId/checks` 更新 `plan` 与 `notice`（`:105-107`）。

**自动采用**（`:111-119`）：条件是 `!plan && !busy && route.status === 'default-selected' && route.chosen`；命中后 `setBusy(true)` 再 `applyPlan(chosen.templateId)`，失败 `setError(humanizeReviewError(cause))`，`finally` 复位 `busy`。即「唯一高置信建议不需要用户再点一次」（`:110`）。**注意**：失败时 `plan` 仍为 `null`，effect 不会自行停止；持久性失败会反复重试 attach，见 §6「自动采用失败（持久性错误）」与 §10。

**手动采用**（`:121-132`）：`chosenId` 为空先报「请先选择一套审核方案」并 return（`:122`）；成功后 `await load()` 重读聚合。

### 3.6 渲染结构（`:134-203`）

- `documents = aggregate?.caseV2.documents.filter(doc => doc.active !== false) ?? []`（`:134`）——只统计未停用版本。
- `selectable = templates.filter(item => !item.selectionIssue)`（`:136`）；`tone` 由 `status.tone` 查表（`:137-142`）。
- 材料区：标题取 `aggregate?.caseV2.title ?? '当前案卷'`（`:147`）；空态提示回「从材料开始审核」（`:160-161`）；每条按 `role` 映射「申请材料/证明材料/依据/附件」，按 `parseStatus` 映射「已解析/待解析/部分解析/解析失败」（`:166-168`）。
- 状态区 `aria-live="polite"`：有 `plan` 时显示「审核方案已就绪：…」否则显示 `status.text`，`notice` 另起一行（`:174-177`）。
- 选择区只在 `!plan` 时出现（`:179`）；下拉为空时选项文案「本机暂无可用方案」（`:183`）。
- `ReviewV3UnifiedRun` 的 `stage` 取 `aggregate?.caseV2.stage ?? 'draft'`，`technicalPlan={!!plan}`、`canRun={!!plan}`、`onUpdated={load}`（`:193-200`）。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:435-439`：`section === 'case-task'` 且存在 `quickCaseId ?? businessAggregate?.caseV2.id` 时挂载；`onOpenCase={() => void openBusinessCase()}`、`onOpenAdvanced={() => setSection('local-candidates')}`。
- 该页也是 `quickStart` 的落点（`ContentReviewView.tsx:92-96`），即 `ReviewV3QuickIntake` 创建案卷后的回调目标（`ReviewV3QuickIntake.tsx:65`、`:115`）。

**出向（IPC 与行号）**

| 调用 | 本文件行 | preload | Main |
| --- | --- | --- | --- |
| `getAggregateV2` | `:61` | `preload/index.ts:4874` | `GET_AGGREGATE_V2` |
| `readLocalNativeProductV3` | `:62` | `preload/index.ts:4838` | `LOCAL_PRODUCT_CURRENT_V3` |
| `listD4Templates` | `:84` | `preload/index.ts:4827` | `LOCAL_D4_LIST_V3` |
| `attachD4TechnicalPlanV3` | `:105` | `preload/index.ts:4829-4832` | `LOCAL_D4_ATTACH_PLAN_V3`，回执 `{caseId,templateId,templateVersion,checks,fingerprint}` |

`C11MainLocalProductRead` 形状为 `{read: B32ProductRead; catalog: B3ManualCatalogEntry[]; sessionKey: string; routeCandidates: D4ContentRouteSuggestion[]}`（`apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:32-38`），本文件只消费 `read.route`（`:30`、`:89`、`:112`）。

## 5. 数据 I/O、读写与副作用

- **输入**：`caseId`（必填）、两个可选回调。
- **读**：`CaseAggregateV2`、`C11MainLocalProductRead`、`D4ClientTemplate[]`。
- **写**：仅本地 React state；`attachD4TechnicalPlanV3` 会写 Main 侧案卷（安装技术计划），这是本文件触发的唯一持久化副作用（`:105`）。
- **无** localStorage、无剪贴板、无 toast、无全局监听。
- **定时器**：倒计时 `setTimeout`，依赖变化或卸载即清理（`:91-94`）。
- **并发**：`epochRef` + `caseRef` 双核对（`:68`）；`busy` 作为应用方案的互斥标记（`:113`、`:123`、`:129`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无 `caseId` | `:58`、`:79` | `load` 直接返回；effect 只做清空 |
| 产品路由读取失败 | `:62-66` | 设错误、返回 `null`，聚合照常展示 |
| 聚合读取失败 | `:80`、`:92` | 外层 catch → `humanizeReviewError` |
| 旧请求晚到 | `:68` | 丢弃，不写 state |
| 倒计时中用户离开/切案 | `:94` | 清理定时器 |
| 方案不在目录 | `:98-99` | 抛「本机已不可用」 |
| 方案缺对象/场景 | `:100` | 抛「缺少必要的对象与场景数据」 |
| 自动采用失败（持久性错误） | `:111-119` | 错误上屏后 `finally` 把 `busy` 复位为 `false`（`:118`），而 `plan` 仍为 `null`、`read` 未刷新；effect 依赖 `[read, plan, busy, applyPlan]`（`:119`），`busy` 的 `true→false` 变化会**再次满足**条件（`:113`），于是再次 `setBusy(true)` 并重新调用 `applyPlan` → 再次 `attachD4TechnicalPlanV3`（`:105`）。若错误是持久性的（例如 Main 持续拒绝），这会形成**反复 attach 的重试环**。**停止**只有三类：① attach 成功后 `applyPlan` 写入 `plan`（`:105-106`）使 `:113` 的 `plan` 短路成立；② 路由不再是 `default-selected` 或 `chosen` 缺失（`read` 被其它路径刷新改变路由）；③ 组件卸载。注意 `templates` 变化引起 `applyPlan` 身份变化（`:108` 依赖 `[caseId, templates]`）是**再触发**而非停止——依赖数组（`:119`）变化会重跑 effect，若 `plan` 仍为 `null` 且 `busy` 已回 `false`，就再 attach 一次；`busy` 为 `true` 时 effect 只是短路挂起，不是终止。React 的批处理不会打断该环：每轮都以 `busy=false` 的提交结束，effect 因依赖变化重新执行 |
| 手动未选 | `:122` | 「请先选择一套审核方案」 |
| 手动应用失败 | `:127-128` | 错误上屏，`busy` 复位 |

**恢复**：页面重进时一切从 Main 重读；`plan` 来自 `d2RuntimePlan`（`:71-74`），因此刷新/重启后「已就绪」状态可恢复。**不可恢复**：`notice`、`chosenId`、`error` 均为易失 state。

**错误清除范围（已证实）**：`error` 只在两处被清——`caseId` 变化的 effect（`:78` 的 `setError('')`）与 `applyChosen` 的开头（`:123` 的 `setError('')`）。`load()` 不清 `error`（`:56-75`），自动采用成功路径也不清（`:105-119`）。因此一旦自动采用失败，错误行会**持续显示**（跨 `load()` 重读、跨自动采用成功），直到切换案卷或用户手动应用一次方案；不能写成「显示到下次 load()」。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查，无直接 `ipcRenderer` 调用；全部经 preload 白名单方法。
- 权威来源：路由结论 = Main 的 B3 保守路由（`review-intake-routing-adapter-v3-b3.ts:40-113`）；「是否已采用」= Main 聚合的 `d2RuntimePlan`（本文件 `:71-74`）。
- 前端门禁：`selectionIssue` 非空不可选（`:100`、`:136`）；`canRun={!!plan}` 把「没有技术计划就不能跑」交给 `ReviewV3UnifiedRun`（`:198`）。这些是可用性约束，不是授权。
- 方案候选来自 Main 的固定 D4 目录，界面无编辑/发布入口（类型注释 `packages/shared/src/types/review-d2.ts:7`）。

## 8. 修改影响面

- **唯一挂载点**：`ContentReviewView.tsx:435-439`；props 变化需同步该处与 `quickStart` 落点。
- **依赖的上游形状**：`C11MainLocalProductRead.read.route`（`review-v3-main-local-product-intake.ts:32-38`）、`D4ClientTemplate.selectionIssue/controlledStudentFixture`（`packages/shared/src/types/review-d2.ts:8-21`）、`attachD4TechnicalPlanV3` 回执（`preload/index.ts:4829-4832`）。任一变更会破坏 `routeLabel` 或 `applyPlan`。
- **下游**：`ReviewV3UnifiedRun`（`:193-200`）的 `canRun/technicalPlan/documentCount/stage` 由本文件计算；改口径会影响运行按钮可用性。
- **测试同步**：无直接测试；`review-v3-main-d4-local-plan.test.ts` 覆盖 Main 侧 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 等错误文案，本文件通过 `humanizeReviewError` 消费这些错误（`review-error-text.ts:24-25`、`:46-50`）。
- 无存储格式/迁移。

## 9. 测试证据

- **直接测试**：无。`grep -rln "ReviewV3CaseTaskView" apps/electron/src --include=*.test.*` 无命中。
- **间接（只读断言，未运行）**：
  - `apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts:43`：`expect(route.status).toBe('default-selected')` —— 对应本文件 `:113` 的自动采用触发条件。
  - 同文件覆盖 `countdown`/`unmatched`/`needs-user-confirmation` 等分支（B3 路由测试），本文件 `routeLabel` 的文案映射**没有**断言。
  - `review-error-text.test.ts:21-28` 断言 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 去壳保原因；本文件 `:64`、`:80`、`:92`、`:117`、`:128` 使用该函数。
- **未覆盖**：`load` 的代次丢弃、倒计时定时器边界（800/20000/120）、自动采用持久失败时的反复 attach 重试环（无测试、无运行证据）、`documents` 过滤、材料/解析状态文案、`ReviewV3UnifiedRun` 传参。
- **NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为 `ReviewV3CaseTaskView`，props 三个字段 | 已证实 | `:16-21`、`:42` |
| 路由六态文案与 tone 映射 | 已证实 | `:29-40`，枚举见 B3 `:31-36` |
| 产品读取失败不阻断材料展示 | 已证实 | `:62-66` |
| 旧案响应被代次 + caseId 双核对丢弃 | 已证实 | `:52-54`、`:68` |
| 倒计时延时为 `min(max(remaining,800),20000)+120` | 已证实 | `:93` |
| `default-selected` 自动应用、不需要再点 | 已证实 | `:110-119` |
| `plan` 来自 `aggregate.d2RuntimePlan.mapping.length` | 已证实 | `:71-74` |
| 未启用（`active === false`）文档不计入 | 已证实 | `:134` |
| 自动采用成功/失败后都不清旧错误，`load()` 也不清 | 已证实 | 清除点仅 `:78`（caseId effect）与 `:123`（applyChosen 开头）；`:56-75`、`:105-119` 均无 `setError('')` |
| 自动采用遇到持久性失败会反复 attach，而非只失败一次 | 已证实（静态控制流）/未实测 | effect 依赖 `[read, plan, busy, applyPlan]`（`:119`）；失败路径 `:116-118` 只 `setError` + `finally setBusy(false)`，`plan` 仍 `null`、`read` 不变，`busy` 变化重新触发 effect；重试环的终止条件见 §6。未运行验证循环次数与实际请求量 |
| 真实 Main 在 20s 后是否把 `countdown` 推进为 `default-selected` | 未知 | 未读 B3 session 的时间推进实现；本文件只负责重读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `routeLabel` 六态 | 3.1 | `:29-40` | covered |
| `load` 并行读取与错误降级 | 3.2 | `:56-75` | covered |
| 切案清空 | 3.2 | `:77-81` | covered |
| `listD4Templates` | 3.3 | `:83-85` | covered |
| 倒计时重读 | 3.4 | `:88-95` | covered |
| `applyPlan` 两条拒绝 | 3.5 | `:97-100` | covered |
| 自动采用 | 3.5 | `:111-119` | covered |
| 手动采用 | 3.5 | `:121-132` | covered |
| 材料/状态/选择区渲染 | 3.6 | `:134-191` | covered |
| `ReviewV3UnifiedRun` 传参 | 3.6、8 | `:193-200` | covered |
| 错误展示 | 3.6 | `:202` | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | partial |
| 运行时行为 | — | — | unknown（NOT_RUN） |
