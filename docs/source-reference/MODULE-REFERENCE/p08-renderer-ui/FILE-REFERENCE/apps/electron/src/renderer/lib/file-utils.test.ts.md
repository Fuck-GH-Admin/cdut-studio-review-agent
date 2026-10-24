---
path: apps/electron/src/renderer/lib/file-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 642cc782b39d0f8074f336b9d8752ccebedd6e9d
sha256: 1f2ac0e1e9ea64fcb8fca955108d96b12946dde2f604f435648bc8c415e5b4ca
lines: 119
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/file-utils.test.ts

## 1. 测试目标

直接测试 `file-utils.ts` 5 函数（5 个 describe `:4`/`:23`/`:54`/`:77`/`:110`）。23 个 `test(`。

## 2. 用例清单（按 describe 分组）

**getFileBaseName（4 例 `:5-20`）**：正斜杠/反斜杠（中文）/混合分隔符尾斜杠（`C:/a//b/`→'b'）/无分隔符原串。

**isAbsoluteFilePath（6 例 `:24-51`）**：盘符两种/根斜杠/`~/`与`~\` 缩写/`~`与`~other` 拒绝/UNC/相对与普通文本拒绝。

**getLastPathSegments（4 例 `:55-74`）**：省略号形式（默认 2 段/3 段）/不足返回原路径/空值空串/过滤空段。

**resolveRelativeToAbsolute（7 例 `:78-107`）**：无 base 原样/退化首候选/首段命中不嵌套（`profer/src/a.md`+`C:/ws/profer`→同层）/多候选匹配第二/反斜杠 base 中文/反斜杠相对路径归一/尾斜杠 base。

**getFileParentPath（2 例 `:111-118`）**：正反斜杠/无分隔符 null。

## 3. 真实断言

`toBe`/`toBe(null)`。纯函数无 mock。

## 4. 未覆盖

- `formatFileNames`/`fileToBase64`（含超限 reject）；UNC 父目录边界；盘符根 `C:\` 的 parent。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 23 个 `test(`、断言如 §2 | 已证实 | 文件全读（119 行） |
| 中文/Windows 路径全谱 | 已证实 | 各组用例 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 5 函数路径处理 | §2 | covered |
| §4 边缘 | — | — | unknown |
