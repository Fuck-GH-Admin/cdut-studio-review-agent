---
path: apps/electron/src/main/lib/skin-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eee8576e662f33b4dfdcd7dc4adab8ecb4be56e7
sha256: 3868298709c083a2ddd56a293ccf32fdb5f2968ea7c9b6a22ea633ba8bdd4d50
lines: 59
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-service.test.ts

## 1. 测试目标

直接测试 `skin-service.ts` 的 `parseSkinManifestText`/`readManifest`——**manifest Surface Contract 版本**语义（1 个 describe `:28`）：v1 兼容归一、v2 透传、无效值降级。2 个 `test(` + 1 个 `test.each`（6 参数化子例）。electron 最小 mock（`:7-10`）。

## 2. 用例清单

| # | 行 | Given/When/Then | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:29-41` | v1 manifest（无 contractVersion）→parse + readManifest | `parsed.ok toBe(true)`；`toMatchObject({id:'legacy-skin', tone:'dark', contractVersion:1, builtin:false})` |
| 2 | `:43-52` | contractVersion:2→readManifest(dir,true) | `toMatchObject({id:'v2-skin', tone:'light', contractVersion:2, builtin:true})` |
| 3 | `:54-58` | `test.each([0,1,-1,1.5,'2',null])` 无效值→readManifest | `contractVersion toBe(1)`（每子例） |

真实 fs（mkdtemp 临时目录，helper `withSkinManifest:14-26`）。

## 3. 真实断言

`toBe`/`toMatchObject`/`test.each` 参数化。无快照测试。

## 4. 未覆盖

- `auditSkinCss` 安全审计核心、`getSkinCss` 缓存链、协议 handler、`scanSkins`/`invalidateSkinCache` 全部零覆盖（skin-service 手册 §9）。
- readManifest 边界（符号链接拒/id≠basename/titlebar 默认）；parse 失败分支（BOM/非 JSON/缺 id/tone 非法）。
- contractVersion ≥3 整数透传、2.5→1 等残余边界。
- 本文件**未设 PROFER_CONFIG_DIR**（姊妹文件设了；因被测函数不触配置路径而安全——隔离不对称照实记录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 项断言（2 test+1 test.each 6 例） | 已证实 | 文件全读（59 行） |
| 用例 2 标题"传入注册表"略超前（实际断言 readManifest 单层） | 已证实 | `:43` vs `:45-50`（照实） |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| v1 归一 | §2 用例 1 | `:29-41` | covered |
| v2 透传 | §2 用例 2 | `:43-52` | covered |
| 无效降级 | §2 用例 3 | `:54-58` | covered |
| §4 边缘 | — | — | unknown |
