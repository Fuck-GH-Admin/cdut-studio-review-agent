---
path: apps/electron/default-skills/docx/scripts/office/soffice.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7f7e3289fdff196399fd6f3d6668b9aa68eec87
sha256: a3e21840e29e32f947d5286028931b96eaf2dee63f75d883b8eb19c943c80aa0
lines: 183
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/soffice.py

## 1. 结论与边界

LibreOffice 运行**沙箱适配助手**（`apps/electron/default-skills/docx/scripts/office/soffice.py:1-15`）：在 AF_UNIX socket 被禁（沙箱 VM）的环境检测限制并按需注入 `LD_PRELOAD` C shim，使 `soffice` 仍可运行。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `get_soffice_env` | 函数 | `:24-32` | `() => dict` | 复制环境 + `SAL_USE_VCLPLUGIN=svp`，必要时 `LD_PRELOAD` |
| `run_soffice` | 函数 | `:35-37` | `(args, **kwargs) => CompletedProcess` | `soffice` + args |

内部：`_SHIM_SO`（`/tmp/lo_socket_shim.so`，`:41`）、`_needs_shim`（`:44-50`）、`_ensure_shim`（`:53-65`，gcc 编译 shim）、`_SHIM_SOURCE`（C 源，`:69-176`）。CLI（`:180-183`）。

## 3. 内部逻辑与关键流程

- **检测**（`:44-50`）：试 `socket(AF_UNIX)`，异常即需 shim。
- **编译**（`:53-65`）：`/tmp/lo_socket_shim.c` 写入源码，`gcc -shared -fPIC … -ldl` 产出 `.so`（`check=True`），删源文件。
- **shim 行为**（C 源）：`socket(AF_UNIX)` 被拒时回退 `socketpair` 并记账（FD<1024）；`listen` 记 listener；`accept` 在 shim FD 上阻塞至 `close` 写唤醒管道后返回 `ECONNABORTED`；`close` 清账，**listener 被 close 时 `_exit(0)`**（转换完成即退出，`:171-172`）。

## 4. 调用者与调用链

- 消费方：`accept_changes.py`（`get_soffice_env`，`:12`）及 skill 编排。
- 出向：`os/socket/subprocess/tempfile`；外部 `gcc`、`soffice`。

## 5. 数据 I/O、读写与副作用

- **进程**：`subprocess.run`（gcc 编译、soffice）。
- **写**：`/tmp/lo_socket_shim.{c,so}`（`:57-64`）。
- **运行时注入**：`LD_PRELOAD`（仅 shim FD 行为，其余透传）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| AF_UNIX 可用 | `:46-48` | 不注入 shim |
| AF_UNIX 被禁 | `:49-50` | 编译并注入 |
| shim 已存在 | `:54-55` | 复用 |
| gcc 失败 | `:59-63` | `check=True` 抛出（get_soffice_env 失败） |

## 7. 权限与权威状态

无身份校验；gcc 编译需本地工具链。shim 只拦 AF_UNIX socket 一族调用。

## 8. 修改影响面

- `_SHIM_SOURCE` 与 Linux/gcc/dlsym 行为耦合；FD 上限 1024 硬编码（`is_shimmed[1024]`，`:86-87`）。
- `/tmp` 固定路径并发/权限问题。

## 9. 测试证据

无专属测试（全树检索 `soffice` 测试命中 0）。**NOT_RUN**：未运行 gcc/soffice/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、检测/编译/注入流程 | 已证实 | `:24-65` |
| shim 的 socket/listen/accept/close 记账与 `_exit(0)` | 已证实（C 源） | `:108-175` |
| 沙箱环境实际效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `get_soffice_env`/`run_soffice` | `:24-37` | covered |
| 检测/编译 | `:41-65` | covered |
| C shim | `:69-176` | covered |
| CLI | `:180-183` | covered |
