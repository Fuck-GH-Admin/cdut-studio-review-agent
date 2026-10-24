---
path: apps/electron/src/main/lib/cslab/cslab-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e33200a0993c86126286a10c6ecf05dfda547c60
sha256: df2ceec739881138c3f9239a1675806468412cbdc57bd2c281b3f41e51fc1371
lines: 227
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-manager.ts

## 1. 结论与边界

CSLab 实验室管理器：课题级沙箱的**创建、列举、打开、重命名、置顶、归档、删除与快照**（运行时代码）。每个实验室完全自包含：`lab.manifest.json` + `db/central_meta.sqlite` + `vault/` + `runtime/`（文件头 `apps/electron/src/main/lib/cslab/cslab-manager.ts:1-6`）。

边界：路径/清单原语委托 `apps/electron/src/main/lib/cslab/cslab-paths.ts`；SQLite/实体计数委托 `apps/electron/src/main/lib/cslab/cslab-db.ts`；不注册 IPC、不直接面向渲染端；不管理图层/文献等业务数据（快照只读计数与资产摘要）。

## 2. 导出与关键符号

导出 10 函数（`export` 逐条核对）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `listLabs` | 导出函数 | 58 | `(): CsLabLab[]` | 列出全部可读实验室 |
| `getLab` | 导出函数 | 62 | `(labId: string): CsLabLab \| null` | 读单个实验室清单 |
| `createLab` | 导出函数 | 66 | `(input: CsLabCreateLabInput): CsLabLab` | 创建沙箱+清单+初始化 SQLite |
| `openLab` | 导出函数 | 95 | `(labId: string): CsLabLab` | 打开并记录 `last_opened_at` |
| `renameLab` | 导出函数 | 106 | `(labId: string, newName: string): CsLabLab` | 重命名（不改 labId/目录） |
| `togglePinLab` | 导出函数 | 114 | `(labId: string): CsLabLab` | 置顶切换（不改 updatedAt） |
| `toggleArchiveLab` | 导出函数 | 125 | `(labId: string): CsLabLab` | 归档/解归档（恢复归档前状态） |
| `deleteLab` | 导出异步函数 | 172 | `(labId: string): Promise<string[]>` | 彻底删除，返回被解绑会话 ID |
| `getLabSnapshot` | 导出异步函数 | 206 | `(labId: string): Promise<CsLabLabSnapshot>` | 快照（计数/资产/Python 能力） |

（`deleteLab`/`getLabSnapshot` 为 async，其余同步——`openLab` 实为同步函数 `:95`。）内部符号：`ALL_LAYER_TYPES`（`:43-56`，12 种图层枚举数组，未导出）、`stopLabWatchers`（`:148-170`，内部）。

## 3. 内部逻辑与关键流程

### 3.1 创建与打开（`apps/electron/src/main/lib/cslab/cslab-manager.ts:66-103`）

- `createLab`（`:66-93`）：名称校验——trim 后空抛 `'实验室名称不能为空'`（`:68-69`）、>60 字抛 `'实验室名称不能超过 60 个字符'`（`:70`）；`labId = createLabId(name)`；`rootPath = input.rootPath?.trim() || getDefaultLabDir(labId)`（`:74`）；`labDir = ensureLabLayout(labId, rootPath)`（内含 `assertSafeLabRootPath`，主目录等敏感路径在此被拒）；manifest 字段：`code = 'CSLab-' + labId.slice(-6).toUpperCase()`（`:80`）、`description` 默认 `'尚未填写研究方向'`（`:82`）、`tags` trim+过滤空（`:83`）、`members: 1`、`status: '运行中'`、时间戳 `now`；`writeLabManifest` 后**立即** `getCsLabDatabase(join(labDir,'db','central_meta.sqlite'))` 懒建表前置（`:91-92` 注释：首屏快照与后续摄取无需再懒建表）。
- `openLab`（`:95-103`）：清单缺失抛 `'实验室不存在或清单损坏'`（`:98`）；`setLabState(db, 'last_opened_at', String(Date.now()))`（`:101`）——**打开即写库**。

### 3.2 元数据操作（`:106-146`）

- `renameLab`（`:106-112`）：名称校验同 createLab（两处文案一致）；`updateLabManifest(labId, { name })`。
- `togglePinLab`（`:114-123`）：清单缺失抛错；`pinned = !current.pinned`；`pinnedAt = pinned ? Date.now() : undefined`；注释明示**不修改 updatedAt** 防「置顶」被误判内容更新（`:113`）——`updateLabManifest` 补丁不含 `updatedAt`，合并后保留原值（配合 `cslab-paths.ts:220` 的合并语义）。
- `toggleArchiveLab`（`:125-146`）：归档——`previousStatus = current.status === '已归档' ? '运行中' : current.status`（`:131`，防御归档态残留）；写 `{archived:true, archivedAt:Date.now(), status:'已归档', statusBeforeArchive: previousStatus}`。解归档——写 `{archived:false, archivedAt:undefined, status: current.statusBeforeArchive ?? '运行中', statusBeforeArchive:undefined}`（`:139-145`）。

### 3.3 删除（`:148-204`）

- `stopLabWatchers`（`:148-170`）：顺序停 4 类监听（Vault=`stopVaultWatcher`、自定义工具=`stopLabToolWatcher`、共享盘=`stopShareWatcher`、Zotero=`stopZoteroWatcher`），单项失败 `console.warn` 不阻断。
- `deleteLab`（`:172-204`）：
  1. 清单缺失仅 `console.warn('清单缺失或已损坏，继续执行幂等清理…')`（`:176-178`）；
  2. `stopLabWatchers`；
  3. 会话解绑——遍历 `listAgentSessions(true)`（含归档会话），`session.cslabLabId === labId` 者 `updateAgentSessionMeta(session.id, { cslabLabId: undefined, archived: session.archived })`（`:187-192`，注释：显式传 `archived` 防止自动解归档）；逐会话 try/catch warn；收集 `unboundSessionIds`；
  4. 只关闭目标库连接：`closeCsLabDatabase(<labDir>/db/central_meta.sqlite)`、`closeHpcDatabase(labId)`、`closeShareDatabase(labId)`、`closeCsLabVaultCache(labId)`（`:196-199`，注释：避免误伤其它实验室的后台作业轮询与查询）；
  5. `deleteLabFiles(labId)`（物理删除+注销索引）；返回 `unboundSessionIds`。
- 幂等（`:170-172` 注释）：清单缺失/目录部分删除仍继续清理。

### 3.4 快照（`:206-227`）

`getLabSnapshot`：清单缺失抛错（`:209`）；`countEntities(db, labId)` 后按 `ALL_LAYER_TYPES` 12 项补零（`:213-216`）；`listAssets(labId, { noteLimit: 20 })` 截 20（`:218-219`）；`await getPythonCapability()`；返回 `{ lab, counts, recentAssets, python }`。

## 4. 调用者与调用链

入向（冻结树 `apps/**`、`packages/**` 检索 `cslab-manager` 导入与符号）：

- `apps/electron/src/main/lib/cslab/cslab-router.ts:97` 导入块（`createLab` 等经路由分发到渲染端/IPC——路由细节见 `cslab-router.ts.md`）。
- `apps/electron/src/main/lib/cslab/cslab-demo.ts:25`（`createLab, listLabs`）。
- `apps/electron/src/main/lib/cslab/cslab-science.ts:1`（`getLab`）、`apps/electron/src/main/lib/cslab/cslab-window-manager.ts:22`（`getLab`）。
- `apps/electron/src/main/lib/cslab/index.ts:24` `export * from './cslab-manager'`。
- 测试：`cslab-manager.test.ts`（12 用例，§9）及大量 `cslab-*.test.ts` 经 `await import('./cslab-manager')` 用 `createLab` 建临时实验室（如 `cslab-canvas.test.ts:28`、`cslab-zotero.test.ts:105`、`cslab-graphrag.test.ts:19` 等，冻结树检索命中 20+ 测试文件）。

出向（import 行）：`./cslab-paths`（createLabId/deleteLabFiles/ensureLabLayout/getDefaultLabDir/listLabManifests/readLabManifest/resolveLabDir/updateLabManifest/writeLabManifest，`:13-23`）；`./cslab-db`（closeCsLabDatabase/countEntities/getCsLabDatabase/setLabState，`:24-29`）；`./cslab-hpc-db`（closeHpcDatabase，`:30`）；`./cslab-share-db`（closeShareDatabase，`:31`）；`./cslab-vault-cache`（closeCsLabVaultCache，`:32`）；`./cslab-canvas-sync`（stopVaultWatcher，`:33`）；`./cslab-tool-registry`（stopLabToolWatcher，`:34`）；`./cslab-share-watcher`（stopShareWatcher，`:35`）；`./cslab-zotero`（stopZoteroWatcher，`:38`）；`../agent-session-manager`（listAgentSessions/updateAgentSessionMeta，`:39`）；`./cslab-iron-cage`（listAssets，`:40`）；`./cslab-python`（getPythonCapability，`:41`）；`@profer/shared` 类型（`:9-13`）；`node:path join`（`:8`）。无网络调用。

## 5. 数据 I/O、读写与副作用

- 磁盘（经 `cslab-paths`）：`lab.manifest.json` 写（createLab `:90`、rename/pin/archive 经 updateLabManifest）；目录骨架创建（ensureLabLayout）；物理删除（deleteLabFiles）。
- SQLite：createLab 立即初始化 `db/central_meta.sqlite`（`:91`）；openLab 写 `lab_state.last_opened_at`（`:101`）；快照读实体计数（`:212`）。删除前关闭 4 类连接（`:196-199`）。
- 会话存储：解绑写 `agent-session-manager` 元数据（`:187-192`）。
- 副作用：`console.warn`（`:177/:183/:191`）；无窗口/网络/遥测。
- 幂等：deleteLab 二次调用安全（`deleteLab` `:172-204` 幂等清理 + `deleteLabFiles` finally 注销）；createLab 非幂等（每次新 labId 随机后缀）。

## 6. 分支、失败、取消与恢复

- 名称非法：createLab/renameLab 抛空/超长两类文案（`:68-70/:107-109`）。
- 清单缺失：getLab 返回 `null`（经 readLabManifest）；openLab/toggleArchiveLab/getLabSnapshot 抛 `'实验室不存在或清单损坏'`（`:98/:116/:127/:209`）；deleteLab 降级为幂等清理（`:176-178`）。
- 删除失败：监听停止/会话解绑单项失败均 warn 继续（`:158-168/:189-194`）；物理删除失败由 `deleteLabFiles` warn 后仍注销索引（`cslab-paths.ts:271-277`）。
- 取消：无 AbortSignal；deleteLab/getLabSnapshot 为异步但无取消机制。
- 恢复：删除是「尽力清理 + 恒注销」；归档状态机可逆（toggleArchiveLab 往返恢复 `statusBeforeArchive`）；无其它持久恢复逻辑。

## 7. 权限与权威状态

- 无权限分支：无 sender/role 检查（全文件无相关断言）；安全依赖 `cslab-paths` 的路径守卫（`assertSafeLabRootPath` 在 createLab/删除链路生效）。
- 权威状态：`lab.manifest.json`（经 `cslab-paths` 归一）是 name/status/pinned/archived 权威；`lab_state` 表（`setLabState`）记 `last_opened_at`；会话↔实验室绑定权威在 `agent-session-manager` 元数据（`cslabLabId` 字段），deleteLab 是解绑动作的权威执行方。
- 归档字段联动（`archived/status/statusBeforeArchive/archivedAt`）是本文件定义的状态机（`:125-146`），读侧归一在 `cslab-paths.ts:174-178`。

## 8. 修改影响面

- 改 CRUD/状态机影响调用方：`cslab-router.ts`（IPC 分发）、`cslab-demo.ts`、`cslab-science.ts`、`cslab-window-manager.ts` 及渲染端实验室管理界面（经路由）。
- 改删除顺序（先关连接再删目录，`:196-201`）影响 Windows EBUSY/EPERM 防护（注释 `:168-170`），破坏顺序会引发句柄占用删除失败。
- 改 `ALL_LAYER_TYPES` 需同步 `CsLabLayerType`（`@profer/shared`）与快照计数消费方（UI 快照面板）。
- 改 createLab 懒建表前置（`:91`）影响首屏快照与摄取路径假设。
- 需同步测试：`cslab-manager.test.ts`（骨架清单 `:36-42`、归档往返 `:96-111`、删除解绑 `:113-129`、幂等 `:131-144`）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/cslab/cslab-manager.test.ts`（174 行，3 describe、12 用例；NOT_RUN 本轮未执行）。逐用例（设置/动作/真实断言）：

- `:28-48` 创建骨架：createLab('固态电池界面测试',tags) → `lab.id` 匹配 `/^[a-z0-9-]+$/`、`status==='运行中'`、9 个目录 `existsSync===true`（`:36-42`）、manifest 与 sqlite 文件存在（`:43-44`）、`listLabs` 含之（`:46`）、`openLab(id).name` 一致（`:47`）。
- `:50-60` 快照：`snapshot.lab.id` 一致、`counts.raw/table === 0`、`typeof python.available === 'boolean'`、`python.note.length > 0`。
- `:62-67` 名称边界：`'   '` 抛 `'实验室名称不能为空'`、61 字符抛 `'不能超过 60'`。
- `:70-79` 重命名：`renameLab(id,'  重命名后实验室  ')` → `name==='重命名后实验室'`、`getLab` 同步；空/超长抛错（`:76-77`）。
- `:81-94` 置顶：`togglePinLab` → `pinned===true`、`typeof pinnedAt === 'number'`、`listLabs()[0].id` 为置顶者；再切 → `pinned===false`、`pinnedAt` undefined。
- `:96-111` 归档：预置 `status:'调试中'`（`updateLabManifest`，`:98`）→ 归档后 `archived===true`、`status==='已归档'`、`statusBeforeArchive==='调试中'`；解归档 → `archived===false`、`status==='调试中'`、`archivedAt` undefined。
- `:113-129` 删除解绑：`createAgentSession` + `updateAgentSessionMeta({cslabLabId})` → `deleteLab` → 目录消失、`listLabs` 移除、`listAgentSessions(true)` 中 `cslabLabId` undefined（`:124-127`）。
- `:131-144` 幂等删除：只读文件（`chmod 0o444`）删除成功；二次 `deleteLab` `resolves.toEqual([])`（`:142`，验证幂等返回空解绑列表）。
- `:148-173` 安全边界（属 `cslab-paths` 断言，见 `cslab-paths.ts.md` §9）；`:170-173` `createLab({rootPath: homedir()})` 抛 `'安全拒止'`（间接覆盖本文件 createLab→ensureLabLayout 链）。

mock/边界：无 mock；`beforeAll` 用 `mkdtempSync(tmpdir())` + `process.env.PROFER_CONFIG_DIR` 重定向配置根（`:12-15`），`afterAll` 关全部库并清目录（`:17-25`）；全部走真实文件系统与真实 SQLite。未覆盖：`stopLabWatchers` 失败分支、会话解绑单项失败分支、`openLab` 的 `last_opened_at` 值、`getLabSnapshot` 的 `recentAssets` 内容、deleteLab 真实监听存在时的停止顺序。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出与行号、名称校验双文案 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-manager.ts:58-227` |
| createLab 立即初始化 SQLite | 已证实 | `:91-92` |
| openLab 写 `last_opened_at` | 已证实 | `:101` |
| togglePinLab 不改 updatedAt（补丁无该字段） | 已证实 | `:114-123` + `cslab-paths.ts:220` 合并语义 |
| 归档状态机往返恢复 | 已证实 | `:125-146` |
| deleteLab 解绑含归档会话、显式传 archived 防自动解归档 | 已证实 | `:183-192`（行为+注释） |
| 删除只关目标实验室 4 类连接 | 已证实 | `:196-199` |
| deleteLab 幂等（二次返回 `[]`） | 已证实（静态+断言存在） | `:172-204`；`cslab-manager.test.ts:142` 有断言（NOT_RUN） |
| `updateAgentSessionMeta` 自动解归档行为存在 | 推断 | 仅注释 `:190` 自述，未读该文件实现 |
| 快照 12 图层补零语义 | 已证实 | `:213-216` |
| 测试断言运行通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createLab`（校验/骨架/manifest/DB 前置） | §3.1 | 66-93 | covered |
| `openLab`/`listLabs`/`getLab` | §3.1/§4 | 58-103 | covered |
| `renameLab`/`togglePinLab`/`toggleArchiveLab` | §3.2 | 106-146 | covered |
| `stopLabWatchers`/`deleteLab` | §3.3 | 148-204 | covered |
| `getLabSnapshot` | §3.4 | 206-227 | covered |
| 12 用例断言 | §9 | test:28-173 | covered |
| 监听停止失败/解绑失败分支 | §6 | 148-194 | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
