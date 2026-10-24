---
path: apps/electron/src/main/lib/global-shortcut-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09f44917d5e2df553652a4042f221cb4e897af7e
sha256: 2f47479b52c4896b8181745b2a4c37fea03843bed588e33236224ae3efc507fa
lines: 150
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/global-shortcut-service.ts

## 1. 结论与边界

全局快捷键服务（头注 :1-12）：Electron `globalShortcut` 系统级注册（应用不在前台也生效）；与渲染进程 `shortcut-registry`（keydown、应用内）**完全独立**。快速任务已移除；`show-main-window` 始终注册（测试头注）。默认 accelerator `CommandOrControl+Shift+P`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `registerGlobalShortcut` | fn | 112-115 | 存回调+注册单个 |
| `reregisterAllGlobalShortcuts` | fn | 122-137 | 全量注销再注册（设置变更后调用） |
| `unregisterAllGlobalShortcuts` | fn | 144-150 | will-quit 时清全部 |

内部：`globalCallbacks`/`registeredAccelerators` Map（:15-19）、`GLOBAL_SHORTCUT_DEFAULTS`（:22-24）、`shouldRegisterGlobalShortcut`（:28-30，恒 true）、`getGlobalAccelerator`（:39-66）、`registerOne`（:72-105）。

## 3. 内部逻辑与关键流程

1. **`getGlobalAccelerator`**（:39-66）：`settings.shortcutOverrides[id]` 优先；`customAccel===null` → 返回 null（用户禁用，注释 :34）；空串回退默认；`cmd` 段统一转 `CommandOrControl`（Ctrl 保持物理 Control，注释 :36-37）。
2. **`registerOne`**（:72-105）：无回调→false；禁用/空 accelerator→false+log；`globalShortcut.register` try/catch（失败 warn 不抛）。
3. **`reregisterAll`**（:122-137）：逐个 unregister（错误忽略）→ 重注册所有有回调的 id。
4. **`unregisterAll`**（:144-150）：`app.isReady()` 才 `unregisterAll()`；清两张 Map。

## 4. 调用者与调用链

入向：`index.ts`（whenReady 注册/will-quit 注销）+ 设置界面重注册路径（全树 grep）。出向：`electron`、`./settings-service`（:13）。

## 5. 数据 I/O、读写与副作用

读设置（shortcutOverrides）；Electron 系统级快捷键注册/注销；console 日志；无网络。

## 6. 分支、失败、取消与恢复

被占用→warn+false（不重试）；异常→catch+false；设置变更→全量重注册。

## 7. 权限与权威状态

- 覆盖权威：用户 override 优先，`null` 即禁用（:43-45）；`cmd` 归一化避免 Mac/Win 语义漂移。
- 无 sender/role 检查（主进程服务）。

## 8. 修改影响面

全局呼出主窗口快捷键；设置页快捷键编辑。同测：`global-shortcut-service.test.ts`（1 用例）。

## 9. 测试证据

直接测试 `global-shortcut-service.test.ts`（1 用例 / 1 describe；preload electron mock 钩子记录 registeredAccelerators；`mock.module('./settings-service')`；NOT_RUN）：
- `:34-39` show-main-window 无任何开关设置时也注册（`registerGlobalShortcut(...)` 返回 true）。

未覆盖：override 自定义/null 禁用/cmd 转换/`reregisterAll`/占用失败分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| override/null/cmd 归一化逻辑 | 已证实（代码） | :39-66 |
| 始终注册语义 | 已证实 | 测试 :34-39 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `registerGlobalShortcut` 基础 | §3/§9 | 112-115 | covered |
| `getGlobalAccelerator` 分支 | §3 | 39-66 | covered（未测） |
| `reregisterAll`/`unregisterAll` | §3 | 122-150 | covered（未测） |
