---
path: apps/electron/src/renderer/components/automation/AutomationFormView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7441f3771d59b1785e441f83ddd6f6eeeeac80cc
sha256: 630a852eff2e824bdb57475f213415db1126f2ea0d65f9630cc0b3d8b09665a8
lines: 1324
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/automation/AutomationFormView.tsx

## 1. 结论与边界

定时任务表单视图（渲染层运行时，Codex 风格覆盖式 overlay 非弹窗）：左栏自然语言任务描述（MarkdownRichEditor）、右栏配置（启用/状态/调度/运行时/模型/工作区/预设/飞书通知/权限/运行历史），带 500ms 防抖自动保存（文件头 `apps/electron/src/renderer/components/automation/AutomationFormView.tsx:1-9`）。表单打开时 AppShell 隐藏右侧文件面板（`:8`）。

边界：不实现调度（scheduler/主进程）；草稿/atom 语义在 `@/atoms/automation-atoms`；模型选择器在 `ModelSelector`；不直接写盘（经 IPC）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（其余内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AutomationFormView` | 函数/组件（导出） | 252-1324 | `() => React.ReactElement \| null` | 表单主组件 |

内部函数/常量（`export` 逐条核对外）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `NO_FEISHU_BINDING`/`PRESET_FOLLOW_DEFAULT` | 55-57 | Select 哨兵值（Radix 不允许空 value） |
| `formatTime`/`formatRunStatus` | 59-68 | 时间/状态文案 |
| `canPersistDraft` | 70-73 | 草稿门槛：name+prompt 非空 |
| `isReadyToRun` | 76-78 | 运行门槛：草稿门槛+channelId+workspaceId |
| `listMissingFields` | 81-88 | 缺失项文案 |
| `getDraftSignature` | 90-110 | 17 字段 JSON 签名（去重保存） |
| `draftToCreateInput`/`draftToUpdateInput` | 112-154 | 草稿→IPC 入参 |
| `getFeishuTarget`/`getFeishuBindingValue`/`formatFeishuBinding`/`createFeishuTarget` | 156-179 | 飞书目标/绑定工具 |
| `AutomationPromptEmptyGuide` | 181-201 | 空白引导卡 |
| `SaveStatusBadge` | 205-250 | 保存状态徽标（idle/dirty/saving/saved/error，aria-live） |

## 3. 内部逻辑与关键流程

### 3.1 打开/初始化（`:252-354`）

`automationFormAtom` 驱动（`:254`）；formState.open&&draft 时复制草稿+初始化签名/idle（`:299-308`）；新建且 workspaceId 空时默认填当前工作区→首个（`:310-320`，编辑模式不覆盖已选）；打开拉飞书绑定（`:322-329`）；工作区变化重拉预设列表/默认预设（**requestId 竞态守卫**，`:332-354`）；`workspaceOptions` 保留已绑定但被收纳的工作区（`:270-276`，防 Select 空白）。

### 3.2 自动保存 `persistDraft`（`:374-437`）+ 防抖 effect（`:439-464`）

- **串行化**：`persistInFlightRef` 链——新保存等前序完成、取 `latestFormRef.current` 为底稿、继承前序 id（`:377-383`，注释：防新建草稿在首次 create 返回前被重复创建，`:289-290`）。
- 不完整任务强制 `active:false`（`:385-388`）；签名与上次相同直接返回（`:392-393`）；id 存在→`updateAutomation`（不存在抛「定时任务不存在」`399`）否则 `createAutomation`（`:397-419`）；成功更新 atom/form/`saved`；失败 `console.error`+`toast.error('自动保存失败')`+`error`（`:420-427`）。
- 防抖：form 变化→签名不等→`dirty`→500ms 定时 `persistDraft`（`:439-464`）；撤回至已保存状态清 dirty（`:443-447`）。
- `isMountedRef` 防卸载后 setState（`:292-297`）；`saved` 高亮 3s 退化 idle（`:467-471`）。

### 3.3 关闭/会话切换（`:473-502`）

切会话/Tab 自动关闭：先 `persistDraft(latest)` 再关（`:475-489`）；`close()` 同语义（`:498-502`）。

### 3.4 动作（`:511-588`）

`handleRunNow`（`:511-536`）：不完整→toast 列缺失项；`persistDraft` 拿 id→`runAutomationNow`→刷新列表/会话；失败 toast。`handleOpenRunSession`（`:539-563`）：无 sessionId→toast；本地找不到→拉全量（含归档）找（`:545-551`）；仍无→toast；否则先保存再关表单→`openSession`。命名编辑 `startEditName`/`commitName`/`handleNameKeyDown`（`:565-588`，空名拒绝、Escape 回滚到 live/草稿名）。

### 3.5 表单字段（`:603-1320`）

- 启用 Switch：`isReadyToRun` 前禁用（`:700-714`）；状态信息（上次/下次运行，暂停显示「已暂停」，`:716-730`）。
- 调度四模式（`:732-1042`）：interval 分钟数下限 1（`:750-765`）；daily/weekly/monthly 多时刻（上限 10，`:791,:884,:1001`）+ 快捷预设/自定义 time 输入（正则 `^([01]\d|2[0-3]):[0-5]\d$`，`:819`）；weekly 星期至少保留 1（`:846`）；monthly 日期多选至少 1（`:956`）+ 短月提示（≥29 号，`:973-977`）。
- 运行时：切换清空 channelId/modelId 防跨协议串模型（`:1044-1060`）；模型：无渠道引导去设置（`:1065-1079`），`ModelSelector` 按运行时 protocol 过滤（pi→openai，`:1081-1088`）。
- 工作区：空引导（`:1095-1109`）；预设：`PRESET_FOLLOW_DEFAULT` 哨兵+说明「预设权限不覆盖运行权限」（`:1127-1149`）。
- 飞书通知：开关/绑定选择/触发（always/success/error）（`:1151-1226`）；无绑定开启时 toast 引导（`:1171-1175`）。
- 权限：bypassPermissions/auto 两档+文案（`:1231-1249`）；bypass 时琥珀警示（`:1251-1256`）。
- 运行历史：最近 10 条（`:1266`），点击跳会话（`handleOpenRunSession`），success 显示耗时/error 显示 error/skipped 显示 skipReason（`:1278-1284`）。
- 底部「运行一次」：`isReadyToRun` 前禁用+Tooltip 列缺失（`:1298-1320`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`planning/PlanningWindowApp.tsx:3,16`（独立窗口分支）、`tabs/MainArea.tsx:23,324,364`（内容区 overlay 两处挂载）。

出向：`@/atoms/automation-atoms`（`automationFormAtom`/`automationsAtom`/选项表/`automationToDraft`，`:29-36`）、`@/atoms/agent-atoms`/`tab-atoms`/`active-view`/`settings-tab`（`:37-41`）、`@/hooks/useOpenSession`（`:42`）、`MarkdownRichEditor`（`:43`）、`ModelSelector`（`:28`）、`@profer/ui` 原子组件、`@profer/shared` 类型、`window.electronAPI`（`listFeishuBindings`/`listAgentPresets`/`getDefaultAgentPreset`/`listAutomations`/`createAutomation`/`updateAutomation`/`runAutomationNow`/`listAgentSessions`，`:324-528`）。

## 5. 数据 I/O、读写与副作用

- 写（IPC）：create/update Automation、runAutomationNow、updateSettings 无（本文件不调）；读（IPC）：绑定/预设/列表/会话。
- 写（内存）：`automationsAtom`、form state、`agentSessionsAtom`。
- 副作用：toast；500ms 防抖定时器；竞态守卫（presetRequestIdRef `:282,:334-353`；persistInFlightRef 串行）。
- 幂等：签名去重（`:392-393`）；保存失败保留 dirty 语义（返回 null）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 草稿门槛 | name/prompt 空 | 70-73 | 不保存 |
| 运行门槛 | 缺 channelId/workspaceId | 76-78 | 禁用启用/运行，强制 active:false |
| 保存失败 | IPC reject | 420-427 | error 状态+toast，不抛 |
| 保存串行 | 前序未完 | 377-383 | 等待+继承 id |
| 切会话自动关 | activeSessionId 变 | 475-489 | 先存后关 |
| 名称空 | commitName | 570-575 | toast+保持编辑 |
| Escape 改名 | handleNameKeyDown | 584-587 | 回滚 live 名 |
| 运行失败 | runAutomationNow reject | 530-532 | toast「立即运行失败」 |
| 会话已删 | 历史跳转 | 553-556 | toast「该会话已不存在」 |

取消/恢复：无显式取消（保存不可撤销）；卸载清理定时器（`:360-366`）。

## 7. 权限与权威状态

- 权限模式即任务权限声明（`permissionMode`，`:1231-1256`）：bypassPermissions=完全自动（警示文案 `:1254`），auto=SDK 内置审批器（无人值守会挂起，`:1247`）。
- 预设权限不覆盖运行权限（`:1147` 文案，无人值守安全优先）。
- 无 sender/role 检查，依据：本文件无 Electron sender 校验；任务权威=主进程 Automation 存储。

## 8. 修改影响面

- 挂载点 2 处（PlanningWindowApp/MainArea）；草稿契约在 `automation-atoms`（`AutomationDraft` 17 字段签名 `:90-110`）。
- IPC 形状 Create/UpdateAutomationInput（`:112-154`）与主进程 schema 耦合；`scheduleType/timeOfDay/dayOfWeek/dayOfMonth` 多值语义与 scheduler 耦合（weekly/monthly 文案行为需同步）。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*`/`*.spec.*` 检索 `AutomationFormView` 0 命中）。间接证据：无（`recommendation-engine.test` 命中为 `refreshAutomationRecommendations` 子串误配，非本组件测试）。

未覆盖：自动保存串行、防抖、竞态守卫、四调度模式、飞书目标、运行历史跳转。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实 IPC。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 内部 14 组符号 | 已证实 | `:55-250` 逐行读 |
| 自动保存串行/签名/防抖 | 已证实 | `:374-464` |
| 运行/历史跳转/命名分支 | 已证实 | `:511-588` |
| 四调度模式+门槛+权限文案 | 已证实 | `:700-1256` |
| 挂载点 2 处 | 已证实 | §4 行号 |
| 主进程 scheduler 对 29-31 号短月兜底 | 未知 | 文案声明（`:975`），实现在 scheduler（非本批） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AutomationFormView` | §2-3 | 252-1324 | covered |
| 门槛/签名/IPC 入参 | §2, §3.2 | 70-154 | covered |
| 自动保存+竞态守卫 | §3.2 | 282-297, 374-464 | covered |
| 四调度模式 UI | §3.5 | 732-1042 | covered |
| 飞书/预设/权限/历史 | §3.5 | 1127-1296 | covered |
| 调用链 | §4 | - | covered |
| scheduler 短月实现 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
