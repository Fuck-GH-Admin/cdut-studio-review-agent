---
path: apps/electron/src/main/lib/default-skill-slugs.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 77297cf82a1bf14ba5c0d8fd0a6aac8cb8db559b
sha256: c990313125f6aa37337a9885a78fc9351c609a6a1f7eec62d04e3f781f39907f
lines: 18
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/default-skill-slugs.test.ts

## 1. 测试目标

直接测试 `default-skill-slugs.ts` 两函数（1 个 describe `:4`）。2 个 `test(`。

## 2. 用例清单

| # | 行 | 真实断言 |
| --- | --- | --- |
| 1 | `:5-8` | 仅注册的历史 slug 归一（`proma-coach`→`profer-coach`）；**用户 slug 原样**（`user-coach`→`user-coach`） |
| 2 | `:10-17` | `undefined toBeUndefined()`；`[] toEqual([])`；归一+去重（`['proma-coach','profer-coach','custom-skill']`→`['profer-coach','custom-skill']`） |

## 3. 真实断言

`toBe`/`toBeUndefined`/`toEqual`。纯函数无 mock。

## 4. 未覆盖

- 空串/大小写变体 slug；多对映射扩展后的全量归一；与 seedDefaultSkills 落盘迁移的联动（由 default-skill-slug-migration.test 覆盖）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读（18 行） |
| 用户 Skill 不动锁定 | 已证实 | 用例 1 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 归一/去重/语义保留 | §2 | `:5-17` | covered |
| §4 边缘 | — | — | unknown |
