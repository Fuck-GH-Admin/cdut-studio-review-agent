---
path: apps/electron/src/main/lib/review/demo-fixtures/demo-case-fixture.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 839ef73e91c23b8af53f1f661ba49a6e4279a8c4
sha256: c83a1bbb2551449ae10e25a9e93be4f59c1d8caef090d1a052fa890c0d5be28d
lines: 469
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/demo-fixtures/demo-case-fixture.ts

## 1. 结论与边界

内容审核专区 demo 案卷静态数据（头注释 :1-10）：三栏工作台（左=校规依据+AI 规则大纲/中=申报表+识别条目与证明/右=AI 审核发现）所需全部虚构数据。**所有姓名/学校/活动/证书/日期均为虚构**，名称带「（模拟）」；block ID 稳定序列（`blk-rule-001` 等，不含 uuid）保证重审锚点可比较。纯数据生成（`buildDemoCase(): ReviewCase`，:127-469），无 I/O。

## 2. 导出与关键符号

导出 1 条（`export` :127）：`buildDemoCase(): ReviewCase`。内部符号（均为 const/工厂）：4 个 SVG 证书常量（:23-96：`CERT_BLUEBRIDGE_SVG` 二等奖 vs 申报一等奖→等级冲突红卡；`CERT_STUDENT_CADRE_SVG` 等级遮挡→unclear 黄卡；`CERT_VOLUNTEER_SVG`；`CERT_SINGER_SVG` 2026-03-10 超认可时段→日期越界红卡）、`APP_HEADER_LINE` 与 6 条 CSV 数据行（:98-110 附近）、`makeEvidenceDocument`/`anchor` 辅助、documents/items/evidences/outline/rulePack 组装（:241-466）。

## 3. 内部逻辑与关键流程

返回 ReviewCase（:436-466）：`id:'demo-zhangsan-2026'`、`isDemo:true`；documents=[ruleDoc, appDoc, 4 evidenceDocs]（:243）；items 6 条（:247-315，anchor 指向申报表行、evidenceDocumentIds 反向绑定、status identified）；evidences 4 条识别结果（:318-347，doc-ev-002 `parseStatus:'unclear'`）；outline 7 类条款（:350-433：准入/指标分类/等级分值（level-mapping 映射表含「国家二等奖」→4）/上限 max-score 8/互斥 mutual-exclusion/时间范围 date-range 2024-09-01~2025-08-31/材料要求 required-evidence）；rulePack（:435-443，`confirmed:false`）。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`，独立检索+只读子agent交叉核）：
- 生产：`apps/electron/src/main/lib/review/ai-review-service.ts:45`（import）→ 调用 `:276`（fallbackOutline 降级大纲）；`apps/electron/src/main/lib/review/case-store.ts:17`（import）→ 调用 `:410`（loadDemoCase 演示案卷落盘）。
- 仅测试（11 文件）：case-lifecycle-v3.test:5→22,67、case-store.test:35→53、migration.test:8→22、mock-review-engine.test:17→22,132、native-workspace-case-v3.test:10→34、review-anchor-validation.test:5→8、review-empty-findings.test、review-evidence-context.test、review-multi-rule.test、review-v3-legacy-entry-gates.test:11→30、workspace-service-v2.test（多点）。出向：`@profer/shared` 类型（:12-22）；无模块调用。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯数据构造；SVG 为内嵌字符串常量 :23-96）。

## 6. 分支、失败、取消与恢复

无分支/无 throw（依据：字面量组装 + 简单工厂）。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；虚构声明为数据权威边界（:1-2「不得作为任何真实审核依据」）。

## 8. 修改影响面

demo 工作台数据契约（三栏视图、规则大纲约束 kinds、识别状态）；`legacy-import.ts` 转换链；UI 演示页面。改 blockId 序列破坏锚点可比性（:9 注释）。

## 9. 测试证据

无专属测试；消费测试 11 个（全树 `*.test.ts` grep `buildDemoCase` 11 命中，见 §4 列表）；`real-chain-journey.test.ts` 不使用本 fixture。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；纯数据无 I/O | 已证实 | :127-469 |
| 四冲突设计（等级冲突/遮挡/超期/材料）编码在数据中 | 已证实 | :23-96 图像Alt+evidences :318-347 |
| 无直接测试（消费测试 11 个均非本 fixture 的专属测试） | 已证实（否定） | 全树符号检索 |
| 生产调用仅 ai-review-service:276 与 case-store:410 | 已证实 | 见 §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildDemoCase` 全数据段 | §2/§3 | :127-469 | covered |
| SVG/CSV 常量 | §2 | :23-110 | covered |
| 测试断言 | §9 | — | unknown（无测试） |
