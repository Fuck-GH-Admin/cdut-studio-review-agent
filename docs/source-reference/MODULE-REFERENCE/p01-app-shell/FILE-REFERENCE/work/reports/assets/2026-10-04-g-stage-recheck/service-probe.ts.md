---
path: work/reports/assets/2026-10-04-g-stage-recheck/service-probe.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d538b6bdcd2886d832e88fc8d97670e3f3a2f2e
sha256: a935d4fff74a8aac98860a5113683450bb185b6f8da42e32a460406fba3c951b
lines: 89
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-g-stage-recheck/service-probe.ts

## 1. 结论与边界

**G 阶段复检主探针**（89 行）：复检 review 域全链路——字段校验/角色越权/补充往返/离线包去重与篡改/评分聚合/脱敏投影/批量队列/outbox 时序。隔离 `PROFER_CONFIG_DIR`（`:13-14`）。

## 2. 导出与关键符号

无导出（探针；直连 application-service/case-store-v2/template-store/material-service/stage-workflow/offline-roundtrip/rating-service/batch-store，`:4-12`）。`seed/openSupplement` 辅助（`:23-33`）。

## 3. 内部逻辑与关键流程

out 采集（`:34-88`）：①updateFields IPC 风格数字+模板作用域校验码（`withTemplateScopeResult`，`:36-39`）②correctObservation 双写 ③无效证据拒/无效日期拒（`validateFieldValuesV2` garbage date，`:42-44`）④**学生推进系统阶段拒**（`:46-47`）⑤补充三态（无回复 satisfied/insufficient 后再回 `respondAfterInsufficient`，`:48-55`）⑥**离线往返五态**（first/duplicate/second/sameNote/**tamperedReplay 篡改投影重放**，`:56-66`）⑦评分（单评委/跨轮/无效 stage/NaN 拒 `:67-74`）⑧**脱敏投影**（judge 投影不含内部处分理由/ownRating；公开报告不泄 internalNotes，`:75-78`）⑨批量队列缺执行器（queueError+状态，`:79-81`）⑩outbox 持久化时序（push 挂起期落盘检查，`:82-88`）。

## 4. 调用者与调用链

- 入向：G 阶段复检报告流程。
- 出向：`apps/electron/src/main/lib/review/*`（源内模块族）。

## 5. 数据 I/O、读写与副作用

临时配置目录+虚构证明文件（`:15`）；review cases 状态机全链写。

## 6. 分支、失败、取消与恢复

线性探针十段；mock port 控制 outbox 时序。

## 7. 权限与权威状态

复检断言面=权限拒/脱敏/去重/篡改拒四类安全语义（out 九组字段为对账基准）。

## 8. 修改影响面

G 阶段复检报告证据资产；review 域安全语义回归基线（越权/脱敏/篡改）。

## 9. 测试证据

`NOT_RUN`。无直接测试（探针本身未运行；断言面=报告引用）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 十段探针/四类安全语义构造 | 已证实 | `:1-89` 全文 |
| 复检结论值 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 探针体 | §2/§3 | 13-88 | covered |
