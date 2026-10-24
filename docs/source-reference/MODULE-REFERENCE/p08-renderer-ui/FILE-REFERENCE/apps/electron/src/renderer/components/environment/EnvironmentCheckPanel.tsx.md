---
path: apps/electron/src/renderer/components/environment/EnvironmentCheckPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ca781e3822e83b547c5760d5f8f5b82fd50cf4d
sha256: 0a2d7a804ff44618cb67c09f29a1d89c9d412ecccf97b297b9b2202c23a767de
lines: 183
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/environment/EnvironmentCheckPanel.tsx

## 1. 结论与边界

本地环境检测面板（渲染层运行时）：Windows 显示 Shell 环境（Git Bash/WSL）、其他平台系统 Shell；同时显示 Node.js 检测结果；用于 Onboarding Step 2 与 `EnvironmentCheckDialog` 复用（文件头 `apps/electron/src/renderer/components/environment/EnvironmentCheckPanel.tsx:1-6`）。

边界：检测执行在主进程 runtime-init（`reinitRuntime`/`getRuntimeStatus`）；下载动作在 `EnvironmentCheckCard`；不做 Git/Bun 检测展示。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EnvironmentCheckPanel` | 函数/组件（导出） | 27-183 | `({autoDetectOnMount = true}) => JSX` | 检测面板 |

`EnvironmentCheckPanelProps`（内部接口 `:22-25`）。

## 3. 内部逻辑与关键流程

### 3.1 检测触发（`:38-68`）

`refresh`（`:38-52`）：并行 `reinitRuntime()`+`fetchInstallerManifest()` 写 atom；失败仅 `console.error`（`:48`）。挂载 effect（`[]` deps，`:54-68`）：`autoDetectOnMount` 为 true 跑 `refresh()`；否则仅当 `runtime` 空时 `getRuntimeStatus()` 兜底 + 拉 manifest（失败静默 `:65`）。**注意组合语义**：Dialog 传 `autoDetectOnMount={open}` 且 effect deps 为 `[]`——首挂载时的 open 值决定是否自动检测，后续 open 变化不重触发（行号 `:54-68` + Dialog `:32`；行为为静态读出）。

### 3.2 状态推导（`:71-110`）

Shell（`:71-93`）：无 runtime→checking；非 Windows→success「系统 Shell 已可用」（`:80-83`）；Windows：Git Bash 优先→WSL→否则 error「未检测到 Git Bash 或 WSL」（`:84-93`）。Node（`:96-110`）：available→success（带版本）；否则 warning「未安装（可选）」（`:107-110`）。

### 3.3 渲染（`:112-181`）

标题随平台（`:116-123`）；「重新检测」按钮=refresh（`:125-138`）；两张 `EnvironmentCheckCard`（Shell：Windows error 时 action=download `git-for-windows`；Node：warning 时 Win/Mac download `nodejs`、其余 openExternal nodejs.org，`:141-166`）；两条提示：Windows `!shellOk` 红条「发送 Agent 消息会失败」（`:169-174`）、`shellOk && !nodeOk` 黄条「npx MCP 才需要」（`:176-180`）。

## 4. 调用者与调用链

入向（全树检索，证实）：**仅 `environment/EnvironmentCheckDialog.tsx:15,32`**。文件头注释称「Onboarding Step 2 复用」（`:5`）——冻结树无 Onboarding 渲染点（否定范围：全树 `*.ts/*.tsx` 名字检索仅命中本文件与 Dialog）。

出向：`./EnvironmentCheckCard`（`:12,142,153`）、`@/atoms/environment`（`installerManifestAtom`/`runtimeStatusAtom`/`isShellEnvironmentOkAtom`/`isNodeJsOkAtom`，`:13-18`）、`window.electronAPI`（`reinitRuntime`/`fetchInstallerManifest`/`getRuntimeStatus`，`:42-64`）、`@profer/ui`（Button/detectIsMac/detectIsWindows）。

## 5. 数据 I/O、读写与副作用

- IPC：重新检测（reinitRuntime——含删缓存强制重检，见 runtime-init 手册）/取状态/拉安装清单。
- 内存写：`runtimeStatusAtom`/`installerManifestAtom`；组件 `isChecking`。
- 副作用：`console.error`。并发/幂等：refresh 无互斥（连点并发两次 reinit，推断）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 自动/兜底检测 | autoDetectOnMount / runtime 空 | 54-66 |
| 检测失败 | Promise.all reject | 47-48 |
| Shell 三态 | 平台/可用性 | 75-93 |
| Node 双态 | available | 97-110 |
| 动作分派 | 平台×状态 | 147-165 |

无取消/恢复概念，依据：一次性检测；用户可「重新检测」。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；检测权威=主进程 runtime-status（atom 缓存）。

## 8. 修改影响面

- 唯一调用方 EnvironmentCheckDialog（§4）；`isShellEnvironmentOkAtom`/`isNodeJsOkAtom` 派生态语义在 `@/atoms/environment`（非本批）。
- 与 runtime-init 的 reinitRuntime 语义耦合（强制删缓存）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `EnvironmentCheckPanel` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实环境检测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 状态推导/渲染分支 | 已证实 | `:27-183` 逐行读 |
| 唯一调用方 Dialog | 已证实 | 全树检索（§4 范围） |
| 注释称 Onboarding 复用但树内无渲染点 | 已证实 | `:5` 注释 vs 全树检索 |
| autoDetectOnMount 只在首挂载生效 | 已证实（静态） | `:32`+`:54-68` |
| refresh 无互斥 | 推断 | 无守卫 |
| 派生 atom/主进程检测实现 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `EnvironmentCheckPanel` | §2-3 | 27-183 | covered |
| refresh/挂载 effect | §3.1 | 38-68 | covered |
| Shell/Node 状态推导 | §3.2 | 71-110 | covered |
| 卡片动作/提示条 | §3.3 | 141-180 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
