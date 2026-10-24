---
path: packages/shared/src/utils/context-entropy-pruner.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 93b753f4621fc8e716189b774a07859a6ec7d3e7
sha256: d7114b2809fb8d1266a5711dd9d15ab066c5f34ad635469106320e718236455e
lines: 94
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/context-entropy-pruner.test.ts

## 1. 测试目标

语义熵剪枝引擎（`packages/shared/src/utils/context-entropy-pruner.test.ts:29`）：短文本/少行短路、不变式行存活、相似行折叠、压缩率。bun:test；被测 `pruneToolOutputByEntropy`（同目录）。夹具：`pad/makeHead/makeTail/letters` 工厂（`:7-27`，HEAD 20/TAIL 30 与实现默认值同）。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 30-35 | 短文本（<2000）原样返回 | `'const answer = 42\n'×10` + `''` | prune | 独立 |
| 2 | 37-41 | 字符达标但行数过少原样返回 | 40 行×120 字 | prune | 独立 |
| 3 | 43-68 | 结构性不变式行压缩后仍存在 | head+400 中段（含 6 类不变式）+tail，targetRatio 0.25 | prune | 独立 |
| 4 | 70-81 | 连续重复行折叠为「省略 N 行」 | 40 行同文本 | prune | 独立 |
| 5 | 83-93 | 大文本输出长度明显小于输入 | 500 行字母组合，targetRatio 0.2 | prune | 独立 |

## 3. 真实断言

- `:32-34` 长度断言 + `toBe(shortText)`、`toBe('')`。
- `:39-40` 长度断言 + `toBe(fewLines)`。
- `:64-67` `pruned.length` toBeLessThan raw、6 个不变式行逐个 `toContain`。
- `:78-80` toContain `'省略'`、toMatch `/行相似输出/`、同文本行数 `<40`。
- `:92` `pruned.length` toBeLessThan `raw.length * 0.6`。

## 4. 未覆盖与脆弱点

- 相似折叠的「>5 字符」阈值、`[... 语义剪枝省略 ...]` 占位文本无断言。
- 头尾行内容保真（只测长度/存在，未逐行断言 head/tail 原样）。
- `keepHeadLines/keepTailLines/minCharsToPrune` 自定义选项无用例。
- 用例 3 的 `letters()` 生成器产生低熵字母行（设计使不变式对比突出）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/1 describe | 已证实 | `:29-93` |
| 双短路/不变式存活/折叠/压缩率 | 已证实 | `:33-40,64-67,78-80,92` |
| 选项面无锚 | 已证实（核对用例） | 源 `:5-14` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 两短路 | §2/§3 | 1-2 | covered |
| 不变式保留 | §2/§3 | 3 | covered |
| 相似折叠 | §2/§3 | 4 | covered |
| 预算裁剪/压缩率 | §2/§3 | 5 | covered |
| 自定义选项 | §4 | — | unknown |
