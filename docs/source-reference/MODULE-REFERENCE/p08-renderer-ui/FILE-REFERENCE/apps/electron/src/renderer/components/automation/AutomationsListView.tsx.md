---
path: apps/electron/src/renderer/components/automation/AutomationsListView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f79a796bdea6915f0251d748416f8c87e02c3d52
sha256: 7aee50fb133b0065b08fd487a7e1f31f7ab5067e77345cd7a3c62863f238e233
lines: 346
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/automation/AutomationsListView.tsx

## 1. 结论与边界

定时任务列表视图（渲染层运行时，Codex Automations 风格）：分组列表（启用中/已暂停），行内快捷操作（立即运行/删除/暂停启用），顶部建议卡片，点击行开编辑 overlay（文件头 `apps/electron/src/renderer/components/automation/AutomationsListView.tsx:1-12`）。页标题与「+ 新建」由规划中心提供（`:7`）。

边界：表单在 `AutomationFormView`；建议在 `AutomationRecommendations`；调度/删除经 IPC；预设名称只做 badge 展示。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（`AutomationsListView`），其余内部。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AutomationsListView` | 函数/组件（导出） | 68-151 | `({embedded = false} = {}) => React.ReactElement` | 列表主组件 |
| `ScheduleText` | 接口（内部） | 32-35 | `{summary, detail?}` | |
| `formatSchedule` | 函数（内部） | 40-66 | `(a: Automation) => ScheduleText` | 调度文案 |
| `Section` | 组件（内部） | 163-321 | 分组（含行操作） | §3.3 |
| `EmptyState` | 组件（内部） | 323-346 | 空状态+新建按钮 | |

## 3. 内部逻辑与关键流程

### 3.1 数据装载（`:74-111`）

预设名映射：按任务工作区 slug 逐个 `listAgentPresets` 合并（`cancelled` 防竞态，`:77-97`）；`refreshList` 并行 `listAutomations`+`refreshRecommendations`（`:99-106`）；挂载即刷新并订阅 `onRecommendationsChanged`（`:108-111`）。

### 3.2 `formatSchedule`（`:40-66`）

timeOfDay 兼容单值/数组（默认 `['09:00']`，`:41-42`）；daily「每天 …」（多时刻显示 N 个时刻，`:43-47`）；weekly 星期名拼接（`dayOfWeek` 兼容标量，`:48-54`）；monthly 日期（>3 显示 N 个日期 + 短月后缀「短月落在最后一天」，`:55-61`）；interval 分钟→分钟/小时/天三档（`:62-65`）。

### 3.3 `Section` 行（`:163-321`）

- `isRunnable = channelId && workspaceId`（`:165`）。
- `handleRunNow`（`:167-183`）：不可运行→toast+开编辑；否则 toast 开始运行+`runAutomationNow`（失败 toast「运行失败」）。
- `handleToggle`（`:185-201`）：启用前必须 isRunnable，否则 toast+开编辑（`:188-192`）；`toggleAutomation` 成功 toast 已暂停/已启用。
- `handleDelete`（`:203-214`）：`window.confirm` 确认后 `deleteAutomation`（成功 toast 已删除）。
- 行容器 `div role="button" tabIndex=0`（避免嵌套 button 非法 HTML，键盘 Enter/Space 可达，`:221-233`）；右侧固定宽槽位只切透明度防跳动（`:252-266`）；hover 显示运行/删除（`:267-294`）；暂停/启用按钮（`:296-315`）。
- 新建自动命名「定时任务 N」：现有匹配 `^定时任务\s*(\d+)$` 最大+1（`:116-126`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`planning/PlanningView.tsx:9,152`（`tab==='automations'` 时 `<AutomationsListView embedded/>`）。唯一调用方。

出向：`AutomationRecommendations`（`:19,135`）、`@/atoms/automation-atoms`（`:23-28`）、`@/atoms/agent-atoms`（`:22`）、`@profer/shared` 类型、`window.electronAPI`（`listAgentPresets`/`listAutomations`/`refreshRecommendations`/`onRecommendationsChanged`/`runAutomationNow`/`toggleAutomation`/`deleteAutomation`，`:85-207`）。

## 5. 数据 I/O、读写与副作用

- IPC 读写：任务列表/建议/预设名、运行/切换/删除；内存：`automationsAtom`、`automationFormAtom`、组件 state。
- 副作用：toast、`window.confirm`（`:205`）、事件订阅退订（`:110`）。
- 并发：`cancelled` 标志（`:78,96`）；`refreshList` 并行双请求（`:100-103`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 空列表 | automations 空 | 136-137 | EmptyState |
| 运行/启用门槛 | !isRunnable | 169-172, 188-192 | toast+开编辑 |
| 删除确认 | window.confirm=false | 205 | 中止 |
| IPC 失败 | 各 reject | 180-181, 198-199, 211-212 | toast+console.error |
| 分组隐藏 | current/paused 空 | 140-145 | 不渲染该组 |

无恢复/重试概念，依据：操作一次性，失败由用户重试。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；任务权威=主进程 Automation 存储；删除用 `window.confirm` 作为用户确认（非安全权限）。

## 8. 修改影响面

- 唯一调用方 PlanningView:152；子组件 AutomationRecommendations。
- 调度文案 `formatSchedule` 与 scheduler 语义耦合（短月后缀 `:59` 与 FormView 提示一致）。
- 自动命名正则与既有命名耦合（`:120`）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `AutomationsListView` 0 命中。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实 IPC。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 内部 4 组件/函数 | 已证实 | `:32-346` 逐行读 |
| formatSchedule 四模式文案 | 已证实 | `:40-66` |
| 三操作门槛与失败路径 | 已证实 | `:167-214` |
| 唯一调用方 | 已证实 | `PlanningView.tsx:9,152` |
| scheduler 短月实际执行 | 未知 | 非本批（文案仅提示） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AutomationsListView` | §2-3.1 | 68-151 | covered |
| `formatSchedule` | §3.2 | 40-66 | covered |
| `Section` 三操作+可访问性 | §3.3 | 163-321 | covered |
| `EmptyState`/自动命名 | §3.3 | 116-126, 323-346 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
