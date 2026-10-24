---
path: apps/electron/src/main/lib/review/ai-review-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 52bbd03641240ccd0d7dbc0eb7d27e29fc9448d3
sha256: de4cb25bcdf71dd84b824f2c9b65e0e09443bf0af32db0b4f604b3d03d346d92
lines: 1106
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/ai-review-service.ts

## 1. 结论与边界

AI 审核服务（D6 双路径，头注 :1-15）：四能力（规则大纲/条目识别/AI 审核/助手对话）全部先走真实网关路径，失败或无渠道**显式降级**到确定性/静态路径并标注来源（`generatedBy`/`degraded`+`console.warn`）。仅内置演示案卷允许回退 mock；真实案卷失败如实抛错。纯 Node+FS+网关。

边界：网关在 `review-model-gateway`；mock 在 `mock-review-engine`；运行编排在 `run-service`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiReviewOutcome` | type | 57-76 | run-service 补齐 id/时间/状态 |
| `renderRuleDocuments` | fn | 108-125 | 全部依据渲染（M0/H02） |
| `generateRuleOutline` | fn | 356-442 | 能力 1 |
| `extractItems` | fn | 495-577 | 能力 2 |
| `parseFindings` | fn | 617-694 | findings 校验（M0/H04） |
| `renderEvidenceDocuments` | fn | 695-721 | 证明原文（M0/H01） |
| `sanitizeFindingSources` | fn | 722-764 | 锚点存在性核验（M0/H07） |
| `computeUnprocessedMaterials` | fn | 765-788 | 未处理材料账本（H01） |
| `buildSourceRegistry` | fn | 789-802 | 来源注册表白名单（H07 前半） |
| `runAiReview` | fn | 803-1015 | 能力 3 |
| `ReviewAssistantReply`/`reviewAssistantChat` | interface/fn | 960-1024/1032-1106 | 能力 4 |

内部：`requireRulePack`（:65-74）、`renderRuleDocument`（:76-81）、`subjectDocuments`（:125-134）、`renderSubjectDocuments`（:136-153）、`collectVisionImages`（:171-218）、`domainPromptParts`（:222-237）、`countImageBlocks`（:239-243）、`findBlockText`（:245-252）、`fallbackOutline`（:258-266）、`parseOutline`（:268-292）、`isIsoDate/isValidRuleConstraint`（:294-352）、`parseAnchor/parseItems/withFallback/fallbackAnchor`（:452-485）、`parseSeverity/parseKind/parseSuggestion/parseAnchors`（:574-610）、`findFocusFinding/staticAssistantAnswer`（:1029-1075）。常量：`MAX_TOKENS=4096`（:53）、`ASSISTANT_CONTEXT_LIMIT=12`（:56）、`MAX_VISION_IMAGES=8`（:59）、`MAX_VISION_IMAGE_BYTES=8MB`（:62）。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. **降级总纲**（头注 :6-8）：每次降级 `console.warn('[审核专区] ...降级: ...')` + `generatedBy/degraded` 字段；**M0/H03：演示回退仅限 `isDemo` 案卷，真实案卷失败如实抛**（:371-377/:477-481/:810-815）。
2. **大纲**（:359-450）：未知领域包 → throw `审核领域未配置: …`（M0/H14/K14，:363-365）；真实路径约束指令（constraint 七种、`level-mapping` 优先禁拆分，:396-403）；成功后 `updateCase` 回写 outline+`confirmed:false`（M0/H05 写队列防覆盖，:432-443）；失败真实案卷 throw `…（案卷已有大纲未改动，可重试或人工补充）`（:448）。
3. **条目识别**（:487-570）：多待审文件逐份指令；`collectVisionImages` 随附图片（≤8 张/≤8MB，超限进 dropped）；`chatCompletionWithMeta` 的 `imagesDropped` 警示（:553-555）；成功回写 items（:557-563）；真实案卷失败 throw `条目识别失败：…（已有条目未改动，请重试）`（:566）。
4. **`parseFindings`**（:613-675）：**空数组合法=未发现问题**，不触发 mock（注释 :614-616 M0/H04）；外案 itemId 丢弃（:629-633）；全非法 → throw；收窄 kind/severity/suggestion（未知兜底 'other'/yellow/manual-review，:574-610）；锚点兜底（空 documentId→role 首文档，:660-667）；`imagesDropped` 时 detail 追加标注（:671-673）。
5. **`sanitizeFindingSources`**（:722-766）：documentId 不存在→删锚点；blockId 失效→降级文件级（删假块 ID）；**全部出处不可核验 → severity yellow+suggestion manual-review+降级说明**（「伪引用不得以红卡交付」，:749-756）。
6. **`runAiReview`**（:803-1015）：零依据/零待审文件在兜底 catch **之前**如实失败（注释 :817-819 M0/H04，不能被降级吞成 mock）；prompt 含全部依据（M0/H02 不用首包代表整组）/证明原文/来源注册表/跨文件比对提示（`cross-document-mismatch`，:848-852）；`REVIEW_RUN_TIMEOUT_MS` 专用超时（:893-895）；`sanitizeFindingSources` 后处理（:899-900）；M0/H13 分值守门：依据未确认（无 `confirmed` rulePack）→ 剥离 `suggestedScore`（:912-922）；coverage 含 `unprocessedMaterials`（H01）；真实案卷失败 throw `模型审核失败：…（未生成模拟结论…）`（:1011）。
7. **助手**（:1018-1106）：`staticAssistantAnswer`（degraded:true，首行标注「基于案卷元数据的静态解答」，绝不材料外推断，D9）；真实路径引用收集（只收真实存在 ID，:1098-1105）。

## 4. 调用者与调用链

入向（生产）：`run-service.ts:16`（runAiReview/computeUnprocessedMaterials）；`review-ipc.ts:54`（四能力 IPC）。测试：无专属测试文件（全树 glob；`ai-review-service.test.ts` 不存在）。出向：`./case-store`（:38）、`./demo-fixtures`（:39）、`./mock-review-engine`（:40）、`./review-model-gateway`（:41-47）、`@profer/shared`（:11-36）。

## 5. 数据 I/O、读写与副作用

- 读：案卷（getCase/listRuns）、图片文件（collectVisionImages base64）；写：`updateCase` 回写大纲/items（写队列）。
- 副作用：`console.warn/log` 全程；网关请求（chatCompletion）。

## 6. 分支、失败、取消与恢复

- 真实案卷：失败一律 throw（不产生模拟结论）；演示案卷：降级 mock/fixture 并 warn。
- 输入校验前置（零依据/零待审）不被 catch 吞（:817-825）。
- 超时：审核用 `REVIEW_RUN_TIMEOUT_MS`（防推理模型 60s 误判，:892-895）。
- 无取消（AbortSignal 未接）；重试由用户触发。

## 7. 权限与权威状态

- 诚实降级权威：降级可观察（warn+字段），`generatedBy:'ai'/'fixture'`、`degraded`；M0/H03 真实案卷不回填演示校规（:371-377）。
- 出处权威：来源注册表白名单（H07）+ 存在性核验 + 伪引用降黄卡（:722-766）。
- 分值权威：依据未确认剥离 suggestedScore（M0/H13，:912-922）——模型分值不冒充规则计算。
- 领域权威：未知领域包拒绝执行（M0/H14/K14）。
- 无 sender/role 检查（actor 由 IPC 层带入）。

## 8. 修改影响面

V1 审核主链（`RUN_REVIEW`）与助手/大纲/识别 IPC；降级语义被 `review-multi-rule.test.ts` 间接断言。无专属测试——大缺口。同测：`review-multi-rule.test.ts`（他批）。

## 9. 测试证据

无直接测试文件（全树 glob）。间接：`review-multi-rule.test.ts` 经 `startReviewRun` 走 `runAiReview` 的失败降级（「无模型先产生真实失败记录」）。缺口：四能力真实路径、`parseFindings` 收窄、`sanitizeFindingSources` 降级、分值守门、视觉 dropped 账本。NOT_RUN（真实模型不跑）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出/内部符号存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 真实案卷不产生模拟结论 | 已证实 | :371-377/:810-825/:1011 |
| 空 findings 合法不触发 mock | 已证实 | :614-616 |
| 伪引用降黄卡/分值守门 | 已证实 | :749-756/:912-922 |
| 视觉 dropped 进覆盖账本 | 已证实 | :171-218/:768-786 |
| 真实模型行为 | 未知 | NOT_RUN |
| 各能力端到端 | 未知（无专属测试） | §9 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 四能力主链+降级 | §3.1-3.3/3.7 | 359-1015/1018-1106 | covered（未测） |
| `parseFindings`/`sanitizeFindingSources` | §3.4-3.5 | 613-766 | covered（未测） |
| 覆盖账本/来源注册表/分值守门 | §3.6 | 768-922 | covered（未测） |
