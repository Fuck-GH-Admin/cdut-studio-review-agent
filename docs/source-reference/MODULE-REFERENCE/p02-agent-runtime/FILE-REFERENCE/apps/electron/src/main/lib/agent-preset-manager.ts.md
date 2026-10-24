---
path: apps/electron/src/main/lib/agent-preset-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6624a1fd2510f30694a60d6468fb0b0d6033e5e3
sha256: 67a7b0302dcfac825688abf99b05f7ac4215dcb65dfd7b46a619be78b20364d8
lines: 1501
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preset-manager.ts

## 1. 结论与边界

**Agent 预设管理服务（工作区级）**：每工作区 `agent-presets.json`（`~/.cdutai/agent-workspaces/{slug}/agent-presets.json`）+ 全局 `agent-presets.json`；内置预设（standard/code/minimal）以源码为准不可改删恒可见；无工作区仅内置三预设、自定义 CRUD 拒绝（`agent-preset-manager.ts:1-10`）。含会话绑定规范化、引用报告/改绑、导入导出、v3 迁移。写盘经 `writeJsonFileAtomic`（safe-file）。

## 2. 导出与关键符号

导出约 40 个（函数 30+ / 测试替身 5 / 类型再导出若干），核心：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| 测试替身 `__setAgentPresetsBaseDirForTest`/`__reset…`/`__setAgentPresetMigrationWorkspacesForTest`/兼容旧名 `__setAgentPresetsConfigPathForTest`/`__reset…` | `:54,59,65,70,74` | 覆盖基础目录/迁移工作区（`:46-52` 注释） |
| `listAgentPresets(workspaceSlug?)` | `:252` | 内置合并+自定义；`includeInactiveGlobal` 控制停用全局（`:240` 注释）；无工作区仅内置 |
| `getAgentPreset` / `getDefaultPresetId` / `setDefaultPresetId` | `:389,411,438` | 读/默认；default 缺失回 `DEFAULT_PRESET_ID`（`:342` 注释） |
| `createAgentPreset` / `copyAgentPreset` / `updateAgentPreset` / `deleteAgentPreset` | `:1174,1214,1249,1325` | 自定义 CRUD；非法 suppress key/工具组抛“非法的提示词段 key: …”/“非法的工具组: …”（`:384-403`）；内置不可改删；删除回滚默认引用 |
| `serializeAgentPresetsForExport` / `importAgentPresets` | `:1362,1451` | 导出 JSON/导入（重名自动改名 `renamedNames`，`:1477-1482`） |
| `normalizeSessionPresetId` | `:1497` | 会话预设规范化：缺失/未知→standard（历史兼容）；空串保留（`:1498-1500`）；**不能用 shared normalizePresetId**（只认内置会误回退自定义，`:1495` 注释） |
| `normalizePresetReference` / `resolvePresetReference` / `presetReferenceForId` | `:302,321,457` | 引用三元（presetId/scope/workspaceSlug）规范化与解析 |
| 全局预设族 `listGlobalAgentPresets`/`createGlobalAgentPreset`/`copyPresetToWorkspace`/`deleteGlobalAgentPreset`/`enableGlobalPresetInWorkspace`/`disableGlobalPresetInWorkspace`/`setWorkspacePresetEnabled`/`getGlobalPresetDeleteBlockers` | 分散：`listGlobalAgentPresets :285`、`setWorkspacePresetEnabled :1307` 等（无连续区间） | 全局/工作区双轨；删除全局前须改绑引用（`getPresetReferenceReport`） |
| `getPresetReferenceReport` | `:798` | 引用持久报告：会话/自动任务/默认/工作区作用域逐类 blockers；副本 source 元数据不算 blocker（`:792-797` 注释） |
| `rebindAndDisableGlobalPresetScope` | `:1022` | 改绑并停用全局 scope（依赖注入可测） |
| `setDefaultPresetReference` | `:860` | 默认引用（builtin/user-global/workspace 三 scope 校验） |
| `ensurePresetSystemReady` | `:635` | 迁移 v3：旧裸 presetId→presetReference（remap；备份+原子写；状态文件 `agent-preset-migration.json`）；幂等（状态 completed 跳过，`:1288`） |
| `restoreAgentPresetSnapshot` | `:1238` | 提案回滚用快照恢复 |

## 3. 内部逻辑与关键流程

- **配置读写**（内部）：`getConfigFilePath`/`getGlobalConfigFilePath`（`:79-88`，测试替身分叉）；`readConfig`/`writeConfig` 用 `readJsonFileSafe`/`writeJsonFileAtomic`（`:212-236`）；读时**过滤历史脏数据**（非法 suppress key/工具组剔除，测试 `:673-694`）。
- **内置合并**（`:238-304`）：BUILTIN_AGENT_PRESETS 以 shared 源码为准（`isBuiltin:true` 不落盘）；全局预设按工作区 scope/启用状态合成；无工作区→仅内置+default=standard。
- **CRUD 校验**：名称非空（`:382`）；suppress/工具组白名单（`AGENT_PRESET_SUPPRESS_KEYS`/`AGENT_PRESET_TOOL_GROUPS`）；`mergeAgentPreset` 合并更新；`writeJsonFileAtomic` 落盘。
- **迁移 v3**（`:1283-1331`）：读各工作区旧配置→`migrateLegacyReference`（`:768-778`，无 workspaceSlug 的裸引用记 failures 保留待处理 `:770-773`）→ sessions/automations 索引文件同步改写（`migratePresetReferencesInFile` `:780-790`，**改写前 backupPresetMigrationFile**）→ 状态文件 version:3/status completed|failed（`:752-765`）。
- **引用报告**（`:798-870`）：遍历 sessions（含归档）/automations/工作区作用域/默认引用，收集 blockers（reason 分类）；已归档/已暂停仍算引用（对象恢复会悬空，`:794-797`）。

## 4. 调用者与调用链

- 入向（grep 全树）：`agent-preset-operations.ts`（10 函数 import `:13-25`）、`ipc.ts`（PRESET 族 20+ 通道，nb-05 批已读 `ipc.ts:2725-2889`）、`agent-orchestrator`/`agent-service`（域外）、迁移自 `ensurePresetSystemReady`（调用点域外）。
- 出向：`@profer/shared`（内置预设/合并/校验常量 `:14-44`）、`./config-paths`（`:41`）、`./safe-file`（`:42`）、惰性 `require('./agent-workspace-manager')`/`agent-session-manager`/`automation-manager`（`:96,802-803`）。
- 测试：`agent-preset-manager.test.ts` **87 用例**（§9）+ `agent-preset-operations.test.ts` 间接。

## 5. 数据 I/O、读写与副作用

- 读写：`agent-presets.json`（每工作区+全局）、`agent-workspaces.json`/`agent-sessions.json`/`automations.json`（迁移改写，改前备份）、`agent-preset-migration.json`（迁移状态）。
- 原子性：`writeJsonFileAtomic`（safe-file，域外实现）；迁移文件先备份（`:788`）。
- 副作用：console.log 操作日志（`:1484` 等）；测试替身模块级状态（`:50-51`）。

## 6. 分支、失败、取消与恢复

- 失败：`AgentPresetError` 抛错族（名称空/非法 key/内置不可改删/无工作区 CRUD 拒/引用不存在/默认引用非法 scope）。
- 恢复：迁移失败→`failures[]` 记录+状态 failed（不半写，备份可回退，`:788`）；提案回滚 `restoreAgentPresetSnapshot`（`:1238`）；删除预设回滚默认引用。
- 取消：不适用（同步 CRUD）。

## 7. 权限与权威状态

- 内置预设权威=shared `BUILTIN_AGENT_PRESETS` 源码（不可改删，对全工作区恒可见）。
- 工作区隔离权威：每 slug 独立配置（A 区自定义 B 区不可见，测试 `:612-616`）；无工作区拒绝自定义（`:618-620`）。
- 引用完整性权威：删除全局前必须 `getPresetReferenceReport` 无 blocker 并改绑（`rebindAndDisableGlobalPresetScope`）。

## 8. 修改影响面

预设全链（ipc.ts PRESET 20+ 通道、preset-operations 工具面、orchestrator 会话启动）；`agent-presets.json` schema 变更需迁移；测试 87 断言大量锁定文案/形状。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-preset-manager.test.ts`（1221 行/**87 个 `test(`**，机械 grep 核；逐文件读毕）分组：Capability Registry 2（注册表一致性/工具元数据 `:80-96`）；listAgentPresets 6（极简内置关闭全部能力组+suppress 同步、工作区合成、无工作区仅内置等 `:99-`）；默认预设 5（读写/回退/工作区隔离）；会话规范化 5（未知→standard、空串保留、自定义保留）；CRUD 20+（创建校验/名称空拒/工作区隔离 `:612-616`/无工作区拒 `:618-620`/copy 三层一致 `:622-646`/非法 suppress key 与工具组拒且无残留 `:648-661`/null 清除不受校验 `:663-671`/历史脏数据读时过滤 `:673-694`/mcpServerNames 空数组=全禁 vs null=清除 `:696-`）；全局预设/引用报告/改绑 20+；导入导出 8（含 disabledTools 非法短名拒 `:1203-1210`、`filterDisabledTools` 双口径 `:1212-1220`）；迁移 `ensurePresetSystemReady` 5+（幂等/失败态/裸引用保留）。mock 边界：临时目录真文件 I/O（`__setAgentPresetsBaseDirForTest`），无 mock 库。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| CRUD/校验/工作区隔离/内置权威/迁移/报告语义 | 已证实 | 全 1501 行逐行 + 87 测试互证 |
| `writeJsonFileAtomic`/`readJsonFileSafe` 原子语义 | 边界 | safe-file 域外未深读 |
| shared 内置预设内容/合并规则 | 边界 | `@profer/shared` 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 40+ 导出（CRUD/全局/引用/迁移/替身） | §2 | 50-1501 | covered |
| 读写/迁移/报告流程 | §3 | 212-1331 | covered |
| 测试 87 用例 | §9 | test 文件 | covered（NOT_RUN） |
