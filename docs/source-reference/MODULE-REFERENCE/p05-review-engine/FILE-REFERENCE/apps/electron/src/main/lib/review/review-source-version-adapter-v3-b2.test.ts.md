---
path: apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0011844e2a2d6fdd7eb00abdfc1ea697d3700ea0
sha256: 1f0a0288283eab4f2bcfe613e0be6e7833344e754dff2b178277b79d55d781e2
lines: 158
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.test.ts

## 1. 测试目标

B-DOC-01/02/03：真实原始字节+核验块注册表消费、同名同字节不同物理源不互用、图像不冒充全读、PDF 无假几何、撤销后不能铸造、DOCX 序数/回退精度、坐标与指纹。

## 2. 用例清单

8 用例 / 2 describe。夹具：真 `ReviewB2StagingService`+手写 PDF/1px PNG 字节（:7-29）；`stage` 帮手（:30-35）；无 mock。

| describe | # | 用例（行） | 核心断言 |
| --- | --- | --- | --- |
| B-DOC-01/02 | 5 | TXT 全块+铸造（37-56） | `sourceForBlock` 铸造三字段、location paragraph；伪造块 `B2_SOURCE_BLOCK_UNVERIFIED`、旧 revision `B2_SOURCE_STALE` |
| | | 同名同字节不互用（57-74） | 块 ID/版本不同、rawSha256 相同；跨用拒；篡改候选 `B2_SOURCE_CANDIDATE_TAMPERED` |
| | | PNG partial 不冒全读（75-87） | `partial`、precision `file`、uncertainty 含 `visual inspection` |
| | | PDF 无假几何+扫描 partial（88-105） | 含 `Hello Review`；非 pdf-rect 块 location=file；空流 `partial` 0 块+error `/扫描\|OCR\|原件/` |
| | | 撤销 owner 拒铸造（106-114） | `B2_OWNER_INVALID_OR_REVOKED` |
| B-DOC-03 | 3 | DOCX 序数不虚构段落号（117-133） | `document-block`、`{docx-parser-block,parserBlockIndex:0}`、`paragraphIndex` undefined、uncertainty 含 `not verified` |
| | | 回退/坏表坐标降级（134-141） | `approximate`/file、`no verified parser`、image→`file` |
| | | 坐标+指纹绑定（142-157） | `sheet-cell` 精确、row 0→`approximate`；bbox→`pdf-rect`、越界→`approximate`；指纹随 readingOrder/状态/parseError 变化 |

## 3. 真实断言

如 §2 表（逐条读自 :37-157）；PDF 用例标注 30s 超时（:105）。

## 4. 未覆盖与脆弱点

- 未覆盖：`candidateReadExtent`、`compareCandidateSourceVersions`（bridge 侧间接）。
- 脆弱点：手写 PDF 与 document-service 解析行为耦合；`a` 上下文固定（:6）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §2 | 已证实 | 本文件逐行 |
| 注册表唯一铸造/精度不伪造被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| parse/sourceForBlock 守卫 | §2 | covered |
| locateB2ParserBlock 全精度 | §2 | covered |
| fingerprintB2ParserGeometry | §2 | covered |
| readExtent/版本过渡 | §4 | unknown（未测） |
