---
path: apps/electron/src/main/lib/review/review-generalization.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 692b7304f67fafb26285ec317b5c95d7b4c14d61
sha256: fc76f1629b08c55342006be4492bcc458eff2f536c6028c152ca34015e18754f
lines: 687
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-generalization.test.ts

## 1. 测试目标

通用化能力回归（P0/P1/P2，`apps/electron/src/main/lib/review/review-generalization.test.ts:1-21`）：领域包纯函数、领域化 prompt（不再写死综测）、多待审文件、跨文档比对、Vision 图片通路、锚点宽进严出。被测：`ai-review-service` **真实路径**（仅 mock 网关注入模型输出）+ `@profer/shared` 领域包纯函数（`:4-5`）。

## 2. 用例清单

6 describe / 23 test。**Mock 边界**（`:42-60`）：`mock.module('./review-model-gateway')` 只 mock `resolveReviewGatewayChannel`（伪渠道）与 `chatCompletionWithMeta`（记录 messages、返回预设 JSON、可注入 `nextError`/`nextImagesDropped`）；**`extractJson` 等纯函数经 `importOriginal` 透传真实现**（`:12`、`:56-57`）——解析链被真实覆盖。`PROFER_CONFIG_DIR` 隔离（`:39-40`）。

**领域包（`review-domain-packs`，`:263-295`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 1-2 | 未提供/未知 ID 回落综测包（不抛错，历史行为不变） | `:264-272` |
| 3 | 合同包含合同语义类型、不含量化等级冲突 | `:274-281` |
| 4 | 未知问题类型：标签回落原字符串、严重度回落 `yellow` | `:283-288` |
| 5 | 包内已知类型返回包内默认严重度（不一律 yellow） | `:290-295` |

**规则大纲结构化约束（`:297-325`）**：#6 prompt 请求 constraint，严格丢弃不可安全执行的 score-value 与非法日期。

**runAiReview 领域化（P1，`:327-400`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 7 | 合同包审核：system prompt 注入合同类别/类型（含「contract clause」「违约责任」，**不含**「学生综合素质测评」） | `:328-354` |
| 8 | 模型输出领域外类型 → 收敛兜底 `other`（不丢结论） | `:356-378` |
| 9 | 模型未给 severity 且类型属包内黄 → 用包内默认（非硬编码） | `:380-400` |

**多待审文件（P2，`:402-495`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 10 | 两份待审文件块文本都进模型上下文且带文件分隔标记 | `:403-427` |
| 11 | 显式 `subjectDocumentIds` 以声明为准 | `:429-456` |
| 12 | 跨文件矛盾的 `counterpartAnchor` 保留供联动高亮 | `:458-483` |
| 13 | 无待审文件 → 如实失败不产出结论（M0/H04）：`rejects.toThrow('待审文件')` | `:485-495` |

**Vision 图片通路（P0，`:497-587`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 14 | 图片证明以 data URL 内容部件随请求送出 | `:498-529` |
| 15 | 模型不支持图片 → 去图重试成功并在结论显式标注 | `:531-560` |
| 16 | 图片文件缺失 → 不因读图失败中断审核 | `:562-587` |

**extractItems 多待审文件（P2，`:589-621`）**：#17 两份文件都送入模型；#18 无待审文件明确失败且保留既有条目。

**锚点宽进严出（回归，`:623-687`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 19 | 模型未给锚点 → 结论保留并兜底到文件级锚点 | `:624-646` |
| 20 | 真实案卷模型失败 → 如实报错含「未生成模拟结论」，`callCount>0` | `:648-654` |
| 21 | 演示案卷模型失败 → 仍允许显式模拟结果（`engine:'mock-engine'`） | `:656-661` |
| 22 | 图文证明并存 → 文本证明与来源注册表也进多模态请求 | `:663-679` |
| 23 | 真实案卷识别服务失败 → 保留原条目并返回明确失败 | `:681-686` |

## 3. 真实断言

- `expect(prompt).not.toContain('学生综合素质测评')`（`:353` 区段）。
- `await expect(runAiReview(reviewCase)).rejects.toThrow('待审文件')`（`:493`）。
- `await expect(runAiReview(reviewCase)).rejects.toThrow('未生成模拟结论')`（`:652`）。
- `expect((await runAiReview(reviewCase)).engine).toBe('mock-engine')`（`:659`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实模型/网关网络（mock 注入）；`chatCompletionWithMeta` 之外的网关路径。
- 脆弱点：`mock.module` 状态（`nextReply`/`nextError`/`lastMessages`/`callCount`）为全局可变，用例顺序相关（各用例自行重置）；断言绑定 mock 记录的 messages 形状。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 23 用例覆盖 6 面；`extractJson` 透传真实现 | 已证实 | `:12`、`:56-57`、全用例 |
| 演示降级仅限显式演示案卷 | 已证实 | `:648-661`、`:485-495` |
| 测试实际通过 | 未知 | NOT_RUN |
| 真实模型输出分布 | 未知 | mock 注入 |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 领域包纯函数 | 1-5 | `:263-295` | covered |
| 大纲约束 | 6 | `:297-325` | covered |
| 领域化 prompt/解析 | 7-9 | `:327-400` | covered |
| 多待审文件 | 10-13 | `:402-495` | covered |
| Vision | 14-16 | `:497-587` | covered |
| extractItems | 17-18 | `:589-621` | covered |
| 锚点/失败语义 | 19-23 | `:623-687` | covered |
