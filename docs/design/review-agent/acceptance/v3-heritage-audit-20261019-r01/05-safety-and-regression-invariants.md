# 05｜V3 不可丢失的跨边界安全与回归不变量
以下为安全合同，不能因为两个层级都在检查就只留一个。历史技术测试与本轮重新执行状态分开；本轮没有跑单测、GUI、Provider、学校正式材料。

| 约束 | 真实源/测试 | 必须覆盖的负例 |
|---|---|---|
| 案卷写事务带 requestId/payloadHash/expectedRevision、不得碰撞复用 | [CASE-02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store-v2.ts) / `case-store-v2.test.ts` | 旧 revision、同 ID 不同载荷、进程中断 |
| 材料读/检查执行账本，空计划与 0 有效结论不得“全符合” | [RUN-02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/coverage-ledger.ts) | 未读扫描件、缺组检查、execution-failed、not-executed |
| SourceRef 不可跨案/失效版本/假 block；视觉预览非文字引文 | `source-index.ts`、`pi-case-review-service.ts`、`document-capability-library.ts` | Office 双案同名、错误 parseRevision、假页图 OCR |
| 作用对象/Check/条件三值 unknown，未确认来源不能强行判符合 | [TPL-03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d2-runtime.ts)、`review-d4-common.ts` | 多 Subject 串案、条件缺来源、D2_UNMAPPED_ADVANCED |
| 冻结模板/模块版本/digest 锁，不能静默升级或丢责任 | `review-d3-module-library.ts` / `review-d3-upgrade.ts` | 缺依赖、循环、篡改、升版删除 Check 未 ACK |
| 只有授权人可以形成正式决定，业务状态与运行状态分离 | `stage-workflow.ts` / `workspace-business-service-v2.ts` / `review-ipc-actor-guard.ts` | actorSource 伪造、run@rev 虚假终审、无有效检查通过 |
| 显式指派/撤权/Owner 与真实会话轮次绑定 | `review-agent-assignment.ts`、`review-pi-admission.ts` | 过期 turn、撤权后继续、owner 被普通会话复用 |
| Pi Main 使用显式最小工具、权限于执行时重验 | `review-strict-pi-tools.ts`、`agent-orchestrator-review-tool-gates.p06.test.ts` | Bash/MCP 外部工具、路径逃逸、await 后失效权限 |
| 批次必须固定模板和本批 Run ID，恢复时清旧证 | `batch-template-lock.ts` / `batch-store.ts` / `batch-automation-service.ts` | 两批同案同模板但不同 Run；旧 done 空 runId |
| 自动通过是通过正式 readiness 和政策/权限门控的合法事务 | `batch-automation-gates.ts`、`batch-automation-service.test.ts` | 模板未发布、无材料已读、限额评分业务、有待申诉 |
| 原件在案卷可信路径内，文件 hash/大小不被切换 | `review-d4-material-resolution.ts` / `review-d4-document-retry.ts` | symlink、越界、同名替换、hash 错、过期 revision |
| 批量技术失败不转成业务不合格、模型漏检查不判完成 | `pi-review-agent-client.ts` / `pi-review-submit-repair.ts` | 只提交 1/2 Check、turn limit、没模型 |
| 受控 I/O 失败不能产生已完成假 ACK 或未持久化终态 | `review-pi-admission.ts` / `review-io-kernel-enospc.p06.test.ts` | /dev/full、真实小卷 ENOSPC（尚 BLOCKED） |

**特别失败门禁**： P02 旧会话删除后迟到 metadata、Office71 同名不同源、D4 C10 双击与 token、D3 MD-Q1 漏规则 R08/R33、旧 Pi 9 项缺结论、P06 E06 Provider 未授权、跨批 Run 复用，全部加入 V3 必跑回归目录。安全重复可在共享无状态校验器复用规则，但每个真正信任边界仍须执行。
