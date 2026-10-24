---
path: apps/electron/src/main/lib/memory-wikilink-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7ace7d5970b1fd37988b57c122adb8e8c8b96be
sha256: b7c2a245214d2dccc18c56594dd18fe321084aeb0cc1620de334a0ba5a5e52a1
lines: 87
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-wikilink-service.test.ts

## 1. 测试目标

双链三级解析与反链查询。不运行（`NOT_RUN`）。

## 2. 用例清单

9 用例（解析 5+反链 4），2 describe：
- `resolveMemoryWikilink`（:23，5 用例）：frontmatter name 精确（:24）/文件名回退（:32）/大小写不敏感（:40）/auto 目录命中（:47）/不存在 null（:54）。
- `findMemoryBacklinks`（:59，4 用例）：识别 `[[name]]`（:60）/不返自身（:68）/`[[name|label]]` 别名（:74）/无引用空数组（:82）。

## 3. 真实断言

各用例 toBe/toEqual/toContain/toHaveLength 级断言（fixture 起 tmp 记忆目录）。

## 4. 未覆盖与脆弱点

未覆盖：memoryKindOfPath（无外部消费者，见 §4）、2MB 读上限分支。mock 边界：真实 tmp 文件。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例/主题如 §2 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 三级解析/反链 | 9 用例 | covered |
| memoryKindOfPath/超限 | — | unknown |
