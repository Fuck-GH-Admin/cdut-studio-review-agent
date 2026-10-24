---
path: apps/electron/src/main/lib/channel-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddceb4222d8be6e871980014b8136d906664a7b6
sha256: 691657d96553782dcb20e4d40b6d62ce46d5be6b947c29eb8a036c66b1bd70d3
lines: 1849
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-manager.ts

## 1. 结论与边界

**渠道管理器**（1849 行，本批最大源文件）：渠道 CRUD、API Key 加解密（safeStorage）、连通性测试、模型拉取、OAuth 凭据（Codex/xAI）持久化与刷新、登出备份/恢复、服务端渠道同步、订阅 Plan/余额查询。28 个导出、约 35 个内部函数。持久化 `~/.cdutai/channels.json`（**头注释 `:6` 写 `~/.proma` 为旧名残留**，矛盾①）。

不做的事：无 IPC 注册（零 ipc 引用，纯函数库由外部 IPC 层调用）；不定义类型（`@profer/shared`）。

## 2. 导出与关键符号

**配置/渠道 CRUD**：`applyPresetModelCandidateUpdates:69-91`（GLM-5.3 候选一次性迁移，幂等）；`resolveChannelAgentBaseUrl:102`（委托 channel-url-routing）；`mergeServerChannelModels:113-126`（保留本地 enabled/context1m）；`listChannels:510`（**不造占位渠道**）；`getChannelById:519`；`createChannel:530-557`（UUID/加密/agentRuntimes 默认 ['pi']）；`updateChannel:566-662`（官方代管只许启停 `:568-585`、商业无自配只许 enabled `:588-601`、xai 凭据校验 `:612-624`、endpoint 变更丢弃派生 AgentUrl 重推导 `:626-637`）；`deleteChannel:667-681`；`decryptApiKey:688`。

**登出备份/恢复**：`getChannelsLogoutBackupPath:207-210`、`getUserManagedChannelsForLogout:213-215`、`backupChannelsForAccount:230-265`（加密+写回校验，失败抛错）、`RestoreChannelsResult:270`、`restoreChannelsForAccount:286-340`（合并恢复、成功删备份、失败保留）。

**服务端同步**：`syncChannelsFromServer:348-479`（前后双 getTeamAuth 校验 `:350-355`/`:387-390`、空列表防雪崩 `:394-397`、`.server-backup` `:401-406`、清理已删代管 `:413-422`、首配 Agent 设置 `:455-478`）。

**模式判定**：`isCommercialMode:482`/`canSelfConfig:492`（惰性 require auth-service，异常回 false）。

**OAuth 凭据**：`persistCodexOAuthCredentials:709`/`resolveCodexOAuthCredentials:727-762`（过期刷新、`inflightCodexRefresh:706` Map 去重）/`resolveCodexAccessToken:765`；`persistXaiOAuthCredentials:770`/`resolveXaiOAuthCredentials:780-799`（`refreshXaiOAuthCredentialsSerial` 串行化）/`resolveXaiAccessToken:801`；`resolveChannelRuntimeApiKey:811-825`（codex/xai oauth→access，其余解密）。

**测试/额度/模型**：`testChannel:832-877`（provider 分派）、`getChannelPlanQuota:1484-1546`（codex/deepseek/kimi/minimax/zhipu 路由 + `channelUpdatedAt` 注入）、`testChannelDirect:1556-1590`（明文凭证直测）、`fetchModels:1600-1636`（四路解析）。

## 3. 内部逻辑与关键流程

- **测试模型映射**（`testAnthropicCompatible:894-922`）：deepseek→`deepseek-v4-pro`、kimi-api→`k3`、kimi-coding→`kimi-for-coding`、zhipu-coding→`glm-5.2`、minimax→`MiniMax-M3`、xiaomi*→`mimo-v2.5-pro`、default→`claude-sonnet-4-6`。
- **额度查询组**（`:1032-1546`）：Kimi（硬编码 `api.kimi.com/coding/v1/usages` `:1063`）、MiniMax（`token_plan/remains` + minimax.io 域名替换 `:1145-1147`；0-is-valid 注释 `:1191`；`parseMiniMaxGeneralQuotaWindows` 唯一耦合 `:1192`）、DeepSeek（`/user/balance` 余额百分比 `:1274-1278`）、智谱（4 URL 并行 `:1456-1466`、unit 3→5h/6→weekly `:1403-1411`、TIME_LIMIT→'MCP 每月' `:1431`）。
- **模型拉取**（`:1600-1849`）：Ollama `/api/tags`、Anthropic `/models`、OpenAI `resolveOpenAIModelsUrl`、Google `v1beta/models` 过滤 `generateContent`（`:1830-1832`）。
- **唯一可变并发状态**：`inflightCodexRefresh`（`:706`，防多会话并发刷新重复请求/后写覆盖）。

## 4. 调用者与调用链

外部 IPC 层（渠道管理界面/账号生命周期）；出向 15+ 模块（shared 9 值、core 5、config-paths/token-crypto/proxy-*/channel-plan-quota-parsers/codex-*/xai-*/build-target/official-channel/channel-url-routing/package.json）。

## 5. 数据 I/O、读写与副作用

**本地 JSON**（`readConfig:131-165` 每次读盘、无缓存；`writeConfig:170-179` 失败 throw）；加密写（token-crypto）；HTTP（10+ 供应商端点，15s 测试超时 `:48`/5s 额度超时 `:52`）；备份文件（`.logout-backup-{safeId}`/`.server-backup`）。

## 6. 分支、失败、取消与恢复

readConfig 整体异常→空配置（`:161-164`）；备份/恢复失败均**保留备份**（`backupRetained`）；同步前后账号二次校验（会话失效 throw）；测试失败不抛（返回 `success:false` 文案）；OAuth 刷新 inflight 去重 + xai 串行化。

## 7. 权限与权威状态

- **官方代管守卫**：update/delete 用 `isOfficialManagedChannel({id})`（**只传 id**→漏拦 serverManaged 非 newapi- 前缀渠道，矛盾⑤）；登出备份用完整对象正确排除。
- **商业/自配权限**：`isCommercialMode`/`canSelfConfig` 闸（create/update/delete）。
- **API Key 安全**：safeStorage（不可用降级 AES-256-GCM deviceId 密钥，`:183-186`）；密文存储、按需解密。

## 8. 修改影响面

改 CRUD/守卫影响渠道管理全 UI；改额度查询影响 hover 面板；`GLM_53_PRESET_MODEL_CANDIDATES`（`:55-62`）迁移是线上配置行为；HTTP 端点/超时改动影响网络面。

## 9. 测试证据

直接测试 3 文件 10 个 `test(`（同批手册）：parsers 2、preset 4（ownership 1 + migration 3）、no-placeholder 4（占位 2 + merge 2）。其中 `getUserManagedChannelsForLogout`（登出备份组）与 `listChannels`/`mergeServerChannelModels` **有测试**（preset `:21`/no-placeholder `:15`）；**无测试**的是 `testChannel`/`fetchModels`/`getChannelPlanQuota` 额度路径/`backupChannelsForAccount`/`restoreChannelsForAccount`。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 全文精读+主根抽查 12 行命中）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 28 导出、内部函数清单、inflight 去重 | 已证实 | 子agent 5 段逐行 + 主根抽查（exports=28、`:6`/`:55`/`:69`/`:510`/`:568`/`:832`/`:871`/`:1192`/`:1484`/`:1584`/`:1600` 全命中） |
| ①头注释 `:6` `~/.proma` 旧名残留（实际 `~/.cdutai/channels.json`） | 已证实 | 主根抽查 `:6` |
| ②restore JSDoc `:282-283`"仅空才恢复" vs 实现合并恢复 | 已证实 | 子agent 对拍 |
| ③孤儿注释 `:1647-1653` 错贴 OllamaTagItem 前 | 已证实 | 同上 |
| ④`:1473` 注释"最后一条错误" vs 实现取第一条 | 已证实 | 同上 |
| ⑤update/delete 只传 `{id}` 判官方代管漏拦 | 已证实 | 主根抽查 `:568` + official-channel.ts 全文 |
| ⑥'供应商'(`:871`)/'提供商'(`:1584`) 文案不一 | 已证实 | 主根抽查 |
| ⑦clampPercent/时间戳归一与 parsers 重复实现 | 已证实 | `:1034`/`:1039` vs parsers `:11`/`:16` |
| ⑧'zhipu-coding-team'/'ark-coding-plan'/'openai-codex' 无测试/拉取路由（落 default"不支持"） | 已证实 | switch 对照 |
| ⑨cleanedCount 公式 `:419` 有新增时失真（仅影响日志）；⑩`:425` 硬编码 version:1；⑪getFetchFn await 用法不一（返回型未核实）；⑫智谱 `Authorization` 无 Bearer `:1361`；⑬头注释职责窄于实际；⑭测试文件名与混入主题不全对齐；⑮merge 匹配键 `id??name` 只比 candidate.id `:118-119` 边界缺陷；⑯readConfig `:150` 引用比较变更；⑰accountId 校验次序 `:241`；⑱Kimi URL 硬编码忽略 baseUrl | 已证实 | 子agent 对拍（照实记录） |
| getFetchFn 同步/异步返回型、Channel 类型全字段、Zhipu unit 语义 | 未知 | 依赖不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 28 导出全量 | §2 | covered |
| 测试映射/额度/拉取三组 | §3 | covered |
| 守卫/权限 | §7 | covered |
| 18 矛盾 | §10 | covered |
| 测试 10 用例/缺口 | §9 | covered |
