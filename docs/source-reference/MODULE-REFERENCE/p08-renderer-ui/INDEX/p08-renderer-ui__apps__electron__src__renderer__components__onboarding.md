# p08-renderer-ui__apps__electron__src__renderer__components__onboarding 索引（onboarding 第三方组件许可证文本）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p08-renderer-ui__apps__electron__src__renderer__components__onboarding`（owner `p08-renderer-ui`，family `apps/electron/src/renderer/components/onboarding`）共 1 个 docs：`third-party/PavelDoGreat-WebGL-Fluid-Simulation-LICENSE.md`（29 行/1493 字节）。七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`onboarding/` 目录是新手引导 UI 组件族；本文件位于其 `third-party/` 子目录，是随附 `IntroFluidBackground.tsx` 的**上游项目许可证/署名文本**（法律归属记录），不是运行时逻辑。

## apps--electron--src--renderer--components--onboarding--third-party--PavelDoGreat-WebGL-Fluid-Simulation-LICENSE.md

- 职责：第三方许可证与署名记录（29 行）——:1 标题「WebGL-Fluid-Simulation attribution」；:3 声明 `IntroFluidBackground.tsx` 是「Profer-specific, reduced WebGL implementation inspired by the GPU fluid rendering approach in PavelDoGreat/WebGL-Fluid-Simulation」，**不含**上游 demo 页/GUI/分析/指针输入/截图逻辑/上游源码原文（:3 尾）；:5 起以 ```text 块原样收录上游许可全文：MIT License、Copyright (c) 2017 Pavel Dobryakov、MIT 授权与免责条款。功能职责=为衍生实现保留上游出处与 MIT 许可文本，满足 MIT 署名/许可文本保留义务并留合规证据。
- 消费（谁加载→何时生效→行为约束）：**无代码消费者**（全树 grep `PavelDoGreat|WebGL-Fluid|Fluid-Simulation|fluid-simulation` 命中仅 `IntroFluidBackground.tsx:4/:8` 头注释与 `IntroWaterRipple.tsx:3` 注释；grep 本文件名 `WebGL-Fluid-Simulation-LICENSE` 零命中，负向检索=证实）——加载者=人（开发者/法务/审计/再分发者阅读源码树）；何时生效=版权合规审查、源码再分发、上游许可核查时；行为约束=若未来引入上游源码或衍生程度加深，须随分发保留本 MIT 声明文本（MIT 条款自述义务）；当前形态（自述 reduced reimplementation、不含上游原文）下属署名最佳实践。伴生代码引用关系：`IntroFluidBackground.tsx:2-8` 头注释点名上游项目与 URL（本文件是该声明的正文支撑），`IntroFluidBackground` 由 `IntroWaterRipple.tsx:9/:82` 组合使用，后者渲染于新手引导/开屏：`OnboardingView.tsx:24/:87`（首次欢迎导览）与 `App.tsx:178/:194`（设置「首次欢迎导览→重新播放」replayIntroOpenAtom 重放开屏）。
- 来源：上游 PavelDoGreat/WebGL-Fluid-Simulation 项目的 MIT 许可文本（Copyright (c) 2017 Pavel Dobryakov，:7）+ 本仓归属声明（:1-3）；`change=unchanged_since_093f`。sourceBlob `1e6917692070a7e31f8e79c06ae1d8fa44cb7b5d`；sourceSha256 `b120f6511b574836f07ababda59acc40a137d2a12a1893e12735b5574dc568da`。
- 打包：**不进产物**——渲染器经 Vite 静态 import 打包（`apps/electron/scripts/build-renderer.mjs` 包装 vite build，vite.config.ts:35 `outDir=dist/renderer`），本 .md 无任何 import/资产引用（全树负向检索），不进 bundle；electron-builder `files:`（apps/electron/electron-builder.yml:44-68）仅收 dist/** 等，`extraResources`（:70 起）无 src/renderer 条目；asar 内无此文件（配置+加载方式=证实）。
- 影响：删除→无构建/运行影响（零消费者），但失去上游 MIT 许可文本与署名证据，若日后引入上游源码则合规材料缺失、再分发可能违反 MIT 署名义务（推断）；改动许可文本内容→合规记录失真。与之相对，`IntroFluidBackground.tsx` 被删才会影响开屏流体背景功能（非本文件职责）。
- 验证：①通读 29 行核 MIT 全文（含版权行与授权/免责条款）；②sha256=lock（封版实测）；③核 IntroFluidBackground.tsx:2-8 署名注释与本文件指向一致、grep 零代码引用；NOT_RUN：产品测试/typecheck/构建/GUI（本轮统一 NOT_RUN）。
- 证实/推断/未知：文件内容、零代码消费者、不进产物、伴生引用链（IntroWaterRipple→OnboardingView/App）=**证实**（实读+负向检索+配置实读）；「引入上游源码后须随分发保留 MIT 声明」=**推断**（MIT 条款义务，未跑法务判定）；本仓衍生实现与上游的实际代码相似度/法务结论=**未知**（非本线范围，未做代码比对）。

## 未运行 / 未知

- NOT_RUN（本轮统一）：产品测试、typecheck、构建、Electron/GUI、开屏动画渲染。
- 未知：衍生实现与上游的代码相似度评估、法务合规结论（超出索引线范围）；许可证文本的引入时点（git 历史未查，冻结树现状为证）。
- 依据边界：结论均冻结树实读+负向检索；`inventory/INDEX-FACTS.tsv` 仅作检索线索未抄入正文。
