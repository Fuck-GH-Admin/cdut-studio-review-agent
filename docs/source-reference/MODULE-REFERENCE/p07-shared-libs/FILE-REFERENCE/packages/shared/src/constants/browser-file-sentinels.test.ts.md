---
path: packages/shared/src/constants/browser-file-sentinels.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2c920a3927c286a8b0055e0d088991cc7ecb95df
sha256: f64a82f3832366925a18fafeadb7e1bf49b72662d88286198ed84ceeb1783c22
lines: 69
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/browser-file-sentinels.test.ts

## 1. 测试目标

验证 `packages/shared/src/constants/browser-file-sentinels.ts` 的哨兵常量字面量、划词编码/解析往返与截断、畸形输入 fail-closed、证书插页哨兵解析。bun:test（`:1`），9 个被测符号经相对导入（`:3-13`）。NOT_RUN，只读断言。

## 2. 用例清单

共 **9 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例（标题） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 16 | 哨兵前缀覆盖两类且互不误伤 | — | 2 常量 toBe + parse(openUrl) toBeNull | 独立 |
| 2 | 22 | 划词往返：中文/换行/特殊字符 | `'第一段\n第二段 with spaces & symbols ?#%[]'` | `parse(encode(text))` | 独立 |
| 3 | 27 | 空选区也能回投 | `''` | `parse(encode(''))` toBe `''` | 独立 |
| 4 | 31 | 编码时截断到上限 | 2500 字 | `parse(encode(long))` 长度 2000 | 独立 |
| 5 | 38 | 解析侧再截一次 | 2010 字手工拼 URL | parse 长度 2000 | 独立 |
| 6 | 44 | 畸形百分号编码返回 null | `%E4%BD`、`%` | 2 次 parse toBeNull | 独立 |
| 7 | 49 | 非本协议一律 null | `https://…/%00`、`file:///etc/passwd`、`profer-selection:/typo` | 3 次 parse toBeNull | 独立 |
| 8 | 55 | 证书插页哨兵为标准 HTTPS 伪域名 | — | 3 常量 toBe 字面量 | 独立 |
| 9 | 61 | 证书哨兵解析 allow/back/非哨兵 | 6 个 URL（含 `?x=1` 查询、异 host、`/other`） | `parseCertInterstitialSentinel` | 独立 |

## 3. 真实断言

- `:17-19` `expect(BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL).toBe('profer-action://open-in-default-app')`、`expect(BROWSER_LOCAL_FILE_SELECTION_URL_PREFIX).toBe('profer-selection://')`、`expect(parseBrowserLocalFileSelection(BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL)).toBeNull()`。
- `:24` `expect(parseBrowserLocalFileSelection(encodeBrowserLocalFileSelection(text))).toBe(text)`。
- `:28` 空串往返 `toBe('')`。
- `:33-35` `toHaveLength(BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS)`（编码侧）。
- `:41` `toHaveLength(BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS)`（解析侧）。
- `:45-46` 2 次 `toBeNull()`。
- `:50-52` 3 次 `toBeNull()`。
- `:56-58` 3 常量字面量。
- `:62-67` `toBe('allow')`×2（精确+查询）、`toBe('back')`、`toBeNull()`×3。

## 4. 未覆盖与脆弱点

- `BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS === 2000` 的字面值无 toBe 断言（只用作长度期望，改常量不会红——会保持两侧同步失真）。
- `parseCertInterstitialSentinel` 对 `cert-allow` 带查询的**子串前缀**形态（如 `…/cert-allow-x`）无用例；实现只接受精确或 `?` 前缀（`browser-file-sentinels.ts:75-76`），`cert-allow-x` 会返回 null——行为与用例一致但未测。
- 编码侧截断后 2001-2500 字段的边界只测 2500；恰好 2000/2001 无用例。
- 无「非字符串输入」用例（TS 类型层约束）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例结构与断言清单 | 已证实 | `:15-68` |
| 双侧截断均有实测断言 | 已证实 | `:31-42` |
| 畸形编码不抛、返回 null | 已证实 | `:44-47` |
| 证书哨兵查询宽容、异路径不误伤 | 已证实 | `:61-68` |
| 2000 字面值无锁定断言 | 已证实（核对用例） | `:32-34` 仅作长度期望 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| 两协议常量 + 互不误伤 | §2/§3 | 1 | covered |
| `encodeBrowserLocalFileSelection` | §2/§3 | 2,4 | covered |
| `parseBrowserLocalFileSelection`（往返/截断/null） | §2/§3 | 2,3,4,5,6,7 | covered |
| 证书三常量 | §2/§3 | 8 | covered |
| `parseCertInterstitialSentinel` | §2/§3 | 9 | covered（`cert-allow-x` 边界 partial） |
| 2000 字面锁定 | §4 | — | unknown |
