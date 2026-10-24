---
path: apps/electron/scripts/verify-packaged-pi-runtime.ps1
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7de5d2d43a96faea5f0ef39e97d653122db4cc4c
sha256: 40d68b60a1237bd24126b8f5164f15d5fadecbb22092801686df71cb688471c7
lines: 54
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-packaged-pi-runtime.ps1

## 1. 结论与边界

**Windows packaged Pi runtime 闭包离线验证**（54 行）：用安装包自身 Electron（`ELECTRON_RUN_AS_NODE=1`）跑 `packaged-pi-probe.cjs`。注释锁定两点：GUI 子系统程序须 **Start-Process+Wait-Process**（直接调用不等，`:2`）；GUI 进程 ExitCode 可能不回填→用探针 JSON+空 stderr 兜底门禁（`:31-32`）。

## 2. 导出与关键符号

无导出（PowerShell 脚本）。输入三件（`:5-7`）：`out/win-unpacked/CDUT Studio.exe`、`scripts/packaged-pi-probe.cjs`、`out/win-unpacked/resources`。

## 3. 内部逻辑与关键流程

（`:9-54`）：输入存在检查（`:9-13`）→清旧日志/置 ELECTRON_RUN_AS_NODE（`:15-19`）→Start-Process 重定向 stdout/stderr+120s 超时（超时 Stop-Process+throw，`:26-30`）→门禁四段（`:33-49`）：ExitCode 非 0 抛（可用时）/stderr 非空抛/输出须合法 JSON/`ok===true`→finally 恢复 env（`:52-53`）。

## 4. 调用者与调用链

- 入向：Windows 发布流程（verify:packaged-pi-runtime npm script，域外）。
- 出向：packaged-pi-probe.cjs（域外）、CDUT Studio.exe（Electron as Node）。

## 5. 数据 I/O、读写与副作用

写 out/ 两日志文件；起 Electron 子进程。

## 6. 分支、失败、取消与恢复

四段门禁+超时杀进程（§3）；env finally 恢复。

## 7. 权限与权威状态

Pi 闭包完整性权威=探针 JSON ok（用包自身 ABI 验证，声明不依赖已移除的 Claude SDK CLI——macos-package `:58` 同语义）。

## 8. 修改影响面

Windows 发布 Pi 闭包门禁；GUI 进程等待语义与门禁口径（JSON+stderr 兜底）。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本；win-only）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| GUI 等待/四段门禁/env 恢复 | 已证实 | `:1-54` 全文 |
| 运行验证 | 未知 | NOT_RUN（无 Windows） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 3-54 | covered |
