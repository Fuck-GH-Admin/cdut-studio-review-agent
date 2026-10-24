---
path: apps/electron/src/renderer/atoms/notifications.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d080b5d04aa6ea889db8a95b19fa1ea398eb3148
sha256: 00081b4342db833238742e2bc3efbf4a3c5354b67e0982d7f3513e09a571c6b4
lines: 433
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/notifications.ts

## 1. 结论与边界

桌面通知状态管理（433 行，头注释 `:1-9`）：通知/提示音开关、多场景音效（任务完成/权限审批/计划审批/计划提醒）、自定义音效（最长 10s，存 `~/.cdutai/custom-sounds/`）；Windows 经主进程 Electron 原生 Notification（点击可靠），macOS/Linux 用 Web Notification API。

**边界**：主进程通知/自定义音效存储在 IPC 侧（跨批）；时长验证在 UI（`:163` 注释）；不实现通知内容策略（调用方定）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `NotificationSoundMeta` | 接口（导出） | 27-33 | `{id, label, url, isCustom?}` | 音效元数据 |
| `BUILTIN_NOTIFICATION_SOUNDS` | 常量（导出） | 36-45 | 8 内置（ding/ding-dong/discord/done/down-power/food/lite/quiet，各配 mp3 静态 import `:15-22`） | 不含 none |
| `NOTIFICATION_SOUNDS` | 常量（导出，@deprecated） | 47-48 | `= BUILTIN_NOTIFICATION_SOUNDS` | 旧别名 |
| `DEFAULT_NOTIFICATION_SOUNDS` | 常量（导出） | 59-64 | `{taskComplete:'ding', permissionRequest:'ding-dong', exitPlanMode:'ding-dong', planningReminder:'ding-dong'}` | 场景默认音 |
| `notificationsEnabledAtom` | atom（导出） | 69 | `boolean` 初值 true | 通知开关 |
| `notificationSoundEnabledAtom` | atom（导出） | 72 | `boolean` 初值 true | 提示音开关 |
| `notificationSoundsAtom` | atom（导出） | 75 | `NotificationSoundSettings` 初值 `{}` | 场景音效配置 |
| `customNotificationSoundsAtom` | atom（导出） | 78 | `CustomNotificationSound[]` 初值 `[]` | 自定义音效列表 |
| `getAllNotificationSounds` | 函数（导出） | 85-96 | `(customSounds) => NotificationSoundMeta[]` | 内置+自定义合并（自定义 url:'' 运行时 IPC 取，`:91`） |
| `initializeNotifications` | 异步函数（导出） | 103-118 | `(setEnabled, setSoundEnabled, setSounds, setCustomSounds?) => Promise<void>` | 从主进程读设置 |
| `updateNotificationsEnabled` | 异步函数（导出） | 125-131 | `(enabled) => Promise<void>` | 持久化开关 |
| `updateNotificationSoundEnabled` | 异步函数（导出） | 136-142 | `(enabled) => Promise<void>` | 持久化提示音开关 |
| `updateNotificationSound` | 异步函数（导出） | 147-159 | `(type, soundId, currentSounds) => Promise<NotificationSoundSettings>` | 返回**新对象**（不改入参） |
| `addCustomNotificationSound` | 异步函数（导出） | 165-171 | `(sourcePath, label) => Promise<CustomNotificationSound>` | 经 IPC 添加 |
| `removeCustomNotificationSound` | 异步函数（导出） | 177-208 | `(id, currentSounds, customSounds) => Promise<{customSounds, sounds}>` | 删+清理场景引用/缓存 |
| `playNotificationSound` | 函数（导出） | 264-281 | `(soundId) => void` | **同步版：只处理内置与 none** |
| `playNotificationSoundAsync` | 异步函数（导出） | 286-310 | `(soundId, customSounds) => Promise<void>` | 含自定义 |
| `playNotificationSoundForType` | 函数（导出） | 315-321 | `(type, sounds) => void` | 按场景取音效（缺省用默认） |
| `initDesktopNotificationListener` | 函数（导出） | 339-351 | `() => void` | 幂等注册 IPC clicked |
| `DesktopNotificationOptions` | 接口（导出） | 354-367 | `{soundType?, playSound?, sounds?, customSounds?, onNavigate?, force?}` | 通知选项 |
| `sendDesktopNotification` | 函数（导出） | 378-413 | `(title, body, enabled, options?) => void` | 发送桌面通知 |

内部：`SOUND_URL_MAP`（`:51-53`）、`customSoundUrlCache`（`:56`）、`audioCache`（`:213`）、`getBuiltinAudioElement`（`:218-229`）、`getCustomAudioElement`（`:234-258`）、`pendingNavigateCallback`（`:330`）、`listenerInitialized`（`:333`）、`fallbackWebNotification`（`:419-433`）。导出合计 21。

## 3. 内部逻辑与关键流程

1. **removeCustomNotificationSound**（`:177-208`）：IPC 删除（`:185`）；清理场景引用只扫 **`['taskComplete','permissionRequest','exitPlanMode']` 三场景**（`:190`，**`planningReminder` 不在清理列表**——照实记录差异，删自定义音后 planningReminder 引用成悬挂 id）；命中默认值替换且仅当 needsClean 才 `updateSettings`（`:196-198`）；清 `customSoundUrlCache`+`audioCache`（`:201-205`）。
2. **播放**：同步 `playNotificationSound`（`:264-281`）——`'none'` 短路；内置直接 `audio.currentTime=0; audio.play().catch(()=>{})`（`:270-272`）；**自定义不播**（注释 `:276-277`：保持同步签名，自定义走 async 版）。异步版（`:286-310`）同内置 + 自定义经 `getCustomAudioElement`（IPC 取 file:// URL，缓存 `customSoundUrlCache`，`:234-258`）。
3. **initDesktopNotificationListener**（`:339-351`）：`listenerInitialized` 幂等（`:340`）；无 `onDesktopNotificationClicked` 直接 return（`:341`）；clicked → 取出 `pendingNavigateCallback` 并清空（单槽，`:345-346`）同步执行（`:349`，注释 `:347-348` Jotai store.set 触发 React 调度）。
4. **sendDesktopNotification**（`:378-413`）：整体 `setTimeout(…, 0)` 延后到下一宏任务（`:386`，注释 `:384-385` 避开 React batchedUpdates 掉帧）；先音效（`playSound && soundType`，`sounds[type] ?? DEFAULT`，有 customSounds 走 async 否则同步，`:387-394`，**无论焦点都播**）；`!enabled` → return（`:396`）；**非 force 且 `document.hasFocus()` → return**（`:397`，桌面通知仅失焦时发）；登记 `pendingNavigateCallback = onNavigate ?? null`（`:400`，单槽语义 `:328` 注释）；Windows（`window.electronAPI?.showDesktopNotification`）失败 `.catch` 回退 Web Notification（`:403-407`），无该 API 直接回退（`:408-411`）。
5. **fallbackWebNotification**（`:419-433`）：`new Notification(title,{body, silent:true})`，onclick → `window.focus()+onNavigate?.()`（`:426-429`）；构造失败静默（`:430-431`）。

## 4. 调用者与调用链

入向（全冻结树检索 `atoms/notifications`，4 文件）：
- `renderer/main.tsx:57`（import 块：初始化/监听注册）。
- `hooks/useGlobalAgentListeners.ts:62`（import 块：任务完成等场景通知）。
- `components/planning/PlanningReminderRail.tsx:9`（`notificationsEnabledAtom`/`notificationSoundEnabledAtom`/`notificationSoundsAtom`/`playNotificationSoundForType`）。
- `components/settings/UsageSettings.tsx:56-57`（多符号 + `NotificationSoundMeta` 类型）。
出向：`jotai`、`@/types/settings` 类型（`:12`）、8 个 mp3 静态资源（`:15-22`）、`window.electronAPI`（getSettings/updateSettings/addCustomNotificationSound/removeCustomNotificationSound/getCustomSoundUrl/showDesktopNotification/onDesktopNotificationClicked）、`Audio`/`Notification` 浏览器 API。

## 5. 数据 I/O、读写与副作用

- IPC 读写：settings 四项（`:110-114`/`:127`/`:138`/`:154`/`:197`）、自定义音效增删/URL（`:169`/`:185`/`:239`）、主进程通知（`:404`）、clicked 订阅（`:344`）。
- 磁盘（经主进程）：`~/.cdutai/custom-sounds/`（头注释 `:8`）。
- 副作用：Audio 播放（缓存池 `audioCache` `:213`）、系统通知、console.error（初始化/持久化失败 `:116`/`:129` 等）。
- 恢复：`audio.onerror` 清缓存（`:225`/`:251-254`）；IPC 失败 console.error 不抛（各 try/catch）。

## 6. 分支、失败、取消与恢复

- 同步/异步播放分工（自定义仅 async，§3.2）；`'none'` 短路（`:266`/`:288`）。
- 通知焦点矩阵（§3.4）：音效总是播；桌面通知=enabled 且（force 或失焦）。
- 失败降级：主进程通知失败→Web Notification（`:404-407`）；Web Notification 构造失败静默（`:430`）；播放失败静默（`.catch(()=>{})`/外层 try）。
- 不可恢复点：`pendingNavigateCallback` 单槽——连续通知只保留最后一个回调（`:328` 注释承认"同一时间通常只有一个活跃通知"）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。通知/声音为用户设置门控（`enabled`/`playSound`，`:396`/`:387`）；无 OS 权限 API。权威=主进程 settings（跨批）。

## 8. 修改影响面

- 4 个消费方的通知/音效行为（主入口初始化、监听器、计划提醒、用量设置 UI）。
- `removeCustomNotificationSound` 的三场景清理面与 `DEFAULT_NOTIFICATION_SOUNDS` 四场景不同步（planningReminder 悬挂，§3.1）——修改清理列表需同步该差异。
- `DesktopNotificationOptions`/`NotificationSoundMeta` 是 UI 契约；8 内置音效 id 是 settings 值域。
- 需同步修改的测试：批内无（见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `atoms/notifications` 无测试命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试；未真实播放音效/发通知。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 导出/三场景清理差异/同步异步分工/焦点矩阵/单槽回调/降级链 | 已证实 | `:1-433` 全文逐行 |
| 4 个调用方 | 已证实 | 全树检索（§4） |
| planningReminder 不在清理列表（悬挂引用面） | 已证实 | `:190` vs `:59-64` |
| 主进程 showDesktopNotification/自定义音效存储实现 | 边界（跨批） | IPC 调用点 |
| 浏览器 Notification/Audio 真实行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 音效注册表/默认映射/4 atom | §2 | 26-78 | covered |
| `getAllNotificationSounds`/`initializeNotifications`/3 个 update | §2/§5 | 85-159 | covered |
| `addCustomNotificationSound`/`removeCustomNotificationSound`（三场景清理） | §3.1 | 165-208 | covered |
| 播放三函数/音频缓存 | §3.2 | 213-321 | covered |
| 监听注册/`sendDesktopNotification`/fallback | §3.3-3.5 | 330-433 | covered |
