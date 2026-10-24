---
path: apps/electron/src/renderer/hooks/useShortcut.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7b944f602c2322b722e88e7eb98dbc00e292cd53
sha256: 92045a0d144b59ae9e73c96bf0a9dde9a30fcd65267510c1e0f9cd9959d2501e
lines: 32
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useShortcut.ts

## 1. 结论与边界

快捷键注册的 React hook（运行时，薄包装）：把 handler 绑定到组件生命周期，卸载自动注销（文件头注释 `apps/electron/src/renderer/hooks/useShortcut.ts:1-6`）。

边界：不解析按键/不派发（派发在 `shortcut-registry` 全局 keydown capture 监听）；不管 accelerator 自定义/禁用（`shortcut-registry.ts` 的 `updateShortcutOverrides`/`getActiveAccelerator`）；不校验 id 是否存在于 `shortcut-defaults`（无效 id 注册后永远不会触发，推断）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useShortcut` | 函数（导出） | 21-32 | `(id: string, callback: () => void, enabled = true, options?: ShortcutRegistrationOptions) => void` | 注册一个快捷键 handler |
| `DEFAULT_SHORTCUT_OPTIONS` | 常量（内部） | 12 | `{}` | options 未传时共享该引用 |

## 3. 内部逻辑与关键流程

1. `shortcutOptions = options ?? DEFAULT_SHORTCUT_OPTIONS`（`:27`，未传时固定共享引用，避免每次渲染新对象触发重注册）。
2. `useEffect`（`:28-31`）：`!enabled` 直接 return（不注册，`:29`）；否则 `return registerShortcut(id, callback, shortcutOptions)`（`:30`）——返回值即注销函数，effect cleanup 自动注销。
3. deps `[id, callback, enabled, shortcutOptions]`（`:31`）：`callback` 身份变化即重注册，调用方需自行 memo（实测调用方 `DiffTabContent.tsx:323` 用 `React.useCallback`；`session-items.tsx:419,707` 传 `startEdit`）。

callee 语义（`apps/electron/src/renderer/lib/shortcut-registry.ts:265-283`，交叉读）：`registerShortcut` 把 `{callback, options}` 加入 `handlers: Map<id, Set<entry>>`，返回从 Set 删除 entry、空集时删键的注销函数；`ShortcutRegistrationOptions` 仅 `exclusive?`（`:18-25`）：同快捷键任一注册项 exclusive=true 时只执行最后注册的 exclusive handler。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：

- `components/shortcuts/GlobalShortcuts.tsx:31`（import），9 处调用（`:112,:117,:123,:129,:137,:146,:152,:160,:168`，close-tab 等全局动作）。
- `components/planning/PlanningView.tsx:16,113`（'new-session'）。
- `components/app-shell/left-sidebar/session-items.tsx:17,419,707`（'rename-item'×2，条件 enabled）。
- `components/ai-elements/scroll-minimap.tsx:20,176`（'file-find'，`items.length >= MIN_ITEMS && canScroll`）。
- `components/diff/DiffTabContent.tsx:19,322`（'file-find'，`FILE_FIND_SHORTCUT_OPTIONS`）。

出向：`@/lib/shortcut-registry` 的 `registerShortcut` 与 `ShortcutRegistrationOptions` 类型（`:9-10`）；React effect。

## 5. 数据 I/O、读写与副作用

- 写：注册表内存 Map（经 `registerShortcut`）。不写盘/网络/atom（依据：本文件无 fs/IPC/fetch）。
- 副作用：全局 keydown 注册表条目增删；无 DOM 监听本体（监听在 registry 单例）。
- 并发/幂等：同一 `id` 可多条目共存（Set）；enabled 抖动会导致反复注册/注销，行为以 registry 的 Set 语义为准。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 不注册 | `!enabled` | 29 |
| 注册+自动注销 | enabled | 30 |
| 重注册 | deps 变化 | 31 |

卸载即注销（`:30` return 的 cleanup）；无 try/catch；无恢复概念，依据：纯注册生命周期，无持久状态。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；快捷键触发权限（enabled/exclusive）是组件级 UI 逻辑，不是安全权限。

## 8. 修改影响面

- 5 个调用文件（§4，14 处调用）；改签名波及全部。
- `callback` 依赖语义：改 deps 会改变重注册频率（性能/行为）。
- registry 侧 `exclusive` 语义与本 hook 的 options 透传耦合（`shortcut-registry.ts:18-25`）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `useShortcut` 0 命中（`shortcut-registry` 的测试不在本批；未检索到本 hook 的任何断言）。间接证据：无。

真实断言：不适用。未覆盖：enabled 切换、callback 身份变化重注册、options 透传。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实按键；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 参数形状 | 已证实 | `:21-26` |
| enabled 守卫 + cleanup 注销 | 已证实 | `:28-31` |
| registerShortcut 返回注销函数 | 已证实 | `shortcut-registry.ts:265-283` |
| exclusive 选项语义 | 已证实 | `shortcut-registry.ts:18-25` |
| 5 调用文件 14 调用点 | 已证实 | §4 各行号 |
| 无效 id 注册后不触发 | 推断 | registry 派发按 id 匹配（未逐行读派发） |
| registry 派发细节/平台差异 | 未知 | `shortcut-registry.ts` 仅读接口与注册段（检索范围：L1-60、L255-330） |
| 运行期按键行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useShortcut` | §2-3 | 21-32 | covered |
| `DEFAULT_SHORTCUT_OPTIONS` | §2 | 12 | covered |
| enabled 分支 | §3, §6 | 29 | covered |
| 注销生命周期 | §3 | 30 | covered |
| 调用方 | §4 | - | covered |
| registry 派发 | §10 | - | partial（跨文件，非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
