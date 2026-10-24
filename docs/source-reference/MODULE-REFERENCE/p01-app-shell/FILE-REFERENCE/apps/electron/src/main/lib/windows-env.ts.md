---
path: apps/electron/src/main/lib/windows-env.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c198868752eaf675b2cd9480a5d16ac0924e362b
sha256: 03d05f37f44632862cf85273828ee2c268bc8c7d179e8ddebcaaa8055dfd5349
lines: 193
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/windows-env.ts

## 1. 结论与边界

Windows 环境变量加载（193 行，头注释 `:1-12`）：GUI 快捷方式启动不继承完整 PATH 的问题面——从注册表读系统/用户 PATH 合并进 `process.env.PATH`（注册表优先），保证 scoop/chocolatey 工具可被发现。另有 Git/Node 安装路径注册表查询。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `readRegistryValue` | 函数（导出） | 31-48 | `(key, valueName) => string \| null` | `reg query` 取值（5s 超时） |
| `getGitForWindowsInstallPath` | 函数（导出） | 57-65 | `() => string \| null` | HKLM→HKCU `GitForWindows` InstallPath |
| `getNodeInstallPathFromRegistry` | 函数（导出） | 74-84 | `() => string \| null` | 仅 win32；HKLM→HKCU `Node.js` InstallPath |
| `loadWindowsEnv` | 异步函数（导出） | 151-193 | `() => Promise<ShellEnvResult>` | 注册表 PATH 合并进 process.env |

内部：`PATH_SEP=';'`（`:22`）、`expandEnvVars`（`:91-95`）、`normalizePathForCompare`（`:100-102`）、`mergeRegistryPath`（`:111-140`）。导出合计 4。

## 3. 内部逻辑与关键流程

1. **readRegistryValue**（`:31-48`）：`execSync('reg query "<key>" /v "<valueName>"', {timeout:5000})`；`valueName` 正则转义（`:42`）后 `<name>\s+REG_\w+\s+(.+)` 提取；catch → null。注意（照实）：**key 直接双引号包裹拼接**（`:34`），valueName 转义防注入但 key 含引号可破命令边界（事实面）。
2. **mergeRegistryPath**（`:111-140`）：split `;` → `expandEnvVars`（`%VAR%` → `process.env`，未定义保留原文，`:92-94`）→ `existsSync` 过滤（`:120`）→ 按 normalize（小写+去尾斜杠）去重 → **新增路径放 PATH 前面**（注册表优先，`:136`）。
3. **loadWindowsEnv**（`:151-193`）：非 win32 → success:true loadedCount:0（`:153-155`）；**非打包（开发模式）跳过**（`:157-160`，终端启动 PATH 已完整）；读系统 PATH（HKLM\SYSTEM\...\Session Manager\Environment）+ 用户 PATH（HKCU\Environment）依次 merge（`:168-184`）；catch → success:false+error（`:188-192`）。

## 4. 调用者与调用链

入向（全冻结树检索 `windows-env`，4 文件）：`lib/git-bash-detector.ts:19`（`getGitForWindowsInstallPath`）、`lib/git-detector.ts:11`（同）、`lib/node-detector.ts:12`（`getNodeInstallPathFromRegistry`）、`lib/shell-env.ts:18`（`loadWindowsEnv`）。出向：`child_process.execSync`、`fs.existsSync`、`electron.app`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

- 读：注册表（`reg query`，只读）。
- **写 `process.env.PATH`**（`:136`，进程级副作用）。
- 副作用：console.log/warn 六条。

## 6. 分支、失败、取消与恢复

- 平台/模式门控（`:153`/`:158`）；readRegistryValue catch→null（不抛）；loadWindowsEnv catch→`{success:false, error}`（不抛）。
- 无回滚（PATH 合并不可逆，进程生命周期内保留）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。注册表读为只读；PATH 写仅进程内。

## 8. 修改影响面

4 个消费方（Git Bash/Node/Git 探测、shell-env）的工具发现能力；PATH 前置策略影响同名工具优先级（注册表版优先于继承版）；key 拼接面（§3.1）如 key 来源不可信是注入面（当前 key 全为硬编码常量——消费面实读确认）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `windows-env` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/合并策略/门控/PATH 前置 | 已证实 | `:1-193` 全文逐行 |
| 4 个消费方 | 已证实 | 全树检索（§4） |
| key 拼接注入面（当前 key 硬编码故无实际暴露） | 已证实（代码事实） | `:34` + 消费方调用点实读 |
| reg.exe 真实输出格式 | 边界（系统工具） | `:43` 正则 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readRegistryValue`（含 key 拼接面） | §3.1/§10 | 31-48 | covered |
| `getGitForWindowsInstallPath`/`getNodeInstallPathFromRegistry` | §2 | 57-84 | covered |
| `expandEnvVars`/`mergeRegistryPath` | §3.2 | 91-140 | covered |
| `loadWindowsEnv` | §3.3/§5 | 151-193 | covered |
