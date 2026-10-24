---
path: apps/electron/src/renderer/components/onboarding/coach-tour/CoachTourOverlay.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a2243d812fdb5ce2345428d20a269ae1895c3899
sha256: da8d3a847ca711f26c58fd2828d2bf09dbd7d3cf69831aa22d6ef0830af74c3b
lines: 578
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/CoachTourOverlay.tsx

## 1. 结论与边界

**界面蒙层引导引擎**（578 行）：按 `COACH_TOUR_STEPS`（22 步）播放聚光灯+气泡引导——rAF 跟踪锚点、视图/子页面切换、等待型/点击型/轮播型前进、键盘（Esc/←/→/Tab 困锁）、跨窗口单例锁、reduced-motion 适配；关闭时写 `coachTourVersion`。

边界：步骤数据在 `coach-tour-steps.ts`、几何在 `coach-tour-position.ts`、准备动作在 `coach-tour-runner.ts`、业务等待在 `coach-tour-wait.ts`、单例锁在 `coach-tour-owner.ts`（均同批手册）；触发方（版本化接力/按钮）在 `App.tsx`/`TabBar`/`GeneralSettings`/`useBulletinStartupTrigger`（域外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CoachTourOverlay` | 导出函数组件 | 110-544 | `(): ReactElement \| null` | 唯一导出（App 顶层挂载） |
| `CaptureAround` | 内部组件 | 550-577 | 交互步骤镂空挡板 | 四块惰性区域拦误点 |
| `collectVisibleRects` | 内部函数 | 47-57 | `(selector) => AnchorRect[]` | 可见非零元素矩形 |
| `findStepRect` | 内部函数 | 60-69 | `(step) => AnchorRect \| null` | unionSelectors 外接矩形或首个可见 |
| `trapTabKey` | 内部函数 | 72-92 | Tab/Shift+Tab 困锁气泡内 | |
| `clampFrameToViewport` | 内部函数 | 99-108 | 聚光灯几何钳制进视口 | 防顶满窗口锚点白圈缺边 |
| `FALLBACK_CARD_SIZE`/`MOVE_TRANSITION` | 内部常量 | 43-44 | 320×190 / 0.32s 位移动画 | |

导出计数：`export` 1 条（`:110`），与源码一致。

## 3. 内部逻辑与关键流程

- **状态与派生**（`:111-160`）：`stepIndex`/`rect`/`pulseRects`/`cardSize`（layout effect 实测收敛，`:316-324`）；`restoreViewRef`（进入前视图）、`advanceTimerRef`（防连点跳步）；`interactive = advanceOn==='click-anchor' && rect && prepareReady`（`:155-156`）；`requiresInteraction = prepare||waitFor||passthrough||click-anchor`（`:158-160`）。
- **打开/关闭**（`:163-181`）：打开回到第一步并记录当前 `activeView`；`close()` 恢复视图（`restoreViewOnExit !== false` 时，`:174-176`）+ `updateSettings({coachTourVersion: CURRENT_COACH_TOUR_VERSION})`（`:178-180`，失败 console.error）；`finish()`=close+toast（`:184-187`）。
- **跨窗口单例**（`:191-200`）：`claimCoachTourOwnership(() => close())`；抢锁失败 toast「另一个窗口正在播放界面引导」并 close（同正常退出路径，注释 `:189-190`）；cleanup `claim.release()`。
- **前进机制**（`:202-260`）：`next/previous`；等待型 `wait.status==='done'` 后 600ms 沉降自动前进（`:214-218`）；轮播型 `autoAdvanceMs`（非 wait 步骤、ready 后，`:221-226`）；交互型 capture 阶段侦测锚点镂空区真实点击（padding 14=聚光灯 8+容差，`:241-256`），`settleMs ?? 350` 后前进（`advanceTimerRef` 防重入）；切步/退出清未触发定时器（`:229-236`）。
- **视图/子页面切换**（`:271-284`）：步骤声明 `view`/`cdutSubView` 时切 `activeViewAtom`/`cdutSubViewAtom`（null=退出子页面）。
- **rAF 锚点跟踪**（`:288-313`）：每帧 `findStepRect`+pulse 矩形，key 未变不 setState（注释 `:286-287`）。
- **键盘**（`:333-351`）：Esc=close、→=next、←=previous、Tab=`trapTabKey`；切步聚焦气泡（`:327-330`）。
- **WebContentsView 让位**（`:132-136`）：`useGlobalOverlay(open && !isYanhuStep)`——播放期隐藏原生网页视图，**例外 yanhu 步骤**（`cdutSubView==='yanhu-express'`）让桌宠网页正常呈现（注释 `:133-134`：离开该步 HIDE_VIEW 兜底释放）；桌宠步骤 cleanup `petTourRelease()`（`:263-268`）。
- **渲染**（`:363-543`）：portal 到 body；纯讲解步骤整屏点击捕获层（`onClick=next`，无锚点时加 `bg-black/55`，`:366-372`）；交互步骤 `CaptureAround` 四块挡板（`:550-577`，镂空区真实点击/悬停原样生效）；pulse 光圈（`:378-393`）；聚光灯 box-shadow 9999px 巨影镂空+钳制（`:397-411`）；气泡（`role="dialog"` `aria-modal`，`:429-540`）含进度/标题/正文/交互提示/runner 与 wait 状态文案（preparing/error/waiting/timeout，`:474-491`）/`demo-digitize` 专属按钮（dispatch `cslab:demo-digitize` CustomEvent，`:494-505`）/步骤点/上一步/下一步或「跳过本步」（交互步骤，`:529-537`）。
- **reduced-motion**（`:355-360`）：`prefers-reduced-motion` 时 transition='none' 且不加动画类（`:438`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep CoachTourOverlay|coachTourOpenAtom`，apps+packages 全类型）：
  - `apps/electron/src/renderer/App.tsx:13` import、`:128` 顶层挂载 `<CoachTourOverlay />`；`:44`（首启后 800ms 自动开播接力）与 `:165`（另一路径 600ms）`store.set(coachTourOpenAtom, true)`。
  - `useBulletinStartupTrigger.ts:14-15,31-87`：600ms 时检查 `settings.coachTourVersion < CURRENT_COACH_TOUR_VERSION` 与公告竞态协调（注释 `:7-8`）。
  - `TabBar.tsx:45,612`、`GeneralSettings.tsx:26,42`：顶栏/设置「界面引导」按钮置 `coachTourOpenAtom`。
  - `coach-tour-atoms.ts`：`coachTourOpenAtom = atom(false)` 纯会话内状态（不持久化）。
- 出向：同批 `coach-tour-steps/position/owner/runner/wait`；jotai atoms（activeView/cdutSubView/cdutAccount/cslabAuth/agent streaming）；`window.electronAPI.updateSettings/yanhuExpress.petTourRelease`；`useGlobalOverlay`（`@/atoms/overlay-atoms`）；`@profer/ui` 的 `Z_LAYER`/`Button`。

## 5. 数据 I/O、读写与副作用

- 磁盘写：`updateSettings({coachTourVersion})`（close 时）；其余无持久化（`coachTourOpenAtom` 会话内）。
- 副作用：视图/子页面 atom 切换；`useGlobalOverlay` 隐藏原生网页视图（yanhu 例外）；`petTourRelease`；`cslab:demo-digitize` CustomEvent；toast；rAF/定时器/keydown/click capture 监听。
- 渲染状态是纯 UI（矩形/尺寸测量）。

## 6. 分支、失败、取消与恢复

- 抢锁失败→让位 close（`:194-197`）；持有中被抢→`onLost`→close（owner 内部）。
- runner 失败（`phase==='error'`）：气泡显示错误文案（`:480-482`），不自动退出（runner 侧 toast.error）。
- wait 超时：`wait.status==='timeout'` 显示「等待超时，可点击下一步继续」（`:489-491`，文案在 coach-tour-wait），**不自动关闭引导**。
- 锚点缺失：气泡居中降级（position 层），不阻断；交互步骤锚点缺失降级为手动「跳过本步」入口（`:529-537`）。
- 取消：close/Esc/× 同一路径（恢复视图+写版本+释放锁）；所有 effect 均 cleanup（rAF/定时器/监听器）。
- 重启恢复：`coachTourVersion` 持久化决定下次启动是否自动重播（`App.tsx:43-44`）。

## 7. 权限与权威状态

- 无 sender/role 检查；引导期间视图切换是 UI 级行为。
- 权威状态：`settings.coachTourVersion`（主进程持久化）与 `CURRENT_COACH_TOUR_VERSION`（步骤数据）比较决定自动重播；`coachTourOpenAtom` 为会话内触发态。

## 8. 修改影响面

- 挂载点 `App.tsx:128`；触发方 `TabBar`/`GeneralSettings`/`useBulletinStartupTrigger`。
- 步骤数据/几何/runner/wait/owner 五个同批模块的契约。
- `useGlobalOverlay` 与 yanhu 例外逻辑联动（改动影响原生网页视图显隐与桌宠保活）。
- 测试：**无专属测试**（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：同批 `coach-tour-position.test.ts`（12 test）/`coach-tour-wait.test.ts`（13 test）/`coach-tour-steps.test.ts`（6 test）覆盖引擎的几何/等待/数据层纯函数，不覆盖本组件交互与渲染。
- 未覆盖：聚光灯跟踪、点击捕获、键盘、单例锁集成、版本写入。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+内部五工具 | 已证实 | `:47-108`、`:110` |
| 三类前进机制（wait/轮播/交互） | 已证实 | `:214-260` |
| 超时不自动关闭、错误不自动退出 | 已证实 | `:480-491` |
| 跨窗口单例锁集成 | 已证实 | `:191-200` |
| close 写 coachTourVersion | 已证实 | `:178-180` |
| yanhu 步骤不隐藏原生视图 | 已证实 | `:132-136` |
| CaptureAround 镂空交互 | 已证实 | `:550-577` |
| 无专属测试 | 已证实 | 全冻结树检索（§9 范围） |
| 运行时渲染/交互 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 状态/派生/interactive 判定 | §3 | 111-160 | covered |
| 打开/关闭/finish/版本写入 | §3/§6 | 163-187 | covered |
| 单例锁 | §3/§6 | 191-200 | covered |
| 三类前进+定时器清理 | §3 | 202-260 | covered |
| 视图/子页面切换 | §3 | 271-284 | covered |
| rAF 跟踪/尺寸收敛/键盘 | §3 | 288-351 | covered |
| 渲染层（捕获/聚光灯/气泡/按钮） | §3 | 363-543 | covered |
| `CaptureAround` | §3 | 550-577 | covered |
| 运行/交互行为 | §10 | — | unknown（NOT_RUN） |
