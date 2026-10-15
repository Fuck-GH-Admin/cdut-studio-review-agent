# 53｜L02 继续开发：上游 Office 缺陷延期与 SourceRef 防串用预备门禁（2026-10-16）

> **性质：用户批准的非发布性继续开发 / 兼容性测试增量。** 本文不签收 U0/U1，不变更 29 LIVE 台账、46 历史实测或 52 首败。禁止在集中验收前抢修 Office 索引并把修复混到本审核分支里。

## 1. 用户确认的先后顺序

1. 当前阶段继续推进 **与 Office 同名索引缺陷无关** 的 P06 审核研发和安全负例；[缺陷 #71](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/issues/71) 仅跟踪并冻结。
2. 后续集中验收轮，在冻结主树/上游/输入样本与真实 Office、Main、Pi 环境下，查清 #71 是否只在普通 Agent 索引、是否可以跨文件名/跨格式、是否影响 review 的 `SourceRef` 和原件/覆盖率；保留首败/日志/输入 SHA。
3. **集中验收后下一轮**再解决 #71：先在原项目对应的上游工作树准备**仅通用 Office 实现**的独立 PR，提交至 `Nya-Angle/CDUT-Studio`；审核侧仅在真实复核证明必要时提交 **我们仓库独立分支**的专属修复，不能把公共工具重写混进审核 PR，也不能倒转“先验收、后修复”。
4. 未来上游 PR 与审核补丁各有不同基线/tree/测试矩阵/独立判词；保留所有历史失败、原 Gold、严格五工具与 owner/assignment/RunStore 保护。

## 2. 本轮实际工作范围

- 新工作分支：`feat/p06-l02-current-compat`，直接基于我方已整合 `main@8989941b6fb5651564e32d11c4215b6a6d5a5209`，**不把分叉 PR #21 的旧文件重新 rebase/merge 到新版 Office / 侧栏**。
- 新增 `apps/electron/src/main/lib/review/review-office-v2-sourceref-boundary.l02.test.ts`：以相同文件名的两份 V2 材料为正例，并验证普通 `fileId/revision/fN:...` 不足以构成有效的审核 SourceRef；跨版本 block/quote/旧材料版本不得使 `submit_check` 和 `record_observation` 受理。
- 只测**当前真实 `buildReviewTools` 的业务接口**，不借普通索引的已知缺陷来伪造 review 失败；新增测试不修改任何生产代码、不扩大五工具权限，不接触私有 Gold。

## 3. 证据门禁

| 项目 | 当前判词 | 继续条件 |
|---|---|---|
| #71 上游同名索引 | SOURCE-DERIVED REPRO / DEFERRED_FIX | 集中验收前不修改 |
| 新版 sourceRef 静态/单测 | **新增源码测试，待 CI/真环境执行** | CI 完成后按具体 SHA 回填；独立真实 Main/IPC 仍待测 |
| L02-U0 | **PARTIAL / BLOCKED_ENV** | 同一 tree 冻结安装、全构建/测试及相关原始日志后单独签 |
| L02-U1 | **NOT ADMITTED / NOT-RUN E2E** | U0 签收后才能进行正式 U1 验收 |
| L02-00～04 | NOT-RUN | 依旧遵循 49/47 前置条件 |
| 29 LIVE / P06 / PR #21 | 原状态不变 | 最终合并仍 MERGE NO-GO |

## 4. 版本/责任划分

- `main@8989941b`：本轮**唯一用于预备测试的公共集成源基线**；不直接推 main。
- `feat/review-owned-background-sessions`、Draft PR #21：历史后台审核研发及 29/46/49/50/52 证据所在；不盲目改它的 parent/HEAD 来引入新版工具。
- `feat/p06-l02-current-compat`：本轮仅回归测试与合同说明；将来若需审核模块真正修复，应独立标明发生在验收后、分离上游 Office PR。
- 上游 `Nya-Angle/CDUT-Studio`：本轮只读；**当前不提交 PR，不提交通用 Office 补丁**。

**不因测试代码存在而签署验收通过。** 下一个可执行步骤是在合法 runner 上获取新分支对应 SHA 的 CI/真实结果，随后继续其它不依赖 #71 的 P06 差分研发。
