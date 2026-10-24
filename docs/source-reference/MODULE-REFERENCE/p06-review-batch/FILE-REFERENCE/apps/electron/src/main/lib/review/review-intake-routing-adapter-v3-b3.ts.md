---
path: apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fc412011105e2ae70d6d37d79c2df80dd7ef376c
sha256: 3ce6dc0388f391e440743df5f4a3599b427c982cfb7a157b28479160cd012934
lines: 248
kind: source
package: p06-review-batch
author: docs-r07-author-nb-01-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts

## 1. 结论与边界

B3 保守路由规划器：在 Main 已暂存的材料集合上，判断是否可给出唯一、证据完整、技术授权的模板建议，并管理 20 秒倒计时/人工选择/中断状态；它**从不创建案卷**，也不执行 Case 命令（文件头 `apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts:1-5`）。纯规划函数 + 有状态会话类。

边界：

- 不校验原件字节归属本身；会话类把这项工作交给 `ReviewB2StagingService`（`:148,165-189`）。
- 不判断业务语义；建议由调用方（内容分类器/标题匹配）提供（`:28-29`）。
- 不写盘、不注册 IPC、不发模型请求。
- 不把“分类器声称的 availability”当作授权；会话类用 Main 目录重建允许集合并降级（`:203-213`）。

## 2. 导出与关键符号

`export` 逐条核对：5 个接口 + 1 个函数 + 1 个类 = 7 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B3RouteSuggestion` | 接口（导出） | 11-20 | `{templateId,templateVersion,availability,confidence,evidence[],caseCandidateId}` | 建议；`evidence` 必须逐份材料覆盖 |
| `B3RoutingInput` | 接口（导出） | 21-30 | 含 `startedAtMs/nowMs/automaticSelectionEnabled/userInterrupted/userChose*/materialCandidates/suggestions` | 纯函数输入 |
| `B3RouteState` | 接口（导出） | 31-36 | `{status,remainingMs,chosen?,reason}` | 6 种状态 |
| `planB3ConservativeRouting` | 函数（导出） | 44-114 | `(input)=>B3RouteState` | 无状态规划；非法输入抛 `B3_ROUTING_INVALID` |
| `B3ManualCatalogEntry` | 接口（导出） | 117-122 | `{templateId,templateVersion,name,availability}` | Main 提供的目录项 |
| `B3OwnerRouteInput` | 接口（导出） | 124-129 | 去掉时间/中断字段，加 `manualCatalog` | 会话类输入 |
| `ReviewB3OwnerBoundRouteSession` | 类（导出） | 136-247 | `constructor(staging, now=Date.now)`；`evaluate(ctx,input)` | 绑定 owner/scope/时钟/中断的会话 |
| `SHA` / `validTime` / `confident` | 内部 | 37-39 | 64 位小写 hex；有限非负；`0.95<=score<=1` | 校验原语 |

`B3RouteState.status` 的 6 个值：`awaiting-evidence`、`unmatched`、`countdown`、`needs-user-confirmation`、`manually-selected`、`default-selected`（`:32`）。

## 3. 内部逻辑与关键流程

### 3.1 纯函数 `planB3ConservativeRouting`

按顺序（`apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts:44-114`）：

1. 输入校验：`startedAtMs/nowMs` 有限且非负、`now>=started`、材料与建议都是数组；否则 `B3_ROUTING_INVALID`（`:45-49`）。
2. `remainingMs = max(0, 20000 - (now-started))`（`:50`）。
3. 材料按 `candidateId` 建 Map；Map 大小不等于数组长度（重复 ID）或数组为空 → `awaiting-evidence`，`reason:'No unique valid staged files'`（`:51-54`）。
4. 人工选择：有 `userChoseTemplateId` 但无 `userChoseTemplateVersion` → `needs-user-confirmation`；两者都有 → `manually-selected`，`chosen` 原样返回，不校验目录（`:55-62`）。目录授权由会话类在调用前检查（`:229-239`）。
5. 中断或自动选择关闭 → `needs-user-confirmation`（`:63-65`）。
6. owner 作用域（`ownerId::ownerGeneration`）与 case 作用域必须唯一；每个材料必须 `status==='accepted'`、`role!=='unassigned'`、`subjectId` 非空、`rawSha256` 为 64 位 hex；否则 `needs-user-confirmation`（`:66-72`）。
7. 建议为空 → `unmatched`，`remainingMs:0`（`:73-76`）。
8. 至少一个 `application`，且全部材料的 `subjectId` 唯一 → 否则 `needs-user-confirmation`（`:79-84`）。
9. 建议必须唯一（`templateId@version` 集合大小 1 且数组长度 1）、`confidence` 在 `[0.95,1]`、`availability==='authorized-for-technical-selection'`、证据有效（`:85-105`）。证据有效 = 长度等于材料数、`caseCandidateId` 与首个材料一致、每条 `materialCandidateId` 不重复且存在、`rawSha256` 相等、`reason` 非空（`:86-99`）。
10. `remainingMs>0` → `countdown`；否则 `default-selected` 并给出 `chosen`（`:106-113`）。

### 3.2 会话类状态

字段（`:137-145`）：`scope`（JSON 字符串）、`sourceFingerprint`、`startedAtMs`、`previousNowMs`、`interrupted`，以及构造注入的 `staging` 与 `now()`。

### 3.3 会话类 `evaluate`

1. `staging.assertStillGranted(ctx)`（`:148`）。
2. 时钟：`now()` 必须有限非负；已建立 scope 后若时间倒退 → `B3_ROUTING_CLOCK_INVALID`（`:149-151`）。
3. 输入数组校验（`:152-154`）。
4. scope = `JSON.stringify([ownerId,ownerGeneration,caseCandidateId,senderId,frameId])`；已建立且变化 → `B3_ROUTING_SESSION_SCOPE_CHANGED`（`:156-160`）。
5. **完整暂存集**：调用方提交的 `candidateId` 必须无重复、数量等于 `staging.listScopedCandidateIds(ctx)`、且覆盖其全部 ID；否则 `B3_ROUTING_INCOMPLETE_STAGED_SET`（`:165-171`）。这防止渲染层隐藏第二份申请件。
6. **身份逐字段比对**：14 个字段（`candidateId/caseCandidateId/materialId/documentVersionId/rawSha256/byteLength/fileName/physicalSourceKey/role/subjectId/ownerId/ownerGeneration/requestId/status`）必须与暂存记录完全相等；否则 `B3_ROUTING_STAGED_IDENTITY_MISMATCH`（`:174-182`）。
7. **字节复核**：重新读暂存字节，长度与 sha256 必须等于记录；否则 `B3_ROUTING_ORIGINAL_BYTES_MISMATCH`（`:185-189`）。
8. **目录校验**：每项必须有非空 `templateId/templateVersion/name`，`availability` 只能是两种枚举；重复 `templateId@version` → `B3_ROUTING_CATALOG_DUPLICATE`（`:191-202`）。只有 `authorized-for-technical-selection` 进入 `allowedCatalog`。
9. **建议授权降级**：建议的 availability 只有在其 key 属于 `allowedCatalog` 且自身声称 authorized 时才保留 authorized，否则强制 `candidate-held`（`:203-213`）。
10. **指纹与倒计时重置**：指纹覆盖材料的 6 个关键字段、降级后的建议、目录的 `templateId/version/availability`；指纹变化即 `startedAtMs=now`（`:214-224`）。
11. **中断粘性**：`input.userInterrupted` 为真则 `this.interrupted=true`，之后不会因输入变假而复位（`:225`）。
12. 更新 `scope`、`previousNowMs`（`:226-227`）。
13. **人工选择目录校验**：若给了 `userChoseTemplateId` 或 `userChoseTemplateVersion`，必须两者都在目录中且 authorized，否则返回 `needs-user-confirmation`（`:229-239`）。此分支在调用纯函数前返回，因此不会落入纯函数的“manually-selected 不校验目录”路径。
14. 调 `planB3ConservativeRouting`，传入内部 `startedAtMs/now`、粘性 `interrupted`、降级建议（`:240-244`）。
15. 再次 `assertStillGranted` 后返回（`:245-246`）。

## 4. 调用者与调用链

入向（冻结树 grep，排除测试）：

- `apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:22` 导入类；`:143` 构造 `new ReviewB3OwnerBoundRouteSession(staging)`；`:210` 调 `evaluate`。
- `apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts:14` 只导入 `B3RouteState` 类型。
- `apps/electron/src/main/lib/review/review-v3-b-candidate-readiness-workbench.ts:11`、`review-v3-b33-currentity-snapshot.ts:15` 只导入类型。
- 渲染层 `review-v3-product-workflow.ts:11`、`ReviewV3ProductWorkspace.tsx:13`、`review-v3-route-view.ts:4`、`ReviewV3CandidateIntakeSurface.tsx:9` 只导入类型。

出向：`review-intake-adapter-v3-b2.ts:8-9`（`B2MainContext`、`B2MaterialCandidate`、`ReviewB2StagingService`）；`createHash`（`:6`）。

本文件不注册 IPC；`LOCAL_PRODUCT_*` 通道在 intake 文件。

## 5. 数据 I/O、读写与副作用

- 输入：材料候选（含字节哈希/角色/主体/owner）、建议、目录、时间/中断/人工选择。
- 输出：`B3RouteState`；不返回建议列表。
- 读：`staging.listScopedCandidateIds/getCandidate/read`（内存暂存，读取返回副本）；`createHash` 重算字节。
- 写：仅会话类自身字段（`scope/sourceFingerprint/startedAtMs/previousNowMs/interrupted`）；无磁盘/网络/全局状态。
- 副作用：无日志/通知/进程；`now()` 可注入，便于测试。
- 并发：会话实例非线程安全；按 intake 的 `sessions` Map 单会话使用。`evaluate` 内两次 `assertStillGranted` 之间无 await，不存在跨 IPC 的异步窗口（`:148,245`）。

## 6. 分支、失败、取消与恢复

| 错误 | 触发 | 行 |
| --- | --- | --- |
| `B3_ROUTING_INVALID` | 时间非法或材料/建议非数组 | 48,154 |
| `B3_ROUTING_CLOCK_INVALID` | 时钟倒退（已建立 scope 后） | 151 |
| `B3_ROUTING_SESSION_SCOPE_CHANGED` | owner/case/sender/frame 变化 | 160 |
| `B3_ROUTING_INCOMPLETE_STAGED_SET` | 提交集合与暂存集合不一致 | 170 |
| `B3_ROUTING_STAGED_IDENTITY_MISMATCH` | 14 字段任一不等 | 182 |
| `B3_ROUTING_ORIGINAL_BYTES_MISMATCH` | 字节长度/sha 不符 | 188 |
| `B3_ROUTING_CATALOG_INVALID` | 目录项字段/枚举非法 | 197 |
| `B3_ROUTING_CATALOG_DUPLICATE` | 目录 key 重复 | 199 |

状态分支：`awaiting-evidence`（空/重复材料）、`unmatched`（无建议）、`countdown`（唯一且证据完整且剩余>0）、`needs-user-confirmation`（人工版本缺失、中断/自动关闭、owner/角色/主体/建议/证据/目录不满足、人工选择未授权）、`manually-selected`（纯函数收到人工选择；会话类先过目录）、`default-selected`（倒计时结束）。

取消/恢复：

- 用户中断是粘性的，只能通过新建会话（intake 在签名/作用域变化或人工选择后删除会话）复位（`review-v3-main-local-product-intake.ts:138-145,320-322`）。
- 时间倒退直接抛错，不自动修正；调用方需重建会话。
- 指纹变化会重置倒计时，但不会清空 `interrupted`（`:221-225`）。

## 7. 权限与权威状态

- 本文件无 sender/window 检查；`ctx` 必须由 Main 从当前认证 sender/frame 派生（接口注释 `:116,123-135`；实际派生在 `review-v3-main-local-product-intake.ts:69-76`）。
- 目录是 Main 提供的授权集合；分类器/建议的 availability 不被信任，未在目录中的建议降级为 `candidate-held`（`:203-213`）。
- 纯函数本身不校验目录；直接调用者若自行传 `userChose*`，会得到 `manually-selected`。生产路径由会话类先校验（`:229-239`）。这是本文件最重要的权限边界。
- 不产生 Case/Run/行政审批；状态只描述“技术建议/人工选择”（`:112`）。

## 8. 修改影响面

- 改 `B3RouteState` 状态值/字段会影响：intake 的 `evaluate`/`read`、`B29` 草稿前置（要求 `status==='unmatched'` 且 `remainingMs===0`，`review-v3-b3-unmatched-author-bootstrap.ts:57-63`）、渲染层路由视图与工作台。
- 改 `remainingMs`/20 秒常量会影响倒计时 UI 与测试（`review-intake-routing-adapter-v3-b3.test.ts:37,42`）。
- 改证据完整性规则会影响自动建议；改目录降级会影响 D4 `candidate-held` 的可选性。
- 改 14 字段比对/字节复核会影响所有自动路由；改 scope 字符串会影响会话复用。
- 改 `interrupted` 粘性会影响“用户取消后刷新又自动选”的行为。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts`（本批，5 个用例，详见该文件手册）。覆盖：两份申请件同组倒计时、倒计时结束默认选中、跨主体人工确认、无申请件人工确认、两个建议人工选择。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI；以上为静态阅读断言。

缺口：

- 会话类 `ReviewB3OwnerBoundRouteSession` 完全没有直接测试（grep 测试文件无构造/`evaluate`）。
- 未覆盖：非法时间/时钟倒退、scope 变化、暂存集合不完整、身份字段篡改、字节篡改、目录非法/重复、建议降级、人工选择目录校验、中断粘性、指纹重置倒计时、`awaiting-evidence`、`manually-selected`、证据长度/重复/缺 reason。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数不创建案卷、不写盘 | 已证实 | `:44-114` 无写调用；文件头 `:1-5` |
| 倒计时 20 秒，`remainingMs` 可为 0 | 已证实 | `:50,106-113`；测试 `:37,42` |
| 多材料必须同 owner/case/主体且有申请件 | 已证实 | `:66-84` |
| 建议必须唯一、置信度 >=0.95、证据覆盖全部材料 | 已证实 | `:85-105` |
| 证据重复/缺 reason/sha 不符会拒绝 | 已证实 | `:86-99` |
| 会话类要求完整暂存集 | 已证实 | `:165-171` |
| 会话类逐字段比对并重读字节 | 已证实 | `:174-189` |
| 建议 availability 由目录降级 | 已证实 | `:203-213` |
| 人工选择在会话类先校验目录 | 已证实 | `:229-239` |
| 纯函数的人工选择分支不校验目录 | 已证实 | `:55-62` |
| 中断粘性、指纹变化重置倒计时 | 已证实 | `:221-225` |
| 时钟倒退抛错 | 已证实 | `:149-151` |
| 会话类无直接测试 | 已证实（测试检索） | 测试仅 import `planB3ConservativeRouting`（`review-intake-routing-adapter-v3-b3.test.ts:7`） |
| `staging` 暂存是内存态 | 已证实（依赖） | `review-intake-adapter-v3-b2.ts:79-88` |
| 会话类在真实 IPC 中的并发行为 | 未知 | 单会话 Map；无并发测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 纯函数输入校验/剩余时间 | §3.1 | 44-50 | covered |
| 空/重复材料 | §3.1 | 51-54 | covered |
| 人工选择分支 | §3.1 | 55-62 | covered |
| 中断/自动关闭 | §3.1 | 63-65 | covered |
| owner/角色/主体校验 | §3.1 | 66-72 | covered |
| 无建议 → unmatched | §3.1 | 73-76 | covered |
| 申请件/单一主体 | §3.1 | 79-84 | covered |
| 唯一性/置信度/证据 | §3.1 | 85-105 | covered |
| 倒计时/默认选中 | §3.1 | 106-113 | covered |
| 会话时钟/scope | §3.3 | 148-160 | covered |
| 完整暂存集 | §3.3 | 165-171 | covered |
| 身份/字节复核 | §3.3 | 174-189 | covered |
| 目录校验/降级 | §3.3 | 191-213 | covered |
| 指纹/中断/人工校验 | §3.3 | 214-239 | covered |
| 会话类测试 | §9 | — | unknown |
