---
path: apps/electron/resources/entitlements.mac.plist
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0ab10f8f72fe06f797b35dc57d35a551f0214e2b
sha256: 0978f2454d31eb4b3c6104deff61fcc43fca30eaa7c70c432c1895b3e9dc0fc1
lines: 41
kind: config
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/entitlements.mac.plist

## 1. 结论与边界

**macOS 签名 entitlements**（41 行 plist）：9 项授权键全 `<true/>`，每项带中文注释说明用途。

## 2. 导出与关键符号

无导出（配置）。9 键（`:6-39`）：`cs.allow-jit`/`cs.allow-unsigned-executable-memory`/`cs.allow-dyld-environment-variables`/`cs.disable-library-validation`（四项=Electron 需要，注释 `:5-19`）+`network.client`/`network.server`+`device.audio-input`（麦克风）+`files.user-selected.read-write`/`files.downloads.read-write`。

## 3. 内部逻辑与关键流程

不适用（声明式配置）；键语义由注释锁定（JIT/未签名可执行内存/dyld 环境变量/禁库验证=Electron 需求；后五项=网络/音频/文件权限面）。

## 4. 调用者与调用链

- 入向：electron-builder mac 签名（entitlements 配置指向本文件，域外）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无（配置）；影响签名后的应用权限面。

## 6. 分支、失败、取消与恢复

不适用（声明式）。

## 7. 权限与权威状态

应用沙箱权限权威=本 plist（9 键全开；`disable-library-validation` 放开三方库加载，注释 `:17`）。

## 8. 修改影响面

macOS 签名产物的权限/兼容面（Electron 需求四键缺一不可；权限五键影响用户授权提示）。

## 9. 测试证据

`NOT_RUN`。无直接测试（配置）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 键+注释语义 | 已证实 | `:1-41` 全文 |
| 实际签名行为 | 边界 | codesign 域外 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 键 | §2 | 6-39 | covered |
