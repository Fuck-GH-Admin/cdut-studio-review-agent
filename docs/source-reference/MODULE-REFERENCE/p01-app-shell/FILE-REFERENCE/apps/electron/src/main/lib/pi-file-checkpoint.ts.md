---
path: apps/electron/src/main/lib/pi-file-checkpoint.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bb6257c61704786f546b62e8a1093503bf37ec1c
sha256: 9e002204b5941e04843e05e749e77b888679fa33d22acdd1bf3fd89760d14056
lines: 1284
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-file-checkpoint.ts

## 1. 结论与边界

Pi 文件检查点引擎（主进程运行时）：Pi 运行时没有 Claude SDK 的 file-history-snapshot，Profer 在每轮开始前做一次基线快照，rewind/fork 时用它恢复工作区文件（文件头 `apps/electron/src/main/lib/pi-file-checkpoint.ts:41-56`）。双引擎：git 对象快照（每会话私有 bare 影子仓库，`:47-50`）+ git 不可用时全量复制降级（`:54-55`）；清单格式 v1（纯数组）/v2（复制目录）/v3（git）向后兼容（`:451-453,:474-508`）。回退安全语义：`skipped`/`partial` 保护、确定性排除、路径越界/符号链接防护、回收与磁盘预算。

边界：不含 git 命令细节（`pi-checkpoint-git` 的 19 个函数，`:18-39`）；不管理会话 JSONL/rewind UI（`agent-session-manager`）；不跟随符号链接、不快照 socket/FIFO（`:416-426`）；快照是同步链路（`sleepSync` 不让出事件循环，`:226-230`）。

## 2. 导出与关键符号

`export` 逐条核对：21 个导出 = 5 常量 + 2 类型 + 7 接口 + 7 函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MAX_SNAPSHOT_FILE_BYTES` | 常量（导出） | 101 | `50*1024*1024` | 单文件上限，超过记 skipped |
| `MAX_SNAPSHOT_TOTAL_BYTES` | 常量（导出） | 104 | `1GB` | 总量上限，超过置 partial |
| `MAX_SNAPSHOT_FILE_COUNT` | 常量（导出） | 107 | `500` | 文件数上限（防几十万文件阻塞） |
| `MAX_CHECKPOINTS_PER_SESSION` | 常量（导出） | 110 | `40` | 会话检查点数量上限 |
| `MAX_CHECKPOINT_BYTES_PER_SESSION` | 常量（导出） | 111 | `2GB` | 会话检查点字节上限 |
| `PiCheckpointEngine` | 类型（导出） | 119 | `'git' \| 'copy'` | |
| `PiCheckpointMode` | 类型（导出） | 121 | `'auto' \| 'git' \| 'copy'` | auto=git 优先失败降级 |
| `PiCheckpointSkip` | 接口（导出） | 123-130 | `{path, kind:'file'\|'dir', reason}` | 存在但未快照项 |
| `PiGitCheckpointRef` | 接口（导出） | 132-142 | `{dir, workTree, treeSha, commitSha, ref, limits?}` | 影子仓库引用 |
| `PiFileCheckpoint` | 接口（导出） | 144-156 | `{path, engine, files, skipped, partial, limits?, git?}` | 检查点 |
| `PiRestoreResult` | 接口（导出） | 158-165 | `{changed, skipped, incomplete, failed?}` | 回退结果 |
| `PiCheckpointOptions` | 接口（导出） | 167-171 | `{maxFileBytes?, maxTotalBytes?, mode?}` | |
| `isAgentWorkspaceSandbox` | 函数（导出） | 761-790 | `(dir?: string) => boolean` | 沙箱判定（§7） |
| `createPiFileCheckpoint` | 函数（导出） | 792-830 | `(sessionId, cwd, rootDir, options?) => PiFileCheckpoint` | 建基线 |
| `loadPiFileCheckpoint` | 函数（导出） | 832-855 | `(path) => PiFileCheckpoint` | 读 v1/v2/v3 |
| `restorePiFileCheckpoint` | 函数（导出） | 857-865 | `(checkpoint, cwd) => PiRestoreResult` | 回退 |
| `removePiFileCheckpoints` | 函数（导出） | 1009-1018 | `(rootDir, sessionId) => void` | 删整会话目录 |
| `PiCheckpointAdoptionResult` | 接口（导出） | 1020-1025 | `{adopted: Record<string,string>, failed: string[]}` | 迁移结果 |
| `adoptPiFileCheckpoints` | 函数（导出） | 1074-1142 | `(params{rootDir,targetSessionId,paths}) => PiCheckpointAdoptionResult` | 分叉基线迁移 |
| `PiPruneResult` | 接口（导出） | 1144-1151 | `{removed, removedBound, releasedRepo}` | 回收结果 |
| `prunePiFileCheckpoints` | 函数（导出） | 1161-1284 | `(rootDir, sessionId, options?) => PiPruneResult` | 回收 |

关键内部符号（`export` 逐条核对外的内部实现）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `NEVER_ENTER_DIRS`/`DERIVED_DIRS`/`SKIP_FILE_NAMES` | 59/67-81/84-92 | 排除规则：.git/node_modules/检查点目录/.claude；构建缓存目录；锁/噪音文件 |
| `CONTENT_REWRITING_ATTRIBUTES` | 98 | `text\|filter\|eol\|working-tree-encoding\|ident`，命中即弃 git 引擎 |
| `MANIFEST_NAME`/`ORPHAN_CHECKPOINT_TTL_MS` | 115/117 | `.manifest.json`；无清单目录 10 分钟保鲜期 |
| `isSafeCheckpointPath`/`safeWorkspacePath` | 237-246/266-275 | 清单路径防越界（拒绝对/盘符/空段/'..'；root 后再校验） |
| `walk` | 383-445 | 遍历+排除+上限+`rewriteRisk`（见 §3.1） |
| `copyFileResilient` | 296-311 | 单文件复制，EBUSY/EPERM/EACCES/EMFILE/ENFILE 按 0/40/120/300ms 退避重试（`:113-114`），只允许常规文件 |
| `prepareRestoreParent`/`prepareRestoreFileTarget`/`removeWorkspaceFile` | 314-334/337-347/350-355 | 恢复前逐段 lstat 拒符号链接、清 file↔dir 冲突、删新增 |
| `readManifest`/`readGitManifest`/`readCheckpointEntry` | 447-472/475-508/511-518 | v1 数组/v2 对象/v3 git 清单解析+校验 |
| `buildProtection` | 528-542 | skipped → 保护集：file 记精确路径、dir 记子树前缀 |
| `checkpointIdentity` | 561-576 | treeSha+skipped+partial+limits 的语义身份（dedup 用） |
| `writeJsonAtomic` | 578-586 | tmp+rename 原子写，finally 清理 tmp |
| `tryCreateGitCheckpoint`/`createCopyCheckpoint` | 613-713/716-754 | 双引擎创建（§3.2/§3.3） |
| `restoreGitCheckpoint`/`restoreCopyCheckpoint` | 872-957/966-1007 | 双引擎回退（§3.4） |
| `copyCheckpointDir` | 1033-1064 | 迁移复制：优先 `linkSync` 硬链接，失败退容错复制 |
| `isBrowserProfileDir` | 286-293 | `Local State` + Default/Profile N 判 Chromium profile |
| `mergeSkipped`/`buildGitFailureSkips`/`logSnapshotWarnings`/`logRestoreWarnings`/`limitsFrom`/`relativePath`/`describeError`/`formatBytes`/`sleepSync`/`isRetryable`/`isSkipEntry`/`validateManifestFiles`/`findLatestGitCheckpoint` | 277-283/554-559/544-552/959-963/520-525/210-212/214-218/220-224/227-230/232-235/248-257/259-264/589-601 | 工具函数（合并/过滤/日志/限额/格式化/清单校验） |

## 3. 内部逻辑与关键流程

### 3.1 `walk` 遍历（`:383-445`）

目录读失败 → 整目录记 `kind:'dir'` 跳过（`:392-395`）；`.gitattributes` 命中改写属性 → `rewriteRisk=true`（`:397-405`）；符号链接记跳过绝不跟随（`:416-419`）；目录排除 NEVER_ENTER/DERIVED/浏览器 profile（`:421-424`）；socket/FIFO 静默跳过（`:426`）；SKIP_FILE_NAMES 跳过（`:427`）；单文件超限记 skipped（`:429-436`）；总量或文件数超限 → `partial=true` 停止收集（`:437-440`）。

### 3.2 `createPiFileCheckpoint`（`:792-830`）

1. 非沙箱 cwd → 不快照，返回 `partial:true` + `skipped:[{path:'.',kind:'dir',reason:'非沙箱目录拒绝快照'}]`（`:798-808`）。
2. `walk` 后：`mode!=='copy'` 且无 `rewriteRisk` 时先试 git（`:817-822`）；git 失败：`mode==='git'` 抛错，否则 warn 后降级复制（`:823-826`）；有 `rewriteRisk` 直接复制（`:818-819`）。

### 3.3 `tryCreateGitCheckpoint`（`:613-713`）

git 不可用→reason（`:620`）；`ensureShadowRepo` 失败→reason（`:623`）；`snapshotPaths` 生成 tree（`:624-626`），失败路径并入 skipped（`:628-631`）；**dedup**：与会话内最新 git 清单的语义身份（treeSha+skipped+partial+limits）相同则直接复用旧检查点（`:634-656`）；否则 `commitTree`+`updateRef` 写检查点 ref（`:658-665`）；v3 清单 `writeJsonAtomic` 原子落盘，失败时删 ref 并 gc（`:683-690`）。

`createCopyCheckpoint`（`:716-754`）：目录名=时间戳+随机串（`:723-727`）；逐文件 `copyFileResilient`，失败进 skipped（`:732-736`）；v2 清单写失败 → 整目录删除后抛错（`:746-751`）。

### 3.4 回退（`restorePiFileCheckpoint` `:857-865` → git/copy 分支）

git 回退（`:872-957`）：沿用快照 limits（`:876-880`）；当前态 `walk`+`snapshotPaths`，快照/diff 失败 → `{incomplete:true, failed:true}` 不动工作区（`:884-906`）；`canSafelyDelete = !checkpoint.partial && !current.partial && current.skipped.length===0`（`:914`）才允许删「本轮新增」，且基线 protected 项保留不删（`:915-930`）；modified/deleted 从基线 tree `restorePathsFromTree` 还原（`:932-948`）。

copy 回退（`:966-1007`）：同 `canSafelyDelete` 熔断（`:979-992`）；删未保护新增后逐文件 `restoreCopyFile` 回写（`:994-998`）。

两者的 `incomplete` 由 partial/skipped/当前扫描状态共同决定（`:953,:1003`），UI 不得呈现完全成功（`:161-164` 注释）。

### 3.5 迁移 `adoptPiFileCheckpoints`（`:1074-1142`）

复制引擎目录 → `copyCheckpointDir`（硬链接优先，`:1097-1106`）；git 条目 → `importRefFromRepo` 仅导入该 ref 可达对象 + 清单 `dir` 改指目标影子仓库（`:1108-1131`）；失败进 `failed` 保留原引用（`:1132-1140`）。不变式：**会话的 piFileCheckpoints 只指向自己的检查点目录**（`:1066-1073` 注释）。

### 3.6 回收 `prunePiFileCheckpoints`（`:1161-1284`）

无清单目录/坏清单超 10 分钟保鲜期即 GC（`:1212-1227`）；未被 `keepPaths` 引用的条目直接删（git 先删清单再删 ref，`:1176-1193,1231`）；被引用条目超数量/字节预算从最旧删并 `removedBound` 计数（`:1246-1255`）；孤儿 ref（无 manifest）删除（`:1257-1266`）；无 git 幸存者时释放整个影子仓库，否则 `gcShadowRepo`（`:1268-1276`）。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：

- `createPiFileCheckpoint`+`prunePiFileCheckpoints`：`agent-orchestrator.ts:115`（import）、`:2129/:2140`（每轮基线）、`:2334`（`keepPaths` 回收）。
- `loadPiFileCheckpoint`/`restorePiFileCheckpoint`：`agent-session-manager.ts:36`（import）、`:2011`（fork 侧恢复）、`:2371`（rewind 恢复）。
- `adoptPiFileCheckpoints`：`agent-session-manager.ts:1514,2056`（分叉迁移）。
- `removePiFileCheckpoints`：`agent-session-manager.ts:1590`（会话删除）。
- `prunePiFileCheckpoints`：另 `agent-session-manager.ts:1464,2419`。
- `isAgentWorkspaceSandbox`：`adapters/pi-agent-adapter.ts:16,2620`（cwd 守卫）、`document-parse-tools.ts:27,370`（解析工具守卫）。

出向：`pi-checkpoint-git` 19 个函数（`:18-39`）；`config-paths` `resolveConfigDir`（`:17`）；`node:fs`/`node:os`/`node:path`。注释交叉：`config-paths.ts:391`（检查点目录生命周期）。

## 5. 数据 I/O、读写与副作用

- 写：<rootDir>/<sessionId>/ 下 v3 清单 JSON（原子 tmp+rename `:578-586`）或 v2 复制目录 + `.manifest.json`；影子 bare 仓库对象/ref（经 pi-checkpoint-git）；回退时写工作区文件/删新增。
- 读：工作区递归（lstat/readdir/`.gitattributes`）；清单 JSON。
- 副作用：`console.warn/log` 诊断；同步阻塞主进程（设计使然 `:226-230`）；`sleepSync` 用 `Atomics.wait` 同步退避。
- 原子性/幂等：清单原子写；git dedup 语义身份（`:634-656`）；`adopt` 目标已存在直接映射（`:1091-1093`）；`prune` 顺序=先清单后 ref，避免“可见但不可恢复”（`:1178` 注释）。
- 并发：无锁，同步 API；调用方（agent-orchestrator/session-manager）串行使用（推断）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 拒绝快照 | 非沙箱 cwd | 798-808 | 空检查点+partial |
| git→copy 降级 | git 不可用/初始化失败 | 823-826 | warn+复制 |
| 强制 git 失败 | mode:'git' | 824 | 抛错 |
| rewriteRisk | .gitattributes 改写内容 | 818-819 | 直接复制（逐字节保证） |
| 清单写失败（git） | writeJsonAtomic 抛错 | 686-690 | 删 ref+gc，返回 reason |
| 清单写失败（copy） | 同上 | 746-751 | 删目录+抛错 |
| 恢复比较失败 | snapshot/diff 失败 | 884-906 | `failed:true`，不动文件 |
| 禁删熔断 | partial/skipped 非空 | 912-930, 979-992 | 跳过新增清理并 warn |
| 路径越界 | 清单含 ../等 | 259-264, 461-471 | 加载即拒（测试实证） |
| 孤儿 GC | 无清单目录 >10min | 1212-1227 | 删除 |
| 仓库释放 | 无 git 幸存者 | 1268-1276 | removeShadowRepo |

无取消机制：全同步；失败一律降级保任务（`:54-55` 设计注释）。恢复/重试=下次调用重新快照；`restorePiFileCheckpoint` 对不存在清单直接抛错（`:858`）。

## 7. 权限与权威状态

- `isAgentWorkspaceSandbox`（`:761-790`）：绝对拒止用户主目录/盘符根/`process.cwd()` 及其子路径（`:775-777`）；生产必须位于 `resolveConfigDir()/agent-workspaces/` 下（`:779-781`）；`NODE_ENV==='test'` 或 `BUN_TEST==='1'` 时额外允许系统临时目录（`:783-787`）；Windows 路径大小写归一（`:763-769`）。
- 清单路径安全：`isSafeCheckpointPath`/`safeWorkspacePath` 拒绝对路径/盘符/空段/'..'（`:237-246,266-275`）；`readManifest`/`readGitManifest` 逐项校验（`:259-264,482`）。
- 符号链接防护：walk 不跟随（`:416-419`）；恢复前逐段 lstat 拒链接（`:321-323`）；删除仅限常规文件/链接（`:352-353`）。
- 权威：仅主进程使用（无 IPC 直通，入向均为主进程模块）；无 sender/role 检查——安全边界是文件系统沙箱而非用户身份，依据：本文件无 Electron sender 校验。

## 8. 修改影响面

- 4 个直接调用模块（§4）：agent-orchestrator（每轮基线/回收）、agent-session-manager（rewind/fork/删除）、pi-agent-adapter、document-parse-tools（沙箱守卫）。
- 清单格式 v1/v2/v3 是持久化契约：改字段需兼容历史会话（`:451-453` 兼容逻辑 + 测试 §9 兼容用例）。
- 与 `pi-checkpoint-git` 的函数契约（19 个导入符号）；与 `agent-session-manager` 的 `piFileCheckpoints` 恒等式（`:1066-1073`）。
- 改排除规则/上限会同时影响基线覆盖率与回退完整性（`incomplete` 语义）。
- 需同步的测试：`pi-file-checkpoint.test.ts`（32 用例，见 §9）、`agent-session-manager.pi-runtime.test.ts`/`pi-fork.test.ts`（间接）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/pi-file-checkpoint.test.ts`（非本批文件，698 行，32 个用例定义：8 个在 `ENGINES=[git,copy]` 双引擎 describe 内各跑两遍、9 个 `gitOnly` 无 git 环境跳过、1 个 `test.skipIf(win32)`）。真实断言抽核（NOT_RUN，静态读）：

- 改/增/删回退全等（`:50`）：`restored.changed` 含三文件、`modified.txt` 回 'before'、`created.txt` 抛错（`expect(() => readFileSync(...)).toThrow()`）。
- 排除规则（`:72`）：`checkpoint.files` 仅 `['.context/evidence/report.md']`、`skipped` 为空、浏览器锁文件/node_modules/dist/LOCK 回退后仍存在。
- 超限语义（`:105,:128`）：大文件进 skipped 且 `incomplete:true`；总量超限 `partial:true` 且新增文件不删。
- 目录不可读/符号链接（`:145,:185`）：dir 级保护子树不删；外链目标不遍历不删、链接保留。
- file↔dir 冲突（`:212`）：恢复后是文件内容 'baseline-file'。
- git 语义（gitOnly）：同内容 dedup 复用旧检查点（`second.path===first.path`）；partial 不 dedup（`:248` 附近）；篡改 treeSha → `failed:true` 不动工作区；用户仓库 HEAD/status/objects/stash 四不变 + `.gitignore` 不豁免；二进制/CRLF 逐字节还原。
- 引擎降级（`:379,:395,:403`）：无 git → copy 引擎可回退；强制 git 抛错；`.gitattributes text=auto` → copy。
- 历史兼容（`:419,:434,:461`）：v1 纯数组/v2 skipped 保留/越界路径 `toThrow('无效路径')` 且外部文件不动。
- 分叉迁移（`:478,:512,:533,:556`）：源会话删除后分叉仍可回退、清单 `dir` 指向目标仓库；copy 引擎硬链接迁移；git 仅导入可达对象（`cat-file -e` 后续 commit 抛错）；缺失基线记 `failed`。
- 回收（`:570,:604,:620,:637,:655,:669,:684`）：未引用删/超限从最旧删 `removedBound:1`；全删释放 shadow.git；孤儿 ref 被删；copy 降级残留空仓库释放；keepPaths 保留；无清单过期 GC 新鲜保留；删会话仅自身目录。

未覆盖：真实大仓库性能、Windows 真机（用例多为 POSIX 优先）、并发调用交错。测试断言为静态读取，NOT_RUN（未执行）。

间接证据：`agent-session-manager.pi-runtime.test.ts`、`agent-session-manager.pi-fork.test.ts`（引用本文件，非本批，未逐条读，标间接）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 导出及行号/签名 | 已证实 | `:101-1161` 逐条 grep+读 |
| 双引擎创建/降级/rewriteRisk | 已证实 | `:792-830, 613-754` |
| dedup 语义身份 | 已证实 | `:634-656` + 测试 `second.path===first.path` |
| canSafelyDelete 熔断 | 已证实 | `:912-930, 979-992` + 测试 `:128` |
| 沙箱三段判定 | 已证实 | `:761-790` |
| 清单原子写/回收顺序 | 已证实 | `:578-586, 1176-1193` |
| 4 调用模块行号 | 已证实 | §4 |
| 32 测试用例及关键断言 | 已证实 | `pi-file-checkpoint.test.ts`（整读） |
| 调用方串行使用、无并发保护 | 推断 | 同步 API + 调用点上下文 |
| shadow 仓库 git 命令行为 | 未知 | 在 `pi-checkpoint-git`（非本批），只核导入符号存在 |
| 运行期性能/真实大仓库 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 21 导出 | §2 | 见表 | covered |
| walk 排除/上限/rewriteRisk | §3.1 | 383-445 | covered |
| 创建（sandbox/git/copy/dedup） | §3.2-3.3 | 792-830, 613-754 | covered |
| 回退（两引擎+熔断+保护） | §3.4 | 857-1007 | covered |
| 迁移 adopt | §3.5 | 1074-1142 | covered |
| 回收 prune/GC/仓库释放 | §3.6 | 1161-1284 | covered |
| 权限/路径安全/符号链接 | §7 | 237-275, 321-323, 761-790 | covered |
| 失败/降级矩阵 | §6 | 见表 | covered |
| 调用链 | §4 | - | covered |
| pi-checkpoint-git 内部 | §10 | - | unknown（非本批） |
| 运行期表现 | §9-10 | - | unknown（NOT_RUN） |
