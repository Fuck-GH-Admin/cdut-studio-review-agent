---
path: apps/electron/src/renderer/components/onboarding/FeatureTour.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12d89b3f09e3c1701b096b9b2c5119713a078c29
sha256: afbe78d8b5d1be32e1b5288cef3ff83de5cf98a6129afeecdc1048361ca560c9
lines: 198
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/FeatureTour.tsx

## 1. 结论与边界

**功能导览轮播组件**（198 行）：6 张特性卡片自动轮播（4s/张，最后一页停留）+ 手动翻页/键盘/圆点导航 + 交叉淡入过渡；onboarding 第 2 步（`OnboardingView` featureTour 阶段）。

边界：纯展示组件，无业务副作用（不调 electronAPI）；背景 WebGL 由 `IntroFluidBackground` 提供；文案数据 `FEATURE_TOUR_SLIDES` 静态常量。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `FeatureTour` | 导出函数组件 | 43-167 | `({onNext, onSkip, finishLabel}) => ReactElement` | 轮播主组件 |
| `FEATURE_TOUR_SLIDES` | 导出常量 | 198（定义 28-35） | `FeatureSlide[6]` | 卡片数据 |
| `FeatureSlide` | 内部接口 | 19-23 | `{title, summary, example}` | |
| `TOUR_INTERVAL_MS`/`TOUR_TRANSITION_MS` | 内部常量 | 25-26 | `4000`/`600` | 自动播放间隔/过渡时长 |
| `TourSlide` | 内部组件 | 169-196 | 单卡渲染 | CSS 类驱动进出场动画 |

导出计数：`export` 2 条（`:43`、`:198`），与源码一致。

## 3. 内部逻辑与关键流程

- 状态机：`activeIndex`/`pendingIndex`/`phase(idle|exiting|entering)`/`direction(1|-1)`（`:44-47`）。
- `navigate(nextIndex)`（`:51-56`）：过渡中或同页直接 return；设方向与 `pendingIndex`，`phase='exiting'`。
- 过渡 effect（`:70-85`）：exiting 600ms 后换 `activeIndex` 并转 entering；再 600ms 回 idle。
- 自动播放（`:87-92`）：仅 `phase==='idle'` 且非最后一页时 4s 后 `next()`（注释 `:88`：最后一页停留等用户，避免来不及看完）。
- `next()`（`:62-68`）：最后一页 → `onNext()`（交给父组件），否则 `navigate(activeIndex+1)`。
- 键盘（`:94-109`）：← 上一页；→/Enter/Space 下一页；Esc → `onSkip()`。
- 渲染（`:111-166`）：全屏 `section`（`-m-8` 撑满）；`IntroFluidBackground durationMs=18000 repeat` 一次挂载全程循环（注释 `:113`：翻页不重建/重播）；两层暗色 veil；顶栏跳过按钮（`:121-123`）；`TourSlide` key=`${activeIndex}-${phase}` 强制重挂实现交叉淡入（`:129`）；页脚上一步（首页 disabled）/6 圆点（`role="tablist"`）/主按钮（最后一页 `finishLabel` + Check 图标）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep FeatureTour|FEATURE_TOUR_SLIDES`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/onboarding/OnboardingView.tsx:26` import、`:122-126` featureTour 阶段渲染（`finishLabel="下一步：导入数据"`，`onNext`/`onSkip` 都进 migration 阶段）。
  - `apps/electron/scripts/dark-mode-guards.test.ts:25`：按**文件路径**列入「规则一文件级白名单」（`固定深色遮罩上的白色 CTA`）——样式守卫脚本测试，非行为测试（间接）。
- 出向：`IntroFluidBackground`（`:17`）、`@profer/ui/primitives/button`、`lucide-react` 图标、`@/lib/utils.cn`。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/持久化；副作用仅 DOM 事件监听（keydown）与定时器；无 electronAPI 调用。
- 背景 GPU 渲染由 `IntroFluidBackground` 承担（见该手册）。

## 6. 分支、失败、取消与恢复

- 过渡互斥：`isTransitioning`（`phase !== 'idle'`）时 `navigate` 直接 return（`:52`），翻页/圆点/按钮均 disabled。
- 定时器清理：每个 effect 返回 `clearTimeout`（`:76`、`:83`、`:91`）；卸载/翻页重置。
- 无错误路径（纯展示）；无取消概念。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 electronAPI 调用；数据为静态常量。

## 8. 修改影响面

- 消费方：`OnboardingView.tsx:122-126`（props 契约 `onNext/onSkip/finishLabel`）。
- `FEATURE_TOUR_SLIDES` 被导出（`:198`），全冻结树检索无其他消费者（仅 dark-mode-guards 白名单按路径引用文件本身）。
- `dark-mode-guards.test.ts:25` 白名单绑定本文件「白色 CTA」设计；改 CTA 颜色需同步该守卫。
- CSS 类 `feature-tour-*`（`veil`/`slide`/`slide-incoming`/`slide-outgoing`/`forward`/`backward`/`kicker`/`title`/`summary`/`example`）在样式表定义（域外），改名需同步。

## 9. 测试证据

- 直接测试：**无**（检索范围：冻结树 `*.test.ts(x)` 引用；`dark-mode-guards.test.ts` 仅路径白名单，断言是样式守卫）。
- 间接证据：`dark-mode-guards.test.ts`（11 test/it，NOT_RUN）对本文件仅「白色允许」规则条目。
- 未覆盖：自动播放时序、过渡互斥、键盘导航、finishLabel 行为。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与 6 卡片数据 | 已证实 | `:28-35`、`:43`、`:198` |
| 最后一页不自动播放 | 已证实 | `:87-92` |
| 过渡互斥 600ms×2 | 已证实 | `:51-56`、`:70-85` |
| Esc→onSkip、→/Enter/Space→next | 已证实 | `:94-109` |
| 背景 18s 循环不重挂 | 已证实 | `:113-114` |
| dark-mode-guards 白名单为路径级间接 | 已证实 | `dark-mode-guards.test.ts:25` |
| CSS 动画实际表现 | 未知 | 样式表域外 + NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `FeatureTour` 主体/状态机 | §3 | 43-167 | covered |
| 自动播放/键盘 | §3/§6 | 87-109 | covered |
| `TourSlide` 渲染 | §3 | 169-196 | covered |
| `FEATURE_TOUR_SLIDES` | §2/§4 | 28-35,198 | covered |
| CSS 进出场动画 | §10 | — | unknown |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
