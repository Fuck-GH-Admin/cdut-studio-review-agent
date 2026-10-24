---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-cert-interstitial.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2cb5d6296cfcd9086ec0e5343781a6d894513f5a
sha256: 214788bdd9a2e122d5ff9c42dc429a694a9243909c663a9477bd13a5fd85b726
lines: 40
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-cert-interstitial.test.ts

## 1. 测试目标

智联万站证书阻断解析（describe `:18`）：命中登记返回小写主机+记录；无登记返回 null（普通网络失败不走证书插页）；URL 缺失/非法返回 null 不抛。被测：`resolveYanhuCertBlockTarget`。纯内存（`blockedRecord()` 构造 verifyProc 形态登记，`:8-16`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**3 test**：

1. `:19-28` 大小写混合 URL `https://MITM.Example.COM/path?x=1` → hostname `'mitm.example.com'`（小写）、`record` 同一引用（`toBe`）。
2. `:30-33` 同主机无登记（lookup 返回 undefined）→ `toBeNull`（注释“普通网络失败不走证书插页”）。
3. `:35-39` `null`/`''`/`'not-a-url'` 三输入 → 均 `toBeNull`（不抛异常）。

## 3. 真实断言

- #1 用 `toBe(record)` 断言引用同一登记对象（非拷贝）。
- #3 三种边界输入逐一断言——“失败一律 null”语义。

## 4. 未覆盖与脆弱点

**未覆盖**：lookup 抛异常路径（实现不捕获 lookup 异常——调用方契约）；hostname 空分支。

**脆弱点**：`blockedRecord` 硬编码 issuer 'emSign Root CA - G3'（eMudhra 泄露链口径）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、3 test、纯内存 | 已证实 | `:18`；`grep -c test(`=3 |
| 小写化+引用同一记录 | 已证实 | `:19-28` |
| 无登记/非法输入 null | 已证实 | `:30-39` |
| lookup 异常路径 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 命中登记 | #1 | `:19-28` | covered |
| 无登记 | #2 | `:30-33` | covered |
| 空/非法 URL | #3 | `:35-39` | covered |
