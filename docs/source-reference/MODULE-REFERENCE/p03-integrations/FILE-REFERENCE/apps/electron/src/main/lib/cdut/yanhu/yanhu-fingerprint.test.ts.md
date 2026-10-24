---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 78eac2e7e6f47ea249401999986c6c3cce302686
sha256: 32b67c7d78b0de6aebc89557462a9d34e12901128acd77784bdd2e9574a0a4ca
lines: 95
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts

## 1. 测试目标

直接测试指纹三件套常量与脚本（对应规格书 7.1.3，`:2`）：UA/Client Hints 对齐 Chromium 133、注入脚本防侦测红线、零 Cookie 操纵原则、isCdutDomain 判定。8 个 `test(`，4 个 describe（`:18`/`:45`/`:70`/`:79`）。

## 2. 用例清单

无 mock/无 IO；`buildYanhuFingerprintScript()` 生成后断言内容（`:46`）。

| # | 行 | 被测 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:19-26` | UA 常量 | `CHROME_VERSION` `toBe('133.0.0.0')`、MAJOR '133'、UA 含 `Chrome/133.0.0.0`/Safari/537.36、`not.toContain` 'Electron'/'Profer' |
| 2 | `:28-34` | UA 平台 | darwin→Macintosh；否则 Windows NT 10.0; Win64; x64 |
| 3 | `:36-42` | Client Hints | sec-ch-ua 含 `Google Chrome";v="133`/Chromium、mobile '?0'、platform ∈ {'"macOS"','"Windows"'}、**`sec-ch-ua-platform-version` `toBeUndefined()`**（绝不主动发高熵） |
| 4 | `:48-62` | 注入脚本 | `not.toContain` webdriver/PDF Viewer/Chrome PDF Viewer/mimeTypes/**Function.prototype.constructor**/**window.eval**；`toContain` delete window.process/require/module |
| 5 | `:64-67` | 注入脚本 | `startsWith(';(')`、含 `catch (e) {}`（幂等 IIFE 永不抛） |
| 6 | `:71-76` + `:80-92` | 零 Cookie 原则（样例头断言）+ isCdutDomain 10 例 | Cookie 样例含 sMLAeTqisZbFP/JSESSIONID（不截断原则）；isCdutDomain 5 true/5 false（含 notcdut.edu.cn 拒绝） |

（用例 6 含第 4 describe 的 2 组断言：`:80-86`/`:88-94`。）

## 3. 真实断言

`toBe`/`toContain`/`not.toContain`/`toBeUndefined`——字符串级红线断言。无快照测试。

## 4. 未覆盖

- `applyYanhuSessionIdentity` 实际请求头注入（需 Electron Session）。
- `YANHU_USER_AGENT_METADATA` 字段断言（platform/bitness）。
- `STATIC_RESOURCE_TYPES` 白名单内容。
- 用例 6 的零 Cookie 断言为**样例对象自检**（不测真实流水线——照实记录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 防侦测红线由用例 4/5 锁定 | 已证实 | `:48-67` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| UA/版本 | §2 用例 1/2 | `:19-34` | covered |
| Client Hints 低熵 | §2 用例 3 | `:36-42` | covered |
| 脚本红线/幂等 | §2 用例 4/5 | `:48-67` | covered |
| 域判定/零 Cookie 原则 | §2 用例 6 | `:71-94` | covered |
| §4 边缘 | — | — | unknown |
