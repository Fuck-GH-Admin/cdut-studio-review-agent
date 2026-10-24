---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-event-log.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: afb7309cbb87544fe35de699ec19be18a4fefc53
sha256: a7239e17ae082c9abfc746435d29032ac17938b2e5b030c89e56d37dfc299f9f
lines: 51
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-event-log.test.ts

## 1. 测试目标

直接测试 `yanhu-event-log.ts` 3 个导出：时间戳格式契约（毫秒+时区偏移）、单行事件格式（空值过滤/换行折叠）、追加落盘读回。4 个 `test(`，3 个 describe（`:13`/`:20`/`:41`）。

## 2. 用例清单

真实 fs（mkdtempSync 临时目录，`:43`）；注入 filePath 参数。

| # | 行 | 被测 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:14-17` | formatYanhuEventTime | `toMatch(/^2026-10-09T16:03:38\.123[+-]\d{2}:\d{2}$/)`（毫秒+显式偏移） |
| 2 | `:21-33` | formatYanhuEventLine | `toContain` '[reload]'/tabId=t1/reason=self-heal-400；`not.toContain` empty=/nil=/undef=（空值过滤） |
| 3 | `:35-38` | formatYanhuEventLine | `line.split('\n')` `toHaveLength(1)`（换行折叠防撑破日志） |
| 4 | `:42-50` | logYanhuEvent | 两次追加→`toHaveLength(2)`、`[tab-create]`/`[reload]` 按序 |

## 3. 真实断言

`toMatch`（正则）+ `toContain`/`not.toContain` + `toHaveLength`。无快照测试。

## 4. 未覆盖

- `rotateIfNeeded` 滚动分支（超上限→`.1`）。
- 静默吞异常路径。
- 14 类事件类型的逐个格式。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 时间戳契约 | §2 用例 1 | `:14-17` | covered |
| 单行格式/过滤 | §2 用例 2/3 | `:21-38` | covered |
| 追加读回 | §2 用例 4 | `:42-50` | covered |
| §4 边缘 | — | — | unknown |
