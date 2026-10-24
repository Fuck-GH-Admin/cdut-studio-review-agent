---
path: apps/electron/src/main/lib/review/review-v3-d4-catalog-attach.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddbad3e50297f6c4f6009eac4688acd2cc082371
sha256: d5af91d9140f2496a8cbf64a1502150e35fa558776e50bee0ae3f598c8f7d566
lines: 80
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-d4-catalog-attach.test.ts

## 1. 测试目标

D4 50 套模板逐套实挂 Plan 回归（文件头 :1-7）：「50 套可用」不能只看目录列出/selection 非空，必须每套都真能建案 → 编译 → 安装**非零** D2 技术计划。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 1（`test(` :26，超时 120s :78），1 describe（:25）。设置：`PROFER_CONFIG_DIR` tmp 隔离（:13-15，afterAll 清理 :16）；动态 import（:18-23）：`review-v3-main-d4-local-plan`/`review-d4-catalog`/`review-d2-runtime`（两个符号）/`template-store`/`native-workspace-case-v3`。

动作（:26-77）：`listLocalD4Templates()` 全列表循环：
- catalog 找 entry，缺 → `catalog 无条目` 失败记录（:32-33）。
- `loadD4UnifiedWorkspace`；`g01-student-identity-correction` 特例读 `fixtures/controlled-registry.json` 作为 trustedStudentSnapshot（:37-41）。
- 已发布且非作者候选草稿 → `已发布/被占用` 失败记录（:42-45）；否则 `saveAuthoringCandidateDraft(makeD2CandidateShell(...))`（:46）。
- `createNativeWorkspaceCaseV3` 真实建案（type 综合测评/actor local-reviewer），失败记录（:47-56）。
- `attachD2RuntimePlan({caseId, requestId, actor, expectedRevision:0, workspace, selection, trustedStudentSnapshot})`，记录 `r.ok` 与 `r.aggregate.d2RuntimePlan?.mapping.length`（:58-70）。

断言（:72-77）：`results.length===50`、`failed` 为空（失败清单 console.error 输出 :73-75）、每个 ok 套 `checks>0`（防空 Plan 冒充可用 :76-77）。

## 3. 真实断言

- `:72`：`expect(results.length).toBe(50)`。
- `:73`：`expect(failed).toHaveLength(0)`。
- `:76-77`：`for (const r of ok) expect(r.checks).toBeGreaterThan(0)`。

## 4. 未覆盖与脆弱点

- 未覆盖：selection 内容正确性、Plan 语义、失败恢复分支（只收集不深断言）。
- 脆弱点：依赖冻结树内的 D4 目录实物（50 套）；g01 特例硬编码（:38）；120s 超时（:78）；`expectedRevision:0` 假设新建案 revision。mock/真实边界：全真实（template-store/d2-runtime/native 案卷），无 mock。
- 平台边界：无平台守卫（但依赖真实文件系统）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例计数与 `test(` 一致 | 已证实 | :26 |
| 断言行如 §3 | 已证实 | 逐行读 :72-77 |
| 「每套非零 Plan」语义被断言 | 已证实 | :76-77 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 50 套逐套建案+挂 Plan | #1 | covered |
| 非零 checks | #1 | covered |
| selection/Plan 语义 | — | unknown |
