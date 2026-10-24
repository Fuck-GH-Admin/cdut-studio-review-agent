---
path: apps/electron/src/main/lib/agent-workspace-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37310d5cb5cfb15ea1f901b0b0d5282b0ba16ce8
sha256: 0512b37fe958e7b3e81dbd9aaf7383e8b381cb46186ae986fa7fa970234fee25
lines: 1853
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-workspace-manager.ts

## 1. 结论与边界

Agent 工作区管理器（头注释 :1-7）：索引 `~/.proma/agent-workspaces.json`（轻量元数据，INDEX_VERSION=3 带幂等版本迁移 :36/:45-49）+目录 `~/.proma/agent-workspaces/{slug}/`。60 个导出覆盖 CRUD/skills/MCP/能力/记忆/文件树/附加目录/worktree 八组。生产消费面最广（27 文件，ipc.ts 最大入口）。

## 2. 导出与关键符号（60 条，按组）

- **索引/CRUD**（:40-:362/:1588/:1634/:1817）：readIndex（@internal :39）/writeIndex/listAgentWorkspaces/listAgentWorkspacesByUpdatedAt/reorderAgentWorkspaces/getAgentWorkspace/createAgentWorkspace/updateAgentWorkspace/deleteAgentWorkspace/ensureDefaultWorkspace/syncTeamWorkspacesToIndex/listWorkspacesByType/cleanupStaleWorkspaceAttachedPaths。
- **skills**（:395-:1002）：ensureClaudeSkillManifest/getWorkspaceSkills/parseSkillFrontmatter/createWorkspaceSkill/promoteWorkspaceSkillToGlobal/deleteWorkspaceSkill/scanSkillsInDir/getDefaultSkillSlugs/getAllWorkspaceSkills/toggleWorkspaceSkill/getOtherWorkspaceSkills/importSkillFromWorkspace/updateSkillFromSource/readWorkspaceSkillContent/writeWorkspaceSkillContent。
- **MCP/能力**（:417-:785）：getWorkspaceMcpConfig/saveWorkspaceMcpConfig/getWorkspaceCapabilities/getOtherWorkspacePresets/importPresetFromWorkspace。
- **profile/memory**（:1033-:1353）：getWorkspaceProfilePath/getWorkspaceAutoMemoryDir/getWorkspaceMemorySummary/readWorkspaceProfile/writeWorkspaceProfile/listWorkspaceAutoMemoryFiles/readWorkspaceAutoMemoryFile/writeWorkspaceAutoMemoryFile/getWorkspaceMemoryArchivePath/listWorkspaceMemoryArchiveFiles/readWorkspaceMemoryArchiveFile/writeWorkspaceMemoryArchiveFile。
- **skill 文件树**（:1462-:1550）：listSkillFiles/readSkillFile/writeSkillFile/createSkillEntry/deleteSkillEntry/renameSkillEntry。
- **附加目录/文件**（:1684-:1733）：getWorkspaceAttachedDirectories/attachWorkspaceDirectory/detachWorkspaceDirectory/getWorkspaceAttachedFiles/attachWorkspaceFile/detachWorkspaceFile。
- **worktree**（:1752-:1804）：getWorktreeRepos/addWorktreeRepo/removeWorktreeRepo。

## 3. 内部逻辑与关键流程（抽读核心段）

- `readIndex`（:40-54）：readJsonFileSafe+版本迁移（v1→v2 启用 skill-creator :56-60）。
- `createAgentWorkspace`（:190-）：重名拒（:196-198）；slug 经 `canonicalSkillSegmentKey` 去重+slugify（:201-202）。
- `deleteAgentWorkspace`（:309-）：不存在拒；`default` 不可删（:318-320）；至少保留一个（:321-323）；目录路径逃逸检查（relative 防 `..` :327-329）+联动 `deleteAgentSessionsByWorkspace`（:338）。
- skills 全链经 `skill-path-security`（assertSafeSkillSegment/canonicalSkillSegmentKey，20+ 调用点）。
- 写索引经 `writeJsonFileAtomic`（:124）。

## 4. 调用者与调用链

入向（子agent 交叉核，importer>8→计数）：**生产 27 文件+测试 13 文件**（grep 52 行）。最大：`src/main/ipc.ts:350-401`（约 52 符号 import 块+require :7362/:7706/:7884/:7894）；`main/index.ts:1079/:1100/:1140`（syncTeamWorkspacesToIndex）；`migration-service.ts:37`+动态（createAgentWorkspace）；`agent-preset-manager.ts:96/:949/:966`；其余 20+ 生产各 1 处（tray/remote-service/bridges/orchestrator:121/automation/pi-builtin-tools:89/workspace-mcp-config:7 再导出 getWorkspaceMcpConfig→agent-prompt-builder:20 间接）。出向：`./safe-file`（原子写 :10）、`./global-skill-manager`（:12）、`./config-paths`（:14-23）、`./git-diff-service`（:24）、`./skill-path-security`（:25）、`./agent-session-manager`（deleteAgentSessionsByWorkspace :338）、`./agent-preset-manager`（:27）。

## 5. 数据 I/O、读写与副作用

索引 JSON 原子读写；工作区目录/技能/记忆/附件文件系统操作；删除联动清会话。无网络。

## 6. 分支、失败、取消与恢复

CRUD 守卫（重名/默认保护/逃逸检查）；版本迁移幂等（:45-49）。不适用取消/恢复。

## 7. 权限与权威状态

技能路径安全（skill-path-security 20+ 断言）；目录逃逸检查（:327-329）；默认工作区不可删。

## 8. 修改影响面

27 生产消费文件（ipc.ts 最大）；需同步测试：`agent-workspace-archive.test.ts`（127 行）与 `agent-workspace-profile.test.ts`（75 行）**均直接测本模块**（无同名源文件）。

## 9. 测试证据

`agent-workspace-archive.test.ts`（127 行，存档/CRUD 能力，mock.module('electron')）+`agent-workspace-profile.test.ts`（75 行，profile/auto-memory）——断言细节见姊妹手册。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 60 导出按组清单+行号 | 已证实 | 导出图谱（子agent 交叉核+作者 grep） |
| CRUD 守卫/迁移/路径安全 | 已证实 | 抽读 :40-60/:190-202/:309-338 |
| 非抽读段逐行语义（skills/memory 全实现） | 推断（导出签名+调用点级） | 全文件大纲+抽读 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 60 导出（8 组） | §2 | :40-1817 | covered（图谱级） |
| CRUD/迁移/安全关键段 | §3 | :40-338 | covered |
| skills/memory 全实现 | §2/§10 | :395-1353 | 推断（签名级） |
| 测试 | §9 | — | covered（NOT_RUN，姊妹手册） |
