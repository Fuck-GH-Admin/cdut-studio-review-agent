---
path: apps/electron/src/main/lib/cslab/cslab-iron-cage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1be3c033385b56c71c4c6535160c5857fc7242cd
sha256: d0280fe70f44dba9cbdd9553e83ca5af5be43956e725903cafcf1c477d098d0d
lines: 112
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-iron-cage.test.ts

## 1. 测试目标

CSLab 数据铁笼摄取测试（`apps/electron/src/main/lib/cslab/cslab-iron-cage.test.ts:1-3`）：CSV 摄取全链（SHA-256/只读锁/Parquet 预览/实体落库）、同 SHA 幂等、同名表修正复用 URI 推进 revision、不支持格式诚实降级。被测 `ingestFiles`/`getAssetTable`/`getTableCell`/`listAssets`/`resolveAssetPath`。夹具：tmpdir+`PROFER_CONFIG_DIR`+createLab；CSV_V1/V2 两版数据（V2 值 9.99 修正）；afterAll 解锁清理。

## 2. 用例清单

共 **4 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 38-70 | CSV 摄取全链 | status ok、sha256 长 64、tableUri 真、raw 只读 true、表 3 行/locked/revision 1/首列 'Potential'、cell 'y1'[2]=1.35、raw+table 双层资产 | 独立（写 CSV_V1） |
| 2 | 72-79 | 同 SHA 幂等复用 | 二次摄取 status ok、资产数不变 | **依赖用例 1** |
| 3 | 81-93 | 同名表修正复用 URI 推 revision | 两次摄取 tableUri 相同、revision >1、rows[0][1]=9.99 | **依赖用例 2**（写 CSV_V2） |
| 4 | 95-105 | 不支持格式只登记 raw+降级 | status 'unsupported'、tableUri undefined、asset.unsupported 含 'mpr' | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:46-67` 12 断言（含 `toBe(1.35)` 单元格直读）；`:77-78`；`:88-92`；`:100-103`。

## 4. 未覆盖与脆弱点

- PDF/mol 分支由 cslab-literature.test 覆盖；MAT/SPC/XRD 二进制摄取不在此文件（cslab-formats.test 纯解析层）。
- 用例 2/3 严格串行依赖 1/2（顺序敏感）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test、全链+幂等+revision 语义 | 已证实 | 全文 |
| unsupported 诚实降级断言 | 已证实 | `:100-103` |
| 单元格 Parquet 直读 | 已证实 | `:62-63` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 摄取全链 | §2/§3 | 1 | covered |
| SHA 幂等 | §2/§3 | 2 | covered |
| 同名表 revision | §2/§3 | 3 | covered |
| unsupported | §2/§3 | 4 | covered |
| 二进制格式摄取 | §4 | — | unknown |
