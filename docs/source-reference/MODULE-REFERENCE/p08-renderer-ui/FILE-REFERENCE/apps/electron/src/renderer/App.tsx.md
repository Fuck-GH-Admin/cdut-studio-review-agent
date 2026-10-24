---
path: apps/electron/src/renderer/App.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 40c108e8bfbaa12f3b44872a32172523e12a2a53
sha256: e7a71f9dce5f5a3fb35fc0418771b11f2f8c54e9b1ad72c206a161493cd33e6e
lines: 219
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/App.tsx

## 1. 结论与边界

主窗口 React 根组件：初始化门（Onboarding/欢迎导览接力判定）、懒加载对话框装配、AppShell 主界面挂载与全局浮层（开屏重放/教练导览/环境检测/公告）（`apps/electron/src/renderer/App.tsx:26-135`）。

边界：不管理会话/标签数据（jotai atoms 与 AppShell）；不做环境检测执行（只挂 Dialog）；初始化只读 settings 决定首次 Onboarding/导览。

## 2. 导出与关键符号

`export` 逐条核对：1 个（`export default` 函数；类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `App`（default） | 函数（导出） | 26-135 | `() => React.ReactElement` | 根组件 |
| `OnboardingView`/`EnvironmentCheckDialog`/`MigrationImportDialog`/`SettingsDialog`/`BulletinDialog` | 内部（React.lazy） | 20-24 | 懒加载组件 | 减少首屏 JS 解析量（`:19`） |
| `OnboardingRoute` | 内部组件 | 144-174 | Onboarding 包装（注释 `:140-142`：`useCreateSession` 收敛到子树防 App 根高频重渲染） | 完成/跳过/开教程分支 |
| `IntroReplayOverlay` | 内部组件 | 182-203 | `replayIntroOpenAtom` 驱动开屏水波重放 | onDone 接力欢迎导览 |
| `GlobalEnvironmentCheckDialog` | 内部组件 | 208-211 | `environmentCheckDialogOpenAtom` 驱动 | 错误卡片 recovery 打开（`:206`） |
| `BulletinStartupTrigger` | 内部组件 | 216-219 | `useBulletinStartupTrigger()` 消费 | 无渲染组件（含导览排定竞态保护，`:214`） |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/App.tsx:35-54`（初始化 effect，仅跑一次）：`window.electronAPI.getSettings()`：

1. `!settings.onboardingCompleted` → `setShowOnboarding(true)`（`:39-40`）；
2. 否则 `(settings.coachTourVersion ?? 0) < CURRENT_COACH_TOUR_VERSION` → `setTimeout(800ms, store.set(coachTourOpenAtom, true))`（注释 `:42-43`：版本化接力，含升级后老用户，等主界面首帧稳定自动播一次，退出写版本不重复）；
3. catch `console.error('[App] 初始化失败:')`；finally `setIsLoading(false)`。

`notifyRendererReady` effect（`:57-59`）：`!isLoading` 时调用——等 React 真正提交“正在初始化...”后才允许主进程撤原生启动屏（防白屏）。

渲染分支：`isLoading` → 全屏 spinner「正在初始化...」（`:67-76`）；`showWelcomeTourReplay` → `OnboardingRoute persistCompletion={false}` + MigrationImportDialog（`:80-92`，replay 不改 onboardingCompleted）；`showOnboarding` → OnboardingRoute + MigrationImportDialog（`:95-109`）；否则主界面（`:111-134`）：`contextValue = {}`（AppShellContext 占位，`:112`）+ `<AppShell contextValue>` + PlanningReminderRail + SettingsDialog（lazy）+ TutorialBanner + GlobalEnvironmentCheckDialog + MigrationImportDialog + IntroReplayOverlay + CoachTourOverlay + BulletinStartupTrigger + BulletinDialog。

`OnboardingRoute.handleComplete`（`:152-165`）：`onExit` → `openTutorialTab(store)`；`onOpenTutorial` → `createAgent()` 成功后 `setTimeout(600ms, coachTourOpenAtom=true)`（注释 `:158-162`：等工作区装载），失败 console.error（`:164`）。

`IntroReplayOverlay`（`:182-203`）：`IntroWaterRipple onDone` → `setOpen(false)` + `setShowWelcomeTourReplay(true)`（注释 `:197`：接力首次欢迎导览，不触碰 onboardingCompleted）。

## 4. 调用者与调用链

入向：`apps/electron/src/renderer/main.tsx:19`（`import App from './App'`）、`main.tsx:1143`（主窗口树挂载 `<App />`）。无测试引用（见 §9）。

出向：`./components/app-shell/AppShell`、`./components/planning/PlanningReminderRail`、`./components/tutorial/TutorialBanner`、`./components/onboarding/{IntroWaterRipple,OnboardingView,coach-tour/CoachTourOverlay,coach-tour/coach-tour-steps}`、`./components/environment/EnvironmentCheckDialog`、`./components/migration/MigrationImportDialog`、`./components/settings/SettingsDialog`、`./components/bulletin/BulletinDialog`、`./hooks/{useCreateSession,useBulletinStartupTrigger}`、`./lib/tab-activation`（`openTutorialTab`）、`./atoms/{environment,intro-atoms,coach-tour-atoms}`、`./contexts/AppShellContext`（类型）、`@profer/ui`（`Z_LAYER`）、`window.electronAPI.{getSettings,notifyRendererReady}`。

## 5. 数据 I/O、读写与副作用

- 读：IPC `getSettings()`（一次）；写：无磁盘。
- 副作用：IPC `notifyRendererReady()`（`:58`，撤原生启动屏信号）；`setTimeout`×2（800ms 导览排定、600ms 导览接力）；coachTourOpenAtom/replayWelcomeTourAtom 等 atom 写入。
- 并发：初始化 effect 空依赖数组单次执行；导览排定有竞态保护（`useBulletinStartupTrigger` 注释 `:214`）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| onboarding 未完成 | 39-40 | 显示 Onboarding |
| 导览版本偏低 | 41-44 | 800ms 后自动开导览 |
| getSettings 失败 | 46-47 | console.error，直接进主界面（finally 关 loading） |
| replay 中 | 80-92 | Onboarding（persistCompletion=false） |
| createAgent 失败 | 163-165 | console.error（导览不排定） |

- 恢复：初始化失败不重试（用户手动走设置）；无不可恢复点。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查；settings 权威在主进程（getSettings）。`onboardingCompleted`/`coachTourVersion` 是设置权威字段（App 只读判定，写入在 Onboarding/导览退出链路）。

## 8. 修改影响面

- 改初始化判定影响首启/升级用户路径（Onboarding/导览接力）。
- 改 contextValue 形状与 `AppShell.tsx:45,216` 联动；改浮层装配影响全局可见 UI。
- `notifyRendererReady` 时序与主进程启动屏撤除耦合（改 loading 语义需同步）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `App.tsx` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`coach-tour-steps`（版本常量）无测试。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：初始化三分支、导览接力时序、notifyRendererReady 时机均无自动化断言。维护者验证：清 settings 重进看 Onboarding；改 coachTourVersion 看导览自动播放。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出（default） | 已证实 | 全文 `export` 逐条核（仅 `:26`） |
| 初始化三分支 | 已证实 | `:35-54` |
| notifyRendererReady 等提交后才发 | 已证实 | `:56-59` |
| replay 不触碰 onboardingCompleted | 已证实 | `:87,197` |
| contextValue 恒 `{}` | 已证实 | `:112` |
| 唯一挂载点 main.tsx | 已证实（检索） | `main.tsx:19,1143` |
| 主进程启动屏撤除实现 | 未知 | 文件外 |
| 真实首启表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 初始化 effect | §3,§6 | 35-54 | covered |
| notifyRendererReady | §3,§5 | 56-59 | covered |
| 渲染分支（loading/replay/onboarding/主界面） | §3 | 67-134 | covered |
| `OnboardingRoute` | §3 | 144-174 | covered |
| `IntroReplayOverlay` | §3 | 182-203 | covered |
| `GlobalEnvironmentCheckDialog`/`BulletinStartupTrigger` | §2,§3 | 206-219 | covered |
| 测试 | §9 | — | unknown |
