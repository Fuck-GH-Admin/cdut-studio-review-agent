---
path: apps/electron/src/renderer/components/bulletin/bulletin-startup.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 270cafee450ceb41ed0517b57b059a5c2819bba5
sha256: 9842d9648602473ae38cea383ee086c661b5a42ebfa9ff0393d6d2605083ac9d
lines: 101
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/bulletin/bulletin-startup.test.ts

## 1. 测试目标

验证公告启动弹出纯判定（`bulletin-startup.ts`）：`pickLatestBulletin`（空/乱序/pinned 不影响最新）、`sortBulletinsForDisplay`（置顶优先+日期倒序）、`shouldAutoOpenBulletin`（六守卫逐项推迟）。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 11 个（`describe` 3 个；`it(` 0 个）。夹具 `makeItem`（`:9-18`）、`makeGuard`（`:21-31`，全 true 基线）。

| # | describe | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | pickLatestBulletin | 空数组返回 null（文件缺失/损坏兜底） | 34-36 | `toBeNull()` |
| 2 | pickLatestBulletin | 乱序日期取最新一条 | 38-45 | `id==='newest'` |
| 3 | pickLatestBulletin | pinned 不影响「最新」判定 | 47-53 | pinned-old 落选 `id==='plain-new'` |
| 4 | sortBulletinsForDisplay | 置顶优先，同组内按日期倒序 | 57-70 | 四元素全序 `['pinned-new','pinned-old','normal-new','normal-old']` |
| 5 | shouldAutoOpenBulletin | 全部条件满足时自动弹出 | 74-76 | `true` |
| 6 | shouldAutoOpenBulletin | 已读无新公告不弹 | 78-80 | `hasUnreadLatest:false`→`false` |
| 7 | shouldAutoOpenBulletin | 本次会话已关闭绝不重弹 | 82-84 | `sessionDismissed:true`→`false` |
| 8 | shouldAutoOpenBulletin | CoachTour 进行中推迟 | 86-88 | `coachTourActive:true`→`false` |
| 9 | shouldAutoOpenBulletin | CoachTour 已排定（800ms 竞态窗口）推迟 | 90-92 | `coachTourPending:true`→`false` |
| 10 | shouldAutoOpenBulletin | 欢迎导览重播中推迟 | 94-96 | `welcomeReplayActive:true`→`false` |
| 11 | shouldAutoOpenBulletin | 公告列表为空静默 | 98-100 | `hasBulletins:false`→`false` |

## 3. 真实断言

`:35` `expect(pickLatestBulletin([])).toBeNull()`；`:44` `expect(pickLatestBulletin(items)?.id).toBe('newest')`；`:52` `toBe('plain-new')`；`:64-69` `toEqual([...])` 四元素数组；`:75-99` 八处 `expect(shouldAutoOpenBulletin(makeGuard({…}))).toBe(true/false)`。

## 4. 未覆盖与脆弱点

- 未覆盖：date 相同并列排序稳定性、非法/缺失 date、pinned 标量非布尔、guard 字段缺省。
- 脆弱点：排序断言用全序 toEqual 对实现 tie-break 敏感（当前实现 date 倒序稳定）；`makeGuard` 基线全 true，仅单字段翻转——组合翻转未测。
- mock 边界：无 mock；纯函数直测（`BulletinItem` 类型导入 `:5`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例与断言行号 | 已证实 | `:9-100` 逐行读 |
| 六守卫逐项被断言 | 已证实 | 用例 5-11 |
| 无 mock/纯函数 | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| `pickLatestBulletin` | 1, 2, 3 | covered |
| `sortBulletinsForDisplay` | 4 | covered |
| `shouldAutoOpenBulletin` | 5-11 | covered |
| 并列/非法输入 | - | unknown（未覆盖） |
