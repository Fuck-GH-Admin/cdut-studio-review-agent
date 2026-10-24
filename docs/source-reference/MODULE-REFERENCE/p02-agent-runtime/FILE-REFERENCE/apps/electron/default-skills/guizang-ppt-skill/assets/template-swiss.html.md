---
path: apps/electron/default-skills/guizang-ppt-skill/assets/template-swiss.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 26a2eb30567ba93caa015da0c8ff60372dc6c47e
sha256: 1b44bfae65a7db462722e3a2431f3f9cd046ca4f50999b3156c3ca6df518dd7a
lines: 2417
kind: template
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/guizang-ppt-skill/assets/template-swiss.html

## 1. 入口与加载方式

Style B「瑞士国际主义」PPT **seed 模板**（单文件自包含：CSS `:10-1182` + 5 脚本块）：运行时消费方式=skill 拷贝到 `项目/XXX/ppt/index.html`（`SKILL.md:143`）。与同目录 `template.html`（Style A）**平行二选一、类集合互斥**（`SKILL.md:148`；`template.html` 无 canvas-mode/ascii-bg 等，grep=0）。外链：Google Fonts（Inter/JetBrains Mono/Noto Sans SC，`:7-9`）、lucide UMD（`:1598`）、motion（本地 `./assets/motion.min.js` 优先→jsDelivr `motion@11.11.17`，`:1605/:1608`）。

## 2. 脚本块与事件流

1. `:1185-1213` 低功耗初始化：`is-win` 字重补偿检测（`:1186-1189`）；`KEY='guizang-ppt-low-power'`（`:1191`）+prefers-reduced-motion 兜底（`:1192`）；`__setLowPowerMode`（`:1199-1209`，cancel 动画+派发 `swiss-low-power-change`）。
2. `:1336-1597` WebGL 网格背景+翻页+索引：GLSL（VS `:1343`/FS `:1345-1401`）；`bootGL`（`:1406-1455`，内 `readAccent` 读 `--accent` 喂 shader `:1433-1440`；无上下文返 `()=>false` `:1409`）；`canvas-mode` 不启 RAF 并移除画布（`:1456/:1476-1481`）；`go(n)` 翻页（`:1499-1511`）、ESC 缩略索引（`:1520-1550`）、keydown（`:1552-1568`）/wheel（`:1570-1581`）/touch（`:1583-1592`）、URL `?slide=` 初始页（`:1594-1596`）。
3. `:1598-1599` lucide。
4. `:1602-2310` Motion 动效模块：import 双 fallback（`:1604-1614`，双败 warn+强制显示 `:1610-1612`）；**21 个 recipe 函数**（rHero `:1648`/rProgression/rStatement/rGridReveal/rStackBuild/rMeasureUp/rBarGrow/rDuoMirror/rSplitStatement/rTimelineWalk/rManifesto/rThreeForces/rLoopForm/rMatrixFill/rFieldNotes/rSystemDiagram/rWhyNow/rFourCards/rStackedLedger/rTechSpec/rImageHero `:2197`）；`RECIPES` 字典（`:2242-2264`）；`playSlide`（`:2276-2303`，未知 recipe 兜底平凡 fade `:2300-2302`）；`__pipeAdvance` **恒返 false**（`:2306`，本 deck 不用 pipeline recipe）。
5. `:2312-2415` ASCII 背景 IIFE：PALETTE/CELL/FONT_SIZE（`:2322-2324`）、离屏每 4 帧降频（`:2385-2389`）、尺寸<4px 拒绝（`:2329`）、low-power 停启（`:2412`）。

## 3. DOM 契约

id：`#bg-grid`（`:1215`）、`#hint`（`:1216`）、`#deck`（`:1218`）、`#nav`（`:1334`）、动态 `#overview`（`:1516`）。body class：`canvas-mode`（`:1184`）/`is-win`/`low-power`/`dark-bg`/`motion-ready`。data-*：`data-animate`=recipe 名（约束 `:1227`）；`data-anim` 实测 18 种值（bars/bottom/foot/hero/img/kicker/kpi/lead/ledger/left/line/manifesto/right/rules/signature/title/title-block/up；left/right/line CSS 特判 `:616-618`）；`data-cols`（pipeline `:391-393`）。**缺口（照实记录）**：`.cover-row/.takeaway-list/.ledger-*/.kpi-num/.bottom-hero/.vbar` 仅 JS 引用、模板 CSS 无定义，样式由生成页骨架自带。

## 4. 失败与降级

motion 双层 fallback（`:1604-1614`）；WebGL 无上下文/判空（`:1409/:1461-1462`）；low-power 全链（CSS `:87-88/:620-625`+JS `:1191-1208/:2281-2283/:2373/:2395`）；缺元素 recipe 内跳过；`__pipeAdvance` 恒 false 守卫（调用点 `:1561/:1574/:1589`）；ASCII draw 无 ctx 返回（`:2345`）。

## 5. 修改影响面

占位符：`[必填]`×13（`:6/:1248/:1254/:1256/:1259/:1285/:1286/:1306/:1307/:1313/:1314/:1320/:1321`）、`[选填]`×2（`:1261/:1290`）、软占位（`:1249/:1279-1280/:1291/:1299`）、`SLIDES_HERE`（`:1225`）。布局锁 P0 四法则（`:1231-1243`）+封面/封底设计语言（`:1239-1243/:1269-1271`）+图片槽规则（`.frame-img` 体系 `:508-529`、`pos-face=center 35%` `:514`、禁圆角阴影 `:549`）。**关键否定（grep=0 实证）**：模板内无 `data-layout`、无 `data-image-slot`、无 `swiss-layout-lock.md` 引用——S01-S22 登记与布局锁在 `references/{swiss-layout-lock,layouts-swiss}.md`（非本批）；`validate-swiss-deck.mjs`（本批另篇）校验生成页。模板自带封面/封底示例 slide（`:1244-1267` hero、`:1272-1330` split-statement）。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 脚本块/21 recipe/DOM 契约/占位符/布局锁 | 已证实 | 全文逐行（`:1-2417`，选择器与计数 grep 交叉核对；关键锚点作者抽查复核） |
| 无 data-layout/data-image-slot/lock 引用 | 已证实（静态） | grep=0（全文检索） |
| 与 template.html 平行互斥 | 已证实 | `SKILL.md:148` + 类名 grep |
| 渲染/动效运行效果 | 未知 | NOT_RUN（GUI） |

## 7. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| head/CSS 分区/骨架/占位符 | §1/§5 | covered |
| 脚本/事件流 | §2 | covered |
| DOM 契约/缺口 | §3 | covered |
| 失败降级 | §4 | covered |
| GLSL 逐 token | §2 | 语义级（如实） |
| 运行验证 | §6 | unknown（NOT_RUN） |
