---
path: work/reports/assets/2026-10-04-n-stage-recheck/rating-outbox-probe.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e90de4ce95238e225a2e419a05b3bea05e48545b
sha256: b36d88089c174c9c72f3ad36ee3f8653160738a956701e8d551ac4b26cfe1684
lines: 21
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-n-stage-recheck/rating-outbox-probe.ts

## 1. 结论与边界

**N 阶段复检探针**（21 行）：复检评分重复投票/缺评委/NaN/NA 语义与 outbox 持久化时序。`PROFER_CONFIG_DIR` 指向 mkdtemp 隔离目录（`:6`）。

## 2. 导出与关键符号

无导出（探针脚本，直连 review 域实现：judging-service/batch-store，`:1-2`）。输出 findings JSON（`:21`）。

## 3. 内部逻辑与关键流程

（`:7-21`）：rubric（missingStrategy:block）+输入构造→`duplicated=submitRating(submitRating([],input),input)`（重复投票）→NaN 分/NA 分构造→**outbox 时序探针**：mock port 的 push 在 entered 后挂起→检查 `sync-outbox/durable-action.json` 在 push 完成前已落盘（`:16-18`）→release 模拟回执→输出（duplicatedVotes/missingJudgeBypassedTotal/nanAccepted/naTotal(=4)/emptyBlockTotal/outboxWrittenBeforePushCompletes）。

## 4. 调用者与调用链

- 入向：N 阶段复检报告流程（2026-10-04-n-stage-recheck）。
- 出向：`apps/electron/src/main/lib/review/judging-service.ts`/`batch-store.ts`（源内模块）。

## 5. 数据 I/O、读写与副作用

临时 PROFER_CONFIG_DIR；outbox 文件写（探针验证面）。

## 6. 分支、失败、取消与恢复

无分支（线性探针）；mock port 控制时序。

## 7. 权限与权威状态

复检断言面=输出字段语义（如 naExpectedWhenExcluded=4 对账基准）。

## 8. 修改影响面

N 阶段复检报告的证据资产；评分聚合/outbox 时序结论来源。

## 9. 测试证据

`NOT_RUN`。无直接测试（复检探针本身未运行；断言面=报告引用）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 探针构造/时序检查/输出字段 | 已证实 | `:1-21` 全文 |
| 复检结论值 | 未知 | NOT_RUN（报告结果域外） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 探针体 | §2/§3 | 6-21 | covered |
