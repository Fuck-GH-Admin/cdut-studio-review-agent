---
path: apps/electron/src/main/lib/review/review-v3-f04-folder-snapshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a7ec449afc800ae2559cea7eaa12708720694786
sha256: 6b685ad98fdc94e9c400a2797757cbcaf61f8fa0f805e1b1b4da3c266d59aa89
lines: 38
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-folder-snapshot.test.ts

## 1. 测试目标

F04 可信目录快照（describe `:11`）：枚举嵌套原件+校验哈希+保留同名不同目录文件；跳过文件符号链接、报告排除项、执行文件数上限。被测：`snapshotF04Folder` + `assertF04OriginalUnchanged`（identity 侧）。夹具：`mkdtemp(review-f04-folder-)`。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**2 test**：

1. `:12-25` 嵌套 `A/award.txt`+`B/award.txt`：`relativePath===['A/award.txt','B/award.txt']`、entryId 2 个唯一（同名不同目录不冲突）、`warnings==[]`；`assertF04OriginalUnchanged` 对正确字节不抛、对串目录字节抛 `F04_ORIGINAL_CHANGED_AFTER_PREVIEW`。
2. `:27-37` `maxEntries:1`：originals 1 条、warnings 含“超过 1 条”；（非 win32）符号链接 warning 含“符号链接未导入”。

## 3. 真实断言

- #1 用 `assertF04OriginalUnchanged` 双向断言（正确字节通过/错误字节抛）——identity 摘要的真实绑定。
- #2 平台条件断言（win32 不建 symlink）。

## 4. 未覆盖与脆弱点

**未覆盖**：跨平台不安全名、预览期间替换/变化、零可读原件 throw、根为符号链接 throw、`maxEntryBytes` 上限。

**脆弱点**：`localeCompare('en')` 排序依赖；win32 条件分支在本环境可能跳过。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、2 test、真实目录 | 已证实 | `:11`；`grep -c test(`=2 |
| 嵌套+同名保留+identity 绑定 | 已证实 | `:12-25` |
| 符号链接排除+上限 | 已证实 | `:27-37` |
| 替换/变化/零原件 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 嵌套枚举/identity | #1 | `:12-25` | covered |
| 上限/符号链接 | #2 | `:27-37` | covered |
| 替换/变化/非法根 | — | — | unknown |
