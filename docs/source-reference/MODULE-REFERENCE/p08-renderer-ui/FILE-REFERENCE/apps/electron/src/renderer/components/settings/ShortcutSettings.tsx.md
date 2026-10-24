---
path: apps/electron/src/renderer/components/settings/ShortcutSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11a15d5dc84bb802ebc789d55e0eb4c385a18b2c
sha256: d2662355a8feea85a5a1ee8c9c1a6ffca77f9cceed415c7b7189ff112faf3f7f
lines: 657
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/ShortcutSettings.tsx

## 1. 结论与边界

**快捷键设置面板**（`:1-9` 注释）：分组展示全部快捷键，支持查看绑定/点击录制自定义/冲突检测/恢复默认。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ShortcutSettings` | function（export） | `:271-657` | 主面板（分组+发送键开关+恢复全部） |

内部：`ShortcutRecorder`（**:49-267 录制器**）、`normalizeKey`（空格→Space/加号→Plus/单字符大写/方向与功能键映射 `:79-96`）、`isStandaloneKeyAllowed`（**仅 F1-F24 可单键** `:98-100`）、`finishCapture`（`:102-117`）。

## 3. 内部逻辑与关键流程

### 3.1 录制器（`:49-267`）

- 捕获（`:120-186`）：修饰键先行显示待续（`:135-138`）；**普通键需修饰键、F1-F24 例外**（`:143-147`）；Esc 取消；keyup 裸键确认（`:162-169`）。
- **冲突检测**（`:105-112`）：`checkConflict` 命中→显示「与「x」冲突」并停在 pending（**不自动保存**）。
- 三态渲染（`:208-266`）：录制/待存（取消+保存）、已禁用（`:244-255`）、当前绑定（点击开录）。
- **onActiveChange 同步录制态给父组件**（**:190-193，避免录制期间父渲染按钮改写 override**）。

### 3.2 主面板（`:271-657`）

- 按分类分组（app/navigation/edit/global 顺序 `:497`）。
- 保存（`handleSaveShortcut`，`:366-397`）：updateSettings+本地 registry 同步+**全局快捷键重注册**；reregister 返回 false → warning（**「可能被系统或其他应用占用」**，不吞）。
- **禁用**（`:400-438`）：平台键置 null；**禁用语义下主进程跳过 register，reregister 返回 false 是期望结果不当 warning**（`:418-420` 注释）。
- 恢复单个/全部（`:441-476`）：清 overrides+重注册；**部分全局未注册→warning 明示原因**（`:453-457`）。
- 发送/换行键切换（`:481-494`）：失败回滚本地值（`:490`）。

## 4. 调用者与调用链

入向：设置页。出向：`@/atoms/shortcut-atoms`、`@/lib/shortcut-defaults`/`shortcut-registry`（getActiveAccelerator/checkConflict/updateShortcutOverrides/isMac）、`window.electronAPI`（updateSettings/reregisterGlobalShortcuts）。

## 5. 数据 I/O、读写与副作用

写：快捷键设置（Main）；全局快捷键重注册；window 键盘监听（录制期 capture）。

## 6. 分支、失败、取消与恢复

失败 toast（error/warning 区分语义）；录制 Esc 取消。不适用取消/恢复。

## 7. 权限与权威状态

不适用（交互层）；全局注册失败如实提示（不吞占用冲突 `:456`）。

## 8. 修改影响面

- 改录制捕获/normalizeKey → 自定义快捷键录入面。
- 改冲突检测接线 → 冲突提示与保存门槛。
- 改禁用/恢复语义（null override+重注册）→ 快捷键生命周期。
- 改 toast 语义区分（false=warning 例外）→ 失败反馈可信度。
- 无测试锁定（§9）：改动需人工验证录制与全局注册。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ShortcutSettings|ShortcutRecorder` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+录制器+全链 | 已证实 | 逐行读 `:1-657` |
| 主进程全局注册 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 录制器 | §3.1 | `:49-267` | covered |
| 主面板全链 | §3.2 | `:271-657` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
