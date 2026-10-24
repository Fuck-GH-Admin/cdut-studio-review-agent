---
path: apps/electron/src/main/lib/agent-collaboration-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b502490874e396ab89950390da37d0deb47b1fa0
sha256: 64c48363045cdd92cfbdda4909597b9c887d70c213d9e135b6ab79df474f6c97
lines: 120
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-collaboration-utils.ts

## 1. 结论与边界

协作委派的纯函数工具集：类型/常量定义、权限模式解析（恒 `bypassPermissions`）、从持久化会话恢复委派快照、构建子 Agent 委派提示词、拼接批量子任务共享背景。纯函数模块（文件头 :4 声明不依赖 Electron 与磁盘服务），无副作用、无 I/O。

不做的事：不管理委派生命周期（`apps/electron/src/main/lib/agent-collaboration-tools.ts` 负责）；不读写会话存储（输入是已取到的 `AgentSessionMeta` 值）；不做提示词模板之外的任何调度。

## 2. 导出与关键符号

导出 8 条（`export` 逐条核 :9/:11/:14/:17/:35/:46/:74/:107）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentDelegationRole` | type | `:9` | `'explore'\|'research'\|'implement'\|'review'\|'custom'` | 角色枚举（字符串联合） |
| `AgentDelegationStatus` | type | `:11` | `'running'\|'completed'\|'failed'\|'cancelled'\|'interrupted'` | 委派状态枚举 |
| `MAX_RUNNING_DELEGATIONS_PER_PARENT` | const | `:14` | `50` | 单父会话运行中子会话上限 |
| `RecoveredDelegationState` | interface | `:17-28` | 委派恢复快照（含 `permissionMode: ProferPermissionMode`、可选 `completedAt`） | 仅被 `buildRecoveredDelegationState` 返回类型使用 |
| `resolveDelegationPermissionMode` | function | `:35-41` | `(_parentMode?, _requestedMode?, _agentRuntime?) => ProferPermissionMode` | 恒返回 `'bypassPermissions'`，三参数均忽略 |
| `buildRecoveredDelegationState` | function | `:46-69` | `(input: {parentSessionId, delegationId, session, fallbackPermissionMode?}) => RecoveredDelegationState` | 从落盘会话恢复快照 |
| `buildDelegationPrompt` | function | `:74-102` | `(input: {parentSessionId, delegationId, role, task, expectedOutput?}) => string` | 子 Agent 提示词模板 |
| `buildDelegationTaskWithSharedContext` | function | `:107-120` | `(input: {sharedContext?, task}) => string` | 共享背景拼接 |

无内部函数（除导出函数体内逻辑）。

## 3. 内部逻辑与关键流程

- `resolveDelegationPermissionMode`（:35-41）：直接返回字面量 `'bypassPermissions'`；注释 :30-34 明示父会话/请求参数/目标预设的权限字段不改变该策略，参数仅为兼容既有调用方保留。
- `buildRecoveredDelegationState`（:46-69）：状态映射（:52-55）——落盘 `delegationStatus==='running'` 收敛为 `'interrupted'`；非 running 原样透传；缺失（undefined）也收敛为 `'interrupted'`。`role` 缺省 `'custom'`（:61）；`goal` 缺省 `''`（:62）；`permissionMode` 硬编码 `'bypassPermissions'`（:64，注释 :63）；`startedAt = session.createdAt`（:66）；`completedAt` 仅当存在 `persistedStatus` 时取 `session.updatedAt`（:67）。
- `buildDelegationPrompt`（:74-102）：`expectedOutput` trim 后缺省替换为「最终回复请包含：关键发现、已执行操作、验证结果、剩余风险或建议。」（:81/:101）；模板含工作边界（只处理子任务/不创建新协作子会话/最小改动/信息不足列缺口不编造，:84-89）、角色段（:91-93）、`task.trim()`（:97）。父会话 ID 与委派 ID 嵌入提示词（:82）。
- `buildDelegationTaskWithSharedContext`（:107-120）：`sharedContext` trim 空则原样返回 `task.trim()`（:111-113）；否则按「共享背景：… 子任务：…」拼接（:115-119）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/agent-collaboration-tools.ts:36-43` 导入全部 5 个值导出 + 2 个类型；调用点：`resolveDelegationPermissionMode()`（collaboration-tools:824）、`buildRecoveredDelegationState`（:602）、`buildDelegationPrompt`（:878）、`buildDelegationTaskWithSharedContext`（:1066）、`MAX_RUNNING_DELEGATIONS_PER_PARENT`（:337/:951/:956/:963/:969/:1096/:1154）；类型用于 `DelegationRecord`（:77/:81）与 `DelegateAgentArgs`（:287）。
- `apps/electron/src/main/lib/agent-collaboration-utils.test.ts:2` 直接测试 `resolveDelegationPermissionMode`。
- `RecoveredDelegationState` 无其它 importer（全冻结树检索仅本文件 :17/:51）。

出向：仅类型导入 `@profer/shared`（`AgentRuntime`/`AgentSessionMeta`/`ProferPermissionMode`，:7）；无模块调用。

## 5. 数据 I/O、读写与副作用

无 I/O、无全局状态、无副作用（依据：仅 :7 一个 import，全为 type；函数体无 fs/网络/Map/日志/抛错以外的交互）。`buildDelegationPrompt`/`buildDelegationTaskWithSharedContext` 只做字符串拼接。`buildRecoveredDelegationState` 只读传入的 session 对象字段，不写回。

## 6. 分支、失败、取消与恢复

- 无 throw、无 early-return 之外的失败路径（依据：全文无 `throw`/`try`）。
- 分支：`buildRecoveredDelegationState` 的 running→interrupted 收敛（:53-55）与 `completedAt` 条件（:67）；`buildDelegationPrompt` 的 `expectedOutput` 缺省（:81/:101）；`buildDelegationTaskWithSharedContext` 的空共享背景短路（:113）。
- 取消/恢复语义：`interrupted` 状态名在此定义（恢复时旧 `running` 被收敛，:53-55）；注意按 FACT-CHECKING 口径——`failed`+`interrupted` 诊断不等于存在独立 interrupted 运行态，这里仅是恢复快照的收敛值。
- 本文件不适用「失败后磁盘状态/重试」：依据纯函数无状态（:4）。

## 7. 权限与权威状态

- 权限策略的权威定义点在本文件：委派子会话恒 `bypassPermissions`（:40），恢复路径同样硬编码（:64）；父会话模式、请求参数、`AgentRuntime` 均不参与判定（:35-39 参数带 `_` 前缀）。
- 无 sender/role 检查（依据：本文件无 sender/role 字段与断言；权限执行在下游 runner）。
- 状态权威：`AgentDelegationStatus` 枚举由本文件定义，写入/收敛由 collaboration-tools 与本文件恢复函数共享。

## 8. 修改影响面

- `resolveDelegationPermissionMode` 改返回值会改变所有委派子会话的权限模式（collaboration-tools:824）与恢复一致性（:64），并使 `agent-collaboration-utils.test.ts` 12 个用例失败。
- `AgentDelegationStatus` 增删枚举需同步 `DelegationRecord`（collaboration-tools:81）、`updateAgentSessionMeta` 写入值、渲染层消费（`apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.test.ts:108-214`、`apps/electron/src/renderer/lib/agent-session-list.test.ts:91-100` 断言 delegation 字段）与恢复映射（:53-55）。
- `MAX_RUNNING_DELEGATIONS_PER_PARENT` 同时是运行并发上限与 Zod 参数上限（collaboration-tools:337/:951），改动影响工具 schema 与守卫文案。
- `buildDelegationPrompt` 模板改动影响子会话首轮行为与人工核对口径；无直接快照测试，回归依赖人工。
- 需同步修改的测试：`agent-collaboration-utils.test.ts`（本批内）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-collaboration-utils.test.ts`（本批内，15 行）。
- `resolveDelegationPermissionMode`：3 个 parent 模式 × 4 个 requested（3 模式+undefined）循环生成 12 个 `test`（:7-13），每个断言两次 `toBe('bypassPermissions')`（:10-11，重复断言无额外信息）；运行时参数恒传 `'pi'`（:10）。
- 未覆盖：`buildRecoveredDelegationState`、`buildDelegationPrompt`、`buildDelegationTaskWithSharedContext`、`RecoveredDelegationState` 形状——无任何测试（检索全冻结树 `*.test.ts` 引用仅本测试文件）。
- mock/真实边界：纯函数无 mock。`NOT_RUN`：本轮未执行测试。

间接证据：`agent-delegation-preset.test.ts`（本批内）经真实 `agent-preset-manager` 验证的恢复/继承路径不经过本文件；无其它间接覆盖。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条与 §2 一致 | 已证实 | `agent-collaboration-utils.ts:9-107` |
| 委派权限恒 `bypassPermissions`，参数被忽略 | 已证实 | `:35-41`；测试 :10-11 |
| 恢复快照把 running/缺失收敛为 `interrupted` | 已证实 | `:52-55` |
| 恢复快照 permissionMode 硬编码，忽略 `fallbackPermissionMode` 入参 | 已证实 | `:50`（入参存在）vs `:64`（未使用）——现存实现：`fallbackPermissionMode` 形参实际未参与输出 |
| 纯函数无 I/O | 已证实 | 仅 type import `:7`，全文无 fs/网络 |
| `buildDelegationPrompt` 的「不创建新的协作子会话」约束文本会进入子会话首轮上下文 | 已证实 | `:87`；由 collaboration-tools:878-884 发送 |
| 子会话实际是否遵守提示词约束 | 未知 | 属模型行为，无测试 |
| `fallbackPermissionMode` 保留是否为兼容旧签名 | 推断 | 形参存在但未读（:50）；无注释说明 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentDelegationRole`/`AgentDelegationStatus` | §2/§8 | :9/:11 | covered |
| `MAX_RUNNING_DELEGATIONS_PER_PARENT` | §2/§8 | :14 | covered |
| `resolveDelegationPermissionMode` | §2/§3/§7 | :35-41 | covered |
| `buildRecoveredDelegationState` 状态映射 | §3/§6 | :46-69 | covered |
| `buildDelegationPrompt` 模板/缺省 | §3 | :74-102 | covered |
| `buildDelegationTaskWithSharedContext` 短路 | §3 | :107-120 | covered |
| `RecoveredDelegationState` 形状 | §2 | :17-28 | covered |
| `fallbackPermissionMode` 未使用 | §10 | :50/:64 | covered |
| 3 个构建函数的测试 | §9 | — | unknown（无测试） |
