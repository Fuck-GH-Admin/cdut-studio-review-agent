---
path: apps/electron/src/main/lib/review/pi-case-review-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f718651b3acdbf806432773dfdfac95bb3ea366
sha256: 2f794aaa68fdd2f236aeb1aea62001362225290c7f8679b9ef8f86611c5a0281
lines: 273
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-case-review-service.test.ts

## 1. 测试目标

`pi-case-review-service` 的提交/续审/继承/reconcile 全链回归（describe :101）：finish 收尾门禁（RUN-42 业务就绪分离）、RUN-46 文字出处须本轮读取、跨轮续审复用 runId、读取凭据继承、RUN-44 历史只读修复。被测含真实事务层（`createCaseFromTemplate`/`registerMaterial`/`run-store-v2`）。

## 2. 用例清单

4 用例 / 1 describe。夹具：`PROFER_CONFIG_DIR=mkdtemp('cdut-pi-review-submit-')`（:13-17）；`templateFor` 生成 5 项语义 case 域检查模板（:21-48）；`setupReviewCase`（:50-89）真写 1×1 PNG（base64 :60）与 TXT（:61）、真实 `registerMaterial` 两次、`preparePiReviewRunV2`，返回 imageRef/textRef。`checksWithTextRef`（:91-99）批量 5 检查。**无 mock**（真实磁盘事务）；模型客户端不在链上（直接调 `submitPiReviewResultV2`）。

| # | 用例 | 行 | 场景 |
| --- | --- | --- | --- |
| 1 | finish=true 图像出处拒绝+缺项保持开放，修正后同运行提交 | 102-162 | 含 RUN-46/42 |
| 2 | 部分完成运行可续交（复用 runId） | 164-211 | resumeRunId |
| 3 | 沿用历史完整读取回执 | 213-244 | inheritReadReceipts |
| 4 | 读取历史时修复缺失凭据（不改写封存） | 246-272 | RUN-44 |

## 3. 真实断言

- 用例 1：首交 `status:'running'`、rejected 含 `'图像出处尚未通过'`、`missingChecks` 5、run 保持 running 无 completedAt、无 execution-failed、attempt 落盘（:123-130）；未读正文引用 5 条 rejected 均含 `'文字出处尚未在本轮实际读取'`（:138-139）；`recordPiReviewDocumentRead` 后重交 `{accepted:5, rejected:[], missingChecks:[], status:'completed'}`、checks 5（:143-150）；readiness artifact `businessReady:false`、`unreadDocuments>0`、reasons 含 `'份材料未读'`（:153-157）；diagnostics 含 `'技术轮完成，但业务未就绪'`、opinion 含 `'技术轮完成不等于完整审核通过'`（:158-161）。
- 用例 2：`finishPiReviewRunV2` 后 `partially-completed`（:185）；续交 `runId` 相同、`continuedRun:true`、userMessage 含 `'【续审同一运行】'` 与 `'图像出处尚未通过'`、绑定更新、run 重开（:193-198）；补齐后 completed、checks 5（:209-210）。
- 用例 3：新运行 `inheritedReadDocumentNames` 2 份、userMessage 含 `'【沿用已核验的原件】'`（:234-235）；新 run 2 份 read 且 reason 含源 runId（:237-238）；`node-pi-read-inheritance` 含两文档 `sourceRunId`（:239-243）。
- 用例 4：reconcile 内存视图修复 `status:'read'`、reason 含源 runId（:263-268）；磁盘封存运行仍 `unread`（:270-271，RUN-44 只读）。

## 4. 未覆盖与脆弱点

- 未覆盖：观察校验各拒绝分支、`buildPiReviewCompactionSummary`、`cancelPiReviewRunForSession`、`recordPiReviewPreviewByPath`、`finishPiReviewRunV2` 归档分支。
- 脆弱点：强依赖真实 `registerMaterial` 解析产物（image/text block 选取 :80-81）；检查 id 规则 `section-all-check-{n}`（:93）耦合 `checkId` 生成格式；文案子串断言多；`setupReviewCase` 每用例独立 suffix 隔离。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言/夹具如 §2-3 | 已证实 | 本文件逐行 |
| 真实事务链（无 mock） | 已证实 | :50-89 |
| RUN-42/44/46 三不变量被断言 | 已证实 | :152-161/:262-271/:132-141 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| finish 收尾门禁 + 业务就绪 | §3 | 123-161 | covered |
| RUN-46 文字出处 | §3 | 132-141 | covered |
| 续审复用 runId | §3 | 185-210 | covered |
| 读取继承 | §3 | 227-243 | covered |
| RUN-44 只读修复 | §3 | 262-271 | covered |
| 观察拒绝/预览/compression | §4 | — | unknown（未测） |
