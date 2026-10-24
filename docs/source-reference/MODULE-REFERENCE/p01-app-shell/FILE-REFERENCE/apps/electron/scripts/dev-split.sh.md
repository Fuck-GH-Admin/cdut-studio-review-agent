---
path: apps/electron/scripts/dev-split.sh
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f331ff3c4874fb55ec872e3157874249c2cd8f03
sha256: 7d4226e4612fc77c74020f9a43caac826afd76b7210d5765a43337e3001dd061
lines: 89
kind: script
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/dev-split.sh

## 1. 结论与边界

分屏开发启动脚本（89 行，`#!/usr/bin/env bash`，`set -e`）：左 pane 跑 `bun run dev:vite`、右 pane 跑 `bun run dev:electron`，按环境四选一——已在 tmux / 可装 tmux / macOS（iTerm2 或 Terminal.app）/ 不支持（`apps/electron/scripts/dev-split.sh:1-4`）。边界：只负责「开两个终端跑两条既有 npm 脚本」，不做清理（dev-kill 职责）、不管理进程生命周期；tmux 会话名固定 `proma-dev`（`:25`）。

## 2. 导出与关键符号

无导出（shell 脚本）。参数：无位置参数；环境变量 `$TMUX`（判定已在 tmux，`:7`）、`$OSTYPE`（darwin 判定，`:36`）、`$TERM_PROGRAM`（iTerm.app 判定，`:40`）、`$PWD`（经 `$(pwd)` 注入各 pane 命令）。无函数定义（全顶层分支）。

## 3. 内部逻辑与关键流程

1. 分支 A——已在 tmux（`:7-19`）：`tmux split-window -h` 垂直分屏；`select-pane -L` + `send-keys "cd $(pwd) && bun run dev:vite" C-m`；`select-pane -R` + `send-keys … dev:electron` C-m。
2. 分支 B——有 tmux 未在会话（`:21-34`）：`tmux new-session -d -s proma-dev "cd $(pwd) && bun run dev:vite"`；`tmux split-window -h -t proma-dev "cd $(pwd) && bun run dev:electron"`；`select-pane -t proma-dev:0.0` 回左 pane；`attach-session -t proma-dev`（前台接管）。
3. 分支 C——macOS（`:36-81`）：
   - iTerm2（`:40-59`）：osascript heredoc `split vertically with default profile`，新 pane（右）写 `dev:electron`，当前 pane（左）写 `dev:vite`（`:51-55`）。
   - Terminal.app（`:60-80`）：osascript + System Events `keystroke "t" using command down` 开两个标签页，delay 0.5 后分别 `do script … dev:vite` / `… dev:electron`。
4. 分支 D——兜底（`:83-88`）：打印「不支持的平台或未安装 tmux」+ 手动指引（终端 1 dev:vite / 终端 2 dev:electron）→ `exit 1`。
5. `set -e`（`:4`）：任一命令非 0 即中断脚本。返回值：成功 0（分支 A/B/C 末命令），兜底 1。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:11`（`"dev:split": "bash scripts/dev-split.sh"`）。全树 grep（工具：ripgrep，pattern `dev-split`）仅命中该 package.json 行与本文件自身，无 CI/测试引用。
- 出向：外部命令 `tmux`（split-window/select-pane/send-keys/new-session/attach-session）、`osascript`（AppleScript/System Events）；启动的 npm 脚本 `dev:vite`（`apps/electron/package.json:14`，内含 build:ooxml+vite dev）与 `dev:electron`（`:16`，内含 dev:kill+build+watch+electron）。

## 5. 数据 I/O、读写与副作用

- 读：环境变量（TMUX/OSTYPE/TERM_PROGRAM/PWD）。
- 写：无磁盘写；副作用全在进程/窗口层——创建 tmux 窗格/会话、激活 iTerm2/Terminal、模拟按键（System Events，需 macOS 辅助功能权限）。
- 幂等/锁：非幂等（每次运行都新开 pane/标签）；无锁。网络/缓存/全局状态：无。

## 6. 分支、失败、取消与恢复

- 四分支互斥（if/elif/elif/else，`:7/21/36/83`）；短路顺序：TMUX 存在 > tmux 可执行 > darwin > 兜底。
- 失败：`set -e` 下 tmux/osascript 任一命令失败即整体退出（退出码=失败命令的码）；AppleScript 层失败（如无辅助功能授权）由 osascript 报错触发同样中断。
- 用户可见文案：「已在 tmux 中，创建左右分屏...」「启动 tmux 会话...」「在 macOS 上打开左右分屏...」「不支持的平台或未安装 tmux」+ 手动指引（`:84-87`）。
- 失败后状态：可能残留已开 pane/会话（无回滚）；恢复=手动关 pane 或 `tmux kill-session -t proma-dev`。取消：无 trap，Ctrl-C 后台 pane 中的 dev 进程不受影响。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。间接权限依赖：macOS Terminal/iTerm 路径需要系统「辅助功能」授权才能 System Events 模拟按键（代码事实：`:67-78` 使用 keystroke，授权状态运行时才知道）。

## 8. 修改影响面

- `apps/electron/package.json:11`（dev:split）→ 本地开发体验入口。
- 依赖的两条 npm 脚本（`:14, :16`）语义变更会改变本脚本拉起的行为；`proma-dev` 会话名硬编码（`:25, :28, :31, :34`）。
- 无 CI/打包接线（§4 否定结论），不影响构建产物。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无测试（全树 grep `dev-split` 于 *.test.ts 零命中）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四分支结构、pane 命令、兜底 exit 1 | 已证实 | `apps/electron/scripts/dev-split.sh:1-89` 全文 |
| 唯一调用点 package.json:11 | 已证实 | grep `dev-split` 全树命中清单 |
| AppleScript 在无辅助功能授权下的失败形态 | 未知 | 需实机，NOT_RUN |
| tmux send-keys 时序是否总能在 dev:vite 前就绪 | 推断 | send-keys C-m 即发命令（`:15,19`），无等待逻辑 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| set -e / shebang | §1/§6 | 1-4 | covered |
| 分支 A 已在 tmux | §3 | 7-19 | covered |
| 分支 B 新建 tmux 会话 | §3 | 21-34 | covered |
| 分支 C-iTerm2 osascript | §3 | 40-59 | covered |
| 分支 C-Terminal.app 两标签 | §3 | 60-80 | covered |
| 分支 D 兜底 exit 1 | §3/§6 | 83-88 | covered |
