---
path: packages/shared/src/utils/beijing-time.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68a75151b1bc1eec1c56c9c052514ae1b249bac2
sha256: 277aa4834cdf6b6f057a7c5e5f5c5b8207474ec9bdfa2fc7b5eaf76f7d966b6a
lines: 143
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/beijing-time.test.ts

## 1. 测试目标

BDD：标准北京时间 / 教学周 / 24 小时课程雷达（`packages/shared/src/utils/beijing-time.test.ts:2-6`）。**全部内存合成数据**（不依赖物理 fixture），统一显式 `+08:00`/`-04:00` 时刻构造——任意宿主时区与 CI 100% 稳定。被测：`getBeijingTimeInfo`/`computeBeijingTeachingWeek`/`evaluateCourseLiveStatus`/`CDUT_SECTION_PERIODS`。

夹具：`course()` 工厂（`:18-26`，默认周一 1-2 节、weekList 空=全学期）。

## 2. 用例清单

共 **15 个 `it(`**（3 个 `describe`）：

### BDD-BJTIME-01 `getBeijingTimeInfo`（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 29-39 | 周六 22:00 提取全字段 | year/month/day/dayOfWeek=6/hour/minute/minutesOfDay/midnightMs 8 断言 |
| 2 | 41-45 | 同一时刻美东表达 → 结果完全一致 | `toEqual` |
| 3 | 47-52 | 午夜 00:00 → hour=0 且星期归当天 | dayOfWeek=7 |

### BDD-BJTIME-02 `computeBeijingTeachingWeek`（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 4 | 56-58 | 秋学期首个周一 → 第 1 周 | toBe 1 |
| 5 | 60-62 | 第 7 个周一 → 第 7 周 | toBe 7 |
| 6 | 64-70 | 任意学期时刻夹取 [1,25] | 3 时刻 ≥1 ≤25 |

### BDD-BJTIME-03 `evaluateCourseLiveStatus`（9）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 7 | 74-79 | 作息表锁定 11 节制 | length 6、首末段 toEqual、endSection ≤11 循环 |
| 8 | 81-88 | 周一 09:00 → 1-2 节 ongoing、next null | ongoing=首门、isOngoing 计数 1 |
| 9 | 90-95 | 同段两门重叠 → 全标 ongoing 且取首门 | 计数 2、ongoing=markedCourses[0] |
| 10 | 97-101 | 9-11 连排 21:00 → 跨作息区间仍 ongoing | |
| 11 | 103-112 | 周六 22:00 → 周日课 next、34h 外周一课排除 | ongoing null、next.dow=7、isNext 计数 1 |
| 12 | 114-119 | 未来 24h 无课 → 双 null | |
| 13 | 121-128 | 陈旧静态标记被重置且原数组不改 | 原对象 isOngoing 仍 true、marked 均 false |
| 14 | 130-134 | weekList 不含当前周 → 不误判 ongoing | ongoing null |
| 15 | 136-142 | 美东同绝对时刻 → 与北京口径一致 | ongoing 非空、dow 相同 |

## 3. 真实断言

全 15 用例逐条见 §2（锚）：`:31-38` 8 连断言；`:44` toEqual；`:51`；`:57,61,67-68`；`:75-78`；`:84-87`；`:93-94`；`:100`；`:109-111`；`:117-118`；`:125-127`；`:133`；`:140-141`。

## 4. 未覆盖与脆弱点

- `computeBeijingTeachingWeek` 春学期（3 月起点）无直接用例（仅 `:65` 含 5 月夹取）。
- `sectionRangeFor` 无重叠 null 分支未锚。
- weekList 边界（学期首/末周）未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 it/3 describe、时区无关构造 | 已证实 | `:2-6` 全文 |
| 时区无关性显式断言（用例 2/15） | 已证实 | `:41-45,136-142` |
| 11 节制锁定 | 已证实 | `:74-79` |
| 不改入参契约 | 已证实 | `:121-128` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| getBeijingTimeInfo | §2 | 1-3 | covered |
| 教学周（秋） | §2 | 4-6 | covered |
| 作息表契约 | §2 | 7 | covered |
| ongoing/next 雷达 | §2 | 8-12,14 | covered |
| 重置/时区一致 | §2 | 13,15 | covered |
| 春学期/重叠 null | §4 | — | unknown |
