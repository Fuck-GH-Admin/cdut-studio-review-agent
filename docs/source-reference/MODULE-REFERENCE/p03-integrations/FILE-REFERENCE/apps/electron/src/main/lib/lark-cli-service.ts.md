---
path: apps/electron/src/main/lib/lark-cli-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ff2cb9c92572bb2f9958756c081d1ef7943db314
sha256: 97ad05aa3501fc574d0beadf66b14343f97896c8420a20ba0a2df64c0a690bbd
lines: 193
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/lark-cli-service.ts

## 1. 结论与边界

官方 Lark CLI 安全包装（文件头 `apps/electron/src/main/lib/lark-cli-service.ts:1`）：**OAuth 凭据留在 CLI 存储**，本服务只做检测/安装/登录流/状态解析/脱敏诊断。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 11 个函数 = 12 个导出（类/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LarkCliCommandRunner` | 接口（导出） | 15-18 | 可注入 exec/spawn |
| `__setLarkCliCommandRunner`/`__setLarkLoginEventHandler`/`__resetLarkCliTestState` | 函数（导出） | 55-57 | 测试注入/重置 |
| `redactLarkOutput` | 函数（导出） | 119 | `(token\|secret\|authorization\|cookie\|password)[=:]…`→`$1=[REDACTED]` |
| `parseLarkAuthStatus` | 函数（导出） | 121-144 | JSON 主路径（多来源 loggedIn/requiresAuth 判定 `:131-132`）+文本兜底正则（脱敏后匹配） |
| `detectLarkCli` | 函数（导出） | 152-156 | node/npm/npx/lark-cli 并行探测+auth 状态 |
| `installLarkCli` | 函数（导出） | 158-171 | **npm --global**（不用 npx install——注释自述后者不可靠，`:162-163`）；失败脱敏截 300 |
| `startLarkLogin` | 函数（导出） | 174-188 | spawn `auth login --recommend`；URL 事件推送（`:182`）；单例防重入（`:175`）；10min 超时 |
| `cancelLarkLogin`/`getLarkDiagnostics`/`disposeLarkCliService` | 函数（导出） | 191-193 | 取消 kill；诊断快照；清理 |
| `defaultRunner`/`findCommand`/`inspectCommand`/`getCommandEnv` 等 | 内部 | 20-150 | win32 `.cmd/.bat/.ps1` 用 basename+shell（注释：Node Windows shell 处理对含空格绝对路径有 bug，`:27-29`）；mac 工具目录 fallback（homebrew/mise/npm-global/bun）+`npm prefix --global` 解析（`:93-104`） |

## 3. 内部逻辑与关键流程

- 命令查找（`:82-107`）：`where.exe`/`which` → mac fallback 目录 → darwin+lark-cli 时 `npm prefix --global` 推导（GUI PATH 不全的补偿，`:88,93-94`）。
- 登录流（`:174-188`）：单例 `loginProcess`；stdout/stderr 累积匹配 URL→`{type:'url'}` 事件；close 0→completed 否则 failed；10min 超时取消；错误消息脱敏截断。
- 状态解析（`:121-144`）：JSON 多形态（`loggedIn/logged_in/authenticated/available/status ready`）；`requiresAuth`（token expired/missing/reauthorization_required）或 exitCode≠0 → `reauthorization_required`；JSON 坏→脱敏文本正则兜底。

## 4. 调用者与调用链

入向：Lark 集成 IPC（检测/安装/登录/诊断）；测试：`lark-cli-service.test.ts`（89 行，本批）。出向：`node:child_process/fs/os/path/util`、`@profer/shared`（类型）。

## 5. 数据 I/O、读写与副作用

子进程：`where/which`、`--version`、`auth status`、`npm install --global`（5min）、`auth login`（10min 流式）；副作用：模块级 runner/login 状态单例、事件回调、kill。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 命令找不到 | fallback/npm prefix/null | 82-107 |
| npm 缺 | `npm unavailable; install Node.js first` | 160 |
| 安装失败 | 脱敏截 300 | 166-170 |
| 登录重入 | `Login flow already running` | 175 |
| 登录超时 | 取消+failed 事件 | 186 |
| JSON 坏 | 文本正则兜底 | 137-143 |

## 7. 权限与权威状态

- 凭据权威=CLI 自身存储（`:1`）；本服务零凭据持久化。
- 输出脱敏（`SECRET_PATTERN`）防 token 泄漏到日志/UI。

## 8. 修改影响面

改探测/登录流影响 Lark 集成可用性；改脱敏影响安全。

## 9. 测试证据

直接测试：`lark-cli-service.test.ts`（89 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 凭据留 CLI 存储 | 已证实 | `:1` |
| 脱敏 | 已证实 | `:13,119` |
| npx install 不可靠注释 | 已证实 | `:162-163` |
| win32 路径 bug 注释 | 已证实 | `:27-29` |
| 真实 Lark CLI | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 查找/探测族 | §2,§3 | 20-156 | covered |
| 安装/登录流 | §3 | 158-193 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
