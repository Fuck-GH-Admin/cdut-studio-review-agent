---
path: apps/electron/src/main/lib/cslab/cslab-zotero.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f17f70170f4d6bc2ed97169cab3177ee6459a091
sha256: 9289459fded8f7c82836fc11cf4b08835e93c2de995fcc3a7fc5d1f8c9305321
lines: 1173
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-zotero.ts

## 1. 结论与边界

Zotero 6/7 **只读增量同步引擎**（运行时代码）：发现 Zotero 数据目录 → 复制影子副本 → 解析库结构 → 高水位增量同步（条目/分类/附件/批注）→ 写入实验室 `central_meta.sqlite`，并提供 WAL 文件监听自动同步。三条红线（文件头 `apps/electron/src/main/lib/cslab/cslab-zotero.ts:4-8`）：①绝不打开真实 `zotero.sqlite`，只读影子副本；②Windows WAL/SHM 被独占时 EBUSY 重试 + 只读流降级，WAL 不可读可仅基于主库快照继续，绝不抛未捕获异常；③写入仅发生在实验室 central_meta，Zotero 源库保持只读。

边界（同名消歧）：本文件是 `apps/electron/src/main/lib/cslab/cslab-zotero.ts`；`packages/shared/src/utils/cslab-zotero.ts` 是共享层**同名不同文件**（被 `packages/shared/src/utils/index.ts:108/:114` 导出，与本文件无 import 关系）。批注坐标解析/附件路径重建委托 `apps/electron/src/main/lib/cslab/cslab-zotero-format.ts`；桥状态委托 `apps/electron/src/main/lib/cslab/cslab-zotero-bridge.ts`；不注册 IPC（消费方 `cslab-router.ts`）。

## 2. 导出与关键符号

导出 15 项 = 14 函数 + 1 接口（`export` 逐条核对）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ZoteroWatcherHandle` | 导出接口 | 117 | `{watching: boolean, message: string}` | 监听启动结果 |
| `getZoteroStatus` | 导出异步函数 | 658 | `(labIdInput): Promise<CsLabZoteroStatus>` | 发现+状态汇总 |
| `discoverZotero` | 导出异步函数 | 694 | `(labIdInput, overrideDataDir?): Promise<CsLabZoteroDiscovery>` | 发现+影子副本+结构校验 |
| `setZoteroDataDir` | 导出异步函数 | 744 | `(labIdInput, dataDir): Promise<CsLabZoteroDiscovery>` | 显式设置数据目录 |
| `syncZoteroLibrary` | 导出异步函数 | 774 | `(labIdInput, options?: CsLabZoteroSyncOptions): Promise<CsLabZoteroSyncResult>` | 增量同步主流程 |
| `listZoteroLiterature` | 导出函数 | 1049 | `(labIdInput): CsLabLiteratureItem[]` | 转发 `listLiterature` |
| `listLiteratureZoteroAnnotations` | 导出函数 | 1053 | `(labIdInput, literatureUri)` | 转发 `listLiteratureAnnotations` |
| `getZoteroLiteratureItem` | 导出函数 | 1060 | `(labIdInput, uri)` | 转发 `getLiteratureItem` |
| `getZoteroSource` | 导出函数 | 1068 | `(labIdInput, uri)` | 已登记来源（`:1067` 注释自述「供路由做 URL 注册」，但全树无消费者——陈旧自述） |
| `listStoredZoteroAnnotations` | 导出函数 | 1072 | `(labIdInput, uri?)` | 转发 `listStoredAnnotations` |
| `startZoteroWatcher` | 导出异步函数 | 1078 | `(labIdInput, onChange): Promise<ZoteroWatcherHandle>` | WAL 监听自动同步 |
| `stopZoteroWatcher` | 导出异步函数 | 1149 | `(labIdInput): Promise<{watching:boolean}>` | 停单个监听 |
| `stopAllZoteroWatchers` | 导出异步函数 | 1158 | `(): Promise<void>` | 停全部 |
| `isZoteroWatching` | 导出函数 | 1166 | `(labIdInput): boolean` | 测试辅助 |
| `__resetZoteroWatchersForTest` | 导出异步函数 | 1171 | `(): Promise<void>` | 测试辅助（= stopAll） |

关键内部符号：模块级 `watchers: Map<labId, ActiveWatcher>`（`:133`）、`syncingLabs: Set`（`:134`，同步互斥）；`labDb`（`:136`）、`sleep`（`:140`，timer.unref）、`isBusyError`（`:147`，EBUSY/EPERM/EACCES）；目录发现 `defaultDataDirCandidates`（`:154`）/`profileRootCandidates`（`:164`）/`parsePrefsFile`（`:182`，解析 prefs.js 的 dataDir/baseAttachmentPath，还原 `\\\\`→`\\`）/`discoverProfile`（`:201-230`）/`resolveDataDir`（`:232-259`，候选序 override→记忆值 labState `zotero.dataDir`→prefs→默认，`zotero.sqlite` 存在性判定，返回 searched 清单）；影子副本 `copyWithRetry`（`:261-281`，重试 0/100/200/400ms + 只读流降级）/`refreshZoteroShadow`（`:290-327`，清旧副本、主库必拷、WAL/SHM 尽力拷、WAL 失败删残留 shm/wal 标 `degraded`）/`openShadow`（`:329-335`，`require('node:sqlite')` + `PRAGMA query_only=ON` + `busy_timeout=0`）；结构探测 `tableColumns`（`:337`）/`hasTable`（`:346`）/`probeSchema`（`:366-377`，10 张必备表 `REQUIRED_TABLES:353-364` + items.version 列）；查询 `readCollections`（`:379-409`，递归 CTE 分类路径 `a > b`）/`readItemDeltas`（`:411-451`，`version>cursor` 且 `deleted=0` 且排除 attachment/note/annotation 类型，EAV MAX 聚合 title/DOI/date/publicationTitle/abstractNote/url）/`readDeletedDeltas`（`:453-467`）/`chunkIds`（`:469`，400/批）/`readAttachments`（`:477-514`，每 parent 取首条 PDF 附件，contentType 或 path 后缀判定）/`formatCreatorName`（`:518-522`，CJK 姓前名后，`CJK_NAME_RE:516`）/`readCreators`（`:524-550`）/`readItemCollections`（`:552-574`）/`readAnnotationDeltas`（`:576-627`，annotations 表存在才查，列名探查 `position/annotationPosition` 等多别名，无 position 列直接 `[]`）/`readMaxVersion`（`:629`）/`mapAnnotationType`（`:636-648`，字符串小写或数字 1-6 映射 highlight/note/image/ink/underline/text）/`extractYear`（`:650-655`，`\b(1[5-9]\d{2}|20\d{2})\b`）；`emptySyncResult`（`:761-772`）；`getEntityForLab`（`:1024-1047`，裸 SQL 查 entities）。

## 3. 内部逻辑与关键流程

### 3.1 发现与状态（`apps/electron/src/main/lib/cslab/cslab-zotero.ts:658-759`）

- `getZoteroStatus`（`:658-692`）：`resolveDataDir` + `getZoteroBridgeStatus` + `listLiteratureSources`/`countZoteroAnnotations` + labState `zotero.lastSyncedAt`/`zotero.lastVersion` + `watchers.get`。`dataDir` 缺失 → `availability:'not-found'`（message 指引安装/手动选择）；否则 `'ready'`（message 提示可「重新发现」验证结构）。
- `discoverZotero`（`:694-742`）：未找到 → `not-found` 且 message 列出 `searched` 全部候选路径；找到 → `refreshZoteroShadow` + `openShadow` + `probeSchema`——结构不符 → `'schema-unsupported'`；抛错（如主库被占用 `'Zotero 主库被占用，无法建立只读影子副本'`）→ `'no-permission'` + 错误信息。返回 `{status, preferences}`。
- `setZoteroDataDir`（`:744-758`）：目录无 `zotero.sqlite` 抛 `'所选目录下不存在 zotero.sqlite'`；写 labState `zotero.dataDir` 与 `zotero.lastVersion='0'`（**重置游标**）后 `discoverZotero`。

### 3.2 同步主流程 `syncZoteroLibrary`（`:774-1022`）

1. 互斥：`syncingLabs` 有 labId → `emptySyncResult('该实验室正在同步中，请稍候')`（`:777-780`）；进入后 add、finally delete（`:1021`）。
2. 发现不 ready → `emptySyncResult(discovery.message)`（`:784-787`）；再次 `refreshZoteroShadow` + `openShadow`（`:789-791`）。
3. `probeSchema` 失败 → `emptySyncResult(schema.message)`（`:796`）。游标：`options.forceFull===true` 取 `'0'`，否则 labState `zotero.lastVersion`（`:798-800`）。
4. 读取：`readCollections`（路径映射 `pathByCollectionId`，`:802-806`）→ `readItemDeltas`/`readDeletedDeltas`/`readAttachments`/`readCreators`/`readItemCollections`/`readAnnotationDeltas`/`readMaxVersion`（`:808-815`）。
5. 现有来源映射：`sourceByItemKey`/`sourceByAttachmentKey`（`:817-825`）。
6. 事务外预构建 `preparedItems`（`:832-907`）：附件路径经 `resolveZoteroAttachmentPath`（`cslab-zotero-format.ts`）；**无本地 PDF 仍登记元数据**（`:861-863` 注释：hasFile 由读取侧按物理存在性计算，避免纯 DOI 条目消失）；实体 `locked:true`、`layerType:'lit'`、URI 复用 existing 或 `buildCsLabUri(labId,'lit',`zotero-${item.key}`)`（`:866-868`）；metadataJson 含 authors/year/doi/publication/abstract/collections/url（`:874-882`）。
7. 预构建 `preparedAnnotations`（`:909-931`）：缺 `annotationKey`/`parentAttachmentKey`/无法匹配 source/`parseZoteroAnnotationPosition` 返回 null 均跳过。
8. 写入分三段：集合表单短事务（`:933-947`）；文献实体按 `ZOTERO_TX_BATCH_SIZE=200` 分批事务（`:949-963`，`upsertEntity(revision: nextLabRevision)` + `upsertLiteratureSource`，计 added/updated，批间 `setImmediate` 让出）；批注**在实体提交后**分批写（`:965-975`，注释：保证外键有效）。
9. 删除增量（`:977-990`）：按 `sourceByItemKey` 找到实体 → `upsertEntity({…, unsupported:'Zotero 中已删除'})`——**软删标记，不物理删除文献**，`removed++`。
10. 游标推进（`:992-997`）：全部批次成功后单事务写 `zotero.lastVersion = max(cursor, maxVersion)`、`zotero.lastSyncedAt`、`zotero.dataDir`——注释：中途失败保持旧游标、下次幂等重放（`:991`）。
11. 返回 `{ok:true, added, updated, removed, annotationCount, collectionCount, lastVersion, message}`；`shadow.degraded` 时 message 前置 `'WAL 暂被 Zotero 锁定，本次同步基于主库快照'`（`:999-1011`）。
12. 异常兜底：整段 try/catch 返回 `emptySyncResult(错误信息)`（`:1016-1019`）——红线②「绝不抛未捕获异常」。

### 3.3 WAL 监听（`:1078-1173`）

- `startZoteroWatcher`（`:1078-1147`）：已有监听返回 `{watching:true,'监听已开启'}`（幂等）；发现不 ready 直接返回 message；动态 `import('chokidar')` 兼容 `module.watch ?? module.default?.watch`（`:1092-1098`），不可用返回 `'Chokidar 不可用，无法监听 Zotero'`；监听 `zotero.sqlite-wal` 与 `zotero.sqlite`（`ignoreInitial:true`、`awaitWriteFinish{400,100}`、`ignorePermissionErrors:true`，`:1100-1108`）；`createDebouncer(fn, 350, 1500)`（`cslab-debounce.ts`）防抖触发 `syncZoteroLibrary`（`running` 标志防重入，`:1110-1131`），成功 `onChange(result)`、失败 `console.warn`；handle.close = `debounced.cancel()` + `watcher.close()`（`:1133-1139`）。
- `stopZoteroWatcher`（`:1149-1155`）/`stopAllZoteroWatchers`（`:1158-1163`）：close 失败静默（`.catch(()=>undefined)`）。
- 测试辅助：`isZoteroWatching`（`:1166`）、`__resetZoteroWatchersForTest`（`:1171-1173`）。

## 4. 调用者与调用链

入向（冻结树 `apps/**`、`packages/**` 检索，注意与 `packages/shared/src/utils/cslab-zotero.ts` 消费者区分）：

- `apps/electron/src/main/index.ts:220`：`import { stopAllZoteroWatchers } from './lib/cslab/cslab-zotero'`（应用退出清理）。
- `apps/electron/src/main/lib/cslab/cslab-manager.ts:38`：`stopZoteroWatcher`（deleteLab 前停监听，调用点 `cslab-manager.ts:154`）。
- `apps/electron/src/main/lib/cslab/cslab-router.ts:142` 导入块（同步/状态/列表 API 经路由暴露）。
- `apps/electron/src/main/lib/cslab/index.ts:29` `export * from './cslab-zotero'`。
- 测试：`apps/electron/src/main/lib/cslab/cslab-zotero.test.ts`（见 §9）。
- `getZoteroSource`/`listStoredZoteroAnnotations` **全树无消费者**（冻结树 `apps/**`、`packages/**` 全扩展名检索仅命中本文件定义/导出）：`cslab-router.ts` 的 cslab-zotero 导入块（`:135-142`）不含二者；路由 URL 注册实际走 `cslab-literature` 的 `getLiteratureFilePath`/`getLiteratureItem`（`cslab-router.ts:144` 导入，`:1109/:1127-1129` 调用）。`:1067` 注释为陈旧自述。

出向：`node:fs`（createReadStream/createWriteStream/existsSync/promises，`:11`）、`node:os homedir`（`:12`）、`node:path`（`:13`）、`node:stream/promises pipeline`（`:14`）、`./cslab-debounce`（createDebouncer，`:15`）、`@profer/shared` 类型（`:16-22`）、`./cslab-db`（16 个函数+3 类型，`:23-41`）、`./cslab-paths`（assertLabId/resolveLabDir，`:42`）、`./cslab-uri`（buildCsLabUri，`:43`）、`./cslab-literature`（getLiteratureItem/listLiterature/listLiteratureAnnotations，`:44`）、`./cslab-zotero-format`（parseZoteroAnnotationPosition/resolveZoteroAttachmentPath，`:45-48`）、`./cslab-zotero-bridge`（getZoteroBridgeStatus，`:49`）、`node:sqlite`（`require` 动态加载，`:330`）、`chokidar`（动态 import，`:1092`）。无网络调用（Zotero 桥状态经 `cslab-zotero-bridge`，实现未读——推断）。

## 5. 数据 I/O、读写与副作用

- 读：Zotero 数据目录（`zotero.sqlite`/`-wal`/`-shm`、prefs.js、storage 附件路径）；实验室 `db/zotero-shadow/` 影子副本（只读打开 `PRAGMA query_only=ON`）；`central_meta.sqlite`（labState/文献源/批注/实体）。
- 写：`db/zotero-shadow/`（每次同步前清空重建，`:292-297`）；`central_meta.sqlite`——zotero_collections、literature_sources、entities（locked:true 的 lit 实体）、zotero_annotations、lab_state（`zotero.dataDir`/`zotero.lastVersion`/`zotero.lastSyncedAt`）。**不写 Zotero 源目录**（红线③；影子副本写在实验室内）。
- 原子性：写入全部走 `withTransaction` 分批（200/批，批间 `setImmediate`）；游标推进独立事务且最后执行（失败不推进，幂等重放）。
- 副作用：`console.warn`（WAL 自动同步失败 `:1122`）；`process` 无操作；监听器生命周期经 `watchers` Map。
- 并发：`syncingLabs` 单实验室互斥（`:777-780`）；监听回调 `running` 标志防重入（`:1111-1113`）。

## 6. 分支、失败、取消与恢复

- 环境缺失：`zotero.sqlite` 未找到 → `not-found`（列出 searched）；chokidar 缺失 → 监听不可用 message；结构不符 → `schema-unsupported`（缺表名/缺 version 列，`:366-377`）；主库被占用 → 抛后被 `discoverZotero`/`syncZoteroLibrary` 转为 `no-permission`/`emptySyncResult`。
- EBUSY 防护：`copyWithRetry` 4 次延迟重试 → 只读流降级（`flags:'r'`，`:272-280`）→ 仍忙返回 false；主库 false 抛错，WAL false 走 degraded（删残留 wal/shm 以主库快照打开，`:317-321`）。
- 同步失败：任何异常 → `emptySyncResult(消息)`（不抛，`:1016-1019`）；游标不推进（`:991-992`）；下次同步幂等重放。
- 删除恢复：Zotero 删除是软标记 `unsupported:'Zotero 中已删除'`（`:981-989`）；实体保留可追溯。
- 取消：无 AbortSignal；`sleep` 用 unref timer 不阻止退出。恢复：`forceFull` 全量重放、`setZoteroDataDir` 重置游标、监听自动触发增量。

## 7. 权限与权威状态

- 无权限分支：无 sender/role 检查；安全模型是**只读影子副本**（`PRAGMA query_only=ON`，`:332`）+ 实验室目录写隔离（红线）。
- 权威状态：Zotero 库是文献元数据权威（本文件只读）；`central_meta.sqlite` 的 zotero_* 表与 lit 实体是实验室侧镜像权威（本文件是唯一同步写方）；`zotero.lastVersion` 高水位游标（labState）是增量权威；`zotero.dataDir` 记忆值（labState）优先于 prefs/默认候选（`:236-242`）。
- 实体 `locked:true`（`:892`）语义由 `cslab-db`/消费方解释（推断：防用户编辑，本文件未读到守卫实现）。

## 8. 修改影响面

- 改同步主流程/记录形状 → 影响 `cslab-literature`（读取侧展示，hasFile/annotationCount）、`cslab-iron-cage`（listAssets 读 unsupported 标记）、路由层 API、`cslab-manager.ts`（删除时停监听）。
- 改影子副本/探查逻辑 → 影响 `discoverZotero`/`getZoteroStatus` 的可用性状态机（not-found/ready/schema-unsupported/no-permission）。
- 改 `REQUIRED_TABLES`/列名探查 → 版本兼容性（Zotero 6/7 schema 差异）。
- 改监听 → `apps/electron/src/main/index.ts:220` 退出清理、`cslab-manager.ts:154` 删除前停止。
- 需同步测试：`cslab-zotero.test.ts`（同步 5 用例）；`cslab-zotero-format` 的断言也在该测试文件（归属交叉，见 `cslab-zotero.test.ts.md`）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/cslab/cslab-zotero.test.ts`（263 行，2 describe、10 test；NOT_RUN）。夹具：合成 `zotero.sqlite`（`createZoteroDatabase`，`:22-86`，真实 `node:sqlite` WAL 模式建 10 表 + 种子数据：1 条目 ABC123 + PDF 附件 ATT999 + 批注 ANNO1 + 2 集合 Research>Battery + EAV 元数据/作者 Ada Lovelace）；`beforeAll`（`:88-98`）建 storage/ATT999/paper.pdf + PROFER_CONFIG_DIR 重定向 + createLab。同步用例（`describe('Zotero 增量同步')`）：

- `:121-141` 首次同步：`result.ok===true`、`added===1`、`annotationCount===1`、`collectionCount===2`；`listZoteroLiterature` 1 条、title/doi/source==='zotero'、`authors===['Ada Lovelace']`（西文名前名后）、`collections===['Research > Battery']`（递归 CTE 路径）、`hasFile===true`、`annotationCount===1`。
- `:143-152` 批注解析：`annotations[0].type==='highlight'`、`color==='#ffd400'`、`text==='SEI layer'`、`position.rotation===90`。
- `:154-161` 高水位：二次同步 `added/updated/removed` 全 0（游标增量）。
- `:163-182` 删除条目：UPDATE `deleted=1, version=20` → `removed===1`；`listAssets`（`cslab-iron-cage`）中 lit 实体 `unsupported==='Zotero 中已删除'`（软删断言）。
- `:184-215` 无 PDF 条目+中文作者：插入 META01（无附件）→ `added===1`、`hasFile===false`、`authors===['张三']`（CJK 姓前名后）、doi 断言。

`describe('Zotero 批注四向仿射投影')`（describe `:217`）5 用例（`:218/:228/:238/:248/:258` 起，止于 `:263` 文件末）测的是 `cslab-zotero-format.ts` 的 `zoteroRectToViewport`（0/90/180/270 四向矩形投影）与 `parseZoteroAnnotationPosition`（`'not-json'`→null、缺 rects→`[]`）——被测符号不在本文件（跨文件归属：断言对象是 `cslab-zotero-format`，此处仅登记）。

未覆盖：`startZoteroWatcher`/`stopZoteroWatcher`（监听链路无断言）、`discoverZotero` 各降级分支（schema-unsupported/no-permission/degraded WAL）、`setZoteroDataDir` 错误分支、`forceFull`、并发互斥（`syncingLabs`）、prefs.js 发现、`getZoteroSource`/`listStoredZoteroAnnotations`。mock 边界：无 mock——真实 SQLite/文件系统/影子副本；监听测试缺位。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 导出与行号 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-zotero.ts:117-1173` |
| 影子副本 + query_only 只读打开 | 已证实 | `:290-335` |
| EBUSY 重试 0/100/200/400 + 只读流降级 | 已证实 | `:261-281` |
| WAL 失败删残留、degraded 标记、主库快照继续 | 已证实 | `:317-327` |
| 游标最后推进、失败幂等重放 | 已证实 | `:991-997` |
| 删除软标记 unsupported 不物理删 | 已证实 | `:977-990` |
| 无 PDF 仍登记元数据 | 已证实 | `:861-863` |
| 批注在外键实体提交后写 | 已证实 | `:965-975` |
| 同步互斥 syncingLabs | 已证实 | `:777-780/:1021` |
| CJK 姓名姓前名后 | 已证实 | `:516-522` + test:252 |
| 监听防抖 350/1500 + 重入保护 | 已证实 | `:1110-1131` |
| `locked:true` 语义（防编辑守卫存在） | 推断 | `:892` 赋值；守卫实现未读 |
| `cslab-zotero-bridge` 桥行为 | 未知 | 实现未读（外部桥状态） |
| 运行结果/真实 Zotero 库兼容性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 发现链（candidates/prefs/resolveDataDir） | §3.1 | 154-259 | covered |
| 影子副本（copy/refresh/open） | §3.2 | 261-335 | covered |
| 查询集（collections/deltas/attachments/creators/annotations） | §3.2 | 379-655 | covered |
| `syncZoteroLibrary` 全流程 | §3.2 | 774-1022 | covered |
| 状态/发现/设置（status/discover/setDataDir） | §3.1 | 658-759 | covered |
| 列表转发 API（5 个） | §2 | 1049-1075 | covered |
| WAL 监听（start/stop/reset） | §3.3 | 1078-1173 | covered |
| 同步 5 用例断言 | §9 | test:121-252 | covered |
| 监听/降级分支/互斥 | §9 | — | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
