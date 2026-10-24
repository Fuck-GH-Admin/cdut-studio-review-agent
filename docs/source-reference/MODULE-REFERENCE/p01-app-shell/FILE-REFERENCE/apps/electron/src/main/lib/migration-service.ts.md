---
path: apps/electron/src/main/lib/migration-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12f57046f6197d4c1e6f7d81b7475c5af4742fb5
sha256: d94b242fb7e5f0e89e4053f2122898ea65ff478730de7e348c7cee9daef356bc
lines: 1724
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/migration-service.ts

## 1. 结论与边界

数据迁移服务（1724 行，头注释 `:1-9`）：两种导出模式——`personal`（`.profer-backup` 个人全量备份，**含解密后 API Key 明文**）与 `share`（`.profer-share` 团队分发，凭据自动剥离）；v1 单工作区 + v2/v3 多工作区（`workspaces/<slug>/` 前缀）；导入侧解压（Zip Slip 防护）→预览（含跨平台路径映射建议）→确认导入（会话/技能/MCP/渠道/聊天工具/工作区配置/个人文件分类合并）。

**边界**：不实现 UI/IPC（调用方 `ipc.ts`）；路径/凭据安全原语依赖 `skill-path-security`（`assertSafeSkillSegment`）、`safe-file`（`writeJsonFileAtomic`）、`global-skill-manager`（`copySkillDirectorySafely`）、`channel-manager`（`listChannels`/`decryptApiKey`）、`config-paths`（全部存储路径，均跨批）；safeStorage 真机加解密、AdmZip 大包性能、跨平台真路径行为未验证（NOT_RUN）。

## 2. 导出与关键符号

**导出类型（17）**：`MigrationMode`（`:46`，`'personal'|'share'`）、`MigrationComponent`（`:47`，`'sessions'|'skills'|'mcp'|'channels'|'chattools'`）、`ExportOptions`（`:49-56`，`sessionIds?` 为空=全量）、`ExportResult`（`:58-62`，`{success,filePath,warnings?}`）、`ExportPreview`（`:64-71`）、`PathCheckResult`（`:73-77`，`{path,exists,suggested?}`）、`ImportPreview`（`:79-88`）、`ConfirmImportOptions`（`:90-99`，`pathMappings: Record<string,string|null>`（null=移除）、`conflictResolution?:'overwrite'|'skip'`）、`WorkspaceExportEntry`（`:134-140`，`skillSlugs/mcpServerNames: string[]|'all'`）、`ExportOptionsV2`（`:155-161`）、`WorkspaceSelection`（`:163-167`）、`ShareExportPreview`（`:169-173`）、`ShareExportWorkspacePreview`（`:175-179`）、`WorkspaceImportPreview`（`:181-190`，含 `conflictingSkills/conflictingMcpServers`）、`ImportPreviewV2`（`:192-200`）、`WorkspaceImportMapping`（`:202-207`，`action:'merge'|'create'|'skip'`）、`ConfirmImportOptionsV2`（`:209-218`）。

**导出函数（10）**：

| 符号 | 行 | 签名 | 说明 |
| --- | --- | --- | --- |
| `getExportPreview` | 222-258 | `(workspaceId) => Promise<ExportPreview>` | v1 导出预览统计 |
| `getShareExportPreview` | 260-285 | `() => Promise<ShareExportPreview>` | share 预览（全工作区） |
| `exportData` | 287-328 | `(options: ExportOptions) => Promise<ExportResult>` | v1 单工作区导出 |
| `exportDataV2` | 330-407 | `(options: ExportOptionsV2) => Promise<ExportResult>` | v2/v3 多工作区导出 |
| `__testSdkProjectKey` | 522-524 | `(projectDir) => string` | 测试暴露 `_sdkProjectKey` |
| `__testRewriteRuntimeCwd` | 580-582 | `(filePath, cwd) => void` | 测试暴露 `_rewriteRuntimeCwd` |
| `parseImportFile` | 844-969 | `(filePath) => Promise<ImportPreview \| ImportPreviewV2>` | 解压+预览 |
| `confirmImport` | 1027-1085 | `(options) => Promise<{success:boolean}>` | 确认导入（v1/v2 分派） |
| `assertSafeMigrationArchiveEntry` | 1679-1695 | `(entryName, targetDir) => void` | 单条目路径/Windows 名校验 |
| `assertSafeMigrationArchiveEntries` | 1704-1718 | `(entries, targetDir) => void` | 批量+归一化冲突检测 |

**内部关键函数（43，行号）**：`_collectRuntimeArtifactCandidates`（413-452）、`_findPiSessionArtifact`（454-474）、`_findClaudeSessionArtifact`（476-485）、`_addRuntimeArtifacts`（487-519）、`_sdkProjectKey`（526-532）、`_importRuntimeArtifacts`（535-578）、`_rewriteRuntimeCwd`（584-600）、`_addSessions`（602-642）、`_addSessionsMultiWorkspace`（644-689）、`_addSkills`（691-698）、`_addMcp`（700-712）、`_scrubMcpCredentials`（714-730）、`_addChannels`（732-749）、`_addChatTools`（751-763）、`_addWorkspaceConfig`（765-771）、`_addSkillsV2`（775-797）、`_addMcpV2`（799-819）、`_addWorkspaceConfigV2`（821-829）、`_addPersonalFiles`（831-840）、`_checkAttachedDirectories`（971-994）、`_checkAttachedDirectoriesV2`（996-1023）、`_confirmImportV2`（1087-1157）、`_importSessions`（1159-1239）、`_importSkills`（1241-1273）、`ensureImportedWorkspaceSkillId`（1275-1280）、`_importSkillOverrides`（1282-1299）、`_importMcp`（1301-1316）、`_importChannels`（1318-1349）、`_importChatTools`（1351-1372）、`_importWorkspaceConfig`（1374-1415）、`_importPersonalFiles`（1417-1432）、`_importSkillsV2`（1436-1469）、`_importMcpV2`（1471-1487）、`_importWorkspaceConfigV2`（1489-1532）、`_importSessionsV2`（1534-1608）、`readJsonSafe`（1612-1619）、`buildExportResult`（1621-1624）、`formatErrorMessage`（1626-1628）、`addExportWarning`（1630-1633）、`_addDirToZip`（1636-1658）、`assertWindowsSafeArchiveSegment`（1663-1676）、`windowsArchiveDestinationKey`（1697-1701）、`_safeExtractAll`（1721-1724）。常量：`WINDOWS_INVALID_ARCHIVE_SEGMENT`（`:1660`，`/[<>:"|?*\u0000-\u001f\u007f]/u`）、`WINDOWS_RESERVED_ARCHIVE_DEVICE`（`:1661`，con/prn/aux/nul/clock$/conin$/conout$/com[1-9¹²³]/lpt[1-9¹²³]）。内部类型：`RuntimeArtifactRef`（101-110）、`RuntimeArtifactsManifest`（112-115）、`MigrationManifest`（117-130，含 `runtimeArtifacts?` 旧备份兼容注释）、`MigrationManifestV2`（142-153，`version:'2.0'|'3.0'`）、`RuntimeArtifactCandidate`（409-411）。

## 3. 内部逻辑与关键流程

### 3.1 导出（v1 `exportData` `:287-328`）
1. 工作区不存在 → throw `工作区不存在: <id>`（`:292`）。manifest `version:'3.0'`（`:296`）含 platform/arch/homeDir/workspace 三元组（`:299-304`）。
2. `sessions` 组件：`_addRuntimeArtifacts`（候选来自 `_collectRuntimeArtifactCandidates`）→ `manifest.runtimeArtifacts`（`:310-314`）；`_addSessions`（`:315`）。
3. **manifest.json 在 sessions 之后、skills 之前写入 zip**（`:318`）——含 runtimeArtifacts 勾稽。
4. skills/mcp/channels/chattools 按组件（`:319-322`）；`_addWorkspaceConfig`（`:323`）；personal 才 `_addPersonalFiles`（`:324`）。`zip.writeZip(outputPath)`（`:326`）。

### 3.2 导出（v2 `exportDataV2` `:330-407`）
- `workspaceSelections` 非空按选择过滤（无效 id 静默丢弃 `:339-346`），否则全量（`:347-349`）；目标为空 → throw `'没有可导出的工作区'`（`:351`）。manifest `workspaces: WorkspaceExportEntry[]`（未指定 skillSlugs/mcpServerNames 记 `'all'`，`:353-359`）。
- sessions：同 v1 但 `_addSessionsMultiWorkspace`（`:374-381`）；skills 按工作区 `_addSkillsV2`（`:385-389`）；mcp 按 `_addMcpV2`（`:391-395`）；每工作区 `_addWorkspaceConfigV2`（`:397-399`）；channels/chattools/personal 文件同 v1（`:401-403`）。

### 3.3 runtime artifacts（导出侧）
- `_collectRuntimeArtifactCandidates`（`:413-452`）：遍历 sessions index，按 workspaceIds+filterIds 过滤，需 `sdkSessionId`（`:423`）；`agentRuntime==='pi'` → `_findPiSessionArtifact`（`getSdkConfigDir()/sessions/pi` 递归扫描，首行 JSON `type==='session' && id===sessionId` 才算命中，损坏文件忽略 `:454-474`）；否则按 claude 处理：`_findClaudeSessionArtifact`（`projects/<key>/<sessionId>.jsonl`，`:476-485`）。
- `_addRuntimeArtifacts`（`:487-519`）：pi 入 `runtime/pi/<sessionId>.jsonl`（`:496`）、claude 入 `runtime/claude/`（`:505`）；单文件失败 → warning 不中断（`已跳过 Pi/Claude 原生会话`，`:499`/`:515`）；返回 `RuntimeArtifactsManifest`。

### 3.4 会话/技能/MCP/渠道/工具导出
- `_addSessions`（`:602-642`）：agent messages（`sessions/agent/`）+ 会话工作目录递归（`sessions/workspace-data/<id>`，`:616-619`）；**index 过滤后写入**（仅 exportedIds，`:622-625`）；chat messages（`sessions/chat/`）+ conversations-index 过滤（`:628-641`）。
- `_addSkills`（`:691-698`）：active/inactive 目录 + `skills/skill-overrides.json`。`_addSkillsV2`（`:775-797`）：逐 skill 目录**跳过 symlink**（`:780`/`:789`）、`assertSafeSkillSegment` 后按 `workspaces/<slug>/skills/active|inactive/<name>` 入包（selectedSlugs 过滤 `:782`）。
- `_addMcp`（`:700-712`）：share 模式经 `_scrubMcpCredentials` 写 `config/mcp.json`（`:704-708`）；personal 原样（`:710`）。`_scrubMcpCredentials`（`:714-730`）：键名匹配 `/token|key|secret|password|auth|credential/i` 且值为字符串 → 置 `''`（递归数组/对象，`:716-728`）。`_addMcpV2`（`:799-819`）：按 `mcpServerNames` 过滤 servers 再按模式洗凭据。
- `_addChannels`（`:732-749`）：personal → `listChannels()` 后 `decryptApiKey(ch.id)` 解密成**明文 apiKey** 入 zip（异常→`''`，`:738-741`）；share → `apiKey:''`（`:745`）。
- `_addChatTools`（`:751-763`）：share → `toolCredentials:{}`（`:758`）；personal 原样。
- `_addWorkspaceConfig`（`:765-771`）：`config.json`→`config/workspace-config.json` + `workspace-meta.json`（工作区对象序列化）。`_addPersonalFiles`（`:831-840`）：settings/user-profile/cloud-auth 三件入 `auth/`（存在才加）。
- `_addDirToZip`（`:1636-1658`）：递归；目录读不了/文件加不了 → warning 降级（`:1641`/`:1654`），不中断导出。

### 3.5 解析预览 `parseImportFile`（`:844-969`）
1. tempDir = `tmpdir()/profer-import-<uuid>`（`:845-846`）；`_safeExtractAll`（`:849`）= 先 `assertSafeMigrationArchiveEntries(zip.getEntries(), tempDir)` 全量校验再 `extractAllTo(tempDir, true)` **覆盖式解压**（`:1721-1724`）。
2. 缺 manifest → 删 tempDir + throw `'无效的迁移文件：缺少 manifest.json'`（`:852-855`）；坏 manifest → 删 tempDir + throw `'无法解析 manifest.json'`（`:858-861`）。
3. 会话计数按 `sessions/agent|chat` 下 `*.jsonl` 数（`:865-872`）；`crossPlatform = sourcePlatform !== platform()`（`:874`）。
4. v2/3 + workspaces 分支（`:876-946`）：逐 workspaceSlug/skillSlugs `assertSafeSkillSegment`（`:877-880`）；每工作区算 skillNames/mcpServerNames 与本地同名冲突（`conflictingSkills/conflictingMcpServers`，`:899-921`）；`_checkAttachedDirectoriesV2`（`:935`）。
5. v1 分支（`:948-968`）：workspaceSlug 校验（`:949`）+ skillNames + hasMcp + `_checkAttachedDirectories`（源 home 前缀 → 建议映射到本机 home，`:981-993`）。

### 3.6 确认导入 `confirmImport`（`:1027-1085`）/ `_confirmImportV2`（`:1087-1157`）
- v2/3 + workspaces → `_confirmImportV2`（`:1031-1033`）。**finally 统一清理 tempDir（失败忽略，`:1078-1084`）**。
- v1 目标工作区：`createNewWorkspace` → 动态 import `createAgentWorkspace`（`:1039-1041`）；`targetWorkspaceId` → `getAgentWorkspace`（`:1042-1043`）；否则 slug 匹配 ?? 第一个（`:1044-1047`）；仍无 → throw `'无法确定目标工作区'`（`:1049`）。
- v1 组件序：sessions（`_importRuntimeArtifacts` 取 `piSessionFiles` 映射 → `_importSessions`，`:1051-1059`）→ skills（`:1060-1062`）→ mcp（`:1063-1065`）→ channels（`:1066-1068`）→ chattools（`:1069-1071`）→ `_importWorkspaceConfig`（`:1072`）→ personal 才 `_importPersonalFiles`（`:1073-1075`）。
- `_confirmImportV2`：workspaceMappings 显式映射（merge→targetWorkspaceId??slug、create→新建、skip→丢弃，`:1099-1114`）或默认（slug 匹配→merge，否则按 workspaceName 新建，`:1115-1125`）；逐映射 `_importSkillsV2`/`_importMcpV2`/`_importWorkspaceConfigV2`（`:1127-1135`）；sessions 用 `wsIdMap`（源 workspaceId→目标）+ fallback=`resolvedMappings[0]`（`:1137-1145`）；channels/chattools/personal 同 v1（`:1146-1154`）。

### 3.7 runtime artifacts（导入侧 `_importRuntimeArtifacts` `:535-578`）
- `!artifacts` → 空 Map 安全空操作（`:541`）；无 `proferSessionId` 跳过（`:549`）；目标工作区=wsIdMap 映射 ?? 第一个（`:543-546`）。
- pi：目标 `getSdkConfigDir()/sessions/pi/<basename>`；**已存在不覆盖**（`:560`）；复制后 `_rewriteRuntimeCwd(destination, sessionCwd)`（sessionCwd=`getAgentSessionWorkspacePath(target.slug, proferSessionId)`，`:557-562`）；`piSessionFiles.set(sessionId, destination)`（`:564`）。
- claude：目标 `projects/<_sdkProjectKey(sessionCwd)>/<sessionId>.jsonl`（`:567`），同样不覆盖+改写 cwd（`:569-574`，注释 `:571-572`：避免恢复后继续读写源机器路径）。
- `_rewriteRuntimeCwd`（`:584-600`）：逐行 JSON，合法行改 `cwd` 字段重序列化，坏行原样保留（`:592-593`）；**整体 try/catch 静默**（注释 `:598`：cwd 修正失败不阻断导入）。
- `_sdkProjectKey`（`:526-532`）：非字母数字→`-`；≤200 直接用；超长取前 200 + `-` + `Math.abs(hash31).toString(36)` 短哈希（`:529-531`）。注释（`:521`）：与 Claude Agent SDK 项目目录键规则一致（未与 SDK 源码对照，〔推断〕）。

### 3.8 会话导入 `_importSessions`（`:1159-1239`）/ `_importSessionsV2`（`:1534-1608`）
- agent jsonl 不覆盖同名（`:1172-1174`）；**index 合并不覆盖同 id**（`currentIds.has → skip`，`:1186-1193`），新条目 `workspaceId` 重绑目标工作区，`agentRuntime==='pi'` 补 `piSessionFile`（取 `runtimeSessionFiles` 映射，`:1191`）；index 整体回写（`:1195`）。
- workspace-data 递归复制不覆盖（`:1199-1208`）；chat jsonl 不覆盖（`:1211-1222`）；conversations-index 同口径合并（`:1224-1238`）。V2 版差异：workspaceId 按 wsIdMap/fallback（`:1561`）、workspace-data 落 fallbackWorkspace（`:1575`）。

### 3.9 技能导入 `_importSkills`（`:1241-1273`）/ `_importSkillsV2`（`:1436-1469`）
- active/inactive 逐目录（`isDirectory && !isSymbolicLink`）`assertSafeSkillSegment` → 冲突时 `overwrite` 才 rm+复制，否则 skip（`:1249-1252`）→ `copySkillDirectorySafely` + `ensureImportedWorkspaceSkillId`。
- `ensureImportedWorkspaceSkillId`（`:1275-1280`）：`.source.json` 无 `workspaceSkillId` → `writeJsonFileAtomic` 写 `randomUUID()`（已有非空字符串则不动）。
- `_importSkillOverrides`（`:1282-1299`）：**仅 `schemaVersion===1`**（`:1286`）；overwrite=true 导入优先 `{...current, ...imported}`，否则本地优先（`:1293-1295`）；`writeJsonFileAtomic` 写回。

### 3.10 MCP/渠道/工具/配置导入
- `_importMcp`（`:1301-1316`）/`_importMcpV2`（`:1471-1487`）：目标已存在→合并（overwrite: 导入 servers 覆盖同名；否则本地优先，`:1308-1310`）；否则 mkdir+cp。
- `_importChannels`（`:1318-1349`）：id 已存在跳过（`:1330`）；personal 且有 apiKey：`safeStorage.isEncryptionAvailable()` → `encryptString(...).toString('base64')`（`:1334-1335`）；**不可用→明文存储**（`:1337`）；异常→`''`（`:1339-1341`）；否则 `apiKey:''`（`:1344`）。
- `_importChatTools`（`:1351-1372`）：目标不存在→整文件 cp（`:1359-1362`）；合并 `toolStates` 不覆盖已有、`customTools` 追加（`:1366-1370`）。注意：merged 经 `{...current}` 保留本地既有 `toolCredentials`；**导入文件的 toolCredentials 不落入本地**（合并键只纳入 `toolStates`/`customTools`，`migration-service.ts:1366-1370`）。
- `_importWorkspaceConfig`（`:1374-1415`）/`_importWorkspaceConfigV2`（`:1489-1532`）：attachedDirectories/attachedFiles 三分支——映射 null=移除、映射字符串=替换、无映射且 existsSync=保留、无映射不存在=丢弃（`:1383-1402`）；与现有配置合并去重（`new Set`，`:1409-1413`）。
- `_importPersonalFiles`（`:1417-1432`）：**导入前把已存在目标备份为 `<dest>.backup-<Date.now()>`**（`:1425-1428`）再覆盖。

## 4. 调用者与调用链

- 入向（全冻结树检索 `migration-service` + 各导出）：
  - `apps/electron/src/main/ipc.ts` 动态 import 6 函数：`getExportPreview`（`ipc.ts:6778`）、`getShareExportPreview`（`ipc.ts:6783-6784`，channel `migration:getShareExportPreview` `ipc.ts:6782`）、`exportData`（`ipc.ts:6788`）、`exportDataV2`（`ipc.ts:6793-6794`）、`parseImportFile`（`ipc.ts:6798-6799`，channel `migration:parseImportFile`）、`confirmImport`（`ipc.ts:6803-6804`，channel `migration:confirmImport`）。preload 桥：`preload/index.ts:3784/3796/3800`。
  - `__testSdkProjectKey`/`__testRewriteRuntimeCwd`：仅测试调用（`migration-service.runtime-artifacts.test.ts:9-10/151/161-162`）。
  - `assertSafeMigrationArchiveEntry/Entries`：本文件内部（`:1710`/`:1722`）+ `migration-service.test.ts:72-118` 直接断言。
  - 批内 `migration-service.test.ts:32-39`（动态 import 6 导出）、`migration-service.runtime-artifacts.test.ts:8-13`（4 导出）。注意 `renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx:297` 的 `confirmImport` 是同名**局部函数**（UI 草稿替换），非本文件调用者（检索排除）。
- 出向：`node:fs`/`node:path`/`node:os`/`node:crypto`（`:11-14`）、`AdmZip`（`:15`）、`electron` `safeStorage`（`:16`）、`./config-paths` 16 个路径函数（`:17-36`）、`./agent-workspace-manager`（`:37`，含动态 `createAgentWorkspace` `:1040`/`:1092`）、`./channel-manager`（`:38`）、`./safe-file` `writeJsonFileAtomic`（`:40`）、`./skill-path-security` `assertSafeSkillSegment`（`:41`）、`./global-skill-manager` `copySkillDirectorySafely`（`:42`）。均跨批实现。

## 5. 数据 I/O、读写与副作用

- **磁盘读**：sessions/conversations index、messages jsonl、skills 目录、mcp.json、channels.json、chat-tools.json、workspace config、SDK 原生 transcript（`getSdkConfigDir()`）、临时解压目录。`readJsonSafe` 吞解析错误→null（`:1612-1619`）。
- **磁盘写**：zip 产物（`writeZip`）、导入目标（cpSync/writeFileSync/writeJsonFileAtomic）、sessions/conversations index 回写（`writeFileSync` 非原子，`:1195`/`:1237`）、`.source.json`（原子）、personal 备份（cpSync）。
- **凭据/敏感**：personal 导出渠道 **apiKey 解密明文入 zip**（`:738-743`）；personal 导入 apiKey：safeStorage 可用→加密 base64，**不可用→明文**（`:1331-1342`）；share 导出 `_scrubMcpCredentials`/`apiKey:''`/`toolCredentials:{}` 三重剥离。
- **副作用**：console.warn（`addExportWarning` `:1632`）；tempDir 创建/清理；`_importPersonalFiles` 覆盖前备份。无网络/遥测。
- **原子性/幂等**：index 合并按 id 去重（重复导入幂等）；文件复制 `if (!existsSync(dest))` 不覆盖（幂等）；skill/mcp 冲突受 `conflictResolution` 控制。

## 6. 分支、失败、取消与恢复

- **throw 点**：工作区不存在（`:292`）、无可导出工作区（`:351`）、缺/坏 manifest（`:854`/`:860`）、无法确定目标工作区（`:1049`）、安全校验失败（空条目 `:1681`、非法路径 `:1693`、Windows 非法字符/尾随点空格/设备名 `:1665`/`:1668`/`:1674`、路径冲突 `:1714`）。
- **降级不中断**：导出单文件失败→warning（`:499`/`:515`/`:1641`/`:1654`）；`decryptApiKey` 异常→`''`（`:740`）；`_rewriteRuntimeCwd` 整体静默（`:597-599`）；`readJsonSafe` 吞解析错误。
- **恢复**：`_importPersonalFiles` 先备份后覆盖（`:1425-1428`）；tempDir finally 清理（`:1078-1084`）；导入中途失败已写入的目标文件不回滚（无事务，照实记录——`confirmImport` 无整体回滚机制）。
- **取消**：不适用（无 AbortSignal/取消接口）。

## 7. 权限与权威状态

- 无 sender/role 检查（不适用，依据：本文件无 Electron IPC 守卫；IPC 入口在 `ipc.ts`，按 FACT-CHECKING-NOTES 口径不借 handler 守卫暗示本文件验证）。
- 路径安全权威=`assertSafeMigrationArchiveEntry(s)`（POSIX+win32 双 resolve 逃逸检测 `:1683-1693`、`\0`/点段/绝对路径拒绝、Windows 非法字符/保留设备名 `:1660-1676`、归一化冲突键 `windowsArchiveDestinationKey` 大小写不敏感模拟 `:1697-1701`）与 `assertSafeSkillSegment`（跨批）。Zip Slip 防护在 `extractAllTo` 之前全量校验（`:1721-1724`）。
- 凭据权威=electron `safeStorage`（可用性决定密文/明文分支 `:1334-1338`）；`decryptApiKey` 解密由 channel-manager 管理（跨批）。

## 8. 修改影响面

- IPC 契约：`migration:getExportPreview/getShareExportPreview/exportData(V2)/parseImportFile/confirmImport`（`ipc.ts:6777-6805` + preload `ipc.ts:3784-3800`）；返回形状变化影响 renderer 迁移向导 UI。
- manifest 版本兼容：`version '2.0'|'3.0'`+workspaces 分派（`:876`/`:1031`）；旧 v1（无 workspaces/无 runtimeArtifacts）必须继续可导入（`:128`/`:151` 注释）。
- `_sdkProjectKey` 与 Claude SDK 目录键规则耦合（`:521`）；改动会使旧 transcript 找不到（导入回退绑定）。
- 存储布局：`runtime/pi|claude` zip 前缀、`workspaces/<slug>/` 前缀、`auth/` 个人文件、index 合并语义——任何改动需同步两测试文件（`migration-service.test.ts`、`migration-service.runtime-artifacts.test.ts`）。
- 需同步修改的测试：上述 2 个批内测试文件。

## 9. 测试证据

直接测试（批内 2 文件，共 10 test，详见各自手册）：
- `migration-service.test.ts`（5 test，electron 全 mock、safeStorage 不可用）：归档条目穿越/绝对/点路径拒绝（`:72-78`）、Windows 非法名 10 项拒绝（`:96-99`）、归一化冲突拒绝+正常层级放行（`:104-118`）、v3 单工作区 skills round-trip 保留 override 状态（`:124-141`）、v3 多工作区 skills 按 workspace 保留（`:149-154`）。
- `migration-service.runtime-artifacts.test.ts`（5 test，无 mock、真实临时根）：选中 transcript 导出+manifest.runtimeArtifacts 记录+未选中不导出（`:92-98`）、导入映射工作区重绑 piSessionFile+cwd 改写（`:137-144`）、`__testRewriteRuntimeCwd` 坏行保留（`:154-156`）、`__testSdkProjectKey` 稳定/≤240/后缀（`:164-166`）、parseImportFile 暴露 runtimeArtifacts 且不动源文件名（`:183-187`）。

未覆盖：channels/chattools/workspace-config/personal 导入导出全链；`_importChannels` safeStorage 可用分支；overwrite 冲突路径；v1 全链（测试仅 v3/manifest 3.0）；`_scrubMcpCredentials` 正则面（无直接断言）；坏 zip/坏 manifest 抛错路径；`_confirmImportV2` workspaceMappings 三分支。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行；未真实执行导入导出。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出/内部函数/分支/合并语义/安全校验/敏感面 | 已证实 | `:1-1724` 全文逐行（3 段：1-440/441-880/881-1724） |
| 入向=ipc.ts 6 handler+preload 桥+两测试 | 已证实 | 全树检索（§4） |
| personal 导出明文 apiKey、导入明文兜底、cwd 改写静默、extractAllTo overwrite=true、index 不覆盖同 id | 已证实 | `:738-743`/`:1337`/`:597-599`/`:1723`/`:1186-1193` |
| `_sdkProjectKey` 与 Claude SDK 规则一致 | 推断 | `:521` 注释声明，未与 SDK 源码对照 |
| safeStorage 真机行为、AdmZip 大包性能、跨平台真路径 | 未知 | NOT_RUN |
| `_importChatTools` 导入侧 toolCredentials 不落本地（本地既有值经 `{...current}` 保留） | 已证实 | `migration-service.ts:1366-1370` 合并键仅 toolStates/customTools |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出类型 17 | §2 | 46-218 | covered |
| getExportPreview/getShareExportPreview | §2/§3.1 | 222-285 | covered |
| exportData/exportDataV2 | §3.1-3.2 | 287-407 | covered |
| runtime artifact 收集/导出/导入/cwd 改写/projectKey | §3.3/§3.7 | 409-600 | covered |
| sessions/skills/mcp/channels/chattools/workspace-config/personal 导出 | §3.4 | 602-840 | covered |
| parseImportFile + 路径检查 v1/v2 | §3.5 | 844-1023 | covered |
| confirmImport/_confirmImportV2 | §3.6 | 1027-1157 | covered |
| 会话/技能/MCP/渠道/工具/配置/personal 导入 | §3.8-3.10 | 1159-1532 | covered |
| readJsonSafe/工具/目录入包 | §2/§5 | 1610-1658 | covered |
| 归档安全校验（Windows 名/逃逸/冲突/Zip Slip） | §7 | 1660-1724 | covered |
| 测试证据 10 test | §9 | - | covered |
| channels/chattools/personal 测试面 | §9 | - | unknown（未覆盖） |
