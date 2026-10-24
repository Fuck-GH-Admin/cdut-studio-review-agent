---
path: apps/electron/src/main/lib/study/study-document-indexer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0b0b65c40376df34da4e6307a760ce0990e2d99e
sha256: 6139827b3f00f9af3b0207662a069ea5e4847d6f528bec32d5ce3c4e20f999f4
lines: 69
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-document-indexer.test.ts

## 1. 测试目标

`buildStudyOutlineForPrompt` **全文路径**（`apps/electron/src/main/lib/study/study-document-indexer.test.ts:47`）：每份资料直出 `document.md` 绝对路径（不 find/ls 探测）、无资料返回空串。

## 2. 用例清单

1 describe / 2 test。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 每份资料直出 document.md 绝对路径 | `outlines.length===1`；含 `'Direct Full-Text Path:'`、绝对路径、`'no find/ls probe'`；`existsSync(documentPath)===true` | `:48-64` |
| 2 | 无资料返回空串 | `buildStudyOutlineForPrompt('empty-session')===''` | `:66-68` |

## 3. 真实断言

- `expect(outline).toContain('Direct Full-Text Path:')`（`:60`）。
- `expect(outline).toContain('no find/ls probe')`（`:62`）。
- `expect(existsSync(documentPath)).toBe(true)`（`:63`）。

## 4. 未覆盖与脆弱点

- 未覆盖：索引主流程（1136 行的 indexer 本体仅 outline 函数被测）。
- 脆弱点：断言绑定 outline 文案（`'Direct Full-Text Path:'`/`'no find/ls probe'`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例覆盖全文路径/空串 | 已证实 | `:48-68` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 全文路径 | 1 | `:48-64` | covered |
| 空会话 | 2 | `:66-68` | covered |
| 索引主流程 | — | — | unknown（未覆盖） |
