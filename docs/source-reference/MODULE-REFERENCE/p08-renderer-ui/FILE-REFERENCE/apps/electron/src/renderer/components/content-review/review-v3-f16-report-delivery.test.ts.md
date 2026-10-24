---
path: apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e298879070933997257029be2e80e50e7c5d2e3
sha256: 6ccf310ac8735908f0fba4f4f90f79a0c12a19b7844b7a10cf42e7d11ad4580e
lines: 86
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.test.ts

## 1. 测试目标

**F16 只读交付**（`apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.test.ts`）：清单绑定 Run/受众与实际字节 SHA-256、拒缺文件/重复名/不安全路径、公式中和、真实 ZIP 校验、真实多 sheet XLSX。

## 2. 用例清单

5 test（无 describe）。夹具 `reportFixture(audience, stale)`（`:7-14`）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 清单绑定 Run/受众与 SHA-256 | `schema/kind/runId/audience/inputHash/template('template-1@2')/historical/exportedAt`；`files[0]` sha256=`ba7816bf…`（abc）；notice 含「不是数字签名」 | `:16-33` |
| 2 | 拒缺文件/重复名/不安全路径/不一致 | 空→「没有可导出」；`report.md`+`REPORT.MD`→「重复」；`../source.pdf`→「非法」；runId 不符→「不一致」 | `:35-45` |
| 3 | 公式中和 | `=1+1`→`'=1+1`、`@SUM`→`'@SUM`、`+cmd`→`'+cmd`；原对象不改（`:52`） | `:47-53` |
| 4 | 真实 ZIP 校验 | 4 条目（README/manifest/report.json/report.md）；report.md 内容一致；manifest 2 文件且 sha256 与实际 digest 一致；README 含「不构成业务审批」；换正文→「不一致」 | `:55-71` |
| 5 | 真实多 sheet XLSX+公式不编码 | SheetNames 5 个（报告概览/检查与来源/原件版本/事项字段/补件清单）；`D2.t==='s'`、`f===undefined`、`v` 含 HYPERLINK | `:73-86` |

## 3. 真实断言

- `expect(manifest.files[0]).toEqual({ name: 'report.md', size: 3, sha256: 'ba7816bf…15ad' })`（`:30-31`）。
- `expect(detail.f).toBeUndefined()`（`:84`）。
- `expect(original.rows[1]?.[0]).toBe('=1+1')`（`:52`，原对象不变）。

## 4. 未覆盖与脆弱点

- 未覆盖：`encodeF16ReportWorkbook` 列宽/样式。
- 脆弱点：sha256 硬编码断言（abc 哈希）绑定标准实现。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例覆盖清单/拒绝/中和/ZIP/XLSX | 已证实 | `:16-86` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 清单绑定 | 1 | `:16-33` | covered |
| 四类拒绝 | 2 | `:35-45` | covered |
| 公式中和 | 3 | `:47-53` | covered |
| ZIP 校验 | 4 | `:55-71` | covered |
| XLSX | 5 | `:73-86` | covered |
