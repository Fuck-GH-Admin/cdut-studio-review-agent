---
path: apps/electron/src/main/lib/agent-retry-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 84ed761e45320aacb1f190af0c92d6768573025d
sha256: 2d02241cf30a5dada14e88e38014c9bb891a4126994aa25562a70a27e3841f4e
lines: 251
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-retry-utils.test.ts

## 1. 测试目标

重试决策矩阵：错误提取、OpenAI 繁忙、TypedError/Catch 可重试判定、relay token/session-not-found、延迟退避、权限模式映射。不运行（`NOT_RUN`）。

## 2. 用例清单

10 describe / 39 实例（35 调用/39 实例口径）（`test(` 计数）：
1. `extractApiError`（:39，5 用例）：JSON 格式（:40）/API error 格式（:47）/简单格式（:53）/空返 null（:59）/HTTP 200 非错误（:64）。
2. `OpenAI 官方上游繁忙提示`（:69，3 用例）：统一提示（:70）/非 OpenAI 不误用（:75）/重试预算均 5 次（:80）。
3. `isAutoRetryableTypedError`（:87，5 用例）：4 类可重试+invalid_request 不可（:102）+402 billing 不可（:106）。
4. `Ollama 工具流错误`（:115，1 用例）：不可自动重试（:116）。
5. `isAutoRetryableCatchError`（:122，6 用例）：429/5xx/4xx（429 除外）不可/context_management/502-529-overloaded/正常错误不可。
6. `isInvalidRelayTokenError`（:154，2 用例）：仅 relay 401；普通 401/非 401 不触发。
7. `isSessionNotFoundError`（:166，3 用例）：典型/stderr/普通错误不匹配。
8. `getRetryDelayMs`（:181，7 用例）：首试约 1s±20%（:182）/stream_interrupted 0ms 且不等价预算耗尽（:188）/未耗尽不停（:195）/上限停（:200）/单次延迟上限（:205）/超预算返 0（:213）/受剩余预算限制（:218）。
9. `isAutoRetryableCatchError 覆盖中转 5xx`（:224，1 用例）：认证/模型类不因此变可重试（:235）。
10. `sdkPermissionModeForProferMode`（:242，1 用例）。

## 3. 真实断言

形态为 `expect(...).toBe/toEqual/toContain`（如 :88-102 五码断言、:188-218 延迟数值边界）。逐 describe 与源函数一一对应。

## 4. 未覆盖与脆弱点

未覆盖：`classifyCatchError` 直接断言、`getRetryDisplayReason` 非繁忙分支。mock 边界：纯函数直调（含对 mapSDKErrorToTypedError 的引用 :27，属批外 adapter）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 39 实例（35 调用/39 实例口径）/10 describe 与源函数对应 | 已证实 | grep+逐段读 |
| 断言要点如 §2-3 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测函数 | describe | 状态 |
| --- | --- | --- |
| extractApiError/繁忙/TypedError/Ollama/Catch/relay/session/延迟/中转/权限 | #1-#10 | covered |
| classifyCatchError 直接 | — | unknown |
