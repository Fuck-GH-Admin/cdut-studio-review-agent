---
path: apps/electron/src/main/lib/shell-env.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d6a12285bcbae15da5e77dcbf5a3ee650baad7c8
sha256: 9f89419a1be9b32b4609dccf9b6705e98687248e67d7d80a9856f0906ea8346d
lines: 266
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/shell-env.ts

## 1. 结论与边界

macOS Shell 环境变量加载（文件头 `apps/electron/src/main/lib/shell-env.ts:1-13`）：Finder/Dock 启动的 GUI 只继承最小 launchd 环境（PATH 仅 /usr/bin:/bin:…），缺 Homebrew/Git/Node/nvm 等；方案=启动时运行用户登录 Shell 提取完整环境。Windows 走注册表（`loadWindowsEnv`）；开发模式跳过（终端已有完整环境，`:228-235`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个函数 = 4 个导出（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getUserShell` | 函数（导出） | 24-26 | `SHELL` env 或 `/bin/zsh` |
| `buildShellEnvInvocation` | 函数（导出） | 85-91 | `['-l','-c',"printf marker && env"]`，marker=`__PROMA_ENV_START__`；非交互 login shell 避免 zle/bindkey GUI 报错（`:82-84`） |
| `getShellEnv` | 函数（导出） | 99-136 | `execFileSync` 提取+解析 |
| `loadShellEnv` | 函数（导出） | 213-266 | 平台分派+合并+fallback |
| `EXCLUDED_ENV_VARS` | 内部 | 32-47 | ELECTRON_*/VITE_DEV_SERVER_URL/SHLVL/PWD/OLDPWD/_/TERM_* |
| `parseEnvOutput`/`mergeEnvToProcess`/`FALLBACK_PATHS`/`applyFallbackPaths` | 内部 | 52-202 | 解析（跳过排除/`VITE_`/`npm_`/`BUN_` 前缀）；合并（仅空缺设值+PATH 前置去重合并）；失败 fallback（含 `*` 通配剔除） |

## 3. 内部逻辑与关键流程

`getShellEnv`（`:99-136`）：`execFileSync(shell,args,{timeout:10_000,env:{HOME,USER,SHELL,TERM:'xterm-256color',APPLE_SUPPRESS_DEVELOPER_TOOL_POPUP:'1',GIT_TERMINAL_PROMPT:'0'}})`——最小初始环境+抑制 Xcode 弹窗（`:109-118`）；参数数组调用防二次 shell 解析（`:103`）；失败抛 `执行 login shell 失败(exit N): stderr`（`:121-126`）；marker 定位失败抛 `无法找到环境变量输出标记`（`:130-132`）；只解析 marker 之后内容。

`mergeEnvToProcess`（`:144-168`）：仅当 `process.env[key]` 为空才设（保留 Electron 自设变量）；PATH 特殊合并——新路径前置（优先级高）、去重（`:156-165`）。

`loadShellEnv`（`:213-266`）：win32→`loadWindowsEnv()`；非 darwin→空成功；非打包→空成功；否则 `getShellEnv`+`mergeEnvToProcess`；失败→`applyFallbackPaths`（homebrew/usr-local/.local/.bun/.cargo 前置合并）+返回 `{success:false,error}`。

## 4. 调用者与调用链

入向：应用启动环境装配（`loadShellEnv`）；测试：`shell-env.test.ts`（23 行，本批）。出向：`node:child_process`、`electron.app`、`@profer/shared`（`ShellEnvResult`）、`./windows-env.ts:18`。

## 5. 数据 I/O、读写与副作用

子进程：登录 shell `env` 提取（10s 超时）。副作用：改写 `process.env`（空缺变量+PATH 合并）、`console.log/warn`。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| win32 | 注册表方案 | 215-217 |
| 非 darwin/开发模式 | 空成功（loadedCount 0） | 220-235 |
| shell 执行失败 | fallback 路径+`success:false` | 252-264 |
| 无 marker | 抛错→fallback | 130-132 |

无取消概念；恢复=fallback PATH。

## 7. 权限与权威状态

环境来源权威=用户登录 shell（提取而非猜测）；合并策略保 Electron 自设变量（`:148-153`）。

## 8. 修改影响面

改提取/合并影响工具发现（Bash/Git/Node 可用性）；影响 `shell-env.test.ts` 与 shell-snapshot 消费方。

## 9. 测试证据

直接测试：`shell-env.test.ts`（23 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 非交互 login shell+marker | 已证实 | `:82-91,99-135` |
| 排除/前缀过滤 | 已证实 | `:32-78` |
| PATH 前置合并 | 已证实 | `:156-165` |
| 三平台分派+fallback | 已证实 | `:213-266` |
| 真实 shell 行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| shell 探测 | §3 | 85-136 | covered |
| 解析/合并 | §3 | 52-168 | covered |
| 分派/fallback | §3 | 174-266 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
