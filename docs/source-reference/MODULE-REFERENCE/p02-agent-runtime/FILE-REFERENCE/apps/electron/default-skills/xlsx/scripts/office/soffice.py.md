---
path: apps/electron/default-skills/xlsx/scripts/office/soffice.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7f7e3289fdff196399fd6f3d6668b9aa68eec87
sha256: a3e21840e29e32f947d5286028931b96eaf2dee63f75d883b8eb19c943c80aa0
lines: 183
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/soffice.py

## 1. 结论与边界

LibreOffice（soffice）运行辅助（docstring `:1-15`）：在 AF_UNIX socket 被禁的环境（如沙箱 VM）运行时探测限制并按需施加 `LD_PRELOAD` shim。两种用法：`run_soffice(args)` 直跑；`get_soffice_env()` 供自管 subprocess。Skill 工具脚本。

不做的事：不转换文档本身（调 soffice）；不 shim FD≥1024（直通）；不处理非 AF_UNIX socket。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `get_soffice_env` | function | `:24-32` | 环境副本 + `SAL_USE_VCLPLUGIN=svp`；需要时加 `LD_PRELOAD=shim.so` |
| `run_soffice` | function | `:35-37` | `subprocess.run(["soffice"]+args, env=…)` |
| `_SHIM_SO` | const | `:41` | `{tmpdir}/lo_socket_shim.so` |
| `_needs_shim` | function | `:44-50` | 试建 AF_UNIX socket，OSError → 需要 shim |
| `_ensure_shim` | function | `:53-65` | 写 `_SHIM_SOURCE` 到 tmpdir → `gcc -shared -fPIC` 编译 → 删 .c |
| `_SHIM_SOURCE` | const | `:69-176` | C shim 源码（内嵌字符串） |

## 3. 内部逻辑与关键流程

### 3.1 Python 侧

- `get_soffice_env`：`_needs_shim()` 为真才 `LD_PRELOAD`（`:28-30`）。
- `_needs_shim`：`socket(AF_UNIX)` 失败（OSError）→ True（`:44-50`）。
- `_ensure_shim`：已存在 .so 直接复用；否则 gcc 编译（`check=True`，失败抛 CalledProcessError），删除 .c 源（`:53-65`）。

### 3.2 C shim（`:69-176`）

- constructor 经 `dlsym(RTLD_NEXT, …)` 取真 socket/socketpair/listen/accept/close/read（`:93-106`）。
- **socket(AF_UNIX)**：真 socket 失败 → 退 `socketpair` 伪装 listener（sv[0] 记 is_shimmed、peer=sv[1]、pipe 作唤醒通道）；再失败 → `EPERM`（`:109-131`）。
- **listen**：shimmed FD 记 `listener_fd` 直接返回 0（`:134-140`）。
- **accept**：shimmed FD 读唤醒 pipe 阻塞到 close，返回 `ECONNABORTED`（模拟无连接）（`:143-154`）。
- **close**：清记账、唤醒阻塞的 accept；**listener 被关时 `_exit(0)`**（“conversion done”）（`:157-175`）。
- FD≥1024 全部直通不 shim（`:86` 注释）。

CLI（`:180-183`）：`python soffice.py <args…>` → run_soffice 并透传退出码。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`recalc.py`/skill 转换工作流经 `from office.soffice import run_soffice, get_soffice_env`（docstring 用法）。出向：`os/socket/subprocess/tempfile`、外部 `soffice`、**`gcc`（编译 shim）**。

## 5. 数据 I/O、读写与副作用

- 写：tmpdir 的 `lo_socket_shim.c`（删）与 `lo_socket_shim.so`（保留复用）。
- 跑：gcc 子进程、soffice 子进程；`LD_PRELOAD` 注入。
- 无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| AF_UNIX 可用 | `:44-50` | 不加 shim |
| AF_UNIX 被禁 | `:28-30` | 编译/复用 shim + LD_PRELOAD |
| gcc 失败 | `:59-63` | CalledProcessError 抛出（check=True） |
| socketpair 也失败 | `:127-128` | EPERM |
| accept | `:150-151` | ECONNABORTED（阻塞至 close） |
| 取消/恢复 | 无 | 无信号处理（shim 内 `_exit(0)` 为终止语义） |

## 7. 权限与权威状态

无权限分支；`LD_PRELOAD`+运行时 gcc 编译是环境自适应手段（沙箱规避），其安全性依赖本机 gcc/临时目录写权限——照实记录，不背书。

## 8. 修改影响面

改 shim 语义 → 影响 LibreOffice 在沙箱下的启动/退出行为；`_SHIM_SO` 路径变化影响复用。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（环境 shim 脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 探测→按需 shim→sv 插件 | 已证实 | `:24-50` |
| AF_UNIX 退 socketpair + 唤醒 pipe | 已证实 | `:109-175` |
| listener close → _exit(0) | 已证实 | `:171-172` |
| gcc 编译 shim（外部依赖 gcc） | 已证实 | `:59-63` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `get_soffice_env`/`run_soffice` | 3.1 | `:24-37` | covered |
| `_needs_shim`/`_ensure_shim` | 3.1 | `:44-65` | covered |
| C shim 四个拦截 | 3.2 | `:108-175` | covered |
| CLI | 3 | `:180-183` | covered |
