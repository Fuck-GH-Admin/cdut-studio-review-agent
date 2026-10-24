---
path: packages/shared/src/utils/cslab-fuzzy-search.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b181beeccd4b06bccc2db99243acf3d57f5427d7
sha256: 05032b19fe26d30ed44fe7a75d52f1c04ef59f16b7d822f933259f6e11c40e79
lines: 89
kind: test
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/shared/src/utils/cslab-fuzzy-search.test.ts

## 1. 测试目标

直接测试 `cslab-fuzzy-search.ts` 的两个导出：`getPinyinInitials` 的中文首字母转换，与 `matchLabFuzzy` 的多字段/多 token 匹配。9 个 `test(`，分两个 `describe`：`'拼音首字母'`（`:25`，1 个）与 `'实验室多字段模糊搜索'`（`:33`，8 个）。

不测试：具体分值常量、`score` 绝对值、空查询、`isSubsequence` 跳字路径、标点/emoji 处理、真实实验室数据。

## 2. 用例清单

夹具（`:9-23`）：

- `makeLab(overrides: Partial<CsLabLab> = {}): CsLabLab`，返回 `{id:'lab-test', code:'CSLAB-TEST', name:'测试实验室', description:'', tags:[], members:1, status:'运行中', rootPath:'/tmp/lab-test', createdAt:1, updatedAt:1, ...overrides}`（`:10-22`）。
- 无 `beforeEach`/`afterEach`、无 mock、无环境变量、无磁盘：全部是纯函数调用。
- 用例之间**无顺序依赖**（每个用例自建 lab 对象）。

| # | 行 | describe | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | `:26-30` | 拼音首字母 | 无（直接传字符串） | `getPinyinInitials` 三次 | `'演示实验室'`→`'yssys'`；`'地球物理学院'`→`'dqwlxy'`；`'CSLab-1'`→`'cslab1'` |
| 2 | `:34-38` | 模糊搜索 | name `演示实验室` | `matchLabFuzzy` 两次 | `'ys'` → `matched` true；`'yssys'` → true |
| 3 | `:40-43` | 模糊搜索 | name `地球物理学院` | 一次 | `'dqwlxy'` → true |
| 4 | `:45-54` | 模糊搜索 | code `CSLAB-BATTERY`、tags `['电化学','界面']`、description `固态电池循环稳定性研究` | 三次 | `'battery'` true；`'dhx'` true；`'gtdc'` true |
| 5 | `:56-59` | 模糊搜索 | 默认夹具（name `测试实验室`） | 一次 | `'zzzz'` → `matched` false |
| 6 | `:61-67` | 模糊搜索 | 两个 lab：`{name:'能源材料实验室'}` 与 `{name:'能源材料实验室', pinned:true}` | 两次 | `pinned.score > normal.score` |
| 7 | `:69-76` | 模糊搜索 | name `固态电池界面实验室`、tags `['电化学','界面']` | 两次 | `'固态 电池'` true；`'界面 电化学'` true |
| 8 | `:78-81` | 模糊搜索 | name `固态电池界面实验室` | 一次 | `'固态 zzzz'` → false |
| 9 | `:83-88` | 模糊搜索 | `{...lab, tags: undefined as unknown as string[]}` | 两次 | `expect(() => matchLabFuzzy(broken,'ys')).not.toThrow()`；且 `matched` true |

## 3. 真实断言

- 用例 1（`:27-29`）是唯一直接测 `getPinyinInitials` 的用例，锁定了三个字符串的精确输出（`toBe`，不是 `toMatchObject`）。
- 用例 2/3 只断言 `matched`，**不断言 `score`**；因此分值表（60/48/44/34/18）改动不会被这些用例发现。
- 用例 4 的三个断言分别覆盖三个字段来源：`battery` 命中 `code`（小写后 `cslab-battery` 中间命中，走 48 分档）；`dhx` 命中 `tags` 首字母（`电化学`→`dhx`，44 分档）；`gtdc` 命中 `description` 首字母（`固态电池…`→`gtdc`）。
- 用例 5 的 `zzzz` 是「无任何字段命中」的负例。
- 用例 6 是唯一涉及 `score` 的断言，且只断言相对关系（`toBeGreaterThan`），不断言 `+5` 的精确增量。
- 用例 7/8 覆盖多 token AND：7 为两个都命中的正例（跨字段：`界面` 在 name、`电化学` 在 tags）；8 为「一个命中一个不命中」的负例。
- 用例 9 覆盖 `tags` 为 `undefined` 的健壮性，同时断言不抛与仍能命中。
- 全部断言均为纯函数返回值，无副作用断言、无 mock 断言。

## 4. 未覆盖与脆弱点

未覆盖：

- 具体分值常量与 `score` 绝对值（如名称前缀应为 160）。
- 空查询/纯空白查询 → `{matched:true, score:0}`（`:108-109`）。
- `getPinyinInitials` 对表外汉字（原样保留）、标点、emoji、全角字符的行为。
- `isSubsequence` 的跳字命中路径（如 `'gtcl'` 这类非连续首字母）。
- 字段优先级：同一 token 同时命中 name 与 description 时是否取高分（`:126` 的 `Math.max`）。
- `code` 与 `description` 的权重差异（70 vs 35）无对比断言。
- 多 token 的 `score` 累加（`:129`）。

脆弱点：

- 用例 1 的 `toBe('yssys')` 强绑定 `PINYIN_INITIAL_GROUPS` 表内容：任何调整「演/示/实/验/室」分组的改动都会红。
- 用例 4 的 `dhx`/`gtdc` 依赖 `电/化/学`、`固/态/电/池` 在表内且首字母正确；表更新会连带失败。
- 用例 6 依赖 `pinned` 加分方向；若未来把置顶改为排序而非加分，该断言会失效（但仍可能"通过"——只断言 `>`）。
- 用例 9 用 `undefined as unknown as string[]` 绕过类型，属有意构造的非法输入；若实现改为严格解构会抛。
- 9 个用例都没有 `score` 上限/下限断言，属"行为覆盖但契约未锁"。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个 `test(`，2 个 `describe` | 已证实 | `cslab-fuzzy-search.test.ts:25`、`:33`；`test(` 计数 = 9 |
| 无 mock、无 IO、无环境变量 | 已证实 | 全文仅 `import { describe, expect, test } from 'bun:test'`（`:5`）+ 两个被测导入（`:7`） |
| 用例 1 用 `toBe` 锁定精确首字母串 | 已证实 | `:27-29` |
| 仅用例 6 断言 `score`，且为相对比较 | 已证实 | `:64-66` |
| 用例 9 用类型断言构造 `tags: undefined` | 已证实 | `:85` |
| 实际运行结果 | 未知 | 本轮 `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getPinyinInitials` 精确输出 | §2、§3 | `:26-30` | covered |
| name 首字母命中 | §2 | `:34-43` | covered |
| code/tags/description 三字段命中 | §2 | `:45-54` | covered |
| 无命中负例 | §2 | `:56-59` | covered |
| `pinned` 相对加分 | §2 | `:61-67` | covered |
| 多 token AND（正/负） | §2 | `:69-81` | covered |
| `tags` 缺失健壮性 | §2 | `:83-88` | covered |
| 分值/空查询/跳字/表外汉字 | §4 | — | unknown（未覆盖） |
