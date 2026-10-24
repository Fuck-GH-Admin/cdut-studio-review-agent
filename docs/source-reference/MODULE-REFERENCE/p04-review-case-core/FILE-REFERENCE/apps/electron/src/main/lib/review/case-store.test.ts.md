---
path: apps/electron/src/main/lib/review/case-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f40a1383bdc3d6ace09b1faf32f8e17e32881e27
sha256: 73e66f270e246264e2e24a84bedccf61da6d43aa5e1851ce521c37bf3e5c88aa
lines: 238
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-store.test.ts

## 1. 测试目标

`case-store.ts` 的 V1 持久化层（文件头 :1-16 自述范围）：`assertSafeId`/`saveCase`/`getCase`/`listCases`/`deleteCase`/`loadDemoCase` + M0/H05 `updateCase`（串行/修订冲突）+ M0/H06 `computeCaseInputHash`。真实磁盘读写（隔离目录），无 mock。

## 2. 用例清单

16 用例 / 5 describe。夹具：
- 隔离 `PROFER_CONFIG_DIR=work/tmp/profer-test-case-store-{Date.now()}`（:40-41），`afterAll` rmSync（:43-46）；注释明确 `getConfigDir()` 运行时读环境变量（`config-paths.ts:80-90`），静态 import 安全（:7-8/:37-38）。
- `buildTestCase()` = `{...buildDemoCase(), id:'case-test-001'}`（:52-54，fixture 派生不污染 demo 语义）。
- 无 mock/无网络/无子进程。

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1-2 | `assertSafeId` | 合法 id 不抛 / 非法 id 全抛 | 57-62 / 64-71 |
| 3-7 | `saveCase / getCase` | 往返一致 / 原子写无 .tmp / listCases 摘要 / 删除 / 幂等删 | 75-86 / 88-102 / 104-116 / 118-126 / 128-130 |
| 8-9 | `loadDemoCase` | 两次调用不重复写 / 列表仅 demo | 134-156 / 158-164 |
| 10-12 | `updateCase（M0/H05）` | revision+1 / 修订冲突 / 并发双 patch 保留 | 170-176 / 178-190 / 192-205 |
| 13-16 | `computeCaseInputHash（M0/H06）` | 字段差异→hash 异 / 内容同→hash 同 / 模板规则变→hash 异 / 元数据变→hash 同 | 209-217 / 219-222 / 224-231 / 233-237 |

## 3. 真实断言

- §`assertSafeId`：`'case-ok_1'/'demo-zhangsan-2026'/'A1_b2-c3'` `not.toThrow`（:59-61）；`'../evil'/'a/b'/''/'..'` `toThrow('无效的 ID')`（:65-67）；`'x y'/'x.y'` `toThrow()`（:69-70）。
- 往返（:79-85）：`loaded` `toEqual(source)`（深比较）、`id`、`items` 6 条、`documents` 6 条。
- 原子写（:93-101）：`case.json` 存在、JSON 可解析 `id` 正确、目录条目中 `.tmp` 过滤后 `toEqual([])`。
- 摘要（:108-115）：title `综测加分审核演示案卷（模拟）· 张三（模拟）`、`documentCount` 6、`applicant` `张三（模拟）`、`lastRunStatus` `toBeUndefined()`。
- 删除（:122-125）：`getCase` undefined、目录 `existsSync` false；幂等删 `not.toThrow`（:129）。
- demo（:149-155）：两次 `id` 相同、`updatedAt` 相同、case.json `mtimeMs` 相同、目录条目 `toEqual`、无 `.tmp`；列表仅 `isDemo===true` 的 demo 一条（:163）。
- `updateCase`（:172-204）：更新后 `revision===1` 且字段落盘（:173-175）；冲突时 `toBeInstanceOf(CaseRevisionConflictError)` 且 `conflict.currentRevision` 为前值+1（:186-188）；并发两 patch 各保留（`item-new`/`doc-new` 存在）、`final.revision===2` 且等于 `b.revision`（:200-204）。
- 指纹（:216-236）：`activityDate` 变 → `not.toBe`（:216）；同内容 → `toBe`（:221）；`reviewTemplate`+`manualRules` 变 → `not.toBe`（:226-230）；`updatedAt/revision` 变 → `toBe`（:236）。

## 4. 未覆盖与脆弱点

- 未覆盖：`readJsonFile` 损坏 JSON warn 分支、`readLastRunStatus`/`listRuns`/`saveRun`（本文件完全未测，属 `case-store.ts:377-398`）、`saveCase/saveRun` 失败抛错、`enqueueCaseWrite` 吞错语义、`.tmp` 残片中断、原生 V2 投影/写屏障分支（在 `native-workspace-case-v3.test.ts`/`review-v3-legacy-entry-gates.test.ts` 间接）、`expectedRevision` 缺省跳过 CAS 的行为无直接用例（源码注释 :273-274 与实现矛盾，见 case-store.ts.md §3.9）。
- 脆弱点：`toEqual` 全量深比较依赖 `buildDemoCase()` 稳定；`mtimeMs` 断言依赖文件系统时间粒度（同毫秒内重写可能误判）；用例 12 并发两 `updateCase` 的「谁后到」不确定但断言设计成对称（`b.revision` 取后者返回值）。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例断言/行号如 §2-3 | 已证实 | 本文件逐行 |
| 断言覆盖原子写/幂等/冲突/指纹四组不变量 | 已证实 | :88-237 |
| `saveRun/listRuns/readLastRunStatus` 零测试 | 已证实（否定） | 本文件 import 表 :22-34 未含；全树 `.test.ts` 中 `saveRun` 仅 `review-multi-rule.test.ts:145` 顺带 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertSafeId` 合法/非法 | §3 | 57-71 | covered |
| `saveCase/getCase` 往返 + 原子写 | §3 | 75-102 | covered |
| `listCases` 摘要/排序输入 | §3 | 104-116 | covered |
| `deleteCase`/幂等 | §3 | 118-130 | covered |
| `loadDemoCase` 幂等 | §3 | 134-164 | covered |
| `updateCase` 串行/冲突 | §3 | 170-205 | covered |
| `computeCaseInputHash` 四分支 | §3 | 209-237 | covered |
| `saveRun/listRuns/readLastRunStatus` | §4 | — | unknown（未测） |
| V2 投影/写屏障 | §4 | — | indirect（他篇） |
