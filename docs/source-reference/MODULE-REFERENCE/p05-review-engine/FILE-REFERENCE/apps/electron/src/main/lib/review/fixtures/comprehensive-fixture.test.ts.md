---
path: apps/electron/src/main/lib/review/fixtures/comprehensive-fixture.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d78a6ec0b6671acaff8b29dc610866e9e58e6b2f
sha256: b542ccb80b439e9051a9890427d541ad93484d2202dbf73ec2cabe5a581b4e87
lines: 68
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/fixtures/comprehensive-fixture.test.ts

## 1. 测试目标

N1b：政策仓库发布依赖校验/幂等落盘/发布链 + 综测模板完整性。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:18/:29/:39/:47/:55/:64），2 describe（:17/:54）。
1. 政策发布不可变+validatePolicyRef 通过（:18-28）：status `published`、`check.ok` toBeTrue。
2. 无确认记录发布抛「确认记录」（:29-38）：`expect(()=>publishPolicy(...)).toThrow('确认记录')`。
3. 内容 hash 不一致保存抛（:39-46）：`toThrow('hash 不一致')`。
4. 幽灵政策引用 error（:47-53）：`issues.some(error && message.includes('ghost-policy'))` toBeTrue。
5. 模板 v2 完整性（:55-63）：error 清零、stages kinds toEqual `['auto-check','manual-review','manual-review']`、category options 3、certificates requiredElements 含「颁发单位」。
6. 重复 seed 幂等（:64-69）：`getTemplate('comprehensive-assessment-v2',2)` toBeDefined。

## 3. 真实断言

`:25`/`:27`/`:37`/`:45`/`:52`/`:58-62`/`:68`（toEqual/toBeTrue/toThrow/toContain/toBeDefined 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：publishComprehensiveFixture 幂等细节。mock 边界：真实 store（require 局部取 publishPolicy :35-36）；`PROFER_CONFIG_DIR` 隔离（:11-13）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 政策仓库三校验 | #1-#3 | covered |
| 模板校验/完整性/幂等 | #4-#6 | covered |
