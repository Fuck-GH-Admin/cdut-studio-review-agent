---
path: apps/electron/resources/cslab/cslab-tool-runner.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b72ede3a283619344e6980e968a3272f6fc8d801
sha256: 7708e8ed82b7ded430879e7697c9c55bfdc305d75e58021e5623e7bd5d584177
lines: 59
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-tool-runner.py

## 1. 结论与边界

**CSLab 用户 Python 工具执行器**（59 行，`cslab-tool-runner.py:1-5`）：按文件+函数名+JSON 参数执行用户工具；输出单行 JSON `{"ok":true,"result"}` 或 `{"ok":false,"error"}`（错误含完整堆栈交还宿主，`:49` 注释）。

## 2. 导出与关键符号

无导出（CLI 脚本）；参数 `--file/--function/--args`（args=JSON 文件路径，`:17-22`）。

## 3. 内部逻辑与关键流程

（`:25-55`）：读参数文件须为 JSON 对象（`:28-31`）→`importlib` 加载目标模块（**sys.path 插入目标目录允许同目录互相 import**，`:36-37`）→函数存在且可调用检查（`:41-43`）→`function(**payload)`→成功/失败均 stdout 单行 JSON（`ensure_ascii=False, default=str` `:47`）。

## 4. 调用者与调用链

- 入向：CSLab 主进程工具执行链（域外）。
- 出向：importlib/json/sys（stdlib）。

## 5. 数据 I/O、读写与副作用

读参数 JSON+执行用户代码（用户脚本自身副作用面由用户提供）；stdout 单行 JSON。

## 6. 分支、失败、取消与恢复

全异常捕获→`{"ok":false,error+traceback}`（`:49-55`）；无回滚。

## 7. 权限与权威状态

执行信任边界=宿主把关（本脚本不设沙箱，照实记录）；输出协议权威=单行 JSON 契约。

## 8. 修改影响面

CSLab 用户工具执行链的输出协议与堆栈回传；`sys.path` 注入语义影响同目录工具互 import。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 参数校验/importlib 加载/双态输出 | 已证实 | `:1-59` 全文 |
| 用户代码执行副作用 | 边界 | 用户域 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 17-55 | covered |
