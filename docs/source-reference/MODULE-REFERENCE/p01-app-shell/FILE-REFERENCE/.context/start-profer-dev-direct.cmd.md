---
path: .context/start-profer-dev-direct.cmd
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c83922b0a3ae8b15af10f5367c1de025dfe3b097
sha256: ecce35fd2554a68b94f954f816c8024e140ad26f072004880c06ae7034b0e95e
lines: 12
kind: script
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .context/start-profer-dev-direct.cmd

## 1. 结论与边界

Windows 批处理启动脚本（12 行）：直连版一键拉起本机 Electron 开发环境——先后台起 Vite dev server，再顺序构建 `build:main`/`build:preload`/`build:resources`，最后后台启动 `electron.exe`。全部路径硬编码为作者开发机（`D:\profer\Proma-main`、`C:\Users\yuan\.bun\bin\bun.exe`），不属于产品构建/发布/CI 链路。本轮 `NOT_RUN`（纯静态阅读，未执行任何脚本）。

## 2. 导出与关键符号

无导出、无入口参数（`.context/start-profer-dev-direct.cmd:1-2` 仅 `@echo off`/`setlocal`）。关键符号：工作目录 `D:\profer\Proma-main\apps\electron`（`.context/start-profer-dev-direct.cmd:3`）；bun 可执行 `C:\Users\yuan\.bun\bin\bun.exe`（`.context/start-profer-dev-direct.cmd:4`、`:6`、`:8`、`:10`）；日志文件 `profer-dev-vite.log`（`:4`）、`profer-dev-build.log`（`:6`）、`profer-dev-electron.log`（`:12`）；窗口标题 `"Profer Vite"`（`:4`）、`"Profer Electron Dev"`（`:12`）。

## 3. 内部逻辑与关键流程

顺序执行（`.context/start-profer-dev-direct.cmd:1-12`）：关回显+局部环境（`:1-2`）→ 切到 `apps\electron`（`:3`）→ `start /b bun.exe x vite dev` 后台起 Vite，stdout+stderr 重定向 `..\..\.context\profer-dev-vite.log`（`:4`）→ `timeout /t 3` 固定等 3 秒（`:5`）→ `bun.exe run build:main`（`:6`）→ `build:preload`（`:8`）→ `build:resources`（`:10`），构建输出写/追加 `..\..\.context\profer-dev-build.log` → 每步后 `if errorlevel 1 exit /b 1`（`:7`、`:9`、`:11`）→ `start /b electron.exe .` 后台启动 Electron，日志 `profer-dev-electron.log`（`:12`）。`build:main`/`build:preload`/`build:resources` 对应 `apps/electron/package.json:17`、`apps/electron/package.json:20`、`apps/electron/package.json:28`。

## 4. 调用者与调用链

- 入向：冻结树全文检索（含 `.context`/`.github` 隐藏目录）`start-profer-dev-direct` 无任何引用，仅由开发者手工执行；`.context/` 目录为开发者上下文目录（与 `handoff.md`、`todo.md` 同级）。
- 出向：`bun.exe`（x vite dev、run build:*）、`D:\profer\Proma-main\node_modules\electron\dist\electron.exe`（`.context/start-profer-dev-direct.cmd:12`）→ `apps/electron/package.json:17`/`:20`/`:28` 三个 npm 脚本。不调用 GitHub Actions，也不被其调用。

## 5. 数据 I/O、读写与副作用

读：经 bun/esbuild 读取 `apps/electron` 源码。写：`..\..\.context\profer-dev-vite.log`（`:4` 覆盖写+`2>&1`）、`..\..\.context\profer-dev-build.log`（`:6` 覆盖写，`:8`/`:10` `>>` 追加）、`..\..\.context\profer-dev-electron.log`（`:12`）。副作用：拉起两个后台进程（Vite、Electron），脚本不负责清理。

## 6. 分支、失败、取消与恢复

三步构建任一非零退出即 `exit /b 1` 终止（`.context/start-profer-dev-direct.cmd:7`、`:9`、`:11`），后续步骤不执行。`start /b` 拉起的 Vite/Electron 无失败检查。无取消/恢复机制；`setlocal`（`:2`）保证环境改动不外泄。

## 7. 权限与权威状态

无 secrets/权限模型（本机 cmd）。硬编码的本机路径 `C:\Users\yuan\.bun\bin\bun.exe`（`:4`）与 `D:\profer\Proma-main`（`:3`、`:12`）是环境特定权威事实，脱离该机器即不可用。

## 8. 修改影响面

仅开发者本机启动体验；不影响 CI/发布。改动日志文件名或 bun 路径无自动消费者受影响（检索无引用）。

## 9. 测试证据

`NOT_RUN`。无直接测试，依据：冻结树 `start-profer-dev-direct` 检索仅命中脚本自身，`*.test.*` 检索 `workflows/`/`.cmd` 无引用。间接：`build:main`/`build:preload`/`build:renderer` 同类构建步骤在 `.github/workflows/ci.yml:56-59` 的 CI 中另行执行（间接证据，非本脚本覆盖）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 命令序列/日志路径/退出码语义 | 已证实 | `.context/start-profer-dev-direct.cmd:1-12` 全文 |
| 三条构建命令映射 npm 脚本 | 已证实 | `apps/electron/package.json:17`、`:20`、`:28` |
| 实际运行效果/本机可运行性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 1-12 | covered |
| 入向引用 | §4 | - | covered（检索无引用） |
| 运行验证 | §9 | - | unknown |
