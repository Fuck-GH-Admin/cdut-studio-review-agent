---
path: apps/electron/src/main/lib/review/review-v3-f18-school-profile.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76bac66a3b82fa4e75ea2a6c266c69b38863c9dd
sha256: 5837ae5d10c3c236bd2cd552152eb5ee5a622358592674359cbc13ab58a8e6eb
lines: 40
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f18-school-profile.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 F18 SchoolPort 协商与映射：mock 只能模拟建议回执、离线包仍须等独立回执；学校拥有业务阶段但无可信身份/写入能力时禁止自动审批；缺失字段保留未知；外部不认识的状态不自动映射成完成。

## 2. 用例清单

共 3 个 `test(`（`review-v3-f18-school-profile.test.ts:11-39`，单一 `describe`）。夹具（`:5-9`）：`profile`（`workflowOwner:'school'`、`fieldMapping:{score:'ext_grade',name:'student_name'}`、`statusMapping:{pending:'WAIT',completed:'DONE'}`）；`MockSchoolAdapter`/`LocalPackageAdapter` 来自 `external-ports.ts` 真实适配器。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | Mock 只能模拟建议回执，离线包仍须等待独立回执（`:12`） | `negotiateSchoolPort(new MockSchoolAdapter(),…)`、`new LocalPackageAdapter(()=>0)` | mock `mode==='proposal-awaiting-receipt'`、`canClaimSchoolIdentity===false`、`canVerify===true`；local `mode==='offline-handoff'`、`canClaimSchoolIdentity===false` |
| 2 | 学校拥有业务阶段但无可信身份/写入能力时禁止自动审批（`:23`） | `{kind:'school',push:…}`（无 capabilities） | `mode==='unavailable'`、`canFetchCase===false` |
| 3 | 缺失成绩保留未知，外部不认识的状态不会自动映射成完成（`:30`） | `mapExternalCase({fields:{student_name:'学生甲',another_field:8}},…,['name','score','award'])`；`mapExternalStatus` 两次 | `fields.name` `toEqual({state:'available',value:'学生甲',externalKey:'student_name'})`；`score`/`award` `state==='unknown'`；`unmappedExternalKeys` `toEqual(['another_field'])`；`mapExternalStatus('DONE')` `toEqual({state:'mapped',canonical:'completed'})`；`('NEW_UNKNOWN')` `toEqual({state:'unknown',external:'NEW_UNKNOWN'})` |

## 3. 真实断言

逐条见上表（`:15-21,26-27,33-38`）。mock 边界：`MockSchoolAdapter`/`LocalPackageAdapter` 为 `external-ports.ts` 真实类；无 IO。

## 4. 未覆盖与脆弱点

未覆盖：`workflowOwner:'local'` 分支、`canReadTasks`、有 `capabilities` 的 school 端口正例。无 mock 注入（纯函数）。用例 1 依赖 `MockSchoolAdapter.capabilities()` 的真实返回（跨模块契约）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep test(`；`:12,23,30` |
| 身份不升级 | 已证实 | `:16,21` |
| 未知不映射 | 已证实 | `:33-38` |
| local 分支 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| mock/离线包 | 1 | 12-22 | covered |
| school 不可审批 | 2 | 23-28 | covered |
| 字段/状态未知 | 3 | 30-39 | covered |
| local-decision | 无 | — | unknown |
