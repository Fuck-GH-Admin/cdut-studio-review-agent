---
path: apps/electron/src/main/lib/gpt-image-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad0b132f96a7bbf18caddac220984d56f6afb066
sha256: 86c26dc00e846643c9cbeac3e60ba9c2a4f6d1fb8b9881996b6d53eacfa8a011
lines: 342
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/gpt-image-service.ts

## 1. 结论与边界

GPT/xAI 图片生成服务（官方代理 + BYOK 双模式）：**幂等键调用方持有**（`GptImageRequest.idempotencyKey` 注释 :32「Retrying a single tool call must reuse this key」）；官方 504 恢复走「轮询同 operation」而非重 POST（注释 :214-216）；401 relay 失效仅刷新后**同键重试一次**（注释 :234-235，避免重复扣费）。

边界：凭据在 `chat-tool-config`；团队鉴权在 `auth-service`。

## 2. 导出与关键符号

常量/类型：`DEFAULT_GPT_IMAGE_MODEL='gpt-image-2'`（:10）、`DEFAULT_XAI_IMAGE_MODEL`（:11）、`GPT_IMAGE_SIZES/QUALITIES`（:12-13）、`MAX_GPT_IMAGE_REFERENCES=4`（:14）、`GptImageSize/Quality/MediaType/Mode`（:16-19）、`GptImageReference/Request/Success/Failure/Result`（:21-45）。

| 函数 | 行 | 说明 |
| --- | --- | --- |
| `__setOfficialImageRecoveryDelaysForTest` | 48-50 | 测试注入恢复延时 |
| `normalizeGptImageSize/Quality` | 89-97 | 非法值归一 'auto' |
| `generateGptImage` | ~283-342 | 主入口（official/byok 分发） |

内部：`normalizeBaseUrl/normalizeXaiBaseUrl`（:56-62）、`xaiAspectRatio/xaiResolution/xaiQuality`（:64-80，1536x1024→3:2/2k 等）、`supportsXaiImagineControls`（:82）、`friendlyError`（:99-108，`INSUFFICIENT_CREDITS`→积分不足文案、504→「本次不会扣积分」）、`sleep`（:110-118，可中断）、`parseResponse`（:120-128，无有效图→`不会扣积分`）、`detectMediaType`（:130-138，PNG/JPEG/WEBP 魔数嗅探）、`resolveImage`（:140-165，b64/url 下载+嗅探）、`appendReferences`（:167-171，cap 4）、`callOfficial`（:173-238）、`callOpenAiByok`（:240-260）、xai 变体（:262-281）。

## 3. 内部逻辑与关键流程

1. **`callOfficial`**（:173-238）：无 auth→undefined（`官方生图需要先登录`）；有 references→`/v1/proxy/images/edits`（multipart）否则 `/v1/proxy/images/generations`（JSON）；Header `Bearer {proxyToken||token}`+`Idempotency-Key`。
2. **504 恢复**（:215-232）：GET `/v1/proxy/images/operations/by-idempotency/{operationType}/{key}`，按 `DEFAULT_OFFICIAL_IMAGE_RECOVERY_DELAYS_MS`（:6-8，72s 总窗）轮询；404→保留原 504（不长等待，注释 :222-223）；409+`IMAGE_OPERATION_PROCESSING`→继续；其他终态原样返回。
3. **401 恢复**（:234-238）：`recoverCommercialProxyAuth()` 换新 relay→同键 `send` 一次。
4. **xAI BYOK**（:262-281）：JSON data URL（`image_url`/`images[]`，单图 `image` 单数字段）；aspect_ratio/resolution/quality 映射；**URL 结果下载不转发用户 API Key**（:330-332 注释）；OpenAI-compatible 保留 Bearer 下载。
5. **`generateGptImage`**（~283-342）：分发→`parseResponse`→`resolveImage`；`图片生成结果无法读取，本次不会报告为成功`（不假成功）。

## 4. 调用者与调用链

入向：`agent-gpt-image-tools.ts`/`agent-gpt-image-service.ts`（全树 grep）。出向：`./chat-tool-config`、`./auth-service`（:2）。

## 5. 数据 I/O、读写与副作用

真实 fetch（生图代理/图片 URL 下载）；无写盘；可中断 sleep。

## 6. 分支、失败、取消与恢复

全失败走 `GptImageFailure`（不抛为主，catch→`图片生成失败：…`）；504 恢复、401 单次重试；signal 贯穿。

## 7. 权限与权威状态

- 扣费诚实：`INSUFFICIENT_CREDITS`/504/空结果均明示「不会扣积分」（:99-108/:125）。
- 幂等权威：Idempotency-Key 调用方复用（:32）；401 重试同键（:235）。
- 密钥边界：xAI URL 下载不转发用户 key（:330-332）；参考图 cap 4（:14）。

## 8. 修改影响面

Agent 生图工具/设置页。同测：`gpt-image-service.test.ts`（12 用例）。

## 9. 测试证据

直接测试 `gpt-image-service.test.ts`（12 用例 / 1 describe；mock electron/chat-tool-config/auth-service；fetch mock；`__setOfficialImageRecoveryDelaysForTest([0])` 消真实等待；NOT_RUN）要点：
- `:34-50` 官方生成固定模型 JSON+`Idempotency-Key: call-1`+`Bearer proxy-token`。
- `:52-68` 504→同键 GET operations 恢复（`calls.length===2`、URL 含 `by-idempotency/generation/gateway-recovery-key`）。
- `:70-84` 409 processing 才续轮询（3 calls 后成功）。
- `:86-105` 401→refresh 一次同键重试（`fresh-proxy-token`、双请求同 idempotency-key）。
- `:107-122` edits multipart+参考图 cap 4（`image[]` 5 张只发 4）。
- `:124-141` BYOK OpenAI：`response_format:'b64_json'`+配置 baseUrl/model。
- `:143-161` xAI 映射（`aspect_ratio:'3:2'`,`resolution:'2k'`,`quality:'medium'`）。
- `:163-181` 单图编辑用单数 `image` 字段（无 `images`）。
- `:183-207` 多图 JSON data URL（2:3/low）。
- `:209-224` URL 结果 BYOK Bearer 下载。
- `:226-240` xAI URL 下载 `authorization` 为 null（不转发 key）。
- `:242-248` `INSUFFICIENT_CREDITS`→含「积分不足」；空 b64→`ok:false`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 504 恢复/401 单重试/幂等键 | 已证实 | :215-238 + 测试 :52-105 |
| xAI 映射/密钥不转发 | 已证实 | :64-80/:330-332 + 测试族 |
| 真实生图/扣费 | 未知 | NOT_RUN（无真实网络/费用） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `callOfficial` + 504/401 恢复 | §3.1-3.3/§9 | 173-238 | covered |
| OpenAI/xAI BYOK | §3.4-3.5/§9 | 240-281 | covered |
| `resolveImage`/媒体嗅探 | §2 | 130-165 | covered |
| `friendlyError` 文案 | §3 | 99-108 | covered |
