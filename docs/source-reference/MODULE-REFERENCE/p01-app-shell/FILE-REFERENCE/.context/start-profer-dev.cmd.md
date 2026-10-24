---
path: .context/start-profer-dev.cmd
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe47b9ecd18f3b97e0d452d6ade0b01a3edaa317
sha256: 489c652b2ec97b80a577062611272d35b051e5fb70dc301e7c8d2cd0eff1d1ef
lines: 6
kind: script
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .context/start-profer-dev.cmd

## 1. 结论与边界

Windows 批处理启动脚本（6 行）：简版一键启动——显式重置 `PATH`/`ComSpec` 后进入仓库根 `D:\profer\Proma-main`，前台执行 `bun run dev` 并把 stdout/stderr 分别落到 `.context` 下两个日志文件。硬编码作者开发机路径，不属于产品构建/发布/CI 链路。本轮 `NOT_RUN`（纯静态阅读，未执行任何脚本）。

## 2. 导出与关键符号

无导出、无入口参数（`.context/start-profer-dev.cmd:1-2` 仅 `@echo off`/`setlocal`）。关键符号：`PATH`（`.context/start-profer-dev.cmd:3`，追加 `C:\Users\yuan\.bun\bin`、`C:\Program Files\nodejs`、`D:\profer\Proma-main\node_modules\.bin`）、`ComSpec`（`:4`，固定 `C:\Windows\System32\cmd.exe`）、日志 `profer-dev-knowledge-selection.log` 与 `profer-dev-knowledge-selection-error.log`（`:6`）。

## 3. 内部逻辑与关键流程

顺序执行（`.context/start-profer-dev.cmd:1-6`）：关回显+局部环境（`:1-2`）→ 重建 `PATH`（保留原值尾接 `%PATH%`，`:3`）→ 设 `ComSpec`（`:4`）→ `cd /d D:\profer\Proma-main`（`:5`）→ `C:\Users\yuan\.bun\bin\bun.exe run dev`，stdout 重定向 `.context\profer-dev-knowledge-selection.log`、stderr 重定向 `.context\profer-dev-knowledge-selection-error.log`（`:6`）。`bun run dev` 解析链：根 `package.json:15`（`dev: bun run --filter='@profer/electron' dev`）→ `apps/electron/package.json:10`（`dev-kill` + `concurrently -k` 并跑 vite 与 electron）。

## 4. 调用者与调用链

- 入向：冻结树全文检索（含 `.context`/`.github`）`start-profer-dev` 无引用，仅开发者手工执行；与 `.context/start-profer-dev-direct.cmd` 互不调用（两者是并列变体）。
- 出向：`bun.exe run dev`（`.context/start-profer-dev.cmd:6`）→ `package.json:15` → `apps/electron/package.json:10`；写日志到 `.context\`。不涉及 GitHub Actions。

## 5. 数据 I/O、读写与副作用

读：根 `package.json` 的 `dev` 脚本定义。写：`.context\profer-dev-knowledge-selection.log`（`:6`，`>` 覆盖）、`.context\profer-dev-knowledge-selection-error.log`（`:6`，`2>` 覆盖）。副作用：经 `apps/electron/package.json:10` 的 `concurrently -k` 拉起 Vite+Electron 双进程，直至 dev 会话结束。

## 6. 分支、失败、取消与恢复

无 `if errorlevel` 检查：`bun run dev` 的失败只体现为退出码与 `-error.log` 内容，脚本不拦截、不恢复（`.context/start-profer-dev.cmd:6`）。`setlocal`（`:2`）保证 `PATH`/`ComSpec` 改动不泄漏到父 shell。无取消机制。

## 7. 权限与权威状态

无 secrets/权限模型（本机 cmd）。`PATH`/`ComSpec` 硬编码（`:3`、`:4`）为本机环境权威事实；bun/node 版本完全由 `PATH` 决定，脚本本身不固定版本。

## 8. 修改影响面

仅开发者本机启动体验；不影响 CI/发布。日志名 `profer-dev-knowledge-selection*`（`:6`）无自动消费者（检索无引用）。

## 9. 测试证据

`NOT_RUN`。无直接测试，依据：冻结树 `start-profer-dev`/`profer-dev-knowledge-selection` 检索无任何测试或脚本引用（`*.test.*` 命中为零）。间接：其调用的 `dev` 脚本链（`package.json:15`、`apps/electron/package.json:10`）为开发期入口，不被 CI 调用（`.github/workflows/ci.yml` 无 `dev` 步骤）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| PATH/ComSpec 重置、日志重定向、前台 `bun run dev` | 已证实 | `.context/start-profer-dev.cmd:1-6` 全文 |
| `dev` 脚本解析链 | 已证实 | `package.json:15`、`apps/electron/package.json:10` |
| 实际运行效果/本机可运行性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 1-6 | covered |
| 入向引用 | §4 | - | covered（检索无引用） |
| 运行验证 | §9 | - | unknown |
