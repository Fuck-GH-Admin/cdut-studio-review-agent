---
path: apps/electron/src/main/lib/cslab/cslab-paths.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a27002041239844fa3f79391e88caf94ab30079
sha256: 0a95f2ec4b90eebf555f51c7c2fb76ac4d040d98045c0fe741c6a5d27f0ce9dd
lines: 346
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-paths.ts

## 1. 结论与边界

CSLab 实验室沙箱的**路径解析、安全拒止与清单/索引持久化**基础模块（运行时代码）。文件头三条红线（`apps/electron/src/main/lib/cslab/cslab-paths.ts:4-8`）：①labId 必须过正则才拼路径；②渲染端相对路径 resolve 后必须仍在实验室根内；③manifest 用 `.tmp`+`rename` 原子写。它是 cslab 目录的路径底座——冻结树检索 `cslab-*` 各文件 import 命中约 30 个模块文件 + 外部 2 处（见 §4）。

边界：不管理实验室业务状态（DB/图层/资产归 `cslab-db.ts`、`cslab-manager.ts` 等）；不注册 IPC；`deleteLabFiles` 只做物理删除+索引注销，不管数据库/监听释放（注释 `:252` 明示调用方先行释放）。

## 2. 导出与关键符号

导出 20 项 = 18 函数 + 2 常量（`export` 逐条核对）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `VAULT_SUBDIRS` | 导出常量 | 30 | `['lit','notes','raw','tables','figures','manuscripts'] as const` | vault 骨架子目录 |
| `RUNTIME_SUBDIRS` | 导出常量 | 31 | `['tools','logs'] as const` | runtime 骨架子目录 |
| `getCsLabRootDir` | 导出函数 | 44 | `(): string` | CSLab 根目录（不存在则创建） |
| `assertLabId` | 导出函数 | 50 | `(value: unknown): string` | labId 校验，非法抛错 |
| `createLabId` | 导出函数 | 97 | `(name: string): string` | 由名称生成稳定 labId |
| `getDefaultLabDir` | 导出函数 | 109 | `(labId: string): string` | 默认沙箱路径（不创建） |
| `resolveLabDir` | 导出函数 | 114 | `(labId: string): string` | 实验室根目录解析（自定义路径走索引） |
| `assertSafeLabRootPath` | 导出函数 | 134 | `(targetPath: string): string` | 敏感目录拒止（相等判定） |
| `ensureLabLayout` | 导出函数 | 155 | `(labId: string, rootPath: string): string` | 创建目录骨架并注册索引 |
| `getManifestPath` | 导出函数 | 165 | `(labDir: string): string` | `lab.manifest.json` 路径 |
| `readLabManifest` | 导出函数 | 169 | `(labDir: string): CsLabLab \| null` | 读清单（损坏/缺 id 名 → null） |
| `writeLabManifest` | 导出函数 | 208 | `(labDir: string, manifest: CsLabLab): void` | tmp+rename 原子写清单 |
| `updateLabManifest` | 导出函数 | 216 | `(labId: string, patch: Partial<CsLabLab>): CsLabLab` | 读-合并-原子写（强制保留 id） |
| `deleteLabFiles` | 导出函数 | 254 | `(labId: string): void` | 物理删除沙箱 + 注销索引 |
| `listLabManifests` | 导出函数 | 279 | `(): CsLabLab[]` | 列出可读实验室（含手工放入兼容） |
| `removeLabRegistration` | 导出函数 | 313 | `(labId: string): void` | 仅注销索引 |
| `resolveLabRelativePath` | 导出函数 | 320 | `(labId: string, relPath: string): string` | 相对路径→沙箱内绝对路径（防穿越） |
| `toLabRelativePath` | 导出函数 | 330 | `(labId: string, absolutePath: string): string` | 绝对路径→POSIX 相对路径 |
| `sanitizeFileName` | 导出函数 | 338 | `(name: string): string` | 文件名去目录/控制字符 |
| `__removeLabDirForTest` | 导出函数 | 344 | `(rootPath: string): void` | 测试清理用 rmSync |

关键内部符号：`getIndexPath`（`:57`，`<root>/index.json`）、`readIndex`（`:61-74`）、`writeIndex`（`:76-80`，tmp+rename）、`registerLabRoot`/`unregisterLabRoot`（`:83-95`）、`normalizeForCompare`（`:123-125`，归一化+去尾分隔符+小写）、`clearReadonlyAttributes`（`:226-251`）。内部类型 `LabIndexEntry`（`:33-36`，`{rootPath, updatedAt}`）、`LabIndex`（`:38-41`，`{version:1, labs}`）未导出。常量 `LAB_ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/`（`:26`，总长 3-64）、`MANIFEST_NAME='lab.manifest.json'`（`:27`）、`INDEX_NAME='index.json'`（`:28`）。

## 3. 内部逻辑与关键流程

### 3.1 索引（`index.json`）读写（`apps/electron/src/main/lib/cslab/cslab-paths.ts:57-95`）

- `getCsLabRootDir`（`:44-48`）：`join(getConfigDir(), 'cslab-workspaces')`，不存在 `mkdirSync(recursive)`——注意本函数**有创建副作用**。
- `readIndex`（`:61-74`）：文件缺失→`{version:1, labs:{}}`；`version!==1` 或 `labs` 形状非法→静默返回空索引（`:66-68`，无警告）；`JSON.parse` 抛错→`console.warn('[CSLab] 实验室索引损坏，已按空索引继续')` 后返回空（`:71-73`）。
- `writeIndex`（`:76-80`）：写 `${indexPath}.tmp` 后 `renameSync`（红线③）。
- `registerLabRoot`（`:83-87`）：写入 `{rootPath, updatedAt: Date.now()}`；`unregisterLabRoot`（`:89-95`）：缺失直接返回，否则删除后写回。

### 3.2 labId 与路径解析（`:97-131`）

- `createLabId`（`:97-107`）：名称小写→非 `[a-z0-9]` 折叠为 `-`→去首尾 `-`→截 40；补 3 字节随机 hex 后缀（`randomBytes(3).toString('hex')`，6 字符）；空 slug 前缀取 `'lab'`；总长截 63。
- `getDefaultLabDir`（`:109-111`）：`join(getCsLabRootDir(), assertLabId(labId))`，注释明示不创建。
- `resolveLabDir`（`:114-119`）：`assertLabId` 后查索引——有 `rootPath` 用 `resolve(entry.rootPath)`（自定义根），否则默认目录。

### 3.3 安全拒止（`:123-163`）

- `assertSafeLabRootPath`（`:134-153`）：禁用集合 = `[homedir(), parse(resolve(homedir())).root, parse(resolved).root, process.cwd()]` + 环境变量 `SystemRoot`/`ProgramFiles`/`ProgramFiles(x86)`（有值才加，`:142-145`）。比较用 `normalizeForCompare` **相等判定**而非前缀（注释 `:127-132`：默认沙箱在主目录子目录下，按前缀拒绝会误伤）。命中抛 `'安全拒止：禁止将用户主目录、盘符根目录或系统/应用目录用作实验室根路径'`；通过则返回归一化绝对路径。`parse(resolved).root` 使 Windows 多盘符根（`D:\`、`E:\`）也被拒。
- `ensureLabLayout`（`:155-163`）：`assertLabId` → `assertSafeLabRootPath` → 建 `db/`、`vault/<6 子目录>`、`runtime/<2 子目录>` → `registerLabRoot`。

### 3.4 清单（`lab.manifest.json`）（`:165-223`）

- `readLabManifest`（`:169-206`）：缺失→`null`；`id`/`name` 缺任一→`null`（`:173`）；`status` 白名单 `调试中|筹建中|已归档`，其余落 `'运行中'`（`:174-177`）；`archived = parsed.archived === true || status === '已归档'`（`:178`）；其余字段逐个强转/默认（`code` 默认 `id.toUpperCase()`、`members` 默认 1、`createdAt/updatedAt` 默认 `Date.now()`、`pinned===true`、`statusBeforeArchive` 白名单 `运行中|调试中|筹建中` 否则 undefined，`:179-203`）；解析失败 `console.warn('[CSLab] 实验室清单损坏，已跳过')`→`null`（`:204-206`）。
- `writeLabManifest`（`:208-213`）：tmp+rename 原子写（`JSON.stringify(manifest, null, 2)`+尾换行）。
- `updateLabManifest`（`:216-223`）：`resolveLabDir`→`readLabManifest`；`null` 抛 `'实验室不存在或清单损坏'`；`{...current, ...patch, id: current.id}`（**强制保留 id** 防补丁篡改沙箱标识，`:220`）；整对象覆盖写。注意：读-改-写无锁（推断：并发调用可丢更新）。

### 3.5 删除（`:226-277`）

- `clearReadonlyAttributes`（`:226-251`）：递归 `chmodSync` 目录 0o777/文件 0o666（单点失败忽略），防 Windows 只读文件 rmSync EPERM。
- `deleteLabFiles`（`:254-277`）：`root = assertSafeLabRootPath(resolveLabDir(labId))`（删除路径也过拒止）；`!existsSync(root)` 直接进入 finally 注销索引后返回（`:258-259`）；Windows CWD 锁——`process.cwd()` 在目标内时先 `process.chdir(getCsLabRootDir())`（`:260-268`，失败仅 warn）；`clearReadonlyAttributes` 后 `rmSync(recursive, force, maxRetries:5, retryDelay:120)`（`:269-270`）；任何失败 `console.warn('物理删除实验室目录失败，已注销索引…')`，**finally 恒执行 `unregisterLabRoot`**（`:271-277`），保证已删实验室不卡 UI。

### 3.6 列举与相对路径（`:279-346`）

- `listLabManifests`（`:279-311`）：①遍历索引条目，跳过非法 labId；`manifest && manifest.id === labId` 才收录（`:287-290`，防根路径错配）；②兼容手工放入——扫根目录下合法 labId 目录（未见者），读到 manifest 即收录并回填 `registerLabRoot`（`:294-302`）；③排序置顶优先（pinned 者 `pinnedAt` 倒序），其余 `updatedAt` 倒序（`:304-310`）。
- `resolveLabRelativePath`（`:320-327`）：`resolve(root, relPath)` 必须 `=== root` 或以 `root+sep` 开头，否则抛 `'路径越界：目标不在实验室沙箱内'`（红线②）。
- `toLabRelativePath`（`:330-336`）：绝对路径必须以 `root+sep` 开头（恰等于 root 反而抛错，`:333`）；输出 POSIX 风格（`split(sep).join('/')`）。
- `sanitizeFileName`（`:338-341`）：`basename` + 控制字符与 `<>:"/\|?*` 替换 `_` + trim；空回退 `'unnamed'`。
- `__removeLabDirForTest`（`:344-346`）：`rmSync(resolve(rootPath), {recursive, force})`。

## 4. 调用者与调用链

入向（冻结树 `apps/**`、`packages/**` 检索本模块符号，约 30 个 cslab 模块 + 测试 + 2 个外部文件）：

- 外部（cslab 目录之外）：`apps/electron/src/main/lib/adapters/pi-cslab-tools.ts:22`（`assertLabId`）；`apps/electron/src/main/lib/agent-orchestrator.ts:133`（`resolveLabDir`）。
- `apps/electron/src/main/lib/cslab/index.ts:12` `export * from './cslab-paths'`（目录桶导出）。
- cslab 内部主要消费者（import 行）：`cslab-manager.ts:25`（createLabId/deleteLabFiles/ensureLabLayout/getDefaultLabDir/listLabManifests/readLabManifest/resolveLabDir/updateLabManifest/writeLabManifest 9 个）、`cslab-canvas-sync.ts:34`、`cslab-capsule.ts:29`、`cslab-dataset-store.ts:30`、`cslab-demo.ts:31`、`cslab-formula-verifier.ts:17`、`cslab-graphrag-router.ts:21`、`cslab-hpc-db.ts:19`、`cslab-hpc.ts:49`、`cslab-iron-cage.ts:55`、`cslab-literature-index.ts:18`、`cslab-literature.ts:30`、`cslab-manuscript.ts:36`、`cslab-mol.ts:34`、`cslab-plot-digitizer.ts:17`、`cslab-plot-history.ts:15`、`cslab-python-runtime.ts:23`、`cslab-runs.ts:52`、`cslab-science.ts:42`、`cslab-scientific-tools.ts:24`、`cslab-share-db.ts:21`、`cslab-share-watcher.ts:50`、`cslab-structure-snapshot.ts:26`、`cslab-tool-audit.ts:13`、`cslab-tool-registry.ts:27`、`cslab-vault-cache.ts:10`、`cslab-vault-index.ts:29`、`cslab-zotero.ts:43`。
- 测试入口：`apps/electron/src/main/lib/cslab/cslab-manager.test.ts:149/:156/:164/:98`（`assertSafeLabRootPath`/`getDefaultLabDir`/`updateLabManifest`，见 `apps/electron/src/main/lib/cslab/cslab-manager.test.ts.md`）；其余 `cslab-*.test.ts` 经 `createLab`/`resolveLabDir` 间接使用。
- 典型运行时链路：渲染端/IPC → `cslab-router.ts`（导入 `assertLabId`，`cslab-graphrag-router.ts:21` 同）→ 各业务模块经 `resolveLabDir`/`resolveLabRelativePath` 落盘。

出向：`node:path`（join/resolve/sep/basename/normalize/parse，`:11`）、`node:os homedir`（`:12`）、`node:fs`（chmod/exists/mkdir/read/readdir/rename/rm/write，`:13-22`）、`node:crypto randomBytes`（`:23`）、`@profer/shared` 类型 `CsLabLab`（`:24`）、`apps/electron/src/main/lib/config-paths.ts` 的 `getConfigDir`（`:25`）。无网络调用。

## 5. 数据 I/O、读写与副作用

- 读：`<configDir>/cslab-workspaces/index.json`（readIndex）、各实验室 `lab.manifest.json`（readLabManifest）、目录枚举（listLabManifests/clearReadonlyAttributes）、`existsSync` 探测。
- 写：`index.json`（tmp+rename）、`lab.manifest.json`（tmp+rename）、目录创建（getCsLabRootDir/ensureLabLayout）、chmod（deleteLabFiles 前置）、rmSync（deleteLabFiles/__removeLabDirForTest）。
- 原子性：两个 JSON 写入均 `.tmp`+`renameSync`（`:76-80/:208-213`，红线③）；`updateLabManifest` 的读-合并-写**非原子事务**，无锁（推断-静态）。
- 全局副作用：`process.chdir`（仅 deleteLabFiles 的 Windows CWD 逃逸分支，`:264`）；`console.warn`（索引/清单损坏、删除失败，`:72/:205/:267/:274`）。
- 幂等：`unregisterLabRoot`/`deleteLabFiles` 重复调用安全（缺失即返回/finally 注销）；`ensureLabLayout` 重复调用安全（mkdir recursive）。

## 6. 分支、失败、取消与恢复

- labId 非法：`assertLabId` 抛 `'实验室标识无效'`（`:51-53`）；`createLabId` 产物保证匹配 `LAB_ID_RE`（小写字母数字连字符，`:98-106`）。
- 安全拒止：`assertSafeLabRootPath` 抛 `'安全拒止：…'`（`:149-151`）；路径越界：`resolveLabRelativePath`/`toLabRelativePath` 抛 `'路径越界：目标不在实验室沙箱内'`（`:324/:333`）。
- 索引/清单损坏：读取降级（空索引/`null`）+ warn，不抛错（`:71-73/:204-206`）；调用方行为：`updateLabManifest` 对 `null` 清单抛 `'实验室不存在或清单损坏'`（`:219`）。
- 删除失败：物理删除异常→warn 并继续注销索引（`:271-276`）；chmod/readdir 单点失败忽略（`:228-249`）；CWD 切换失败 warn（`:265-267`）。恢复语义：清单缺失/部分删除均可继续清理（配合 `cslab-manager.ts` 幂等删除）。
- 无取消/异步路径：全部同步函数（除被调用方），无 AbortSignal/队列。

## 7. 权限与权威状态

- 无权限分支：本文件无 sender/role 检查（全文件无相关断言）；安全模型是**路径安全**而非调用者授权——三层守卫：`LAB_ID_RE`（`:26/:50-55`）→ `assertSafeLabRootPath`（`:134-153`，拒主目录/盘符根/cwd/系统目录）→ `resolveLabRelativePath`/`toLabRelativePath` 防穿越（`:320-336`）。
- 权威状态：`index.json` 是 labId→rootPath 映射的唯一权威（readIndex/writeIndex）；`lab.manifest.json` 是实验室元数据权威（id/name/status/pinned/archived 等，readLabManifest 白名单归一）。`listLabManifests` 的手工目录回填（`:294-302`）会改写索引（读取伴随写副作用）。
- `__removeLabDirForTest`（`:344`）无任何守卫直接 rmSync——仅测试使用（命名约定），生产代码不得调用（推断-命名与注释 `:343`「供测试清理使用」）。

## 8. 修改影响面

- 本文件是 cslab 路径底座：改 `resolveLabDir`/`LAB_ID_RE`/`assertSafeLabRootPath` 影响约 30 个 cslab 模块的全部落盘路径与删除行为（§4 清单）；外部影响 `pi-cslab-tools.ts`（工具入参校验）与 `agent-orchestrator.ts:133`。
- 改 manifest 形状（`readLabManifest` 归一规则）影响 `cslab-manager.ts`（CRUD/快照）、`cslab-window-manager.ts`、`cslab-science.ts` 等所有读 `CsLabLab` 的消费者；`CsLabLab` 类型在 `@profer/shared`，字段改动需同步类型。
- 改 `index.json` 格式需考虑 `version` 判定（`:66`，非 1 直接当空索引）。
- 改删除语义（`deleteLabFiles`）需同步 `cslab-manager.ts:172-204`（deleteLab 的 DB/监听释放顺序，注释 `:252` 契约）。
- 需同步的测试：`cslab-manager.test.ts:148-172`（安全边界）、其余 cslab 测试的临时目录布局断言（如 `cslab-manager.test.ts:36-42` 的骨架清单）。

## 9. 测试证据

本文件**无专属测试文件**（冻结树检索 `cslab-paths.test` 不存在——`apps/**` 全 `.test.ts` 中无同名文件；否定范围：冻结树全路径 glob）。直接断言它的用例集中在 `apps/electron/src/main/lib/cslab/cslab-manager.test.ts`（NOT_RUN，仅读断言）：

- `:148-153` `assertSafeLabRootPath(homedir())`/`parse(process.cwd()).root`/`process.cwd()` 均 `toThrow('安全拒止')`。
- `:155-159` `getDefaultLabDir('safe-lab-01')` 与 `join(rootDir,'custom-lab')` 不抛（默认沙箱子目录放行）。
- `:161-168` `test.skipIf(process.platform !== 'win32')`：`'D:\\'`/`'E:\\'` 抛 `'安全拒止'`（多盘符根，非 Windows 平台跳过）。
- `:170-173` `createLab({rootPath: homedir()})` 抛 `'安全拒止'`（间接覆盖 `ensureLabLayout`→`assertSafeLabRootPath`）。
- 间接覆盖：`cslab-manager.test.ts` 全部用例经 `createLab`/`deleteLab` 覆盖 `ensureLabLayout` 骨架（`:36-42` 逐目录 `existsSync`）、`updateLabManifest`（`:98`）、`deleteLabFiles`（`:118-129/:131-144`，含只读文件清理 `chmod 0o444`→删除成功）。
- 未覆盖：`readIndex` 损坏降级、`listLabManifests` 手工目录回填、`toLabRelativePath`、`sanitizeFileName`、`resolveLabRelativePath` 穿越拒绝（由其它模块测试间接经过，无直接断言行号）、`removeLabRegistration`、`__removeLabDirForTest`（自身是工具）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 项导出与行号 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-paths.ts:30-346` 逐条核对 |
| manifest/index 均 tmp+rename 原子写 | 已证实 | `:76-80/:208-213` |
| 安全拒止是相等判定 + `parse(resolved).root` 覆盖多盘符 | 已证实 | `:134-153` 与注释 `:127-132` |
| `deleteLabFiles` finally 恒注销索引 | 已证实 | `:254-277` |
| `listLabManifests` 双来源（索引 + 手工目录回填）与排序规则 | 已证实 | `:279-311` |
| `toLabRelativePath` 对 root 自身抛错 | 已证实 | `:330-336`（`root+sep` 前缀判定） |
| `updateLabManifest` 强制保留 id | 已证实 | `:220` |
| 无锁读-改-写可丢并发更新 | 推断 | 无锁代码；未并发实测 |
| `createLabId` 产物恒匹配 `LAB_ID_RE` | 推断 | 构造逻辑（`:98-106`）与正则（`:26`）静态推得，无断言 |
| `__removeLabDirForTest` 仅测试调用 | 推断 | 命名+注释 `:343`；生产调用方检索为零（`apps/**` 仅测试文件引用） |
| 运行时真实并发/Windows 行为 | 未知 | NOT_RUN |

否定结论检索范围：`cslab-paths.test.*` 不存在 = 冻结树全路径 glob `**/cslab-paths*test*` 零命中；`__removeLabDirForTest` 生产无调用 = `apps/**`、`packages/**` 全扩展名字符串检索。

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getCsLabRootDir`/`assertLabId`/`createLabId` | §3.2 | 44-107 | covered |
| `getDefaultLabDir`/`resolveLabDir` | §3.2 | 109-119 | covered |
| `assertSafeLabRootPath`/`ensureLabLayout` | §3.3 | 134-163 | covered |
| 索引 readIndex/writeIndex/注册注销 | §3.1 | 57-95 | covered |
| manifest read/write/update | §3.4 | 165-223 | covered |
| `deleteLabFiles`/`clearReadonlyAttributes` | §3.5 | 226-277 | covered |
| `listLabManifests` | §3.6 | 279-311 | covered |
| 相对路径守卫/`sanitizeFileName`/测试工具 | §3.6 | 320-346 | covered |
| 测试断言（manager.test 4 组） | §9 | test:148-173 | covered |
| 索引损坏降级/手工回填/toLabRelativePath 等 | §9 | — | partial（无直接断言） |
| 运行时并发/平台行为 | §10 | — | unknown（NOT_RUN） |
