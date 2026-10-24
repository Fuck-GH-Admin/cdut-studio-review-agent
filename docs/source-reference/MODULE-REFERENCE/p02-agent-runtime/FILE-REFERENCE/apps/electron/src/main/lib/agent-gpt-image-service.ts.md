---
path: apps/electron/src/main/lib/agent-gpt-image-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7d71673050012fd5504eefc12d926a8cc6c5f69f
sha256: dc89d7b4af49cdb5ca9e50b5e210dbd984c3dfe754a0cd36e7291b48b2dc1eba
lines: 166
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-gpt-image-service.ts

## 1. 结论与边界

Agent 图片生成边界（:73-77 注释）：**先持久化记录、再校验/读参考/接触 provider**（被拒调用也成诚实失败卡）；参考先授权后请求；产物只经会话输出协议落盘。main-process-only 重试从失败记录重建输入。

## 2. 导出与关键符号

导出 6 条（`export` :22/:26/:32/:47/:78/:145）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `__setAgentGptImageProviderForTest` | `:22-24` | 测试 seam（注释 :21：生产恒用共享 provider） |
| `AgentGptImageContext` | `:26-30` | 扩展 ImageOutputContext + sessionId + onGenerationUpdate |
| `AgentGptImageInput` | `:32-45` | toolCallId/prompt/size/quality/referenceImagePaths?/useLastGeneratedImage?/retryOf?（main-only :40）/referenceGenerationId?（main-only :43）/signal? |
| `AgentGptImageResult` | `:47-49` | ok+output+mode+edited+generationId \| !ok+error |
| `generateAgentGptImage(input, context)` | `:78-142` | 主流程 |
| `retryAgentGptImage(record, context)` | `:145-166` | 重试（见 §3） |

内部：`safeError`（:53-59，500 截断）、`publicImage`（:61-67，卡片仅三字段）、`notify`（:69-71，回调失败 console.error 不中断）。

## 3. 内部逻辑与关键流程

`generateAgentGptImage`（:78-142）：
1. `useLastGeneratedImage` 解析原图（referenceGenerationId 定点回放 :88-92，注释 :149-151：重试必须回放原成功图）。
2. **先 createImageGenerationRecord**（:99-104，含「无效提示词」占位 prompt :101）。
3. 校验（:106-109）：prompt 空/useLastGenerated 与 paths 互斥/参考数 ≤`MAX_GPT_IMAGE_REFERENCES`/last_generated 需 succeeded 带图。
4. 参考授权读（:112-115，readAuthorizedAgentImage）→ provider 调用（:116-119，idempotencyKey `agent-gpt-image:<session>:<toolCallId>`）。
5. 失败→`AgentGptImageProviderError`（:120）；成功→transition saving→writeAgentImageOutput→transition succeeded（official 盖 chargedCredits 5 :127）。
6. catch（:131-141）：仅 requesting/saving 状态转 failed（:134-139）；返回 ok:false。

`retryAgentGptImage`（:145-166）：paths 引用拒绝自动重试（:152-154）；last_generated 需原图仍在（:155-160）；以新 toolCallId+retryOf 重建调用（:161-165）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `agent-gpt-image-tools.ts:4`、`adapters/pi-builtin-tools.ts:110`；测试 `agent-gpt-image-service.test.ts:14`（动态 import）。出向：`node:crypto`、`@profer/shared` 类型、`./agent-image-output-service`（:113/:124）、`./agent-image-generation-records`（:70/:90-91/:99/:122/:125/:136）、`./gpt-image-service`（generateGptImage :19、MAX_GPT_IMAGE_REFERENCES :108）。

## 5. 数据 I/O、读写与副作用

经 records JSONL 追加+会话输出落盘；provider 网络调用（经注入 seam :19）；console.error。

## 6. 分支、失败、取消与恢复

失败转 failed 卡（:134-139）；provider 错误消息透传 500 截断（:56-58）；`signal` 透传 provider（:118）。恢复=retryAgentGptImage（受限）。

## 7. 权限与权威状态

参考授权先于 provider（:112-115）；retryOf/referenceGenerationId main-only（:40/:43 注释：渲染层不得经普通工具输入指定）。

## 8. 修改影响面

图片工具链+UI 卡片；provider seam。需同步测试 `agent-gpt-image-service.test.ts`（7 用例）。

## 9. 测试证据

`agent-gpt-image-service.test.ts`（批内，1 describe/7 用例，NOT_RUN）：相对路径参考委托+落盘（:52-66）、授权根/越权/目录/symlink 前拒（:68-87，calls 0 :86）、伪图/超大/超 4 张前拒（:89-99）、provider 失败不落产物（:102-110，updates requesting→failed :108）、诚实三卡（:112-122，chargedCredits 5 :121）、last_generated 仅用本会话最新成功图（:124-139）、缺失/冲突 last_generated 前拒（:141-147）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条；先记录后请求语义 | 已证实 | :97-104 |
| 重试仅限 none/last_generated | 已证实 | :152-160 |
| provider 网络行为 | 未知（属 gpt-image-service） | :116-119 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| generateAgentGptImage 全流程 | §3 | :78-142 | covered |
| retryAgentGptImage | §3 | :145-166 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
