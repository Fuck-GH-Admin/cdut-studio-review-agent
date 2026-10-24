---
path: apps/electron/src/renderer/lib/channel-health-aggregation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ab16c0bd7d2c6d5e8827e3cc570fca03862bfcd
sha256: f4ff5843dd38b3f6bb0cc83ba3ed2998cfec9a386091d2e779950f5d6b5fca60
lines: 52
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-health-aggregation.test.ts

## 1. 测试目标

验证 `aggregateModelHealth`（SUT `channel-health-aggregation.ts`，同目录但不在本批 18 文件内）的模型健康聚合口径：degraded（慢但成功）计入可用、仅 failure 计不可用、跨渠道合并后按 createdAt 降序取最近 32 条样本、slots 左侧补 null 空位。测试框架 `bun:test`（`channel-health-aggregation.test.ts:1`）。

## 2. 用例清单

grep `test(` 机械计数=3、`describe(`=1、`it(`=0：`:21` degraded 计入可用率（1 success+1 degraded+1 failure）；`:35` 仅 failure 降可用率（2 degraded=100%）；`:43` 跨渠道取最近 32 条（20 failure + 20 success）。合计 3，与标签一致（describe 'aggregateModelHealth'）。

## 3. 真实断言

- `:30-32`：expect(result?.model.availability).toBe(67)（2/3 取整）、expect sampleCount toBe(3)、expect(slots.slice(-3).map(status)) toEqual(['success','degraded','failure'])（时序保留）。
- `:40`：expect(result?.model.availability).toBe(100)（degraded 不降可用率）。
- `:48-50`：expect sampleCount toBe(32)、expect availability toBe(63)（32 条中 20 success 20 failure→取最近 32：12 failure+20 success=62.5%→63）、expect(slots.filter(Boolean)).toHaveLength(32)（左补 null 后真实样本 32）。

## 4. 未覆盖与脆弱点

未覆盖：`aggregateModelHealth` 返回 null 分支（空 samples，SUT `channel-health-aggregation.ts:13`）；`avgLatencyMs`/`updatedAt` 字段无断言；单渠道多模型 id 冲突（SUT 取 `models[0]!.modelId`，`:26`）无断言。脆弱点：`model`/`sample` 工厂（`:5-18`）固定 modelId 与 durationMs 默认值，SUT 窗口大小（BUCKET_COUNT=32）变更会同时打破 `:48` 与 `:50` 两断言——属预期锁定，非失真。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例清单与断言文本 | 已证实 | `channel-health-aggregation.test.ts:21-51` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| SUT 空输入/字段口径 | 间接 | SUT 源码静态阅读（`channel-health-aggregation.ts:11-38`） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 可用率口径（degraded 不降） | §2/§3 | 21-41 | covered |
| 32 窗口+跨渠道合并 | §2/§3 | 43-51 | covered |
| slots 空位补 null | §3 | 50 | covered |
| 空 samples 返回 null | §4 | — | unknown |
| avgLatencyMs / updatedAt | §4 | — | unknown |
