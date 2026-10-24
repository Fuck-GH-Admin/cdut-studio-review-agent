---
path: apps/electron/src/main/lib/config-paths.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 952a2ca9aef8ef930af1e6f6f954557f67d6d6ab
sha256: 1d2394a1c81263d942ee2a81217e561812f4a78a0cdd8c271e9de39029f6e1a0
lines: 1385
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/config-paths.ts

## 1. 结论与边界

配置路径中枢 + **默认 Skill 种子同步**。全应用的 `~/.cdutai/`（或 `PROFER_CONFIG_DIR` 覆盖根 / dev `.cdutai-dev`）路径都从这里出（主进程内 143 个文件导入）。两大职责：

1. **路径解析**（94 条导出中的 ~85 条）：区分"纯解析"（`resolve*`，不落盘）与"隐式建目录"（多数 `get*Dir` 带 `mkdirSync`）；
2. **默认 Skill 种子同步**（`seedDefaultSkills` `:956-1041`）：基于目录哈希基线的"绝不覆盖用户修改"升级机制（managed/user-owned 双轨 + 历史出厂指纹接管）。

不做的事：不读写各配置文件内容（由 settings-service/channel-manager 等负责）；不做旧 Proma/Profer 目录迁移（`:69-72` 注释明确已随品牌移除）；无 IPC、无网络。

## 2. 导出与关键符号

导出 94 条（`grep -c '^export '` = 94）：2 const + 90 function + 2 测试钩子（含在 function 内）。按族分组（行号均真实）：

**根解析（4）**：`VITE_DEV_SERVER_PORT`（`:16`，`resolveDevVitePort()`）、`VITE_DEV_SERVER_URL`（`:18`）、`getConfigDirName`（`:33`，`PROFER_DEV=1`→`.cdutai-dev`，否则 `app.isPackaged` 判定，require 失败兜底 `.cdutai`，结果缓存 `_configDirName`）、`resolveConfigDir`（`:57`，**纯解析**：`PROFER_CONFIG_DIR` 优先）、`toDisplayPath`（`:63`，折叠 `~/`）、`getConfigDir`（`:80`，**mkdir**）。

**路径 getter 族（~80，签名均为 `(…ids) => string`，`join(getConfigDir(), …)`）**——按主题：

| 族 | 符号（行） | 落盘副作用 |
| --- | --- | --- |
| 渠道/账户 | `getChannelsPath:97`、`getCdutAccountPath:108`、`getCsLabSecurityPath:119` | 无（纯 join） |
| CDUT 缓存 | `getCdutScheduleCachePath:128`、`getCdutGradesCachePath:137` | 无 |
| 对话 | `getConversationsIndexPath:146`、`getConversationsDir:157`（**mkdir**）、`getConversationMessagesPath:174`、`getConversationDiscardedPath:187` | dir 建目录 |
| 附件/音效 | `getAttachmentsDir:198`（**mkdir**）、`getCustomSoundsDir:217`（**mkdir**）、`getConversationAttachmentsDir:236`（**mkdir**）、`resolveAttachmentPath:252`（纯 join） | 3 个 mkdir |
| 设置/档案/代理 | `getSettingsPath:261`、`getUserProfilePath:270`、`getProxySettingsPath:279` | 无 |
| 记忆 | `getMemoryConfigPath:288`、`getLongTermMemoryGraphPath:297`（`user-habit-graph.json`） | 无 |
| 预设/工具 | `getAgentPresetsPath:306`、`getGlobalAgentPresetsPath:311`（**与 :306 同一文件 `agent-presets.json`，照实记录**）、`getAgentPresetMigrationPath:316`、`getChatToolsConfigPath:325` | 无 |
| Agent 会话 | `getAgentSessionsIndexPath:334`、`getRuntimeProcessesPath:339`、`getAgentSessionsDir:350`（**mkdir**）、`getAgentSessionMessagesPath:367`、`getPiHarnessEventsPath:377`、`getPiCheckpointsDir:396`（**mkdir**） | 2 mkdir |
| 工作区 | `getAgentWorkspacesIndexPath:412`、`getAgentWorkspacesDir:423`（**mkdir**）、`getAgentWorkspacePath:442`（**mkdir**）、`getWorkspaceMcpPath:459`、`getWorkspaceAgentPresetsPath:472`、`getWorkspaceSkillsDir:484`（**mkdir**）、`getWorkspaceFilesDir:503`（**mkdir**）、`resolveWorkspaceFilesDir:522`（**纯**）、`resolveAgentSessionWorkspacePath:536`（**纯**）、`getInactiveSkillsDir:549`（**mkdir**）、`getAgentSessionWorkspacePath:1118`（**mkdir**） | 6 mkdir / 2 纯 |
| Skills | `getDefaultSkillsDir:566`（**mkdir**）、`getGlobalSkillsDir:577`（**mkdir**）、`getGlobalSkillsIndexPath:584`、`getUserGlobalSkillsDir:589`（**mkdir**）、`getBuiltinGlobalSkillsDir:596`（**mkdir**）、`getWorkspaceSkillOverridesPath:603`、`getWorkspaceRuntimeSkillsDir:608`（**mkdir**）、`getSkillSystemMigrationPath:615` | 5 mkdir |
| CLI/Skill 版本 | `getBundledCliPath:628`（打包 `resources/bin/profer[.exe]`，dev 返回 undefined）、`parseSkillVersion:641`（SKILL.md frontmatter `version`，失败/缺省 `'0.0.0'`，剥 BOM `:647`） | 只读 |
| 测试钩子 | `__setBundledSkillsDirForTest:762`、`__setLegacyBundledSkillDirectoryHashesForTest:935` | 无 |
| 种子同步 | `seedDefaultSkills:956`（见 §3.2） | 复制/替换/写状态 |
| IM 配置 | `getWeChatConfigPath:1048`、`getWeChatSyncPath:1057`、`getDingTalkConfigPath:1066`、`getFeishuConfigPath:1075`、`getFeishuBindingsPath:1084`、`getFeishuBotBindingsPath:1093`、`getFeishuBotMetadataPath:1104` | 无 |
| SDK/杂项 | `getSdkConfigDir:1139`（**mkdir**，注释：CLAUDE_CONFIG_DIR 隔离 `:1132`）、`getScratchPadPath:1155`、`getAutomationsPath:1164`、`getRecommendationsPath:1169`、`getBrowserStartPagePath:1178`、`getPlanningDatabasePath:1183` | 1 mkdir |
| 知识库 | `getKnowledgeBaseDir:1194`（**mkdir**）、`getKnowledgeItemsIndexPath:1206`、`getKnowledgeItemsDir:1211`（**mkdir**）、`resolveKnowledgeItemDir:1221`（**抛错**，见 §3.3）、`getKnowledgeItemDir:1232`（**mkdir**） | 3 mkdir |
| Study | `assertStudyId:1244`（**抛错**）、`getStudyMaterialsRootDir:1256`、`getStudySessionDir:1263`（`{create?}` 选项）、`getStudyDocumentDir:1272`（`{create?}`）、`getStudyDocumentIndexPath:1281`、`getStudentCognitionPath:1286`、`getStudyActiveDocumentsPath:1291`、`getStudySessionsRootDir:1300`、`getStudySessionDataDir:1307`（`{create?}`）、`getStudyTabsPath:1316`、`getStudyMindmapsPath:1321`、`getStudyFlashcardsPath:1326`、`getStudyQuizzesPath:1331`、`getStudyBenchmarkRuntimePath:1341` | 仅 `{create:true}` 时 |
| 设备/团队 | `getDeviceIdentityPath:1350`、`getTeamServersConfigPath:1359`、`getSyncStatePath:1368`、`getTeamSkillsCacheDir:1377`（**mkdir**） | 1 mkdir |

**内部符号**：`compareSemver:669`（三段数字比较）、`DEFAULT_SKILL_COPY_BLOCKLIST:681-690`（`.git/.DS_Store/node_modules/dist/.next/.cache/.turbo/__pycache__`）、`DEFAULT_SKILL_SEED_STATE_FILE:692`（`.seed-state.json`）、`DefaultSkillSeedOwner/Record/State:694-706`、`migrateRenamedDefaultSkills:714-757`、`defaultSkillCopyFilter:766`、`getBundledSkillsDir:770-776`（打包 `resources/default-skills` / dev `__dirname/../default-skills`）、`getDefaultSkillSeedStatePath:778`、`isDefaultSkillSeedRecord:782`、`readDefaultSkillSeedState:788-805`、`writeDefaultSkillSeedState:807`、`normalizeSkillFileForHash:815-819`（剥 BOM + CRLF→LF）、`hashDefaultSkillDir:821-839`（排序相对路径 + 内容 SHA-256，分隔 `\0`）、`LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES:848-933`（slug→历史出厂目录指纹数组）、`isKnownLegacyBundledSkill:941-944`、`LOCAL_PAPER_ID_RE:1218`（UUID）、`STUDY_ID_RE:1241`（`/^[A-Za-z0-9_-]+$/`）。

## 3. 内部逻辑与关键流程

### 3.1 根解析优先级

`getConfigDirName:33-49`：`PROFER_DEV=1` → `.cdutai-dev`；否则 `require('electron').app.isPackaged ? '.cdutai' : '.cdutai-dev'`（require 抛则 `.cdutai`）；结果 memoize 并打印一条 `[配置]` 日志。`resolveConfigDir:57-60`：`PROFER_CONFIG_DIR`（trim 后 `resolve`）优先于 `join(homedir(), getConfigDirName())`。`getConfigDir:80-90` 在其上 mkdir。**命名 vs 实际根分离**：`PROFER_CONFIG_DIR` 只改实际路径，不改默认名称（`:24` 注释）。

### 3.2 默认 Skill 种子同步 `seedDefaultSkills`（`:956-1041`）

1. `getBundledSkillsDir()`（`:770-776`：测试覆盖 → 打包 `process.resourcesPath/default-skills` → dev `__dirname/../default-skills`）；不存在则跳过（`:959-962`）。
2. `readDefaultSkillSeedState`（`:788-805`）：缺文件返回空态；**解析失败/格式非法一律降级为空态并 warn"保护已有元 Skill"**（`:800-804`）——宁可视为全 user-owned，绝不冒险覆盖。
3. `migrateRenamedDefaultSkills`（`:714-757`）：按 `RENAMED_DEFAULT_SKILLS`（`./default-skill-slugs`）rename 旧 slug→新 slug（目标存在则跳过并 warn 冲突 `:721-725`）；同步迁移 `default-skills-history/` 版本目录与 `.seed-state.json` 记录。
4. 遍历 bundled 目录每个子目录（`:971-1035`），逐个 try-catch（单 skill 失败不影响整体，`:1030-1034`）：
   - 记 `bundledHash = hashDefaultSkillDir(source)`、`bundledVer = parseSkillVersion(source)`（`:978-979`）。
   - **目标不存在** → `cpSync`（blocklist filter）+ 记 `{owner:'managed', bundledHash, bundledVersion}`（`:982-988`）。
   - **无可信基线**（无记录或 user-owned 且无 bundledHash，`:993`）→ 仅当 `isKnownLegacyBundledSkill`（目录指纹精确命中历史出厂表 `:941-944`）才 `rmSync+cpSync` 接管升级（`:995-1000`）；否则无记录时标 `{owner:'user-owned'}` 保留（`:1001-1005`）。
   - **`owner==='user-owned'`** → 跳过（`:1009`）。
   - **有基线**：现目录哈希 ≠ `record.bundledHash`（用户改过）→ 转 `user-owned` 保留（`:1013-1018`）；哈希未变且 `bundledVer > existingVer`（`compareSemver`）→ `rmSync`+`cpSync` 升级（`:1020-1029`；rm-then-cp 而非覆盖写，注释 `:1021-1023` 说明 0444 文件 EACCES 场景）。
5. 状态变更才 `writeDefaultSkillSeedState`（`:1037`）；整体 try-catch 兜底 warn（`:1038-1040`）。

哈希口径（`:815-839`）：逐文件"相对路径 + `\0` + 归一内容（剥 BOM、CRLF→LF）+ `\0`"累计 SHA-256，文件按 `localeCompare` 排序；blocklist 目录/文件不入哈希（与复制过滤一致）。

### 3.3 路径穿越防御（两个抛错点）

- `resolveKnowledgeItemDir:1221-1229`：itemId 必须匹配 UUID（`LOCAL_PAPER_ID_RE:1218`）且解析后目录必须在知识库根下（`startsWith(root + sep)`），否则 `throw new Error('资料标识无效')`；**只解析不创建**（注释 `:1220`：读取/删除场景不得隐式创建）。`getKnowledgeItemDir:1232-1236` 在其上 mkdir，仅供导入写入流程。
- `assertStudyId:1244-1249`：`STUDY_ID_RE` 白名单字符集，非法 `throw`（label 进错误消息），杜绝 renderer 传任意路径。

### 3.4 mkdir 语义分层（重要区分）

同族函数刻意区分：`resolveConfigDir`/`resolveWorkspaceFilesDir:522`/`resolveAgentSessionWorkspacePath:536`/`resolveAttachmentPath:252` 为**纯解析零副作用**（`resolveAgentSessionWorkspacePath` 注释 `:529-530` 明示供只读查询如 `/now`）；`get*Dir` 系列**隐式 mkdir + console.log**。禁止把"getter"一概当无副作用（§2 表格已逐条标注）。

## 4. 调用者与调用链

- 主进程内 **143 个文件** import 本模块（全量检索 `config-paths` import 计数），是 p01-app-shell 的路径权威。
- `seedDefaultSkills` 唯一启动调用点：`apps/electron/src/main/index.ts:1001`（bootstrap 的 `mainWindow.once('show')` 延迟块，顺序在 `ensureGlobalSkillSystemReady`/`ensurePresetSystemReady` 之后——见本批 main/index.ts 手册 §3.4）。
- `getBundledCliPath` 消费者：`agent-prompt-utils.ts`、`agent-runtime-env.ts`。
- 测试钩子消费者：`config-paths.test.ts:7-8`、`default-skill-slug-migration.test.ts:6-8`。
- `VITE_DEV_SERVER_URL` 消费者：`main/index.ts:198`（dev 导航）。
- 出向：`./default-skill-slugs.RENAMED_DEFAULT_SKILLS`（`:12`）、`./dev-instance.resolveDevVitePort`（`:13`）、`node:path/fs/crypto/os`、惰性 `require('electron')`（`:39`、`:772`、`:629`）。

## 5. 数据 I/O、读写与副作用

- **读**：`.seed-state.json`（`readFileSync` `:792`）、SKILL.md（`:646`、哈希采集 `:836`）、目录枚举（`readdirSync` `:824`/`:969`）。
- **写**：`.seed-state.json`（`:808`）、skill 目录 `cpSync`/`rmSync`/`renameSync`（`:730-742`、`:996-1025`）、mkdir 一族（§2 标注）。
- **副作用**：`console.log`/`console.warn` 多处（建目录日志、seed 事件日志、失败 warn）。
- **无网络、无 IPC、无遥测**；`PROFER_CONFIG_DIR`/`PROFER_DEV` 环境读取（`:35`、`:58`）。
- 幂等：`seedDefaultSkills` 可重复运行（测试即多次调用）；状态文件缺失可重建。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 结果 |
| --- | --- | --- |
| `PROFER_DEV`/`isPackaged`/require 失败 | `:35-43` | 目录名三态 + 缓存 |
| `.seed-state.json` 缺失/损坏/格式非法 | `:790`、`:800-804` | 空态（保护语义） |
| slug 迁移目标已存在 | `:721-725` | 跳过 + warn 保留双方 |
| slug rename 抛 | `:732-735`、`:743-745` | warn + continue |
| 单 skill 同步抛 | `:1030-1034` | warn + 跳过该 skill |
| 整体同步抛 | `:1038-1040` | warn（启动不中断） |
| SKILL.md 缺失/无 frontmatter/解析抛 | `:643`、`:649`、`:658-660` | 版本 `'0.0.0'` |
| itemId 非 UUID/穿越 | `:1222-1227` | **throw** |
| study id 非法 | `:1245-1247` | **throw** |
| `getBundledCliPath` dev 模式 | `:630` | `undefined`（调用方回退源码运行，`:623-624` 注释） |

无取消/重试概念；失败恢复靠下次启动重跑 seed。

## 7. 权限与权威状态

- 本文件是**路径权威**：所有落盘位置的唯一出口，`PROFER_CONFIG_DIR` 覆盖贯通（`:54` 注释）。
- **安全语义**：`resolveKnowledgeItemDir`/`assertStudyId` 是 renderer 可触达路径的白名单闸门（抛错而非清洗）；`.seed-state.json` 的 `bundledHash` 基线是"用户修改 vs 出厂内容"的裁决依据——**用户改动永远赢**（`:954` 注释"绝不覆盖"、`:801-802` 降级保护）。
- `LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES`（`:848`）是出厂指纹白名单，key 必须与 slug 一致（`:846` 注释防同内容误迁移）。
- 无 sender/角色概念（纯函数库）；权限边界在 IPC 层。

## 8. 修改影响面

- 143 个导入文件：改 getter 名/返回路径会波及全主进程；改 `getConfigDirName` 缓存语义影响 dev/prod 隔离。
- `seedDefaultSkills` 与 `default-skill-slugs.RENAMED_DEFAULT_SKILLS`、`LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES`、`hashDefaultSkillDir` 口径强耦合；改哈希归一规则（`:815-819`）会让全部历史指纹失配 → 已接管 skill 会误判 user-owned（保守侧失败，安全）。
- 与 `global-skill-manager`/`agent-preset-manager` 的启动顺序耦合（`main/index.ts:995-1003`）。
- 测试同步：`config-paths.test.ts`（12 个用例）、`default-skill-slug-migration.test.ts`（2 个）直接 import 测试钩子与 `seedDefaultSkills`。
- `getAgentPresetsPath`/`getGlobalAgentPresetsPath` 同文件重叠（`:306`/`:311`）：拆分需同步 `agent-preset-manager` 等所有消费者。

## 9. 测试证据

**直接测试** `apps/electron/src/main/lib/config-paths.test.ts`（**12 个 `test(`**，2 个 describe）：

- 夹具（`:16-45`）：`makeRoot` mkdtemp + `PROFER_CONFIG_DIR` 指向临时根（`:17` 保存原值，`afterEach:47-53` 还原 + 删临时目录）；`writeBundledSkill`（`:30-37`）写带 frontmatter 的 SKILL.md；`seedState`（`:43-45`）读 `.seed-state.json`。
- `describe('getConfigDir')` 3 个：`:56` 断言 `getConfigDir()===override` 且目录被创建（`:61-62`）；`:65` 断言 `resolveConfigDir()===override` 且**不创建目录**（`:70-71`）；`:74` 断言 `toDisplayPath` 折叠 `~/`、非 home 原样、home 自身不变（`:76-80`）。
- `describe('seedDefaultSkills')` 9 个：`:85` 新装→写入 managed+`bundledVersion:'1.0.0'`+`bundledHash` 真值（`:92-95`）；`:98` 未改动受管→1.0.0→1.0.1 自动替换（`:107-108` 断言新正文+managed）；`:111` 只改 frontmatter→保留用户描述与旧正文、标 `user-owned`（`:122-124`）；`:127` 改正文→保留+user-owned（`:137-138`）；`:141` 加附属文件→目录不覆盖、附属文件在、user-owned（`:151-153`）；`:156` 无机制前旧 Skill→保留用户原有正文、`toEqual({owner:'user-owned'})`（`:164-165`）且后续版本升级仍不覆盖（`:169-170`）；`:173` 无状态但指纹精确命中历史出厂→接管升级 1.0.1 managed（`:184-185`，用 `__setLegacyBundledSkillDirectoryHashesForTest` 注入指纹 `:179`）；`:188` 历史 Skill 带用户附属文件→不接管不覆盖、user-owned（`:200-202`）；`:205` 旧版误标 user-owned 的完整历史种子→仍接管升级 managed（`:217-218`）。
- 间接 `default-skill-slug-migration.test.ts`（2 个 `test(`）：`:43` 断言 slug 迁移（master/history/seed 状态同迁）、`:61` 断言目标已存在时新旧都保留。
- **未覆盖**：~85 个路径 getter 的返回值本身（只测 `getConfigDir`/`resolveConfigDir`/`toDisplayPath`/`getDefaultSkillsDir` 经由）、`parseSkillVersion`/`compareSemver`/`hashDefaultSkillDir` 仅间接、`getBundledCliPath`、`assertStudyId`、`resolveKnowledgeItemDir`（含穿越抛错）、study 一族、IM/设备/团队 getter、`migrateRenamedDefaultSkills` 冲突分支（`:721-725`）。
- `NOT_RUN`：本轮未执行测试/typecheck/build；以上为静态阅读断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 94 条导出；根解析三优先级 + memoize | 已证实 | `grep -c '^export '`；`:33-49` |
| `resolve*` 纯解析 vs `get*Dir` 隐式 mkdir 的分层 | 已证实 | `:52`、`:529-530` 与 §2 表 |
| seed 决策树（缺失/无基线/user-owned/哈希变/版本升） | 已证实 | `:982-1029` |
| 用户修改永远保护；状态损坏降级保护 | 已证实 | `:1013-1018`、`:800-804`、`:954` |
| rm-then-cp 因 0444 文件 EACCES | 已证实 | `:1021-1023` 注释 + `:1024-1025` |
| 哈希归一剥 BOM/CRLF | 已证实 | `:815-819` |
| `getAgentPresetsPath` 与 `getGlobalAgentPresetsPath` 同一文件 | 已证实 | `:306-313` |
| 两个路径闸门抛错（UUID/STUDY_ID） | 已证实 | `:1222-1227`、`:1245-1247` |
| 测试 12+2 个用例断言如上 | 已证实 | `config-paths.test.ts:56-218`、`default-skill-slug-migration.test.ts:43-61` |
| `LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES` 各指纹对应的真实出厂版本 | 未知 | 表只存哈希（`:848-933`），无版本标注 |
| 143 个消费者各自对 getter 副作用的依赖 | 未知 | 未逐一读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 94 导出分族 | §2 | 全文件 | covered |
| 根解析/memoize | §3.1 | `:33-60` | covered |
| seed 决策树 | §3.2 | `:956-1041` | covered |
| 哈希口径 | §3.2 | `:815-839` | covered |
| 路径穿越闸门 | §3.3 | `:1218-1249` | covered |
| mkdir 分层 | §3.4 | §2 表 | covered |
| 调用者/出向 | §4 | 跨文件 | covered |
| I/O 与副作用 | §5 | — | covered |
| 失败分支表 | §6 | — | covered |
| 权威/安全语义 | §7 | `:848`、`:954` | covered |
| 影响面 | §8 | 跨文件 | covered |
| 12+2 测试断言/缺口 | §9 | 测试文件 | covered |
| 指纹版本溯源/消费者依赖 | §10 | — | unknown |
