---
path: apps/electron/test/quiz-options.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 813ce00a004532ff8acb27b13e306906c2508c92
sha256: a7a0d9c86226483e601c9cd6fd7dbdc652caf50289d6b313742f0aacf5e9866f
lines: 150
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/test/quiz-options.test.ts

## 1. 测试目标
对纯函数模块 `apps/electron/src/main/lib/study/quiz-options.ts`（124 行）的测验洗牌做回归锁定（`quiz-options.test.ts:1-7` 注释自述两条产品红线：①模型把答案全放 A 的位置偏置需算法纠偏；②重做必须重新打乱防位置记忆）。被测 5 个函数+1 类型（导入 `:10-17`）：`shuffleWith`/`createSeededRandom`/`shuffleQuestionOptions`/`shuffleQuiz`/`answerPositionHistogram`/`type ShufflableOption`（定义 `quiz-options.ts:35/:47/:71/:96/:113/:12`）。

## 2. 用例清单
用例计数：`it(` 实测 16 个、`describe(` 4 组、`test(` 0（grep 实测）。夹具 `FOUR_OPTIONS`（`:19-24`，A-D 四项）；`buildQuestions` 8 题构造器（`:103-108`）。

| # | describe（BDD 编号） | it 行 | 设置/动作 | 断言行 |
| --- | --- | --- | --- | --- |
| 1 | shuffleWith（BDD-QUIZ-OPT-01，`:26`） | :27 | 种子洗牌后集合比对 | :29（排序后 toEqual 原数组） |
| 2 | 同上 | :32 | 同种子两次 | :35（键序全等，可复现） |
| 3 | 同上 | :38 | 空数组/单元素 | :39-40（不抛、原样） |
| 4 | shuffleQuestionOptions（BDD-QUIZ-OPT-02，`:44`） | :45 | 正确答案在 A，重排 | :47-49（文本集合不变、答案指向「选项甲」） |
| 5 | 同上 | :52 | 30 次任意随机源 | :55（键序恒 A,B,C,D） |
| 6 | 同上 | :59 | 30 题全 A 答案重排+直方图 | :64/:66-67（和=30、A 占比<50%、四位置全>0） |
| 7 | 同上 | :70 | 多选 ['A','D'] | :72-74（2 答案不重复、映射到甲/丁） |
| 8 | 同上 | :77 | 是非题 2 选项 | :83-84（不洗牌、正确在前） |
| 9 | 同上 | :87 | 脏数据答案 ['Z'] | :89-90（原样返回） |
| 10 | 同上 | :93 | 单选项 | :96-97（原样返回） |
| 11 | shuffleQuiz（BDD-QUIZ-OPT-03，`:101`） | :110 | 8 题整卷洗牌 | :112/:114（数量不变、答案键存在） |
| 12 | 同上 | :118 | 连续 20 次（题序） | :124（>1 种题序） |
| 13 | 同上 | :127 | 连续 20 次（选项序） | :134（>1 种选项序） |
| 14 | 同上 | :137 | 空卷 | :138（=[]） |
| 15 | answerPositionHistogram（BDD-QUIZ-OPT-04，`:142`） | :143 | 空列表 | :144（[0,0,0,0]） |
| 16 | 同上 | :147 | 答案键为空 | :148（跳过不计数） |

## 3. 真实断言
代表性真实断言：`expect([...shuffled].sort(...)).toEqual(FOUR_OPTIONS)`（`:29`，集合不变）；`expect(first).toEqual(second)`（`:35`，种子可复现）；`expect(options.find((o) => o.key === answer[0])?.text).toBe('选项甲')`（`:49`，答案重映射正确）；`expect(options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D'])`（`:55`，重编号连续）；`expect(histogram[0]).toBeLessThan(30 * 0.5)`（`:66`，关键回归「绝不全是 A」）+ `for (const count of histogram) expect(count).toBeGreaterThan(0)`（`:67`）；`expect(new Set(answer).size).toBe(2)`（`:73`，多选不重复）；`expect(options).toEqual(booleanOptions)`（`:83`，是非题不洗）；`expect(options).toEqual(FOUR_OPTIONS)`/`expect(answer).toEqual(['Z'])`（`:89-90`，脏数据原样）；`expect(orders.size).toBeGreaterThan(1)`（`:124`）；`expect(answerPositionHistogram([])).toEqual([0, 0, 0, 0])`（`:144`）。

## 4. 未覆盖与脆弱点
未覆盖（对照被测 124 行实现）：①`shuffleWith`/`shuffleQuestionOptions`/`shuffleQuiz` 的 `random = Math.random` 默认参数路径（`quiz-options.ts:35/:71/:96`，测试全部注入 `createSeededRandom` 或省略但走默认——#5/#12/#13 实际走默认 Math.random，标注：默认路径经 #5/#12/#13 间接覆盖，但不可复现）；②`OPTION_KEYS[index] ?? option.key` 的 >26 选项兜底（`:81` 一带）无断言；③`answerPositionHistogram` 中 `index >= histogram.length`（>4 选项时跳过）分支（`:120` 一带）无断言；④`createSeededRandom` 的 FNV-1a/xorshift 算法本身无直接断言（经可复现性间接覆盖）。脆弱点：⑤#6/#12/#13 是统计性断言（占比/顺序多样性），极端随机下理论可波动（种子可复现性仅覆盖 shuffleWith）；⑥中文选项文本断言（`:49/:74`）改夹具会碎。mock 边界：零 mock（无 mock.module/spyOn）；纯函数无 I/O；`createSeededRandom`（`:47-68`）为真算法注入，非 mock。

## 5. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例/4 describe、断言行如 §2/§3 | 已证实 | `quiz-options.test.ts:26-148` grep 实测+逐行读 |
| 被测 5 函数+类型签名与行号 | 已证实 | `quiz-options.ts:12/:35/:47/:71/:96/:113` |
| 三类洗牌分支（boolean/<2/脏数据）各有断言 | 已证实 | `:83-84`/`:96-97`/`:89-90` vs `quiz-options.ts:73/:88` |
| 生产消费者存在（study 链） | 已证实 | `apps/electron/src/main/lib/study/study-session-store.ts`、`study-artifact-service.ts`（grep 命中 import 语境） |
| 历史「答案全是 A」Bug 复现 | 推断 | `:2-7` 注释自述，未复现 |
| 统计断言的随机波动概率 | 推断 | 20 次/30 题样本量下波动概率极低，未量化 |
| 测试运行结果 | 未知 | NOT_RUN：本轮未执行 bun test/typecheck/build/GUI；断言均为静态阅读所得 |
| BDD-QUIZ-OPT-01..04 规格出处 | 未知 | 编号自述于 describe 头（`:26/:44/:101/:142`），规格文档未检索到 |

## 6. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| shuffleWith | §2 #1-3 | `quiz-options.ts:35` | covered |
| createSeededRandom | §2 #2 | `:47` | partial（间接） |
| shuffleQuestionOptions 正常重排 | §2 #4-5 | `:71` | covered |
| shuffleQuestionOptions boolean/<2/脏数据 | §2 #8-10 | `:73/:88` | covered |
| OPTION_KEYS 超 26 兜底 | §4 | `:81` 一带 | unknown |
| shuffleQuiz | §2 #11-14 | `:96` | covered |
| answerPositionHistogram | §2 #15-16 | `:113` | covered（越界分支 partial） |
