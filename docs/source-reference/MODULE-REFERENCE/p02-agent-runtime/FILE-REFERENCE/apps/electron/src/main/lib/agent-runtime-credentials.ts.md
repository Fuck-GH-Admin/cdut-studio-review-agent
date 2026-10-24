---
path: apps/electron/src/main/lib/agent-runtime-credentials.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5925d05438478a314804aab53490e0b54bc8e864
sha256: dd112991c01bca911d503cbdcde809a07f5683f1553231b02f6651bc0624ec80
lines: 108
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-credentials.ts

## 1. 结论与边界

运行时凭据集中解析（:8 注释：**单次请求专属、严禁写 process.env 或日志**；:26-27：每调用返回不可变数据防并发 session 串用 token；渠道 preflight 归 Orchestrator）。

## 2. 导出与关键符号

导出 3 条（`export` :9/:21/:29）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `ResolvedRuntimeCredentials` | `:9-19` | apiKey/baseUrl/provider/forceBearerAuth/xaiOAuthCredentials?/xaiCredentialMode? |
| `ResolveRuntimeCredentialsResult` | `:21-23` | ok+credentials \| !ok（token_expired/api_key_decrypt_failed） |
| `resolveRuntimeCredentials(channel)` | `:29-108` | 主解析（见 §3） |

## 3. 内部逻辑与关键流程

（:29-108）四路：
1. **官方渠道 Bearer**（forceBearerAuth=(commercial)&&officialManaged，:32-33）：
   - directDataPlane（:35-53）：decryptApiKey 失败→api_key_decrypt_failed。
   - 否则（:54-64）：getTeamAuthWithRefresh 缺→token_expired；apiKey=proxyToken||token、baseUrl=`<auth.baseUrl>/v1/proxy`。
2. **xai OAuth**（:69-84）：resolveXaiCredentialMode→oauth 时 resolveXaiOAuthCredentials，apiKey=credentials.access+xaiOAuthCredentials 全量。
3. **xai api-key**（:85-94）。
4. **默认解密**（:96-104）：decryptApiKey+resolveChannelAgentBaseUrl。
catch→api_key_decrypt_failed（:105-107）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/agent-orchestrator.ts:71` → 调用 :1138（首通道）/:2442（换通道重解析）→ runtimeCredentials→queryOptions apiKey/baseUrl（:2160-2165/:2448-2449）、authMode（:2417）、relay 恢复条件（:2425）。**否定**：无测试文件（glob 仅源）。出向：`@profer/shared`（resolveXaiCredentialMode :70）、`./auth-service`（getTeamAuthWithRefresh :54）、`./channel-manager`（decryptApiKey/isCommercialMode/resolveChannelAgentBaseUrl/resolveXaiOAuthCredentials）、`./build-target`（isCommercialBuild :33）、`./official-channel`（isOfficialManagedChannel :32）。

## 5. 数据 I/O、读写与副作用

读加密凭据/团队 token（解密/刷新）；不写任何持久状态（:8 边界）。

## 6. 分支、失败、取消与恢复

二错误码（token_expired/api_key_decrypt_failed）；refresh 隐含在 getTeamAuthWithRefresh。不适用取消。

## 7. 权限与权威状态

凭据权威：官方渠道走团队 token 而非 API key（:13-14 注释）；forceBearerAuth 语义；「严禁写 process.env」（:8）。

## 8. 修改影响面

orchestrator queryOptions 鉴权链（两处调用）。无直接测试（否定已证）。

## 9. 测试证据

无直接测试（glob `agent-runtime-credentials*.ts` 仅源文件）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；四路解析+二错误码 | 已证实 | :29-108 |
| 无直接测试 | 已证实（否定） | 全树 glob（§4） |
| channel-manager/auth-service 内部 | 未知（批外） | — |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+四路 | §2/§3 | :29-108 | covered |
| 测试 | §9 | — | unknown |
