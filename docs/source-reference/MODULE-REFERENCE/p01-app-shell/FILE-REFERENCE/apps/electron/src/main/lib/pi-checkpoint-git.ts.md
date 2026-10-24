---
path: apps/electron/src/main/lib/pi-checkpoint-git.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c457e3c328952d7390d52c56649811a9f8113f5a
sha256: 82a4bbddb345e6b7182068f3de5b3cc3ddd05d913bf591a3958994e3c6563024
lines: 450
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-checkpoint-git.ts

## 1. 结论与边界

Pi 检查点的纯 git 层（450 行，设计注释 `:6-19`）：每会话一个私有 bare 影子仓库（`shadow.git`），`--work-tree` 指会话 cwd；快照 = 显式路径 add → write-tree → commit-tree → 每检查点一个 ref（`refs/profer/checkpoints/`，无父子链，删 ref 即可回收对象）；tree diff 天然给出增删改清单与 dedup。

**边界**：刻意不依赖 Pi/Profer 业务类型（`:18`，便于独立测试）；上层语义（排除规则、manifest、回退策略）在 `pi-file-checkpoint.ts`（跨批）；**绝不触碰用户自己的 git 仓库/索引**（`:11` 设计约束，测试 `pi-file-checkpoint.test.ts:288-321` 佐证）；git 可执行发现经 `./git-detector` `findGitPath`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `__setGitExecutableForTest` | 函数（导出） | 36-38 | `(value: string\|null\|undefined) => void` | 测试钩子：覆盖 git 路径解析 |
| `resolveGitExecutable` | 函数（导出） | 40-44 | `() => string \| null` | override→缓存→findGitPath |
| `isGitSnapshotAvailable` | 函数（导出） | 46-48 | `() => boolean` | `resolveGitExecutable() !== null` |
| `GitCommandResult` | 接口（导出） | 50-54 | `{ok, stdout, stderr}` | 命令结果 |
| `ShadowRepo` | 接口（导出） | 87-92 | `{dir, workTree}` | 影子仓库句柄 |
| `shadowRepoDirFor` | 函数（导出） | 94-96 | `(sessionDir) => string` | `<sessionDir>/shadow.git` |
| `isShadowRepoDirName` | 函数（导出） | 98-100 | `(name) => boolean` | 名称判定 |
| `ensureShadowRepo` | 函数（导出） | 109-143 | `(repo) => boolean` | 建库+固定配置 |
| `importRefFromRepo` | 函数（导出） | 152-173 | `(params{targetRepo, sourceRepoDir, ref, commitSha}) => boolean` | 分叉迁移单 ref |
| `removeShadowRepo` | 函数（导出） | 178-186 | `(sessionDir) => void` | 删库（失败静默） |
| `toGitPath` / `fromGitPath` | 函数（导出） | 191-197 | 分隔符转换 | win32 路径规约 |
| `SnapshotResult` | 接口（导出） | 205-211 | `{ok, treeSha, failures[], error?}` | 快照结果 |
| `snapshotPaths` | 函数（导出） | 287-305 | `(repo, gitPaths) => SnapshotResult` | 显式路径快照 |
| `commitTree` | 函数（导出） | 307-313 | `(repo, treeSha, message) => {ok, commitSha}` | commit-tree（显式身份） |
| `checkpointRef` | 函数（导出） | 315-317 | `(id) => string` | `refs/profer/checkpoints/<id>` |
| `isCheckpointRef` | 函数（导出） | 319-324 | `(ref) => boolean` | 前缀+禁 `..`/`[~^:\\?*\[\s]` |
| `isObjectId` | 函数（导出） | 326-328 | `(value) => boolean` | 40 或 64 hex（`:327` 正则） |
| `updateRef` / `deleteRef` | 函数（导出） | 330-337 | `boolean` | ref 写/删（删前 isCheckpointRef 守卫） |
| `listCheckpointRefs` | 函数（导出） | 339-346 | `() => string[]` | for-each-ref 列举 |
| `TreeDiff`/`TreeDiffResult` | 接口（导出） | 348-361 | `{added, modified, deleted}` / `{ok, diff, error?}` | diff 结果 |
| `diffTrees` | 函数（导出） | 364-383 | `(repo, fromTree, toTree) => TreeDiffResult` | tree 级 diff |
| `restorePathsFromTree` | 函数（导出） | 386-400 | `(repo, treeSha, gitPaths) => string[]` | read-tree+checkout-index 还原 |
| `countRepoBytes` | 函数（导出） | 403-416 | `(repo) => number` | size+size-pack |
| `gcShadowRepo` | 函数（导出） | 421-450 | `(repo, options?) => void` | 回收不可达对象 |

内部：`runGit`（`:64-85`）、`GitRunOptions`（`:56-62`）、`listIndexPaths`（`:199-203`）、`nulSeparated`（`:221-223`）、`dropStaleIndexEntries`（`:229-253`）、`addPathsToIndex`（`:256-285`）、模块级 `cachedGitPath`/`gitPathOverride`（`:32-33`）、`pathspecFromFileSupported`（`:226`）、`activeGcRepos`（`:418`）、常量（`:22-30`：`GIT_TIMEOUT_MS=120s`、`GIT_GC_TIMEOUT_MS=120s`、`GIT_MAX_BUFFER=32MB`、`ADD_BATCH_SIZE=100`、`SHADOW_REPO_DIR_NAME='shadow.git'`、`REF_PREFIX`、`COMMIT_IDENTITY=['-c','user.name=Profer','-c','user.email=profer@localhost']`）。导出合计 27（22 函数 + 5 接口：`GitCommandResult`/`ShadowRepo`/`SnapshotResult`/`TreeDiff`/`TreeDiffResult`）。

## 3. 内部逻辑与关键流程

1. **runGit**（`:64-85`）：无 git → `{ok:false, stderr:'git executable not found'}`（`:66`）；拼 `--git-dir/--work-tree`（`:68-69`）；**cwd 回落**：workTree 不存在（会话目录清理中）用 `process.cwd()`，仓库级操作仍可执行（`:71-72`）；`spawnSync`（utf-8、timeout 120s、maxBuffer 32MB、windowsHide、可选 stdin input，`:73-80`）；`result.error` → ok:false（`:83`）；否则 `ok = status===0`（`:84`）。
2. **ensureShadowRepo**（`:109-143`）：无 HEAD → mkdir（失败→false `:113-115`）+ `init --bare --quiet`（`:118-123`，status!==0→false）；校验 `rev-parse --is-bare-repository`=='true'（`:126-127`）；写空 `empty-excludes` 文件（`:129-134`）；配置 5 键（`core.excludesfile`→空文件、`autocrlf=false`、`safecrlf=false`、`gc.auto=0`、`core.longpaths=true`，`:135-141`）全部成功才 true（`:142`）。注释（`:105-107`）：排除规则完全由调用方给出（不受用户全局 gitignore/后台 gc 影响）、autocrlf=false 保证逐字节还原。
3. **importRefFromRepo**（`:152-173`）：前置校验 isCheckpointRef+isObjectId+existsSync（`:159`）；`fetch --no-tags --quiet <src> <ref>:<ref>`（`:163-166`，注释 `:161-162`：local fetch 只带目标 ref 可达对象，拷 objects 全目录会带入无关后续检查点）；`cat-file -t <commitSha>`=='commit'（`:169-170`）；`rev-parse --verify <ref>`==commitSha 才 true（`:171-172`）。
4. **snapshotPaths**（`:287-305`）：先 `dropStaleIndexEntries`（索引中不在本次枚举的路径 `update-index --force-remove`，`:289`）——失败即返回 error（保护回退语义，`:290-292`）；`addPathsToIndex` 得 failures（被占用/权限）；再 `dropStaleIndexEntries(failures)` 把未快照路径清出索引（`:295`，失败→error `:296-298`）；`write-tree` → treeSha（`:300-304`）。
5. **dropStaleIndexEntries**（内部，`:229-253`）：优先 `-z --stdin` 一次传入（`:231-236`）；失败按 100 批 + 逐文件重试定位受害者（`:239-251`）。
6. **addPathsToIndex**（内部，`:256-285`）：`pathspecFromFileSupported !== false` 时试 `add --force --pathspec-from-file=- --pathspec-file-nul`（NUL stdin，`:261-264`）；成功置缓存 true（`:266`）；stderr 匹配 `/unknown option|usage:|pathspec-from-file/i` 置缓存 false（`:269`，老 git <2.25 兼容，`:225` 注释）；回退按 100 批 `add --force -- <paths>`（`:273-277`，`-f` 绕过工作区 .gitignore——排除规则只由调用方决定，`:275` 注释）；批失败逐文件重试定位（`:279-282`）。
7. **diffTrees**（`:364-383`）：fromTree===toTree → 空 diff（`:366`）；`diff-tree -r -z --no-renames --name-status`；token 成对解析，`A*`→added、`D*`→deleted、其余→modified（`:373-381`）。
8. **restorePathsFromTree**（`:386-400`）：`read-tree <treeSha>` 切索引（失败→全部路径计为 failed，`:388-389`）；`checkout-index -f` 按 100 批+逐文件回退（`:390-398`）；返回 failed 列表。
9. **countRepoBytes**（`:403-416`）：`count-objects -v` 解析 `size`+`size-pack`，KiB×1024（`:412-413`）。
10. **gcShadowRepo**（`:421-450`）：`options.sync || NODE_ENV==='test'` → 同步 `gc --prune=now --quiet`（120s 超时，`:422-425`，注释 `:420`：测试环境同步防清理临时目录时文件锁未释放）；否则后台 `spawn`（stdio ignore、detached:false、`unref()`，`:437-445`）+ `activeGcRepos` 登记/清理（`:435`/`:443-447`）；spawn 抛错 `console.warn`（`:448`）。

## 4. 调用者与调用链

- 入向（全冻结树检索 `pi-checkpoint-git`）：
  - `lib/pi-file-checkpoint.ts:39`（import 组，跨批上层：检查点管理/引擎选择）。
  - `lib/pi-file-checkpoint.test.ts:15`（批内测试 import `__setGitExecutableForTest`/`fromGitPath`/`isGitSnapshotAvailable`/`toGitPath`；`isGitSnapshotAvailable` 用于 `hasGit`/`gitOnly` `:20-21`，钩子在降级/回收用例 `:380`/`:396`/`pi-file-checkpoint.test.ts:513`/`pi-file-checkpoint.test.ts:645` 使用、`afterEach :30` 复位）。
- 出向：`node:child_process` spawn/spawnSync（`:1`）、`node:fs`（`:2`）、`node:path`（`:3`）、`./git-detector` `findGitPath`（`:4`，跨批）。无业务模块依赖（设计约束 `:18`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：影子仓库目录 mkdir/rmSync（`:112`/`:182`）、`empty-excludes` 文件（`:131`）；git 对象/索引/ref 全部写在 `<sessionDir>/shadow.git` 内（用户仓库零接触）。
- 外部进程：spawnSync/spawn 执行 git（timeout 120s/32MB 缓冲）；后台 gc 为唯一异步子进程（unref，不阻塞退出）。
- 读：existsSync、`ls-files`、`count-objects`、`cat-file`、`for-each-ref`、`diff-tree`。
- 副作用：console.warn 仅后台 gc 失败（`:448`）；无网络。

## 6. 分支、失败、取消与恢复

- **不抛异常**（全文件无 throw，〔证实〕）：所有失败以 `{ok:false}`/`false`/failed[] 表达。
- 快照失败保护：stale 清理失败→整体 error（`:290-292`）；add 失败路径被清出索引再返回 failures（`:295-298`），保证回退时不把未快照文件误当"本轮新增"删除。
- `removeShadowRepo` rmSync `maxRetries:3, retryDelay:50`，异常静默（`:182-185`，残留交由会话目录清理）。
- workTree 已删 → runGit cwd 回落 `process.cwd()`（`:71-72`），仓库级 update-ref/gc 仍可用。
- 不可恢复点：影子仓库目录被外部删除后检查点丢失（上层负责检测，跨批）。
- 取消：不适用（无取消接口；后台 gc 只能等 close/error）。

## 7. 权限与权威状态

- 无 sender/role 检查（不适用，依据：本文件无 Electron IPC 面）。
- 权威状态=影子仓库内的 git 对象/索引/ref；`COMMIT_IDENTITY` 显式身份兜底无 git 身份机器（`:29-30`）。
- 用户仓库保护是核心权限语义（`:11` 设计注释；`isCheckpointRef` 的 `..`/特殊字符拒绝 `:319-324` 防 ref 注入；`importRefFromRepo` 前置校验 `:159`）。

## 8. 修改影响面

- 影响 `pi-file-checkpoint.ts`（跨批）的快照/回退/回收/分叉迁移全部 git 路径；`pi-file-checkpoint.test.ts` 的 git 引擎特性 6 用例与回收 gitOnly 用例直接依赖本层语义（dedup、篡改检测、空仓库释放、孤儿 ref 清理）。
- `pathspecFromFileSupported`/`cachedGitPath` 为模块级缓存（跨实例共享）；改解析逻辑影响所有会话（〔推断〕探测一次全局生效，`:225-226`）。
- git 版本兼容面（<2.25 无 `--pathspec-from-file`）由 stderr 探测维持；升级 git 时行为自动走 stdin 快路径。
- 需同步修改的测试：`pi-file-checkpoint.test.ts`（批内）。

## 9. 测试证据

直接测试：`pi-file-checkpoint.test.ts`（批内，详见其手册）覆盖本层的：未变快照 dedup（`:233-247`）、partial 不去重（`:249-266`）、篡改 treeSha → failed（`:268-286`）、用户仓库 HEAD/索引/对象/stash 零变化且 .gitignore 不豁免（`:288-321`）、二进制/CRLF 逐字节（`:323-339`）、toGitPath/fromGitPath（`:341-349`）、fetch 只带可达对象（`pi-file-checkpoint.test.ts:534-554`）、空仓库释放/孤儿 ref 清理（`pi-file-checkpoint.test.ts:602-653`）。测试钩子 `__setGitExecutableForTest` 用于降级路径（`:380`/`:396` 等）。

`NOT_RUN`：本轮未运行 bun test；未真实执行 git 命令（全部为静态阅读）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出/内部函数/常量/失败保护/双模式 gc | 已证实 | `:1-450` 全文逐行 |
| 入向=pi-file-checkpoint.ts:39 + 批内测试 :15 | 已证实 | 全树检索 `pi-checkpoint-git` |
| 用户仓库零接触、COMMIT_IDENTITY 兜底 | 已证实 | `:11`/`:29-30` + 测试 `:288-321` |
| pathspecFromFileSupported 探测一次全局生效 | 推断 | `:225-226` 模块级缓存 |
| 老版本 git 实际兼容面 | 未知 | 未运行验证（NOT_RUN） |
| `findGitPath` 实现 | 边界（跨批） | `:4` 引入 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| git 解析（override/缓存/findGitPath） | §2/§3.1 | 32-48 | covered |
| `runGit`（cwd 回落/错误面） | §3.1/§6 | 64-85 | covered |
| `ensureShadowRepo` 配置 5 键 | §3.2 | 109-143 | covered |
| `importRefFromRepo`（fetch 可达性+验证） | §3.3 | 152-173 | covered |
| `snapshotPaths`/`dropStaleIndexEntries`/`addPathsToIndex` | §3.4-3.6/§6 | 229-305 | covered |
| `commitTree`/ref 系列/isObjectId | §2/§7 | 307-346 | covered |
| `diffTrees`/`restorePathsFromTree` | §3.7-3.8 | 348-400 | covered |
| `countRepoBytes`/`gcShadowRepo`/`activeGcRepos` | §3.9-3.10 | 403-450 | covered |
| `removeShadowRepo`/路径转换 | §6/§2 | 178-197 | covered |
