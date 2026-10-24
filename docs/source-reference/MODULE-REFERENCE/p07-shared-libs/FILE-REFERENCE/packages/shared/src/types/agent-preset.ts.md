---
path: packages/shared/src/types/agent-preset.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb46954ed3d7da4172b69f4f4decda61da053702
sha256: bfa788e82115d834f54849f512f1dda157ac09b288b2313cb78c4acce2966aab
lines: 822
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-preset.ts

## 1. 结论与边界

Agent 预设**定义/能力组/内置预设/合并导出**模块（`packages/shared/src/types/agent-preset.ts`，822 行）：预设形状与三档 scope、能力组表（工具+风险+提示词段映射）、3 个内置预设、导出/导入/合并逻辑。被 `agent-preset-policy.ts` 作为上游依赖。

## 2. 导出与关键符号

`export` 共 **44 个**（grep 全表），分 8 组：

**A. 引用与错误（`:20-93`）**：`AgentPresetScope`（`builtin-meta/user-global/workspace`，`:20`）、`PresetReference`（`:23-30`）、`PresetErrorCode`（`:32-41`）、`AgentPresetMigrationStatus`（`:43`）、`AgentPresetMigrationDiagnostic`（`:45`）、`PresetWorkspaceReference`（`:51`）、`PresetReferenceReport`（`:62`）、`PresetScopeRebindResult`（`:72`）、`AgentPresetError`（class，`:83-93`）。

**B. 提示词段抑制（`:96-103`）**：`AGENT_PRESET_SUPPRESS_KEYS`（`:96-100`）、`AgentPresetSuppressKey`（`:102`）。

**C. 能力组（`:105-331`）**：`AgentPresetCapabilityRisk`（`read/write/external/destructive`，`:105`）、`AgentPresetCapabilityTool`（`:108`）、`AgentPresetCapabilityGroup`（`:116`）、`AGENT_PRESET_CAPABILITY_GROUPS`（`:157-307`，全工具组表）、`AgentPresetToolGroup`（`:309`）、`AGENT_PRESET_TOOL_GROUPS`（`:313`）、`AGENT_PRESET_GROUP_TOOL_NAMES`（`:318`）、`AGENT_PRESET_TOOL_NAMES`（`:323`）。

**D. 速课堂禁用（`:333-341`）**：`STUDY_CLASS_DISABLED_TOOL_GROUPS`（`:333`）、`STUDY_CLASS_DISABLED_TOOLS`（`:341`）。

**E. 查询函数（`:344-394`）**：`getAgentPresetCapabilityTool`（`:344-354`，按短名查工具）、`getAgentPresetCapabilityTools`（`:356-364`，按 runtime 过滤）、`filterDisabledTools`（`:366-376`，按禁用组/短名过滤）、`isAgentPresetToolGroupDisabled`（`:378-392`）、`AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP`（`:394`，组→隐藏段映射）。

**F. 预设形状（`:397-488`）**：`AgentPreset`（`:397-453`）、`AgentPresetConfig`（`:455`）、`GlobalAgentPresetConfig`（`:473`）、`OtherWorkspacePresetsGroup`（`:481`）。

**G. 内置预设（`:490-598`）**：`BUILTIN_PRESET_STANDARD/CODE/MINIMAL`（`:490-492`）、`BUILTIN_AGENT_PRESETS`（`:534-590`，3 个）、`DEFAULT_PRESET_ID`（`:592`）、`normalizePresetId`（`:600-606`）。

**H. 导入/导出/合并（`:608-777`）**：`AgentPresetCreateInput`（`:608`）、`AgentPresetUpdateInput`（`:633`）、`AgentPresetExportEntry`（`:656`）、`AgentPresetExportFile`（`:673`）、`AgentPresetImportResult`（`:682`）、`toAgentPresetExportEntry`（`:689-730`）、`mergeAgentPreset`（`:732-775`）、`AGENT_PRESET_IPC_CHANNELS`（`:777`）。

## 3. 内部逻辑与关键流程

- **能力组构造**（`:130-154`）：`capabilityTool`/`capabilityGroup` 内部工厂生成组（含 `toolNames`/`runtimes`/`risk`/`suppressPromptSections`）。
- **查询**（`:344-392`）：短名=`tool.name.split('__').at(-1)`（`:373`）；`filterDisabledTools` 排除禁用组工具与 `disabledTools` 短名。
- **`normalizePresetId`**（`:600-606`）：内置 ID 白名单校验，否则回落 `DEFAULT_PRESET_ID`（`standard`）。
- **`mergeAgentPreset`**（`:732-775`）：基座合并（builtin-meta→global→workspace 语义由调用方组织）；**普通字段取非空，数组整体替换不拼接**（函数体语义）。
- **`toAgentPresetExportEntry`**（`:689-730`）：导出时剔除不稳定字段（scope 归属/workspaceSlug 等）。

## 4. 调用者与调用链

- 消费方：`agent-preset-policy.ts`（`AgentPreset`/`AGENT_PRESET_CAPABILITY_GROUPS`/`AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP`）、preset Manager、设置 UI。
- 出向：无模块依赖（自足）。

## 5. 数据 I/O、读写与副作用

纯数据/函数；内置预设为常量数组。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非法 presetId | `:600-606` | 回落 `standard` |
| 短名查不到工具 | `:344-354` | `undefined` |
| 导入非法 | `:682` | 结构化 `AgentPresetImportResult` |

## 7. 权限与权威状态

能力组的 `risk`（read/write/external/destructive）是工具风险分级；禁用/隐藏映射是预设门禁的数据源（policy 层消费）。

## 8. 修改影响面

- `AGENT_PRESET_CAPABILITY_GROUPS` 是全工具清单；新增工具须入组，否则 `filterDisabledTools`/`getEffectiveDisabledToolNames` 不覆盖。
- `AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP` 驱动提示词隐藏段（policy 测试锁定 automation/collaboration 映射）。
- `mergeAgentPreset` 数组替换语义改动会影响预设继承。

## 9. 测试证据

- `agent-preset-policy.test.ts` 间接覆盖（消费本模块表）；本文件**无专属测试**在本批 scope（全树检索 `mergeAgentPreset`/`normalizePresetId` 测试命中见 preset 服务测试，不在本批）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 44 个导出、8 组 | 已证实 | `grep -n "^export"` 全表 |
| 短名=`split('__').at(-1)` | 已证实 | `:373` |
| `normalizePresetId` 回落 standard | 已证实 | `:600-606` |
| `mergeAgentPreset` 数组整体替换 | 已证实（函数体） | `:732-775` |
| 3 内置预设内容 | 已证实 | `:534-590` |
| preset Manager 行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 引用/错误 | `:20-93` | covered |
| B 抑制键 | `:96-103` | covered |
| C 能力组 | `:105-331` | covered |
| D 速课堂 | `:333-341` | covered |
| E 查询 | `:344-394` | covered |
| F 预设形状 | `:397-488` | covered |
| G 内置/归一化 | `:490-606` | covered |
| H 导入导出合并 | `:608-777` | covered |
