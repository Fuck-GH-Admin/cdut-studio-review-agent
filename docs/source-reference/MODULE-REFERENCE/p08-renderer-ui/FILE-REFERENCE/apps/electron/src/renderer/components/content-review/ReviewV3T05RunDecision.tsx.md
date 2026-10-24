---
path: apps/electron/src/renderer/components/content-review/ReviewV3T05RunDecision.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 680f7f36034a44c2d31fdf5cfdf7e38f32fc44e8
sha256: ba4d874574c4b237c772b9f7f469c97387f22b641c0f1281a733575665f09611
lines: 280
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T05RunDecision.tsx

## 1. 结论与边界

对**已存在且仍为当前**的 `ReviewRunV2` 做人工核定：检查项处置（含补件）、申报事项认定、案卷级本地决定三类写操作（`apps/electron/src/renderer/components/content-review/ReviewV3T05RunDecision.tsx:18-280`）。

运行时 UI 组件。文件头声明「All writes are dispatched to the existing Main-owned case transaction APIs. No local shadow state, no agent/school impersonation, no synthetic Run」（`:1-5`）——本文件不创建 Run、不模拟学校身份、不保留影子账本。

明确不做的事：

- **不写历史 Run**：只把 Main 判定的 `capability.currentRunId` 放进可写下拉（`:59-63`、`:140-147`），历史 Run 只读展示（`:149-151`）。
- **不在技术案卷上做最终决定**：`isTechnicalOnly` 为真时 `canDecide=false` 并提示走阶段流程（`:98`、`:101-102`、`:235-237`）。
- **不与阶段流程混用**：`stageManaged`（`aggregate.tasks.length>0`）时同样禁止案卷快捷决定（`:99`、`:101-102`、`:234`）。

## 2. 导出与关键符号

`export` 共 **1 个**（只有组件）。其余均为文件内私有。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewV3T05RunDecision` | 导出 function | `:18-280` | `({aggregate, onResult}: {aggregate: CaseAggregateV2; onResult: (r: ReviewCommandResult\|undefined)=>void}) => JSX.Element` | 唯一导出 |
| `Disposition` | 内部 type | `:10` | 6 值：`confirmed-issue`/`human-confirmed-compliant`/`false-positive`/`supplement-requested`/`waived`/`escalated` | 检查项处置 |
| `CaseDecision` | 内部 type | `:11` | `pass`/`partial-pass`/`return`/`reject` | 案卷决定 |
| `SubjectOutcome` | 内部 type | `:12` | `accepted`/`rejected` | 事项认定 |
| `reviewer` | 内部 const | `:14` | `{actorId:'local-user', actorSource:'local', role:'reviewer'}` | 提交命令里的 actor claim |
| `rid` | 内部函数 | `:15` | `() => 't05-' + Date.now().toString(36) + '-' + random(6)` | 请求 ID |
| `elementsFrom` | 内部函数 | `:16` | `(text: string) => string[]` | 按 `\n , ， ; ；` 切分、去空、去重 |

## 3. 内部逻辑与关键流程

### 3.1 读取运行与能力（`:45-68`）

进入时先清空 `runs`/`runId`/`currentRunId`/`runAuthorityNote`/`error`（`:47-51`），随后 `Promise.all([listRunsV2(caseId), getT05StageCapability({caseId})])`（`:53-56`）：

- `completed = list.filter(status==='completed' || status==='partially-completed')`（`:58`）——**只保留已完成两类**。
- `currentId = capability.currentRunId ?? ''`（`:59`）。
- `runAuthorityNote`：无当前运行时写「当前没有可办理的权威审核运行（原因）；历史运行只读」（`:62`）。
- `runId`：仅当 `currentId` 非空且确实在 `completed` 里才设为它，否则 `''`（`:63`）。

依赖 `[caseId, aggregate.caseV2.revision]`（`:68`）——案卷修订变化会重读。

### 3.2 有效性（`:70-77`）

`runId` 为空 → `setStale(true)` 并 return（`:72`）。否则 `getWorkspaceRunValidityV2({caseId, runId})` 写 `stale`；异常也置 `true`（`:73-75`）。依赖 `[caseId, runId, aggregate.caseV2.revision]`（`:77`）。

`stale` 初值 `true`（`:29`）——在首次有效性返回前，界面按「不可写」处理。

### 3.3 派生量（`:79-102`）

| 名称 | 行 | 计算 |
| --- | --- | --- |
| `run` | `:79` | `runs.find(id===runId)` |
| `inputHash` | `:80` | `run?.inputManifest.hash` |
| `findings` | `:81-95` | 先遍历 `run.checks`（key = `checkId ?? ruleId`），再遍历 `run.opinions`（key = `id ?? checkId`，仅在未出现时加入） |
| `selectedFinding` | `:96` | `findings.find(key===findingKey) ?? findings[0]` |
| `selectedSubject` | `:97` | `subjects.find(id===subjectId) ?? subjects[0]` |
| `isTechnicalOnly` | `:98` | `Boolean(aggregate.d2RuntimePlan \|\| aggregate.canonicalPlan)` |
| `stageManaged` | `:99` | `aggregate.tasks.length > 0` |
| `reviewable` | `:100` | `run && inputHash && !stale && !busy` |
| `canDecide` | `:101-102` | `reviewable && !isTechnicalOnly && !stageManaged && stage !== 'decided' && stage !== 'archived'` |

**注意**：`findings` 用 `Map.set` 覆盖同名 key（`:87`、`:92`），同一 `checkId` 出现多次时保留**最后一条**；`opinions` 只有在 key 未出现过时才加入（`:92`）。

### 3.4 命令构造（`:104-132`）

- `send(fn)`：置 `busy`、清错、`await fn()`、`onResult(result)`（**无论 ok 与否都回调**）、`!ok` 时 `setError(result.message)`、返回 `Boolean(result?.ok)`；异常写 `error` 并返回 `false`；`finally` 复位 `busy`（`:104-118`）。
- `command(type, payload)`：`{requestId: rid(), target:{kind:'case', id:caseId}, expectedRevision: aggregate.caseV2.revision, actor: reviewer, type, payload}`（`:120-132`）。

`expectedRevision` 取的是**当次渲染**的案卷修订号（`:130`），因此并发写会由 Main 以 `VERSION_CONFLICT` 拒绝（错误码枚举见 `review-v2-contracts.ts:408-410`）。

### 3.5 三个写操作

**① 检查项处置 / 补件（`:182-200`）**

- 禁用条件：`!reviewable || !selectedFinding || !findingReason.trim() || (disposition==='supplement-requested' && (!elementsFrom(requirements).length || !supplementReason.trim()))`（`:183-184`）。
- `disposition==='supplement-requested'` → `openWorkspaceSupplementV2`，payload `{findingKey, runId, inputHash, requiredElements: elementsFrom(requirements), reason: supplementReason}`，命令类型 `OpenWorkspaceSupplement`（`:187-193`）。
- 其它处置 → `recordWorkspaceDispositionV2`，payload `{findingKey, disposition, reason, runId, inputHash}`，类型 `RecordWorkspaceFindingDisposition`（`:194-198`）。
- 成功清空三个输入（`:199`）。

**② 事项认定（`:203-230`）**

仅当 `aggregate.caseV2.subjects.length > 0` 时渲染（`:203`）。禁用条件 `!reviewable || !selectedSubject || !subjectReason.trim()`（`:217`）。调 `recordWorkspaceSubjectAdjudicationV2`，payload `{subjectId, outcome, reason, runId, inputHash}`，类型 `RecordWorkspaceSubjectAdjudication`（`:220-226`）。成功清空理由（`:227`）。

**③ 案卷级决定（`:232-274`）**

- `stageManaged` / `isTechnicalOnly` 的说明块（`:234-237`）。
- 四种结果下拉（`:238-244`）；`return` 时额外要求补件要素与理由（`:248-256`）。
- 禁用条件 `!canDecide || !decisionReason.trim() || (return && (!elementsFrom(decisionElements).length || !decisionSupplementReason.trim()))`（`:257-258`）。
- `decideWorkspaceCaseV2`，payload `{result, reason, basedOnRunId: runId, inputHash, ...(return ? {requiredElements, supplementReason} : {})}`，类型 `RecordWorkspaceBusinessDecision`（`:261-270`）。
- 成功后清空三个输入（`:271`）；尾部说明 Main 会再次检查输入/事项/补件/来源（`:273`）。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/V2CasePanel.tsx:23`（import）、`:643`（挂载）：`<ReviewV3T05RunDecision aggregate={current} onResult={applyResult} />`，其中 `applyResult` 定义在 `V2CasePanel.tsx:254`。
- 全树唯一引用。

**出向（5 个 reviewAPI 方法）**

| 方法 | 本文件行 | preload | Main handler |
| --- | --- | --- | --- |
| `listRunsV2` | `:54` | `preload/index.ts:4802` | `review-ipc.ts:599`（`LIST_RUNS_V2`） |
| `getT05StageCapability` | `:55` | `:4967` | 未在本批逐行读（见第 10 节） |
| `getWorkspaceRunValidityV2` | `:73` | `:4901` | `review-ipc.ts:709-716` |
| `openWorkspaceSupplementV2` | `:188` | `:5036` | `review-ipc.ts:736-739` |
| `recordWorkspaceDispositionV2` | `:194` | `:5034` | `review-ipc.ts:731-734` |
| `recordWorkspaceSubjectAdjudicationV2` | `:220` | `:5042` | `review-ipc.ts:1030-1033` |
| `decideWorkspaceCaseV2` | `:261` | `:5040` | `review-ipc.ts:746-749` |

（7 个调用点、7 个方法。）

## 5. 数据 I/O、读写与副作用

- **读**：`aggregate`（prop）、运行列表、阶段能力、运行有效性。
- **写（Main 事务）**：三类命令，均带 `requestId`、`target`、`expectedRevision`、`actor`、`payload`；Main 侧统一经 `bindLocalReviewerCommand` 覆盖 actor（见第 7 节）。
- **无** localStorage / atom / 剪贴板 / 定时器 / 直接文件 IO。
- **副作用**：`onResult` 回调（父级据此刷新聚合）；`Date.now()` 与 `Math.random()` 生成请求 ID（`:15`）。
- **并发**：`busy` 互斥所有三个提交按钮（`:100` 的 `reviewable` 含 `!busy`）；`expectedRevision` 提供乐观并发控制。
- **幂等**：每次提交生成新 `requestId`，因此**不是**幂等重放；Main 若以 `requestId` 去重，重复点击会得到不同请求。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无已完成 Run | `:138-139` | 「尚无已完成的可核定 ReviewRun…」 |
| 有 Run 但无当前权威 Run | `:140`、`:145-147` | 不显示可写下拉，显示「历史运行只读，请先完成最新一轮审核」 |
| 当前 Run 不在 completed 列表 | `:63` | `runId=''`，按无当前 Run 处理 |
| 有效性读取失败 | `:75` | `stale=true`（保守） |
| `stale` | `:152` | 黄条「当前运行的输入已变化或来源失效…不可用旧 Run 写入人工决定」 |
| 命令返回 `ok:false` | `:110` | `setError(result.message)`，输入不清空 |
| 命令抛异常 | `:112-114` | `setError(message)` |
| 技术案卷 / 阶段任务 | `:234-237` | 说明块，`canDecide=false` |
| `return` 缺要素/理由 | `:257-258` | 按钮禁用 |

**恢复**：`runId`/`stale` 可从 Main 重读恢复（依赖 `aggregate.caseV2.revision`）；输入框内容（理由/要素）为易失 state，成功后主动清空（`:199`、`:227`、`:271`）。

## 7. 权限与权威状态

- 本文件无 sender 检查（无 `event`），只有 **actor claim**：`reviewer = {actorId:'local-user', actorSource:'local', role:'reviewer'}`（`:14`），随每条命令提交（`:131`）。
- Main 侧两层校验（已证实）：
  1. 每个写 handler 先 `assertC0ReviewMainSender(event)`（`review-ipc.ts:732`、`:737`、`:747`、`:1031`），要求主窗口 + 主帧（`review-c0-authority.ts:21-27`）。
  - **读通道守卫弱于写通道（已证实）**：本文件调用的读接口无 sender 守卫——`LIST_RUNS_V2`（`review-ipc.ts:599-604`）只 `assertSafeReviewStorageId(caseId)`，`GET_WORKSPACE_RUN_VALIDITY_V2`（`:709-715`）只检查入参非空；它们不校验调用窗口/帧。二者只是读，不影响上面写通道的权威结论，但「所有通道都有 sender 守卫」并不成立。
  2. 再 `bindLocalReviewerCommand(input.command)`：先检查 claim 是 `local`+`reviewer`，否则抛「本地审核 IPC 仅允许 reviewer 操作…」；**然后丢弃 Renderer 提供的身份**，替换为冻结的 `LOCAL_REVIEWER_ACTOR`（`review-ipc-actor-guard.ts:46-53`、`:17-19`）。
- 因此 `actorId:'local-user'` 只是通过 claim 检查的占位，不是被信任的身份；真正的 actor 由 Main 派生。
- 权威状态：`currentRunId` 由 `getT05StageCapability` 给出（`:59`），Run 有效性由 `getWorkspaceRunValidityV2` 给出（`:73`）；本文件不做任何「是否可写」的业务判断，只做展示与禁用。

## 8. 修改影响面

- **唯一调用方** `V2CasePanel.tsx:643`：改 props（`aggregate`/`onResult`）需同步该处。
- **命令类型字符串**（`OpenWorkspaceSupplement`、`RecordWorkspaceFindingDisposition`、`RecordWorkspaceSubjectAdjudication`、`RecordWorkspaceBusinessDecision`，见 `:189`、`:195`、`:222`、`:263`）必须与 Main 服务的类型分派一致；改名会让 Main 拒绝。
- **payload 字段**（`findingKey`/`runId`/`inputHash`/`requiredElements`/`reason`/`subjectId`/`outcome`/`result`/`basedOnRunId`）与 Main 校验绑定；RUN-14 起 `basedOnRunId` 是案卷决定的关键字段（`:265`）。
- **`canDecide` 口径**：放宽 `isTechnicalOnly`/`stageManaged` 会让技术案卷或阶段案卷出现快捷决定入口；这是权威边界，不应随意改。
- **`findings` 去重口径**：改 key 选择会改变下拉可选项，进而影响 `findingKey` 与补件关联。
- 无存储格式/迁移。

## 9. 测试证据

**直接测试**：无。全树 `--include=*.test.ts/tsx/mjs` 检索 `ReviewV3T05RunDecision` 命中 0。

**间接证据**：`review-ipc-actor-guard.test.ts:5-20` 的三个用例直接测 `bindLocalReviewerCommand` 的 claim 校验——伪造 `actorSource`（`:6-9`，system/agent/school/mock）、伪造角色（`:12-14`，teacher/school-admin/student/system/template-owner）、未知或缺失操作者（`:16-20`）均抛「本地审核 IPC」；这是本文件 actor claim 能通过/被拒的底层依据；但该测试不渲染本组件。

**未覆盖**：两个 effect 的竞态、`stale` 保守默认、`findings` 合并顺序、三个提交的 payload 形状、`canDecide` 各分支、`elementsFrom` 分隔符。

**NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为组件 | 已证实 | `grep -c "^export"` = 1；`:18` |
| 只把 `currentRunId` 放进可写下拉 | 已证实 | `:59-63`、`:143` |
| 历史 Run 只读 | 已证实 | `:149-151` |
| `stale` 初值 true、读取失败也置 true | 已证实 | `:29`、`:75` |
| `canDecide` 排除技术案卷与阶段案卷 | 已证实 | `:101-102` |
| Main 覆盖 Renderer actor | 已证实 | `review-ipc-actor-guard.ts:46-53`；handler 先 `assertC0ReviewMainSender`（`review-ipc.ts:732` 等） |
| `onResult` 在失败时也会被调用 | 已证实 | `:109`（在 `:110` 判断之前） |
| `getT05StageCapability` 的 Main 实现细节 | 未知 | 本批未读该 handler；只用到 `currentRunId`/`currentRunReason` 两个字段（`:59`、`:62`） |
| `findings` 同 key 覆盖是否会漏掉重复检查 | 推断 | `:87` 的 `Map.set` 语义；未运行验证实际 Run 是否会出现重复 key |
| 并发点击两个不同按钮是否会被 `busy` 完全阻止 | 推断 | `reviewable` 含 `!busy`（`:100`），但两个按钮的 `onClick` 之间仍有事件循环间隙 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 唯一导出与 props | 2 | `:18-23` | covered |
| 内部类型与常量 | 2 | `:10-16` | covered |
| 运行与能力读取 | 3.1 | `:45-68` | covered |
| 有效性 effect | 3.2 | `:70-77` | covered |
| 派生量 | 3.3 | `:79-102` | covered |
| `send` / `command` | 3.4 | `:104-132` | covered |
| 检查项处置 | 3.5 | `:182-200` | covered |
| 事项认定 | 3.5 | `:203-230` | covered |
| 案卷决定 | 3.5 | `:232-274` | covered |
| 调用者/出向 | 4 | — | covered |
| 权限链 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| Main 能力 handler 细节 | 10 | — | unknown |
