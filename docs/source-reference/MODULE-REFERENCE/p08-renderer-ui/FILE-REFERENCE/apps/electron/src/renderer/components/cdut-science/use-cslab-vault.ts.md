---
path: apps/electron/src/renderer/components/cdut-science/use-cslab-vault.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 29df5bff83a22d0815a7549881bc3ec3e433709f
sha256: 80d35f5b28a11f06714d4ee1986a907800b369f7e1748549ca6bb06c12f283e3
lines: 75
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/use-cslab-vault.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Vault 索引生命周期 hook（75 行，头注 :1-6）：启动/停止 Chokidar 监视（**显式 close 释放 Windows 目录句柄**）、增量重建索引、外部变更刷新笔记与索引状态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `useCsLabVault` | hook | 17-75 | 返回 `{refresh, rebuild}` |

## 3. 内部逻辑与关键流程

1. `refresh`（:28-35）：`listVaultNotes`+`getVaultIndexStatus` 并行→写 jotai。
2. `rebuild`（:37-46）：`rebuildVaultIndex({labId,force})`→refresh→`onAssetsChanged` 回调（错误吞掉 `catch(()=>undefined)`）。
3. 挂载 effect（:48-70）：`startVaultWatch`→rebuild→refresh；`onVaultChanged` 过滤 labId 后 refresh+回调；清理：`cancelled=true`+off+`stopVaultWatch`（catch 吞）。初始化失败仅 `console.warn`（:64）。

## 4. 调用者与调用链

入向：CSLab 工作台（笔记/资产面板）。出向：`window.electronAPI.cslab.*`（6 个 IPC）、`@/atoms/cslab-atoms`（jotai）。

## 5. 数据 I/O、读写与副作用

经 IPC 管理主进程 Chokidar 监视；写 jotai；无直接磁盘。

## 6. 分支、失败、取消与恢复

初始化失败→warn 不阻断；回调失败吞；卸载释放监视（Windows 句柄注释 :4）。

## 7. 权限与权威状态

- 生命周期权威：显式 stop（句柄释放）；`cancelled` 防卸载后 setState。无 sender/role 检查。

## 8. 修改影响面

Vault 笔记/资产刷新链。无专属测试。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/行号 | 已证实 | 逐行核对 |
| 释放/取消语义 | 已证实（代码） | :48-70 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useCsLabVault` 全链 | §3 | 17-75 | covered（未测） |
