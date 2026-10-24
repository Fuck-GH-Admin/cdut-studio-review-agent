---
path: packages/shared/src/types/review-v2-contracts.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d57d4c7eda165f0d338c16ad334cb7ff44173227
sha256: 24ece86c13cc917300d4351e6952322838d7647fd1c3bd8a272d981d3b38903e
lines: 75
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v2-contracts.test.ts

## 1. 测试目标

`review-v2-contracts.ts` 的 N1a 契约单测（`:2` 注释自述对应 07 §2：稳定键/十进制校验/作用域默认/引用结构）：`makeCheckKey`/`makeFindingKey`/`isValidDecimalText`/`fieldScopeOf` 四函数 + 契约结构冒烟。

## 2. 用例清单

4 个 describe + **5 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| 稳定键（07 §5.3）（2） | 同规则同目标 checkKey 稳定且跨版本区分 / findingKey 可跨运行继承 | `:17-30` |
| 规范十进制（07 §5.1）（1） | 合法/非法文本（拒科学计数法与 NaN） | `:34-41` |
| 字段作用域（07 §2.1）（1） | 旧模板未声明 scope 默认 subject | `:45-48` |
| 契约结构冒烟（1） | PolicyRecord/CheckPlanEntry/RunInputSnapshot/ReviewCommandV2 构造 | `:52-74` |

## 3. 真实断言

- `:19-25` `makeCheckKey('r1',2,{scope:'group',groupKey:'E1'})` `toBe('r1@2|group:E1')`、重复生成 `toBe(key)`、版本 3 `not.toBe(key)`；subject 目标 `['s2','s1']` 与 `['s1','s2']` 生成键 `toBe`（稳定 ID 排序）。
- `:29` `makeFindingKey('k','missing-evidence','h1')` `toBe('k|missing-evidence|h1')`。
- `:35-40` `'10.00'/'-3.5'` `toBeTrue()`；`'1e3'/'NaN'/'Infinity'/''` `toBeFalse()`。
- `:46-47` `fieldScopeOf({key:'legacy'})` `toBe('subject')`、`{key:'year',scope:'case'}` `toBe('case')`。
- `:71-73` `contentHash` `toHaveLength(64)`、`snapshot.plan` `toHaveLength(1)`、`command.target.kind` `toBe('case')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`review-v2-contracts.ts` 其余导出（类型面为主）；构造冒烟仅类型完整不断言深逻辑；`makeCheckKey` 其余 scope 组合。
- 脆弱点：稳定键格式字符串（`'|'`/`'@'` 分隔）被精确断言锁定——格式变更会碎（这正是测试目的）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例与断言如 §3 | 已证实 | 逐行读 `:1-75` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| makeCheckKey/makeFindingKey | 2 | covered |
| isValidDecimalText | 1 | covered |
| fieldScopeOf | 1 | covered |
| 契约结构（4 接口） | 1 | covered（冒烟） |
