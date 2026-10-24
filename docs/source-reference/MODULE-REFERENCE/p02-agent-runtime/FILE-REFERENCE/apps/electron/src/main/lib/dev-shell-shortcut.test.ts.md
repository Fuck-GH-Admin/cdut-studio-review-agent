---
path: apps/electron/src/main/lib/dev-shell-shortcut.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb9ad0fb71f40e871640d93a39ba1aab1d97384f
sha256: 7d70fa25ca10e0e84348df3ed5e1db36ca7e5e7f0a12dd4d6b42cfba6e16bce1
lines: 24
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-shell-shortcut.test.ts

## 1. 测试目标

开发版 Windows Shell 快捷方式维护策略（源 `dev-shell-shortcut.ts` **不在本批**；测试经 `mock.module('electron')` 后动态 import）。describe `:10`。

## 2. 用例清单

**2 个 `test()`**：只在未打包的 Windows 开发运行时维护（`:11-17`）、开发身份与生产隔离的名称/AUMID（`:19-23`）。beforeAll mock electron（`:3-8`）。

## 3. 真实断言

- `:13-16` `shouldMaintainDevShellShortcut('win32',false)` `toBe(true)`；`('win32',true)`/`('darwin',false)`/`('linux',false)` `toBe(false)`。
- `:21-22` `DEV_APP_USER_MODEL_ID` `toBe('com.cdutai.studio.dev')`、`DEV_SHORTCUT_NAME` `toBe('CDUT Studio Dev.lnk')`。

## 4. 未覆盖与脆弱点

被测源跨批未读；快捷方式写入行为（shell.writeShortcutLink）仅 mock。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-24` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 维护条件/身份隔离 | 2 | covered |
