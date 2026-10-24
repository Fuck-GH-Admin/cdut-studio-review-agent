---
path: apps/electron/src/main/lib/review/review-c0-authority.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66d0beb971261952c555dfc2ed8c6994d8fcf041
sha256: 5e4d347efe908cc2478bfc656a20454b78e391537b9ca4cdda9543b8d0f4d7e2
lines: 113
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-c0-authority.ts

## 1. 结论与边界

C0 契约的 **Main 侧命令授权绑定层**：把不可信的 IPC 载荷绑定成 `AuthorizedCaseCommand`——校验主窗口/主帧来源、拒绝 Renderer 伪造 actor、派生 Main 签发的本地 `Principal`、校验 requestId/revision/payloadHash 形状，最后过共享授权断言 `assertC0CaseAuthorization`（`review-c0-authority.ts:59-93`）。头注明确：主窗口只是传输出处，**不是**教师/学校凭据（:1）。

边界：不写盘、不执行业务（产物是命令对象）；不做模板/字段业务校验；`Principal` 只签发 `local-reviewer`（教师/校方身份需外部授权，`review-principal-service.ts:80-90` 同一原则）。

## 2. 导出与关键符号

导出 4 个函数（无类型/常量导出）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `assertC0ReviewMainSender` | fn | 21 | `(event: IpcMainInvokeEvent) => void` | 主窗口 + 主帧双重来源校验 |
| `deriveC0LocalPrincipal` | fn | 29 | `(event, caseId, action) => Principal` | 派生本地 reviewer Principal |
| `bindC0LocalCaseCommand` | fn | 59 | `<T>(event, caseId, action, unknownIntent) => AuthorizedCaseCommand<T>` | 五类写命令的统一绑定入口 |
| `bindC0LocalCreateIntent` | fn | 96 | `(event, input) => AuthorizedCaseCommand<unknown>` | 旧建案入口适配（隐式 revision=0） |

关键内部符号：`COMMAND_TYPE`（:12-18，`C0CaseAction → 命令 type 字符串`：`CREATE_CASE_V2→CreateCaseFromTemplate`、`UPDATE_FIELDS_V2→UpdateFields`、`UPSERT_CASE_SUBJECT_V2→UpsertCaseSubject`、`CORRECT_OBSERVATION_V2→CorrectObservation`、`SET_EVIDENCE_LINK_V2→SetEvidenceLink`）、`assertRendererActorIsLegacyLocal`（:46-56）。

## 3. 内部逻辑与关键流程

1. **`assertC0ReviewMainSender`**（:21-27）：`assertMainWindowSender(event, getMainWindow)`（`ipc-sender-guard.ts:30-34`：sender 必须是存活主窗口的 webContents，`ipc-sender-guard.ts:22-27`）失败 → `C0ContractError('SENDER_UNTRUSTED','Not the live main window')`（:22-23）；再要求 `event.senderFrame && event.senderFrame === event.sender.mainFrame`（主帧），否则 `SENDER_UNTRUSTED 'Main frame required'`（:24-26）。
2. **`deriveC0LocalPrincipal`**（:29-44）：`assertSafeReviewStorageId(caseId)` + `assertC0ReviewMainSender` 后返回固定形状：`principalId:'local-reviewer'`、`source:'local'`、`role:'reviewer'`、`sessionId:'local-main-webcontents:'+event.sender.id`、`assurance:'local-device'`、`scope:{caseIds:[caseId], actions:[action]}`（:36-43）——身份派生**只**来自 Main 侧（event.sender.id），无任何 Renderer 输入。
3. **`assertRendererActorIsLegacyLocal`**（:46-56）：intent 自带 `actor` 属性时：非对象/数组 → `ACTOR_UNTRUSTED 'Renderer Actor is not a credential'`（:49-51）；`actorSource!=='local' || role!=='reviewer'` → `ACTOR_UNTRUSTED 'School/teacher/system Actor must not come from Renderer'`（:53-55）。没有 `actor` 属性直接放行（:47）。**claimed actorId 从不采信**（注释 :58；绑定结果不含该值）。
4. **`bindC0LocalCaseCommand`**（:59-93），逐序：
   - 派生 Principal（:65）→ intent 必须是非数组对象，否则 `CONTRACT_INVALID 'Missing case command'`（:66-68）。
   - actor 声明检查（:70）→ 嵌套 `caseId` 与路由 caseId 不一致 → `CASE_SCOPE_FORBIDDEN 'Nested caseId mismatch'`（:71-73）。
   - `requestId` 须非空串、`expectedRevision` 须安全非负整数、`payload` 须已定义，缺一 → `CONTRACT_INVALID 'Missing request/revision/payload'`（:74-79）。
   - 计算 `hash = sha256(`${COMMAND_TYPE[action]}|${JSON.stringify(intent.payload)}`)`（:80-82；与 `case-store-v2.payloadHash` 同构，`case-store-v2.ts:188`）；intent 自带 `payloadHash` 且不匹配 → `CONTRACT_INVALID 'Payload hash mismatch'`（:83-85）。
   - 组装 `AuthorizedCaseCommand`（schemaVersion=`REVIEW_C0_SCHEMA_VERSION`（`packages/shared/src/types/review-v3-c0.ts:17`）、`expectedRevision: Number(revision)`、`principal`，:86-90）→ `assertC0CaseAuthorization(command, action)`（:91；实现 `review-v3-c0.ts:163-185`：schema/字段完整性、principal 形状、`scope.caseIds/actions` 包含本命令、`local+local-device+reviewer` 直接放行、school 无 `verified-school` → `BLOCKED_AUTH`、其余 → `ROLE_FORBIDDEN`）→ 返回命令。
5. **`bindC0LocalCreateIntent`**（:96-113）：`caseId` 安全校验（:100-101）；`expectedRevision` 若给必须为 0，否则 `REVISION_CONFLICT 'New case starts at revision 0'`（:102-104）；`requestId` 若给必须等于 `create-${caseId}`，否则 `CONTRACT_INVALID 'Legacy CreateCaseV2 requestId must be deterministic'`（:105-107）；再以合成 intent `{requestId:'create-'+caseId, expectedRevision:0, payload, actor?}` 走 `bindC0LocalCaseCommand(event, caseId, 'CREATE_CASE_V2', …)`（:108-112），`actor` 仅在 input 自带该属性时透传（:111，供 :70 检查）。

## 4. 调用者与调用链

入向（全树 grep）：
- `review-ipc.ts:2` 导入三个绑定/校验函数。调用点：`CREATE_CASE_V2` handler `bindC0LocalCreateIntent`（:647）；`UPDATE_FIELDS_V2`（:657）、`UPSERT_CASE_SUBJECT_V2`（:717）、`CORRECT_OBSERVATION_V2`（:722）、`SET_EVIDENCE_LINK_V2`（:727）四个 handler 的 `bindC0LocalCaseCommand`——即「四个真实 Main IPC 写入口」（另加建案共五个，注释 :58「all four real Main IPC writes」指绑定函数服务的四类字段/事实写）。
- `assertC0ReviewMainSender` 是全 review IPC 的高频来源守卫：`review-ipc.ts` 约 60 处（如 :159/:196/:732/:908 `authorizeAtCommit`/:1343 `DELETE_CASE`/:1382），以及 `review-v3-main-author-plan-ipc.ts:224`、`review-v3-main-local-author-workbench.ts:22`、`review-v3-main-b1-local-plan.ts:21/:122/:128`、`review-v3-main-d4-local-plan.ts:78/:84/:118/:127`、`review-v3-main-local-product-intake.ts:58/:315`。
- `deriveC0LocalPrincipal` **无外部调用者**（全树检索仅 `review-c0-authority.ts:65` 内部调用；导出未被消费）。
- 测试侧无直接单测；`review-c0-ipc.test.ts` 经 `registerReviewIpc` 的 handler 间接覆盖（:60/:64 断言 `ACTOR_UNTRUSTED`、:137 `CASE_SCOPE_FORBIDDEN`、:140/:143 `SENDER_UNTRUSTED`）。

出向：`../ipc-sender-guard assertMainWindowSender`（:8）、`../main-window-state getMainWindow`（:9）、`./review-storage-id assertSafeReviewStorageId`（:10）、`@profer/shared` 的 `REVIEW_C0_SCHEMA_VERSION/C0ContractError/assertC0CaseAuthorization`（:4-7；实现 `review-v3-c0.ts:17/:149-158/:163-185`）、`node:crypto createHash`（:3）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/缓存读写；纯内存校验与对象组装。唯一外部状态读取是 `getMainWindow()`（主窗口注册表，`main-window-state.ts:5-7`）与 `event` 元数据。无日志、无遥测。

## 6. 分支、失败、取消与恢复

全部失败分支为 throw `C0ContractError(code, message)`（消息前缀为 code，`review-v3-c0.ts:149-153`）：

| 分支 | code | 行 |
| --- | --- | --- |
| 非主窗口/已销毁 | `SENDER_UNTRUSTED` | 22-23 |
| 子帧调用 | `SENDER_UNTRUSTED` | 24-26 |
| intent 非对象 | `CONTRACT_INVALID` | 66-68 |
| actor 非对象/伪造来源/伪造角色 | `ACTOR_UNTRUSTED` | 49-51 / 53-55 |
| 嵌套 caseId 不一致 | `CASE_SCOPE_FORBIDDEN` | 71-73 |
| 缺 requestId/revision/payload | `CONTRACT_INVALID` | 76-79 |
| payloadHash 不匹配 | `CONTRACT_INVALID` | 83-85 |
| 建案 revision≠0 | `REVISION_CONFLICT` | 102-104 |
| 建案 requestId 非确定式 | `CONTRACT_INVALID` | 105-107 |
| 共享授权失败（scope/role） | `CONTRACT_INVALID`/`ACTOR_UNTRUSTED`/`CASE_SCOPE_FORBIDDEN`/`BLOCKED_AUTH`/`ROLE_FORBIDDEN` | 91 → `review-v3-c0.ts:164-185` |

无状态残留（绑定失败不留任何写入）；无取消/重试概念。

## 7. 权限与权威状态

- **逐入口守卫事实**：本模块两个入口各自先校验来源（`deriveC0LocalPrincipal:35`、`bindC0LocalCaseCommand:65` 经它），不借邻近 handler 的检查；`bindC0LocalCreateIntent` 复用同一绑定函数（:108）。
- 身份权威：`Principal` 由 Main 签发（`local-reviewer`、`local-device`），Renderer 只允许**声明** local/reviewer 占位（:46-56），其 actorId 被忽略（:58）；与 `review-ipc-actor-guard.ts:46-53`（`bindLocalReviewerCommand` 覆盖 actor 为 `LOCAL_REVIEWER_ACTOR`）是同一原则的两套实现（旧 V2 通道 vs C0 通道）。
- 授权权威：`assertC0CaseAuthorization`（`review-v3-c0.ts:163-185`）是唯一放行判据——`local/local-device/reviewer` 组合放行；`school` 来源必须 `verified-school`（当前无签发方 → `BLOCKED_AUTH`）；教师/校方/系统角色一律 `ROLE_FORBIDDEN`。
- 写入时能力仍在的保证：handler 可把 `assertC0ReviewMainSender` 作为 `authorizeAtCommit` 传入 `createAggregate`（`review-ipc.ts:908`、`case-store-v2.ts:277-278`）。

## 8. 修改影响面

- 改绑定规则影响 `review-ipc.ts` 五个写通道（CREATE_CASE_V2/UPDATE_FIELDS_V2/UPSERT_CASE_SUBJECT_V2/CORRECT_OBSERVATION_V2/SET_EVIDENCE_LINK_V2）与 `review-c0-case-service.ts` 的入参形状。
- `COMMAND_TYPE`/hash 公式必须与 `case-store-v2.payloadHash`（:188）及各业务 `submitCommand` 的 `type` 保持一致，否则幂等键失配（`review-c0-case-service.ts:28` 也独立复算同一 hash）。
- `assertC0ReviewMainSender` 被 5 个 review-v3-main-* 模块复用，改动其语义影响面广（§4 列出）。
- 无直接测试文件；修改后须经 `review-c0-ipc.test.ts`（及 `review-ipc-legacy-sender.test.ts`）间接验证，建议补直接单测（见 §9 缺口）。

## 9. 测试证据

**无直接测试文件**（全树检索 `review-c0-authority` 无 `.test.ts` import；否定范围：baseline/source 全树 `.ts/.tsx`）。间接证据：
- `review-c0-ipc.test.ts`（3 用例，经 `registerReviewIpc` handler 全链路）：`:32-66` 四个伪造 school/teacher 命令 + 本地 teacher 角色伪造全部 `toThrow('ACTOR_UNTRUSTED')` 且聚合 JSON 前后不变（:65）；`:68-105` 合法建案（`one.receipt.actor` 被绑定为 `{actorSource:'local', actorId:'local-reviewer'}` :82）、幂等重放、载荷变更碰撞、模板版本变更也判 `REQUEST_ID_COLLISION`（:87-95）、并发建案两 ok 且回执 1 条（:98-104）；`:107-146` 合法三写 + 重复请求幂等（revision 停 1，:117）+ 过期 CAS `VERSION_CONFLICT`（:133-135）+ 嵌套 caseId `CASE_SCOPE_FORBIDDEN`（:136-137）+ 子帧/异 sender `SENDER_UNTRUSTED`（:138-143）+ 拒绝后快照不变、回执 3 条（:144-145）。
  - 夹具边界：handler 经 `globalThis.__proferElectronTestHooks.ipcMainHandlers`（`test/preload-electron-mock.ts:46/:150` 的 Electron mock）直调，`setMainWindow({isDestroyed,webContents:sender})` 注入假主窗（:34），sender/mainFrame 为最小 fake（:15-17）——**mock 事件，非真实 BrowserWindow**；`PROFER_CONFIG_DIR=work/tmp/v3-c0-ipc-{Date.now()}`（:10-11）。
- `review-c0-field-kind.test.ts`/`review-c0-subject-upsert.test.ts` 手工构造 `AuthorizedCaseCommand`（注释明示「真实 IPC 由 bindC0LocalCaseCommand 生成这些字段」，`review-c0-field-kind.test.ts:19`），**绕过**本模块，只覆盖 `review-c0-case-service`。

未覆盖（缺口）：`bindC0LocalCreateIntent` 的 `REVISION_CONFLICT`/requestId 确定式分支、`payloadHash` 不匹配分支、`deriveC0LocalPrincipal`（无消费）、`BLOCKED_AUTH`/`ROLE_FORBIDDEN` 共享授权分支均无直接断言；NOT_RUN（本轮未执行任何测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/2 内部符号行号如 §2 | 已证实 | :12-96 逐条 |
| 主窗口+主帧双校验、失败抛 `SENDER_UNTRUSTED` | 已证实 | :21-27；`review-c0-ipc.test.ts:138-143` |
| Renderer actor 仅 local/reviewer 形状可过、actorId 被忽略 | 已证实 | :46-58；`review-c0-ipc.test.ts:60-64` |
| hash 公式与 `case-store-v2.payloadHash` 同构 | 已证实 | :80-82 vs `case-store-v2.ts:188` |
| 五个写通道真实接线 | 已证实 | `review-ipc.ts:647/:657/:717/:722/:727` |
| `assertC0CaseAuthorization` 放行矩阵 | 已证实 | `review-v3-c0.ts:163-185` |
| `deriveC0LocalPrincipal` 无外部调用者 | 已证实（否定） | 全树 grep 仅 :65 |
| 真实 Electron 运行下 `senderFrame===mainFrame` 行为 | 未知 | 仅 mock 事件测试；真实窗口 NOT_RUN |
| `BLOCKED_AUTH`/`ROLE_FORBIDDEN` 的运行触发 | 未知 | 无签发方/无用例 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertC0ReviewMainSender`（两分支） | §3.1/§6 | 21-27 | covered |
| `deriveC0LocalPrincipal` | §3.2 | 29-44 | covered（无消费，已注明） |
| `bindC0LocalCaseCommand`（全检查链） | §3.4/§6 | 59-93 | covered |
| `bindC0LocalCreateIntent`（revision/requestId 分支） | §3.5 | 96-113 | covered（未测） |
| `COMMAND_TYPE` 映射 | §2/§3.4 | 12-18 | covered |
| `assertRendererActorIsLegacyLocal` | §3.3 | 46-56 | covered |
| `payloadHash` 不匹配分支 | §6 | 83-85 | partial（未测） |
| `BLOCKED_AUTH`/`ROLE_FORBIDDEN` | §7 | 91 | unknown（未触发） |
