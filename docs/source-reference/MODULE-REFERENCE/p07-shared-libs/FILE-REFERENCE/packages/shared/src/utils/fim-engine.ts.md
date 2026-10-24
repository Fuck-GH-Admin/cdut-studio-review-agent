---
path: packages/shared/src/utils/fim-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd6682c8a5841216a92554e0e9978d090ccd7733
sha256: 6d573dc048d2adb4270abd90cc88e2d7bb62b906a6146dcfc407335d61da282e
lines: 15
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/fim-engine.ts

## 1. 结论与边界

FIM **潜伏认知能力评级**共享工具（`packages/shared/src/utils/fim-engine.ts:1-5`）：主/渲染共用的可读描述。15 行单函数模块：θ→能力等级标签（自测练习与成绩单结算展示用）。

边界：只做文案映射（评级计算不在本文件）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `describeTheta` | function | 8-15 | `(theta: number) => string` | 唯一导出 |

## 3. 内部逻辑与关键流程

六档阈值（`:9-14`）：θ≥2 卓越 / ≥1 优秀 / ≥0 良好 / ≥-1 及格 / ≥-2 待提升 / else 亟需巩固（含中文括号说明文案）。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/main/lib/study/fim-estimator.ts:92`（再导出）、`apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassQuizTab.tsx:12,145`（renderer 产品调用）、`AiClassStudyOverview.tsx:16`（仅 import 行无调用行——疑似死 import，照实记录）；测试 `cognition-engine.test.ts:16,137-138`（批外 25 test 中 2 断言）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：纯阈值链。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

文案/阈值改动影响成绩单展示（caller 见 §10）。

## 9. 测试证据

无同名测试文件。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六档阈值+文案 | 已证实 | `:8-15` |
| NaN 落入「亟需巩固」档 | 已证实（推演：所有比较 false） | 阈值链 |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `describeTheta` | §2, §3 | 8-15 | covered |
