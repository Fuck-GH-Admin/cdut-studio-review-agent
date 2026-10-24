---
path: apps/electron/src/main/lib/browser-controller-preview-theme.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2464a87235b0475bf79c08650f8fd7e0bd44542c
sha256: 47e6c5380ee9b795396c3367fbaf22de09c94772fe494efc355bd0490c00473a
lines: 170
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller-preview-theme.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

主题重载边界（头注 :3-10）：本地预览按新主题重载；**普通网页永不跟随 app 皮肤**；判据是「烘进 URL 的参数签名」而非明暗（两深色皮肤切换也须重载）。

## 2. 用例清单

6 用例（顶层 test，无 describe）。夹具 `harness()`（:38-84，替身 tabs（previewLight/previewDark/web/htmlPreview）+记录 loadUrl）；`DARK_SKIN` 与 DARK 同色调不同配色（:32-36）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 换主题选择性重载 | 88-103 | 仅 preview-light 重载；URL 含 theme/tokens；web/preview-dark 不动 |
| 2 | HTML 预览不跟随 | 105-112 | 签名 null、不重载（重载只会白丢页面状态） |
| 3 | 同色调皮肤也重载 | 114-121 | dark→DARK_SKIN 两预览全重载、tokens 烘入 |
| 4 | 切回浅色 | 123-129 | 仅 preview-dark 重载 |
| 5 | 失败留痕不标记 | 131-143 | 返回 0、签名不变（下次仍重试）、trace `failed` |
| 6 | 主题优先级惰性 | 145-163 | 显式>记忆>兜底；前两档不触发 fallback |

## 3. 真实断言

如 §2 表（逐条读自 :88-163）；`decodeTokens` 断言 tokens 逐值相等（:86）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 viewer 页渲染（仅 URL 构造层）。
- 脆弱点：`internals.loadUrl` 替身记录。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| 签名判重/网页不跟随被固定 | 已证实 | 用例 1-3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `refreshLocalPreviewThemes` 全分支 | §2 | covered |
| `resolvePreviewTheme` 优先级 | §2 | covered |
| viewer 页真实渲染 | §4 | unknown（未测） |
