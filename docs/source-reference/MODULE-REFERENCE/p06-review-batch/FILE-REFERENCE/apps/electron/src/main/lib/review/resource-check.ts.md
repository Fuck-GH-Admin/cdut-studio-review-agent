---
path: apps/electron/src/main/lib/review/resource-check.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e86543f3f967500fc954250f1f55faeffdeca871
sha256: 8884e49cf093ee15a44288bfd9be44f182614df54bb4f06ba58ff24689aa854c
lines: 87
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/resource-check.ts

## 1. 结论与边界

资源自检与固定集评测脚手架（文件头 `:1-7`，N7）：`resourceCheck` 对 OCR/解析资源随包状态自检（断网新机可用性前置检查），缺失如实标 missing/deferred；`runGoldenSet` 固定集评测——输入材料+期望检查结果→确定引擎→准确率，**只报计算值不虚构准确率**（真实模型评测需真实通道）。纯函数 + `existsSync` 探测。

不做的事：不下载/安装资源；不做语义评测（“语义正确率需真实模型真值集，不在本脚手架虚报”，`:75`）；不执行审核（`deterministic-engine.evaluateCondition` 只算条件树）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ResourceCheckItem` | interface | `:16-21` | `{name; required; status:'available'\|'missing'\|'deferred'; detail}` |
| `ResourceCheckReport` | interface | `:23-26` | `{items[]; allRequiredAvailable}` |
| `resourceCheck` | function | `:29-54` | `(resourcesRoot) => ResourceCheckReport` |
| `GoldenCase` | interface | `:58-64` | `{caseId; facts: Record<field,{known,value}>; expected:{condition, expectedStatus}}` |
| `GoldenResult` | interface | `:66-71` | `{caseId; expected; actual; pass}` |
| `runGoldenSet` | function | `:77-87` | `(cases) => {results[]; accuracy}` |

## 3. 内部逻辑与关键流程

### 3.1 `resourceCheck`（`:29-54`）

三项固定探测：OCR wasm（`vendor/tesseract/tesseract.wasm`）、OCR 中文包（`chi_sim.traineddata`）——均 `required:false`，存在 `available`、缺失 `deferred`（detail 说明“Tesseract.js 适配待打包（业务走 OCR 不可用降级路径，不冒充已读）”/“待随包”）（`:32-45`）；文档解析（pdf/office/文本）`required:true` 恒 `available`（“PDF 走 @profer/core 高精解析引擎；Office/文本走 document-parser 基座依赖（均已随包）”）（`:46-52`）。`allRequiredAvailable = every(!required || available)`（`:53`）。幂等（无状态）。

### 3.2 `runGoldenSet`（`:77-87`）

逐案 `evaluateCondition(condition, ref => ref.field undefined 或 facts 缺失 → {known:false, value:null})` 三值语义比对 `expectedStatus`；`accuracy = 通过数/总数`（空集为 0）（`:85-86`）。注释明确只算确定引擎部分（`:74-75`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`resourceCheck`/`runGoldenSet` 由启动自检/评测入口（`apps/electron/src/main` 侧）调用；直接测试 `resource-check.test.ts`。出向：`node:fs`、`node:path`、`deterministic-engine.evaluateCondition`、`@profer/shared.TriState` 类型。

## 5. 数据 I/O、读写与副作用

只读 `existsSync` 探测；无写盘/网络/日志。幂等、无并发问题。

## 6. 分支、失败、取消与恢复

无 throw；缺失即 `deferred`/`missing` 状态如实上报。无取消/恢复概念。

## 7. 权限与权威状态

无权限分支。权威口径：OCR 缺失“不冒充已读”（`:38`）；准确率“只报计算值”（`:6/:75`）——诚实边界即本文件的权威声明。

## 8. 修改影响面

改探测路径 → 影响启动自检显示；改 `evaluateCondition` 消费 → 评测脚手架。薄模块，下游面小。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `resource-check.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| OCR 缺失 deferred 不冒充 | 已证实 | `:32-45` |
| 解析资源恒 available（依赖随包声明） | 已证实 | `:46-52` |
| 准确率只报计算值 | 已证实 | `:74-86` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ResourceCheckItem/Report` | 2 | `:16-26` | covered |
| `resourceCheck` 三项 | 3.1 | `:29-54` | covered |
| `GoldenCase/GoldenResult` | 2 | `:58-71` | covered |
| `runGoldenSet` | 3.2 | `:77-87` | covered |
