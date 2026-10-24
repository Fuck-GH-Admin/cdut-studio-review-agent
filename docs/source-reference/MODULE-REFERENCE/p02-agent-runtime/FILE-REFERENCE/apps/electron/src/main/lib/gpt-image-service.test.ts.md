---
path: apps/electron/src/main/lib/gpt-image-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1eb9ce0f33a4bd536d5561b7d357feae72b97077
sha256: fa361078284bfd30503c6f5c388557297b025cace50f62b41883cc431f7b610a
lines: 249
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/gpt-image-service.test.ts

## 1. 测试目标

`generateGptImage` 双模式全景：官方幂等键/504 operation 恢复/401 单重试/edits cap 4、BYOK OpenAI/xAI 映射、URL 下载密钥边界、错误文案不假成功。

## 2. 用例清单

12 用例 / 1 describe（`generateGptImage` :31）。mock electron/chat-tool-config/auth-service（:5-17）；fetch mock；`__setOfficialImageRecoveryDelaysForTest([0])` 消真实等待（:53/:71）；PNG 魔数字节夹具（:19）。

| # | 用例（行） | 核心断言 |
| --- | --- | --- |
| 1 | 官方固定模型+幂等键（33-50） | URL `…/v1/proxy/images/generations`、`Bearer proxy-token`、`idempotency-key: call-1`、body `{model:'gpt-image-2',…,n:1}` |
| 2 | 504 同键恢复（52-68） | 2 calls、GET `by-idempotency/generation/gateway-recovery-key` |
| 3 | 仅 processing 续轮询（70-84） | 409 `IMAGE_OPERATION_PROCESSING`→3 calls 成功 |
| 4 | 401 换 relay 同键单重试（86-105） | `fresh-proxy-token`、双请求同 idempotency-key |
| 5 | edits multipart+cap 4（107-122） | `image[]` 5→4 |
| 6 | BYOK OpenAI b64（124-141） | `response_format:'b64_json'`、配置 baseUrl/model |
| 7 | xAI 映射（143-161） | `aspect_ratio:'3:2'`,`resolution:'2k'`,`quality:'medium'` |
| 8 | 单图编辑单数字段（163-181） | `image:{type:'image_url',url:dataURL}`、`images` undefined |
| 9 | 多图 JSON data URL（183-207） | `images[]` 2 项、`2:3`/`low` |
| 10 | URL 结果带 Bearer 下载（209-224） | `Bearer sk-download` |
| 11 | xAI URL 不转发 key（226-240） | 下载 `authorization` 为 null |
| 12 | 错误文案/不假成功（242-248） | `INSUFFICIENT_CREDITS`→含「积分不足」；空 b64→`ok:false` |

## 3. 真实断言

如 §2 表（逐条读自 :33-248）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实生图/扣费（无真实网络）；`parseResponse` 非 JSON 体分支。
- 脆弱点：恢复延时注入 API `__setOfficialImageRecoveryDelaysForTest` 需 afterEach 还原（:35）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例断言如 §2 | 已证实 | 本文件逐行 |
| 幂等/504 恢复/401 单重试被固定 | 已证实 | 用例 1-4 |
| 密钥边界被固定 | 已证实 | 用例 10-11 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 官方生成/恢复/重试 | §2 | covered |
| OpenAI/xAI BYOK | §2 | covered |
| resolveImage 下载/嗅探 | §2 | covered |
| 友好错误/空图拒假成功 | §2 | covered |
