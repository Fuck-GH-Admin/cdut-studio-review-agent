---
path: apps/electron/src/main/lib/cslab/cslab-vault-index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 762fea4f8ac7763462201bb5eeb12600f90283b3
sha256: c05126f58e3c9a9f32576cb5c4915ee61815bc4ed8e6d3c9af67dadacf544ccc
lines: 740
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-vault-index.ts

## 1. 结论与边界

CSLab Vault（`vault/notes`）笔记索引服务（运行时代码）：Markdown/JSON Canvas 笔记的解析、索引构建、缓存复用、检索排序、反向链接与单文件增量索引。设计要点（文件头 `apps/electron/src/main/lib/cslab/cslab-vault-index.ts:1-8`）：Obsidian 是 Markdown 唯一事实源；索引缓存写 `db/vault_cache.sqlite`（payload 紧凑 JSON）；`mtime+size` 未变完全复用缓存；坏缓存回退物理重解析、绝不阻断。

边界：缓存库读写委托 `apps/electron/src/main/lib/cslab/cslab-vault-cache.ts`；实体表同步委托 `apps/electron/src/main/lib/cslab/cslab-db.ts`；Canvas JSON 解析委托 `@profer/shared` 的 `parseCanvasDocument`；不注册 IPC（消费方是 `cslab-router.ts`）；不写 `vault/notes` 内容（只读笔记、写索引）。

## 2. 导出与关键符号

导出 11 项 = 10 函数 + 1 接口（`export` 逐条核对）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `VaultNoteRecord` | 导出接口 | 53 | `{relPath, kind:'md'|'canvas', title, tags, outlinks, linkTargets, blockIds, excerpt, contentHash?, size, mtimeMs, updatedAt}` | 笔记索引记录 |
| `parseMarkdownNote` | 导出函数 | 150 | `(relPath, content, stat): VaultNoteRecord` | Markdown 解析（纯函数） |
| `parseCanvasNote` | 导出函数 | 204 | `(relPath, content, stat): VaultNoteRecord` | JSON Canvas 解析（纯函数） |
| `rebuildVaultIndex` | 导出函数 | 394 | `(labIdInput, options?: {force?}): Promise<CsLabVaultIndexResult>` | 全量重建（in-flight 去重） |
| `listVaultNotes` | 导出函数 | 549 | `(labIdInput, limit = 500): CsLabVaultNoteSummary[]` | 列出摘要（限 1-2000） |
| `searchVaultNotes` | 导出函数 | 560 | `(labIdInput, query, limit = 50): CsLabVaultNoteSummary[]` | 关键词检索（限 1-300） |
| `getVaultIndexStatus` | 导出函数 | 591 | `(labIdInput): CsLabVaultIndexStatus` | 索引状态（计数/fingerprint） |
| `readVaultNote` | 导出异步函数 | 628 | `(labIdInput, relPath): Promise<CsLabVaultReadResult>` | 读单篇（内容+摘要+出链） |
| `getNoteBacklinks` | 导出函数 | 683 | `(labIdInput, relPath): CsLabVaultNoteSummary[]` | 反向链接列表 |
| `indexSingleNote` | 导出异步函数 | 704 | `(labIdInput, relPath): Promise<void>` | 单文件增量索引 |
| `__clearVaultContentLru` | 导出函数 | 738 | `(): void` | 测试清理内存 LRU |

关键内部符号：`sha256`（`:70`）、`noteUri`（`:74`，`note-<sha1(relPath) 前 8 位>` + `buildCsLabUri(labId,'note',uuid)`）、`normalizeLinkTarget`（`:79`，去别名 `|`/锚 `#`/`.md` 后缀、取 basename 小写）、`parseFrontmatter`（`:88`）/`parseFrontmatterMeta`（`:94-134`，title/tags 内联与 `- ` 列表两式）、`stripMarkdown`（`:136-148`）、`decodePayload`（`:239-248`，坏 payload 返回 null）、`walkNoteFiles`（`:250-272`，跳过 `.` 开头目录、`RESERVED_DIRS`=`runs/protocols`、只收 `md|canvas`）、`toNoteRelPath`（`:274`，`vault/notes/…` POSIX 相对路径）、`yieldToEventLoop`（`:279`）、`noteKeys`（`:283`，文件名 stem + title 小写）、`buildBacklinkIndex`（`:291-301`，target→引用者集合）、`summarizeRecord`（`:303-328`）/`summarizeWithBacklinks`（`:330-337`）、`syncEntities`（`:339-390`，实体表批量同步）、`indexInFlight`（`:392`，`Map<labId, Promise>`）、`rebuildVaultIndexInternal`（`:408-536`）、`loadRecords`（`:538-547`）、`scoreVaultRecord`（`:581-589`）、`ensureVaultLinks`（`:614-626`，旧库一次性回填）。常量：`RESERVED_DIRS`（`:46`）、`MAX_EXCERPT=280`（`:47`）、`CACHE_YIELD_EVERY=50`（`:48`）、`CONTENT_LRU_LIMIT=200`（`:49`）、`LINKS_BUILT_AT_KEY='links_built_at'`（`:51`）；模块级 `contentLru: Map<labId:relPath, {content, at}>`（`:68`）。

## 3. 内部逻辑与关键流程

### 3.1 解析（`apps/electron/src/main/lib/cslab/cslab-vault-index.ts:150-237`）

- `parseMarkdownNote`（`:150-202`）：frontmatter 提取（`---` 围栏正则，`:88-92`）→ `title` 取 meta.title || 首个 H1 || 文件名去 `.md`（`:155`）；wikilink `[[…]]` 全文扫描产出 `outlinks`（原文）与 `linkTargets`（`normalizeLinkTarget` 归一，`:157-166`）；块 ID `^xxx` 扫描（`:168-173`）；标签 = frontmatter tags + 内联 `#tag`（正则含中文/`/`/`-`，标题的 `# ` 因带空格不误判，`:175-184`）；`excerpt = stripMarkdown(body).slice(0,280)`（`:186`）。纯函数，`updatedAt = stat.mtimeMs`。
- `parseCanvasNote`（`:204-237`）：`parseCanvasDocument(content)`（`@profer/shared`）；title 取首个文本节点首行（去 `#`）或文件名去 `.canvas`；`outlinks` = 节点 `file` 字段；`tags:[]`、`blockIds:[]`；excerpt 由全部文本拼接 strip 后截 280。

### 3.2 全量重建（`:392-536`）

- 入口 `rebuildVaultIndex`（`:394-406`）：按 labId 做 **in-flight 去重**——同 labId 并发调用复用同一 Promise（`indexInFlight`，`:392/:397-405`）。
- `rebuildVaultIndexInternal`（`:408-536`）：
  1. `assertLabId`；`getCsLabVaultCache(labId)`；`notesRoot = resolveLabRelativePath(labId,'vault/notes')` + `fs.mkdir(recursive)`（`:414-415`）；
  2. 读旧行 Map、`walkNoteFiles` 枚举（`:418-419`）；
  3. 逐文件（`:426-485`）：stat 失败跳过（`:431-435`）；缓存复用条件 `!options.force && previous.size===stat.size && |ΔmtimeMs|<1` → `decodePayload` 成功即复用（`reused++`，每 50 个 `yieldToEventLoop` 让出主线程，`:439-452`）；坏缓存 `deleteVaultIndexRow` 后回退读文件（`:453-455`）；读文件/解析失败分别 `continue`/`console.warn('[CSLab] 笔记解析失败，已跳过')`（`:457-471`）；解析成功记 `contentHash=sha256(content)`、入 `upserts`、**失效内容 LRU**（`contentLru.delete`，`:473-483`）。
  4. removed = 旧 relPath − 现 relPath（`:487`）；fingerprint = 排序后 `relPath:mtime:size` 拼接的 sha256（`:488-497`）。
  5. `withVaultCacheTransaction` 单事务：upsert 行、删 removed、`replaceVaultLinks`（双链表同事务重建，`:500-505`）、写 meta `links_built_at`/`built_at`/`fingerprint`（`:506-508`）。
  6. `syncEntities(labId, records, removed)`（`:510`）：`withTransaction` 内逐记录 `getEntityByUri` 比对 sha/title/relPath，全同跳过（`:363-370`）；**批量共用一个 `nextLabRevision`**（`:355/:371` 注释：避免万篇逐条写 lab_state）；`upsertEntity(layerType:'note', …)`；removed 逐个 `deleteEntity`（`:386-388`）。
  7. 返回 `{status:{noteCount,canvasCount,linkCount,builtAt,fingerprint,cachedRows}, parsed, reused, removed, elapsedMs}`（`:512-534`）。

### 3.3 查询（`:538-612`）

- `loadRecords`（`:538-547`）：全表读 + 坏 payload 行**顺手删除**，按 `mtimeMs` 倒序。
- `listVaultNotes`（`:549-558`）：`limit` 夹到 1-2000（注释：IPC 默认 500 防万篇冻结渲染层，`:552-553`）；`summarizeRecord` 带反链计数。
- `searchVaultNotes`（`:560-579`）：空关键词退化为按 mtime 截断列表（`slice(0,limit)` 此分支不钳制 limit 上界，`:566-568`）；否则 `scoreVaultRecord` 打分（标题命中 +50、标签 +30、摘要 +10、路径 +5、出链 +5，同字段只计一次，`:581-589`）→ 按 `score` 降序、同分 `mtimeMs` 降序 → 截 1-300。
- `getVaultIndexStatus`（`:591-612`）：重算计数（不信任缓存计数），`builtAt`/`fingerprint` 取 meta，`cachedRows` 为行数。

### 3.4 单篇读取与反链（`:614-702`）

- `ensureVaultLinks`（`:614-626`）：旧缓存库无 `vault_links` 时按现有 payload 一次性回填（`LINKS_BUILT_AT_KEY` 有值即跳过）。
- `readVaultNote`（`:628-681`）：relPath 必须匹配 `/^vault\/notes\/.+\.md$/i` 否则抛 `'仅支持读取 vault/notes 下的 Markdown 笔记'`（`:631`，**canvas 不可读内容**）；路径经 `resolveLabRelativePath` 防穿越；内容先查 `contentLru`（miss 则读文件并按 at 淘汰最旧，容量 200，`:634-643`）；摘要优先走 SQL 单行 `getVaultIndexRow` + `countVaultBacklinks`（`:645-666`，注释：避免每次点开全表扫描）；无索引行时回退 `parseMarkdownNote` 现算（backlinkCount 记 0，`:668-679`）。返回 `{summary, content, outlinks}`（outlinks 仅索引行有，`:681`）。
- `getNoteBacklinks`（`:683-702`）：全量 `loadRecords`，按 `noteKeys`（stem+title）匹配 `linkTargets` 找引用者（排除自身），逐条 `summarizeWithBacklinks`（每条重建全量反链索引，O(n²)-ish；推断-静态：性能特征）。

### 3.5 增量索引（`:704-736`）

`indexSingleNote`（Canvas 写入后调用，`:703` 注释）：stat 失败 → 删缓存行 + `syncEntities(labId,[],[relPath])` 删除实体（`:710-715`）；否则读文件→解析→hash→`upsertVaultIndexRow`→失效 LRU→`syncEntities([record],[])`（`:717-734`）。解析异常不捕获（与全量重建不同——此处抛错由调用方处理，推断-静态差异点）。

## 4. 调用者与调用链

入向（冻结树 `apps/**`、`packages/**` 检索）：

- `apps/electron/src/main/lib/cslab/cslab-canvas-sync.ts:36`（`indexSingleNote`）。
- `apps/electron/src/main/lib/cslab/cslab-router.ts:183` 导入块（查询类符号经路由暴露，细节见 `cslab-router.ts.md`）。
- `apps/electron/src/main/lib/cslab/index.ts:39` `export * from './cslab-vault-index'`。
- 测试：`cslab-vault-index.test.ts`（`rebuildVaultIndex`/`searchVaultNotes`/`__clearVaultContentLru`）；`cslab-canvas.test.ts:491`（`rebuildVaultIndex, listVaultNotes`）。
- `rebuildVaultIndex` 的业务入口在路由/Canvas 同步链路（`cslab-canvas-sync` 写入后走 `indexSingleNote`）。

出向：`node:crypto createHash`（`:10`）、`node:fs promises`（`:11`）、`node:path basename/join/relative/sep`（`:12`）、`@profer/shared` 类型 + `parseCanvasDocument`（`:13-19`）、`./cslab-db`（deleteEntity/getCsLabDatabase/getEntityByUri/nextLabRevision/upsertEntity/withTransaction，`:20-27`）、`./cslab-paths`（assertLabId/resolveLabDir/resolveLabRelativePath，`:28`）、`./cslab-uri`（buildCsLabUri，`:29`）、`./cslab-vault-cache`（10 个缓存原语 + 类型，`:30-42`）。无网络调用。

## 5. 数据 I/O、读写与副作用

- 读：`vault/notes` 递归（walkNoteFiles/stat/readFile）；`db/vault_cache.sqlite`（索引行/links/meta）；`db/central_meta.sqlite`（实体比对）。
- 写：`vault_cache`（upsert/删行/replaceVaultLinks/meta，`withVaultCacheTransaction` 单事务，`:500-508`）；`central_meta` 实体表（`syncEntities` 事务，`:339-390`）；`fs.mkdir(notesRoot)`（`:415`）。
- 内存缓存：`contentLru`（200 条内容缓存，`:68/:634-643`）；`indexInFlight`（并发去重，`:392`）。
- 副作用：坏 payload/失效行被**顺手删除**（`loadRecords:542`、重建 `:453-455`）；`console.warn` 解析失败（`:470`）；每 50 文件让出事件循环（`:451/:484`）。
- 幂等：重建/增量索引均幂等（upsert 语义 + fingerprint 派生）；`indexSingleNote` 对已删文件幂等删除。

## 6. 分支、失败、取消与恢复

- labId 非法：`assertLabId` 抛（`cslab-paths.ts:51-53`）；`readVaultNote` relPath 非 `vault/notes/*.md` 抛 `'仅支持读取…'`（`:631`）；路径穿越由 `resolveLabRelativePath` 拒绝。
- 文件级失败均降级跳过：stat/readFile 失败 `continue`（`:431-435/:457-460`）；解析抛错 warn 后跳过（`:467-471`）；坏缓存行删除后回退物理解析（`:453-455`）；坏 payload 在 loadRecords 中删除（`:542`）。
- 并发：同 labId 重建复用 in-flight Promise（`:394-406`）；`indexSingleNote` 与 `rebuildVaultIndex` 间无互斥（推断-静态：可交错，因 upsert 幂等最终一致）。
- 取消：无 AbortSignal。恢复：索引可随时由 `rebuildVaultIndex(force)` 全量重建；`fingerprint`/`built_at` 支持状态核对；无自动恢复调度。

## 7. 权限与权威状态

- 无权限分支：无 sender/role 检查；路径安全靠 `assertLabId` + `resolveLabRelativePath`（`:631-632`）。
- 权威状态：`vault/notes` 文件系统是笔记内容唯一事实源（文件头 `:3`）；`vault_cache.sqlite` 是派生索引（可随时重建）；`central_meta` 的 note 实体行由本文件同步（`syncEntities` 是唯一写方之一，Canvas 同步链路经 `indexSingleNote`）；`note-<sha1(relPath)[:8]>` URI 约定（`:74-77`）是实体身份键。
- `links_built_at` meta（`:51/:506/:618`）是双链表构建标记（升级兼容一次性回填）。

## 8. 修改影响面

- 改 `VaultNoteRecord`/payload 形状 → 旧缓存 `decodePayload` 失效回退全量重解析（`:239-248`），并影响 `cslab-vault-cache` 行契约、路由返回类型（`@profer/shared` 的 `CsLabVault*` 类型）。
- 改打分（`scoreVaultRecord`）/排序 → 影响 `searchVaultNotes` 消费方（Vault 检索 UI，经 `cslab-router`）；有测试锚定「标题命中优先」（`cslab-vault-index.test.ts:52-61`）。
- 改 `noteUri`/`syncEntities` → 影响实体表身份与 `cslab-db` 消费方（图谱/审计按 URI 关联）。
- 改 `readVaultNote` 的 relPath 限制 → 影响路由读取入口与渲染端笔记面板。
- 需同步测试：`cslab-vault-index.test.ts`（排序）、`cslab-canvas.test.ts`（重建/列表）、`cslab-canvas-sync` 相关用例。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/cslab/cslab-vault-index.test.ts`（63 行，1 describe、1 test；NOT_RUN）：

- 夹具（`beforeAll :17-33`）：临时配置根 + `createLab('Vault 检索排序测试实验室')`；写两篇笔记——`界面阻抗.md`（标题命中，`utimesSync` 回拨 120 秒使其更旧，`:23-28` 注释：旧实现会因创建早被排后/截断）与 `循环稳定性.md`（正文命中）。
- `test:52-61`「标题命中优先于正文命中并参与截断」：`rebuildVaultIndex(lab.id,{force:true})` → `searchVaultNotes(lab.id,'界面阻抗',1)` 的 `top` 长度为 1 且 `top[0].title` 为 `'界面阻抗'`（`:57-58`）；`searchVaultNotes(...,10)` 的标题序列 `toEqual(['界面阻抗','循环稳定性'])`（`:61`，标题 50 分 > 正文 10 分且同分 mtime 次序无关）。
- `afterAll :35-49`：`__clearVaultContentLru` + `closeCsLabVaultCache` + `closeAllCsLabDatabases` + 清目录 + 还原 `PROFER_CONFIG_DIR`。

间接证据：`cslab-canvas.test.ts:490-491` 用 `rebuildVaultIndex`/`listVaultNotes` 断言 Canvas 同步后索引可枚举（属 canvas-sync 测试归属，仅标间接）。未覆盖：缓存复用（reused 计数）、坏缓存回退、`parseCanvasNote`、`readVaultNote`（含 canvas 拒绝分支）、`getNoteBacklinks`、`indexSingleNote` 删除分支、`getVaultIndexStatus`、`ensureVaultLinks` 回填、fingerprint 语义——均无断言。`parseMarkdownNote` 无直接单测（虽注释称「纯函数，便于单测」，`:149`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出与行号 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-vault-index.ts:53-738` |
| 缓存复用条件 size+|Δmtime|<1、force 短路 | 已证实 | `:439-443` |
| 坏缓存删除回退物理重解析、坏 payload 行删除 | 已证实 | `:453-455/:542` |
| 批量共用一次 lab revision | 已证实 | `:354-371` |
| 打分 50/30/10/5/5、排序 score→mtime | 已证实 | `:560-589` |
| `readVaultNote` 仅允许 `.md`、canvas 拒绝 | 已证实 | `:631` |
| 内容缓存容量 200、按 at 淘汰（at 仅写入赋值、读取不刷新——插入时间淘汰非访问 LRU） | 已证实 | `:68/:49/:634-643` |
| `getNoteBacklinks` 全量扫描逐条重建反链索引（性能 O(n²) 特征） | 推断 | `:683-702` 静态结构 |
| `indexSingleNote` 解析异常上抛（与全量重建吞错不同） | 推断 | `:717-721` 无 try/catch 对比 `:467-471` |
| `indexSingleNote` 与全量重建交错的最终一致性 | 推断 | upsert 幂等；未并发实测 |
| 测试运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseMarkdownNote`/`parseCanvasNote` | §3.1 | 150-237 | covered |
| `rebuildVaultIndex`(+Internal)/`syncEntities` | §3.2 | 339-536 | covered |
| `listVaultNotes`/`searchVaultNotes`/`scoreVaultRecord`/`getVaultIndexStatus` | §3.3 | 538-612 | covered |
| `ensureVaultLinks`/`readVaultNote`/`getNoteBacklinks` | §3.4 | 614-702 | covered |
| `indexSingleNote`/`__clearVaultContentLru` | §3.5 | 704-740 | covered |
| 测试断言（排序） | §9 | test:52-61 | covered |
| 缓存复用/坏缓存/readVaultNote/反链等 | §9 | — | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
