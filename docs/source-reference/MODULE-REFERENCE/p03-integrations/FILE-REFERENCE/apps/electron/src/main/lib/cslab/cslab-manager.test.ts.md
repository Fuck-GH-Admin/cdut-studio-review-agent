---
path: apps/electron/src/main/lib/cslab/cslab-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ebc0c4b230b623cf918404601be26ff3013b8ded
sha256: 3462620e95723e0d5bfb6422e33492bc16931a1e468f435033474d340ad94f47
lines: 174
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-manager.test.ts

## 1. 测试目标

CSLab 实验室管理器的沙箱管理集成测试（文件头 `apps/electron/src/main/lib/cslab/cslab-manager.test.ts:1-3`）：①创建实验室的目录骨架与 SQLite 元数据库；②生命周期操作（重命名/置顶/归档/删除/幂等删除）；③实验室根路径安全边界（`assertSafeLabRootPath`，属 `cslab-paths.ts` 的断言集中地）。走真实文件系统与真实 SQLite，无 mock。框架 `bun:test`（`:5`）。

## 2. 用例清单

共 3 个 `describe`、12 个 `test`（`:28/:50/:62/:70/:81/:96/:113/:131/:148/:155/:161/:170`）。全局夹具：`beforeAll`（`:12-15`）`mkdtempSync(join(tmpdir(),'cslab-manager-'))` 并设 `process.env.PROFER_CONFIG_DIR`（配置根重定向到临时目录）；`afterAll`（`:17-25`）动态 `import('./cslab-db')` 调 `closeAllCsLabDatabases()` 后 `rmSync` 临时目录（Windows SQLite 句柄延迟释放时静默留给系统回收，`:21-24`）。用例间顺序：仅「置顶排序」依赖同用例内两次 createLab，其余独立。

`describe('实验室沙箱')`（`:27`）：

1. `:28-48` 创建实验室会生成完整目录骨架与 SQLite 元数据库——设置：`createLab({name:'固态电池界面测试', description, tags:['电化学','界面']})`；动作：遍历目录探测 + listLabs + openLab；断言见 §3。
2. `:50-60` 快照返回全部维度计数与 Python 能力说明——`createLab({name:'快照测试实验室'})` → `getLabSnapshot`。
3. `:62-67` 空名称与超长名称被拒绝——`createLab({name:'   '})` 与 61 字符名。

`describe('实验室生命周期操作')`（`:69`）：

4. `:70-79` 重命名实验室并校验名称边界——`renameLab(id,'  重命名后实验室  ')` + getLab 校验 + 空/超长抛错。
5. `:81-94` 置顶优先排序与取消置顶——两个 createLab（较旧/较新）→ `togglePinLab(older)` → 排序 → 再 toggle。
6. `:96-111` 归档记录原状态并在解除归档时恢复——`updateLabManifest(id,{status:'调试中'})` 预置（`:98`）→ 归档 → 解归档。
7. `:113-129` 删除实验室物理清理沙箱并解绑历史会话——`createAgentSession`+`updateAgentSessionMeta({cslabLabId})` → `deleteLab`。
8. `:131-144` 重复删除保持幂等，并能清理只读文件——`chmodSync(readonlyFile, 0o444)` 后 deleteLab 两次。

`describe('实验室根路径安全边界')`（`:147`）：

9. `:148-153` 主目录、盘符根与应用目录被拒止——`assertSafeLabRootPath(homedir())`/`parse(process.cwd()).root`/`process.cwd()`。
10. `:155-159` 默认沙箱子目录与普通自定义目录正常通过——`getDefaultLabDir('safe-lab-01')`、`join(rootDir,'custom-lab')`。
11. `:161-168` `test.skipIf(process.platform !== 'win32')` Windows 任意盘符根目录同样被拒止——`'D:\\'`/`'E:\\'`。
12. `:170-173` createLab 拒绝把用户主目录作为根路径——`createLab({name:'越权实验室', rootPath: homedir()})`。

## 3. 真实断言

- `:33-34` `lab.id` 匹配 `/^[a-z0-9-]+$/`、`lab.status` 为 `'运行中'`。
- `:36-42` 逐目录 `expect(existsSync(join(lab.rootPath, dir))).toBe(true)`：`db`、`vault/lit`、`vault/notes`、`vault/raw`、`vault/tables`、`vault/figures`、`vault/manuscripts`、`runtime/tools`、`runtime/logs`。
- `:43-44` `lab.manifest.json` 与 `db/central_meta.sqlite` 存在。
- `:46` `listLabs().some(id 相同)` 为 true；`:47` `openLab(lab.id).name` 为 `'固态电池界面测试'`。
- `:55-59` `snapshot.lab.id` 一致；`snapshot.counts.raw`/`counts.table` 为 `0`；`typeof snapshot.python.available` 为 `'boolean'`；`snapshot.python.note.length` 大于 0。
- `:65` `createLab({name:'   '})` 抛 `'实验室名称不能为空'`；`:66` 61 字符抛 `'不能超过 60'`。
- `:75` `renamed.name` 为 `'重命名后实验室'`（trim 生效）；`:76` `getLab(lab.id)?.name` 同；`:77-78` 空名抛 `'不能为空'`、超长抛 `'不能超过 60'`。
- `:87-89` `pinned.pinned` 为 true、`typeof pinned.pinnedAt` 为 `'number'`、`listLabs()[0]?.id` 为置顶者（排序断言）。
- `:91-92` `unpinned.pinned` 为 false、`unpinned.pinnedAt` 为 undefined。
- `:103-105` `archived.archived` true、`archived.status` 为 `'已归档'`、`archived.statusBeforeArchive` 为 `'调试中'`。
- `:108-110` `restored.archived` false、`restored.status` 为 `'调试中'`、`restored.archivedAt` 为 undefined。
- `:122-127` 删除后 `existsSync(lab.rootPath)` false、`listLabs` 不含、`listAgentSessions(true)` 中该会话 `bound?.cslabLabId` 为 undefined。
- `:138-143` 只读文件删除成功（`existsSync(lab.rootPath)` false）；二次 `await expect(deleteLab(lab.id)).resolves.toEqual([])`。
- `:150-152` 三个敏感路径 `toThrow('安全拒止')`；`:157-158` 两个安全路径 `.not.toThrow()`；`:165-166`（win32）`'D:\\'`/`'E:\\'` 抛 `'安全拒止'`；`:172` `createLab({rootPath: homedir()})` 抛 `'安全拒止'`。

## 4. 未覆盖与脆弱点

- 未覆盖：`stopLabWatchers` 各监听停止失败分支（无监听存在时为真空路径）；deleteLab 中单会话解绑失败分支（`:189-194`）；`openLab` 写入的 `last_opened_at` 值未断言；`getLabSnapshot` 的 `recentAssets` 内容未断言；`togglePinLab` 的 `pinnedAt` 倒序排序（只测了置顶优先，未测两个置顶者的 pinnedAt 次序）；`listLabManifests` 手工目录回填路径；`renameLab`/`createLab` 边界值（恰 60 字符）未测。
- 脆弱点：用例 5（`:81-94`）用 `listLabs()[0]` 断言排序——若其它用例残留实验室（同一 `PROFER_CONFIG_DIR` 根）且 updatedAt 更近，可能干扰；实际依赖 bun 串行执行与置顶排序规则。`test.skipIf` 的 Windows 用例在非 win32 平台不执行（`:161`）。`afterAll` 清理在 Windows 下可能留临时目录（自述 `:21-24`）。
- 与 `cslab-paths` 的分工：用例 9-12 断言的是 `cslab-paths.ts` 的导出（跨文件归属已在 `cslab-paths.ts.md` §9 交叉引用，主手册唯一）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个 test 数量与行号（含 1 个 skipIf） | 已证实 | `apps/electron/src/main/lib/cslab/cslab-manager.test.ts:28-173` |
| §3 全部断言文本与行号 | 已证实 | 逐行核对 |
| 夹具：mkdtemp + PROFER_CONFIG_DIR 重定向、afterAll 关库清目录 | 已证实 | `:12-25` |
| 无 mock（真实 FS + 真实 SQLite） | 已证实 | 全文件无 mock/spy；依赖均为真实模块动态 import |
| skipIf 用例在非 Windows 跳过 | 已证实 | `:161` 条件 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createLab` 骨架/manifest/DB | §3 | test:28-48 | covered |
| `getLabSnapshot` | §3 | test:50-60 | partial（关键字段） |
| 名称校验 | §3 | test:62-67/70-79 | covered |
| `renameLab`/`togglePinLab`/`toggleArchiveLab` | §3 | test:70-111 | covered |
| `deleteLab` 解绑/物理清理/幂等 | §3 | test:113-144 | covered |
| `assertSafeLabRootPath`/`getDefaultLabDir` | §3 | test:148-173 | covered |
| 监听停止/解绑失败分支 | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
