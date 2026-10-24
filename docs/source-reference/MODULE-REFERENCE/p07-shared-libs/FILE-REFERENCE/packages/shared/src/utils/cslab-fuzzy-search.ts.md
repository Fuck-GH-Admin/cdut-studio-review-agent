---
path: packages/shared/src/utils/cslab-fuzzy-search.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f407eba365c4f59fa4fed2d4cfcdf7c097502cea
sha256: 275ca0e5d935852a20fbc53ba7974ed5158cb57d9e362fd9305008256d2d87c8
lines: 133
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/shared/src/utils/cslab-fuzzy-search.ts

## 1. 结论与边界

CSLab 实验室列表的**多字段模糊搜索**纯函数库：把中文按「首字母分组表」转成拼音首字母串，再用「原文子串 > 首字母 > 子序列」三级打分，对名称/编号/标签/描述四个字段加权求和。纯计算，无 I/O、无网络、无磁盘、无全局可变状态。

不做的事：不引入第三方拼音词库（`:3-4` 明确为红线）；不做分词/中文分词；不做排序（只返回 `{matched, score}`，排序由调用方）；不读实验室数据（入参是 `CsLabLab`）。

## 2. 导出与关键符号

导出 3 条：1 个 function、1 个 interface、1 个 function。内部另有 1 个常量表、2 个正则、1 个 Map、2 个函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getPinyinInitials` | function（export） | `:51-64` | `(text: string) => string` | ASCII 字母数字保留并小写；空白与标点丢弃；CJK 查表，未收录则**原样保留该汉字** |
| `CsLabFuzzyMatchResult` | interface（export） | `:95-98` | `{ matched: boolean; score: number }` | 无「命中字段」信息 |
| `matchLabFuzzy` | function（export） | `:107-133` | `(lab: CsLabLab, rawQuery: string) => CsLabFuzzyMatchResult` | 多 token AND；空查询恒命中 |
| `PINYIN_INITIAL_GROUPS`（内部） | const | `:11-38` | `Record<string,string>`，键 `a`–`z`（含 `i`/`u`/`v` 空串） | 首字母 → 常用汉字分组 |
| `CJK_RE`（内部） | const RegExp | `:40` | `/[\u3400-\u4dbf\u4e00-\u9fff]/` | 扩展 A + 基本区 |
| `ASCII_ALNUM_RE`（内部） | const RegExp | `:41` | `/[a-z0-9]/i` | — |
| `CHAR_TO_INITIAL`（内部） | const Map | `:43-48` | `Map<string,string>` | **模块加载时**由分组表展开，重复字以先出现者为准（`:10`、`:46`） |
| `isSubsequence`（内部） | function | `:67-75` | `(needle, haystack) => boolean` | 空 needle 返回 true |
| `matchField`（内部） | function | `:78-93` | `(field, query) => number` | 0/18/34/44/48/60 六档 |

## 3. 内部逻辑与关键流程

### 3.1 首字母转换 `getPinyinInitials`（`:51-64`）

逐字符（`for...of`，按码点）：

1. `/\s/` 命中 → 跳过（`:54`）。
2. ASCII 字母数字 → 追加小写（`:55-58`）。
3. CJK（`CJK_RE`）→ 追加 `CHAR_TO_INITIAL.get(char) ?? char`（`:59-61`）：**表里没有的汉字会原样进入输出串**，因此返回值可能中英混排。
4. 其余（标点、emoji、全角符号等）→ 丢弃。

示例（与测试一致）：`'演示实验室' → 'yssys'`、`'地球物理学院' → 'dqwlxy'`、`'CSLab-1' → 'cslab1'`（连字符被丢弃）。

### 3.2 单字段打分 `matchField`（`:78-93`）

| 条件 | 分值 | 行 |
| --- | --- | --- |
| 字段为空 | 0 | `:79` |
| 原文小写后 `indexOf(query) === 0`（前缀） | 60 | `:81-82` |
| 原文 `indexOf(query) > 0`（中间） | 48 | `:83` |
| 首字母串前缀 | 44 | `:87-88` |
| 首字母串中间 | 34 | `:89` |
| 首字母串**或**原文的子序列 | 18 | `:91` |
| 都不满足 | 0 | `:92` |

注意：`query` 由调用方保证已小写（`:108`），`field` 在 `:80` 再小写一次。

### 3.3 多字段匹配 `matchLabFuzzy`（`:107-133`）

1. `query = rawQuery.trim().toLowerCase()`（`:108`）；空 → `{matched:true, score:0}`（`:109`）。
2. `tokens = query.split(/\s+/).filter(Boolean)`（`:111`）；理论上空数组走 `:112` 的兜底返回。
3. 字段与权重（`:114-119`）：`name` 100、`code` 70、`tags.join(' ')` 55、`description` 35。`?? ''` 处理 `null`/`undefined`（`:115-118`）。
4. 逐 token（`:122-130`）：对每个字段算 `matchField`，取 `weight + fieldScore` 的最大值作为该 token 的 `best`；`best === 0` → 立即返回 `{matched:false, score:0}`（`:128`）；否则 `total += best`。
5. 最终 `total + (lab.pinned ? 5 : 0)`（`:132`）。

因此 `score` 是「权重 + 匹配档位」之和：名称前缀命中最高 160（100+60），描述子序列最低 53（35+18）。

## 4. 调用者与调用链

入向：

| 调用者 | 位置 | 说明 |
| --- | --- | --- |
| `CsLabPreparationView.tsx` | `:26` `import { matchLabFuzzy, type CsLabLab } from '@profer/shared'`；`:136` `.map((lab) => ({ lab, match: matchLabFuzzy(lab, keyword) }))` | **唯一 UI 消费者**（渲染层实验室列表过滤） |
| `packages/shared/src/utils/index.ts` | `:46` `export { getPinyinInitials, matchLabFuzzy }`；`:47` `export type { CsLabFuzzyMatchResult }` | 包内 barrel 转发 |
| `cslab-fuzzy-search.test.ts` | `:7` | 直接单测（见 §9） |

出向：`../types/cslab` 的 `CsLabLab`（`:8`，`import type`）。无其它依赖。

动态调用：无；`matchLabFuzzy` 通过 `@profer/shared` 具名导入。

## 5. 数据 I/O、读写与副作用

- **输入**：`CsLabLab`（`packages/shared/src/types/cslab.ts:330-351`，用到 `name`/`code`/`tags`/`description`/`pinned` 五个字段）；`rawQuery: string`。
- **输出**：`{matched, score}`；不返回命中字段/命中位置，调用方无法据此高亮。
- **磁盘/网络/缓存**：全无。
- **模块级初始化副作用**：`:43-48` 在模块加载时遍历 `PINYIN_INITIAL_GROUPS` 构建 `CHAR_TO_INITIAL`（约 25 个键 × 平均数十字）。这是一次性、确定性的内存构造，不写外部状态。
- **幂等/并发**：纯函数，无共享可变状态，天然可并发。
- 副作用：无日志、无遥测。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 空查询（含纯空白） | `:108-109` | `matched:true, score:0`（不过滤任何项） |
| token 为空数组 | `:111-112` | 同上 |
| `tags` 缺失/`undefined` | `:117` | `?? ''` 兜底，不抛 |
| 某 token 全字段 0 分 | `:128` | 立即 `matched:false`（短路，不累加后续 token） |
| `pinned` 真 | `:132` | `+5` |
| 表外汉字 | `:60` | 原样保留，可能降低首字母命中率但不会抛错 |

无异常抛出路径（无 `throw`、无 JSON/IO）；无取消/超时/恢复概念。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 IPC、无配置读取。
- 权威状态：纯函数，不产生也不读取权威状态；实验室数据权威在 CSLab 主进程侧。
- 输入可信度：`rawQuery` 直接来自 UI 输入框，未做长度限制；超长查询会线性扫描全部字段（见 §10 的性能未知项）。

## 8. 修改影响面

- `CsLabPreparationView.tsx:136`：唯一调用点；改 `CsLabFuzzyMatchResult` 形状（如增加 `field`）需同步该渲染逻辑。
- `packages/shared/src/utils/index.ts:46-47`：barrel 导出名变化会影响所有 `@profer/shared` 消费者。
- 改分值表（60/48/44/34/18）或字段权重（100/70/55/35）会改变列表排序结果；`cslab-fuzzy-search.test.ts` 只断言 `matched` 与「pinned > normal」，**不锁具体分值**，因此分值改动不会被测试发现（见 §9）。
- 改 `PINYIN_INITIAL_GROUPS` 会改变所有中文首字母命中；该表是唯一拼音来源，无兜底词库。
- 若把 `getPinyinInitials` 改为丢弃表外汉字，会影响 `isSubsequence(query, initials)` 的命中率（`:91`）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/cslab-fuzzy-search.test.ts`（89 行，**9 个 `test(`**）。夹具 `makeLab`（`:9-23`）构造完整 `CsLabLab`（`id/code/name/description/tags/members/status/rootPath/createdAt/updatedAt`），用 `overrides` 覆盖。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:26-30` | 直接调 `getPinyinInitials` | `'演示实验室'` → `'yssys'`；`'地球物理学院'` → `'dqwlxy'`；`'CSLab-1'` → `'cslab1'` |
| 2 | `:34-38` | name `演示实验室` | `matchLabFuzzy(lab,'ys').matched` true；`'yssys'` true |
| 3 | `:40-43` | name `地球物理学院` | `'dqwlxy'` true |
| 4 | `:45-54` | code `CSLAB-BATTERY`、tags `['电化学','界面']`、description `固态电池循环稳定性研究` | `'battery'` true（code 中间命中）；`'dhx'` true（tags 首字母）；`'gtdc'` true（description 首字母） |
| 5 | `:56-59` | 默认夹具 | `'zzzz'` false |
| 6 | `:61-67` | 同名，一个 `pinned:true` | `pinned.score > normal.score`（只断言相对大小） |
| 7 | `:69-76` | name `固态电池界面实验室`、tags | `'固态 电池'` true；`'界面 电化学'` true（跨字段 token AND） |
| 8 | `:78-81` | name `固态电池界面实验室` | `'固态 zzzz'` false（任一 token 未命中即整体未命中） |
| 9 | `:83-88` | `tags` 被强制设为 `undefined` | `expect(() => matchLabFuzzy(broken,'ys')).not.toThrow()`；且 `matched` true |

未覆盖：具体分值（60/48/44/34/18 与 100/70/55/35 无一条断言）、`score` 绝对值、空查询返回 `{matched:true,score:0}`、`getPinyinInitials` 对表外汉字/标点/emoji 的行为、`isSubsequence` 的跳字路径、`code`/`description` 的权重排序、`pinned` 的 `+5` 精确值。
`NOT_RUN`：本轮未执行 `bun test`；以上为静态阅读断言，不代表通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 条导出（2 函数 + 1 接口） | 已证实 | `:51`、`:95`、`:107`；`grep -cE '^export '` = 3 |
| 分值六档与字段权重 | 已证实 | `:81-92`、`:114-119` |
| 多 token 为 AND 语义，且首个未命中即短路 | 已证实 | `:122-130`，尤其 `:128` |
| 空查询恒命中且 score 0 | 已证实 | `:108-109` |
| `tags` 缺失由 `?? ''` 兜底 | 已证实 | `:117`；测试 `:83-88` |
| 表外汉字原样保留进首字母串 | 已证实 | `:60` |
| 模块加载时构建 `CHAR_TO_INITIAL` | 已证实 | `:43-48` |
| 测试不锁具体分值 | 已证实 | 9 个用例仅断言 `matched` 与相对 `score`（§9） |
| 超长查询的性能表现 | 未知 | 未做基准；复杂度为 O(tokens × 4 × 字段长度) |
| 表外汉字（如生僻校名）是否影响真实命中率 | 未知 | 未跑真实数据 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 条导出 | §2 | `:51-133` | covered |
| 分组表/正则/Map 初始化 | §2、§5 | `:11-48` | covered |
| 首字母转换四分支 | §3.1 | `:51-64` | covered |
| 单字段六档打分 | §3.2 | `:78-93` | covered |
| 多 token AND 与短路 | §3.3、§6 | `:107-133` | covered |
| 唯一 UI 消费者 | §4 | `CsLabPreparationView.tsx:136` | covered |
| 9 个测试用例 | §9 | `:26-88` | covered |
| 分值/性能/生僻字 | §10 | — | unknown |
