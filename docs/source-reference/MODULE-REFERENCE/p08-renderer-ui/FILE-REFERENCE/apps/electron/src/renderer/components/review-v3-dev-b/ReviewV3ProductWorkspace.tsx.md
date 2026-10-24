---
path: apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3ProductWorkspace.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9042652a383aaa55acb1655fec96dd02b6a7a2a2
sha256: b9d75ee8e41bc8432ab5149292fff00f6c1ae01b9bcdb83921c7d2b44ff8a74c
lines: 503
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3ProductWorkspace.tsx

## 1. 结论与边界

R30–R32 的「审核输入与候选工作台」：把一次 C Main 读回的 `B32ProductRead` 投影成五个步骤页（1 原件 / 2 匹配 / 3 Check / 4 来源缺口 / 5 作者候选），并提供三条受控动作——重新读取、提交一条**技术观察**、请求生成第 51 套候选草稿（`apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3ProductWorkspace.tsx:85-503`）。

运行时 UI 组件，是**纯投影 + 端口编排**：本文件不 import `window.reviewAPI`（`grep -c reviewAPI` = 0），所有 Main 读写都经 props `ports` 注入；唯一直接浏览器调用是 `window.confirm`（`:392`）。

明确不做的事：

- **不签任何权威**：页脚声明 School Gold/Policy、正式 Case/Plan/Run/Decision/发布都不由此界面签发（`:499-501`）；提交技术观察后明说「未改变 UNKNOWN、Gold 或审批状态」（`:191-192`）。
- **不自己造模板/来源**：`createTemporary` 只接受 Main 返回的 B29 草稿，并逐条核对来源集合（`:217-241`）。
- **不把预览当已保存**：只有匹配的 `B32RemediationReceipt` 才允许把状态标成 `persisted`（`:178-181`、`:24-35`）。
- **不持有作者编辑器**：编辑器由 `renderAuthor` 由父级渲染，本文件只维护 `editor` 开关与 key（`:108`、`:484`）。

## 2. 导出与关键符号

`export` 逐行核过：**5 个**（4 个 interface + 1 个 function），无导出常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B32RemediationReceipt` | 导出 interface | `:18-22` | `{schemaVersion:'review-v3-b32-remediation-receipt/1'; issueId; currentSnapshot; receiptId; persisted:true; candidateOnly:true; publicationAllowed:false}` | Main 持久回执的形状；`persisted`/`candidateOnly`/`publicationAllowed` 是字面量类型 |
| `assertB32RemediationReceipt` | 导出 function | `:24-35` | `(receipt: B32RemediationReceipt\|void, issueId: string, snapshot: string) => boolean` | `undefined` → `false`；形状不符 → 抛 `B_PRODUCT_REMEDIATION_ACK_INVALID`；否则 `true` |
| `B32ProductPorts` | 导出 interface | `:36-53` | 4 个可选端口：`onReadCurrent` / `onPrepareUnmatchedDraft` / `onCreateBusinessTemplateDraft` / `onProposeRemediation` | 全部可选，缺省即「未安装」 |
| `ReviewV3ProductWorkspaceProps` | 导出 interface | `:54-61` | `{scope; caseCandidateId; route; ports; renderRoute; renderAuthor; canReadLatestAuthor?}` | `renderRoute`/`renderAuthor` 为必填渲染槽 |
| `ReviewV3ProductWorkspace` | 导出 function | `:85-503` | `(props: ReviewV3ProductWorkspaceProps) => ReactNode` | 唯一组件导出 |

内部符号（未导出）：

| 符号 | 类型 | 行 | 用途 |
| --- | --- | --- | --- |
| `Tab` | type | `:62` | `'materials'\|'routing'\|'checks'\|'sources'\|'author'` |
| `btn` / `field` | const | `:63-64` | 两套 tailwind 类名常量 |
| `visibleRole` | 内部函数 | `:65-66` | `application→申请材料`、`supporting→支撑材料`、其它→`未分配用途` |
| `kindNames` | const 映射 | `:67-73` | 5 个 `B26IssueKind` → 中文标签 |
| `repairGuidance` | const 映射 | `:74-80` | 5 个 `B26IssueKind` → 修复建议句 |
| `disabled` | const JSX | `:81-84` | 未接通时的统一提示块（`role="status"`） |

## 3. 内部逻辑与关键流程

### 3.1 初始状态与 scope 复位（`:88-125`）

23 个 `useState`（`:88-110`，每行一个）覆盖：`tab`、`read`、`busy`、`error`、`notice`、三组分页/筛选（check/material/source）、`reopenTemplateId`、`domain`、`issueKind`、`sourceQuery`、`selectedIssue`、`observation`、`localEvents`、`repairStatus`、`editor`、`confirmEditorExit`、`authorIntent`。

三个 ref：`currentScope`（每次渲染同步为 `scope`，`:114`、`:117`）、`operation`（互斥标志，`:115`）、`generation`（读取代次，`:116`）。

scope 变化时（`:118-125`）：`generation.current += 1`，随后重置 tab、read、error、notice、editor、confirmEditorExit、localEvents、selectedIssue、repairStatus、三个筛选值、三个页码。**注意**：`authorIntent`、`reopenTemplateId`、`observation` 不在复位列表内（`:120-124`）——切 scope 后作者意图表单与重开输入会保留上一 scope 的文本。

### 3.2 `fetchCurrent`（`:126-142`）

1. 端口缺失 → `setRead(null)` + `B_PRODUCT_MAIN_READ_NOT_INSTALLED`，**直接 return**（`:127`）。
2. `operation.current` 为真 → 静默 return（`:128`）。
3. 置 `operation=true`、`busy=true`、清 error/notice（`:129`），快照 `startScope` 与 `epoch`（`:130`）。
4. `await ports.onReadCurrent()`（`:132`）。
5. 代次/scope 变化 → 丢弃（`:133`）。
6. 返回的 `caseCandidateId` 与 prop 不符 → 抛 `B_PRODUCT_READ_DIFFERENT_CASE`（`:134-135`）。
7. `buildB32ProductView(result)` 先做全量校验（`:136`，实现见 `review-v3-product-workflow.ts:73-186`），通过后才 `setRead`、三个页码归零、写提示（`:137-138`）。
8. 失败：若 scope 未变则 `setRead(null)` 并 `setError(message)`（`:139-141`）；`finally` 复位 `operation`，scope 未变才 `setBusy(false)`（`:141`）。

挂载 effect 依赖 `[scope, ports.onReadCurrent]`（`:143`）。**契约含义**：父级必须传稳定身份的 `onReadCurrent`，否则每次渲染都会重新发起一次 Main 读。当前唯一真实父级传的是 `useCallback([localCaseId])` 的 `readProduct`（`ReviewV3LocalCandidateWorkbench.tsx:65-73`、`:413`），在 `localCaseId` 不变时稳定。

### 3.3 视图派生（`:144-158`）

- `view` 在渲染期重建，异常吞掉后置 `null`（`:144-146`）；`connected = view?.mainConnected === true`（`:147`）。
- `filteredChecks → checks`（分页 25/页，`:148-149`）；`materialRows → visibleMaterials`（同样 25/页，`:150-152`）。
- `issueList` 用 `pageB32Issues(read?.historical ?? null, sourcePage*25, 25, {domain, kind, query})`（`:153-156`）。
- `issue` 先在当前页找，找不到再回退到**全量** `read.historical.issues`（`:157-158`）——所以被筛掉的待办仍可继续编辑，界面在 `:405-406` 给出「正在编辑的待办不在当前筛选页」提示。

### 3.4 `recordRepair`（`:159-198`）——技术观察提交

前置守卫（`:160-163`）：`read`、`connected`、`onReadCurrent`、`onProposeRemediation`、`issue`、非空 `observation`、`operation` 均需满足，否则 `B_PRODUCT_REPAIR_PORT_OR_HUMAN_EVIDENCE_REQUIRED`。

执行序列：

1. `repairStatus='awaiting-main'`（`:164`）。
2. `before = await onReadCurrent()`（`:168`）；代次校验（`:169`）。
3. `assertB32StillCurrent(read, before)`（`:170`）——前后两次读必须一致（`review-v3-product-workflow.ts:227-243`）。
4. `before.historical` 中必须仍有该 issue，否则 `B_PRODUCT_ISSUE_NO_LONGER_CURRENT`（`:171-172`）。
5. `proposalSent = true`，调 `onProposeRemediation({issueId, currentSnapshot: before.historical.snapshotSha256, observation, candidateOnly:true, businessWriteAllowed:false})`（`:173-177`）。
6. `assertB32RemediationReceipt(receipt, issue.id, before.historical.snapshotSha256)`（`:178`）；`undefined` 视为**未持久**而不是错误（`:27`）。
7. 代次校验后写 `repairStatus = persisted ? 'persisted' : 'unconfirmed'`（`:180-181`）。
8. 再读一次 `after`，重建视图并 `setRead(after)`；持久化成功才清空 `observation`（`:183-186`）。
9. `localEvents` 前插一条回执文案，**截断到 50 条**（`:187-190`）。
10. `notice` 按 persisted 二选一（`:191-192`）。

失败分支（`:193-197`）：`repairStatus` 按 `confirmedPersisted ? 'persisted' : proposalSent ? 'unconfirmed' : 'unsubmitted'` 回退；若已持久但重读失败，额外提示「Main 已返回持久回执；但重新读取当前来源失败，请手动刷新」（`:195`），然后照常 `setError`。

### 3.5 `createTemporary`（`:199-250`）——第 51 套草稿

守卫：`read`、`connected`、`view.availableForHumanAuthor`、`onPrepareUnmatchedDraft`、`onReadCurrent`、`operation`（`:200-203`），否则 `B_PRODUCT_R29_MAIN_OR_SOURCE_NOT_READY`。

1. 组 `intent = {...authorIntent, userConfirmedAuthoring:true}`（`:204`）。
2. 先读 `fresh` 并 `assertB32StillCurrent(read, fresh)`（`:208-210`）；`fresh.route.status !== 'unmatched'` → `B_PRODUCT_MATCH_STATE_CHANGED`（`:211`）。
3. `onPrepareUnmatchedDraft(intent)`（`:212`）。
4. 再读 `again`，`assertB32StillCurrent(fresh, again)`（`:214-216`）。
5. **B29 回执白名单校验**（`:217-225`）：schema 版本、`caseCandidateId`、`ownerId`/`ownerGeneration` 与最新读一致、`publicationAllowed===false`、`businessWriteAllowed===false`、`planCondition==='unknown'`、`document.status==='candidate-held'`、`descriptor.publicationAllowed===false`；任一不符 → `B_PRODUCT_R29_DRAFT_UNTRUSTED`。
6. **来源集合完整性校验**（`:229-241`）：候选 `sourceCandidates` 必须与 `again.inventory.sources` 一一对应（数量相等、`rawSha256`/`documentVersionId`/`role` 全等），`subjectId` 必须等于首个来源的 subject，`document.sources.length` 相等，`descriptor.bindingDetails` 每项 `applicability==='unknown'` 且 `sourceIds.length` 等于全量来源数；否则 `B_PRODUCT_R29_SOURCE_SET_INCOMPLETE_OR_CHANGED`。
7. 通过后 `setRead(again)`、`setConfirmEditorExit(false)`、`setEditor({key: candidate.snapshotSha256, document: candidate.document})`、切到 `author` 页、写提示（`:242-246`）。

### 3.6 三个编辑器入口（`:251-266`）

| 入口 | 行 | 行为 |
| --- | --- | --- |
| `openBlankAuthor` | `:251-256` | 已有 `editor` → 切到 author 页并抛 `B_PRODUCT_ACTIVE_AUTHOR_MUST_SAVE_OR_BACKUP_BEFORE_SWITCH`；否则 `editor={key:'unbound-'+scope, document:undefined}` |
| `openAuthor` | `:257-266` | 已有 `editor` → 同上拒绝；若 `route.status==='unmatched' && connected` 则 `setEditor(null)` + 切 author（展示意图表单），否则 `editor={key:'manual-'+scope, document:undefined}` |
| 重开查询按钮 | `:455-464` | 需 `canReadLatestAuthor` 且 `editor===null`；调 `prepareB33PristineReopenLookup(reopenTemplateId)` 生成**空白查询用**文档，`editor={key:'reopen-'+id, document:blank}`，提示「不自动恢复」 |

`prepareB33PristineReopenLookup` 会校验 templateId 正则 `^[A-Za-z][A-Za-z0-9._-]{0,79}$` 且非 `.`/`..`，并要求结果通过 `isB1PristineReopenLookup(query,0,null,blank)`（`review-v3-b33-author-reopen.ts:6-14`）。

### 3.7 渲染结构（`:267-502`）

- 头部：标题、三步免责说明、会话行（`caseCandidateId` / B30 接通状态 / B1 修订读取状态 / `readVersion`）（`:269-272`）。
- 步骤导航 5 个按钮 + 「重新读取当前材料与审核来源」（`:273-282`）。
- 全局 `busy`/`error`/`notice` 三行（`:284-286`）；`!connected` 时渲染 `disabled` 提示块（`:287`）。
- 5 个面板用 `hidden={tab!=='x'}` 切换（`:288`、`:322`、`:325`、`:367`、`:423`）——**全部保持挂载**，只隐藏。
- 页脚免责（`:499-501`）。

各面板要点：

| 面板 | 行 | 内容 |
| --- | --- | --- |
| 1 原件 | `:288-321` | 总数/申请/ZIP/未分配计数、检索框、用途筛选、警告列表、25 条/页卡片（含 SHA、Subject、版本、`reviewReason`）、「按原件 SHA 查找引用它的 Check」跳转（`:309-311`）、空态两句（`:319-320`） |
| 2 匹配 | `:322-324` | 直接 `renderRoute(openAuthor, read?.route ?? route)`——用**本文件读到的** route，回退到 prop |
| 3 Check | `:325-366` | readiness 优先事项（最多 20 条 + 剩余数提示，`:327-332`）、当前 Check 统计（`:333`）、检索 + 只看 UNKNOWN（`:334-341`）、每行展示 Target/Object/Subject 与逐来源明细（版本/解析/块/定位/字节 SHA），两个跳转按钮（`:351-357`）、分页（`:361-365`） |
| 4 来源缺口 | `:367-422` | 5 类缺口计数（`:371-373`）、三筛选（检索/领域 G01–G08/缺口类型）、分页、待办按钮（切换时若已有未提交观察会 `window.confirm`，`:391-393`）、修复任务卡（`:404-417`）、本次会话回执列表（`:418-421`） |
| 5 作者候选 | `:423-498` | 意图表单 7 个字段（`:427-435`）+「确认生成待审核临时模板」（`:436-438`）、空白候选入口（`:443-448`）、重开查询（`:449-467`）、编辑器容器与退出确认（`:468-497`） |

## 4. 调用者与调用链

**入向（唯一调用方）**

- `apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx:202-211`：`props.product` 存在时直接返回 `<ReviewV3ProductWorkspace ... />`，并传 `key={scope}`、`scope`、`caseCandidateId`、`canReadLatestAuthor={Boolean(props.author.onReadLatestCandidate)}`、`route`、`ports`，以及两个渲染槽（`renderRoute` 包 `ReviewV3RouteReviewPanel`，`renderAuthor` 包 `ReviewV3AuthorWizard`，`initialRevision={0}`）。
- 该 Surface 的真实挂载点：`apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx:384-427`（`product` 非空时）。

**出向（全部经 ports，无直接 IPC）**

| 端口 | 本文件调用点 | 真实实现（父级注入） | 最终 IPC |
| --- | --- | --- | --- |
| `onReadCurrent` | `:132`、`:168`、`:183`、`:208`、`:214` | `readProduct`（`ReviewV3LocalCandidateWorkbench.tsx:65-73`） | `window.reviewAPI.readLocalNativeProductV3(caseId)`（`preload/index.ts:4838`） |
| `onPrepareUnmatchedDraft` | `:212` | `ReviewV3LocalCandidateWorkbench.tsx:414-416` | `prepareLocalNativeUnmatchedV3`（`preload/index.ts:4844`） |
| `onCreateBusinessTemplateDraft` | `:478` | `ReviewV3LocalCandidateWorkbench.tsx:418-425` | `createFallbackTemplateDraft`（`preload/index.ts:4923`） |
| `onProposeRemediation` | `:174` | **未注入**（见下） | 无 |

**实际接线缺口（已证实）**：`ReviewV3LocalCandidateWorkbench.tsx:412-426` 传入的 `product` 对象只有 `onReadCurrent`、`onPrepareUnmatchedDraft`、`onCreateBusinessTemplateDraft` 三个键，**没有 `onProposeRemediation`**。因此当前应用里：

- 提交按钮恒为 `disabled`（`:413` 条件含 `!ports.onProposeRemediation`）；
- 即使被程序化触发，`recordRepair` 也会在 `:160-163` 以 `B_PRODUCT_REPAIR_PORT_OR_HUMAN_EVIDENCE_REQUIRED` 提前返回；
- 界面会显示「人工修复持久化接口未安装；本界面不会虚构处理历史。」（`:416`）。

即「技术观察持久化」这条链路在当前冻结版本中**只有 UI 与校验逻辑，没有 Main 端口**。

**依赖的纯函数模块**

`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-product-workflow.ts`：`buildB32ProductView`（`:73-186`）、`filterB32Materials`（`:188-195`）、`filterB32Checks`（`:196-205`）、`pageB32Checks`（`:206-212`）、`pageB32Issues`（`:213-226`）、`assertB32StillCurrent`（`:227-243`）。

## 5. 数据 I/O、读写与副作用

- **输入**：`scope`、`caseCandidateId`、`route`、`ports`、两个渲染槽、`canReadLatestAuthor`。
- **读**：只经 `ports.onReadCurrent`；返回 `B32ProductRead`（`review-v3-product-workflow.ts:17-33`），其中 `inventory`/`candidate`/`readiness`/`recovery`/`historical` 可为 `null`。
- **写**：`onProposeRemediation`（当前未接线）、`onCreateBusinessTemplateDraft`（`:478`，只在 `editor.document` 存在且端口存在时出现）。**本文件不写磁盘、不写 localStorage、不写 atom**（无 jotai import）。
- **副作用**：`window.confirm`（`:392`）；`Date.now().toString(36)` 参与 fallback templateId（`:478`）；`localEvents` 只存内存且上限 50（`:190`）。
- **并发**：`operation` ref 做互斥（`:128`、`:161`、`:201`）；`generation` + `currentScope` 做代次/作用域双校验（`:133`、`:169`、`:180`、`:184`、`:209`、`:213`、`:215`）。
- **幂等**：`fetchCurrent` 幂等（纯读）；`recordRepair` 不幂等（每次提交都产生一条观察，除非端口侧去重）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 端口未安装 | `:127` | `B_PRODUCT_MAIN_READ_NOT_INSTALLED`，read 置空 |
| 读回案卷不符 | `:134-135` | `B_PRODUCT_READ_DIFFERENT_CASE` |
| 读回结构非法 | `:136` | `buildB32ProductView` 抛 `B_PRODUCT_*`（`INVALID_READ`/`CURRENT_MATERIAL_UNIVERSE_INVALID`/`CANDIDATE_SCOPE_STALE`/`READINESS_STALE`/`HISTORICAL_GAPS_DRIFTED` 等，见 `review-v3-product-workflow.ts:74-173`） |
| scope/代次变化 | `:133`、`:169`、`:180`、`:184`、`:209`、`:213`、`:215` | 丢弃结果，不改 state |
| 提交观察前置不足 | `:160-163` | `B_PRODUCT_REPAIR_PORT_OR_HUMAN_EVIDENCE_REQUIRED` |
| 待办已消失 | `:171-172` | `B_PRODUCT_ISSUE_NO_LONGER_CURRENT` |
| 回执不符 | `:178` → `:28-33` | `B_PRODUCT_REMEDIATION_ACK_INVALID` |
| 回执为 `undefined` | `:178` | 返回 `false` → 状态 `unconfirmed`，不抛错 |
| 提交后重读失败 | `:195` | 保留 `persisted` 状态并提示需手动刷新 |
| 生成草稿前置不足 | `:200-203` | `B_PRODUCT_R29_MAIN_OR_SOURCE_NOT_READY` |
| 路由已非 unmatched | `:211` | `B_PRODUCT_MATCH_STATE_CHANGED` |
| B29 回执不可信 | `:217-225` | `B_PRODUCT_R29_DRAFT_UNTRUSTED` |
| 来源集合不全 | `:229-241` | `B_PRODUCT_R29_SOURCE_SET_INCOMPLETE_OR_CHANGED` |
| 已有编辑器时切候选 | `:252`、`:258` | `B_PRODUCT_ACTIVE_AUTHOR_MUST_SAVE_OR_BACKUP_BEFORE_SWITCH` |
| 重开 ID 非法 | `:459` → `review-v3-b33-author-reopen.ts:8-10` | `B_R33_AUTHOR_REOPEN_TEMPLATE_ID_INVALID` |
| 退出编辑器 | `:485-496` | 二次确认后 `setEditor(null)`，提示未保存修改不再保留 |

**恢复**：`read` 不持久化，重进页面必须重新 `fetchCurrent`；`editor` 内的文档由父级 AuthorWizard 持有，本文件只在 key 变化时重建容器（`:484`）。**不可恢复**：`localEvents`、`repairStatus`、筛选与页码全部为易失 state。

**状态机（`repairStatus`）**：`unsubmitted → awaiting-main → persisted | unconfirmed`，失败时按已发送/已持久回退（`:164`、`:181`、`:194`）。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查、无 IPC 调用，依据：全文件无 `ipcRenderer`、无 `assertC0*`、`reviewAPI` 计数为 0。
- 权威状态由 Main 产生：读回的 `candidateOnly`/`publicationAllowed`/`businessWriteAllowed`/`schoolPolicyVerified` 由 `buildB32ProductView` 强制校验为 `true/false/false/false`（`review-v3-product-workflow.ts:74-78`），不满足即整体拒绝。
- 前端只做**可用性**约束：`connected`、`view.availableForHumanAuthor`、端口是否存在、`observation` 非空、`operation` 互斥（`:160-163`、`:200-203`、`:413`、`:437`）。这些不是授权。
- 「技术观察」即使成功也只写候选观察，界面明确不改变 UNKNOWN/Gold/审批（`:191-192`、`:415`）。

## 8. 修改影响面

- **唯一调用方** `ReviewV3CandidateIntakeSurface.tsx:202-211`：改 props 形状必须同步该处；该处又由 `ReviewV3LocalCandidateWorkbench.tsx:384-427` 供 `product` 端口。
- **`B32ProductPorts` 增删键**：`onProposeRemediation` 一旦接线，需要 Main 侧新增持久化命令（当前不存在），并同步 `Workbench` 的 `product` 对象与 `FINDINGS`/测试。
- **`assertB32RemediationReceipt`**：被 `recordRepair` 唯一调用；放宽字面量校验会让未持久回执被当成已保存。
- **`review-v3-product-workflow.ts`**：`buildB32ProductView` 是唯一校验入口，任何字段/常量（4163/34/50）变化都会让本文件整体显示 `disabled` 块或 `error`；`assertB32StillCurrent` 被本文件 3 处调用（`:170`、`:210`、`:216`）。
- **类型耦合**：`B30SourceInventory`（`review-v3-b30-current-materials-read.ts:11-27`）、`B20CurrentCandidateRead`（`review-v3-b1-b2-main-read-bundle-v3-b.ts:65-84`）、`B27Readiness`（`review-v3-b-candidate-readiness-workbench.ts:26-36`）、`B26Workbench/B26Issue`（`review-v3-b4-bulk-evidence-workbench.ts:54-71`）、`B23RecoveryPreflight`（`review-v3-b1-b2-recovery-preflight-v3-b.ts:71-81`）。这些是 Main 的读契约，改字段会同时打断本文件与 workflow 校验。
- **测试同步**：无直接测试（见第 9 节），改动需新增 UI 或纯函数测试。
- 无存储格式、无迁移、无版本号。

## 9. 测试证据

**直接测试**：无。在冻结树全量检索 `--include=*.test.ts --include=*.test.tsx --include=*.test.mjs`，`ReviewV3ProductWorkspace`、`buildB32ProductView`、`assertB32StillCurrent` 命中数均为 **0**；`B_PRODUCT_` 错误码在测试中同样 0 命中。

**间接证据**：无测试导入 `review-v3-product-workflow.ts`（`grep -rl review-v3-product-workflow --include=*.test.*` = 0）。

**未覆盖**：`assertB32RemediationReceipt` 的全部 7 个校验分支、`recordRepair` 状态机、`createTemporary` 的来源集合校验（6 类失败码）、`fetchCurrent` 的代次丢弃、三个编辑器入口的互斥、分页与筛选边界。

**NOT_RUN**：本轮未执行任何测试/构建/typecheck/GUI；以上仅为静态阅读。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一组件导出，5 个 export（4 interface + 1 function） | 已证实 | `grep -n "^export"`：`:18`、`:24`、`:36`、`:54`、`:85` |
| 本文件不直接调用 `window.reviewAPI` | 已证实 | `grep -c reviewAPI` = 0；唯一 `window.` 为 `:392` 的 `confirm` |
| 唯一调用方是 `ReviewV3CandidateIntakeSurface` | 已证实 | `ReviewV3CandidateIntakeSurface.tsx:12`、`:202`；全树 grep 无其它引用 |
| 当前 `product` 端口缺 `onProposeRemediation` | 已证实 | `ReviewV3LocalCandidateWorkbench.tsx:412-426` 只列三个键；`:413` 按钮禁用条件；`:416` 提示 |
| 读回结构由 `buildB32ProductView` 强制 fail-closed | 已证实 | `:136`、`:145`；`review-v3-product-workflow.ts:74-186` |
| 提交后重读失败仍保留 `persisted` | 已证实 | `:194-196` |
| `localEvents` 上限 50 | 已证实 | `:190` 的 `.slice(0,50)` |
| 切 scope 不清 `authorIntent`/`reopenTemplateId`/`observation` | 已证实 | `:120-124` 的复位清单不含这三项 |
| 历史缺口守卫只校验 4163/34/50，不校验 `checks=3875` | 已证实 | `review-v3-product-workflow.ts:167-173`；`checks:3875` 见 `review-v3-b4-bulk-evidence-workbench.ts:65` |
| 父级 `onReadCurrent` 身份不稳会导致每次渲染重读 | 推断 | `:143` 依赖数组；当前父级用 `useCallback`（`ReviewV3LocalCandidateWorkbench.tsx:65`、`:413`），未见不稳定注入 |
| `onProposeRemediation` 未来接线的 Main 命令形状 | 未知 | 全树无该端口的实现；`B32RemediationReceipt` 只在测试/本文件出现 |
| 真实 Main 是否总能返回 `HISTORICAL_GAPS_DRIFTED` 允许的常量 | 未知 | 未读 `buildB26HistoricalEvidenceWorkbench` 的实际输入来源 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B32RemediationReceipt` | 2 | `:18-22` | covered |
| `assertB32RemediationReceipt` | 2、6 | `:24-35` | covered |
| `B32ProductPorts` | 2、4、8 | `:36-53` | covered |
| `ReviewV3ProductWorkspaceProps` | 2 | `:54-61` | covered |
| 内部常量/映射 | 2 | `:62-84` | covered |
| scope 复位 | 3.1 | `:118-125` | covered |
| `fetchCurrent` | 3.2 | `:126-142` | covered |
| 视图派生与分页 | 3.3 | `:144-158` | covered |
| `recordRepair` | 3.4、6 | `:159-198` | covered |
| `createTemporary` | 3.5 | `:199-250` | covered |
| 三个编辑器入口 | 3.6 | `:251-266`、`:455-464` | covered |
| 渲染结构五面板 | 3.7 | `:267-502` | covered |
| 端口接线缺口 | 4 | `ReviewV3LocalCandidateWorkbench.tsx:412-426` | covered |
| 权限与权威 | 7 | — | covered |
| 修改影响 | 8 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| 运行期行为 | — | — | unknown（NOT_RUN） |
