---
path: apps/cli/src/args.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3fc6fb8307220eae160366c8e8b67be96ec97b97
sha256: f779be6ae4c7a7b5bda28b2f52af5c1c74cef856c016540d2be71626c08c84a5
lines: 44
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/args.test.ts

## 1. 测试目标

验证 `args.ts` 零依赖解析器：四种参数形态（`--key value`/`--key=value`/裸 flag/相邻 flag）、四个取值辅助（strFlag/boolFlag/numFlag）、`parseRange` 三形态。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 12 个（`describe` 3 个；`it(` 0 个）。

**describe `parseArgs`（`:4-26`）：**

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 1 | `--key value` 形式 | 5-9 | positionals `['info','abc']`、`flags.limit==='5'` |
| 2 | `--key=value` 形式 | 11-14 | `flags.out==='cleaned/x.md'` |
| 3 | 裸 `--flag` 为 boolean true | 16-19 | `flags.stdout===true` |
| 4 | `--flag` 后跟另一 `--flag` 时前者 boolean | 21-25 | `json===true`、`limit==='3'` |

**describe `flag 取值辅助`（`:28-35`，共享一次 parseArgs）：**

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 5 | strFlag | 30 | `'x'` |
| 6 | strFlag 对 boolean 返回 undefined | 31 | `undefined` |
| 7 | boolFlag | 32 | `true` |
| 8 | numFlag | 33 | `10` |
| 9 | numFlag 非数字返回 undefined | 34 | `undefined` |

**describe `parseRange`（`:37-43`）：**

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 10 | `A-B` 闭区间 | 38 | `[3,7]` |
| 11 | 单数字 `[N,N]` | 39 | `[5,5]` |
| 12 | 非法返回 undefined | 40-43 | `'a-b'` 与 `undefined` 均 undefined |

## 3. 真实断言

`:7-8` `expect(positionals).toEqual(['info','abc'])`/`expect(flags.limit).toBe('5')`；`:13` `toBe('cleaned/x.md')`；`:18` `toBe(true)`；`:23-24`；`:30-34` 五个辅助断言；`:38-42` 三例（`toEqual([3,7])`/`toEqual([5,5])`/`toBeUndefined()`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`--key=`（空值）、负数 `-3`（会被当 positional）、`--key --x` 边界（用例 4 是「后跟 --flag」的相邻场景）、重复同名 flag 覆盖、短横线 `-abc`。
- 脆弱点：用例 5-9 共享模块级 `parseArgs` 一次调用（`:29`），相互独立性依赖实现纯函数；无 mock（纯函数直测）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例与断言行号 | 已证实 | `:4-43` 逐行读 |
| 四形态+辅助+区间全覆盖主干 | 已证实 | §2 |
| 无 mock/纯函数 | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| parseArgs 四形态 | 1-4 | covered |
| strFlag/boolFlag/numFlag | 5-9 | covered |
| parseRange | 10-12 | covered |
| 空值/负数/重复 flag | - | unknown（未覆盖） |
