---
path: apps/electron/src/main/lib/study/quiz-options.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9cde0b58d96856f731a6f6e8c8bfe3f0a6b71708
sha256: 61be1411e11f9714a4f7129baeb152505c3a8715cd9e0722e32b358c7d250737
lines: 124
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/quiz-options.ts

## 1. 结论与边界

测验题目/选项**洗牌纯函数**（`apps/electron/src/main/lib/study/quiz-options.ts:1-9`）。两条产品红线：**选项位置不得偏置**（模型爱把正确答案放 A，重排后重新编号 A/B/C/D 并重映射答案）；**每次重做重新打乱**（防位置记忆）。

## 2. 导出与关键符号

`export` 共 **10 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ShufflableOption` | interface | `:12-15` | `{key, text}` |
| `ShufflableQuestionType` | type | `:18` | single/multiple/boolean |
| `ShufflableQuestion` | interface | `:21-26` | 题目最小结构 |
| `RandomSource` | type | `:29` | `() => number`（可注入） |
| `OPTION_KEYS` | const | `:32` | A-Z |
| `shuffleWith` | 函数 | `:35-44` | Fisher-Yates（返回新数组） |
| `createSeededRandom` | 函数 | `:47-62` | FNV-1a 播种 + xorshift32 确定性随机 |
| `shuffleQuestionOptions` | 函数 | `:71-90` | 选项重排+重编号+答案重映射 |
| `shuffleQuiz` | 函数 | `:96-110` | 整卷题序+选项序洗牌 |
| `answerPositionHistogram` | 函数 | `:113-124` | 正确答案位置分布（4 桶） |

## 3. 内部逻辑与关键流程

- `shuffleQuestionOptions`（`:71-90`）：`boolean` 或选项<2 不重排（`:78`）；Fisher-Yates 后按新序 `OPTION_KEYS[index]` 重编号，`correctKeys` 同步重映射（`:82-86`）；**重映射失败（answer 与 key 全不匹配）原样返回，绝不改坏题目**（`:87-88`）。
- `shuffleQuiz`（`:96-110`）：题序洗牌 + 每题选项洗牌（生成与「再练一次」都调，`:92-95` 注释）。
- `createSeededRandom`（`:47-62`）：FNV-1a 文本哈希播种 + xorshift32（确定性，测试可复现）。

## 4. 调用者与调用链

- 消费方：测验生成/再练一次（study 测验面板）。
- 出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| boolean/<2 选项 | `:78` | 不重排原样返回 |
| answer 脏数据 | `:87-88` | 原样返回（不改坏） |
| 重映射成功 | `:89` | 去重后的答案数组 |

## 7. 权限与权威状态

无身份语义；两条红线（位置不偏置/每轮重洗）是产品公平性契约（`:4-8`）。

## 8. 修改影响面

- 重映射口径改动会破坏答案一致性；`OPTION_KEYS` 26 字母上限。
- `createSeededRandom` 是测试可复现接口。

## 9. 测试证据

`propositional-chunker.test.ts` 不含；quiz-options 专属测试文件不在本批 scope（全树检索 `shuffleQuiz` 测试命中见 study 测验测试，不在本批）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 个导出、两条红线语义 | 已证实 | `:1-124` |
| 脏数据不改坏 | 已证实 | `:87-88` |
| 位置偏置实际分布 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 10 个导出 | `:12-124` | covered |
| 洗牌/重映射 | `:71-110` | covered |
| 确定性随机 | `:47-62` | covered |
