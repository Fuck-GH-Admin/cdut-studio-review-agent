---
path: apps/electron/src/main/lib/agent-preset-operations.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b7257df532a534b26c5f807ccb7a87c5fad70cc
sha256: d0d3d18d0c0f0bb2fb3f31673a15fd1325132cc0cae33999b29ae898801c534f
lines: 709
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preset-operations.ts

## 1. 结论与边界

**Agent 预设变更操作层**（模型工具→预设变更的受控入口）：意图门禁（用户原文判定）、创建/复制/切换/提案/提交六类操作、能力 diff 摘要、审计事件（`agent-preset-operations.ts` 全文）。核心不变量：**预设变更必须显式用户意图、改动经提案+确认两段式、切换以冻结引用为基准**（`:37-42` 注释）。写路径=agent-preset-manager（域外同批文件）+ 追加审计日志（`appendFileSync`）。

## 2. 导出与关键符号

导出较多（类型 12 + 函数 12 + 依赖接口 2），逐条：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentPresetOperationSource` | 类型 | `:29` | 'user'\|'automation'\|'delegation'\|'goal'——仅 user 可变更 |
| `AgentPresetMutationOperation` | 类型 | `:30` | create/copy/switch/propose_update/propose_default/commit_change |
| `AgentPresetOperationContext` | 接口 | `:32` | sessionId/workspaceSlug?/source/allowedOperations/currentPresetReference?/userMessage?/pendingChange?——`userMessage` 仅 orchestrator 注入不可被工具参数覆盖（`:39-40`） |
| `AgentPresetCreationResult` 等结果类型 | 接口 | `:45,96,112,124-190` | 创建/提案/提交/切换结果形状（含 `nextStep:'created_not_applied'`、`requiresConfirmation:true` 等显式语义） |
| `AccessListDiff`/`AgentPresetCapabilityDiff` | 接口 | `:55,64` | 能力 diff（含 permissionMode.elevated、elevatesCapabilities） |
| `PendingPresetChange` | 接口 | `:83` | 提案状态（proposalId/kind/target/sourceUpdatedAt?/currentDefault/update?/proposalAuditEventId） |
| `PresetChangeOperationDependencies`/`SwitchOperationDependencies` | 接口 | `:158,152` | 依赖注入（getPreset/updatePreset/setDefault/appendAudit/restorePreset/rebind…），测试替身用 |
| `evaluateAgentPresetOperationIntents` | 函数 | `:236` | 用户原文→允许操作集（意图门禁） |
| `summarizeAgentPreset` | 函数 | `:323` | 预设摘要（名称/描述/权限模式/工具组禁用/suppress/skills/mcp） |
| `diffAgentPresetCapabilities` | 函数 | `:288` | 前后能力 diff（提升判定 elevatesCapabilities） |
| `createWorkspacePresetFromAgent` | 函数 | `:394` | 创建（不改当前会话/默认） |
| `copyWorkspacePresetFromAgent` | 函数 | `:399` | 复制（含跨 scope 可用性校验） |
| `proposeAgentPresetUpdateFromAgent` | 函数 | `:478` | 提案改预设（**不落盘**，写 pending+审计） |
| `proposeAgentPresetDefaultFromAgent` | 函数 | `:532` | 提案改默认 |
| `commitPendingAgentPresetChangeFromAgent` | 函数 | `:571` | 用户确认后提交（校验 pending 归属+sourceUpdatedAt 未变） |
| `switchSessionPresetFromAgent` | 函数 | `:646` | 切换当前会话预设（以冻结引用比较基准） |
| `getPendingPresetChange`/`clearPendingPresetChange` | 函数 | `:254,258` | pending 读/清 |

## 3. 内部逻辑与关键流程

- **意图门禁** `evaluateAgentPresetOperationIntents`（`:236-262`）：显式命令句式匹配 create/copy/switch/propose_update/propose_default；疑问/否定/讨论→[]（规则注释 `:207-235`：问题句、“不要”、纯讨论不放行；“能不能…设为默认”不算指令但“把…设为默认”算）。
- **前置断言**（`:317-336`）：source!=='user'→抛“只有用户发起的交互会话…”（`:320`）；操作不在 allowedOperations→“当前用户消息没有明确请求…”（`:325`）。
- **提案两段式**：`proposeAgentPresetUpdateFromAgent`（`:478` 起）校验目标存在/非内置改名等→生成 proposalId+审计事件→返回 impact（`effectiveFrom:'next_turn'`、`requiresConfirmation:true`）；**未确认前零写入**（updatePreset 仅在 commit 调用）；`commitPendingAgentPresetChangeFromAgent`（`:571-641`）校验 proposalId 匹配+sourceUpdatedAt 未变（防并发改写，`:596-602`）→ `updatePreset`/`setDefault`→审计。失败路径回滚 pending（try/catch restore，`:687-692` 同构于 switch）。
- **切换** `switchSessionPresetFromAgent`（`:646-709`）：以 `ctx.currentPresetReference`（query 开始时冻结，`:37-38`）为基准；目标不可用→源预设校验错；`dependencies.rebind` 切换（changed 标志）；失败 catch 回滚 rebind（`:687-692`）；结果含 `capabilityDiff`+`authorization:'explicit_user_intent'`+审计 eventId。
- **审计**：每个变更操作 `appendAudit` 生成 proposalAuditEventId/auditEventId（贯穿结果对象）。
- **审计日志落盘**：`appendFileSync` 到 `getConfigDir()` 审计文件（`:1,26`，路径函数 `:34` 前后文）——写副作用。

## 4. 调用者与调用链

- 入向：`agent-orchestrator`（域外，工具分派层，grep）；测试 `agent-preset-operations.test.ts` 12 用例。
- 出向：`./agent-preset-manager`（10 个函数 `:13-25`）、`./config-paths` `getConfigDir`（`:26`）、`./agent-session-manager` `getAgentSessionMeta`（`:27`）、`@profer/shared`（createEffectiveAgentPresetPolicy `:4-12`）。
- 测试注入：`PresetChangeOperationDependencies`/`SwitchOperationDependencies` 允许测试替换写入函数（真 manager + 假依赖混用，见 §9）。

## 5. 数据 I/O、读写与副作用

- 写：`appendFileSync` 审计日志（`:1` 导入，audit 路径函数 `:34`）；经 manager 写 agent-presets.json（create/copy/commit/switch）。
- pending 变更存内存（模块级 Map，`getPendingPresetChange`/`clearPendingPresetChange`）。
- 不改会话 meta 之外的系统状态；切换经 `rebind`（manager）。

## 6. 分支、失败、取消与恢复

- 失败：前置断言抛错文案（“只有用户发起的交互会话”/“当前用户消息没有明确请求…”/“当前工作区不可用的源预设”，测试 `:311-325`）；commit 时 proposal 不匹配/源已变→抛（`:596-608`）。
- 恢复：switch/commit 失败回滚（rebind 回原引用 `:687-692`；restorePreset `:690`）。
- 取消：无显式取消；pending 提案可 `clearPendingPresetChange` 丢弃。

## 7. 权限与权威状态

- **意图权威**：用户原文（`userMessage` 仅 orchestrator 注入，`:39-40`）→ `evaluateAgentPresetOperationIntents` 门禁；source!=='user' 全拒。
- **变更权威**：提案（pending）+ 用户确认（commit）两段；`sourceUpdatedAt` 防 TOCTOU。
- **审计权威**：每操作 appendAudit 事件 id 贯穿结果。
- 会话基准：`currentPresetReference` 冻结（query 开始时）。

## 8. 修改影响面

Agent 工具面的预设变更语义；manager 写入面连动；审计格式消费方（域外）；测试 12 断言锁定文案与结果形状。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-preset-operations.test.ts`（329 行/**12 个 `test(`**）：意图门禁 2（显式命令→单操作集 5 断言 `:42-48`；疑问/否定/无关→[] 10 断言含“请修改研究模式预设”→propose_update、“把极简预设设为默认”→propose_default `:50-61`）；提案 3（update 提案不落盘直到确认 `:65-93`，依赖替身记录 updateCalls）；创建/复制/切换组 7（含 `:311-328` 非 user 源/意图不匹配/源预设不可用三类拒斥+列表长度不变）。mock 边界：真 `createAgentPreset`（manager）+ 假依赖（updatePreset/setDefault/appendAudit/rebind 记录调用）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 意图门禁/两段式/回滚/审计贯穿 | 已证实 | 全 709 行逐行 + 12 测试互证 |
| `userMessage` 不可被工具参数覆盖 | 已证实（形状+注释） | `:39-40`；编排层注入点域外 |
| 审计文件路径/格式消费 | 边界 | config-paths/消费方域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 26 条 export（类型 12+函数 12+依赖接口 2） | §2 | 29-646 | covered |
| 门禁/提案/切换流程 | §3 | 236-709 | covered |
| 测试 12 用例 | §9 | test 文件 | covered（NOT_RUN） |
