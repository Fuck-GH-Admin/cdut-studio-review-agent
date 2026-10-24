---
path: apps/electron/src/renderer/lib/slugify.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8fa25b2b2284afa1ce9ca1a41d0a4a2c13a047a0
sha256: 095a3e4d12d394c0a1b934d5969aba1a8d96406161cfedea2ea8879f6851b6bc
lines: 39
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/slugify.test.ts

## 1. 测试目标

验证 `slugify.ts` 两个导出的基础 slug 变换（小写化/连字符/去标点/CJK 保留/边界折叠）与 `createSlugger` 的去重后缀及空值回退（slugify.test.ts:2）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=7、`it(`=0、`test.each(`=0，共 7 个用例：

1. `lowercases and replaces spaces with hyphens`（slugify.test.ts:5-7）
2. `strips punctuation but keeps alphanumerics`（:9-11）
3. `preserves CJK characters`（:13-15）
4. `collapses repeated and trims edge hyphens`（:17-19）
5. `returns empty string for punctuation-only input`（:21-23）
6. `appends incrementing suffixes for duplicates`（:27-32）
7. `falls back to "section" for empty slugs`（:34-38）

## 3. 真实断言

slugify.test.ts:6 `expect(slugify('Hello World')).toBe('hello-world')`；:10 `toBe('what-is-toc-overview')`；:14 `toBe('目录导航-设计')`；:18 `toBe('foo-bar')`；:22 `toBe('')`；:29-31 依次 `toBe('intro')`/`'intro-1'`/`'intro-2'`；:36-37 `toBe('section')`/`'section-1'`。

## 4. 未覆盖与脆弱点

未覆盖全角空格 `　`（slugify.ts:14）与 `+`/emoji 等边界字符；未覆盖跨 slugger 实例隔离性。脆弱点：去重后缀 `-1/-2` 序列断言（:29-31）绑定计数器实现细节。被测为纯函数，无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例与断言行真实存在 | 已证实 | slugify.test.ts:5-38 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| slugify 主变换 | §2/§3 | slugify.test.ts:5-19 | covered |
| slugify 空输出 | §3 | slugify.test.ts:21-23 | covered |
| createSlugger 去重 | §3 | slugify.test.ts:27-32 | covered |
| createSlugger 回退 | §3 | slugify.test.ts:34-38 | covered |
| 全角空格/emoji 边界 | §4 | — | unknown |
