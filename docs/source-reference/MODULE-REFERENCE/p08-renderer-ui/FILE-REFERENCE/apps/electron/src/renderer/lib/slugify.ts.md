---
path: apps/electron/src/renderer/lib/slugify.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc233fb8e9abca8dec80a2d73d72161a931a9137
sha256: 010fbf1a4f53d797a3ad90dd0fe1105a2bc9df29ae177bf1bc5cdcf162d34db9
lines: 40
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/slugify.ts

## 1. 结论与边界

GitHub 风格标题 slug 生成（40 行）：`slugify` 输出基础 slug，`createSlugger` 返回带去重计数的闭包生成器，用于 Markdown 预览 TOC 锚点 id（slugify.ts:2-7）。不负责 DOM 注入，只做字符串变换。

## 2. 导出与关键符号

函数 2 个：`slugify(text: string): string`（slugify.ts:10）、`createSlugger(): (text: string) => string`（slugify.ts:27）；类型 0、常量 0。无内部函数。

## 3. 内部逻辑与关键流程

- `slugify`（slugify.ts:11-19）：`.trim()` → `.toLowerCase()` → 空白（含全角空格 `[\s　]+`）转 `-`（:14）→ 删除非 `[\p{L}\p{N}_-]` 字符（保留 Unicode 字母数字/下划线/连字符，:16）→ 连续 `-` 折叠（:17）→ 去首尾 `-`（:18），返回字符串。
- `createSlugger`（slugify.ts:28-39）：闭包持 `seen = new Map<string, number>()`（:28）；每次调用取 `base = slugify(text) || 'section'`（:30）；首次（`count === undefined`，:32）写 `seen.set(base, 0)` 返回 `base`（:33-34）；重复则 `next = count + 1` 写回并返回 `` `${base}-${next}` ``（:36-38）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/hooks/useTocHeadings.ts:2` import `createSlugger`、`:43` 调用（TOC 锚点生成）；测试 `slugify.test.ts:2`。否定结论：`apps/electron/src/main/lib/agent-workspace-manager.ts:132` 存在同名内部 `slugify`（不同函数，非本模块调用者）；检索范围：baseline 全树 grep `from '[^']*slugify'` 与 `slugify(`。
- 出向：无 import；纯函数无调用点。

## 5. 数据 I/O、读写与副作用

纯函数模块，无 I/O、无副作用。去重状态仅存在于 `createSlugger` 返回闭包内的 `Map`（slugify.ts:28），由调用方持有，模块级无状态。

## 6. 分支、失败、取消与恢复

空/纯标点输入 → `slugify` 返回 `''`（slugify.ts:16 抹除全部字符），`createSlugger` 回退 `'section'`（:30，测试 slugify.test.ts:22、:36-37）；重复标题追加 `-1`、`-2`（:36-38）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

改动变换规则会改变 Markdown 预览 TOC 锚点 id（`useTocHeadings.ts:43` 消费）；需同步 `slugify.test.ts` 全部 7 个用例；注释声明与 GitHub 渲染行为一致（slugify.ts:6），变更需评估锚点兼容性。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。测试文件 `slugify.test.ts`，机械计数 `test(`=7。真实断言示例：slugify.test.ts:6（`toBe('hello-world')`）、:14（CJK 保留）、:22（纯标点 → `''`）、:29-31（去重后缀）、:36-37（`'section'` 回退）。断言≠运行，不声称运行成功。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两条管线的字符串变换与去重逻辑 | 已证实 | slugify.ts:10-39 全文 |
| 空输入/重复输入行为 | 已证实 | slugify.ts:30-38 + slugify.test.ts:22,29-37 断言 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| slugify | §3/§6 | slugify.ts:10-19 | covered |
| createSlugger | §3/§5/§6 | slugify.ts:27-39 | covered |
