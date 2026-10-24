---
path: apps/electron/src/main/lib/agent-model-selection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 183e480463b107f998280c5994e2dc43bf5c02df
sha256: 81c73e623196f3a21317a606668ea0d463673c7c162927e8f0475dcde69ad167
lines: 80
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-model-selection.ts

## 1. 结论与边界

协作委派时的**渠道/模型可用性校验**（`agent-model-selection.ts:1-5`）：模型必须属于目标渠道且启用、渠道须存在且对 runtime 开放。纯校验+列举，读渠道配置（经 channel-manager）。

## 2. 导出与关键符号

`export` 逐条核：4 个导出对象（2 接口 + 2 函数）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AvailableAgentModel` | 接口 | `:11` | id/name/source?: 'manual'\|'fetched' | |
| `AvailableAgentModelsForChannel` | 接口 | `:17` | channelId/channelName/provider/models | |
| `assertEnabledModelForChannel` | 函数 | `:24` | `({channelId?,modelId?,runtime?,purpose}): string\|undefined` | modelId==null→undefined（跳过校验，`:30`）；否则三级校验 |
| `listEnabledAgentModelsForChannel` | 函数 | `:54` | `(channelId, purpose, runtime='pi')` | 列启用模型 |

## 3. 内部逻辑与关键流程

`assertEnabledModelForChannel`（`:24-52`）：①`modelId` 为空串→抛 `${purpose}模型 ID 不能为空`（`:34-36`）；②无 channelId→抛 `${purpose}需要可用的 channelId`（`:37-39`）；③`getChannelById` + `isChannelEnabledForRuntime(channel, runtime ?? 'pi')` 不过→抛 `引用的渠道不存在、未启用或未开放 Agent`（`:41-44`）；④`channel.models.find(id 且 enabled)` 缺→抛 `模型不属于当前渠道或未启用`（`:46-49`）；通过返回 modelId（`:51`）。`listEnabledAgentModelsForChannel`（`:54-80`）：同 ②③ 校验（`:59-66`）；返回过滤 `enabled` 后的映射（`:72-78`）。

## 4. 调用者与调用链

- 入向：域外协作委派/分叉链路（grep：`agent-orchestrator` 等，域外）；本批测试 `agent-model-selection.test.ts` 6 用例。
- 出向：`./channel-manager` `getChannelById`（`:7`，域外）、`@profer/shared` `isChannelEnabledForRuntime`（`:8`）。

## 5. 数据 I/O、读写与副作用

读渠道配置（channels.json，经 channel-manager，域外）；无写入、无副作用。

## 6. 分支、失败、取消与恢复

四级抛错分支（§3）；无恢复/取消。

## 7. 权限与权威状态

渠道可用性权威=channel-manager 配置 + `isChannelEnabledForRuntime`（runtime 开放判定）；本文件不校验调用方身份。

## 8. 修改影响面

委派/分叉/换模型前置校验；错误文案被测试锁定（`agent-model-selection.test.ts:89`）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-model-selection.test.ts`（101 行/**6 个 `test(`**）：真实临时 `PROFER_CONFIG_DIR`+channels.json 夹具（`:11-47`，写配置文件，无 mock）：Pi 渠道 Pi 模型通过×2（`:50-66`）；缺省 runtime 走 'pi'（`:68-74`）；列表仅启用模型（`:76-81`）；停用模型抛“模型不属于当前渠道或未启用”（`:83-90`）；再验通过（`:92-100`）。缺口：渠道不存在/未开放 runtime 抛错分支无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四级校验/返回语义/文案 | 已证实 | `:24-80` 逐行 + 6 测试互证 |
| `getChannelById`/`isChannelEnabledForRuntime` 实现 | 边界 | 域外未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出对象 | §2/§3 | 11-80 | covered |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
