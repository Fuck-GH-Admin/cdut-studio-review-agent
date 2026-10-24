# CHAINS.md — 阶段二模块调查收口（轨：实验室/文件）

- 根：DSH docs-r07-index-qa-extra-02-20261024（本轨执行；Codex 只统筹）。**阶段二产物，不含阶段三 CODEBASE-MAP/ARCHITECTURE 内容。**
- 源：`baseline/source@05fb2565e20eb1760233696be1832f68196b37c2`（只读；本轮未改任何受保护对象）。
- 时间：2026-10-23T21:33Z 起（`date -u`）。**真实运行 NOT_RUN**：所有超时/降级/边界结论为静态实读断言，未跑 Electron/Worker/Python/HPC 实链路。
- 事实依据：`inventory/FILES.tsv`、`inventory/ACCEPTED.json`（manual hash 绑定）、`manager/TEAM-FILE-OWNERSHIP.json`（2026-10-23T21:25Z 版）、冻结源码。**旧 922 不继承接受**；未 accepted 稿只作线索。
- 图例：**证实**=本轨亲读 file:line；**推断**=静态推理未实测；**未知**=未查到；**待验**=子agent 取证中/未完成复核，不冒充已验。
- 交叉核查原则：同名/同目录不算调用证据；每条边都要求真实 import/call 站点。

## 0. 入口面与权威数据（公共前置）

- **IPC 入口**：`apps/electron/src/main/lib/cslab/cslab-router.ts:391 registerCsLabIpc()` 统一注册 `CSLAB_IPC_CHANNELS.*`（manuscript :678-:880、capsule :960/:971、runs :1225-:1321、custom tool :1473、export figure :1791）。渲染层调用方（实测 import）：`renderer/components/cdut-science/CsLabWorkspaceView.tsx`、`CsLabManuscriptEditor.tsx`、`cslab-capsule-node.ts`。**证实**。
- **DB 权威层**：`cslab-db.ts`。表（:122-:268）：entities/provenance_edges/tables/capsule_bindings/manuscripts/lab_state/literature_sources/zotero_*/protocols/**runs**。连接 `getCsLabDatabase`（:272-284，按 dbPath 缓存）；**显式事务** `withTransaction`（:307-311+ `BEGIN IMMEDIATE/COMMIT/ROLLBACK`，头注 :5-7 明示不依赖 `DatabaseSync.prototype.transaction`）。**证实**。
- **权威数据口径**：DB=状态权威（revision 经 `nextLabRevision` 递增）；md/sidecar/docx=渲染物/同步副本；胶囊 staleness 由数据表内容哈希驱动（cslab-capsule.ts:160）。**证实**。

## 1. CH-MANUSCRIPT-SAVE 文稿保存双写（核心链，逐边亲核）

入口 `cslab-router.ts:705` `SAVE_MANUSCRIPT` → `cslab-manuscript.ts:244 saveManuscript`：

1. `:246-247` `getManuscriptRecord(labDb, uri)`；不存在 throw「文稿不存在」（fail-fast）。
2. `:250-258` title 截 120 字符、capsules 数组化、构建 `ManuscriptSidecar{version,title,docJson,capsules,updatedAt}`。
3. **文件写①** `:264-267` `writeTextAtomic(resolveLabRelativePath(labId, record.relPath), tipTapToMarkdown(docJson))`。
4. **文件写②** `:268-271` sidecar JSON（`JSON.stringify(...)+"\n"`）同法落 `sidecarRelPath`。
5. **DB 事务** `:274-306` `withTransaction`：`nextLabRevision`→`upsertManuscript`→`upsertEntity`（title/revision/updatedAt）→`deleteCapsulesByManuscript`→逐 capsule `upsertCapsule`（status 强制 'fresh'）→按需 `insertEdge(tableUri→capsuleUri,'binds',{column,rowIndex})`（防重：`listEdgesTo` 查 `hasEdge`）。
6. 返回 `{uri,title,docJson,capsules,updatedAt,docxPath}`；router `:719-723` 附加 `checkStaleness`→广播 `ON_CAPSULE_STALE`（副作用：事件推送）。

原子性工具 `writeTextAtomic`（:121-125）= tmp+rename；`writeBufferAtomic`（:127-139）同法 + 失败清 tmp + `EBUSY/EPERM/EACCES`→「Word 正在占用该文件，请关闭 Word 后重试」。**证实**。

**双写一致性（真实边界）**：文件两步先写、DB 事务殿后；文件侧无事务。DB 失败→文件已新、DB 旧（内容/版本分叉）；文件写②失败→md 与 sidecar 分叉。无补偿/回滚代码（全文未见）。→ CF-01。

## 2. CH-MANUSCRIPT-SAVEAS 另存为（沙箱+外部双目标）

`cslab-router.ts:869` `SAVE_MANUSCRIPT_AS` → `cslab-manuscript.ts:320`：`:326` 先 `saveManuscript`（沙箱+DB，同链 1）；`:337-345` md 分支 `writeTextAtomic(targetPath)`；`:351-367` docx 分支 `runOoxmlTask({type:'export'})`→`writeBufferAtomic(targetPath)`。外部目标写失败时沙箱/DB 已更新（部分完成态，UI 消息仍可失败）。→ CF-02。**证实**。

## 3. CH-DOCX-LINK Word 胶囊关联与「原件不改写」承诺的真实边界

- `attachDocx`（`cslab-manuscript.ts:392-415`）：「复制进沙箱，成为长期同步目标」——默认 `vault/manuscripts/<uri末段>.docx`（:402）→`writeBufferAtomic`→`upsertManuscript(docxRelPath)`。**用户原件只读、不改写**。
- `writeLinkedDocx`（:417-422）= `attachDocx` 别名，注释明示「**覆盖写回长期同步副本**」——被覆盖的是沙箱 linked 副本，不是原件。
- `writeExportDocx`（:430-452）：已有 linked→写 `vault/manuscripts/<uuid>.export.docx`，注释「**绝不覆盖原件**」（:425-427）；无 linked→`attachDocx` 建链（`createdLink:true`）。
- 入口消费：`cslab-router.ts:730` `EXPORT_DOCX`（runOoxmlTask export→writeExportDocx，:755-756）；`SYNC_DOCX`（:775+）无 linked 时 throw「尚未导出 Word 文稿，请先执行"导出 Word"」。
- **真实边界**：①导入原件永不改写；②沙箱 linked 副本会被覆盖写（同步语义）；③导出永不触原件（`.export.docx` 并行件）；④并发占用→EBUSY/EPERM/EACCES 转中文降级提示。**证实**。

## 4. CH-DOCX-READ 读取与静默降级

`readDocxBuffer`（:465-477）：`getLinkedDocxPath`（:381-388）→`fs.readFile`；**catch 后一律 return null**——「无副本」与「读损坏/无权限」不可区分（调用方降级语义模糊）。→ CF-04。**证实**。兼容别名：`getManuscriptDocxPath`（:388-389）、`writeDocxBuffer`（:456-459）——重复名登记见 §8。

## 5. CH-RUN-CREATE / CH-CAPSULE-BIND 批次与胶囊（DB 事务+图边）

- Runs：`cslab-router.ts:1266 RUN_CREATE`→`cslab-runs.ts:420 createRun`：`protocols` 存在性校验（缺→「关联的规程不存在」）→`withTransaction`：`upsertRun`+`upsertEntity`；`updateRun`（:485）缺→「实验批次不存在」；`linkRunAsset`（:537）/`unlinkRunAsset`（:572）；资产目录 `fs.mkdir`（:273/:286）。**证实**（DB 侧与 1 同构；文件副作用仅资产目录准备）。
- Capsule：`cslab-capsule.ts:87 bindCapsule` 五重校验（表存在 :96、属主 lab :97、预览 :100、列界 :103、行界 :105-106）→`withTransaction`：`upsertCapsule`+`insertEdge('binds')`；`checkStaleness`（:160）哈希比对出 stale 清单；`updateCapsule`（:176）、`getCapsuleLineage`（:213）。router `:960/:971` 消费 + 三处 `ON_CAPSULE_STALE` 广播（:369/:542/:720）。**证实**。

## 6. CH-OOXML-WORKER OOXML 任务：Worker/30s 超时/降级

`cslab-ooxml.ts:1120 runOoxmlTask`（消费方：router:122、saveManuscriptAs:352、cslab-track-changes.ts:10）：
- `:1121-1122` worker 产物 `dist/cslab-ooxml-worker.cjs` **不存在→`executeOoxmlTask` 进程内降级**（不隔离线程）。
- `:1125-1128` `new Worker(workerPath)`；**30s 超时**→`worker.terminate()`+reject「OOXML Worker 执行超时（30s）」。
- `:1133-1137` message→terminate→ok 则 resolve、否则 reject（错误串透传）。
- worker 侧 `cslab-ooxml-worker.ts:8/:19/:22`：parentPort 契约、非 worker 环境 throw。
- **取消语义**：无显式取消 API；仅超时杀线程。**证实**。

## 7. CH-PATH-BOUNDARY 文件权限与穿越边界

`cslab-paths.ts:320-333 resolveLabRelativePath`：resolve 后 `:323`/`:333` 两次 root 前缀校验，越界 throw「路径越界：目标不在实验室沙箱内」；`:261` 同类 cwd 包含性校验。所有落盘链（1/2/3/5）落盘前必经此函数。**证实**。
- **推断风险（CF-06）**：containment 为纯词法 `startsWith(root+sep)`，未见 `fs.realpath`/symlink 解析——沙箱内 symlink 指向外部时，词法在界内、物理写界外。**推断**（静态；未实测，NOT_RUN）。

## 8. 重复名/别名与接口一致性登记（去重引用）

| 规范符号（唯一路径） | 重复名/别名 | 位置 | 备注 |
| --- | --- | --- | --- |
| `cslab-manuscript.ts#getLinkedDocxPath` | `getManuscriptDocxPath` | :388-389 | 兼容别名，同函数 |
| `cslab-manuscript.ts#attachDocx` | `writeLinkedDocx`、`writeDocxBuffer` | :417-422、:456-459 | 三级同实现；语义=**覆盖**沙箱副本，与「export 不覆盖」并列易混 |
| `cslab-manuscript.ts#writeExportDocx` | — | :430-452 | 唯一「绝不覆盖原件」出口 |
| `cslab-db.ts#withTransaction` | — | :307 | 唯一事务入口（头注禁止直接 new DatabaseSync） |
| `cslab-ooxml.ts#runOoxmlTask` | — | :1120 | 唯一 OOXML 调度入口（worker/降级二分支） |

## 9. 待验链（不冒充已验）

CH-PYTHON-RUNTIME（cslab-python-runtime.ts/cslab-python.ts→resources/cslab/*.py，含 cslab-lease-copy.ps1）、CH-HPC（cslab-hpc.ts/cslab-hpc-db.ts）、CH-EXPORT-FIGURE（router:1791→cslab-figure-export.ts/renderer cslab-plot-export.ts）、CH-SHARE-DUALWRITE（cslab-share-db/share-watcher/dataset-store/vault-index/columnar）——取证进行中（DSH 内部子agent），收口时点证据未齐者在 RESULT.json 标 coverage gap，不虚报 DONE 完整。

## 10. 实现缺陷（如实保留，留给阶段三设计差异报告；当前不修产品）

1. **双写非原子（CF-01）**：md/sidecar 文件写先于 DB 事务，任一步失败产生文件↔DB 分叉，无补偿。证据：cslab-manuscript.ts:264-271 vs :274-306。
2. **saveManuscriptAs 部分完成态（CF-02）**：沙箱/DB 先更新、外部目标写后置，失败即半成品。证据：:326 vs :337-367。
3. **读取静默降级不可区分（CF-04）**：readDocxBuffer catch→null。证据：:465-477。
4. **OOXML 降级不隔离（CF-05）**：worker 产物缺失时主线程内执行大 docx 解压（与 worker 立项目的相悖，见 worker 头注 :5）。证据：cslab-ooxml.ts:1122 vs cslab-ooxml-worker.ts:5。
5. **词法路径边界无 symlink 解析（CF-06，推断）**：cslab-paths.ts:320-333。

## 11. CH-PYTHON-RUNTIME Python 工具运行链（子agent 取证 + 关键边抽查；静态断言，运行 NOT_RUN）

- **入口**（实测 import/call）：`cslab-router.ts:983-:1508`（GET_PYTHON_CAPABILITY/GET_TOOL_RUNTIME/INSTALL_TOOL_DEPS/DIGITIZE_PLOT/SAVE_DIGITIZED_FIGURE/OCR_FORMULA/VERIFY_FORMULA/CUSTOM_TOOL_LIST/REFRESH/RUN(:1473)/START/STOP_WATCH/ENSURE_UV；挂载 `main/ipc.ts:6223`）；agent 侧 `adapters/pi-cslab-tools.ts:146/:184/:211`（cslab_run_lab_tool，source:'agent'）；**信任门** `agent-orchestrator.ts:1932-1955`（isCsLabToolTrusted→decideCsLabToolGate：plan 拒/bypass+trusted 放/非交互拒/否则一次性确认）。
- **spawn**：`cslab-python-runtime.ts:372-382 runCsLabPython`（execFile 无 shell；timeout `options.timeoutMs??120_000` :376；maxBuffer 64MB :378；cwd=lab 目录 :380）；`cslab-python.ts:108-112 tryParseWithPython`（120s，**无 cwd**）；`cslab-tool-registry.ts:570-583 runLabTool`（120s，cwd=labDir）；扫描 AST 20s (:335-339)；探针 2.5-3s；venv 建 180s (:294-307)；pip 600s (:328-344)；uv 下载 45s/12s（cslab-uv.ts:45-46/:190）。
- **脚本解析**：`resolveCsLabScript`（cslab-python-runtime.ts:67-76）5 候选路径首个 existsSync 命中（resourcesPath/cslab、__dirname 相对×2、cwd×2）；解释器 `resolveLabPython`（:134-154）venv python→系统 python3/python/py 探针。
- **输出/持久化**：①纯返回（verifyFormula/ocrFormula/digitizePlot→IPC 返回，crop 临时图 finally 删除 plot-digitizer.ts:165-167）；②**持久化** SAVE_DIGITIZED_FIGURE→`cslab-dataset-store.ts:110-175`：`vault/figures/*.png`+`vault/tables/*.parquet`+`.preview.json`（:132-134）+ DB `entities`/`tables`（cslab-db.ts:122/:155）；③runLabTool 侧写：args JSON `runtime/logs/.tool-args-<uuid>.json`（finally 删除 :602）、审计追加 `runtime/logs/tool-executions.jsonl`（cslab-tool-audit.ts:15-16/:84-96，args/result 截断）；④工具清单 `runtime/tools/.cslab-tools.json` 原子写（registry :34/:407/:468）。
- **失败/超时/降级/取消**：失败→runLabTool catch :604-613 `{ok:false,error}`+审计 exitCode（:607-608）；超时=execFile 杀子进程（无显式 kill/AbortSignal——**无取消 API**，G1）；缺 python→「未检测到 Python 运行时」:370；uv 缺→自动下载 :268-277（consent 对话 cslab-uv-consent.ts:47-74）；venv 坏→静默重建 :280-317（uv 失败回退系统 python :308-314，G4）；未知/恶意工具→名称正则 :531、清单白名单 :533-535、路径 containment :549-555（无签名/哈希钉扎，G6）。
- **原件不改写（P 侧边界）**：iron-cage `parseFile` 只 `fs.readFile`（cslab-iron-cage.ts:129-184）；**cslab-lease-copy.ps1**（R，66 行）：仅 `cslab-share-watcher.ts:494-502 leaseCopyWindows` 调用（win32 非 webdav 且 `CSLAB_SHARE_FORCE_NODE_STREAM!='1'` :677-682；300s :61）——源文件以 `FileAccess.Read+FileShare.Read` 只读租约流式复制到 `db/staging/<id>.partial` 且同时算 SHA-256 输出一行 JSON（PS1:26-63），**拒 UNC 目标**（:22-25）；PS1→.NET 内联→Node 流三级降级（:513-545/:554+）；发布按 SHA 幂等去重入 `share_watch.sqlite`（cslab-share-db.ts:103/:85，库路径 :125-127）+失败退避重试 :687-700。**原件永不写**（只读租约排除写者）。
- **证实/推断/未知**：上述 import/call 站点、常量、路径、降级梯=证实（file:line 实读）；execFile 超时杀进程语义=**推断**（Node 行为，未实测）；`cslab-tool-runner.py`/`cslab-tool-scanner.py`/`cslab-instrument-extractor.py` 脚本内部=**未知**（未读；是否在 --input 旁写文件未核）。

## 12. P 侧缺口（并入 CONFLICTS：CF-07..CF-12）

- G2/CF-07：**CUSTOM_TOOL_RUN IPC（router :1473-1481）无信任门**——agent 路径有 agent-orchestrator:1932-1955 门，渲染层 IPC 直调无同等门（推断：假定用户面板动作；渲染层被攻破即可以任意 runtime/tools/*.py 执行）。
- G1/CF-08：**Python 工具无取消 API**（registry :570-583 无 AbortSignal/kill；仅超时）。
- G3/CF-09：`tryParseWithPython` 无 cwd（cslab-python.ts:108-112）——脚本 __pycache__/临时物可能落沙箱外（对照 runtime :379-380 自定红线）；探针缓存不随脚本消失失效（cachedProbe :24、profileStatusCache :188 仅 :348 清）。
- G4/CF-10：venv 坏→静默回退系统 python（runtime :142-147），工具缺依赖时报「工具错误」而非「运行时缺失」。
- G5/CF-11：审计 exitCode 在超时/被杀时为 undefined（registry :604-608 取 error.code）——审计无法区分超时与崩溃（推断：Node error 形状）。
- G6/CF-12：工具清单无签名/哈希钉扎（registry :301-313 扫描接受 runtime/tools 任意 .py；fingerprint 仅驱动重扫 :501-504）。

## 13. CH-HPC HPC 远端任务链（亲核；静态断言，运行 NOT_RUN）

- **入口**（实测 import/call）：`cslab-router.ts:1581 listHpcProfiles` / `:1606 saveHpcProfile` / `:1654 submitHpcJob` / `:1713 answerHpcMfa`（模块 import :207/:213/:216/:217 ← `cslab-hpc.ts`）。
- **关键边**：注入守卫 `assertSafeRemoteJobId`（cslab-hpc.ts:123-126，「远程 JobID 格式非法，已阻断潜在命令注入风险」）、`synthesizeBatchScript`（:161，:156 拦截批处理脚本注入）；档案字段校验（:662-672 空值拒）；私钥读失败 throw（:349）；SSH 连接失败包装（:552）；**远端写** `sftp.writeFile`（:606）；调度状态归一 `normalizeSchedulerState`（:218）/`parseSchedulerJson`（:262）；MFA 交互 `answerHpcMfa`（:415）；失败面 throw（:492/:508/:523）。
- **持久化**：独立 per-lab SQLite（`cslab-hpc-db.ts:121-126`）：`hpc_profiles`（:86）、`hpc_jobs`（:102）；`upsertHpcProfileRow`（:268-278 `INSERT … ON CONFLICT(id) DO UPDATE`）、`deleteHpcProfileRow`（:306-307）、`upsertHpcJobRow`（:312+）；`withTransaction` 已引入（cslab-hpc.ts:55）。
- **证实/未知**：入口/守卫/持久化=**证实**；submitHpcJob 的会话生命周期、轮询循环、**取消/恢复语义**=**未知**（本轮未读完，记缺口）。

## 14. CH-EXPORT-FIGURE 出版级图导出（亲核）

- **入口**：`cslab-router.ts:1791-1812 EXPORT_FIGURE`——格式白名单 `['svg','pdf','png','tiff']`（:1800 否则「导出格式无效」）；`dialog.showSaveDialog`（:1802-1811）；**取消→throw「已取消导出」**（:1813-1814）。
- **关键边**：`cslab-science.ts:194 exportFigure`（targetPath=用户选定 :198-199 或默认命名）→ `:213 exportPlotToFile` → `cslab-figure-export.ts:183 exportPlotToFile`：像素上限 6400 万 throw（:60）、位图空校验（:148）、PNG 解码失败 throw（:205）、TIFF 由 PNG 转换。
- **持久化/输出**：`fs.writeFile(targetPath, buffer)`（:215）——**用户经保存对话框选定的沙箱外路径=设计语义**（导出授权即写）；无 DB 写；不触任何原件。**证实**。
