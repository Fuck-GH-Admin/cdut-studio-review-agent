---
path: apps/electron/src/main/lib/gpt-image-connection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ba60205a40f954e9276c31cd68bbe98656995ee
sha256: e016a3f2eafefdc22c3720d9722c3d69e830143b5f388874040cf5fc53826a09
lines: 100
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/gpt-image-connection.ts

## 1. 结论与边界

图片生成连接测试（头注 :13-16「测试连接，不执行生图，避免产生图片或费用」）：官方模式检查 Profer 团队账号健康接口；自带 Key 模式检查对应 provider `/v1/models`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GptImageConnectionTestResult` | interface | 10-13 | `{success,message}` |
| `testGptImageConnection` | fn | 18-68 | 主测试（official/byok 两路径） |
| `testLegacyImageToolConnection` | fn | 73-100 | 兼容历史 nano-banana 旧式 API Key 测试 |

内部：`normalizeBaseUrl`（:5-7，去尾斜杠与 `/v1`）、`DEFAULT_OPENAI_BASE_URL/DEFAULT_XAI_BASE_URL`（:3-4）。

## 3. 内部逻辑与关键流程

1. **官方模式**（:22-47）：`getTeamAuthWithRefresh()` 无 auth → `请先登录 Profer 团队账号`（不发请求，测试 :57-63 断言）；GET `{baseUrl}/v1/account/channels/health`（Bearer token、10s 超时）；401/403 → `登录已失效，请重新登录`；ok → `连接成功，Profer 官方生图服务可用`。
2. **BYOK 模式**（:50-68）：无 apiKey → `请先填写 OpenAI/xAI API Key`；GET `{normalizedBase}/v1/models`（Bearer apiKey）；失败文案带 status+前 200 字。
3. **legacy**（:73-100）：`getToolCredentials(toolId)`；无 apiKey → `请先填写 OpenAI API Key`；GET `/v1/models` → `连接成功，OpenAI API 可用`。

## 4. 调用者与调用链

入向（r1 校订 NB66-F-01）：**生产零消费**——全树检索（含动态 require/import 与 preload）`gpt-image-connection`/`testGptImageConnection`/`testLegacyImageToolConnection`/`GptImageConnectionTestResult` 仅命中 `gpt-image-connection.test.ts`；本模块当前为**孤儿模块（生产接线缺失）**，「设置页图片工具连接测试」为**预期用途**而非已证实调用链（原 §4 表述不成立，已更正）。出向：`./chat-tool-config`（:1）、`./auth-service`（动态 :24）。

## 5. 数据 I/O、读写与副作用

真实 fetch（测试时被 mock）；10s `AbortSignal.timeout`；无写盘。

## 6. 分支、失败、取消与恢复

全分支返回 `{success,message}` 不抛（catch→`连接失败: …`）；无重试。

## 7. 权限与权威状态

- 凭据权威：官方模式用团队 token（不暴露 API Key 语义）；BYOK 用用户 key；xAI/官方 base 分离。
- 不执行生图（头注 :13-14）。
- 无 sender/role 检查。

## 8. 修改影响面

- 当前无生产消费方（孤儿模块，r1 校订）：改动不影响任何生产链路；若未来设置页接线，消费点应经 IPC+preload 桥接入。
- 同测：`gpt-image-connection.test.ts`（6 用例，全 mock fetch）。

## 9. 测试证据

直接测试 `gpt-image-connection.test.ts`（6 用例 / 1 describe；mock electron/chat-tool-config/auth-service；fetch mock；NOT_RUN）：
1. `:44-58` 官方模式不要求 OpenAI Key：URL `https://team.example/v1/account/channels/health`、`Bearer team-token`、结果文案。
2. `:60-68` 未登录→`请先登录 Profer 团队账号`（fetch 断言不发起）。
3. `:70-76` 401→`登录已失效，请重新登录`。
4. `:78-95` BYOK OpenAI→`https://byok.example/v1/models`+`Bearer sk-test`+`连接成功，OpenAI Images API 可用`。
5. `:97-117` xAI 去尾 `/v1`（`https://api.x.ai/v1/`→`https://api.x.ai/v1/models`）。
6. `:123-136` legacy nano-banana 要求 API Key→`https://legacy.example/v1/models`+`Bearer sk-legacy`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 六分支文案/URL/Header | 已证实 | 测试族逐条 |
| 生产接线状态 | 已证实（否定） | 全树检索仅 test 引用（r1 校订 NB66-F-01） |
| 真实服务连通性 | 未知 | NOT_RUN（无真实网络） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 官方三态（未登录/失效/成功） | §3.1/§9 | 22-47 | covered |
| BYOK（OpenAI/xAI/缺 key） | §3.2/§9 | 50-68 | covered |
| legacy 测试 | §3.3/§9 | 73-100 | covered |
