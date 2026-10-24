---
path: apps/electron/src/renderer/components/diff/PreviewDirectoryView.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 54d8c03b259669ca1e5edae7cfd4e69ca6a5b5bc
sha256: e58bed1d778689dc180a5419e9a3a6c558ce9fa14ee13c5665d2871022c88ddc
lines: 22
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/PreviewDirectoryView.test.ts

## 1. 测试目标

`formatEntrySize`（`PreviewDirectoryView.tsx:20-31` 导出的目录视图体积列格式化函数）的纯函数边界：字节/KB/MB 单位换算、小数位规则、非法值空串。Bun test 框架（`bun:test`），无 mock、无 DOM、无 IPC。

## 2. 用例清单

1 个 describe、3 个 `test(`（与源码 `test(` 出现次数一致：`:5/:10/:17`）。

| # | 用例 | 行 | 设置 | 动作 | 断言（见 §3） |
| --- | --- | --- | --- | --- | --- |
| 1 | 小于 1KB 用字节 | 5-8 | 无 | `formatEntrySize(0)`/`(1023)` | 2 条 |
| 2 | KB/MB 取值：小于 10 保留一位小数，否则取整 | 10-15 | 无 | `(1024)`/`(1536)`/`(10*1024)`/`(2.4*1024*1024)` | 4 条 |
| 3 | 目录没有 size，非法值不显示 | 17-21 | 无 | `(undefined)`/`(-1)`/`(NaN)` | 3 条 |

用例间无依赖顺序；每个 test 独立直调纯函数。

## 3. 真实断言

- `apps/electron/src/renderer/components/diff/PreviewDirectoryView.test.ts:6`：`expect(formatEntrySize(0)).toBe('0 B')`
- `:7`：`expect(formatEntrySize(1023)).toBe('1023 B')`
- `:11`：`expect(formatEntrySize(1024)).toBe('1.0 KB')`
- `:12`：`expect(formatEntrySize(1536)).toBe('1.5 KB')`
- `:13`：`expect(formatEntrySize(10 * 1024)).toBe('10 KB')`
- `:14`：`expect(formatEntrySize(2.4 * 1024 * 1024)).toBe('2.4 MB')`
- `:18`：`expect(formatEntrySize(undefined)).toBe('')`
- `:19`：`expect(formatEntrySize(-1)).toBe('')`
- `:20`：`expect(formatEntrySize(Number.NaN)).toBe('')`

共 9 条 `expect`，全部为 `toBe` 值断言。`NOT_RUN`：本轮未执行 Bun 测试；上述只是静态读到的断言行，不代表测试已通过。

## 4. 未覆盖与脆弱点

- 未覆盖：GB/TB 单位上限路径（`units` 数组 `unitIndex<units.length-1` 截断）、`size` 为 `Infinity`/非整数大数、`toFixed(1)` 进位边界（如 9.96→'10.0' 这类展示）。
- 脆弱点：`PreviewDirectoryView.test.ts:14` 依赖浮点乘法 `2.4*1024*1024` 的精确性（实际实现两次除以 1024 后 `toFixed(1)`，与源码 `PreviewDirectoryView.tsx:24-30` 对应）。
- 无 mock 边界问题：被测是纯函数，不涉及 electronAPI。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例、9 条断言 | 已证实 | `:5/:10/:17` 声明行；`expect` 逐行 `:6-:20` |
| 被测函数为 `formatEntrySize` 单一导出 | 已证实 | `:2` import 行 |
| 断言与实现分支一一对应（B/KB/MB/非法） | 已证实 | `PreviewDirectoryView.tsx:20-31` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 用例/断言 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 字节分支 | §2,§3 | 5-8 | covered |
| KB/MB 小数规则 | §2,§3 | 10-15 | covered |
| 非法值空串 | §2,§3 | 17-21 | covered |
| GB/TB 分支 | §4 | — | unknown（未覆盖） |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
