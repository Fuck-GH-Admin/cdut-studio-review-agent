---
path: packages/shared/src/utils/cslab-cif.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6afe346ecffaa8a7e28860f3e87963697d8875e1
sha256: 80b3aa2fae142cfd7ee280b0c97b891b2e45a315771fd5f94cfc5ba21d0304bd
lines: 47
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-cif.test.ts

## 1. 测试目标

CIF 解析（`packages/shared/src/utils/cslab-cif.test.ts:7`）：真实金红石演示 CIF 的晶胞/原子/温度因子、不确定度括号剥离、缺晶胞中文报错。bun:test + 真实文件读取（`readFileSync`，`:2,9`）；被测 `parseCif`。夹具：`demo-data/cdut-science-rutile/rutile-tio2.cif`（`:5`，真实数据文件）+ 内联最小 CIF 文本（`:29-37`）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`，Given/When/Then）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 8-26 | 金红石 CIF → 晶胞与 6 原子正确 | 读真实文件 | `parseCif(text)` | 独立 |
| 2 | 28-42 | 带不确定度数值 → 去括号误差 | 内联 `_cell_length_a 4.5937(3)` 等 | `parseCif` | 独立 |
| 3 | 44-46 | 缺晶胞 → 抛中文错误 | `data_broken`+化学名 | `parseCif` | 独立 |

## 3. 真实断言

- `:11-14` cell a/b/c toBeCloseTo(…, 6/6/6)、volume toBeCloseTo(62.43, 1)。
- `:15-18` `spaceGroupHm?.replace(/\s+/g,'')` toBe `'P1'`、`spaceGroupNumber` toBe 1（:18 重复断言）、`symmetryOperations` toEqual `['x, y, z']`。
- `:19-21` atoms 长度 6、Ti 2、O 4。
- `:22-25` O1 的 `fractional[0]` toBeCloseTo(0.3047, 6)、`uIso` toBeCloseTo(0.01, 6)、`bIso` toBeCloseTo `8π²×0.01`（验证换算公式）。
- `:39-41` a/c toBeCloseTo、`warnings.some(includes('空间群'))` toBe true。
- `:45` toThrow `'CIF 缺少完整的晶胞参数'`。

## 4. 未覆盖与脆弱点

- 多行分号文本/引号串/loop 注释边界未测（tokenize 分支无锚）。
- 笛卡尔坐标转换分支（`parseAtoms` `:267-275`）未测。
- 依赖真实数据文件 `demo-data/cdut-science-rutile/rutile-tio2.cif`（批外数据，改数据会红）。
- `:18` 与 `:16` 重复断言（冗余但无害）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test/1 describe、真实文件夹具 | 已证实 | `:5-46` |
| uIso→bIso 换算断言 | 已证实 | `:25` |
| 不确定度剥离 | 已证实 | `:39-40` |
| 测试通过与否 | 未知 | NOT_RUN |
| demo 数据真实性 | 未知 | 批外文件 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parseCif 主链（真实文件） | §2/§3 | 1 | covered |
| parseNumber 剥括号 | §2/§3 | 2 | covered |
| 晶胞缺失抛错 | §2/§3 | 3 | covered |
| tokenize 边界/笛卡尔转换 | §4 | — | unknown |
