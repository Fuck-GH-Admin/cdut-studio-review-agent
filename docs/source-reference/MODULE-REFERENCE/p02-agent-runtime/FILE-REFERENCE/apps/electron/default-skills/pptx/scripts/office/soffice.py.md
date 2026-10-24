---
path: apps/electron/default-skills/pptx/scripts/office/soffice.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7f7e3289fdff196399fd6f3d6668b9aa68eec87
sha256: a3e21840e29e32f947d5286028931b96eaf2dee63f75d883b8eb19c943c80aa0
lines: 183
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/soffice.py

## 1. 结论与边界

**LibreOffice (soffice) 运行助手**：在 AF_UNIX socket 受限环境（沙箱 VM）自动检测并注入 LD_PRELOAD shim（`soffice.py:1-15`）。副作用=写 /tmp shim 源与 .so、运行 gcc 编译、起子进程。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `get_soffice_env` | 函数 | `:24` | env 副本 + `SAL_USE_VCLPLUGIN=svp`；需 shim 时加 `LD_PRELOAD` |
| `run_soffice` | 函数 | `:35` | `subprocess.run(["soffice"]+args, env=…)` |
| `_needs_shim` | 内部 | `:44` | AF_UNIX socket 探测（OSError→True） |
| `_ensure_shim` | 内部 | `:53` | gcc 编译 `_SHIM_SOURCE`→`/tmp/lo_socket_shim.so`（已存在即复用） |
| `_SHIM_SOURCE` | 常量 | `:69` | 内嵌 C shim（~108 行） |
| CLI | `:180-183` | | `python soffice.py <args…>` 转发并透传 returncode |

## 3. 内部逻辑与关键流程

C shim 语义（`:69-176`）：拦截 `socket(AF_UNIX)`——被内核拒绝时回退 `socketpair()` 假造 listener/accept（`accept` 阻塞读 wake pipe 后返 `ECONNABORTED`，`:143-154`）；`close()` 唤醒对端并清理记账（FD≥1024 直通，`:86`）；**listener close 即 `_exit(0)`**（转换完成即退，`:171-172`）。探测链：`_needs_shim`（`:44-50`）→ `_ensure_shim` 写 `lo_socket_shim.c`→`gcc -shared -fPIC … -ldl`（check=True）→删 .c（`:57-64`）。

## 4. 调用者与调用链

- 入向：pptx/docx 转换链（如 pdf 导出，域外 grep：技能脚本引用 `office.soffice`）。
- 出向：gcc/soffice 外部程序；tempfile 目录。

## 5. 数据 I/O、读写与副作用

写 `/tmp/lo_socket_shim.c`/`.so`（模块级常量路径 `:41,57`）；gcc 编译；soffice 子进程。

## 6. 分支、失败、取消与恢复

AF_UNIX 可用→无 shim；不可用→编译注入；gcc 失败→check=True 抛；CLI 透传 exit code。

## 7. 权限与权威状态

无权限分支，依据：本机工具链调用；LD_PRELOAD 注入为兼容手段（注释 `:2-4`）。

## 8. 修改影响面

受限沙箱下的 LibreOffice 可用性；shim 行为（accept 模拟/退出时机）影响 soffice 生命周期。

## 9. 测试证据

`NOT_RUN`。无直接测试；C shim 与 gcc 行为静态不可验证（NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 探测/编译/注入流程与 shim 逻辑 | 已证实 | `:1-183` 全文 |
| shim 在真实沙箱的效果 | 未知 | 需受限内核环境验证，NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+3 内部+C shim+CLI | §2/§3 | 24-183 | covered |
