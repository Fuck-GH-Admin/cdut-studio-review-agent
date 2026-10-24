---
path: work/reports/assets/2026-10-04-n-stage-recheck/service-probe.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a666a1a84fe55e98a9a58532401fdf701404f9b5
sha256: 5b47ed3c9ceea22c8944b018500cc12e621fd48df551003f23c366ee50569f74
lines: 55
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-n-stage-recheck/service-probe.ts

## 1. 结论与边界

**N 阶段复检主探针**（55 行）：隔离目录复检 review 域六链路——事实改写/证据绑定/阶段流转/补充闭环/离线往返/运行断点恢复。`PROFER_CONFIG_DIR=mkdtemp/config`（`:13-14`）。

## 2. 导出与关键符号

无导出（探针；直连 application-service/template-store/case-store-v2/stage-workflow/offline-roundtrip/run-service-v2/run-store-v2/resource-check，`:1-9`）。`publishComprehensiveFixture` 发布 fixture（`:15`）。

## 3. 内部逻辑与关键流程

findings 采集（`:22-55`）：①updateFields 0 值落盘+correctObservation 双写（观察值/表单值）②**无效证据绑定是否被拒**（nonexistent 版本+foreign subject，`:28-29`）③学生自行推进系统阶段是否被拒（`studentAdvancedSystemTask`，`:33-34`）④补充**无回复即 satisfied**的阶段/任务/回复数（`:36-40`）⑤离线往返+**resetRoundTripDedup 后重启模拟重放**（`:41-44`）⑥**运行中断点**（parse 阶段读 checkpoint）+**删 artifact 后恢复重跑**（ocr 重调计数，`:45-53`）⑦空资源根 resourceCheck（`:54`）。

## 4. 调用者与调用链

- 入向：N 阶段复检报告流程。
- 出向：`apps/electron/src/main/lib/review/*`（源内模块族）。

## 5. 数据 I/O、读写与副作用

临时配置目录+review cases/运行 artifact 文件（含 rmSync 删除 artifact `:50`）。

## 6. 分支、失败、取消与恢复

线性探针；resumeRunId 断点恢复路径显式覆盖（`:52`）。

## 7. 权限与权威状态

复检断言面=findings 七字段（权限拒绝/去重/恢复语义对账基准）。

## 8. 修改影响面

N 阶段复检报告证据资产；review 域六链路回归基线。

## 9. 测试证据

`NOT_RUN`。无直接测试（探针本身未运行；断言面=报告引用）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六链路探针构造/findings 语义 | 已证实 | `:1-55` 全文 |
| 复检结论值 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 探针体 | §2/§3 | 13-55 | covered |
