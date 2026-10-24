---
path: apps/electron/src/main/lib/agent-sdk-auth-env.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c493aaeed9474852a9a2c6c79cbeb5a9ad67e52d
sha256: 627d1c260c7dd4f6b6edfddf3dda27f9df78c0e9db9eabac292334a72e1c4300
lines: 44
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-sdk-auth-env.ts

## 1. 结论与边界

SDK 认证环境变量写入（:12 注释：**仅写本次 SDK env，调用方不得改主进程 process.env**）。按 provider 分四路写不同鉴权形态。

## 2. 导出与关键符号

导出 2 条（`export` :6/:13）：
- `usesAgentSdkBearerWithUserAgent(provider)`（:6-10）：kimi-coding/zhipu-coding/xiaomi-token-plan 三渠道需 Bearer+固定 User-Agent（:5 注释）。
- `applyAgentSdkAuthEnv(target, provider, apiKey, forceBearerAuth=false)`（:13-44）。

## 3. 内部逻辑与关键流程

四分支（:19-43）：
1. `ollama`（:19-26）：`ANTHROPIC_AUTH_TOKEN=apiKey||'ollama'`+关闭 fine-grained tool streaming（:24，注释 :21-23：Qwen3.8+Ollama 0.32/0.33 tool_result 续请求公开流式解析问题）。
2. `forceBearerAuth 或三渠道`（:28-34）：`ANTHROPIC_AUTH_TOKEN`+三渠道另写 `ANTHROPIC_CUSTOM_HEADERS`（User-Agent 经 `getProferUserAgent(pkg.version)` :31）。
3. `minimax`（:36-41）：TOKEN+`API_TIMEOUT_MS=3000000`+禁非必需流量。
4. 默认（:43）：`ANTHROPIC_API_KEY`。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/agent-orchestrator-p0-guards.ts:5` → 调用 `applyAgentSdkAuthEnv` :87（封装于 `applySdkCredentials` :80）。**注入链断点（现存实现观察）**：`applySdkCredentials` 全树无生产调用方（orchestrator:190-201 从 p0-guards 导入的 12 符号不含它；生产已改走 queryOptions.apiKey/baseUrl orchestrator:2160）——本模块生产链现状为「被 p0-guards 包裹后闲置」；`ANTHROPIC_AUTH_TOKEN` 生产写点仅本文件。测试 `agent-sdk-auth-env.test.ts:2`（4 用例）。出向：`@profer/shared`（ProviderType）、`@profer/core`（getProferUserAgent :31）、`../../../package.json`（version :3）。

## 5. 数据 I/O、读写与副作用

写入传入 target 对象（无全局副作用，边界见 :12）。

## 6. 分支、失败、取消与恢复

四分支（§3）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

「不改主进程 process.env」权威（:12）；三渠道 User-Agent 固定（:31）。

## 8. 修改影响面

SDK 鉴权链（各 provider 渠道）。需同步测试（42 行）。

## 9. 测试证据

`agent-sdk-auth-env.test.ts`（批内，1 describe/4 用例，NOT_RUN）：请求级隔离+process.env 不污染（:5-19）、forceBearer 无渠道头（:21-25）、渠道判定（:27-30）、Ollama 哨兵（:32-41）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；四分支 env 形态 | 已证实 | :13-44 |
| 注入链断点（applySdkCredentials 无生产调用方，疑 queryOptions 迁移遗留） | 已证实（否定+现存观察） | 全树检索（§4） |
| 测试 4 用例逐断言 | 已证实 | 姊妹手册 §2 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+四分支 | §2/§3 | :6-44 | covered |
| 测试 | §9 | — | unknown |
