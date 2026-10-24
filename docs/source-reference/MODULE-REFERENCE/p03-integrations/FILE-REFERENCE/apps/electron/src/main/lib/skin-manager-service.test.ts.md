---
path: apps/electron/src/main/lib/skin-manager-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc9b6c9881d31645e3ea1d9bda6fda3f3f6e84b6
sha256: a5787c0f4a478ab86863402e25cf8a6eafddb612c08fe5fd952ab847dba7637c
lines: 103
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-manager-service.test.ts

## 1. 测试目标

`skin-manager-service.ts` 的 Windows 保留设备名防护与预览图体积上限（describe `:42/:80`）。electron mock（`:7-10`）+PROFER_CONFIG_DIR 隔离（**:12-14，安装绝不落真实 skins 目录**）。

## 2. 用例清单

2 个 describe + **8 个 `test()`**：保留名 test.each 6（con/prn/aux/nul/com1/lpt9 `:43-55`）、assets/con.png 拒（**:57-66，扩展名形式同样拦**）、正常皮肤放行（`:68-77`）、预览超 2MB 拒（`:81-91`）、限额内接受（`:93-102`）。夹具 `writePackage`（最小可安装包 `:19-40`）。

## 3. 真实断言

- `:49-50/:61-62` 保留名（id 与 asset 词干）→ `ok:false`、message 含 'Windows 保留设备名'。
- `:72-73/:97-98` 正常包 → `ok:true`、`skin.id` 一致。
- `:86-87` preview 3MB → message 含 '预览图不能超过 2 MB'。

## 4. 未覆盖与脆弱点

未覆盖：ZIP 导入全链、符号链接拒、路径穿越拒、auditSkinCss 失败。错误文案断言耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §3 | 已证实 | 逐行读 `:1-103` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 保留名防护 | 8 中 7 | covered |
| 预览限额 | 2 | covered |
| ZIP/符号链接/穿越 | — | unknown |
