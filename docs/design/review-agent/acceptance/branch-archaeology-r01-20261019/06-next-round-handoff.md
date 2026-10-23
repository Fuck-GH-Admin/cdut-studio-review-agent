# 06 第二轮生产架构调查接手说明
**任务目标**：依据 [01](01-branch-inventory.csv)、[02](02-pr-inventory.csv)、[07](07-verified-relations.csv)、[08](08-assets-index.json) 补足“单案、批次、模板、后台 Pi、工作台”真实实现与调用链；依旧只读、拒绝直接重构。

## 固定 SHA（首次打开）
| 作用 | PR | 精确 SHA |
|---|---|---|
| 当前 main | — | `8989941b6fb5651564e32d11c4215b6a6d5a5209` |
| 原始批量基准 | #1 | `8f4452e9f76db1c54d4c890a3085dce2e1a2e0d1` |
| D0.5 | #2 | `5709c562696a7560aba092afc86c0af83cc5cd2c` |
| D1 | #3 | `f05c17e1f620f3f3fcaddeb5c9b36c7492f30d2e` |
| D2 | #8 | `56fa52a5173dfd5acd75af52f63d821ed9d5cf47` |
| D3-R0 release | #9/#20 | `4b191c729f3d5f8135c73b87c17642023f6c3986` |
| D3-R1 | #83 | `94d5ec32b6de1ac0c185b63b4aabfddaa29b1649` |
| COMMON | #88 | `a7a6a11d4840ad64cfc858c17b35f35180adf063` |
| 八域集成 | #97 | `b68443b23293b4714e61a3b81383d3d3a56434fc` |
| D4 产品初线 | #100 | `b5a1bde69b04832a3ce5625b9577a8b50e626f13` |
| D4 W1 | #129 | `c2f965d29022a42b3c32d6a4cb73aa8fd542329b` |
| 后台旧大分支 | #21 | `ecea6de83e...`；详见 01 CSV 完整 40 位 |
| Office #71 | #110 | `6c8ee997da1f0fd781e3bd11cbc7fcc97867e918` |
| P06 R02 | #131 | `c23789882aabf18689c314c77c270ac4a8ae4729` |
| P06 R03 | #132 | `db0284879f75ce123b5d83cb6577a3cc7ad057da` |

## 优先逐项查看的源码路径
- D4 客户端统一建案：[`apps/electron/src/main/lib/review/review-d4-client.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-w1-intake-assignment-and-routing-r01/apps/electron/src/main/lib/review/review-d4-client.ts)
- D4 路由：[`apps/electron/src/main/lib/review/review-d4-routing.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-w1-intake-assignment-and-routing-r01/apps/electron/src/main/lib/review/review-d4-routing.ts)
- D4 文件批次：[`apps/electron/src/main/lib/review/review-d4-case-batch.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-w1-intake-assignment-and-routing-r01/apps/electron/src/main/lib/review/review-d4-case-batch.ts)
- D4 通用对象：[`apps/electron/src/main/lib/review/review-d4-common.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-common-object-scenario-r01/apps/electron/src/main/lib/review/review-d4-common.ts)
- D4 文档与材料绑定：[`apps/electron/src/main/lib/review/review-d4-material-resolution.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-w1-intake-assignment-and-routing-r01/apps/electron/src/main/lib/review/review-d4-material-resolution.ts)
- D4 审核 Pi 提交修复：[`apps/electron/src/main/lib/review/pi-review-submit-repair.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/d4-p2c-submit-repair-feedback-r01/apps/electron/src/main/lib/review/pi-review-submit-repair.ts)
- P06 单案 V2 存储：[`apps/electron/src/main/lib/review/case-store-v2.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r03-batch-run-binding-r01/apps/electron/src/main/lib/review/case-store-v2.ts)
- P06 批次仓库：[`apps/electron/src/main/lib/review/batch-store.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r03-batch-run-binding-r01/apps/electron/src/main/lib/review/batch-store.ts)
- P06 批量自动化：[`apps/electron/src/main/lib/review/batch-automation-service.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r03-batch-run-binding-r01/apps/electron/src/main/lib/review/batch-automation-service.ts)
- P06 批次集体操作：[`apps/electron/src/main/lib/review/batch-group-action-service.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r03-batch-run-binding-r01/apps/electron/src/main/lib/review/batch-group-action-service.ts)
- P06 IPC / Pi 绑定：[`apps/electron/src/main/lib/review/review-ipc.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r03-batch-run-binding-r01/apps/electron/src/main/lib/review/review-ipc.ts)
- P06 R02 Run 来源校验（R03 已不存该独立文件）：[`apps/electron/src/main/lib/review/batch-run-provenance.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/feat/p06-l02-01-r02-product-gap-r01/apps/electron/src/main/lib/review/batch-run-provenance.ts)
- Office #71 source identity：[`apps/electron/src/main/lib/document-parse-tools.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/fix/office71-generic-index-source-identity-r01/apps/electron/src/main/lib/document-parse-tools.ts)
- Office #71 专项测试：[`apps/electron/src/main/lib/document-parse-tools.office71.test.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/fix/office71-generic-index-source-identity-r01/apps/electron/src/main/lib/document-parse-tools.office71.test.ts)

## 第二轮必要调查
1. **统一业务模型**：对照 `case-store` / `case-store-v2`、`workspace-service-v2`、`review-authoring-v1` 与共享 `review-v2` 类型。列出持久化对象、身份、revision、Run、SourceRef、Check、Subject、责任边界。
2. **单案执行**：沿 Renderer→Preload→IPC→Case/Workspace→D2/Pi→Run→判定/报告做逐函数调用图；核对 main/P06 与 D4 两条线的代码，而非 PR 文案。
3. **批次复用**：分别追踪 D4 `review-d4-case-batch.ts` 与 P06 `batch-store.ts`/`batch-automation-service.ts`，证明哪些是一次性材料批次、哪些是真正单案调度，列出重复实现与可保留特性。
4. **模板/编译**：检查 #88、#97、八领域分支是否保留 C 母版全部规则，比较模板路径、内容哈希、Check 映射，不能仅比较 git ancestry。
5. **Pi/后台**：比较 #21 与 #132、`agent-session-manager`、`review-agent-assignment`、`pi-case-review-service`、`review-ipc`，确认 Pi 生命周期是否另起案卷对象。
6. **安全边界**：验证 SourceRef、Office #71、Owner/session 隔离、Run provenance R02→R03 差分，重点确认没有因功能迁移恢复旧漏洞。
7. **被本轮阻断的 git 精核**：在能 clone 的本机对全量 branch 执行 `git for-each-ref`、`git merge-base`、`git branch --contains`、`git cherry`/patch-id，按固定 SHA 写回索引，不覆盖本轮历史快照。

## 最终输出期望
一份 production code ownership matrix：唯一业务模型 / 单案执行 / 批次调度 / 模板与编译 / Pi 会话 / 工作台；每行必须带具体函数、入口、调用方向、真实测试与遗留实现归属。**不要把本第一轮资产标签用于直接删除分支。**
