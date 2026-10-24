---
path: apps/electron/src/main/lib/chat-tool-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3f679dbe15291c8df9dc3c7fbb24834fd44d23cb
sha256: 3398da3167e55625b102210d5e5ac04a8a84d497ad9b4a6568e511645e410b51
lines: 255
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/chat-tool-config.ts

## 1. 结论与边界

**Chat 工具配置服务**（`chat-tool-config.ts:1-6` 注释）：管理 `~/.cdutai/chat-tools.json` 的工具开关与凭据。红线：**GPT Image 的 BYOK Key 只以加密字段保存在主进程配置，绝不通过 IPC 回传 renderer**（`:4-5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GptImageMode`/`GptImageProvider` | type | `:17-18` | official/byok；openai/xai |
| `GptImageCredentials` | interface | `:20-26` | 解密后主进程专用形态 |
| `getChatToolsConfig`/`saveChatToolsConfig` | function | `:129-160` | 读（缺文件→默认；读失败→默认+日志）/写（失败抛） |
| `updateToolState` | function | `:163-167` | 单工具开关 |
| `updateToolCredentials` | function | `:173-201` | GPT Image 特例（§3.2） |
| `getToolState`/`getToolCredentials` | function | `:204-237` | 状态/凭据（**gpt-image 只回 hasApiKey** `:222-236`） |
| `getGptImageCredentials` | function | `:210-220` | **主进程专用**解密凭据（`:209`） |
| `addCustomTool`/`deleteCustomTool` | function | `:240-255` | 自定义工具增删 |

内部：`DEFAULT_CONFIG`（memory/agent-mode-recommend 开、web-search/gpt-image 关 `:29-38`）、`normalizeGptImage*`（`:40-46`）、`providerField`/`getStoredProviderValue/ApiKey`/`decryptStoredProviderApiKey`（`:48-76`，旧单套字段兼容 `:59-60`）、`migrateGptImageCredentials`（`:79-126`，幂等迁移 `:141`）。

## 3. 内部逻辑与关键流程

1. **读取+迁移**（`:129-148`）：toolStates 与默认合并（`:137`）；`migrateGptImageCredentials` 变更即回写（`:142`）。迁移（`:79-126`）：无 provider 归 openai（保留过渡版 xai `:83-85`）；无 mode 时**有存量 Key→byok、空→official**（`:90-95`）；明文 `apiKey`→加密迁移后删除（`:97-104`）；`apiKeyEncrypted`/baseUrl/model 按 legacyProvider 归位（`:105-124`）。
2. **凭据更新**（`:173-201`）：非 gpt-image 原样保存；gpt-image：**空 apiKey="不改动已保存 Key"**（支持 renderer 不回显的重编辑 `:169-171`）；provider 字段按目标 provider 分槽（`:186-192`）；非空 key 才加密覆盖（`:193-194`）；删旧明文字段（`:195-198`）。
3. **凭据读取**（`:226-237`）：gpt-image 只回 provider/mode/baseUrl/model/**hasApiKey**（Key 不出主进程）。

## 4. 调用者与调用链

入向：工具开关/凭据 IPC handler（跨文件）；测试 `chat-tool-config.test.ts`（同批 3 用例）。出向：`./config-paths`/`./token-crypto`（encryptToken/decryptToken）、`@profer/shared` 类型、`node:fs`。

## 5. 数据 I/O、读写与副作用

读写 `~/.cdutai/chat-tools.json`（同步 fs）；加密字段落盘；console。保存失败抛 Error（`:158`）。

## 6. 分支、失败、取消与恢复

读失败→默认（`:144-147`）；解密失败→''+日志（`:72-75`）；保存失败→抛。迁移幂等可重复执行。不适用取消/恢复。

## 7. 权限与权威状态

红线：Key 加密仅主进程（`:4-5/:209/:222-236`）、空 apiKey 不覆盖（`:170`）、迁移不放错 provider（`:83-85`）。

## 8. 修改影响面

改配置/迁移 → Chat 工具开关与 GPT Image 生图凭据链；3 用例锁定迁移/分槽。

## 9. 测试证据

**直接测试 `chat-tool-config.test.ts`（3 用例，NOT_RUN）**：旧单套迁移不保留明文（`:38-56`）、双 provider 独立保存不互覆盖（`:58-72`）、过渡配置按 provider 迁移（`:74-91`）。mock config-paths/token-crypto（`:7-13`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出+7 内部+迁移/更新全分支 | 已证实 | 逐行读 `:1-255` |
| 测试 3 用例断言 | 已证实 | 测试 `:1-92`；NOT_RUN |
| token-crypto 真实加密强度 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出 | §2 | `:17-255` | covered |
| 迁移/凭据双路 | §3 | `:79-237` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
