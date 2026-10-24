---
path: apps/electron/src/renderer/components/onboarding/OnboardingView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 300a16626aa04a5593963b0c82520ac71a696b70
sha256: 65df549b01d006c5303d3289e90f1fb3768b53d95712f59b4c7c99122b995a03
lines: 290
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/OnboardingView.tsx

## 1. 结论与边界

**首次启动引导视图**（290 行）：六阶段流程——intro 开屏水波纹 → welcome 欢迎 → featureTour 功能导览 → migration 数据导入指引 → poetry 诗意插页 → ready 品牌收尾；完成时写 `onboardingCompleted` 并创建一条示例日程（幂等）。

边界：迁移对话框本体在 `migration-atoms`/`MigrationImportDialog`（域外）；环境检测页已移除（注释 `:14-15`：Windows 执行环境静默自适应，自检入口在「设置→关于」）；测试重放路径 `persistCompletion=false` 不写完成态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OnboardingView` | 导出函数组件 | 41-196 | `({onComplete, initialStep='intro', persistCompletion=true})` | 唯一导出 |
| `OnboardingStep` | 内部类型 | 28 | `'intro'\|'welcome'\|'featureTour'\|'migration'\|'poetry'\|'ready'` | 阶段枚举 |
| `POETRY_INTERLUDE_MS` | 内部常量 | 39 | `4200` | 诗意插页停留 |
| `PoetryInterlude` | 内部组件 | 204-266 | 诗意整屏 | 自动 4.2s/点击/按键跳过 |
| `WelcomeFinale` | 内部组件 | 269-290 | 品牌收尾 | 进入主界面按钮 |
| `handleFinish` | 内部函数 | 49-73 | `async (openTutorial?) => void` | 完成副作用（§3） |
| `handleOpenMigration` | 内部函数 | 75-77 | 打开迁移对话框 | `migrationImportDialogOpenAtom` |

导出计数：`export` 1 条（`:41`），与源码一致。

## 3. 内部逻辑与关键流程

- **handleFinish**（`:49-73`，`persistCompletion` 为真时）：
  1. 读 `getSettings()`；若 `!settings.onboardingCompleted`：`listCalendarEvents()` 检查无标题为「随便安排的一件事」的日程则 `createCalendarEvent` 创建**全天示例日程**（今天 0 点，notes「首次引导中的示例日程，没有实际安排。」，`:54-65`）；失败仅 console.error 不阻断（`:66-68`）。
  2. `updateSettings({ onboardingCompleted: true })`（`:70`）。
  3. `onComplete(openTutorial)`。
- **阶段流转**：intro（`IntroWaterRipple.onDone`→welcome，`:86-93`）→ welcome（按钮→featureTour，`:108`）→ featureTour（`FeatureTour` `onNext`/`onSkip` 均→migration，`:121-127`）→ migration（两个入口按钮都开迁移对话框，`:140-173`；「继续」→poetry，`:178`）→ poetry（`PoetryInterlude`→ready，`:191`）→ ready（`WelcomeFinale.onEnter`→`handleFinish()`，`:193`）。
- **PoetryInterlude**（`:204-266`）：`doneRef` 一次性闩；4200ms 自动完成 + 点击 + 键盘（Enter/Space/→/Esc，`:217-226`）；`IntroFluidBackground durationMs=6000`；王勃《送杜少府之任蜀州》诗句渐变文字（`:247-258`）。
- **props 语义**：`initialStep` 供主界面测试入口从指定阶段重放（`:32-33`）；`persistCompletion=false` 时不写任何设置（App.tsx 重播路径用，`App.tsx:79-90`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep OnboardingView|onboardingCompleted`，apps+packages 全类型）：
  - `apps/electron/src/renderer/App.tsx:20` lazy import；`:84-90` 重播路径（`initialStep="welcome"`, `persistCompletion=false`）；`:173` 首次路径 `<OnboardingView onComplete={handleComplete} />`（`OnboardingRoute` 内）。
  - 设置侧：`settings.ts:258`（`coachTourVersion` 旁的 `onboardingCompleted` 字段定义域外同文件）、`settings-service.ts`（默认值/读取）。
  - `intro-atoms.ts`（`replayWelcomeTourAtom` 重播触发态）。
- 出向：`IntroWaterRipple`/`IntroFluidBackground`/`FeatureTour`（同批）、`@/atoms/migration-atoms`（`:23`）、`window.electronAPI.getSettings/updateSettings/listCalendarEvents/createCalendarEvent`（`:51-70`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：settings（`onboardingCompleted`）与日历（示例日程）经 electronAPI（主进程持久化）。
- 读：settings、日历事件列表。
- 副作用：创建示例日程（幂等由标题查重保证，`:56`）；console.error 兜底。
- 无网络。

## 6. 分支、失败、取消与恢复

- 示例日程创建失败：catch 后仅记日志，仍写 `onboardingCompleted`（`:66-70`）——完成态不因日历失败回退。
- `persistCompletion=false`：跳过全部副作用（`:50` 分支）。
- PoetryInterlude 一次性闩防重复 onDone（`:205-210`）；4.2s 定时器与键盘监听均 cleanup（`:212-226`）。
- 无取消/恢复概念（线性流程；阶段切换即丢弃前阶段状态）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；electronAPI 调用为通用设置/日历接口（无鉴权参数）。
- 权威状态：`onboardingCompleted`（settings，主进程持久化）决定 App 是否进入主界面（`App.tsx:39-41`）。

## 8. 修改影响面

- `App.tsx` 两个渲染路径（首启/重播）；props 契约 `onComplete/initialStep/persistCompletion`。
- `onboardingCompleted` 字段（`@/types/settings`）与 `settings-service` 默认值。
- 示例日程标题「随便安排的一件事」是幂等键（改名会导致重复创建）。
- 阶段组件（FeatureTour/IntroWaterRipple/IntroFluidBackground 同批手册）。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树 `*.test.ts(x)` 引用（`OnboardingView|onboardingCompleted`）0 命中。
- 间接证据：无。
- 未覆盖：六阶段流转、handleFinish 幂等、poetry 跳过、persistCompletion 两态。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出、六阶段流转 | 已证实 | `:28`、`:79-195` |
| handleFinish 幂等示例日程+写完成态 | 已证实 | `:49-73` |
| 日历失败不阻断完成 | 已证实 | `:66-70` |
| persistCompletion=false 无副作用 | 已证实 | `:50`、`App.tsx:79-90` |
| poetry 4.2s/点击/按键三跳过 | 已证实 | `:204-226` |
| 环境检测页已移除（自检移设置） | 已证实 | `:14-15` 注释（实现面域外） |
| settings 默认值/持久化行为 | 推断 | 依赖 settings-service（域外） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `OnboardingView` 阶段机 | §3 | 41-196 | covered |
| `handleFinish` | §3/§5 | 49-73 | covered |
| `PoetryInterlude` | §3 | 204-266 | covered |
| `WelcomeFinale` | §3 | 269-290 | covered |
| 消费者/props 契约 | §4/§8 | — | covered |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
