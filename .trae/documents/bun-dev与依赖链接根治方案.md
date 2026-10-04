# 根治 `bun run dev` 报错与依赖链接引发的类型检查错误

## 1. 摘要（Summary）

本方案同时消除两个长期反复出现的问题：

1. **`bun run typecheck` / 模块解析错误反复出现**（“几乎每次做修改后都会出现”）。
2. **`bun run dev` 报错、窗口起不来**（终端最终 `script "dev:electron" exited with code 1`）。

两者根因同源：本项目在 Windows 上使用 Bun 的 **isolated（隔离）链接器**，依赖 `node_modules` 内的软链接/junction 才能把 `@profer/*` 工作区包挂载到位；链接创建在该机器上不完整、且**每次 `bun install` 都会重建**，因此任何一次安装/改动环境都可能把链接打回原形，表现为 `Cannot find module '@profer/...'` 与 dev 构建失败。

根治策略：**把链接器固定为 `hoisted`（npm 式扁平布局，不依赖符号链接权限）**，并补齐 Electron 二进制安装与 dev 启动前对残留单实例锁的清理。仓库现有脚本（`run-electron-builder.cjs`、`macos-signature.cjs`、`electron-builder.yml`）**已经兼容 hoisted 布局**，因此该切换不引入新的打包风险。

---

## 2. 现状分析（Current State Analysis）

### 2.1 已验证事实（基于本机实际探查）

| 观测点 | 结论 |
|--------|------|
| `bun.lock` 第 3 行 | `"configVersion": 1` —— 配合 `workspaces` 时 Bun 默认使用 **isolated 链接器** |
| 根 `bunfig.toml` | **没有** `[install]` 段，未显式固定链接器 |
| 根 `node_modules/@profer/` | 目前是 7 个 **Junction**（agent-fabric/core/electron/project-core/session-core/shared/ui），指向 `packages/*` 与 `apps/electron` |
| `node_modules/.bun/@profer*` | **不存在**（说明当前是 hoisted 式布局，而非 isolated 虚拟仓库） |
| `apps/electron/node_modules/@profer/` | **空** |
| `apps/electron/node_modules/.bin/` | 只有 `anthropic-ai-sdk.{bunx,exe}`，**缺** `vite`/`esbuild`/`concurrently`/`electron` 本地 shim（依赖向上查找到根 `.bin`，属正常但脆弱） |
| `node_modules/electron/dist/electron.exe` / `path.txt` | 存在（**本次会话中途由首次 `bunx electron` 懒下载补齐**；此前缺失） |
| 全仓库 `package.json` | **无** `postinstall` / `preinstall` / `trustedDependencies` —— Bun 默认不执行依赖的安装脚本，Electron 的二进制下载被跳过 |

### 2.2 已复现的 `bun run dev` 失败链（本机）

从捕获日志（`job-33ba41c9a4744065a8a528b65b3dbe73/output.log`）可确认：

```
[electron] ERROR:chrome\browser\process_singleton_win.cc:446] Lock file can not be created! Error code: 5
[electron] [启动] 已有 CDUT Studio 进程持有单实例锁，本次启动将退出。
[electron] [运行时初始化] 写入缓存失败: EPERM: operation not permitted, open 'C:\Users\Belie\.cdutai-dev\runtime-cache.json'
[electron] [goal] 状态恢复失败 EPERM ... '\goals.json.13692.tmp'
[electron] [任务/日程] 检查提醒失败: disk I/O error (ERR_SQLITE_ERROR)
[electron] net\disk_cache ... Unable to move the cache: 拒绝访问。(0x5)
[electron] bunx electron . exited with code 0          ← Electron 因单实例锁直接退出
[electron] bun run watch:main exited with code 1       ← concurrently -k 被级联杀掉
[electron] bun run watch:preload exited with code 1
[electron] error: script "dev:electron" exited with code 1
[vite]     bun run dev:vite exited with code 1          ← 顶层 concurrently -k 再级联
```

**关键因果**：Electron 主进程一旦拿不到单实例锁/写不了 userData 就直接 `app.quit()`，`concurrently -k` 随即把并行的 `watch:*`/`vite` 一起杀掉，最终整个 `bun run dev` 退出码 1。

> 说明：本机复现叠加了工具沙箱对 `~/.cdutai-dev`、`%APPDATA%\@cdutai` 的写限制，因此 EPERM 类错误可能是“沙箱放大”后的结果；但**单实例锁 + 级联退出**这条链是真实的，且很可能也是你在自己终端里遇到的现象之一。

### 2.3 为什么“几乎每次做修改后都会出现”

- isolated 链接器需要 Bun 在 `node_modules` 内维护软链接/junction；该机器上链接创建不完整（根与子包状态不一致：根有 junction、`apps/electron` 为空、`packages/shared` 曾出现散落符号链接）。
- 只要执行一次默认 `bun install`（或环境/工具触发重装），Bun 就按 isolated 布局重建 `node_modules`，**覆盖掉临时手工补的 junction**，`@profer/*` 立刻解析失败 → typecheck/dev 报 `Cannot find module`。
- 由于没有 `[install]` 固定项，行为由 Bun 默认策略决定，**不可预期、不可复现**，所以表现为“改了就又坏”。

### 2.4 为什么 dev 首次/清理后可能直接失败

- 无 `trustedDependencies` → `bun install` 不跑 Electron 的 `install.js` → `node_modules/electron/dist/`、`path.txt` 缺失 → `bunx electron .` 只能在首次运行时**联网懒下载**，慢、且离线必失败。

---

## 3. 拟改动（Proposed Changes）

### 改动 1 —— 固定 hoisted 链接器（根治，最高优先级）

**文件 A：`c:\Users\Belie\Desktop\CDUT-Studio\bunfig.toml`**

在现有 `[test]` 段之外，新增：

```toml
[install]
# 固定为 hoisted（npm 式扁平布局）。Windows 上 isolated 链接器依赖
# node_modules 内的符号链接/junction 权限，权限不足或重装时会导致
# @profer/* 工作区包解析失败，表现为 typecheck / dev 反复报 Cannot find module。
# hoisted 布局不依赖符号链接权限，且仓库打包脚本已兼容该布局。
linker = "hoisted"
```

**文件 B：`c:\Users\Belie\Desktop\CDUT-Studio\apps\electron\bunfig.toml`**

追加同内容 `[install] linker = "hoisted"`，避免从子包目录执行 `bun install` 时回落到默认 isolated。（保留其现有 `[test] preload` 段。）

**为什么安全**：`apps/electron/scripts/run-electron-builder.cjs` 已显式兼容 hoisted（`hoistedCandidate = node_modules/electron-builder/out/cli/cli.js`）；`apps/electron/scripts/macos-signature.cjs`、`electron-builder.yml`（排除 workspace symlink）同样按“两种布局皆可”编写；`sync-runtime-deps.ts` 反而**拒绝**绝对符号链接，hoisted 更契合。

---

### 改动 2 —— 让 Electron 二进制在安装期就位

**文件：`c:\Users\Belie\Desktop\CDUT-Studio\package.json`**（根包，顶层）

新增：

```json
"trustedDependencies": ["electron"],
```

**为什么**：Bun 默认不执行依赖的 lifecycle 脚本；把 `electron` 列入 `trustedDependencies` 后，`bun install` 会执行 Electron 的安装脚本，直接产出 `node_modules/electron/dist/electron.exe` 与 `path.txt`，避免首次 `bun run dev` 的联网懒下载与离线失败。
（`esbuild` 平台二进制走 `optionalDependencies` 分发、无需脚本；`@silurus/ooxml` 的构建由 `build:ooxml` 手动步骤负责，均**不**加入，保持最小改动。）

---

### 改动 3 —— dev 启动前清理残留单实例锁（消除级联退出）

**文件：`c:\Users\Belie\Desktop\CDUT-Studio\apps\electron\scripts\dev-kill.ts`**

在既有 `killStaleElectronmon()` / `killStaleElectron()` / `killVite` 流程之后，新增一个**尽力而为、带守卫**的步骤：

1. 复用已有纯函数解析开发版 userData 目录：
   ```ts
   import { resolveDevUserDataPath } from '../src/main/lib/dev-instance'
   // appData: win32 → process.env.APPDATA；darwin → ~/Library/Application Support；
   //          其他 → process.env.XDG_CONFIG_HOME ?? ~/.config
   const devUserData = resolveDevUserDataPath(appData, /* isPackaged */ false, process.env)
   ```
2. 在**已确认杀掉本仓 Electron 进程之后**，删除该目录下 Chromium 单实例残留文件（存在才删，异常静默忽略）：
   - `SingletonLock`
   - `SingletonCookie`
   - `SingletonSocket`

**为什么**：被中断的 dev 会话可能残留上述锁文件，导致下一次 `bunx electron .` 拿到 `Lock file can not be created` 并立刻退出，从而触发 `concurrently -k` 级联退出码 1。杀掉进程后再清锁，可让 `bun run dev` 稳定起来。
**风险控制**：仅删除固定的 Chromium 单实例文件、且严格限定在解析出的开发版 userData 目录内，不触碰正式版目录，不影响其他数据。

---

### 明确不做的事（Out of Scope）

- 不修改 `~/.cdutai-dev`（配置目录）相关的 `config-paths.ts` 代码；其中的 EPERM/disk I/O 若在你终端复现，属**环境权限/杀软占用**问题，按第 5 节“恢复步骤”处理。
- 不改动 `concurrently -k` 的语义（失败即级联终止是刻意的开发期行为）。
- 不新建 doctor/诊断脚本（保持仓库精简，避免过度设计）。
- 不修改 `AGENTS.md` / `README.md` / `CLAUDE.md`（文档改动需你另行授权）。

---

## 4. 假设与决策（Assumptions & Decisions）

| # | 假设/决策 | 依据 |
|---|-----------|------|
| A1 | 采用 `hoisted` 而非要求开启 Windows 开发者模式/管理员权限 | hoisted 无需符号链接权限，普适性最强；仓库脚本已兼容 |
| A2 | 仅把 `electron` 加入 `trustedDependencies` | 只有它需要下载二进制；其余依赖无需脚本 |
| A3 | 单实例锁清理为“尽力而为”且限定开发版 userData | 避免误删正式版数据；锁文件名按 Chromium 约定 |
| A4 | 不做文档改动 | 项目规则：文档改动需用户授权 |
| A5 | 首次需执行一次 `bun install` 使 hoisted 布局生效 | 配置变更需重装才重排 `node_modules` |

---

## 5. 验证与恢复（Verification）

### 5.1 实施后验证（按顺序）

1. 在仓库根执行一次 `bun install`，确认无报错。
2. 结构自检（PowerShell，只读）：
   ```powershell
   Get-ChildItem node_modules\@profer | Select-Object Name,LinkType
   Test-Path node_modules\electron\dist\electron.exe   # 期望 True
   Test-Path node_modules\electron\path.txt            # 期望 True
   ```
3. **类型检查稳定性**：`bun run typecheck`，期望 8 个包全部 `Exited with code 0`。
4. **复现性回归**：随意编辑一个 renderer `.tsx`（触发改动）后，再次 `bun run typecheck`，确认**不再出现** `Cannot find module '@profer/...'`，且**无需**手工补 junction。
5. **dev 启动**：`bun run dev`，期望 Vite `ready`、Electron 窗口出现，终端**无** `已有 CDUT Studio 进程持有单实例锁` 与 `dev:electron exited with code 1`；退出时 `Ctrl+C`。

### 5.2 若 `~/.cdutai-dev` / `%APPDATA%\@cdutai` 仍报 EPERM 或 disk I/O error（环境侧恢复）

1. 关闭所有开发版与正式版窗口，确认无 `electron.exe` / `CDUT Studio.exe` 残留（可复用 `bun run dev:kill`）。
2. 将 `C:\Users\Belie\.cdutai-dev` 与 `C:\Users\Belie\AppData\Roaming\@cdutai` 加入 Windows Defender / 第三方杀软的排除目录。
3. 如仍失败，重命名备份后再让程序重建：
   ```powershell
   Rename-Item "$env:USERPROFILE\.cdutai-dev" ".cdutai-dev.bak" -ErrorAction SilentlyContinue
   ```
   随后重新 `bun run dev`。

---

## 6. 改动文件清单

| 文件 | 改动 | 目的 |
|------|------|------|
| `bunfig.toml`（根） | 新增 `[install] linker = "hoisted"` | 根治链接布局不稳定 |
| `apps/electron/bunfig.toml` | 新增 `[install] linker = "hoisted"` | 子包安装一致 |
| `package.json`（根） | 新增 `"trustedDependencies": ["electron"]` | 安装期就位 Electron 二进制 |
| `apps/electron/scripts/dev-kill.ts` | 新增开发版 userData 单实例锁清理 | 消除 dev 级联退出 |

**改动文件总数：4**（均为既有文件编辑，不新建文件）。
