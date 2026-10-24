---
path: apps/electron/src/main/lib/cslab/cslab-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 651d2f30e26a3ef2e081530c49fb0c9684a96d7f
sha256: c5ea566daf30f176827aedeb6dd12fa2a8e97e6af9fde736f0ba6fbaf396e27c
lines: 1948
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-router.ts

## 1. 结论与边界

CSLab **IPC 路由与分发层**（运行时代码）：集中注册 122 个 `CSLAB_IPC_CHANNELS.*` 处理器，「严格收敛于 cslab 隔离目录，由 main/ipc.ts 单点挂载。所有渲染进程输入必须先做类型与路径校验」（文件头 `apps/electron/src/main/lib/cslab/cslab-router.ts:1-5`）。三类核心职责：①统一硬门禁包装（未解锁拦截，`:255-268`）；②渲染输入校验/规范化（`asString*`/`asObject`/`asAgentContext`/`asProfile`）；③把 IPC 请求分发到 cslab 各业务模块并把事件广播回所有窗口。

边界：不含业务实现（全部委托 `cslab-manager`/`cslab-iron-cage`/`cslab-manuscript`/`cslab-zotero`/`cslab-vault-index`/`cslab-graphrag-router`/`cslab-runs`/`cslab-canvas-sync`/`cslab-hpc`/`cslab-share-watcher`/`cslab-science` 等 30+ 模块）；通道名常量定义在 `apps/electron/src/main/lib/cslab/cslab-types.ts`（`CSLAB_IPC_CHANNELS`）；挂载点唯一：`apps/electron/src/main/ipc.ts:147` 导入、`:6223` 调用 `registerCsLabIpc()`；门禁实现 `assertCsLabUnlocked` 在 `cslab-security.ts`（导入块 `:80-86`；`:69-77` 为 cslab-science 导入块）。

## 2. 导出与关键符号

**唯一导出**：`registerCsLabIpc(): void`（`:391`），注册 122 个 handler（`ipcMain.handle(` 计数 122 处，均为注册调用、逐处对应唯一通道名；`:258-268` 包装对象的方法定义文本为 `handle(`，不计入该字符串）。

关键内部符号：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AUTH_EXEMPT_CHANNELS` | 225-232 | 门禁豁免 5 通道：GET_AUTH_STATUS/INIT_PASSWORD/VERIFY_PASSWORD/VERIFY_KEY/LOCK_SESSION |
| `SAVE_TOKEN_TTL_MS`/`pendingSaveTokens` | 234-235 | 另存为一次性令牌（60s，Map） |
| `broadcastSessionUpdated` | 238-247 | 向所有窗口发 `AGENT_IPC_CHANNELS.STREAM_EVENT` 的 `session_updated` |
| `normalizeSavePath` | 249-253 | win32 小写归一比较 |
| `ipcMain`（包装对象） | 258-268 | `handle` 统一注入 `assertCsLabUnlocked()` |
| `asString`/`asStringArray`/`asNumber`/`asObject` | 270-293 | 输入校验器（无效抛 `<label>无效`） |
| `CSLAB_IMAGE_MIME`/`CSLAB_IMAGE_MAX_BYTES` | 295-307 | 图片 MIME 白名单（8 扩展名）/32MB 上限 |
| `sniffPngSize`/`sniffGifSize`/`sniffJpegSize`/`sniffImageSize` | 309-347 | 二进制画幅嗅探（PNG 魔数/GIF87a-89a/JPEG SOF 段） |
| `toSafeFileName` | 349-353 | 文件名非法字符替换 `_` |
| `createShareSink` | 355-377 | 共享盘事件出口（广播状态/资产/胶囊陈旧） |
| `createHpcSink` | 379-389 | 超算事件出口（作业状态/MFA 挑战） |
| `asAgentContext` | 1915-1941 | 助理上下文规范化（source 白名单 plot-roi/asset/manual） |
| `asProfile` | 1943-1948 | 工具 profile 白名单（plot/formula/formula-ocr/instrument） |

## 3. 内部逻辑与关键流程

### 3.1 硬门禁（`apps/electron/src/main/lib/cslab/cslab-router.ts:255-268`）

包装 `ipcMain.handle`：`electronIpcMain.handle(channel, async (event,...args) => { if (!AUTH_EXEMPT_CHANNELS.has(channel)) assertCsLabUnlocked(); return listener(event,...args) })`。注释明示设计意图（`:255-257`）：只改注册入口不逐个改 handler，新增通道**默认受保护**。豁免仅门禁自身 5 通道（`:225-232` 注释：未解锁也必须可用，否则无法首次设密/验密）。除 `assertCsLabUnlocked` 外**无 sender/role 校验**（handler 均忽略 `_event`，少数用 `event.sender`/`BrowserWindow.fromWebContents(event.sender)` 定位窗口弹对话框，`:642/:841/:1790`）。

### 3.2 按组分发（122 handler，行号=注册行）

**门禁与遥测（`:393-424`）**：GET_AUTH_STATUS→`getCsLabAuthStatus`；INIT_PASSWORD/VERIFY_PASSWORD/VERIFY_KEY（兼容旧通道，语义同 VERIFY_PASSWORD）→`initCsLabPassword`/`verifyCsLabPassword`（参数非 string 返回 `{success:false, message:'无效的密码参数类型'}`）；LOCK_SESSION→`lockCsLabSession`；GET_TELEMETRY/GET_NODES/GET_LOGS/PING→`csLabService.*`。

**实验室沙箱（`:427-509`）**：LIST_LABS→`listLabs`；CREATE_DEMO_LAB→`createDemoLab`；CREATE_LAB→`createLab`（校验 name/可选 description/tags/rootPath）；OPEN_LAB（`:450`）→`openLab` + **副作用链**：`onCsLabOpened`（切换实验室使上一实验室 Python 工具免审批信任失效）→ 后台 `rebuildVaultIndex`（不阻塞首屏，失败 warn）→ `startShareWatcher`（已登记源自动恢复）→ `rehydrateHpcJobs`（找回 JobID/状态）→ 返回 `getLabSnapshot`；GET_LAB_SNAPSHOT/RENAME_LAB/DELETE_LAB（`:489`，先 `closeCsLabAgentWindowForLab` 释放 Chromium 句柄再 `deleteLab`，对解绑会话逐一 `broadcastSessionUpdated`）/TOGGLE_PIN_LAB/TOGGLE_ARCHIVE_LAB。

**数据铁笼（`:516-642`）**：INGEST_FILES（`:516`，进度经 `ON_INGEST_PROGRESS` 广播，成功逐条 `ON_ASSET_CHANGED`，尾部 `checkStaleness` 广播 `ON_CAPSULE_STALE`）；LIST_ASSETS（noteLimit 500 防万篇过 IPC）；GET_ASSET_TABLE/GET_TABLE_CELL/RESOLVE_DERIVED_TABLE/GET_ASSET_FILE_INFO（资产不存在/无本地文件抛错）；GET_ASSET_DATA_URL（`:612`）：MIME 白名单（未知扩展名拒绝）→ `resolveAssetPath` → 32MB 上限 → 读文件 → `sniffImageSize` 返回 dataUrl/宽高；EXPORT_TABLE（`:642`）：仅 `parquet|csv`、仅本实验室 `layerType==='table'`，`dialog.showSaveDialog`（取消返回 `{success:false, message:'已取消导出'}`）→ `exportAssetTableToFile`。

**论文与胶囊（`:677-970`）**：LIST_MANUSCRIPTS/CREATE_MANUSCRIPT/GET_MANUSCRIPT/SAVE_MANUSCRIPT（保存后 `checkStaleness` 广播）；EXPORT_DOCX（`:729`，`runOoxmlTask{type:'export'}` → `writeExportDocx`，message 区分「已建立同步副本/原 Word 未改动」）；SYNC_DOCX（`:774`）：**只允许同步长期链接副本**——`record.docxPath` 若与 `getLinkedDocxPath` 不等即抛 `'同步目标必须是与文稿关联的 Word 副本；外部路径不会被写入'`（防「读 A 写 B」）；`runOoxmlTask{type:'sync'}` → `writeLinkedDocx`，message 汇总 updated/added/removed/missingDataBinding 计数；SHOW_SAVE_FILE_DIALOG（`:841`）：弹保存框后**签发一次性令牌** `randomUUID`（清过期防 Map 无界），返回 `{filePath, saveToken}`；SAVE_MANUSCRIPT_AS（`:868`）：**令牌单次有效**——先 `delete` 再校验（`:868-880` 防重放），`entry.expiresAt` 过期或 `normalizeSavePath(entry.path) !== normalizeSavePath(targetPath)` 抛 `'未授权的保存目标路径，必须经由系统文件对话框选定'`；IMPORT_DOCX（`:900`）：仅 `.docx`、64MB 上限 → `runOoxmlTask{type:'import'}` → `createManuscript`+`saveManuscript`（胶囊初始 `status:'orphan'`、需重绑数据表）→ `attachDocx`；UPDATE_CAPSULE/GET_CAPSULE_LINEAGE。

**环境能力（`:983-992`）**：GET_PYTHON_CAPABILITY/GET_TOOL_RUNTIME/INSTALL_TOOL_DEPS（`ensureToolEnvironment` 进度经 `ON_TOOL_DEPS_PROGRESS`）。

**Zotero（`:1004-1099`）**：GET_STATUS/DISCOVER/SET_DATA_DIR（成功广播 `ON_ZOTERO_STATUS`）/SYNC（`:1039`，同步后广播 `ON_ZOTERO_SYNCED`+`ON_ZOTERO_STATUS`，支持 `forceFull`）/LIST_LITERATURE/LIST_ANNOTATIONS/START_WATCH（回调里广播 SYNCED+STATUS）/STOP_WATCH/GET_BRIDGE_STATUS。

**文献阅读（`:1104-1116`）**：GET_LITERATURE_ITEM；GET_LITERATURE_URL（`:1116`）：`getLiteratureFilePath` 无路径抛 `resolved.reason ?? '文献文件不可用'`；`registerProferFilePath(resolved.path)` 注册本地文件协议 URL（出向 `../local-file-protocol`）。

**图表逆向数字化（`:1140-1160`）**：DIGITIZE_PLOT（`imageDataUrl` 必填、`mode` 仅 `line|scatter`）→ `digitizePlot`；SAVE_DIGITIZED_FIGURE→`persistDigitizedFigure`。

**公式（`:1174-1183`）**：OCR_FORMULA/VERIFY_FORMULA（`latexLhs`/`latexRhs` 必填）。

**跨文献 GraphRAG（`:1198-1207`）**：BUILD_LITERATURE_INDEX（`force===true`）→ `buildLiteratureIndex`；SEARCH_LITERATURE → `searchLabLiterature`。

**实验规程与批次（`:1225-1321`）**：RUN_LIST_PROTOCOLS/RUN_CREATE_PROTOCOL/RUN_UPDATE_PROTOCOL/RUN_LIST/RUN_CREATE/RUN_UPDATE/RUN_LINK_ASSET/RUN_UNLINK_ASSET；link/unlink 校验 `relation` 仅 `consumes|produces`；create/update/link/unlink 均广播 `ON_ASSET_CHANGED`（kind created/updated，revision 0）。

**Vault 笔记与 Canvas（`:1343-1426`）**：VAULT_LIST_NOTES/READ_NOTE/SEARCH/BACKLINKS/INDEX_STATUS/REBUILD_INDEX（完成后广播 `ON_VAULT_CHANGED`）/START_WATCH（回调广播）/STOP_WATCH；CANVAS_LIST/CREATE（广播 created）/READ/WRITE（`:1426`）：`document.nodes/edges` 必须为数组，`writeCanvas` 支持 `expectedMtimeMs` 乐观并发；冲突时 `relPaths` 含 `conflictRelPath`；`cancelledJobIds` 非空时广播 `ON_DAG_JOBS_CANCELLED` 并 `void cancelHpcJobsByKeys`（死路剪枝尽力取消远程作业，失败不影响画布保存）。

**自定义工具与 uv（`:1459-1505`）**：CUSTOM_TOOL_LIST/REFRESH（广播 `ON_TOOLS_CHANGED`）/RUN（`runLabTool(payload, {source:'ipc'})`）/GET_TOOL_TRUST（无 `cslabLabId` 返回 false）/START_WATCH/STOP_WATCH/ENSURE_UV（`confirmUntrustedInstall: confirmUvUntrustedInstall` 未信任安装确认钩子）。

**共享盘（`:1512-1571`）**：LIST/ADD（label 默认'仪器共享盘'，可选 include/quietSeconds/pollSeconds/username/password）/REMOVE/TEST/SCAN_NOW/START_WATCH（`createShareSink`）/STOP/LIST_CANDIDATES。

**超算 HPC（`:1580-1709`）**：LIST_PROFILES/SAVE_PROFILE（scheduler 仅 `slurm|pbs|lsf`；bastion 嵌套校验）/DELETE/TEST_CONNECTION/SUBMIT_JOB（inputs 过滤形状并 `.slice(0,32)` 限 32 个）/LIST_JOBS/CANCEL_JOB/REFRESH_JOB/HARVEST_JOB/REHYDRATE/ANSWER_MFA（`{ok: answerHpcMfa(requestId, value)}`）；作业链路统一走 `createHpcSink()` 广播 `ON_HPC_JOB`/`ON_HPC_MFA`。

**晶体/谱图/科学引擎（`:1717-1790`）**：GET_MOL_ASSET/GET_TABLE_SERIES/ANALYZE_CRYSTAL/SIMULATE_PXRD/FIT_PEAKS（`fitPeaksService(input as CsLabFitRequest)` **透传不校验**）/SMOOTH_SERIES（同）/GET_VOLUME_GRID/SAVE_PLOT/LIST_PLOTS/LOAD_PLOT/EXPORT_FIGURE（`:1790`，格式白名单 `svg|pdf|png|tiff`，对话框取消**抛** `'已取消导出'`——与 EXPORT_TABLE 的取消返回结构不同，照实记录）。

**快照/审稿/绑定/助理窗口/撤销（`:1817-1899`）**：SNAPSHOT_STRUCTURE（`submitStructureSnapshot`，可带 error 字段回传渲染端失败）；REVIEW_SUGGEST（persona 白名单 `Methodology_Reviewer|Data_Analyst|Literature_Expert|Grammar_Check|human`）；BIND_SESSION_LAB（`getLab` 不存在抛 `'实验室不存在'`，`updateAgentSessionMeta({cslabLabId})`，message 提示「重新发送消息后注入科研工具」）/UNBIND_SESSION_LAB（清绑定 + `broadcastSessionUpdated`）；OPEN_AGENT_WINDOW/SEND_TO_AGENT_WINDOW（`asAgentContext` 校验 + `getLab` 存在性）/GET_AGENT_WINDOW_CONTEXT；UNDO_PLOT_UPDATE（`:1899`，`restorePlotUndoSnapshot` 失败抛 `'撤销快照不存在或已过期'`，成功广播 `ON_PLOT_UPDATED`）。

## 4. 调用者与调用链

入向：

- `apps/electron/src/main/ipc.ts:147`（`import { registerCsLabIpc } from './lib/cslab'`）、`:6223`（`registerCsLabIpc()`，唯一调用点）。
- 渲染端经 `CSLAB_IPC_CHANNELS.*`（`invoke`）触发——通道名权威在 `apps/electron/src/main/lib/cslab/cslab-types.ts`。

出向（import 段 `:8-223`，30+ 模块）：`./cslab-demo`（createDemoLab）、`./cslab-science`（9 个绘图/晶体函数）、`./cslab-types`（通道常量）、`./cslab-service`、`./cslab-security`（门禁 5 函数）、`./cslab-manager`（9 个）、`./cslab-iron-cage`（8 个）、`./cslab-capsule`、`./cslab-manuscript`（11 个）、`./cslab-ooxml`（runOoxmlTask）、`./cslab-python`、`./cslab-events`（broadcastCsLabEvent）、`./cslab-plot-history`、`./cslab-structure-snapshot`、`./cslab-window-manager`（4 个）、`./cslab-zotero`（8 个）、`./cslab-zotero-bridge`、`./cslab-literature`、`./cslab-python-runtime`、`./cslab-plot-digitizer`、`./cslab-dataset-store`、`./cslab-formula-verifier`、`./cslab-graphrag-router`（buildLiteratureIndex/searchLabLiterature，`:155-158`）、`../local-file-protocol`（registerProferFilePath）、`../agent-session-manager`（updateAgentSessionMeta/getAgentSessionMeta，`:160/:174`）、`./cslab-runs`（7 个）、`./cslab-canvas-sync`（6 个）、`./cslab-vault-index`（6 个，`:183`）、`./cslab-tool-registry`（5 个）、`./cslab-tool-trust`、`./cslab-uv`/`./cslab-uv-consent`、`./cslab-share-watcher`（8 个）、`./cslab-hpc`（12 个）、`./cslab-mol`、`./cslab-ai-review`；`electron`（BrowserWindow/dialog/ipcMain，`:8`）、`node:crypto randomUUID`、`node:fs promises`、`node:path`（`:9-11`）、`@profer/shared`（55 类型 + AGENT_IPC_CHANNELS，`:12-67`）。

## 5. 数据 I/O、读写与副作用

- 本文件**无直接磁盘读写**（除 `fs.stat`/`fs.readFile` 读图片/docx（`:612-641/:900-908`）与对话框路径处理）；全部持久化在被委托模块。
- 事件广播（`broadcastCsLabEvent` 经 `./cslab-events`）：`ON_INGEST_PROGRESS`/`ON_ASSET_CHANGED`/`ON_CAPSULE_STALE`/`ON_SHARE_STATUS`/`ON_HPC_JOB`/`ON_HPC_MFA`/`ON_ZOTERO_SYNCED`/`ON_ZOTERO_STATUS`/`ON_VAULT_CHANGED`/`ON_DAG_JOBS_CANCELLED`/`ON_TOOLS_CHANGED`/`ON_TOOL_DEPS_PROGRESS`/`ON_PLOT_UPDATED`。
- 窗口副作用：`dialog.showSaveDialog`（EXPORT_TABLE `:642`、SHOW_SAVE_FILE_DIALOG `:841`、EXPORT_FIGURE `:1790`）；`BrowserWindow.getAllWindows` 广播 `session_updated`（`:238-247`）；科学助理窗口开关（`closeCsLabAgentWindowForLab`/`openCsLabAgentWindow`）。
- 内存状态：`pendingSaveTokens`（60s TTL 一次性令牌，`:234-235`）。
- 幂等/并发：OPEN_LAB 后台任务全部 `void …catch(warn)` 不阻塞返回；CANVAS_WRITE 用 `expectedMtimeMs` 乐观并发 + 冲突路径回报；SAVE_MANUSCRIPT_AS 令牌防重放。

## 6. 分支、失败、取消与恢复

- 门禁拒绝：非豁免通道未解锁时 `assertCsLabUnlocked()` 抛出（错误文案在 `cslab-security.ts`，本文件不构造）。
- 输入校验失败：`<label>无效` 统一文案（`asString/asStringArray/asNumber/asObject`，`:270-293`）；显式白名单拒绝：图片扩展名（`:618`）、导出格式（`:647/:1796`）、persona（`:1834-1843`）、profile（`:1943-1948`）、relation（`:1303/:1324`）、scheduler（`:1587`）、数字化 mode（`:1147`）。
- 取消语义差异（照实记录）：EXPORT_TABLE/SHOW_SAVE_FILE_DIALOG 取消返回结构体（success:false / null）；EXPORT_FIGURE 取消**抛** `'已取消导出'`（`:1811`）。
- 令牌失败：SAVE_MANUSCRIPT_AS 过期/路径不符/重放 → `'未授权的保存目标路径，必须经由系统文件对话框选定'`（`:877-881`）。
- 失败降级：OPEN_LAB 的三个后台任务失败仅 warn（`:450-474`）；CANVAS_WRITE 的 HPC 取消失败不影响保存（`:1447-1452`）；SYNC_DOCX 严格拒绝外部路径。
- 恢复：HPC `HPC_REHYDRATE`（重启找回作业）；Zotero/Vault/工具监听在 OPEN_LAB/显式 START_WATCH 恢复；绘图 `UNDO_PLOT_UPDATE` 快照恢复（过期抛错）。

## 7. 权限与权威状态

- **权限模型=会话解锁门禁**（`assertCsLabUnlocked`，`:264`），非 sender/role：任何渲染进程只要会话已解锁即可调用全部 122 通道（含删除实验室、HPC 提交、共享盘凭据写入）——handler 不区分调用窗口（`_event` 忽略；`event.sender` 仅用于定位对话框父窗口与进度回发）。
- 路径权威：所有 labId/relPath/uri 经校验器 + 被委托模块（`cslab-paths` 守卫）；SAVE_MANUSCRIPT_AS 的目标路径权威由系统对话框令牌绑定（`:841-890`）。
- 状态权威：会话↔实验室绑定（BIND/UNBIND 写 `agent-session-manager`，`:1851-1875`）；工具免审批信任（`onCsLabOpened` 切换失效，`:452-453`）；Zotero/Vault/HPC/共享盘状态在各自模块，本文件只分发+广播。

## 8. 修改影响面

- 改 `ipcMain.handle` 包装影响全部 122 通道的门禁语义（新增 handler 自动受保护，`AUTH_EXEMPT_CHANNELS` 需审慎增删）。
- 改校验器文案/形状影响所有渲染端错误处理。
- 改广播事件种类/形状影响渲染端订阅（`ON_*` 事件消费在 renderer）。
- 改 OPEN_LAB 副作用链影响首屏性能假设（索引/监听/重水合均后台化）。
- 改 SAVE_MANUSCRIPT_AS 令牌流影响另存为安全模型（对话框↔令牌↔路径三元绑定）。
- FIT_PEAKS/SMOOTH_SERIES 无校验透传（`:1753-1760`）——修改输入契约时需同步 `cslab-science`。
- 无直接测试文件（§9）；改动需依赖被委托模块测试与人工回归。

## 9. 测试证据

**无专属测试文件**（冻结树 glob `**/cslab-router*test*` 零命中；否定范围：冻结树全路径）。间接证据（其它测试经由被委托函数覆盖其下游，但不经本路由层）：

- `cslab-manager.test.ts`（实验室 CRUD）、`cslab-zotero.test.ts`（同步）、`cslab-graphrag.test.ts`（检索）、`cslab-vault-index.test.ts`（Vault）——均直接调用业务函数**绕过 IPC handler**（handler 校验/门禁/广播无任何断言）。
- 未覆盖（全部）：`assertCsLabUnlocked` 门禁包装、`AUTH_EXEMPT_CHANNELS` 豁免集合、`pendingSaveTokens` 令牌生命周期/重放拒绝、输入校验器文案、图片嗅探/32MB 上限、EXPORT_* 三条取消语义差异、SYNC_DOCX 外部路径拒绝、OPEN_LAB 副作用链、全部 122 handler 的参数转译——无测试断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 122 handler 注册行与通道名对应表 | 已证实 | `:393-1899` 逐条机械比对（§3.2） |
| 唯一导出 registerCsLabIpc、唯一挂载点 ipc.ts:6223 | 已证实 | `:391` + `apps/electron/src/main/ipc.ts:147/:6223` |
| 门禁包装 + 5 通道豁免 | 已证实 | `:225-232/:258-268` |
| SAVE_MANUSCRIPT_AS 令牌先删后验（防重放） | 已证实 | `:868-880` |
| SYNC_DOCX 仅允许链接副本 | 已证实 | `:774-800` 区间判定 |
| EXPORT_FIGURE 取消抛错 vs EXPORT_TABLE 取消返回 | 已证实 | `:1811` vs `:660-670` |
| FIT_PEAKS/SMOOTH_SERIES 透传不校验 | 已证实 | `:1753-1760` |
| OPEN_LAB 四步副作用（信任失效/索引/共享盘/重水合） | 已证实 | `:450-474` |
| 无 sender/role 校验 | 已证实（静态） | 全文件检索无 sender 权限断言（`event.sender` 仅窗口定位） |
| `assertCsLabUnlocked` 实现细节 | 推断 | 位于 cslab-security.ts（未读实现） |
| 渲染端事件订阅形状 | 未知 | renderer 实现未读 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 门禁包装/AUTH_EXEMPT | §3.1 | 225-268 | covered |
| 门禁/遥测组 | §3.2 | 393-424 | covered |
| 沙箱组（含 OPEN/DELETE 副作用） | §3.2 | 427-509 | covered |
| 数据铁笼组（含图片/导出） | §3.2 | 516-642 | covered |
| 论文/胶囊/DOCX/另存为令牌 | §3.2 | 677-970 | covered |
| 环境/Zotero/文献/数字化/公式/GraphRAG | §3.2 | 983-1207 | covered |
| 规程批次/Vault/Canvas | §3.2 | 1225-1426 | covered |
| 工具/uv/共享盘/HPC | §3.2 | 1459-1709 | covered |
| 科学引擎/快照/审稿/绑定/助理窗口/撤销 | §3.2 | 1717-1899 | covered |
| 校验器/嗅探/sink/asAgentContext/asProfile | §2/§3.2 | 270-389/1915-1948 | covered |
| handler 层测试断言 | §9 | — | unknown（无测试） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
