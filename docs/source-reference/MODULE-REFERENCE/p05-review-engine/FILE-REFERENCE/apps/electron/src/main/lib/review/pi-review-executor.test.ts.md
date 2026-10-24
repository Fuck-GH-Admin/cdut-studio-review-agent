---
path: apps/electron/src/main/lib/review/pi-review-executor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc96251de883b4cacbfbc6db14cf06bbaf6fb422
sha256: f48609b11119fb4b7525c9fb53f3c32b7db23b60622cc1cf2aa943e851bea557
lines: 59
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-executor.test.ts

## 1. 测试目标

`pi-review-executor` 的 R10 边界（文件头 :2）：工具白名单、协议白名单、执行器取消语义。`buildReviewTools` 真实构造业务工具（`review-tools`），fake client 注入。

## 2. 用例清单

5 用例 / 3 describe：

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1 | 工具白名单（R10） | 审核工具+伪装工具过滤后只剩白名单 | 10-24 |
| 2 | 协议校验（07 §4.4） | openai/ollama 过、anthropic-native 拒 | 28-33 |
| 3 | 执行器与取消（R10） | 未取消产生产物 | 41-46 |
| 4 | 同上 | 已中止不调模型 | 48-54 |
| 5 | 同上 | 不允许协议构建即拒 | 56-58 |

夹具：`buildReviewTools({caseId:'c',…})`（:11-13/:39）；注入 `bash`/`write_file` 伪装工具（:14-18）；`fakeClient {protocol:'openai-chat'}`（:38）；`AbortController`（:37）。无 I/O/mock 框架。

## 3. 真实断言

- 1：过滤结果名集 `toEqual([...REVIEW_TOOL_ALLOWLIST].sort())`、含 `list_review_documents`/`inspect_document_image`、`some(name==='bash')` `toBeFalse()`（:20-23）。
- 2：两协议 `not.toThrow()`、`anthropic-native` `toThrow('允许清单')`、`REVIEW_ALLOWED_PROTOCOLS` 长度 2（:29-32）。
- 3：`outcome.status==='done'` 且 artifact.summary 含 `'openai-chat'`（:44-45）。
- 4：`rejects.toThrow('已取消')` 且 `called` `toBeFalse()`（:52-53）。
- 5：`buildReviewExecutors` 同步 `toThrow('允许清单')`（:57）。

## 4. 未覆盖与脆弱点

- 未覆盖：`buildPiReviewToolDefinitions`（terminate 判定在 agent-client 测试）、`check` 节点执行器、`已取消（模型调用后）` 分支、真实 SDK。
- 脆弱点：`toThrow('允许清单')` 子串匹配；fake client 忽略 prompt 内容。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 本文件逐行 |
| 白名单可挡注入工具 | 已证实（静态断言） | :19-23 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `selectReviewTools` | §3 | 20-23 | covered |
| `assertAllowedProtocol` | §3 | 29-32 | covered |
| `buildReviewExecutors` extract/取消/协议 | §3 | 44-57 | covered |
| check 节点/后置取消 | §4 | — | unknown（未测） |
