---
path: apps/electron/src/main/lib/adapters/pi-model-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 150ac2d254019f8b980dee114a9b05c2c4500bda
sha256: 5264a50587dc489cf314e7d110bf08e72909518ee8b4dda4cf85797f9b960cd5
lines: 823
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-model-registry.test.ts

## 1. 测试目标

`pi-model-registry.ts` 的凭据隔离/认证/1M 归一/协议判定/模型注册/catalog 补丁/finish_reason 兜底。mock 边界=假 `ModelRuntime.create`（test:50-61，捕获 createOptions）与真实 SDK `await import('@earendil-works/pi-coding-agent')`（test:122 等，直连内置 catalog）。

## 2. 用例清单

10 describe、51 测试调用点（48 test( + 3 test.each；QA N-NB54-03 计数校正）（`apps/electron/src/main/lib/adapters/pi-model-registry.test.ts:1-823`）：

- `Pi runtime 临时凭据隔离`（`:24`）1（test.each 2）：runtime key 同步失败→内存存储+向调用方抛。
- `智谱团队版认证`（`:72`）8：复合/JSON 凭据提取、Bearer 不含 organization、Proma UA、ollama 哨兵。
- `1M 偏好归一`（`:120`）4：显式 token 上限生效（`:121-137`）、强开抬 1M 不降 1.05M（`:139-143`）、强关压回（`:145-148`）、未设置保持（`:150-153`）。
- `xAI API Key`（`:156`）4：内置 xai Responses、1M 开/关、中转站未知模型注册+BaseUrl 归一（`:206-222`）。
- `Ollama 双协议`（`:225`）3：relay base 不重复 `/v1/messages`（`:226-243`）、本机 Ollama 保 anthropic+根 URL（`:245-263`）、远程 Ollama 走 openai-completions+/v1（`:265-282`）。
- `[1m] 剥离`（`:285`）5：含大小写不敏感/中间不剥/undefined（`:286-304`）。
- `DeepSeek V4 1M`（`:307`）8：网关前缀仍 1M、deepseek-flash catalog 元数据（maxTokens 384000/cost 0.3，`:327-351`）、旧代写法归一（input 含 image，`:353-374`）、custom 完整端点还原+保守窗口（`:376-393`）、anthropic-compatible 不继承 1M（`:395-411`）、显式 `[1m]` 保留（`:413-430`）、勾选强制开/关（`:432-469`）。
- `DeepSeek 双协议端点判定`（`:472`）4：7 断言矩阵（`:477-487`，含缺省→anthropic、relay→anthropic）、第三方网关 openai-completions+根地址（`:489-525`）、请求头端点跟随（`:527-533`）、官方 anthropic 入口保持（`:535-552`）。
- `GLM-5.3 fallback`（`:555`）2：zhipu 1M/131072/thinkingLevelMap 全 null/zai compat（`:556-586`）、火山 1048576/128000（`:588-608`）。
- `OpenAI Completions 渠道`（`:611`）3：官方三 SKU 1.05M（test.each，`:612-632`）、自配同名保 272K（`:634-651`）、6 provider 注册矩阵（`:653-680`）。
- `OpenAI Responses`（`:683`）1（`:684-702`）。
- `Codex 补丁`（`:705`）4：listCodexModels 含 5.6+6-astra 且无重复（`:706-715`）、保留用户 ID（`:717-735`）、补丁协议/窗口（`:737-745`）、上游移除 gpt-5.4 不补回+5.5/6-astra 覆盖 1.05M（`:747-758`）。
- `finish_reason 兜底`（`:761`）3：custom 关校验且保推理位（`:766-785`）、官方 OpenAI 保持（`:787-803`）、anthropic 不注入 OpenAI 位（`:805-822`）。

## 3. 真实断言（锚定）

- `:64-68` `createOptions` `toMatchObject({modelsPath:null, allowModelNetwork:false})` 且 `credentials` 为 `IsolatedInMemoryCredentialStore`。
- `:76/:82` 提取 `'model-key'`；`:91-93` Bearer 头不含 organization。
- `:135-136` contextWindow 400000/maxTokens 32000；`:140-152` 1M 归一四态。
- `:221` 中转 baseUrl 为 `https://relay.example.com/v1`；`:242` relay base 保持；`:261` ollama 根 URL。
- `:323-324` gateway 前缀 ID 保留+1M；`:344-350` deepseek-flash 元数据五断言；`:392` custom 保守窗口。
- `:478-486` 双协议 7 断言；`:504-505/:550-551` 协议+BaseUrl。
- `:571-585` GLM 1M/131072/compat 四键；`:606-607` 1048576/128000。
- `:630` 1050000；`:650` 272000；`:710-714` 含 5.6/6-astra 无重复。
- `:753-757` gpt-5.4 不存在、5.5/6-astra 1050000；`:782-784` supportsFinishReason false+推理位 true；`:802/:821` `not.toBe(false)`。

## 4. 未覆盖与脆弱点

未覆盖：`resolvePiReasoningCapability`/`buildXaiOAuthModel`/`createCodexRuntimeCredentialStore` 的 modify 回写分支、xai OAuth 串行刷新。直连真实 SDK catalog 的用例断言绑定 Pi SDK 版本（0.86 注释 `:342/:347-348/:603-605`），升级可能翻转——照实记录。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 51 调用点（48+3 each）行号与断言文本 | 已证实 | `:24-822` 逐段核对 |
| 真实 SDK 依赖面 | 已证实 | test:122 等 import |
| SDK catalog 实际内容 | 未知 | 未读/NOT_RUN |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 凭据/1M/协议/注册/补丁/兜底 | §3 | covered |
| OAuth 回写/串行刷新/能力解析 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
