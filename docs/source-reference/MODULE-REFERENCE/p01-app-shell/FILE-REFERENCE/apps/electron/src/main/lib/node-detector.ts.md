---
path: apps/electron/src/main/lib/node-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bc0c28b1a657930b97e03865fac7d6c846c035f
sha256: f317497422a09b2e50c9303bad625c5776d9d0139225ad02940e4f3fb6aaa0f4
lines: 222
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/node-detector.ts

## 1. 结论与边界

Node.js 运行时检测（222 行，头注释 `:1-5`）：定位系统中的 node 可执行文件（PATH→平台常见路径兜底）、取版本号、按最低/推荐版本比较，输出 `NodeRuntimeStatus`。

**边界**：不安装/不管理 Node；不做 npm 包管理；`available:true` 只表示“找到且能执行 `--version`”（FACT-CHECKING-NOTES 口径：不能推成后续模型请求/工具链一定可用）；注册表读取细节在 `./windows-env`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectNodeRuntime` | 函数（导出） | 169-203 | `() => Promise<NodeRuntimeStatus>` | 检测主入口 |
| `checkNodeVersion` | 函数（导出） | 213-222 | `(version, minimum='18.0.0', recommended='22.0.0') => {meetsMinimum, meetsRecommended}` | 版本比较 |
| `findNodePath` | 函数（内部） | 19-104 | `() => string \| null` | 路径定位 |
| `getNodeVersion` | 函数（内部） | 112-130 | `(nodePath) => string \| null` | `--version` 取版本 |
| `parseVersion` | 函数（内部） | 138-140 | `(version) => number[]` | 逐段 parseInt |
| `meetsVersion` | 函数（内部） | 149-162 | `(version, target) => boolean` | ≥ 比较（含相等） |

导出合计 2；内部 4。`NodeRuntimeStatus` 来自 `@profer/shared`（`:11`）。

## 3. 内部逻辑与关键流程

1. **findNodePath**（`:19-104`）：
   - PATH 查找（`:20-36`）：`where node`（win32）/`which node`（`:21`），`execSync` 编码 utf-8、timeout 5000（`:23-27`）；取首行（`split(/\r?\n/)[0]`，`:29`）且 `existsSync` 才返回（`:31-33`）；异常被 catch 吞掉（`:34-36`，注释：GUI 从 Finder/Dock 启动可能继承不到 shell PATH）。
   - darwin 兜底（`:39-54`）：7 个常见路径（Homebrew ×2、mise shims/installs、volta、asdf、nvm current，`:41-49`）首个 existsSync 命中即返回。
   - win32 兜底（`:57-101`）：注册表 `getNodeInstallPathFromRegistry()` → `<path>/node.exe`（`:61-64`）；`SCOOP` 环境下 3 个位置（`:71-77`）；`LOCALAPPDATA` 下 2 个 scoop 位置（`:78-83`）；Chocolatey（`:87`）；官方安装器 `ProgramFiles/nodejs`（默认 `C:\Program Files`）与 `C:\Program Files (x86)\nodejs`（`:91-94`）；首个命中返回。
   - 均未命中 → `null`（`:103`）。
2. **getNodeVersion**（`:112-130`）：`spawnSync(nodePath, ['--version'], {timeout:5000})`；`status===0 && stdout` 时去 `v` 前缀返回（`:120-123`）；异常/失败 → `null`（`:125-129`）。
3. **parseVersion/meetsVersion**（`:138-162`）：逐段 `parseInt(n,10)`（`:139`）；逐段比较，缺段按 0（`:154-155`），`>` 返回 true、`<` 返回 false（`:157-158`）；循环耗尽（相等）→ true（`:161`）。
4. **detectNodeRuntime**（`:169-203`）：三段 console 日志（`:170`/`:175`/`:196`）；无路径 → `{available:false, version:null, path:null, error:'未找到 Node.js。请安装 Node.js 后重试。'}`（`:174-182`）；有路径无版本 → `{available:false, version:null, path:nodePath, error:'Node.js 已找到但无法执行'}`（`:186-194`）；成功 → `{available:true, version, path, error:null}`（`:197-202`）。
5. **checkNodeVersion**（`:213-222`）：`{meetsMinimum: meetsVersion(version, minimum), meetsRecommended: meetsVersion(version, recommended)}`。

## 4. 调用者与调用链

- 入向（全冻结树检索 `node-detector`/`detectNodeRuntime`/`checkNodeVersion`）：
  - `lib/runtime-init.ts:14`（import）→ `:93`、`:201` `detectNodeRuntime()`（运行时初始化检测），`runtime-init.ts:333` `export { detectNodeRuntime }`（re-export）。
  - `lib/environment-checker.ts:8`（import 两者）→ `:86` `detectNodeRuntime()`、`:94-95` `checkNodeVersion(nodeStatus.version, '18.0.0', '22.0.0')` 映射 `meetsMinimum/meetsRecommended`。
- 出向：`child_process` `execSync`/`spawnSync`（`:7`）、`fs.existsSync`（`:8`）、`path.join`/`os.homedir`（`:9-10`）、类型 `NodeRuntimeStatus`（`:11`）、`./windows-env` 的 `getNodeInstallPathFromRegistry`（`:12`，跨批实现未深读）。

## 5. 数据 I/O、读写与副作用

- 外部进程：`execSync('which/where node')`（同步阻塞，5s 超时，`:23-27`）；`spawnSync(node, ['--version'])`（`:114-118`）。
- 文件系统只读：`existsSync` 多处（`:31`/`:52`/`:97`）。
- 注册表只读（win32，经 `windows-env`，`:61`）。
- 环境变量读取：`SCOOP`/`LOCALAPPDATA`/`ProgramFiles`（`:67-69`）。
- 副作用：console.log/warn 三段日志（`:170`/`:175`/`:187`/`:196`）。无写盘/网络。

## 6. 分支、失败、取消与恢复

- 全部外部调用均 try/catch 吞异常降级（`:34-36`/`:125-127`）；`getNodeVersion` 以 `status===0` 为准（`:120`）。
- 失败路径即两条错误文案（`:180`/`:192`）+ `available:false`；无重试/无取消（同步短任务）。
- 恢复：不适用（无持久状态）；调用方可依据 `error` 文案提示用户安装（文案面向用户，`:180`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态=本机文件系统/注册表/进程探测结果；无提权行为。注意：`available:true` 不保证后续模型请求可调用（FACT-CHECKING-NOTES §7 口径，照实限定）。

## 8. 修改影响面

- 影响 `runtime-init.ts`（`:93`/`:201`/`runtime-init.ts:333`）的运行时自检与 `environment-checker.ts`（`:86`/`:94-95`）的环境报告（UI 展示 meetsMinimum/meetsRecommended）。
- `NodeRuntimeStatus.error` 文案是用户可见文本（`:180`/`:192`）。
- 兜底路径清单（darwin 7 项/win32 9 项：注册表 1+scoop 3+LOCALAPPDATA 2+Chocolatey 1+官方安装器 2）需随 Node 生态安装方式变化更新；`parseVersion` 的 `parseInt` 对非数字段返回 NaN（照实：比较时 NaN 参与 `>`/`<` 均为 false，语义退化为“相等路径”——无测试覆盖）。
- 需同步修改的测试：冻结树内无本文件测试（§9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `node-detector`/`detectNodeRuntime`/`checkNodeVersion` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试；未真实执行 which/where/注册表路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部内部函数/分支/兜底清单/错误文案 | 已证实 | `:1-222` 全文逐行 |
| 入向=runtime-init.ts、environment-checker.ts（含 re-export） | 已证实 | 全树检索（§4） |
| `getNodeInstallPathFromRegistry` 行为 | 边界（跨批） | `:12` 引入 |
| GUI 无 PATH 的实际场景频率 | 推断 | 注释 `:35` 声明 |
| NaN 版本段的退化语义 | 推断 | `parseInt` 语义（`:139`）+ 比较逻辑（`:157-158`） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `findNodePath`（PATH/darwin/win32 三段） | §3.1 | 19-104 | covered |
| `getNodeVersion` | §3.2 | 112-130 | covered |
| `parseVersion`/`meetsVersion` | §3.3 | 138-162 | covered |
| `detectNodeRuntime`（三结果分支） | §3.4 | 169-203 | covered |
| `checkNodeVersion` | §3.5 | 213-222 | covered |
