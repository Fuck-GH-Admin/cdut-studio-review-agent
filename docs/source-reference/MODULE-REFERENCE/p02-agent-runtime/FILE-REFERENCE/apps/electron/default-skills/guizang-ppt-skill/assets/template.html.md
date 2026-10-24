---
path: apps/electron/default-skills/guizang-ppt-skill/assets/template.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3140850f2c2b9132df738b168da4ca3cc3c0530d
sha256: a78c2375d8edf444269f57d4e8f67d9c6fa6b8be8e20528d5a91b0ec3c3a964e
lines: 858
kind: template
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/guizang-ppt-skill/assets/template.html

## 1. 入口与加载方式

guizang-ppt-skill 的 **Style A（墨水经典）PPT 模板**：`HTML 模板 + 内嵌引擎`（WebGL 双背景/翻页导航/动效）。被 skill 文档引用为模板入口（`SKILL.md:18/:140` cp 模板→项目 index.html；`references/layouts.md:9-13` 类名契约），冻结树代码无运行时 import（静态检索）。Google Fonts 外链（`:7-9`）、Lucide unpkg（`:735`）、motion 库（本地 `./assets/motion.min.js` 优先，回退 jsDelivr `motion@11.11.17`，`:747/:750`）——离线时字体/图标/动效各自降级。

## 2. 脚本块与事件流

4 个脚本块：

1. **低功耗初始化 IIFE**（`:449-473`）：`KEY='guizang-ppt-low-power'` localStorage 持久化（`:451/:462`）；`prefers-reduced-motion: reduce` 默认低功耗（`:452-454`）；`__setLowPowerMode`（`:459-469`，cancel 全部动画+派发 `ppt-low-power-change`+重放当前页）。
2. **WebGL 背景+导航主脚本**（`:493-734`）：双片元着色器（暗色全息色散 `:501-528`/亮色螺旋涡流 `:530-565`）；`bootGL`（`:570-600`，无 WebGL 上下文返回 `()=>false` 降级 `:573`）；导航 `go(n)`（`:638-651`：translateX 翻页、data-theme 优先判亮暗 `:644-647`、450ms 后 `__playSlide`、700ms 翻页锁）；ESC 缩略图索引（`:654-689`）；keydown（`:691-707`：ESC/B 切低功耗/→←翻页/Home/End）、wheel（阈值 50、150ms 复位，`:710-720`）、touch 滑动（50px，`:722-731`）。
3. **lucide**（`:735-736`）：CDN + `createIcons()`。
4. **动效模块脚本**（`:744-856`，type=module）：`import('./assets/motion.min.js')`→catch CDN→双失败兜底强制 `[data-anim]` 可见（`:746-755`）；`playSlide`（`:782-833`，配方 data-animate/hero/cascade/directional/quote/pipeline；low-power 走 `revealStatic`）；`pipeAdvance`（`:835-848`，pipeline 页步进+箭头点亮）；挂 `window.__playSlide/__pipeAdvance`（`:850-851`）。

## 3. DOM 契约

- id：`#bg-dark`/`#bg-light`（`:475-476`）、`#deck`（`:479`）、`#nav`（`:491`）、`#hint`（`:477`）、JS 动态 `#overview`（`:656`）。
- class：`.slide`（+.light/.dark/.hero，`:44-58`）、`.dot`、`body.light-bg/low-power/motion-ready`。
- data-*：`data-theme`（`:646`）、`data-animate`（pipeline 等配方，`:786/:838`）、`data-anim`（left/right/divider/line/step/arrow，`:753-754/:767/:795/:839-840`）、`data-cols`（pipeline 列数，`:341-343`）、`data-i`。
- window API：`__lowPowerMode/__setLowPowerMode/__playSlide/__pipeAdvance/__currentSlideIndex`（`:454/:459/:649/:700/:641`）。

## 4. 失败与降级

模块双层 try/catch（`:746-755`，失败强制显形）；WebGL 缺失降级（`:573`）；low-power 全链短路（CSS `:39/:429-434` + JS `:451-472/:603/:788/:836`，B 键切换 `:693-697`）；`prefers-reduced-motion` 默认开启低功耗（`:452-454`）；@media 900px 响应式（`:436-445`）；motion 未加载 `[data-anim]` 默认可见（`:423-424`）。

## 5. 修改影响面

主题色 `:root` 6 变量（`:16-21`，替换指引 `:12-15`）；slide 由 agent 填入 `<!-- SLIDES_HERE -->`（`:487`，插入区注释 `:481-485` 指向 references 文档）；模板本身**零实际 slide**（唯一命中为注释）。与 `references/{layouts,themes,components,page-patterns}.md`（非本批）构成 agent 创作契约；改类定义影响 layouts.md 全清单（`:201-205` 契约注释）。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 脚本块/DOM 契约/降级链/占位符 | 已证实 | 全文逐行（`:1-858`，GLSL 两段语义级归纳） |
| 引用方=skill 文档、代码零引用 | 已证实（静态） | 整树检索 |
| 动效运行/GLSL 渲染效果 | 未知 | NOT_RUN（GUI） |

## 7. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| head/CSS 分区/骨架 | §1/§5 | covered |
| 脚本/事件流 | §2 | covered |
| DOM 契约/降级 | §3/§4 | covered |
| GLSL 逐 token | §2 | 语义级（如实） |
| 运行验证 | §6 | unknown（NOT_RUN） |
