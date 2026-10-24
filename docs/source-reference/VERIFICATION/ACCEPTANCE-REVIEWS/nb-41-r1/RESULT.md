# NB-41-R1 返修复验报告（rN 独立验收）

- 批：nb-41-r1（revisionOf nb-41，18 文件/3774 行）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-41-r1/` 封版字节（sealId `seal-ddafb7f16ba43850`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：revision_required（窄）** —— 17 accepted / 1 revision_required / 0 unknown。
- 测试/构建/真实模型：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链 MANIFEST→READY→DONE→ZIP 实算一致；ZIP 21 条目无穿越/无 READY-DONE、逐条目==盘上；源绑定 18/18；manualSha256 18/18 无 drift；**rN 证据链**：before/ 全 18 篇 == 父批 r0 字节（sha256 实算）；changes.diff 为 before/→after/ delta、触达 13 文件==变更集 13（精确相等）、重放 18 文件逐字节==stage；人工列 18/18；元数据 18/18。

## G1 格式：PASS（带名引用抽查+G2 全量对照无越界）

## G2 返修复核：PARTIAL（17 accepted / 1 revision_required）
13 篇变更逐篇复核（8 findings 逐条回源 + 5 计数校准 grep 实测）；5 篇未变更 byte-identical==父批（evaluator/dataset.test/2×tsconfig/benchmark package.json）。

### 8 findings 落实情况（全部实质改正，校正注保留「QA F-NB41-xx 校正」溯源）
- F-NB41-01 server 路由表：已按 `server.ts:74-204` 重写（`/api/datasets/download` JSON 直返、`/api/run` SSE 四事件、`POST /api/export`；`GET /api/report*` 明示不存在）✓
- F-NB41-02 index.html：fetch+ReadableStream 手工帧解析（:250-266）、renderReport/renderDetail 实名、exportReport=POST /api/export ✓（EventSource/虚构路由仅存于"已删/不存在"校正注）
- F-NB41-03 零消费者：pkg-PC 与 graph-query 均换真实消费者清单（ipc.ts:4417、pi-harness 11 源+5 测试、project-graph-service、graph-atoms）✓
- F-NB41-04：formatNodeDetail→formatTaskContext（graph-query:604-636，graph-parser 同步）✓
- F-NB41-05：RAW_QUERIES:191 未导出、3 导出面已改正 §2/:29 ✓（**残留见下**）
- F-NB41-06：dataset-loader/report 路由引用已改 ✓
- F-NB41-07..11 计数：task 16 / metrics 11+26 / runner 9 / types 9 / metrics.test 26 全部 grep 校准 ✓

### 退回（revision_required，1 篇）
| 文件 | finding |
| --- | --- |
| `benchmark-multihop/src/dataset.ts.md` | **F-NB41R1-01（minor）**：F-NB41-05 残留未闭合——§10 已证实表 `:66` 行仍称「4 导出、18/50 组成」，与本文 §2 改正的「共 3 个导出」**自相矛盾**（源实测 3 导出）。单格修订即可。 |

### 非阻断备注
N-NB41R1-01（low）：FINDINGS-RESPONSE.md 末段"未改动文件"列举名笔误（误列 prompt-chain——非本批；漏列 evaluator.ts.md）；「13 篇已改」结论与实测一致。

### 处置
17 篇 accepted 按 `reviews/nb-41-r1/REVIEWED-HASHES.json` exact manualSha256 合入（**取代 r0 对应行**）；dataset.ts.md 单格修订开 nb-41-r2。作者返修过程如实记录工具截断臆想/静默零命中两类教训，值得肯定。证据：`reviews/nb-41-r1/{RESULT.json,REVIEWED-HASHES.json,DONE.json}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
