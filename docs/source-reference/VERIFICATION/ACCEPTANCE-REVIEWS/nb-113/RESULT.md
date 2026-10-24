# NB-113 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05）

**对象**：p08.components-misc 18 文件/3919 行 + 18 手册/1216 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-422fb49f69f039a1`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**，5 条 minor 备注（N-01~N-05）不阻断。18 篇全部可按 exact hash 合入。

## 核验摘要

- **G0**：链一致、ZIP 21 条目 0 mismatch、18/18 源绑定独立实算；机械核 test( 10+2。
- **G2（全文件）**：18 源 3919 行逐行 + 18 手册逐篇；独立基线 `reviews/nb-113/SOURCE-CHECKLIST.md`。
- **准确面**：视口契约回退语义、路径归一（含 cdutai 修复）、气泡钳制/避让算法（10 测试断言逐条吻合）、preview-opener 三不变量（不插 Tab/只读/归属门禁）、快捷键九注册+浮窗优先关闭链、时钟锚点纯推导、ScratchPad 死循环规避/粘贴自管、导航七段路由+capture、迷你地图触屏状态机、Shiki 节流矩阵/清洗白名单/媒体解析链。**两篇手册主动照实记录注释-实现差异**（cdutai 正则不一致、53 列 vs WEEKS=26）——证据纪律优秀。

## Findings（均 minor）

| id | 范围 | 摘要 |
| --- | --- | --- |
| N-01 | 全 18 篇 frontmatter | `reviewer: p03-integrations` 模板残留 |
| N-02 | GlobalShortcuts.tsx.md | "8 个"→实 9 |
| N-03 | preview-opener.tsx.md | "5 导出"→实 6；`revoekd` 笔误 |
| N-04 | markdown-preview-extensions.tsx.md | "11 导出"→实 10 |
| N-05 | 两测试手册 | 重复 §4 编号 |

## 合入（18 篇 accepted）

| manual（…/renderer/components/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/renderer/components/diff/diff-scroll.css.md` | `17570ac71774cf4876774c456b92e219099be8ec1ff7a4809c286cf42fb228cb` |
| `apps/electron/src/renderer/components/diff/markdown-preview-extensions.tsx.md` | `952788fd7d4ea049610378d9f696d7c7a128cb88fa3110a4890c64b1d44712a6` |
| `apps/electron/src/renderer/components/diff/preview-open-path.test.ts.md` | `5462caabf56b5701154472eee24888bc141cae4c9589af28fd7db87261b16f71` |
| `apps/electron/src/renderer/components/diff/preview-open-path.ts.md` | `d01210fedd1e4b1e36e381de53969431cbc9d67f66b7be8b5225c9d8c8463c5e` |
| `apps/electron/src/renderer/components/diff/preview-opener.ts.md` | `05d88c6e5aa7ac717aa00cc79a703311dc433dd9e020ca9c2f34b9bf464d2ad5` |
| `apps/electron/src/renderer/components/diff/preview-viewport-context.ts.md` | `49b1260d0b87f9a0e04febd664f0443aea829488923d24466a96a8d009dc1c4d` |
| `apps/electron/src/renderer/components/navigation/NavigationInputProvider.tsx.md` | `83791705a86a14f483ff845a0851256e178d2da77545e50c897533d31b491748` |
| `apps/electron/src/renderer/components/scratch-pad/ScratchPadView.tsx.md` | `570790cc7cf90b1d290659f1436e6fde35f2545f3301d2ab862d9e52528f5e50` |
| `apps/electron/src/renderer/components/selection/SelectionActionPopover.test.ts.md` | `3a0ed7be92d8091562983d9813f96c61aa13276f0651a2892b63be406576726f` |
| `apps/electron/src/renderer/components/selection/SelectionActionPopover.tsx.md` | `414bb54b19135a6391113ef1bf33c7bab4e604a57f03df1f1235dc0f3d1ce131` |
| `apps/electron/src/renderer/components/session-preview/SessionMiniMapPopover.tsx.md` | `9286ef0976505ef3006ee2dd00d56e308ddfbbbc2d0e43f63681e892a7842257` |
| `apps/electron/src/renderer/components/shortcuts/GlobalShortcuts.tsx.md` | `cc80e069c0b12d90997d50d0555c6e61e0492d4c15f2ea4dae172450375ece9d` |
| `apps/electron/src/renderer/components/shortcuts/ShortcutKeycaps.tsx.md` | `a72a6b048ba707435b13197db69553c5756b6327160be6d5e9a0d551c84dcf97` |
| `apps/electron/src/renderer/components/tutorial/TutorialBanner.tsx.md` | `b5582feaa5b5b1082c7d5ec4cb6fd4381568a30229a9360a6649d7267470b733` |
| `apps/electron/src/renderer/components/welcome/BeijingAnalogClock.tsx.md` | `9d7cc7232f8d2f1d82925d1eb88a7e73603eae50e64de7deda5d08f4d6ad9b9c` |
| `apps/electron/src/renderer/components/welcome/UsageHeatmap.tsx.md` | `da59b4aed304b207af0458aa1afc5dea0c957beb25de19b8344bb1150752eb81` |
| `apps/electron/src/renderer/components/welcome/WelcomeEmptyState.tsx.md` | `3697603f143317a6130d81db68f719b3315ad93072a543f7190b2eb1779a7c13` |
| `apps/electron/src/renderer/components/welcome/WelcomeView.tsx.md` | `e1597524aa76fd9946ab6460e2e901b3b9179c772733aca0454fb6c36fca48a0` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账。
