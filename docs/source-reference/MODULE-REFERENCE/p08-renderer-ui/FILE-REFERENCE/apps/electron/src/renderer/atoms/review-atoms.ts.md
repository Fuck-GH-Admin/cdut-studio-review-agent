---
path: apps/electron/src/renderer/atoms/review-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ae7a6951592e3f0e8234d1613152909c5dd98d52
sha256: 2beced7231b51177f663df5f8fde460dddee4f51332f8b8bd2885796c3cf1c45
lines: 317
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/review-atoms.ts

## 1. 结论与边界

内容审核专区的 **Jotai 状态定义**：把「界面状态」集中成 43 个 atom + 5 个类型 + 1 个纯函数（`apps/electron/src/renderer/atoms/review-atoms.ts:34-317`）。

设计约定写在文件头（`:1-7`）：案卷数据由主进程持久化，这里只保存界面状态（当前案卷、选中问题卡、联动焦点等）；`reviewFocusAtom` 是三栏联动的唯一驱动。

明确不做的事：

- **不持久化**：全部是 `atom(...)`，无 `atomWithStorage`、无 localStorage、无 IPC、无 fs（`:35-317` 无相关 import）。页面刷新即回到初值。
- **不执行业务**：没有异步 action、没有写 Main；异步编排在 `review-actions-controller.ts` / `use-review-workspace-actions.ts`。
- **不复制 Main 数据权威**：按案映射只是**缓存**（`:37-41` 注释「案卷内存缓存」），写入方是 controller。

## 2. 导出与关键符号

导出计数（逐条核 `grep -n "^export "`）：**43 个 atom + 1 个 function + 5 个 type/interface = 49**。其中 4 个 atom 是可写派生（`reviewCaseAtom`/`reviewRunAtom`/`reviewRunningAtom`/`reviewBusyAtom`），其余 39 个为只读或普通可写 atom。

### 2.1 类型（5）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewWorkspaceSection` | type | `:34` | `'home' \| 'workbench' \| 'case-task' \| 'case-v2' \| 'templates' \| 'batches' \| 'local-candidates' \| 'settings'` | 工作页枚举；本轮新增 `case-task`、`settings` |
| `ReviewCaseTasks` | interface | `:50-54` | `{outline: boolean; items: boolean; running: boolean}` | 每案任务守卫 |
| `ReviewExecutionViewState` | interface | `:56-63` | `{status: 8 态; stage?; message?; documents?; checks?; error?}` | 产品级执行视图 |
| `ReviewFocus` | interface | `:193-211` | `{findingId; ruleAnchor?; subjectAnchor?; evidenceAnchor?; counterpartAnchor?; severity; nonce}` | 三栏联动焦点 |
| `ItemCardView` | interface | `:300-306` | `{item; findings; evidences}` | 中栏卡片视图模型 |

### 2.2 函数（1）

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `findBlockByAnchor` | 导出纯函数 | `:285-297` | `(documents: SourceDocument[], anchor?: ReviewSourceAnchor) => {document; block} \| undefined` | 锚点 → 块；带降级 |

### 2.3 基础数据 atom（按案映射，普通可写）

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `reviewWorkspaceSectionAtom` | `:35` | `ReviewWorkspaceSection`，初值 `'home'` | 当前工作页 |
| `reviewCasesByIdAtom` | `:41` | `Record<string, ReviewCase>` | V1 案卷缓存（M0/H05） |
| `reviewRunStaleByCaseAtom` | `:44` | `Record<string, boolean>` | 每案运行是否过期（M0/H09） |
| `reviewRunsByCaseAtom` | `:47` | `Record<string, ReviewRun \| null>` | 每案最近运行 |
| `reviewExecutionByCaseAtom` | `:66` | `Record<string, ReviewExecutionViewState>` | 每案执行视图 |
| `reviewTasksByCaseAtom` | `:68` | `Record<string, ReviewCaseTasks>` | 每案任务守卫 |
| `selectedCaseIdAtom` | `:71` | `string \| null`，初值 `null` | 当前选中案卷 ID |
| `reviewWorkspaceAggregatesByCaseAtom` | `:74` | `Record<string, CaseAggregateV2 \| null>` | V3 聚合缓存 |
| `reviewWorkspaceRunsByCaseAtom` | `:84` | `Record<string, ReviewRunV2 \| null>` | V3 运行缓存 |
| `reviewWorkspaceExtractedObservationsByCaseAtom` | `:85` | `Record<string, Array<Record<string, unknown>>>` | 抽取观察缓存 |
| `reviewWorkspaceRunStaleByCaseAtom` | `:86` | `Record<string, boolean>` | V3 运行过期标记 |
| `reviewWorkspaceTemplatesByCaseAtom` | `:87` | `Record<string, TemplateVersion \| null>` | 每案模板版本 |
| `reviewCaseListAtom` | `:129` | `ReviewCaseSummary[]`，初值 `[]` | 案卷列表 |
| `reviewGatewayStatusAtom` | `:166` | `ReviewModelGatewayStatus \| null` | 出口自检结果 |
| `reviewFocusAtom` | `:214` | `ReviewFocus \| null` | 三栏联动焦点（唯一驱动） |
| `reviewSourceFocusAtom` | `:217` | `{ref: SourceRef; purpose: 'rule'\|'application'\|'evidence'; nonce; originPendingActionKey?} \| null` | V2 原生来源定位 |
| `reviewAdjudicationEditorSubjectAtom` | `:219` | `string \| null` | 右栏请求中栏打开编辑 |
| `selectedFindingIdAtom` | `:222` | `string \| null` | 选中问题卡 |
| `reviewAssistantOpenAtom` | `:225` | `boolean`，初值 `false` | 助手抽屉 |
| `reviewAssistantThreadsAtom` | `:228` | `Record<string, ReviewAssistantMessage[]>` | 按案对话历史 |
| `reviewAssistantPendingAtom` | `:231` | `boolean` | 助手回答中 |
| `reviewRuleLocateAtom` | `:311` | `{anchors: ReviewSourceAnchor[]; nonce: number} \| null` | 左栏规则定位 |
| `reviewErrorAtom` | `:314` | `string \| null` | 全局错误提示 |
| `reviewActivePaneAtom` | `:317` | `'left' \| 'center' \| 'right'`，初值 `'left'` | 窄屏当前栏 |

### 2.4 派生只读 atom（15）

| 符号 | 行 | 读自 | 缺省 |
| --- | --- | --- | --- |
| `reviewWorkspaceAggregateAtom` | `:75-78` | `selectedCaseIdAtom` + `reviewWorkspaceAggregatesByCaseAtom` | `null` |
| `reviewWorkspaceCaseRefAtom` | `:79-83` | 同上 | `null`；有 aggregate 时 `{workspaceCaseId, aggregateV2Id}` |
| `reviewWorkspaceTemplateAtom` | `:88-91` | 模板映射 | `null` |
| `reviewWorkspaceRunAtom` | `:92-95` | 运行映射 | `null` |
| `reviewWorkspaceRunStaleAtom` | `:96-99` | 过期映射 | `false` |
| `reviewWorkspaceExtractedObservationsAtom` | `:100-103` | 观察映射 | `[]` |
| `reviewExecutionAtom` | `:160-163` | 执行映射 | `{status:'idle'}` |
| `reviewRunStaleAtom` | `:186-189` | V1 过期映射 | `false` |
| `currentRuleOutlineAtom` | `:236-239` | `reviewCaseAtom.rulePacks[0].outline` | `[]` |
| `currentItemsAtom` | `:242-244` | `reviewCaseAtom.items` | `[]` |
| `currentEvidencesAtom` | `:247-249` | `reviewCaseAtom.evidences` | `[]` |
| `currentDocumentsAtom` | `:252-254` | `reviewCaseAtom.documents` | `[]` |
| `documentsByRoleAtom` | `:257-264` | `currentDocumentsAtom` | 三个数组 `rule/application/evidence` |
| `selectedFindingAtom` | `:267-272` | `reviewRunAtom` + `selectedFindingIdAtom` | `null` |
| `sortedFindingsAtom` | `:275-280` | `reviewRunAtom.findings` | `[]` |

### 2.5 可写派生 atom（4）

| 符号 | 行 | 读 | 写语义 |
| --- | --- | --- | --- |
| `reviewCaseAtom` | `:113-126` | `selectedCaseIdAtom` → `reviewCasesByIdAtom[id]` | 写 `null` → 清 `selectedCaseIdAtom`（`:119-122`）；写案卷 → 写缓存并按需切换选中 ID（`:123-125`） |
| `reviewRunAtom` | `:132-142` | `reviewRunsByCaseAtom[id]` | 无选中 ID 时**静默忽略**（`:139`）；否则写该案槽位（`:140`） |
| `reviewRunningAtom` | `:145-158` | `reviewTasksByCaseAtom[id].running` | 无 ID 忽略（`:152`）；否则合并 `emptyTasks()` + 原值 + `running`（`:153-156`） |
| `reviewBusyAtom` | `:169-183` | `{outline, items}` | 无 ID 忽略（`:177`）；否则合并 `outline/items`（`:178-181`） |

`emptyTasks()`（`:105-107`）返回 `{outline:false, items:false, running:false}`，是上面两处合并的基底。

## 3. 内部逻辑与关键流程

### 3.1 按案隔离的三层结构（`:37-103`）

模式统一为「`Record<caseId, T>` 基础 atom + 读 `selectedCaseIdAtom` 的派生 atom」：

1. 基础映射由 controller 按 `caseId` 写入（例如 `reviewCasesByIdAtom`，`review-actions-controller.ts:329`）。
2. 派生 atom 只读当前选中案卷（`:75-103`）。
3. 写操作若没有选中 ID 就**丢弃**而不是写到一个「全局槽」（`:139`、`:152`、`:177`），避免 A 案结果污染 B 案。

文件头注释说明了动机：异步完成 A 时即使用户已切到 B，也只更新 A 的条目（`:37-40`）；每案任务进行中标记「切走不丢守卫」（`:49`）。

### 3.2 可写派生的写入顺序（`:113-126`）

`reviewCaseAtom` 的写：

```ts
if (!next) { set(selectedCaseIdAtom, null); return }
set(reviewCasesByIdAtom, {...get(reviewCasesByIdAtom), [next.id]: next})
if (get(selectedCaseIdAtom) !== next.id) set(selectedCaseIdAtom, next.id)
```

先写缓存、再切选中（`:123-125`），因此派生读在新 ID 生效时已能读到缓存，不会出现「选中了但缓存为空」的中间态。

### 3.3 `findBlockByAnchor` 的降级（`:285-297`）

1. `anchor` 为空 → `undefined`（`:289`）。
2. 按 `anchor.documentId` 找文档；找不到 → `undefined`（`:290-291`）。
3. `anchor.blockId` 存在则按 id 找块；找到即返回 `{document, block}`（`:292-293`）。
4. **块级降级**：找不到块时退回 `document.blocks[0]`，仍返回 `{document, block}`（`:294-296`）——注释说明「仍算仅定位到此文件/页」。
5. 文档无块 → `undefined`（`:296`）。

### 3.4 排序与筛选（`:257-280`）

- `documentsByRoleAtom` 只保留 `rule`/`application`/`evidence` 三角色；`attachment` 等其它角色被丢弃（`:257-264`）。
- `sortedFindingsAtom`：`red=0, yellow=1`，其它严重度 `9`；同严重度按 `id.localeCompare` 稳定排序（`:275-280`）。

### 3.5 导出类型与运行时的关系

`ReviewExecutionViewState.status` 的 8 个值（`:57`）是 UI 展示态，不参与 Main 的 Run 状态机；`stage` 的 6 个值（`:58`）同样是展示用。真实 Run 状态以 Main 的 `ReviewRunV2.status` 为准（本文件 `:84` 只存不解释）。

## 4. 调用者与调用链

**入向：20 个文件 import `@/atoms/review-atoms`**（`grep -rln` 结果），按用途分组：

| 调用方 | 使用的符号（代表） |
| --- | --- |
| `components/content-review/ContentReviewView.tsx:36-44` | `reviewActivePaneAtom`、`reviewAssistantOpenAtom`、`reviewCaseAtom`、`reviewErrorAtom`、`reviewGatewayStatusAtom`、`reviewWorkspaceSectionAtom` |
| `components/content-review/review-actions-controller.ts:64-66` | 几乎全部按案映射 + `ReviewCaseTasks`/`ReviewExecutionViewState`/`ReviewFocus` 类型 |
| `components/content-review/use-review-actions.ts:5` | `reviewErrorAtom`、`reviewExecutionByCaseAtom`、`selectedCaseIdAtom` |
| `components/content-review/use-review-workspace-actions.ts:12` | 工作区聚合/运行/观察映射 |
| `components/content-review/LeftPanel.tsx:22`、`CenterPanel.tsx:41`、`RightPanel.tsx:22` | 三栏读取的焦点/运行/列表 atom |
| `components/content-review/AssistantDrawer.tsx:41` | `reviewAssistantOpenAtom`、`reviewAssistantThreadsAtom`、`reviewAssistantPendingAtom` |
| `components/content-review/CaseManagerBar.tsx:31` | `reviewCaseAtom`、`reviewCaseListAtom`、`reviewExecutionAtom`、`reviewWorkspaceAggregateAtom`、`reviewWorkspaceSectionAtom`、`reviewWorkspaceTemplateAtom` |
| `components/content-review/SourceBlockView.tsx:23` | `reviewCaseAtom`、`reviewFocusAtom`、`reviewRuleLocateAtom` |
| `components/content-review/ReviewV3T03FactWorkbench.tsx:8`、`ReviewV3F06EvidenceWorkbench.tsx:8` | 工作区聚合/观察/运行 |
| `components/content-review/ReviewV3SourceNavigator.tsx:6` | `reviewActivePaneAtom`、`reviewSourceFocusAtom`、`reviewWorkspaceAggregateAtom` |
| `components/content-review/ReviewV3T10WorkspaceOverview.tsx:19` | 9 个工作区 atom + section |
| `components/content-review/TemplateWizardPanel.tsx:10` | `reviewWorkspaceSectionAtom` |
| `components/content-review/ReviewV3LocalCandidateWorkbench.tsx:7` | `reviewWorkspaceSectionAtom` |
| `components/content-review/ReviewMaterialControls.tsx:8` | `reviewCaseAtom` |
| 测试 3 个 | `review-actions-controller.test.ts:26`、`review-workspace-recheck-independent.test.ts:13`、`review-workspace-write-fence.p06-fix02.test.ts:17` |

**出向**：仅 `jotai` 的 `atom`（`:9`）与 `@profer/shared` 的类型（`:10-29`）。无运行时代码依赖。

## 5. 数据 I/O、读写与副作用

- **无 IO**：不读写磁盘/网络/localStorage；无 `console`、无定时器、无监听器。
- **内存增长**：按案映射只增不减（写入模式为 `{...old, [id]: value}`，`:123`、`:140`、`:154`、`:179`），没有删除/回收逻辑。长时间多案会话会累积条目——**推断**，依据是上述写法且全文件无 `delete`/重置。
- **并发**：Jotai 的 set 是同步的；跨异步的竞态保护不在本文件，而在 controller 的代次/令牌（`review-actions-controller.ts:310-321`、`review-workspace-write-fence.p06-fix02.test.ts:76-89`）。
- **原子性**：单次 `set` 内的对象展开是原子的；没有跨 atom 事务。`reviewCaseAtom` 的两次 `set`（缓存 + 选中）不是事务，但顺序保证读一致性（见 3.2）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 无选中案卷时读派生 | `:75-103`、`:113-116`、`:132-135`、`:145-148`、`:160-162`、`:169-173`、`:186-188` | 返回各缺省值（`null`/`false`/`[]`/`{status:'idle'}`） |
| 无选中案卷时写 | `:119`、`:139`、`:152`、`:177` | `reviewCaseAtom` 写 `null` 清选中；其余三个静默忽略 |
| 锚点文档不存在 | `:290-291` | `undefined` |
| 锚点块不存在 | `:292-296` | 降级到首块 |
| 文档无块 | `:296` | `undefined` |
| 选中 finding 但无 run/ID | `:267-272` | `null` |

- **失败**：无抛错路径；所有函数对缺数据都返回缺省。
- **取消**：无异步，不适用。
- **恢复**：本文件不持久化，刷新后全部丢失；「恢复上次选中案卷」由 controller 的 `readLastSelectedCaseId()` 完成（`review-actions-controller.ts:457`），不是本文件。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role/actor 检查、无 IPC、无文件访问。
- 权威状态：本文件全部是**界面缓存**；案卷/运行/模板的权威在 Main（文件头 `:5` 明示「案卷数据由主进程持久化」）。`selectedCaseIdAtom` 只表示「界面当前看哪一案」，不代表服务端授权。

## 8. 修改影响面

- **20 个 import 方**（见第 4 节）会受符号改名/形状变化影响；其中 `review-actions-controller.ts` 写入最多映射，改动风险最高。
- **`ReviewWorkspaceSection` 加值**需同步 `ContentReviewView.tsx:228-237` 的导航表与各 `section ===` 分支；删值会让 `:248` 的 `setSection(id)` 失去目标。
- **`ReviewExecutionViewState` 加字段**需同步 `use-review-workspace-actions.ts` 与 `CaseManagerBar.tsx:340` 的 `executionLabel`。
- **`ReviewFocus` 形状**被 `SourceBlockView`/`LeftPanel`/`CenterPanel` 消费；`nonce` 语义（每次点击 +1）是重复定位的驱动（`:209-210`）。
- **`findBlockByAnchor` 降级行为**被三栏共用；改成「找不到块就返回 undefined」会改变高亮落点。
- **测试同步**：3 个测试文件直接读这些 atom 的 store 值（第 9 节）。
- 无 schema/迁移；无 IPC 名称。

## 9. 测试证据

**直接测试**：无 `review-atoms.test.ts`。三个测试**间接**读写本文件的 atom（只读断言，未运行）：

| 测试 | 行 | 真实断言（摘） |
| --- | --- | --- |
| `review-actions-controller.test.ts` | `:167` | `expect(store.get(reviewCasesByIdAtom)['case-settings']?.reviewTemplate).toEqual({templateId:'custom-review',version:3})` |
| 同上 | `:234-235` | `expect(store.get(selectedCaseIdAtom)).toBe('case-restore')`；`expect(...['case-restore']?.title).toBe('案卷-case-restore')` |
| 同上 | `:244-245` | `expect(store.get(selectedCaseIdAtom)).toBeNull()`；`expect(store.get(reviewCasesByIdAtom)['case-first']).toBeUndefined()` |
| 同上 | `:274`、`:290` | `expect(store.get(reviewRunStaleByCaseAtom)['qa-stale']).toBe(true)` 等 |
| `review-workspace-recheck-independent.test.ts` | `:78-82` | `expect(store.get(reviewWorkspaceRunsByCaseAtom)[caseId]?.id).toBe(fresh.id)`；`expect(store.get(reviewExecutionByCaseAtom)[caseId]?.status).toBe('running')` |
| `review-workspace-write-fence.p06-fix02.test.ts` | `:105-110` | 同上，验证旧读者不能覆盖新写入 |
| 同上 | `:126-127` | `expect(store.get(reviewWorkspaceRunsByCaseAtom)[caseId]).toBeUndefined()`（卸载撤销） |
| 同上 | `:190` | `expect(store.get(reviewWorkspaceExtractedObservationsByCaseAtom)[caseId]).toEqual(observations)` |

**未覆盖**：`findBlockByAnchor` 全部分支、`sortedFindingsAtom` 排序、`documentsByRoleAtom` 过滤、4 个可写派生 atom 的写入语义、无 ID 时静默忽略、所有派生 atom 的缺省值。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 49 个导出 = 43 atom + 1 function + 5 type/interface | 已证实 | `grep -n "^export "` 逐行统计 |
| 4 个可写派生 atom | 已证实 | `:113-126`、`:132-142`、`:145-158`、`:169-183` |
| 全部 atom 均为内存态，无持久化 | 已证实 | 无 `atomWithStorage`/localStorage import |
| 无选中案卷时三个可写派生静默忽略 | 已证实 | `:139`、`:152`、`:177` |
| `reviewCaseAtom` 写 `null` 会清空选中 | 已证实 | `:119-122` |
| `findBlockByAnchor` 块缺失时降级到首块 | 已证实 | `:294-296` |
| 严重度排序 red→yellow→其它，再按 id | 已证实 | `:275-280` |
| `documentsByRoleAtom` 丢弃非三角色文档 | 已证实 | `:257-264` |
| 按案映射无回收，长时间运行会累积 | 推断 | `:123`、`:140`、`:154`、`:179` 均为展开写入；无删除 |
| 20 个 import 方 | 已证实 | `grep -rln "@/atoms/review-atoms"` |
| 是否存在绕过本文件直接 `createStore` 的测试专用 atom 副本 | 未知 | 未检索所有 `atom(` 定义 |

## 11. 覆盖表

| 符号/分组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 个类型导出 | 2.1 | `:34`、`:50-63`、`:193-211`、`:300-306` | covered |
| `findBlockByAnchor` | 2.2、3.3 | `:285-297` | covered |
| 24 个基础数据 atom | 2.3 | `:35-317` | covered |
| 15 个派生只读 atom | 2.4 | `:75-280` | covered |
| 4 个可写派生 atom | 2.5、3.2 | `:113-183` | covered |
| `emptyTasks` | 2.5 | `:105-107` | covered |
| 排序/筛选 | 3.4 | `:257-280` | covered |
| 调用者 | 4 | — | covered |
| 内存增长推断 | 5 | `:123` 等 | partial（推断） |
| 测试证据 | 9 | — | partial |
| 运行时行为 | — | — | unknown（NOT_RUN） |
