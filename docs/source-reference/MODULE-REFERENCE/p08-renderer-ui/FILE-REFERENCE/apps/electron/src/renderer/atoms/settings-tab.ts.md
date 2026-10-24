---
path: apps/electron/src/renderer/atoms/settings-tab.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b2c424e02fb06f5d8ad53ffa33eec65334263ce9
sha256: a36c3038eb955e390cfc66fcc8227054816217adc489af17d9cbaf1b158d5785
lines: 37
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/settings-tab.ts

## 1. 结论与边界

**设置标签页 Atoms**（`apps/electron/src/renderer/atoms/settings-tab.ts:1-21`）：17 个标签页（general/usage/account/channels/agent/tools/bots/shortcuts/appearance/proxy/devices/openapi/data-management/developer/team/about…）；`developer` **版本号连击解锁后显示**（`:18`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsTab` | type | `:25` | 17 态 |
| `settingsTabAtom` | atom | `:28` | 当前标签页（**不持久化**，`:27`） |
| `settingsOpenAtom` | atom | `:31` | 设置浮窗开关 |
| `channelFormDirtyAtom` | atom | `:34` | 渠道表单未保存（拦截导航） |
| `settingsCloseRequestedAtom` | atom | `:37` | 外部请求关闭（Cmd+W→确认对话框） |

## 3. 内部逻辑与关键流程

纯 atom；`channelFormDirtyAtom` 拦截导航（`:33`）；`settingsCloseRequestedAtom` 外部关闭请求协议（`:36`）。

## 4. 调用者与调用链

- 消费方：renderer UI 组件。
- 出向：Jotai。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

`developer` 标签连击解锁（`:18`）；不持久化默认 general（`:27`）。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

5 个导出已证实（`:25-37`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:25-37` | covered |
