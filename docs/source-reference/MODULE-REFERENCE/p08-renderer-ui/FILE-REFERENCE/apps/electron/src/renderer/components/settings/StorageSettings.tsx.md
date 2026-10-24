---
path: apps/electron/src/renderer/components/settings/StorageSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d5da2f55ecd28a8e5a557ba2e7591dfc48e1672
sha256: 77d4eca5007a22844656fa6164801780c2063a26e1e827ac95cd29f142687f3e
lines: 339
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/StorageSettings.tsx

## 1. 结论与边界

**磁盘管理设置面板——已废弃**（`StorageSettings.tsx:2-5` `@deprecated` 注释）：磁盘管理已内联到 DataManagementSettings.tsx 的 StorageSection，**本文件未被任何入口引用**；保留仅作历史参考，**新代码勿在此接线**。功能面：各数据类别磁盘占用、孤儿检测、手动/自动清理。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `StorageSettings` | function（export） | `:89-339` | 四区：存储用量/自动清理/深度清理/结果提示 |

内部：`StorageCategory/StorageStats/CleanupResult`（`:28-48`）、`formatBytes`（`:50-56`）、`BAR_COLORS` 6 色（`:58-65`）、`StorageBar`（占比 <0.5% 不显示 `:67-87`）。

## 3. 内部逻辑与关键流程

1. 统计（`loadStats` `:97-107`）+设置读取（autoCleanupTempOnStart/autoCleanupArchivedDays `:111-114`）。
2. 三清理（`:117-165`）：分类清理（cleanupStorage 单类+orphansOnly）、临时清理（cleanupTempStorage）、**一键清孤儿**（agent-sessions/sdk-config/workspaces 三类 orphansOnly `:153-157`）；`cleaningKey` 防重；结果记 lastResult 后刷新。
3. 自动清理设置（`:167-184`）：启动清临时开关；归档天数（0=禁用/7/30/90）。
4. UI：分类行（孤儿琥珀警示 `:224-229`；temp-files 专钮/有孤儿才显清理钮 `:231-253`）；孤儿区（`hasOrphans` 汇总+一键清理 `:298-315`）；结果提示（释放量/错误逐条 `:321-335`）。

## 4. 调用者与调用链

入向：**无（未被引用，`:5`）**。出向：`./primitives`、`@profer/ui`、`window.electronAPI`（getStorageStats/cleanupStorage/cleanupTempStorage/getSettings/updateSettings）。

## 5. 数据 I/O、读写与副作用

写：存储清理/设置（经 Main）；读统计。

## 6. 分支、失败、取消与恢复

失败 console.error 不打断 UI（`:102-103/:128-129`）；cleaningKey 防重。不适用取消/恢复。

## 7. 权限与权威状态

不适用（展示层）；**废弃状态本身是权威约束（勿接线）**（`:5`）。

## 8. 修改影响面

- **本文件已废弃**：接线前须先确认替代件（DataManagementSettings StorageSection）语义（`:4`）。
- 改清理类别口径（三类 orphansOnly `:154`）→ 孤儿数据检测/清理面。
- 改 autoCleanup 设置键 → 主进程启动清理行为。
- 改结果提示/错误展示 → 清理反馈 UX。
- 无测试锁定（§9）：改动需人工验证清理链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `StorageSettings` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+四区 | 已证实 | 逐行读 `:1-339` |
| 未被引用声明 | 已证实（注释） | `:5` |
| Main 清理实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+三清理 | §2/§3 | `:89-339` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
