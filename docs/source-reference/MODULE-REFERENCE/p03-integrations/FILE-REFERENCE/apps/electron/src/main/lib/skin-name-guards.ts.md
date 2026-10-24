---
path: apps/electron/src/main/lib/skin-name-guards.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 55c94fa22da77294822e49ab6b2fd4f9703f4ca7
sha256: d46a22b0f542aeb42d9da4bc15531b3ef02cca0747c7e7c9c50469b12b7bf556
lines: 20
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-name-guards.ts

## 1. 结论与边界

**皮肤包命名的跨平台守卫**（`skin-name-guards.ts:1-5` 注释）：独立为**无 Electron 依赖的纯模块**，安装服务/Agent 皮肤工具/单测共用同一判断（避免正则双写漂移 `:4`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isWindowsReservedName` | function（export） | `:18-20` | Windows 保留设备名判定 |

内部：`WINDOWS_RESERVED_NAME_RE=/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i`（`:7`）。

## 3. 内部逻辑与关键流程

单行正则测试（trim 后）。**调用方须传去掉扩展名的词干**（`CON.png` 同样失败 `:12-13`）；**所有平台统一拒绝**（皮肤包跨平台分享，macOS 制作→Windows 安装可用 `:15-16`）。

## 4. 调用者与调用链

入向：皮肤包安装服务、Agent 皮肤工具（跨文件）。出向：无。

## 5. 数据 I/O、读写与副作用

纯函数；无副作用。

## 6. 分支、失败、取消与恢复

不适用（单判定）。

## 7. 权限与权威状态

命名安全边界（防 Windows 设备名冲突）；跨平台统一策略（`:15-16`）。

## 8. 修改影响面

改正则 → 皮肤包命名校验双端一致；共用模块避免漂移（`:4`）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `isWindowsReservedName` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+正则+跨平台语义 | 已证实 | 逐行读 `:1-20` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isWindowsReservedName` | §2/§3 | `:18-20` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
