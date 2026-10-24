---
path: apps/electron/src/main/lib/review/report-service-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d3b177e19e5432ebf6311a1c2fe0e0dcef74df2
sha256: 96a235dccad888c66991e67dc4e0a5bca2b4c6f9e0df942ad2a0ee45ffccd497
lines: 136
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/report-service-v2.ts

## 1. 结论与边界

M4 报告与离线往返（头注 :1-8）：①学生反馈只含 public 字段与公开意见，`internalNotes` 绝不出学生报告（A15）；②评委矩阵面向组织者（含内部评语列）；③离线包 canonical JSON sha1 随包，导入先验哈希（防篡改），外部版本不符 → conflict（C02）。

边界：纯投影/纯函数（无盘/网）；运行选择、受众授权、落盘在 `report-export-v2-service`/`review-v3-report-snapshot`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CaseFeedback` | interface | 18-24 | 学生视角反馈形状 |
| `buildCaseFeedback` | fn | 27-49 | public 字段投影（A15） |
| `RatingMatrixRow` | interface | 51-59 | 组织者矩阵行（internalNotes/publicFeedback 分列） |
| `buildRatingMatrix` | fn | 62-81 | 评委矩阵（A14/A15） |
| `HandoffPackage` | interface | 85-91 | 离线包（`contentHash`） |
| `canonicalHash` | fn | 93-95 | `sha1(JSON.stringify(value))` |
| `exportHandoffPackage` | fn | 97-104 | 打包（pkg-id+hash+时间戳） |
| `ImportOutcome` | type | 106-108 | ok/receipt 或 `HASH_MISMATCH|CONFLICT` |
| `importHandoffPackage` | fn | 111-136 | 先验哈希 + 版本校验 + SyncReceipt |
| `CaseAggregate`/`RankingEntry` | re-export | 14 | 来自 `./judging-service` 类型 |

## 3. 内部逻辑与关键流程

1. **`buildCaseFeedback`**（:27-49）：决定取 `at` 最新一条（:33）；items 逐 subject 过滤 `(templateFieldVisibility[key] ?? 'public')==='public'`（:44，缺省 public）；值展开 `.value`（:45）。
2. **`buildRatingMatrix`**（:62-81）：每案卷聚合→行；评分过滤 `assignments` 匹配且 `!assignment.recused`（:71，**回避者评分不入矩阵**）；`internalNotes` 只收非空 trim（:77）；rank 来自 ranking map（:74）。
3. **`canonicalHash`**（:93-95）：sha1(JSON.stringify)——键序敏感（无排序规范化；同结构异键序会得不同 hash，边界如实记录）。
4. **`exportHandoffPackage`**（:97-104）：`pkg-{ms}-{rand4}`。
5. **`importHandoffPackage`**（:111-136）：hash 不符 → `HASH_MISMATCH` `离线包内容与哈希不符…（C01）`（:115-117）；`expectedExternalRevision` 与包内 `externalRevision` 不符 → `CONFLICT` `外部系统版本已推进…（C02）`（:118-124）；通过 → `SyncReceipt`（`status:'accepted'`，externalSystem `'offline-package'`，:125-134）。

## 4. 调用者与调用链

入向（生产）：`report-export-v2-service.ts:33`（`buildCaseFeedback`，动态 require）；`offline-roundtrip.ts:16`、`external-ports.ts:15`（exportHandoffPackage/importHandoffPackage）。测试：`report-service-v2.test.ts:6`。`buildRatingMatrix`/`canonicalHash`（除本文件内部）**生产零消费者**（全树检索）。出向：`@profer/shared` 类型（:11）、`./judging-service` 类型（:12）、`node:crypto`（:10）。

## 5. 数据 I/O、读写与副作用

纯函数；无盘/网/日志。

## 6. 分支、失败、取消与恢复

无 throw；导入失败经 `ImportOutcome` 表达（HASH_MISMATCH/CONFLICT）；无取消概念。恢复语义由调用方决定是否重导。

## 7. 权限与权威状态

- 可见性权威：internalNotes 只进组织者矩阵，学生报告仅有 public 字段（A15；:27-49/:62-81）。
- 回避权威：`recused` 评分不入矩阵（:71）。
- 完整性权威：sha1 先验哈希防篡改（C01）；外部版本冲突显式拒绝（C02），不静默合并。
- 无 sender/role 检查（受众授权在 report-export-v2 的 snapshot 层）。

## 8. 修改影响面

- `offline-roundtrip`/`external-ports` 的离线包契约（hash 算法变更即破坏兼容）。
- `buildCaseFeedback` 被 `report-export-v2-service` 消费（学生版报告正文）。
- 同测：`report-service-v2.test.ts`（5 用例）。

## 9. 测试证据

直接测试 `report-service-v2.test.ts`（5 用例 / 3 describe；纯函数；NOT_RUN）：
1. `:15-20` public 投影：`publicFields['declaredScore']===6`、`internalMemo` undefined、decision result `pass`。
2. `:25-37` 矩阵：`internalNotes[0].note==='倾向照顾'`、`publicFeedback[0].feedback==='表现优秀'`、`rank===1`。
3. `:43-47` 原样导入 → `ok` true。
4. `:49-55` 篡改 payload → `HASH_MISMATCH`。
5. `:57-62` 外部版本 3→4 → `CONFLICT`。

未覆盖：`recused` 过滤、canonicalHash 键序边界、SyncReceipt 字段断言；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/行号如 §2 | 已证实 | 逐条 |
| A15 内外分列/回避过滤 | 已证实 | :44/:71 + 测试 :15-37 |
| C01/C02 防篡改/冲突 | 已证实 | :115-124 + 测试 :43-62 |
| `buildRatingMatrix` 生产零消费者 | 已证实（否定） | 全树检索 |
| canonicalHash 键序敏感性影响 | 推断 | `JSON.stringify` 无排序（:94） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildCaseFeedback` | §3.1/§9 | 27-49 | covered |
| `buildRatingMatrix` | §3.2/§9 | 62-81 | covered（recused 未测） |
| `canonicalHash`/export/import | §3.3-3.5/§9 | 93-136 | covered |
| SyncReceipt 字段/键序边界 | §9/§10 | 125-134 | partial（未测） |
