# G04-T05 D作者来源及ACL证据声明（E r01 → r02）

- 事项：G04-T05｜高风险实验活动专项作业许可；本轮只回应 `E-G04-GLOBAL-0003 / BLOCKED_INPUT`。
- 阅读依据：E r01冻结审计HEAD `fc2ace5c874454ddbcfca731be7aa093416dab12` 下的 E4-issue-ledger、E-final-verdict、E0-coverage-and-isolation。该SHA是**E审计提交，不是D原作者提交**。
- 早期D作者Git commit/blob：`NOT_AVAILABLE`。原D版本 `D v2.1 / FROZEN_GOLD_v1`；研究基线依A+B及官方来源，原D0=PARTIAL。
- 本次仅新增来源与ACL说明；原INPUT、EVALUATION、REPORTS **字节零修改**；未读取或修改C正文、C规则或C作者测试预期；没有执行E验收。

## 原始交付物SHA-256（与E r01的E0-input-manifest.json一致）

| 名称 | SHA-256 |
|---|---|
| G04-T05_INPUT_ONLY.zip | `cb778721698bee8106bcced4a59b163f5afcf8564999eadb7c3468e11085033b` |
| G04-T05_EVALUATION_ONLY.zip | `3439b51dde96863cfe854432d62ded6db1c41fb6d4e5b622b5b1099f6f11de0e` |
| G04-T05_D_REPORTS.zip | `121737bce03946cada21067d8432ddc8907b0b5e099763e07994c0f485b58a80` |

当前本轮本地校验：26案、144个输入ZIP成员、59个评估成员、5份原报告。ZIP CRC及Gold内各文件SHA检查通过；**不代表业务真值外部复算**。

## 制作时间与版本迭代不能倒签

历史会话附件的**首份带Gold评估ZIP**最早观察上传时间：`2026-10-12T20:58:55.358849Z`。这是**存在性时间**，并非可信首次Gold计算时间。ZIP内部不带时区的文件时间和自述`frozen_at:2026-10-13`均不能独立证明首次构建或冻结时刻。

本会话存在四次历史上传快照：S1 20:58:55Z、S2 21:00:47Z、S3 21:02:02Z、S4 21:02:48Z；**四者均写`FROZEN_GOLD_v1`，但S1→S2修改26案`fact_checks`，S2→S3修改26案`simulated_observed_at`；S3→S4逐案Gold JSON内容一致，最终ZIP字节SHA与E r01一致**。因此不能宣称最早S1起已经不可变。S1—S3为构建迭代；只固定最终S4包SHA；此前的正式冻结批准/签署时间 `NOT_AVAILABLE`。

## 独立性与ACL事实边界

- 原D历史报告声称制作Gold前未读取G04-T05 C正文或作者预期，C未提供给此D分支；本轮仅在Gold交付**之后**读取E r01审计摘要，不读取C正文。D作者此前参与A/B研究。
- **制作期外部独立性`UNVERIFIED`**：无不可篡改的C访问排除日志、签署人、可信时序记录。当前无已证C污染具体案例，但26案均缺可验证的制作隔离证据；这不是断言26案均被污染。
- 评估原件处于会话附件；E r01观察到ChatGPT Library ZIP。评估ZIP**未加密**；没有可验证的专用ACL或访问日志。C作者能否通过同账户Library访问：`UNKNOWN_POTENTIALLY_SAME_ACCOUNT`。
- GitHub仓库实际为 **public**；E r01审计main没有原作者D资产，公开Git历史**未观察到Gold可下载文件**，但这不等于证明所有其他渠道未泄漏。公开CI若只克隆该仓库，未见Gold内容；若拥有另行授权凭证，访问能力仍未知。
- `GOLD_ACL_EVIDENCE=UNVERIFIED`；`GOLD_ACCESS_LOG=NOT_AVAILABLE`；`IMMUTABLE_PRIVATE_ARCHIVE=NOT_AVAILABLE`；`CONFIRMED_C_CONTAMINATION=NONE_OBSERVED`（非“经验证无污染”）。

**可以公开**：本说明、原外部ZIP校验和、案例数量、来源范围、审计问题状态。**严禁公开**：gold/逐案答案、trusted_fixtures/、scoring/、含Gold映射的coverage/与frozen_manifest.json、隐藏原评估ZIP。

## 后续证明与签署

存储管理员须为**原S4字节不变的包**建立真正独立的私有对象位置，返回对象ID+SHA、C作者隔离的角色白名单、ACL与可验证访问日志，并追查原制作期间的访问。D作者不能代签或宣称管理员已完成。独立E须按证据判断是否保留`BLOCKED_INPUT`。仅在**证实**Gold先读C、或Gold已实际泄露时，由新的隔离D会话重做受影响案例；单凭ACL缺失不作泄漏断言。

本文件是2026-10-15新补证，不是2026-10-13历史Gold作者签名或冻结证书。