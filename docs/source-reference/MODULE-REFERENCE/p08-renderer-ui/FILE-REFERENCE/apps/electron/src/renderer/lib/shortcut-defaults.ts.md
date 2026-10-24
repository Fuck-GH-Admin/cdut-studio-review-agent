---
path: apps/electron/src/renderer/lib/shortcut-defaults.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 63617ac52b2d8a3e80aa87623e17b3f0a2304bb0
sha256: 4d3d7301738815eee5b5c5abf77b3ac1f51486f7c15e35ba3d320b1539540322
lines: 195
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/shortcut-defaults.ts

## 1. 结论与边界

快捷键系统的**基础数据层**（`shortcut-defaults.ts:1-6` 文件头自述）：快捷键 ID/名称/描述/默认绑定/分类的不可变定义表 `DEFAULT_SHORTCUTS`（16 条）+ 分类标签 + ID 索引 `SHORTCUT_MAP`，由 `shortcut-registry` 消费。纯常量/类型文件，无运行时逻辑。

边界：不含匹配/分发逻辑（在 `shortcut-registry.ts`）；不含主进程 globalShortcut 注册（在 `global-shortcut-service.ts`，其有**独立**默认表，见 §4/§8）；用户覆盖的持久化在 settings 链（`types/settings.ts:160,294`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ShortcutCategory` | type | 11 | `'app' \| 'edit' \| 'navigation' \| 'global'` | 4 分类 |
| `ShortcutDefinition` | interface | 14-31 | `{id,name,description,defaultMac,defaultWin,category,global?,readonly?}` | 定义形状 |
| `ShortcutOverrides` | type（转发） | 38 | `export type { … } from '../../types/settings'` | 用户覆盖（定义在 `types/settings.ts:160`） |
| `SHORTCUT_CATEGORY_LABELS` | 常量 | 42-47 | `Record<ShortcutCategory, string>` | 应用/编辑/导航/全局 |
| `DEFAULT_SHORTCUTS` | 常量 | 51-190 | `ShortcutDefinition[]`（16 条） | 默认表 |
| `SHORTCUT_MAP` | 常量 | 193-195 | `Map<string, ShortcutDefinition>` | id→定义索引 |

导出计数 6（`export` 逐条核：type 2（含转发）、interface 1、const 3）。无内部函数。

`DEFAULT_SHORTCUTS` 16 条逐项（id/分类/特殊标记）：`open-settings`(:54-60, app)、`new-session`(:61-68, app)、`toggle-sidebar`(:69-76, app)、`toggle-mode`(:77-84, app)、`global-search`(:85-92, navigation)、`file-find`(:93-100, navigation)、`focus-input`(:101-108, navigation)、`editor-bold`(:111-119, edit, **readonly**，Mac `Ctrl+B`、Win `''`)、`editor-strikethrough`(:120-128, edit, **readonly**，Mac `Ctrl+S`、Win `''`)、`rename-item`(:131-138, edit, F2)、`clear-context`(:139-146, edit)、`stop-generation`(:147-154, edit)、`close-tab`(:155-162, app)、`toggle-preview-panel`(:163-170, navigation)、`toggle-right-panel`(:171-178, app)、`show-main-window`(:181-189, global, **global:true**)。分类计数：app 6 / navigation 4 / edit 5 / global 1 = 16。editor-* 用 `Ctrl+B/S` 的原因：`Cmd+B` 已被 `toggle-sidebar` 占用（注释 `:110,114`）。

## 3. 内部逻辑与关键流程

本文件不适用（无控制流），依据：纯常量数组/映射（`shortcut-defaults.ts:42-195`），无分支、无计算。`SHORTCUT_MAP`（`:193-195`）由 `DEFAULT_SHORTCUTS.map((s) => [s.id, s])` 构建；id 唯一性由数据保证（16 个 id 无重复，已逐条核）。

## 4. 调用者与调用链

入向（grep 全冻结树）：
- `shortcut-registry.ts:8-9` import `DEFAULT_SHORTCUTS`/`SHORTCUT_MAP`/`ShortcutOverrides`；`:143` `rebuildCache` 遍历 `DEFAULT_SHORTCUTS`（`:144` 注释「全局快捷键由主进程 globalShortcut 处理，不在渲染进程注册」→ `:145` `def.global` 跳过、`:147-149` 用户禁用（accel 为 null）不进缓存）；`:310` `getActiveAccelerator` 用 `SHORTCUT_MAP.get(id)` 取默认值；`:349` `checkConflict` 遍历 `DEFAULT_SHORTCUTS` 做冲突检测（`:352-357` 逐修饰键比对）。
- `ShortcutSettings.tsx:24-27` import `DEFAULT_SHORTCUTS`/`SHORTCUT_CATEGORY_LABELS`/`ShortcutCategory`/`ShortcutOverrides`；`:107` 冲突名回显 `DEFAULT_SHORTCUTS.find`；`:289-300` 按分类分组渲染；`:327,:370,:416` 保存/禁用时 `find` 定义（`:417` 据 `def?.global` 决定是否走主进程重注册）；`:497` 分类顺序、`:566` `SHORTCUT_CATEGORY_LABELS[category]`。
- `shortcut-atoms.ts:9,12`：`shortcutOverridesAtom: ShortcutOverrides`。
- `useShortcut.ts:17` 注释引用本文件（id 语义）。

出向：仅类型转发 `../../types/settings`（`:38`，`ShortcutOverrides` 定义 `types/settings.ts:160`、settings 字段 `:294`）。

**global 项的双表链路**（重点）：`show-main-window`（本文件 `:181-189`，`Cmd+Shift+P`/`Ctrl+Shift+P`）不进渲染注册（`shortcut-registry.ts:145` 跳过），由主进程 `global-shortcut-service.ts:21-23` 的**独立**默认表 `GLOBAL_SHORTCUT_DEFAULTS`（`CommandOrControl+Shift+P` 双平台）+ settings 覆盖（`:37-57` `getGlobalAccelerator`，Cmd→CommandOrControl 转换 `:64-68`）驱动；注册点 `main/index.ts:1049-1050`（`registerGlobalShortcut('show-main-window', showAndFocusMainWindow)`），退出注销 `main/index.ts:1279`（`unregisterAllGlobalShortcuts()` → `global-shortcut-service.ts:143-148`）。用户改绑定后经 `window.electronAPI.reregisterGlobalShortcuts()`（`ShortcutSettings.tsx:303,451`，preload `index.ts:1437,3762`，主进程 `ipc.ts:6770` → `reregisterAllGlobalShortcuts`）。

## 5. 数据 I/O、读写与副作用

本文件不适用，依据：纯常量定义（`shortcut-defaults.ts:42-195`），无磁盘/网络/状态读写、无副作用。用户覆盖持久化到 settings.json 的事实位于消费链（`types/settings.ts:294` 字段 + `getSettings()` 读取 `global-shortcut-service.ts:38`），本文件只转发类型。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无 if/throw/异步（`:1-195` 无控制流）。语义分支在消费方：`defaultWin: ''`（editor-* `:116,:125`）表示 Windows 无默认绑定，`getActiveAccelerator` 返回空串即「定义存在但该平台无默认值」（`shortcut-registry.ts:294-307` 语义）；`null` 覆盖值表示用户禁用（`types/settings.ts:160` 形状 + `shortcut-registry.ts:302`）。以上为跨文件语义，本文件仅提供数据。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。定义表是快捷键 id/默认值的**权威数据源**（渲染侧）；`readonly: true`（`:118,:126`）只是 UI 自定义限制标记，由 `ShortcutSettings.tsx` 消费（不可改绑），本文件不执行校验。主进程侧权威在 `GLOBAL_SHORTCUT_DEFAULTS`（并存关系见 §4/§8）。

## 8. 修改影响面

- 快捷键全链路：`shortcut-registry.ts`（缓存重建 `:140-151`、冲突检测 `:344-365`、`getActiveAccelerator` `:299-307`）、`ShortcutSettings.tsx`（设置页）、`useShortcut.ts`（hook 注册）、`main.tsx:416` 与 `GlobalShortcuts.tsx:70-79`（设置同步 `updateShortcutOverrides`）。
- 改 id 会使用户 settings 里的 `shortcutOverrides` 键失配（旧 id 覆盖悬空，推断）；改 `defaultMac/defaultWin` 影响所有未覆盖用户。
- **一致性约束**：改 `show-main-window` 的默认绑定必须同步 `global-shortcut-service.ts:23` 独立表，否则设置页显示与系统级注册不一致（两表并存，无共享常量）。
- 需同步修改的测试：无专属测试（§9）。

## 9. 测试证据

- 直接测试文件：**无**。检索范围：冻结树全文件类型搜 `shortcut-defaults|DEFAULT_SHORTCUTS|SHORTCUT_MAP|SHORTCUT_CATEGORY_LABELS|ShortcutDefinition|ShortcutCategory|ShortcutOverrides`，命中均为 §4 生产消费点，0 测试文件直接断言本表内容。
- 间接证据（标「间接」）：`global-shortcut-service.test.ts:39-42` 断言主进程 `registerGlobalShortcut('show-main-window', …)` 注册成功（测的是主进程独立表与 mock `globalShortcut`，`preload-electron-mock.ts:113-124` 记录 accelerator），不覆盖本文件数据。
- 本轮未执行任何测试：`NOT_RUN`（静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出、16 条定义、分类计数 6/4/5/1 | 已证实 | `shortcut-defaults.ts:51-190` 逐条 |
| editor-* readonly、Win 无默认、Cmd+B 冲突缘由 | 已证实 | `:110-128` |
| show-main-window global:true | 已证实 | `:186-189` |
| 消费链 shortcut-registry/ShortcutSettings/shortcut-atoms | 已证实 | `shortcut-registry.ts:8-9,143,310,349`、`ShortcutSettings.tsx:24-27,107,289-300`、`shortcut-atoms.ts:9,12` |
| 全局链路=主进程独立表+`main/index.ts:1049-1050` 注册 | 已证实 | `global-shortcut-service.ts:21-23,108-148`、`main/index.ts:1049-1050,1279` |
| 双表默认值语义等价（Cmd↔CommandOrControl） | 推断 | `:185-186` vs `global-shortcut-service.ts:23,64-68` |
| 改 id 使旧 override 悬空 | 推断 | `shortcut-registry.ts:300-307` 键查找结构 |
| 无直接测试 | 已证实（否定，范围见 §9） | 全树 grep 0 直接测试命中 |
| 16 条 id 的运行时实际生效 | 未知 | NOT_RUN，未启动应用验证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ShortcutCategory`/`ShortcutDefinition`/`ShortcutOverrides` | §2 | 11-38 | covered |
| `SHORTCUT_CATEGORY_LABELS` | §2 | 42-47 | covered |
| `DEFAULT_SHORTCUTS` 16 条 | §2 | 51-190 | covered |
| `SHORTCUT_MAP` | §2/§3 | 193-195 | covered |
| 消费链 + global 双表链路 | §4/§8 | - | covered |
| 平台默认/禁用语义（跨文件） | §6 | - | covered |
| 测试覆盖 | §9 | - | unknown（无直接测试） |
