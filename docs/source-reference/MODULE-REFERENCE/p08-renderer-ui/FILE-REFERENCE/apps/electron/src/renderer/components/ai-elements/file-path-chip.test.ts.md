---
path: apps/electron/src/renderer/components/ai-elements/file-path-chip.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: acef0210ea94d36433687ef318fb9a38a201cc6a
sha256: 606a45440e710e0a5cd6d1f3274134f936c3e353d95baf446486b7a975167530
lines: 94
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/file-path-chip.test.ts

## 1. 测试目标

直接测试 `file-path-chip.tsx` 3 个纯函数导出：`isRelativeFilePath`/`isAbsoluteFilePath`（路径识别，含中文/反斜杠/`~` 缩写回归）+`shouldSearchFileCandidate`（候选搜索策略）。21 个 `test(`，3 个 describe（`:4`/`:62`/`:72`）。

## 2. 用例清单

**isRelativeFilePath（14 例 `:5-59`）**：英文文件名/层级路径/带空格中文/Windows 反斜杠/带行号（`:42`）；**排除**单个带空格文件名（防误识别 `:25-27`）、无扩展名文案/命令/变量名；trim 容忍；**回归组**（`:33-47`）：中文文件名/中文目录/隐藏目录/中文带行号（注释"ASCII 正则误排除"回归）。

**shouldSearchFileCandidate（2 例 `:63-68`）**：绝对路径→false（直接预览不搜同名）；相对/裸文件名→true。

**isAbsoluteFilePath（5 例 `:73-89`）**：中文 Windows/Unix 绝对路径；**`~/` 主目录缩写**（create_skin installedPath 写法，`:81-84`）；独立 `~`/`~user` 拒绝；`~/` 不再被当相对路径二次处理（`:91-93`）。

## 3. 真实断言

`toBe`（布尔精确）。无 mock、无 IO。

## 4. 未覆盖

- `FilePathChip` 组件渲染/搜索/缓存交互（纯函数之外）。
- stripLineCol 边缘（盘符冒号 `:30` 防误切）；网络路径 `\\server\share`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 个 `test(`、断言如 §2 | 已证实 | 文件全读（94 行） |
| 中文路径回归组锁定 | 已证实 | `:33-47` 注释"回归：ASCII 正则误排除" |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 相对路径识别 | §2 A | `:5-59` | covered |
| 搜索策略 | §2 B | `:63-68` | covered |
| 绝对路径/`~` | §2 C | `:73-93` | covered |
| §4 边缘 | — | — | unknown |
