---
path: apps/electron/src/main/lib/feishu/sleep-blocker.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d241d43555ccc0cd0e388b4541126a46abddfa1f
sha256: 3654eec5b80a1a9d51acb397f36f17df54d364c421972199f1a2b6ea999fe879
lines: 86
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/sleep-blocker.test.ts

## 1. 测试目标

飞书同步防休眠（`apps/electron/src/main/lib/feishu/sleep-blocker.test.ts:37`）：stream 启停/幂等/漂移恢复/需求判定。被测 `FeishuSyncSleepBlocker`/`shouldPreventSleepForFeishuSync`。夹具：**FakeSleepBlocker 适配器**（`:20-34`，startedTypes/stoppedIds 记录+markStopped 模拟系统侧失效）——**mock 边界**：系统休眠 API 全被 fake 替换。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 38-45 | stream 开启 → 启用防休眠 | startedTypes ['prevent-app-suspension']、isStarted(1) true | 独立 |
| 2 | 47-55 | 重复同步开启 → 不重复创建 | startedTypes 长 1 | 独立 |
| 3 | 57-64 | 开→关 → 释放 | stoppedIds [1]、isStarted(1) false | 独立 |
| 4 | 66-76 | 系统 blocker 失效仍开启 → 重开 | startedTypes 两元素、isStarted(2) true（漂移恢复） | 独立 |
| 5 | 78-82 | 未开启 → 不阻止休眠 | off/undefined 均 false | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:43-44`；`:53-54`；`:62-63`；`:74-75`（漂移重开）；`:80-81` 两 toBe(false)。

## 4. 未覆盖与脆弱点

- 无并发 sync；console.log 输出无断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test、fake 适配器 | 已证实 | `:20-34` |
| 幂等+漂移恢复锚 | 已证实 | `:53-54,74-75` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| start/stop | §2 | 1,3 | covered |
| 幂等 | §2 | 2 | covered |
| 漂移恢复 | §2 | 4 | covered |
| 判定函数 | §2 | 5 | covered |
