---
path: apps/electron/src/types/settings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f35038c231e9927f5ab9e6e7eb95d6d86c08701f
sha256: 2d1c3d0d6af056d264a63170200b662d094cab1f7d19cdb63dfaee6498429e28
lines: 521
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/settings.ts

## 1. 结论与边界

应用设置的**全部类型形状 + 默认值常量 + 10 组 IPC 通道名**的声明文件（521 行、54 个导出）：主题/皮肤/语音输入/快捷键/通知音/标签页/窗口状态/移动模式/托盘事件/存储管理等设置域的类型契约（`apps/electron/src/types/settings.ts:1-7`）。

边界：纯类型/常量，无读写/迁移/校验逻辑（落盘与迁移在 `settings-service.ts`）；不含 IPC handler 注册（注册在 `ipc.ts`，通道名由本文件提供）。

## 2. 导出与关键符号

`export` 逐条核对（`grep -c '^export'`=54）：**类型别名 12 + 接口 25 + 常量 7 + 通道常量 10 = 54**（函数/类 0）。

### 2.1 类型别名（12）

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `NotificationSoundType` | 10 | `'taskComplete'\|'permissionRequest'\|'exitPlanMode'\|'planningReminder'` | 通知音场景 |
| `NotificationSoundId` | 13 | `string` | 通知音 ID |
| `VoiceDictationProvider` | 40 | `'doubao'` | 语音供应商 |
| `VoiceDictationEndpointMode` | 43 | `'async'\|'duplex'` | 豆包连接模式 |
| `VoiceDictationOutputMode` | 46 | `'auto'\|'clipboard'\|'profer-input'` | 输出方式 |
| `VoiceDictationSettingsUpdate` | 83 | `Partial<VoiceDictationSettings>` | 增量更新 |
| `ThemeMode` | 168 | `'light'\|'dark'\|'system'\|'special'` | 主题模式 |
| `ThemeStyle` | 174 | `string` | 风格值=皮肤包 id（注释 `:171-173`：权威是主进程皮肤注册表，无编译期白名单） |
| `ThemeStyleId` | 175 | `= ThemeStyle` | 同义 |
| `InterfaceVariant` | 209 | `'classic'\|'modern'` | 界面风格 |
| `MarkdownFontSize` | 215 | `'small'\|'medium'\|'large'` | Markdown 字号 |
| `UiScale` | 221 | `'standard'\|'large'\|'xlarge'\|'huge'\|'massive'\|'max'` | 缩放档位 |

### 2.2 接口（25）

| 符号 | 行 | 关键字段/说明 |
| --- | --- | --- |
| `CustomNotificationSound` | 16-25 | `{id,label,fileName,addedAt}`（id 格式 `custom-{ts}-{rand}`） |
| `NotificationSoundSettings` | 28-37 | 4 场景可选 ID |
| `VoiceDictationWindowPosition` | 49-56 | 含 workArea 归一化偏移 `relativeX/relativeY?` |
| `VoiceDictationSettings` | 59-80 | enabled/provider/appId/accessToken/resourceId/language/endpointMode/outputMode/customHotwords/windowPosition?（渲染进程读到解密值） |
| `VoiceDictationPersistedSettings` | 86-91 | `Partial<VoiceDictationSettings>` + `@deprecated appKey?/accessKey?`（`:87-90`，旧字段平滑迁移） |
| `VoiceDictationTranscriptEvent` | 94-98 | `{sessionId,text,isFinal}` |
| `VoiceDictationStateEvent` | 101-105 | `status: 'idle'\|'connecting'\|'recording'\|'stopping'\|'completed'\|'error'` |
| `VoiceDictationStartInput`/`AudioChunkInput`/`StopInput`/`CommitInput`/`ResizeInput` | 108-131 | 会话参数/音频分片/高度 |
| `VoiceDictationCommitResult` | 134-138 | `{mode:'profer-input'\|'cursor'\|'clipboard', success, message}` |
| `VoiceDictationTestResult` | 141-144 | 测试结果 |
| `MicPermissionResult` | 147-150 | `status: 'granted'\|'denied'\|'not-determined'\|'unsupported'` |
| `ShortcutOverrides` | 160-165 | `{[shortcutId]: {mac?: string\|null; win?: string\|null}}`；**三态语义**（`:155-158`）：缺省=默认快捷键、字符串=自定义、`null`=禁用不注册 |
| `SkinInfo` | 178-192 | id/name/tone/contractVersion（缺失视为 v1，`:182`）/titlebar?/builtin/previewScale?… |
| `SkinManagerResult` | 195-200 | `status: 'installed'\|'replaced'\|'deleted'\|'conflict'\|'cancelled'\|'error'` |
| `AppSettings` | 233-353 | 60 字段（见 §3.1） |
| `MainWindowState` | 356-362 | `{width,height,x,y,isMaximized}` |
| `PersistedTabSettings` | 365-372 | `tabs`（`import('../renderer/atoms/tab-atoms').TabItem[]`）/`activeTabId`/`group?`（旧兼容 `:368`）/`groups?` |
| `PocketModeStatus` | 375-386 | enabled/running/port/defaultPort/localUrl/lanUrl/token/error |
| `DeveloperSettingsSnapshot` | 405-408 | 开发者模式双开关跨窗口快照 |
| `TrayOpenAgentSessionData` | 486-491 | `{sessionId,title}` |
| `TrayCreateSessionData` | 494-497 | `{mode:'chat'\|'agent'}` |

### 2.3 常量（7）

| 符号 | 行 | 值/说明 |
| --- | --- | --- |
| `DEFAULT_THEME_MODE` | 203 | `'system'` |
| `DEFAULT_THEME_STYLE` | 206 | `'default'` |
| `DEFAULT_INTERFACE_VARIANT` | 212 | `'classic'`（`:208`：classic 保留旧版视觉） |
| `DEFAULT_MARKDOWN_FONT_SIZE` | 218 | `'medium'` |
| `DEFAULT_UI_SCALE` | 224 | `'standard'` |
| `DEFAULT_AGENT_RUNTIME` | 227 | `'pi'`（注释 `:226`「默认 Agent runtime：Pi」；**与 `:244` 注释矛盾，见 §3.2**） |
| `BROWSER_RISK_DISCLAIMER_VERSION` | 230 | `1`（升版要求重新确认风险告知） |

### 2.4 IPC 通道常量（10，均 `as const`）

| 符号 | 行 | 通道组 |
| --- | --- | --- |
| `SKIN_IPC_CHANNELS` | 388-402 | 12 键（get-list/get-css/get-preview/选 zip/选目录/装 zip/装目录/删/开用户目录/开模板目录/refresh + 广播 `skins:changed` `:401`） |
| `SETTINGS_IPC_CHANNELS` | 410-433 | renderer-ready/get/update/`set-review-agent-auto-approval`（专用确认通道，注释 `:414`：通用 UPDATE 剥离该字段）/update-sync/系统主题×2/主题广播/开发者广播/自启×2/移动模式×3/`get-apk-qr` |
| `NOTIFICATION_SOUND_IPC_CHANNELS` | 436-443 | add/remove/get-url |
| `DESKTOP_NOTIFICATION_IPC_CHANNELS` | 446-451 | show/clicked |
| `SCRATCH_PAD_IPC_CHANNELS` | 454-465 | load/save/save-sync/export/choose-export-path |
| `APP_ICON_IPC_CHANNELS` | 468-471 | set |
| `DOCK_BADGE_IPC_CHANNELS` | 474-477 | set-count |
| `SHORTCUT_IPC_CHANNELS` | 480-483 | reregister-global-shortcuts（注释 `:479`：快速任务窗口已移除，通道保留兼容） |
| `TRAY_IPC_CHANNELS` | 500-505 | open-agent-session/create-session |
| `STORAGE_IPC_CHANNELS` | 508-521 | get-stats/cleanup/cleanup-temp/会话整理 preview/apply/resolve-blobs |

## 3. 内部逻辑与关键流程

本文件无运行时逻辑（纯声明）；以下为必须知晓的声明级语义：

### 3.1 `AppSettings`（`:233-353`）要点

主题三件套（themeMode/themeStyle?/interfaceVariant?）、Agent 域（agentChannelId/agentModelId/agentRuntime?/agentChannelIds?/agentWorkspaceId/agentThinking/agentEffort/agentMaxBudgetUsd/agentMaxTurns/agentContextIndexGlobal）、审核专区 AI 代批三字段（`:252-256`，08 设计默认禁止、开启需 UI 风险确认、Agent 不可自行开启）、环境检查（environmentCheckSkipped/lastEnvironmentCheck）、通知（notificationsEnabled/notificationSoundEnabled/notificationSounds?/customNotificationSounds?）、UI 行为（stickyUserMessageEnabled/longTextPasteAsAttachmentEnabled/richTextRenderingEnabled/inputCompact* 三档 `:301-306`/markdownFontSize/uiScale/previewModePreference）、浏览器（browserRiskDisclaimerVersion/browserHomeUrl/executableOpenWarningDismissed）、窗口状态三份（mainWindow/planningWindow/scienceAgentWindowState?）、开发/试验（developerModeEnabled/openEpistemicModeEnabled/pocketModeEnabled/pocketModePort）、引擎选择（memoryRetrievalEngine 'classic'|'hipporag' `:345-346`、studyRetrievalEngine 'classic'|'graphrag' `:347-348`）、语音（voiceDictation?）等；除 `themeMode` 外全部可选（缺省语义见各字段注释）。

### 3.2 `DEFAULT_AGENT_RUNTIME` 与 `agentRuntime` 注释矛盾（如实记录）

- `:226-227`：`/** 默认 Agent runtime：Pi。 */ export const DEFAULT_AGENT_RUNTIME: AgentRuntime = 'pi'`。
- `:244`：`agentRuntime?: AgentRuntime` 字段注释「新建 Agent 会话的默认 runtime；**历史设置缺省时回退 Claude**」。
- 两者口径不一致：常量默认是 `'pi'`，字段注释仍留旧「回退 Claude」措辞（推断为注释陈旧）。消费侧 `main.tsx:276` 用 `settings.agentRuntime ?? 'pi'`（与常量一致）。**本手册不隐去该矛盾**；实际生效口径以消费侧 `?? 'pi'` 为准（已证实于 main.tsx:276，见 §4）。

## 4. 调用者与调用链

入向（经 `types/index.ts` barrel 或直连，冻结树 grep）：`main/ipc.ts:16,17,23,131`（10 组通道常量 + UserProfile/AppSettings/CustomNotificationSound）、`main/index.ts:246`（`TRAY_IPC_CHANNELS`）、`preload/index.ts:10`（9 组通道）、`settings-service.ts`、`user-profile-service.ts`、`identity-service.ts`、`skin-service.ts`、`skin-manager-service.ts`、`agent-skin-tools.ts`、`titlebar-overlay.ts`、`browser-risk-disclaimer.ts`、`planning-window.ts`、`agent-system-prompt-policy.ts`、`microphone-permission-service.ts`、`main-window-lifecycle.ts`、`feishu-sleep-blocker.ts`、`feishu/sleep-blocker.ts`；渲染层 `useGlobalAgentListeners.ts`、`atoms/notifications.ts`、`atoms/identity-atoms.ts`、`atoms/ui-preferences.ts`（stickyUserMessageEnabled 等）等。`DEFAULT_AGENT_RUNTIME`/`agentRuntime ?? 'pi'`：`main.tsx:276`。

出向：`@profer/shared`（`EnvironmentCheckResult`/`ThinkingConfig`/`AgentEffort`/`FeishuSessionMirrorSettings`/`AgentRuntime`，`:7`）；`../renderer/atoms/tab-atoms`、`../renderer/atoms/tab-group-atoms`（`import()` 类型，`:366-371`）。

## 5. 数据 I/O、读写与副作用

无：纯声明。数据读写/迁移（settings.json、加密 token、窗口状态恢复）在 settings-service 等消费者（文件外）。

## 6. 分支、失败、取消与恢复

本文件不适用（无控制流）；关键**状态语义**已按源码枚举记录：`VoiceDictationStateEvent.status` 六态（`:103`）、`SkinManagerResult.status` 六态（`:197`）、`MicPermissionResult.status` 四态（`:148`）、`ShortcutOverrides` 三态（`:155-158`）——不把注释态写成独立状态。

## 7. 权限与权威状态

本文件无权限分支，依据：无 sender/role 检查。声明级权威语义：AI 代批开关默认禁止且「Agent 不可自行开启」（`:252`，08 设计），专用确认通道 `SET_REVIEW_AGENT_AUTO_APPROVAL` 与通用 UPDATE 分离（`:414-415`）；皮肤 `contractVersion` 缺失视为 v1（`:182`）；`VoiceDictationSettings` 渲染侧为解密值（`:58`）。

## 8. 修改影响面

- `AppSettings` 增删字段需同步 settings-service 落盘/迁移与设置 UI；可选字段缺省语义要与消费者 `??` 兜底一致（如 `settings.ts:244` 注释与 `main.tsx:276` 的矛盾就是反例）。
- 通道名改动需同步 `ipc.ts` handler 注册与 `preload/index.ts` invoke 两端。
- `PersistedTabSettings` 依赖渲染层 tab-atoms 类型（`:366`），跨层耦合。
- 无专属测试（§9）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对本文件导出 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：settings-service/user-profile-service 的测试（若有）经类型编译期锁定，不验证本文件文本。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：枚举/默认值一致性无自动化断言（`:244` 矛盾即无守护的体现）。维护者验证：改默认值后走设置页全链路。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 54 导出（12 类型/25 接口/7 常量/10 通道） | 已证实 | `grep -c '^export'`=54 + 逐条列于 §2 |
| `DEFAULT_AGENT_RUNTIME='pi'` | 已证实 | `:226-227` |
| `:244` 注释「回退 Claude」与常量矛盾 | 已证实 | `:244` vs `:226-227` |
| 消费侧口径 `?? 'pi'` | 已证实 | `main.tsx:276` |
| ShortcutOverrides 三态语义 | 已证实 | `:155-165` |
| deprecated appKey/accessKey 迁移字段 | 已证实 | `:85-91` |
| settings-service 落盘/迁移细节 | 未知 | 文件外 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 类型别名 | §2.1 | 10-221 | covered |
| 25 接口 | §2.2 | 16-497 | covered |
| 7 常量 | §2.3 | 203-230 | covered |
| 10 通道常量 | §2.4 | 388-521 | covered |
| AppSettings 60 字段 | §3.1 | 233-353 | covered |
| DEFAULT_AGENT_RUNTIME 矛盾 | §3.2,§10 | 226-227,244 | covered |
| 测试 | §9 | — | unknown |
