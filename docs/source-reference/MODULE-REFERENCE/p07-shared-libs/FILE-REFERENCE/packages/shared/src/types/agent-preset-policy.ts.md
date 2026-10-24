---
path: packages/shared/src/types/agent-preset-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 55b3f7e607c9d2085ef229c5a087b10cfa17d4a8
sha256: f7d0ecf7fc6838dbb4e7ab9c3a8df431031fc42941226010fe3ccd47ea9b4008
lines: 256
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-preset-policy.ts

## 1. 结论与边界

Agent 预设的**有效运行策略**（`packages/shared/src/types/agent-preset-policy.ts:1-7`）：只含与运行时无关的策略解释，不读文件/不访问 Electron/MCP。Manager 解析/合并预设；runtime 在 query 开始时创建并**冻结快照**，后续会话切换只影响下一轮。

## 2. 导出与关键符号

`export` 共 **12 个**（3 type/interface 语义组 + 9 函数）。

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `EffectiveAgentPresetPolicySource` | `:23-26` | `builtin`/`global`/`workspace` |
| `EffectiveAgentPresetSnapshot` | `:28-38` | `AgentPreset` 的不可变数组版（Omit 6 字段后 readonly 复述） |
| `EffectiveAgentPresetPolicy` | `:40-68` | 18 字段冻结策略（含 `allowSubagents`/`sessionCanUseSubagents`/`permissionMode`/`pptCapabilityActive`） |
| `EffectiveAgentPresetPolicyOptions` | `:70-83` | 7 可选项（`triggeredBy:'goal'`、`extraDisabledToolGroups/Tools` 等） |
| `resolveEffectivePermissionMode` | `:90-102` | 权限严格度取严 |
| `createEffectiveAgentPresetPolicy` | `:148-197` | 建冻结快照 |
| `withLoadedMcpServerNames` | `:199-207` | 替换已加载 MCP 名单（新冻结对象） |
| `isEffectiveAgentPresetToolGroupDisabled` | `:209-214` | 组级判定 |
| `isEffectiveAgentPresetToolDisabled` | `:220-229` | 单工具判定（短名） |
| `getEffectiveDisabledToolNames` | `:232-242` | 组+单工具统一短名集 |
| `isEffectiveAgentPresetSkillAllowed` | `:244-249` | Skill 白名单（undefined=不裁剪） |
| `isEffectiveAgentPresetMcpServerAllowed` | `:251-256` | MCP 白名单（同语义） |

内部：`sourceForScope`（`:104-110`）、`uniqueStrings`（`:112-115`）、`clonePreset`（`:117-140`，`Object.freeze` 数组副本防污染）、`shortToolName`（`:216-218`，取 `__` 后最后一段）。

## 3. 内部逻辑与关键流程

### 3.1 `resolveEffectivePermissionMode`（`:90-102`）

严格度 `plan:0 < auto:1 < bypassPermissions:2`；`requestedOverride` 只有**更严**才生效（`:101`）——注释明示外部入口不能借 override 静默放宽（`:87-89`）。默认 `PROFER_DEFAULT_PERMISSION_MODE`（`agent.ts`）。

### 3.2 `createEffectiveAgentPresetPolicy`（`:148-197`）

1. 禁用组 = 预设 `disabledToolGroups` ∪ `extraDisabledToolGroups`；`allowSubagents===false` 或 `runtimeSupportsSubagents===false` → 追加 `collaboration`（`:155-157`）。
2. 单工具禁用 = 预设 ∪ extra；**任一侧有值才输出**（保留 `undefined`=不裁剪，`:158-169`）。
3. `suppressPromptSections` = 预设显式隐藏 ∪ 组级禁用自动映射（`AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP`，`:170-177`）。
4. Skill/MCP 白名单仅在预设有声明时输出（`uniqueStrings` 去重冻结，`:178-186`）。
5. `allowSubagents = !disabledToolGroups.has('collaboration')`；`sessionCanUseSubagents = runtimeSupports===true && 同上`（`:187-189`）。
6. `permissionMode` 走 `resolveEffectivePermissionMode`（Goal 循环不提权，`:190-191`）；`source` 由 `presetReference.presetScope ?? preset.scope` 映射（`:194`）。

### 3.3 判定函数

`isEffectiveAgentPresetToolDisabled`（`:220-229`）：先查 `disabledTools` 短名，再查禁用组内 `AGENT_PRESET_CAPABILITY_GROUPS` 的 `toolNames`。`getEffectiveDisabledToolNames`（`:232-242`）合并两源。Skill/MCP 判定：`allowedX === undefined || includes`（`:248`、`:255`）。

## 4. 调用者与调用链

- 消费方：Agent runtime（query 冻结快照）、Manager（预设合并）、工具/Skill/MCP loader（禁用判定）。
- 出向：`./agent-preset`（`AgentPreset`/`AGENT_PRESET_CAPABILITY_GROUPS`/`AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP`）、`./agent`（`AgentEffort`/`ProferPermissionMode`/`PROFER_DEFAULT_PERMISSION_MODE`）。

## 5. 数据 I/O、读写与副作用

纯函数 + `Object.freeze`；无 I/O、无状态（快照不可变）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| override 更松 | `:101` | 忽略（保持预设上限） |
| `allowSubagents:false`/runtime 不支持 | `:155-157` | 统一折算 `collaboration` 禁用 |
| `disabledTools` 双侧空 | `:167-169` | 输出 `undefined`（不裁剪） |
| 白名单未声明 | `:178-183` | `undefined`（不裁剪） |

无抛错路径。

## 7. 权限与权威状态

- 权限只降不升（`:87-101`）是核心权威主张。
- `runtimeSupportsSubagents` 由编排器注入、预设不可伪造（`:59-60`）。
- 快照冻结即 query 权威（`:118`、`:196`）。

## 8. 修改影响面

- `AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP`/`AGENT_PRESET_CAPABILITY_GROUPS` 变更影响禁用映射。
- `undefined` vs `[]` 语义（不裁剪 vs 全禁）是 Skill/MCP loader 契约，改动会破坏「全部禁用」表达（`:145-146`）。
- 无存储/迁移。

## 9. 测试证据

- `agent-preset-policy.test.ts`（193 行）直接覆盖（见该测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个导出 | 已证实 | 全文 |
| 权限只降不升 | 已证实 | `:87-102` |
| collaboration 统一折算 | 已证实 | `:155-157` |
| undefined=[] 语义区分 | 已证实 | `:145-146`、`:167-169` |
| Manager/runtime 接线 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 个导出 | 2 | — | covered |
| 权限解析 | 3.1 | `:90-102` | covered |
| 快照构建 | 3.2 | `:148-197` | covered |
| 判定函数 | 3.3 | `:209-256` | covered |
| 测试证据 | 9 | — | covered |
