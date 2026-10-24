---
path: packages/shared/src/types/cslab.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32309436d0c36c559a7da2483982bcec4d4fb0fc
sha256: fa45aefb206d29b62bba8f3068b2c39193110edfd05edd4d293028b249d92029
lines: 1640
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/cslab.ts

## 1. 结论与边界

CDUT Science（CSLab）**中心契约**（`:1-6`）：177 个导出（1 const + 176 类型），覆盖授权遥测（历史契约）→ 实验室沙箱/数据铁笼/活体胶囊/论文文稿 → Phase 2-5 扩展（工具运行时/Zotero/数字化/公式/GraphRAG/规程批次/Canvas DAG/Vault/自定义工具/共享盘/HPC/晶体谱图/学术审稿/助理窗口）。`CSLAB_IPC_CHANNELS` 138 键（`:10-190`）是 CSLab 的 IPC 协议总表。

不做的事：纯声明（唯一值级代码是通道常量）；逻辑在 `apps/electron/src/main/lib/cslab/` 服务层与渲染层；不定义绘图文档/晶体扩展类型（兄弟文件 `cslab-origin-types.ts`/`cslab-vesta-types.ts`）。

## 2. 导出与关键符号

### 2.1 常量与派生类型

| 符号 | 行 | 形状 |
| --- | --- | --- |
| `CSLAB_IPC_CHANNELS` | `:10-190` | `as const` 对象，**138 键**全为 `'cslab:…'` 字面量；无重复键/值（程序化清点）。值派生规律 `cslab:<KEY 小写连字符>`，136/138 符合，2 例外（`ZOTERO_GET_STATUS='cslab:zotero-status'` `:62`、`ZOTERO_GET_BRIDGE_STATUS='cslab:zotero-bridge-status'` `:70`） |
| `CsLabChannelKey` | `:192` | `keyof typeof CSLAB_IPC_CHANNELS`（138 键名联合） |

通道分组（注释行）：授权遥测 9（`:12-20`）、实验室 9（`:23-31`）、数据铁笼 8（`:34-41`）、论文胶囊 11（`:44-54`）、环境能力 3（`:57-59`）、Zotero 9（`:62-70`）、文献 2（`:73-74`）、数字化 2（`:77-78`）、公式 2（`:81-82`）、GraphRAG 2（`:85-86`）、规程批次 8（`:89-96`）、Vault/Canvas 12（`:99-110`）、自定义工具 7（`:113-119`）、共享盘 8（`:122-129`）、HPC 11（`:132-142`）、晶体谱图 2+11（`:145-159`）、审稿 1（`:162`）、会话绑定 2（`:165-166`）、助理窗口 4（`:169-172`）、**主进程→渲染事件 15**（`:175-189`）。

### 2.2 类型导出（176 条，按域）

| 域 | 行段 | 符号（代表性） |
| --- | --- | --- |
| 历史遥测 | `:196-239` | `CsLabOperationalStatus:196`、`CsLabAuthStatus:199`、`CsLabAuthResult:205`、`CsLabTelemetry:210-221`、`CsLabNode:223-231`、`CsLabLogEntry:233-239` |
| 六维资产/能力 | `:244-305` | `CsLabLayerType:244-256`（**12 值**）、`CsLabLabStatus:258`、`CsLabPaneViewType:263`、`CsLabCapabilityKind:273`、`CsLabFileAction:282-299`（17 值）、`CsLabFileCapability:301-305` |
| 实验室 | `:330-405` | `CsLabLab:330-351`（置顶/归档语义注释 `:341-350`）、`CsLabCreateLabInput:353`、`CsLabDemoStats:362`、`CsLabDemoLabResult:372-379`、`CsLabAssetSummary:381-398`（`locked` Windows attrib +r `:392`、`unsupported?` 降级说明 `:396`）、`CsLabLabSnapshot:400-405` |
| 数据铁笼 | `:409-463` | `CsLabColumn:409`、`CsLabCellValue:415`、`CsLabTablePayload:417-430`（`revision` 绑定语义 `:428`）、`CsLabCellRef:432-442`（`tableRevision` 拖拽快照 `:440`）、`CsLabIngestRequest/Result/Progress:444-463`、`CsLabTableExportFormat/Result:307-314`、`CsLabAssetFileInfo:316`、`CsLabAssetDataUrl:321-328` |
| 活体胶囊 | `:467-496` | `CsLabCapsuleStatus:467`、`CsLabCapsule:469-481`（`revisionAtBind`）、`CsLabCapsuleLineage:491-496` |
| 论文/Docx | `:500-591` | `CsLabManuscript:507-514`、`CsLabSaveFileDialogResult:522-526`（**`saveToken` 一次性凭据** `:524`）、`CsLabSaveManuscriptAsIpcInput:539-541`（extends +saveToken `:538`）、`CsLabDocxSyncResult:567-585`（`documentXmlUnchanged` 仅 sync 有意义 `:574`）、`CsLabDocxImportResult:587-591` |
| 事件 | `:595-605`、`:888-896` 等 | `CsLabAssetChangedEvent`、`CsLabCapsuleStaleEvent`、`CsLabZoteroSyncedEvent`、`CsLabVaultChangedEvent`、`CsLabDagJobsCancelledEvent`、`CsLabShareStatusEvent`、`CsLabHpcJobEvent`、`CsLabStructureFocusedEvent` |
| 工具运行时 | `:609-645` | `CsLabPythonCapability:609-614`、`CsLabToolProfile:618`、`CsLabToolRuntimeStatus:625-633`、`CsLabToolDepsProgress:640-645`、`CsLabUvEnsureResult:1226-1231` |
| Zotero/文献 | `:649-743` | `CsLabZoteroAvailability:649`、`CsLabZoteroStatus:662-673`、`CsLabZoteroSyncOptions:684-689`、`CsLabZoteroSyncResult:691-700`、`CsLabLiteratureItem:704-721`、`CsLabZoteroAnnotation:723-743`（含页面旋转四向仿射 `:736`） |
| 数字化 | `:747-812` | `CsLabPlotDigitizeInput:765-773`、`CsLabDigitizedSeries:775-781`、`CsLabPlotDigitizeResult:788-796`、`CsLabDigitizedFigure*` |
| 公式 | `:816-849` | `CsLabFormulaVerifyInput:816-822`（`symbolDimensions` 映射 sympy.units `:820`）、`CsLabFormulaVerifyResult:831-842`、`CsLabFormulaOcrResult:844-849` |
| GraphRAG | `:853-884` | `CsLabLiteratureSearchInput/Hit/IndexStatus/SearchResult` |
| 规程/批次 | `:900-999` | `CsLabProtocol:914-924`、`CsLabRun:943-961`、`CsLabRunStatus:926`、Create/Update 输入族 |
| Canvas/DAG | `:1003-1117` | `CsLabCanvasMeta:1009-1020`（**snake_case 扩展键**，`manual_status` 永不 pruned `:1013`）、`CsLabCanvasDocument:1055-1059`、`CsLabCanvasWriteResult:1088-1096`（`durability: 'atomic'\|'in-place'\|'conflict-only'` `:1092`）、`CsLabDagEvaluation:1111-1117` |
| Vault | `:1121-1173` | `CsLabVaultNoteSummary:1123`、`CsLabVaultIndexStatus:1134`、`CsLabVaultSearchInput:1157` |
| 自定义工具 | `:1177-1231` | `CsLabCustomTool:1195-1203`（`source:'ast'\|'heuristic'`）、`CsLabCustomToolScan:1205-1211`、`CsLabCustomToolRunResult:1219-1224` |
| 会话绑定 | `:1235-1239` | `CsLabSessionLabBinding` |
| 助理窗口 | `:1244-1282` | `CsLabAgentContext:1252-1262`（`prompt` 预填不自动发送 `:1255`）、`CsLabAgentWindowInput:1265`、`CsLabPlotUndoResult:1278-1282`（`plot: CsLabPlotDocument` 唯一跨文件类型引用 `:1281`） |
| 共享盘 | `:1286-1366` | `CsLabShareLeaseType:1289-1293`（**证据等级红线** `:1288`：UI 不得把降级说成独占租约）、`CsLabShareSourceInput:1301-1314`（UNC/smb/webdav `:1306`）、`CsLabShareCandidate:1333-1349` |
| HPC | `:1370-1476` | `CsLabHpcProfileInput:1388-1400`、`CsLabComputeContract:1418-1434`（`jobKey` 对应 DAG `gpu_task_id` `:1421`）、`CsLabHpcJob:1444-1458`、`CsLabHpcMfaRequest:1460-1465` |
| 晶体/谱图 | `:1480-1579` | `CsLabMolAsset:1489`、`CsLabCrystalCell:1498-1507`（被 vesta 文件引用）、`CsLabTableSeries:1535`、`CsLabStructureSnapshotSubmitInput:1553-1562`（`error` 存在即拒绝等待请求 `:1560`）、`CsLabStructureSnapshotResult:1571-1579` |
| 学术审稿 | `:1583-1615` | `CsLabSuggestionPersona:1583`（5 值）、`CsLabSuggestionKind:1590`（**疑似孤立**，见矛盾④）、`CsLabReviewSuggestionKind:1591`、`CsLabReviewSuggestion:1593`、`CsLabReviewResult:1609` |
| Agent 提示词 | `:1627-1640` | `CsLabPromptAssetSummary:1627-1632`（`layerType: string` 松化，矛盾⑧）、`CsLabPromptLabInfo:1634-1640` |

## 3. 内部逻辑与关键流程

纯声明 + 1 常量对象（无函数/getter/正则/副作用，程序化验证）。语义链（注释级契约）：

1. **胶囊新鲜度**：`CsLabCapsule.revisionAtBind` vs 表 `revision` → `fresh/stale/orphan`（`:467`），`ON_CAPSULE_STALE` 事件（`:177`）推送。
2. **保存凭据**：`CsLabSaveFileDialogResult.saveToken` 一次性、必须在 `SAVE_MANUSCRIPT_AS` 回传（`:524`），IPC 层经 `CsLabSaveManuscriptAsIpcInput` 附加（`:538`）。
3. **Canvas 写入三态耐久**（`:1092`）：atomic 正常 / in-place Windows 占用降级 / conflict-only 只写冲突副本（`conflictRelPath`）。
4. **DAG 评估**：`CsLabDagEvaluation`（`:1111-1117`）给拓扑序/环/裁剪/被取消 job；`manual_status` 永不写 pruned（`:1013`）。
5. **共享盘证据等级**（`:1288`）：`leaseType` 是真实证据等级，UI 不得夸大。
6. **结构快照请求-回填**：`REQUEST_STRUCTURE_SNAPSHOT`（`:159`）下发 → 渲染截图 → `SNAPSHOT_STRUCTURE`（`:158`）回填；`error` 字段短路拒绝（`:1560`）。

## 4. 调用者与调用链

- preload `cslab` 命名空间（`preload/index.ts:4169-4528`，约 120 桥成员，逐通道映射见 nb-05b preload 手册）；main `lib/cslab/*` 服务（`main/index.ts:875` 等 dispose 链）；渲染层 CSLab 工作台。
- 出向：`CsLabPlotDocument`（`./cslab-origin-types`，`:8` 唯一 import，用点 `:1281`）。
- 被 `cslab-vesta-types.ts:7` 反向引用 `CsLabCrystalCell`（用点 `:74`/`:87`/`:98`）。
- `packages/shared/src/types/index.ts:115-117` 三个 cslab 文件 `export *` 转发，导出名零重叠（程序化比对）。

## 5. 数据 I/O、读写与副作用

纯类型 + 静态常量；无 I/O、无副作用。持久化/文件系统语义在注释（lab rootPath `:357` 缺省 `~/.cdutai/cslab-workspaces/{labId}`、vault/canvas 文件、共享盘 UNC）。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。失败/取消语义由枚举与注释承载：`CsLabShareCandidateState`（retry/quarantined）、`CsLabHpcJobState`（TIMEOUT/CANCELLED）、`CsLabCanvasWriteResult.durability` 降级、`cancelledJobIds`（`:1096`/`:1117`）、`CsLabIngestProgress.stage:'error'`。

## 7. 权限与权威状态

- **注释级契约红线**（照实转述）：`saveToken` 一次性凭据（`:524`）；`manual_status` 永不 pruned（`:1013`）；共享盘 lease 证据等级不得夸大（`:1288`）；`documentXmlUnchanged` 仅 sync 有意义（`:574`——类型 boolean 表达不了该约束）；`CsLabStructureSnapshotSubmitInput.error` 短路拒绝（`:1560`）。
- `locked`（`:392` Windows attrib +r）是资产只读权威；`CsLabTablePayload.revision`/`tableRevision`（`:429`/`:441`）是绑定一致性权威。

## 8. 修改影响面

138 通道改名需同步 preload `:4169-4528`/main 注册/渲染层；类型改动影响 CSLab 工作台全模块与 cslab 服务；`CsLabCrystalCell` 改动牵连 vesta 文件；`CsLabPlotDocument` 依赖 origin 文件。跨文件导出零重叠意味着新增导出若与兄弟文件同名会破坏 `export *`（需注意）。

## 9. 测试证据

无直接契约断言（`CSLAB_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中，属实）；`CsLabLab` **被 18 个测试文件 import type 作夹具消费**（`apps/electron/src/main/lib/cslab/cslab-*.test.ts` 17 个 + `packages/shared/src/utils/cslab-fuzzy-search.test.ts`；主根 grep -rl 复核=18）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 177 导出（1 const + 176 类型）、138 通道键值 | 已证实 | 文件全读（子agent 分 4 段逐行 + 主根抽查 `:8`/`:62`/`:70`/`:1281`/`:1590-1591`） |
| 通道值派生 2 例外 | 已证实 | `:62`、`:70` |
| 唯一跨文件类型引用 `CsLabPlotDocument` | 已证实 | `:8`、`:1281` |
| **矛盾①** 头注释覆盖范围不含 Phase 2-5（实际覆盖 `:607-1640`） | 已证实 | `:1-6` |
| **矛盾②** "六维科研资产" vs `CsLabLayerType` 12 值 | 已证实 | `:241`、`:244-256` |
| **矛盾④** `CsLabSuggestionKind:1590` 零引用（apps+packages 范围 grep），`CsLabReviewSuggestionKind:1591` 实用 | 已证实 | grep 结果 + `:1595` |
| **矛盾⑤** `plotId?`/`plotIds?` 新旧并存 | 已证实 | `:372-379` |
| **矛盾⑥** Canvas 元数据 snake_case（JSON Canvas 兼容） | 已证实 | `:1010-1018`、`:1023` |
| **矛盾⑦** `revision` vs `tableRevision` 命名不一 | 已证实 | `:429`/`:441` |
| **矛盾⑧** `CsLabPromptAssetSummary.layerType: string` 松化 | 已证实 | `:1630` |
| 通道在 main/preload 的实际 handler 匹配 | 未知 | 不在本批 |
| `CsLabSuggestionKind` 在仓外是否有消费者 | 未知 | grep 限 apps+packages |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 177 导出全量（域分组） | §2 | covered |
| 138 通道键值+2 例外 | §2.1 | covered |
| 6 条语义链 | §3 | covered |
| 跨文件关系 | §4 | covered |
| 注释级契约红线 | §7 | covered |
| 8 个矛盾 | §10 | covered |
| 测试/未知 | §9/§10 | covered |
