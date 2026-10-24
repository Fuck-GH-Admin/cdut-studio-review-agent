---
path: packages/shared/src/types/agent-preset-policy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a8a6d3a8c1109309075341a8c736e1588fdb5ae7
sha256: 3d6aea6b329626126779b576498da2a44de2aea5b59a7d0fa9058b6ca7f835f3
lines: 193
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-preset-policy.test.ts

## 1. 测试目标

`EffectiveAgentPresetPolicy` 的权限只降不升、Goal/普通入口一致性、组策略归一化、白名单语义、冻结防污染、会话级附加禁用（`packages/shared/src/types/agent-preset-policy.test.ts:30`）。

## 2. 用例清单

1 describe / 11 test。夹具：`preset(overrides)` 构造 `AgentPreset`（`:16-28`）、`reference`（workspace 引用，`:14`）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 外部 override 只能保持/收紧 | `plan+bypass→plan`、`auto+bypass→auto`、`bypass+plan→plan`、`bypass+auto→auto`、`plan+auto→plan` | `:31-37` |
| 2 | Goal 沿用预设/会话交集，不提权 | 三档 `permissionMode` + `triggeredBy:'goal'` 保持预设档；反向收紧到 `plan` | `:39-49` |
| 3 | Goal 与普通入口组合完全一致 | `goal toEqual normal`（双档×双 runtime）；短名/MCP 名/单工具禁用判定全 true | `:51-75` |
| 4 | 组策略归一化 + `allowSubagents:false`→collaboration | `disabledToolGroups==['browser','collaboration']`；`sessionCanUseSubagents:false`；`source==='workspace'` | `:77-93` |
| 5 | runtime 不支持子 Agent 同步禁协作组 | `runtimeSupportsSubagents:false` → 含 `collaboration`、`allowSubagents:false` | `:95-101` |
| 6 | undefined/空数组语义保留 + 去重 | 未限制时 `allowedSkillSlugs===undefined`、任意允许；`skillSlugs:[]`→全禁；`mcpServerNames` 重复去重 | `:103-121` |
| 7 | 组+单工具禁用合并（长/短名） | `WebFetch`/`mcp__collaboration__delegate_agent`/`BrowserObserve` 全 true；`getEffectiveDisabledToolNames` 含 4 名 | `:123-138` |
| 8 | 冻结嵌套数组 + loaded MCP 新快照 | 原数组被 push 污染不影响快照；`Object.isFrozen` 三层 true；`withLoadedMcpServerNames(['a','a','b'])`→`['a','b']` 且原快照不变 | `:140-156` |
| 9 | 显式隐藏段与禁用组映射去重 | `suppressPromptSections==['memory','task-graph']` | `:158-164` |
| 10 | 会话级附加禁用取并集 | `disabledToolGroups==['browser','automation','collaboration','clipboard']`、`disabledTools==['WebFetch','create_skin']`；`suppressPromptSections==['automation','subagents']`（自动映射）；3 工具名禁用 | `:166-186` |
| 11 | 无附加禁用时语义不变 | `disabledToolGroups==[]`、`disabledTools===undefined` | `:188-192` |

（源文件为 10 个 `test`（`:31`…`:188`），第 11 行为最后断言组。）

## 3. 真实断言

- `expect(resolveEffectivePermissionMode('plan', 'bypassPermissions')).toBe('plan')`（`:32`）。
- `expect(goal).toEqual(normal)`（`:64`）。
- `expect(Object.isFrozen(policy.preset.promptSections)).toBe(true)`（`:150`）。
- `expect(policy.suppressPromptSections).toEqual(['automation', 'subagents'])`（`:182`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`getEffectiveDisabledToolNames` 的组工具名全集（只断言含 4 名）；`shortToolName` 极端名（多段 `__`）。
- 脆弱点：断言绑定 `AGENT_PRESET_TOOL_GROUP_SUPPRESS_MAP` 映射表（automation→automation、collaboration→subagents，`:181` 注释）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例覆盖权限/一致性/冻结/白名单 | 已证实 | `:31-192` |
| Goal 不提权 | 已证实（断言） | `:39-49` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 权限只降不升 | 1-2 | `:31-49` | covered |
| Goal 一致性 | 3 | `:51-75` | covered |
| 组归一化/子 Agent | 4-5 | `:77-101` | covered |
| 白名单语义 | 6 | `:103-121` | covered |
| 禁用合并 | 7、10 | `:123-138`、`:166-186` | covered |
| 冻结/新快照 | 8 | `:140-156` | covered |
| 隐藏段映射 | 9 | `:158-164` | covered |
| 缺省语义 | 11 | `:188-192` | covered |
