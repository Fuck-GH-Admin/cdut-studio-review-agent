# p02-agent-runtime__apps__electron__default-skills__guizang-ppt-skill 索引（guizang-ppt-skill 技能 references/ 运行时行为约束文档）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p02-agent-runtime__apps__electron__default-skills__guizang-ppt-skill`（owner `p02-agent-runtime`，family `apps/electron/default-skills/guizang-ppt-skill`）共 9 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（9 个文件共用的「谁加载→何时生效→行为约束」与打包链，逐文件小节引用本段不重复）：

- **谁加载（整族两条真实消费链，实读证实）**：
  1. **Agent 运行时按 SKILL.md 指令读取**——`guizang-ppt-skill/SKILL.md` 在生成流程固定步骤点名打开各 references（逐文件行号见各小节「消费」行）。SKILL.md 本身进入 agent 的链路：打包 `apps/electron/electron-builder.yml:70-73`（`extraResources` `from: default-skills to: default-skills`，产物 `process.resourcesPath/default-skills`，解析见 `apps/electron/src/main/index.ts:940-941`）→ 首启 `seedDefaultSkills()`（`apps/electron/src/main/lib/config-paths.ts:956`，注释块 :946-955）复制到 `~/.cdutai/default-skills/`（`getDefaultSkillsDir()` `config-paths.ts:564-567`；`config-paths.ts:71` 明示不读取/不迁移 `~/.proma`，`electron-builder.yml:71` 注释写 `~/.proma` 为陈旧注释，以代码为准）→ 技能目录载入 agent（`apps/electron/src/main/lib/adapters/pi-skill-resources.ts:46-59` `createPromaSkillsOverride` 按目录恢复加载受管 skill；`apps/electron/src/main/lib/global-skill-manager.ts:239` 读 `SKILL.md` 解析元数据）→ 行为契约注入：`apps/electron/src/main/lib/agent-prompt-builder.ts:960-968` 系统提示词声明「每个 skill 含 SKILL.md 指令文件，任务相关时 MUST read its `SKILL.md` instructions before proceeding」，agent 依 SKILL.md 指令在生成各阶段读取本组 references 并受其硬约束。**何时生效**：用户请求生成单文件 HTML 横向翻页 PPT（Style A 电子杂志×电子墨水 / Style B 瑞士国际主义）时，从选模板/选题、版式选择、配色、选图、组件拼装到生成后自检各阶段逐一生效。**行为约束**：references 是生成产物的硬约束与质量门（锁定版式白名单、主题色禁则、组件骨架、P0 检查项），不遵守即产出违例 PPT。
  2. **目录指纹消费**——`hashDefaultSkillDir()`（`config-paths.ts:821-838`）对该 skill 目录全部文件（含 references/，`DEFAULT_SKILL_COPY_BLOCKLIST` `config-paths.ts:681-690` 不含 references）做确定性 SHA-256；`LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES`（`config-paths.ts:848` 起（注释 :840-847），`'guizang-ppt-skill'` 单条指纹 `config-paths.ts:874`）供 `isKnownLegacyBundledSkill()`（`config-paths.ts:941-943`）在 `seedDefaultSkills()`（接管点 `config-paths.ts:995`）判定历史出厂指纹命中后接管/升级该 skill。
- **间接机械消费者**：`apps/electron/default-skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs:17-21` 以 `S01..S22` + ASCII 封面/收尾白名单机检生成的 `index.html`（执行 `swiss-layout-lock.md` 注册版式约束的代码侧镜像）。
- **路由推荐**：`apps/electron/src/main/lib/skill-routing-rules.ts:17` `'guizang-ppt-skill': { requiredToolGroups: ['ppt-materials'] }`（仅推荐预设工具组，不扩大权限，见该文件头注释 :1）。
- **打包位置（整族）**：随 `extraResources` 进产物资源目录并被 seed 到 `~/.cdutai/default-skills/guizang-ppt-skill/references/`（cpSync filter `defaultSkillCopyFilter` `config-paths.ts:766-768` 不屏蔽 references）。
- 9 个文件之间无代码互读；彼此的引用关系均为 SKILL.md 指令性编排（如 Style B 先读 swiss-layout-lock.md 再读 layouts-swiss.md）。

## apps--electron--default-skills--guizang-ppt-skill--references--checklist.md

- 职责：生成后质量自检清单（541 行）——「一人公司」演讲稿真实迭代踩坑总结，按 P0（:9，绝不犯的错：emoji/图片溢出/标题折行/字体分工等）→P1 排版节奏（:348）→P2 视觉打磨（:403）→P3 操作细节（:468）→最终自查表（:488）分级，是 PPT 产出的最后一道质量门。
- 消费：**谁加载→何时生效→行为约束**：agent 在生成完成后按 SKILL.md 指令打开本文件——`guizang-ppt-skill/SKILL.md:346`「After generating, always open `references/checklist.md` and check item by item…P0-level issues (emoji, image overflow, heading wrapping, font division of labor) must all pass」（实读证实）；即每次 PPT 生成结束后生效，P0 项必须全过，P1-P3 逐项核对。无 TS/脚本代码读者（全树检索 `checklist.md` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置参考文档（内容自述来自「一人公司」talk deck 迭代经验，checklist.md:1-3）；`change=unchanged_since_093f`。sourceBlob `34719d78c3a0a0c8dc5cfa0152c675537a60a910`；sourceSha256 `7328767e6ca6b4916a0ce20883d6982cc389f959357e73037299cdf0a31a3085`。
- 打包：随 skill 目录整体进产物——`electron-builder.yml:70-73` extraResources `default-skills`，运行时落 `~/.cdutai/default-skills/guizang-ppt-skill/references/checklist.md`（seed 链见家族背景）；参与 `hashDefaultSkillDir` 目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→生成后自检失去质量门，SKILL.md:346 的「必须逐项过」指令指向空文件（agent 将报缺文件或跳过自检），P0 级视觉事故（emoji、图片溢出、标题折行、字体分工）失去拦截；同时改变目录指纹（config-paths.ts:874 单条历史指纹失配），`seedDefaultSkills` 不再把该目录认作历史出厂版本（config-paths.ts:941-943/:995），升级接管策略转为保护不覆盖。
- 验证：①sha256sum 与上列 sourceSha256/lock manifest 对照；②实测 `SKILL.md:346` 引用行存在且指向本文件；③结构核（P0/P1/P2/P3/最终自查表五级标题齐）；NOT_RUN：产品测试/typecheck/构建/GUI/实际 PPT 生成走查（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:346 指令加载、内容分级结构、打包 seed 链、指纹消费=**证实**（实读源码/文件）；「删除后 agent 跳过自检」的具体降级行为=**推断**（未运行 agent）；agent 违反指令时的兜底行为=**未知**（无代码级强制）。

## apps--electron--default-skills--guizang-ppt-skill--references--components.md

- 职责：组件手册（439 行）——`template.html`/`template-swiss.html` 已定义全部样式，本文件只讲「各组件长什么样、怎么用」（components.md:3）：基本 slide shell（:24）、排版（:41）、Chrome & Foot（:71）、引用框（:100）、数字矩阵（:118）、平台卡（:142）、Rowline（:173）、Pillar（:191）、Tag & Kicker（:219）、图框（:238）、图标（:311）、幽灵大字（:342）、高亮标记（:359）、Motion 动画体系（:374）。
- 消费：**谁加载→何时生效→行为约束**：agent 在拼装页面组件细节时按 SKILL.md 指令读取——`SKILL.md:342`「Component details (fonts, colors, grids, icons, callouts, stat cards, etc.) are in `references/components.md`」（实读证实）；生成期拼组件阶段生效，约束组件类名/结构/用法与模板样式定义保持一致。无代码读者（全树检索 `components.md` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置组件参考（自述配套 template.html 样式体系，components.md:3）；`change=unchanged_since_093f`。sourceBlob `54c98ecbd3df27cd9f6955ebb839bd761deadda4`；sourceSha256 `0f6e7207399df8b3920954dfc7364e4182f52d4b418f317ef0147d51a660459d`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/components.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→组件用法与模板 CSS 类名契约脱钩（SKILL.md:342 指向失的），agent 拼装组件时可能自造类名导致样式不生效；目录指纹变化使历史出厂指纹失配（config-paths.ts:874/:941-943）。
- 验证：①hash 对照；②实测 `SKILL.md:342` 引用行；③抽查组件类名与 `assets/template.html`、`assets/template-swiss.html` 类名一致性（本轮抽查 slide shell/图框两类）；NOT_RUN：产品测试/typecheck/构建/GUI/生成走查（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:342 加载、章节结构、与模板配套关系（自述+抽查）=**证实**；「agent 自造类名致样式失效」=**推断**；全部组件类名与模板 CSS 逐一比对=**未知**（未做全量比对）。

## apps--electron--default-skills--guizang-ppt-skill--references--image-prompts.md

- 职责：GPT-M 2.0 出图 prompt 规则（177 行）——先判图槽与比例再选型（image-prompts.md:3）：通用规则（:5）、比例选择（:17）、图片标准化策略（:32，含先定目标槽位 A/用户原图截图处理 B/prompt 后缀 C）、7 个出图型（纪实摄影 :66 / 杂志信息图 :74 / 流程图 :82 / 对比图 :90 / 系统关系图 :98 / 截图重设计 :106 / 大数字视觉 :114）、Style B 瑞士出图规则（:124）。
- 消费：**谁加载→何时生效→行为约束**：agent 在为页面选图/出图前按 SKILL.md 指令读取——`SKILL.md:128`「First read `references/image-prompts.md` to choose image types and base prompts」（实读证实）；出图决策时生效，约束：先判槽位比例、按 7 型选 prompt、统一出图策略。无代码读者（全树检索 `image-prompts` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置出图规则（自述用于 Codex 环境 GPT-M 2.0 出图，image-prompts.md:3）；`change=unchanged_since_093f`。sourceBlob `a13b01104e39765c9eb548d6ed52369517c193c5`；sourceSha256 `5dc354f19955352e63550a935dfc5c9cd7a8e26e1aecf00883108bd627853aca`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/image-prompts.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→出图选型与比例规则失去约束（SKILL.md:128 指向失的），图片比例与图槽不匹配（配合 swiss-layout-lock.md 的图槽绑定规则被绕过）；目录指纹变化影响历史出厂指纹判定（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:128` 引用行；③结构核（7 型 + 通用规则/比例/标准化策略/Style B 规则）；NOT_RUN：产品测试/typecheck/构建/GUI/实际出图（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:128 加载、章节结构=**证实**；「出图比例失控的具体表现」=**推断**；GPT-M 2.0 侧对该 prompt 的实际执行效果=**未知**（外部生成服务，未运行）。

## apps--electron--default-skills--guizang-ppt-skill--references--layouts-swiss.md

- 职责：Style B 瑞士国际主义版式库（873 行）——Swiss locked mode（:9）→设计语言基线（:28）→生成后视觉+代码双审（:176）→22 个注册版式逐个文档（:224 起，用途/骨架/关键类/motion 配方）→历史实验区（:717，默认禁用）→LLM 选版决策表（:805）→P0 选版原则：内容数据类型必须匹配版式（:836）→常见错误（:862）。自述与 Style A 类名冲突语义不同（如 `h-hero`），一套 deck 只能用一套（layouts-swiss.md:5）。
- 消费：**谁加载→何时生效→行为约束**：agent 在 Style B 生成的选版阶段按 SKILL.md 指令读取——`SKILL.md:27`（Style B 模板行「Layouts: `references/layouts-swiss.md`」）与 `SKILL.md:253`「**Style B** → first read `references/swiss-layout-lock.md`, then `references/layouts-swiss.md`」（实读证实）；Style B 选版时生效，约束：正文页只能从 22 注册版式选（与 swiss-layout-lock.md 白名单一致）、类名语义按 Style B、生成后必须过双审。无代码读者（全树检索 `layouts-swiss` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置 Style B 版式库（自述 22 原始注册版式，layouts-swiss.md:3）；`change=unchanged_since_093f`。sourceBlob `ee3512665364b39861811698dcf5983615ea3262`；sourceSha256 `de01ce9c78805c7b8744af44cf2e3d18c48d65c0ad3f1a88afce7ccbbaff6ad8`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/layouts-swiss.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→Style B 选版失据（SKILL.md:253 链路断），agent 可能自创版式/误用 Style A 类名（两套类名语义冲突，layouts-swiss.md:5）；与 `scripts/validate-swiss-deck.mjs:17-21` 的 S01-S22 白名单可能失配导致机检误报/漏报；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:27/:253` 引用行；③核 22 版式 ID 与 `swiss-layout-lock.md` 注册表、`validate-swiss-deck.mjs:17-21` 白名单三方一致（S01-S22）；NOT_RUN：产品测试/typecheck/构建/GUI/双审流程实际执行（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:27/:253 加载、22 版式三方 ID 一致、类名冲突自述=**证实**；「误用 Style A 类名的视觉后果」=**推断**；motion 配方的实际渲染效果=**未知**（未运行）。

## apps--electron--default-skills--guizang-ppt-skill--references--layouts.md

- 职责：Style A 电子杂志×电子墨水版式库（667 行）——10 个最常用页面骨架，每版式是完整可粘贴 `<section class="slide ...">` 代码块（layouts.md:3）：Pre-flight 必读（:7，类名取自 template.html/图片比例 B/B2/B3/定位 C/主题节奏 D/Motion One E）→基结构（:85）→Layout 1 封面（:162）…Layout 10 主图+侧文（:591）→附录公共网格（:639）→页面节奏建议（:654）。
- 消费：**谁加载→何时生效→行为约束**：agent 在 Style A 生成的选版阶段按 SKILL.md 指令读取——`SKILL.md:18`（Style A 模板行「Layouts: `references/layouts.md`」）、`SKILL.md:222`（「Detailed rules are in the "Theme rhythm planning" section at the top of `references/layouts.md`」，选版前先做主题节奏规划）、`SKILL.md:238`（「**Style A** → `references/layouts.md`」）（实读证实）；Style A 选版/排页阶段生效，约束：从 10 骨架取版、图片比例与定位按 Pre-flight、按主题节奏排页。无代码读者（全树检索 `layouts.md` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置 Style A 版式库；`change=unchanged_since_093f`。sourceBlob `3ea2f63708393cdbf2180e62c43dc1254b446ad4`；sourceSha256 `9a57faaa937722b7d15725a6cebebc071f8c9431aaaf82e2584a9966bffa7f6e`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/layouts.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→Style A 选版失据（SKILL.md:18/:222/:238 指向断/漂移），粘贴式骨架代码与 template.html 类名契约脱钩，主题节奏规划规则消失；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:18/:222/:238` 三处引用行；③抽查骨架类名与 `assets/template.html` 一致性、10 版式标题齐；NOT_RUN：产品测试/typecheck/构建/GUI/生成走查（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md 三处加载、结构、骨架与模板配套（自述+抽查）=**证实**；「类名脱钩的具体表现」=**推断**；10 骨架与模板 CSS 全量比对=**未知**（未做全量）。

## apps--electron--default-skills--guizang-ppt-skill--references--swiss-layout-lock.md

- 职责：Style B 硬约束锁文件（86 行）——「目的不是给灵感，而是防止『看起来瑞士但已漂移出原模板』的生成」（swiss-layout-lock.md:3）：Golden Source 指向原参考 index.html（:5-9）→生成前硬规则 5 条（:13，正文页必须 `data-layout="Sxx"`/不许自创 P23 类结构/中文顶标题默认左对齐/SVG 只画几何线条不写文字/图槽与出图比例绑定）→22 注册版式表（:21，含骨架与图规则）→唯一注册扩展 `S08 + Swiss Map Component`（:48）→图槽规则（:59，S22 Hero Strip 21:9、S15/S16 多图网格）→禁用表（:79）。
- 消费：**谁加载→何时生效→行为约束**：agent 在 Style B 生成前按 SKILL.md 指令读取——`SKILL.md:253`「**Style B** → **first read** `references/swiss-layout-lock.md`, then `references/layouts-swiss.md`」（实读证实）；Style B 生成最前置生效（先锁后选版），行为约束即上述 5 硬规则 + 22 版式白名单 + 禁用表，是 Style B 的金源级硬锁。另有代码侧镜像执行者：`scripts/validate-swiss-deck.mjs:17-21` 按同一 S01-S22+ASCII 白名单机检生成 HTML。
- 来源：guizang-ppt-skill 内置 Style B 锁文件（Golden Source 指向作者本机路径 `/Users/guohao/Documents/op7418的仓库/项目/Thin-Harness-Fat-Skills/ppt/index.html`，swiss-layout-lock.md:7，为内容出处记录，树外不可达）；`change=unchanged_since_093f`。sourceBlob `8a4f582dfe3399bf822b43acacb7793a43c05d95`；sourceSha256 `035f40c1c758e5b0a9af98536abaca74c9216124d0f74ea136f5798907c30476`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/swiss-layout-lock.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→Style B 失去硬锁（SKILL.md:253 首读断链），正文页版式可漂移出 22 白名单、SVG 文字/标题居中等违例失去拦截，与 `validate-swiss-deck.mjs` 白名单可能出现双重标准；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:253` 引用行与「first read」顺序；③核 22 版式表与 `layouts-swiss.md` 注册版式、`validate-swiss-deck.mjs:17-21` 白名单一致；NOT_RUN：产品测试/typecheck/构建/GUI/validate-swiss-deck.mjs 实跑（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:253 加载与顺序、5 硬规则/22 表/禁用表内容、validate 脚本白名单=**证实**；「漂移产物的具体视觉后果」=**推断**；Golden Source 树外文件现状=**未知**（树外路径，未访问）。

## apps--electron--default-skills--guizang-ppt-skill--references--swiss-map-component.md

- 职责：Swiss Map Component 扩展组件规范（215 行）——不是新正文版式，是 `S08 Duo Compare` 右槽的扩展（左说明卡+右 MapLibre 地图卡，swiss-map-component.md:3）：适用场景（:5）→硬规则（:11）→数据契约（:21）→必需 CSS（:41）→页面骨架（:87）→必需 JS（:124）→视觉检查（:209）。
- 消费：**谁加载→何时生效→行为约束**：agent 在生成地理/路线/地点关系页时按 SKILL.md 指令读取——`SKILL.md:262`「Geography / history / city routes / place-relation pages use `S08 + Swiss Map Component`: first read `references/swiss-map-component.md`, keeping `data-layout="S08"`」与 `SKILL.md:291`（Registered extension：须实现 pins、连线、卡片、右上缩放/拖拽控制，按本文件）（实读证实）；做地图页时生效，约束：保持 `data-layout="S08"`、按数据契约喂数据、必备 CSS/JS 齐、右上 `+ - DRAG` 控件必备（swiss-layout-lock.md:56 同步约束：默认禁滚轮缩放与拖拽以免误翻页）。无代码读者（全树检索 `swiss-map-component` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置扩展组件规范；`change=unchanged_since_093f`。sourceBlob `5716d43f37aecca2edf6f2782e9ab9292d3dfe66`；sourceSha256 `0b870a75c7dea7f22f84d9a5f64289b87c12dbcd89d567304e239081d3f07a1e`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/swiss-map-component.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→地图页扩展失去规范（SKILL.md:262/:291 指向断），agent 可能丢数据契约/必备 JS（MapLibre 交互失效）或误将扩展写成新正文版式（违反 swiss-layout-lock.md:48-57）；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:262/:291` 引用行；③核数据契约/CSS/JS 骨架小节齐、与 swiss-layout-lock.md「Registered extension」小节一致；NOT_RUN：产品测试/typecheck/构建/GUI/地图组件实际渲染（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md 两处加载、内容结构、与 swiss-layout-lock.md 一致=**证实**；「MapLibre 交互失效表现」=**推断**；MapLibre CDN 可用性与实际渲染=**未知**（未运行）。

## apps--electron--default-skills--guizang-ppt-skill--references--themes-swiss.md

- 职责：Style B 瑞士主题色预设（161 行）——4 色高对比调色板（克莱因蓝 IKB :17 / 柠檬黄 :42 / 柠檬绿 :67 / 安全橙 :92），每套遵循「精致灰白底 + 单一高饱和点睛色」极简原则，禁止混用多个点睛色（themes-swiss.md:3）；含用法（:7）、选型指南（:117）、切换原则（:128）、禁则（:137）、灰度统一说明（:147）。
- 消费：**谁加载→何时生效→行为约束**：agent 在 Style B 配色阶段按 SKILL.md 指令读取——`SKILL.md:27`（Style B 模板行「Theme colors: `references/themes-swiss.md`」）（实读证实）；Style B 选主题/写 `:root` 色板时生效，约束：只能 4 选 1、单点睛色、灰度统一。无代码读者（全树检索 `themes-swiss` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置 Style B 主题预设；`change=unchanged_since_093f`。sourceBlob `b7d1ca30f6f4d6fc87e91e24281c026de476d9aa`；sourceSha256 `7151260f2ab25b3502733299707ac0abe23a8c5a9e63c47b26ee8ee0074a1f01`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/themes-swiss.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→Style B 配色失据（SKILL.md:27 指向断），可能出现多点睛色混用/非 4 色（违 themes-swiss.md:3 禁则）；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:27` 引用行；③结构核（4 主题+选型/切换/禁则/灰度说明）；NOT_RUN：产品测试/typecheck/构建/GUI/生成走查（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md:27 加载、结构、禁则内容=**证实**；「配色违例的视觉后果」=**推断**；4 色与 template-swiss.html CSS 变量的全量对应=**未知**（未做全量比对）。

## apps--electron--default-skills--guizang-ppt-skill--references--themes.md

- 职责：Style A 主题色预设（122 行）——5 套调色板（墨水经典 :17 / 靛蓝瓷 :33 / 森林墨 :49 / 牛皮纸 :65 / 沙丘 :81），保持「电子杂志×电子墨水」审美不崩，**不允许自定义配色**（themes.md:3）；含用法（:7）、选型指南（:97）、切换原则（:109）、禁则（:116）。
- 消费：**谁加载→何时生效→行为约束**：agent 在 Style A 配色/换主题阶段按 SKILL.md 指令读取——`SKILL.md:18`（Style A 模板行「Theme colors: `references/themes.md`」）与 `SKILL.md:174`「Open `references/themes.md` and find the `:root` block of the corresponding theme」（换主题色时找对应 `:root` 块替换）（实读证实）；Style A 选题/换色时生效，约束：5 选 1、禁自定义配色、按 `:root` 块整体切换。无代码读者（全树检索 `themes.md` 仅命中 SKILL.md 指令与目录清单）。
- 来源：guizang-ppt-skill 内置 Style A 主题预设；`change=unchanged_since_093f`。sourceBlob `b33190e9708e154dbb4acc60962974d4b5428342`；sourceSha256 `a4c7ccdd992118589a62d5ea214996d76d0d5c4d45c9653b9bfca9200f2d7e77`。
- 打包：随 skill 目录进产物 extraResources（electron-builder.yml:70-73）→ `~/.cdutai/default-skills/guizang-ppt-skill/references/themes.md`；参与目录指纹（config-paths.ts:821-838）。
- 影响：删除/改→Style A 配色/换色失据（SKILL.md:18/:174 指向断），`:root` 块替换规则消失致换色改漏变量；目录指纹变化（config-paths.ts:874）。
- 验证：①hash 对照；②实测 `SKILL.md:18/:174` 引用行；③结构核（5 主题+选型/切换/禁则）；NOT_RUN：产品测试/typecheck/构建/GUI/生成走查（本轮统一 NOT_RUN）。
- 证实/推断/未知：SKILL.md 两处加载、结构、禁自定义配色=**证实**；「换色改漏变量的表现」=**推断**；5 主题 `:root` 块与 template.html CSS 变量全量比对=**未知**（未做全量）。

## 未运行 / 未知

- NOT_RUN（本轮统一）：产品测试、typecheck、构建、Electron/GUI、实际 PPT 生成走查、`scripts/validate-swiss-deck.mjs` 实跑、seedDefaultSkills 实跑。
- 未知汇总：agent 对指令的代码级兜底（无强制机制，违令行为未知）；各 references 与 template CSS 的全量类名/变量比对（仅抽查）；GPT-M 2.0 出图外部服务行为；Golden Source 树外路径现状；motion 配方与地图组件实际渲染。
- 依据边界：以上「消费」结论基于冻结树实读（SKILL.md 指令行、skill 加载/seed/指纹链、validate 脚本）；`inventory/INDEX-FACTS.tsv` 仅作检索线索未抄入正文。
