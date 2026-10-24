---
path: apps/electron/src/main/lib/cslab/cslab-iron-cage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 386c5189f981fdf28218d6422e3aab5b1d38f887
sha256: 54ccd867e8da0729236ed3aab2985c27876d0ebd7df456558b3459be2e8a99bc
lines: 678
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-iron-cage.ts

## 1. 结论与边界

CSLab **数据铁笼与多格式逆向摄取流水线**（`apps/electron/src/main/lib/cslab/cslab-iron-cage.ts:1-7`）：复制并渐进哈希→上只读锁→魔数嗅探→归一化二维矩阵→ZSTD Parquet+首屏预览→实体/血缘落库→广播事件。**红线**（`:8`）：解析失败**只登记 raw 资产并明确标注 unsupported，绝不生成伪造数据**。

边界：单文件 ≤512MB（`:64`）；预览仅首屏 500 行（超出回落 Parquet 行区间直读，`:478`）；文件名消毒+时间戳 nonce 防覆盖只读暂存。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabEventSink` | interface | 66-69 | ingestProgress/assetChanged 回调 |
| `IngestOptions` | interface | 194-196 | onProgress |
| `ingestFiles` | function | 201-440 | **摄取主入口**（逐个返回、单失败不影响其余，`:198`） |
| `listAssets` | function | 442-459 | 资产清单（noteLimit 截断） |
| `getAssetTable` | function | 461-481 | 只读表预览+元数据 |
| `getTableCell` | function | 483-500 | 单元格（预览→Parquet 直读回落） |
| `getAssetEntity` | function | 502-504 | 实体查询 |
| `resolveDerivedTableUri` | function | 506-522 | raw→table 血缘解析（**不在渲染层猜 URI**，`:511`） |
| `exportAssetTableToFile` | function | 535-563 | parquet 复制/csv RowGroup 流式 |
| `verifyAssetReadOnly`/`verifyAssetDigest` | function | 565-582 | 只读位/SHA-256 巡检 |
| `resolveAssetPath`/`getLayerTypeOf` | function | 584-592 | 路径/层类型 |

内部：`labDb/toAssetSummary/decodeText`（UTF-8 替换符 >2 回退 latin1，`:75-82`）、`parseBrml`（JSZip 按 rawdata/experiment 权重选 XML，`:84-127`）、`parseFile`（`:129-192`，格式分发+Python 增强通道 mat-v73/biologic-mpr）、`findTableUriFromRaw`（`:171-180`，血缘边→同名表兜底）、`parseTableColumns`（`:524-533`）。

## 3. 内部逻辑与关键流程

`ingestFiles`（`:201-440`）四分支+事务：

1. **PDF→文献**（vault/lit，`:244-296`）：同 SHA 复用既有 lit 资产；事务写 entity+literatureSource；「事务已提交：文件归实体所有，异常清理不再接管」（`stagedAbsPath=null` 语义）。
2. **分子/体数据→mol**（`:299-305`，ingestMolAsset 转发）。
3. **仪器数据→raw+table**（`:307-437`）：copyFileWithHash→同 SHA 复用→锁→嗅探（首 128 字节）→parseFile；`CsLabUnsupportedFormatError`→`unsupported` 字段登记（其余错误重抛）；有 dataset 时写 Parquet+preview，**同名表沿用既有 URI 推进 revision**（触发绑定胶囊 stale 呼吸灯而非孤立新表，`:375-378`）；事务写 raw+table+`derived_from` 边。
4. **异常清理**（`:430-436`）：未入库暂存解锁+删除（防只读孤儿文件）。

## 4. 调用者与调用链

出向：`jszip`、`node:fs/path/crypto`、`@profer/shared`（9 类型）、`./cslab-hash`（5 符号）、`./cslab-db`（13 符号）、`./cslab-paths`、`./cslab-uri`、`./cslab-columnar`（5 符号）、**`./cslab-formats/*` 六解析器全消费**（`:57-62`）、`./cslab-python`、`./cslab-mol`（`:12-63`）。入向（rg 全冻结树）：`cslab-share-watcher.ts:33`（ingestFiles）、`cslab-manager.ts:40`（listAssets）、`cslab-hpc.ts:58`（ingestFiles，回传落库）、`cslab-router.ts:107`（多符号）、多测试动态 import、`cslab/index.ts` 转发。

## 5. 数据 I/O、读写与副作用

vault/lit|raw|tables 三层写入+只读锁；SQLite 事务（central_meta.sqlite）；事件回调；console 无（进度走 sink）。

## 6. 分支、失败、取消与恢复

单文件失败→error 结果继续批内其余（`:198`）；暂存清理 catch 兜底；同 SHA 复用；无异步取消（逐文件串行）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:8`）：解析失败只登记 raw+unsupported，绝不伪造。

## 8. 修改影响面

- 摄取四分支/血缘语义是 CSLab 数据底座（capsule/graphrag/dataset-store 依赖）。
- revision 推进语义联动胶囊 stale 呼吸灯。
- 测试：iron-cage.test + dataset-store/canvas/graphrag/zotero 等批外测试动态 import。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-iron-cage.test.ts`（本批 112 行，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 诚实红线（unsupported 不伪造） | 已证实 | `:8,355-361` |
| 同 SHA 复用+同名表沿用 URI | 已证实 | `:331-346,375-378` |
| 暂存清理防孤儿 | 已证实 | `:206-208,430-436` |
| 血缘解析不猜 URI | 已证实 | `:511-522` |
| 预览 500 行回落 Parquet | 已证实 | `:478` |
| 真实仪器语料端到端 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 导出 | §2 | 66-592 | covered |
| 摄取四分支+事务 | §3 | 201-440 | covered |
| 查询/导出/巡检 | §2/§3 | 442-592 | covered |
