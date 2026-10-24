# p02-agent-runtime__apps__electron__default-skills 索引（内置默认 Skills 模板，29 个 index-only 文件）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`（HEAD 已核、clean 已核）。
本篇覆盖 group `p02-agent-runtime__apps__electron__default-skills`（owner `p02-agent-runtime`，family `apps/electron/default-skills`）共 29 个文件。每文件七项必填：职责 / 消费（真实加载或消费者）/ 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。全部条目均为运行时加载的 SKILL 指令文本或其随附文档/许可，按合同写明「谁加载→何时生效→行为约束」。运行验证本轮统一 NOT_RUN。

## 家族背景：谁加载→何时生效→行为约束（实读证实）

- **打包**：`apps/electron/electron-builder.yml:69-75` `extraResources` 将整个 `default-skills/`（`from: default-skills`，`to: default-skills`，`filter: **/*`，:71-74）打进安装包，落地 `process.resourcesPath/default-skills`；`apps/electron/scripts/packaging-guards.test.ts:382-385` 对默认 Skills 目录做打包守卫（`countFiles(defaultSkillsDir)` 后 `expect(totalFiles).toBeGreaterThanOrEqual(200)`，:384；注释 :383「历史上包含全套 schemas 时约 240 个文件」）。
- **路径解析**：`apps/electron/src/main/index.ts:939-943` 打包态取 `join(process.resourcesPath, 'default-skills')`、开发态取 `join(__dirname, '../default-skills')`，随后 `configureGlobalSkillSystem(bundledGlobalSkillsDir)`（:943）注入 bundle 来源；`apps/electron/src/main/lib/config-paths.ts:773-775` 同一分辨率（`getBundledSkillsDir`）。
- **播种（首次/每次启动）**：`config-paths.ts:956` `seedDefaultSkills()` 把 bundle 同步到用户默认 Skills 目录 `getDefaultSkillsDir()`＝`getConfigDir()/default-skills/`（`config-paths.ts:564-575`；`getConfigDir()` 正式版 `~/.cdutai/`、开发版 `~/.cdutai-dev/`，:75-88）。规则（:947-955 注释 + :964-1000 实码）：缺失 Skill 直接复制并记录内置基线（bundledHash+bundledVersion，`.seed-state.json`，:692）；已存在且内容仍等于内置基线→仅 bundled 更新时覆盖；有任何用户改动或无可信基线→保护本地内容绝不覆盖（除非精确命中历史出厂目录哈希 `LEGACY_BUNDLED_SKILL_DIRECTORY_HASHES`，:950-953）。调用点：`index.ts:992-1003`——主窗口 `show` 后 `setTimeout(0)` 依次 `ensureGlobalSkillSystemReady`→`seedDefaultSkills`（:997-998 注释：必须先完成全局能力迁移再 seed）。另有旧 slug 改名迁移 `migrateRenamedDefaultSkills`（`config-paths.ts:714-760`，映射表 `lib/default-skill-slugs.ts:6-8` 仅一对 `proma-coach → profer-coach`）；复制过滤 `defaultSkillCopyFilter`（:766-768）跳过 `DEFAULT_SKILL_COPY_BLOCKLIST`＝{`.git`、`.DS_Store`、`node_modules`、`dist`、`.next`、`.cache`、`.turbo`、`__pycache__`}（:681-690）。注：`getDefaultSkillsDir` 文档注释（:560-564）称「新建工作区时自动复制到工作区 skills/」，实查 `agent-workspace-manager.ts:190 createAgentWorkspace` 无此复制=注释为历史残留（工作区实际供给走 prepareRuntimeSkills 投影，见下）。
- **进入模型上下文（何时生效）**：`apps/electron/src/main/lib/agent-prompt-builder.ts:958-971` `buildSkillsBlock()` 把 `<skills>` 块拼进 Agent 系统提示（使用点 :1416），明文声明技能是「含 `SKILL.md`（必需）指令文件 + YAML frontmatter（name/description）+ 脚本与资源的文件夹」，并约束模型：**「If a skill seems relevant to your current task, you MUST read its SKILL.md instructions before proceeding」**（:962）；技能目录指工作区 `join(workspaceRoot, 'skills')`（:617，提示语 :966、:1005）。即：技能触发词命中→模型读取 SKILL.md→其正文指令成为行为约束；随附 `forms.md`/`reference.md`/`editing.md`/`pptxgenjs.md` 等支撑文档由 SKILL.md 指定按需读取（逐文件见下）。
- **技能清单/正文的机器通道（谁加载→何时生效→行为约束）**：①SDK 侧——外部 SDK `@earendil-works/pi-coding-agent@0.86.1`（`apps/electron/package.json:72`，root `package.json:50/:55` 补丁）提供按目录解析 SKILL.md 的 `sdk.loadSkillsFromDir`；`createPromaSkillsOverride`（`adapters/pi-skill-resources.ts:49-131`，接入点 `pi-agent-adapter.ts:2726`）只做 slug 白名单/去重/路径收容，**不读 SKILL.md 正文**。②正文注入——用户显式 `/skill:` 引用时 `preparePromptWithPromaSkills` 读 SKILL.md、去 frontmatter、注入 `<skill name=… location=…>正文</skill>`（`pi-skill-resources.ts:176-179`，调用 `pi-agent-adapter.ts:3306/3447/3477`）；路由推荐技能同样整文注入、超预算则降级为 `<skill_reference …read the full file on demand>`（`skill-routing.ts:199-203`）；否则由模型按系统提示自行读取 SKILL.md（`agent-prompt-builder.ts:963`）。即 SKILL.md 正文生效于「被注入或被模型读取」那一刻，其指令成为行为约束。③运行时投影——`prepareRuntimeSkills(workspaceSlug)`（`global-skill-manager.ts:1488-1525`）把工作区+全局技能拷入 `~/.cdutai/agent-workspaces/{slug}/.runtime/skills/<指纹>/skills/<slug>` 并写 `.claude-plugin/plugin.json`/`runtime-manifest.json`（:1507-1512），每次 Agent 运行前由 `agent-orchestrator.ts:2023` 调用；`skill-runtime-routing.ts:33-43` `buildSkillRuntimeOptions` 组装 `skills/skillSlugs/additionalSkillPaths/plugins`（消费点 `agent-orchestrator.ts:2037/2206-2229`）。④清单/内容 IPC——`agent:get-default-skill-slugs`（`ipc.ts:3677-3682`）现为兼容桩恒返回 `[]`（`agent-workspace-manager.ts:673-675`，:669-672 注释），唯一前端消费 `renderer/components/agent-skills/useAgentSkillsData.ts:67`；`agent:read-skill-content`（`packages/shared/src/types/agent.ts:2215`）→ `readWorkspaceSkillContent` 读工作区技能的 SKILL.md 全文（`agent-workspace-manager.ts:994-1000`），唯一消费 `renderer/components/agent-skills/SkillDetailSheet.tsx:85`。⑤`global-skill-manager.ts:224-250` `parseMeta`/`readSkillManifestFromDir`（:239 读 SKILL.md）解析 name/description 入 manifest；master 库＝`~/.cdutai/default-skills/`（`skill-master-manager.ts:41-43`）。
- **TS 代码不执行技能脚本（否定结论，检索范围=apps/electron/src 与 packages/ 全部 *.ts/*.tsx（排除 *.test.*））**：grep `validate.py|quick_validate|scripts/office|pack.py` 零命中；所有 spawn/exec/child_process 文件无技能路径引用。脚本执行完全靠模型按 SKILL.md 指令用 Bash 跑 `python scripts/...`（如 docx/SKILL.md:27/:78）；TS 侧只打包守卫（packaging-guards.test.ts:344-364 关键深路径存在性）与逐字复制（config-paths.ts:983 `cpSync`）。
- **上游来源分组（来源维度）**：①Profer 原生（中英双语，automation/in-app-browser/lark-delivery/profer-coach/session-cleaner/tool-builder/user-sense；其中仅 automation（:4）、in-app-browser（:4）、lark-delivery（:6）、user-sense（:4）四份 frontmatter 带 `group: profer` 字段，其余三份无该字段=实读证实）；②英文通用技能（brainstorming/executing-plans/writing-plans 正文引用 `superpowers:*`、`elements-of-style:*` 命名空间，推断改编自 obra “Superpowers” 技能套件，文件内未声明出处=来源未知；find-skills **不引用** superpowers 系，引导第三方 `npx skills`/skills.sh 生态=实读证实）；③Office 文档技能（docx/pptx/xlsx/pdf，附 Anthropic 专有许可 LICENSE.txt（© 2025 Anthropic, PBC，非 MIT/开源许可），出处见证实/推断行）；④guizang-ppt-skill（`github.com/op7418/guizang-ppt-skill`，MIT © 2026 op7418/歸藏）；⑤skill-creator（Apache-2.0，LICENSE 版权行 `Copyright 2026 Anthropic, PBC.`，推断为 Anthropic 官方技能上游）。全部文件 `change=unchanged_since_093f`（FILES.tsv 机械列）。
- **路径口径提示**：部分技能正文引用 `~/.profer/...`（上游 Profer 品牌路径，如 profer-coach:127、session-cleaner:10、tool-builder:25、user-sense:12）与本仓实际配置根 `~/.cdutai/`（`config-paths.ts:75-88`）不一致；本仓另有 `agent-workspaces` 目录概念（`file-preview-service.ts:137` `join(configDir,'agent-workspaces')`）。是否在运行时把 `~/.profer` 重映射=未知（已查 apps/electron/src 与 packages/shared/src 未见 `.profer` 目录常量映射）。

## A. Profer 原生技能（group: profer，中英双语）

## apps--electron--default-skills--automation--SKILL.md

- 职责：Profer 内嵌定时任务（Automation）技能指令文本——指导模型判断、创建、维护 Profer 定时任务（自述 :8-10；frontmatter `name: automation` :2，`group: profer` :4，version "1.0.12" :5）。
- 消费：谁加载→系统提示 `<skills>` 块（agent-prompt-builder.ts:958-971）宣布技能目录后，模型在用户提出定时/自动化需求（description :3 触发词清单）时读取本文件；何时生效→触发词命中的对话轮次；行为约束→只能用内置 automation MCP 工具、禁用 TaskCreate/CronCreate/Bash cron/系统日历（:12）、创建前须明确 name/scheduleType/prompt/permissionMode/sessionMode/presetId（:51-58）、prompt 须自含跨运行记忆 `.context/automation/<task-slug>/notes.md` 读写与清理段（:100-105）、创建前 `list_automations` 查重（:137）、自动触发运行中禁建新任务（:151-154）。
- 来源：Profer 内置技能（自述「Profer 随附内置技能、不依赖外部安装」:10）；sourceBlob `0fdcd2d83b1b9493415b503206368ef56192b29d`；sourceSha256 `6b8297677da88b2c86f2fb59ac38ea12a1b3de6c79944c7d177a8df775431129`；change=unchanged_since_093f。
- 打包：进产物——electron-builder.yml:71-75 extraResources；启动 seed 至 `~/.cdutai/default-skills/automation/`（config-paths.ts:956）。
- 影响：删除→定时任务技能缺失，模型退化为误用禁用工具（:12）；改动→创建门槛（:47「不推荐创建时直说原因」）、查重、记忆维护等约束漂移。
- 验证：核 :2-6 frontmatter、:126-138 MCP 工具清单与产品 automation 工具注册比对、:51-58 字段清单；NOT_RUN（本轮统一）。
- 证实/推断/未知：frontmatter 与行为约束=**证实**（逐行实读）；automation MCP 六工具在产品侧的注册=**未知**（不在本篇验证范围，已查本文件自述 :130-135）。

## apps--electron--default-skills--in-app-browser--SKILL.md

- 职责：Profer 内嵌受管浏览器（Browser* 工具族）使用指南与接口选择策略（:3, :8-10；`name: in-app-browser` :2，`group: profer` :4，version "1.0.11" :5）。
- 消费：谁加载→同家族加载链；何时生效→工具列表出现 Browser* 且任务涉网页操作时（:3）；行为约束→接口优先级专用 MCP/API/CLI > Browser > WebSearch（:14-18）、首次使用须停下等用户确认风险（:26）、先 Observe 后操作且只用最近一次 refs（:28-29）、JS 执行最小化且禁读 cookies/localStorage/密码（:46, :53）、登录/验证码失败如实报告禁换站绕过（:55）、记忆不记账号/cookie/token（:69）、页面文本视为不可信输入（:73）、本地预览只用 BrowserPreviewOpen（:75）。
- 来源：Profer 内置技能；sourceBlob `646acc41a9e9b0edb349e77e566536444ec172f3`；sourceSha256 `283134317f6b46f3c754a71d6773382e45f2ca8b80e812efa38b648d112f9a12`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/in-app-browser/`（config-paths.ts:956）。
- 影响：删除→浏览器工具使用无护栏，模型可能跳过风险确认/Observe 流程；改动→安全红线（:53, :69, :73-75）松动。
- 验证：核 :34-49 工具速查表与产品 Browser* 工具集、:71-75 安全边界；NOT_RUN。
- 证实/推断/未知：约束条文=**证实**；Browser* 工具的产品实现=**未知**（未在本篇核对工具注册）。

## apps--electron--default-skills--lark-delivery--SKILL.md

- 职责：飞书/Lark 云端交付技能——把长报告/方案/纪要/文档/表格/多维表格/日程写入或更新到飞书（:3-5, :10-12；`name: lark-delivery` :2，`group: profer` :6，version "1.1.1" :7）。
- 消费：谁加载→同家族加载链；何时生效→用户要求交付到飞书/云文档/多维表格（description :3-5）；行为约束→只用官方 lark-cli 或已配置的官方 Lark OpenAPI MCP、禁止自写 Feishu OpenAPI（:12）、禁止读取/回显任何 token/App Secret/Cookie/Authorization（:18）、Bot 身份仅限消息收发（:16-17）、未登录引导 Profer 设置「飞书云端能力」且禁止伪造可用状态（:19, :54）、命令先 `--help` 发现（:30-34）、先查询再最小写入（:26, :37-43）、URL 必须取自真实响应（:47-48）、失败保留本地副本不反复重试（:55-58）、成功后附 `<profer_artifacts>` 标记（:62-72）。
- 来源：Profer 内置技能；sourceBlob `8b3f27344011f376502096e096e9e44a9956456e`；sourceSha256 `0ace94265ffe995dea98f36bf799e53e859838bf6ed98b1a6882c49eccf715d7`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/lark-delivery/`（config-paths.ts:956）。
- 影响：删除→飞书交付无凭据护栏与真实性约束，易伪造链接/泄露 token；改动→:18/:47-48 红线松动影响安全。
- 验证：核 :12/:16-19 凭据与身份规则、:30-48 命令发现与 URL 真实性、:62-72 标记格式；NOT_RUN（未实际连飞书）。
- 证实/推断/未知：规则条文=**证实**；lark-cli/MCP 在产品中的配置入口（Profer 设置「飞书云端能力」）=**推断**（技能自述 :19，UI 实现未核）。

## apps--electron--default-skills--profer-coach--SKILL.md

- 职责：Profer 使用顾问技能——识别用户在 Profer/Agent/Skill/Chat 工具中的摩擦点，沉淀为 Skill 或路由给下游技能（coach 不代做下游活；:3, :7-13；`name: profer-coach` :2，version "1.0.4" :4）。
- 消费：谁加载→同家族加载链；何时生效→触发信号（:28-43：反复纠正/抱怨工具难用等）；行为约束→轻量偏好直接顺从不沉淀、跨任务复现才成 Skill（:50-52）、值得沉淀时给完整方案让用户只确认（:58-79）、全流程最多 3 次 AskUserQuestion（:103, :203）、复用优先级 工作区 Skill→OSS 内置→CLAUDE.md→.context/note.md（:125-130）、路由后交下游即退出（:213）、每摩擦事件最多干预一次（:202-205）、改默认 Skill 的 description 须递增版本（:149）。
- 来源：Profer 内置技能；sourceBlob `1ce8ef3f8fcfa9ad190a46dc6e3bece6c8f818a6`；sourceSha256 `1f25e7178ecba029ce2fc95ef51fcf4bdd7167d6eb07fa2bc4d0b8712ef89dd6`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/profer-coach/`（config-paths.ts:956）。
- 影响：删除→摩擦沉淀/路由机制缺失；改动→干预频率上限（:202-205）与路由边界（:213）漂移，可能过度打扰用户。
- 验证：核 :128 OSS 内置清单与实际 default-skills 目录比对（已比对相符，见家族背景）、:145-147 路由目标 skill-creator/find-skills/tool-builder、:3 automation 引用；NOT_RUN。
- 证实/推断/未知：约束与交叉引用=**证实**；:127 `~/.profer/agent-workspaces/<ws>/skills/` 路径与本仓 `~/.cdutai` 配置根不一致（见家族背景路径口径提示），是否运行时重映射=**未知**。

## apps--electron--default-skills--session-cleaner--SKILL.md

- 职责：会话 JSONL→可读 Markdown 清洗技能，`profer` CLI 的薄封装，支持超长会话渐进读取（:8-14；`name: session-cleaner` :2，version 2.0.2 :4，`license: AGPL-3.0-only` :5）。
- 消费：谁加载→同家族加载链；何时生效→用户要求阅读/整理历史会话（description :3）；行为约束→按 info→outline→search→export --turns 渐进读取（:20-23）、CLI 无 turn 区间且输出超 50KB 拒绝直打（:25）、工具调用压缩显示、丢弃 thinking/tool_result（:78）、解析/去重/渲染逻辑只放 `@profer/session-core` 禁在 skill 内加（:103）、用户可见输出用用户语言（:93）。
- 来源：Profer 内置技能（自述 v1 自带 Python 解析、v2 起调 CLI :14）；sourceBlob `9648ccdc824c915f454817e61943bf31fcebb757`；sourceSha256 `720ea8a766b441362194b7465e0953410d666f16f4a0ef321fc455c59869a370`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/session-cleaner/`（config-paths.ts:956）。
- 影响：删除→会话清理无渐进读取护栏，超长会话直读易爆上下文；改动→:25 护栏与 :103 架构约束漂移。
- 验证：核 :20-51 CLI 命令表与 `profer session` 子命令实现（apps/cli，本篇未核=未知）、:104 `references/cli-usage.md`（该文件在本 group 外）；NOT_RUN。
- 证实/推断/未知：指令条文=**证实**；`profer` CLI（`bun <repo>/apps/cli/src/index.ts` :98）与 `@profer/session-core` 的存在=**推断**（自述，未在本篇核对仓库路径）；:10 `~/.profer/agent-sessions/` 路径口径见家族背景=**未知**是否重映射。

## apps--electron--default-skills--tool-builder--SKILL.md

- 职责：交互式创建/调试/删除 Chat 模式自定义 HTTP 工具的技能（:6-8；`name: tool-builder` :2，version "1.0.2" :4）。
- 消费：谁加载→同家族加载链；何时生效→用户要在 Chat 工具中加自定义工具（description :3）；行为约束→逐项询问用途/URL/鉴权/参数（:14-19）、配置写 `~/.profer/chat-tools.json`（:25）并按 id 去重 append 到 customTools + toolStates.enabled（:92-96）、id 须 `custom-` 前缀 + slug（:61）、category 固定 "custom"、executorType 固定 "http"（:65-66）、参数类型限 string/number/boolean 可加 enum（:83-87）、所有用户可见输出用用户语言（:168）。
- 来源：Profer 内置技能；sourceBlob `8c0fe04b1922d711dfe11226827336864a8205f5`；sourceSha256 `aa0b5db14c8d65baa3f3a45d66f5624f3c4ba39cc1fa928043a9bc310eebf818`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/tool-builder/`（config-paths.ts:956）。
- 影响：删除→自定义工具创建流程无约束（id/字段规则丢失）；改动→:92-96 写文件四步若漂移会破坏 chat-tools.json 结构。
- 验证：核 :25/:93/:117 配置路径、:61-66 id/category 规则与 Chat 工具加载实现比对（后者未核=未知）；NOT_RUN。
- 证实/推断/未知：指令条文=**证实**；`~/.profer/chat-tools.json` 的实际消费方=**未知**（已查 apps/electron/src 未见同名常量，见家族背景路径口径提示）。

## apps--electron--default-skills--user-sense--SKILL.md

- 职责：Profer 内置「用户感知」技能——构建/维护/消费本地用户画像 `user-profile.md`（:8-12；`name: user-sense` :2，`group: profer` :4，version "1.0.2" :5）。
- 消费：谁加载→同家族加载链；何时生效→需要用户画像或首次画像构建（description :3、决策流 :22-29）；行为约束→全本地处理结论永不上传（:16）、只存推断结论绝不记文件路径/文件名/URL（:17, :60, :81）、扫描前须说明范围并取得同意（:18, :27）、用户可禁用/清除且禁用源永不再采（:19, :91）、auto/manual 分块与「来源/置信度/时间」格式（:87-90）、不采浏览器历史/聊天记录/密码/cookie（:102）。
- 来源：Profer 内置技能（:105 声明本 Skill 是流程定义，原生扫描器 ProfileScanner 为规划中的增强）；sourceBlob `4d27abd45acb3b75b5896b1ac36e3e82fafbb00c`；sourceSha256 `cf67ac26632e17af9c2b8a8bb35f93a0d638daf610a6dcdeb179498ffe20eb76`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/user-sense/`（config-paths.ts:956）。
- 影响：删除→用户画像机制缺失；改动→隐私红线（:14-20）松动是最高风险（路径/URL 泄漏进画像）。
- 验证：核 :14-20 隐私约束、:12 画像路径 `workspace-files/.context/memory-archive/user-profile.md`、:83-92 格式规则；NOT_RUN（未跑扫描流程）。
- 证实/推断/未知：隐私与格式条文=**证实**；:105 ProfileScanner「未来接管」=**证实**（原文如此，实现不存在于本技能内）；Windows PowerShell 示例（:33-80）在非 Windows 平台适用性=**未知**。

## B. 英文通用技能（brainstorming/executing-plans/writing-plans 引用 superpowers 系=改编推断 obra 套件；find-skills 引导 skills.sh 生态、无 superpowers 引用）

## apps--electron--default-skills--brainstorming--SKILL.md

- 职责：创意/功能开发前的构思技能——把想法探索为设计与规格（:3, :8-12；`name: brainstorming` :2，version "1.0.0" :4）。
- 消费：谁加载→同家族加载链；何时生效→description「You MUST use this before any creative work」（:3）；行为约束→先查项目现状（:19）、每条消息只问一个问题且优先选择题（:20-22）、提 2-3 种带权衡方案先给推荐（:26-28）、设计按 200-300 词分段确认（:32-33）、YAGNI（:53）、定稿写 `docs/plans/YYYY-MM-DD-<topic>-design.md` 并提交（:40-42）。
- 来源：英文通用技能，正文引用 `elements-of-style:writing-clearly-and-concisely`（:41）、`superpowers:using-git-worktrees`（:46）、`superpowers:writing-plans`（:47）——三个命名空间技能均不在 default-skills 目录（已 ls 核实）；文件内未声明出处=**来源未知**（推断改编自 obra “Superpowers” 套件）。sourceBlob `33007ba8bd25c4d6d12efe20deb59bdc2fc49b59`；sourceSha256 `f9a9d491aaa9993e481030cff732481abab587a6d01ad1cf58f5cbf7806e455f`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/brainstorming/`（config-paths.ts:956）。
- 影响：删除→创造性工作前置设计流程缺失；改动→分段确认/一问一答约束漂移。
- 验证：核 :1-8 frontmatter（:6-7 存在 frontmatter 外重复 `version`+`---` 格式缺陷，实读证实）、:41/:46/:47 外部技能引用确实缺失（已核）；NOT_RUN。
- 证实/推断/未知：约束与引用=**证实**；上游出处=**未知**；superpowers 系技能的安装来源=**未知**（find-skills 提供 `npx skills add` 安装通道，见下）。

## apps--electron--default-skills--executing-plans--SKILL.md

- 职责：在独立会话中按检查点分批执行已写好的实现计划（:3, :8-14；`name: executing-plans` :2，version "1.0.0" :4）。
- 消费：谁加载→同家族加载链；何时生效→用户有书面实现计划并要求执行（description :3）；行为约束→开始须声明使用本技能（:16）、先批判性评审计划并建 TodoWrite（:22-24）、默认每批前 3 个任务、跑验证、逐个标状态（:27-33）、批次间只报告并等反馈（:36-39, :77）、遇阻塞/计划缺口/验证反复失败立即停下求澄清（:56-62）、完成后须用 `superpowers:finishing-a-development-branch` 收尾（:50-52）、未经同意不得在 main/master 开工（:79）。
- 来源：英文通用技能（引用 `superpowers:finishing-a-development-branch` :51/:86、`superpowers:using-git-worktrees` :84、`superpowers:writing-plans` :85，均不在目录内=已核实）；出处未声明=**来源未知**。sourceBlob `5ad6cc92608527a483e0a38da271fea6d5345324`；sourceSha256 `6db8f427e78fc0763a75e3ad856a3aa0ad73f09e3802dca5a641851fd1cf5d4f`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/executing-plans/`（config-paths.ts:956）。
- 影响：删除→计划执行失去批次纪律与停止条件；改动→:56-62 停止条件松动会导致瞎猜硬干。
- 验证：核 :1-8 frontmatter（:6-7 同款格式缺陷，实读证实）、:27-33 批次规则、:79 分支红线；NOT_RUN。
- 证实/推断/未知：约束=**证实**；上游出处=**未知**；与 writing-plans 互为上下游（:85）=**证实**。

## apps--electron--default-skills--find-skills--SKILL.md

- 职责：帮用户从开放 agent skills 生态（skills.sh）发现并安装第三方技能（:8-10；`name: find-skills` :2，version "1.0.0" :4）。
- 消费：谁加载→同家族加载链；何时生效→用户问 "how do I do X"/"find a skill for X" 或想扩展能力（description :3）；行为约束→先理解领域+具体任务再搜索（:38-44）、结果展示技能名/安装命令/skills.sh 链接三项（:71-75）、仅用户同意后安装 `npx skills add <owner/repo@skill> -g -y`（:91-97）、搜不到时承认并建议 `npx skills init` 自建（:121-125）。
- 来源：英文通用技能；出处未声明=**来源未知**。sourceBlob `0798a9ce6661caa99042b5057d8b4ba6bdcdbacf`；sourceSha256 `b416b645434c33b7aa5f395bbb80f854f678430802eeb60aa7f5d79c20eb94a6`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/find-skills/`（config-paths.ts:956）。
- 影响：删除→第三方技能安装引导缺失；改动→「用户同意后才安装」（:91-97）松动会造成未经许可的全局安装（-g）。
- 验证：核 :29-32 `npx skills` 命令表、:91-97 安装参数语义、:65/:117 示例源；NOT_RUN（未实测 npx skills）。
- 证实/推断/未知：指令条文=**证实**（含 :1-8 frontmatter :6-7 同款格式缺陷，实读证实）；`npx skills` CLI 与 skills.sh 生态可用性=**未知**（外部服务）。

## apps--electron--default-skills--writing-plans--SKILL.md

- 职责：拿到规格/需求后、动代码前，编写详尽的分步实现计划（:3, :8-12；`name: writing-plans` :2，version "1.0.0" :4）。
- 消费：谁加载→同家族加载链；何时生效→用户有 spec/需求要落计划（description :3）；行为约束→计划存 `docs/plans/YYYY-MM-DD-<feature-name>.md`（:20）、假设执行者零上下文、每步 2-5 分钟、TDD/DRY/YAGNI（:24-29）、计划头必须含 `REQUIRED SUB-SKILL: superpowers:executing-plans` 指令（:33-47）、精确文件路径+完整代码+带期望输出的命令（:93-95）、完成后提供 Subagent-Driven / Parallel Session 两种执行交接（:103-118）。
- 来源：英文通用技能（引用 `superpowers:executing-plans` :38/:107/:118、`superpowers:subagent-driven-development` :112，均不在目录内=已核实）；出处未声明=**来源未知**。sourceBlob `4c523a8dd9ce3ec4d1913adb102e0524ef340c07`；sourceSha256 `5c0a92c6f60abdf9e83df00f391444aa817d8cf8be9c47b5269a082be5b015c3`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/writing-plans/`（config-paths.ts:956）。
- 影响：删除→计划文档规范与执行交接缺失；改动→:33-47 计划头契约漂移会使 executing-plans 链断。
- 验证：核 :1-8 frontmatter（:6-7 同款格式缺陷，实读证实）、:31-47 header 模板、:103-118 交接二选一；NOT_RUN。
- 证实/推断/未知：约束=**证实**；上游出处=**未知**；与 brainstorming（:18 提及在专用 worktree 中运行）联动=**证实**。

## C. Office 文档技能（docx/pptx/xlsx/pdf；Anthropic 专有许可材料，推断为 Claude Skills 官方文档技能系）

## apps--electron--default-skills--docx--LICENSE.txt

- 职责：docx 技能的上游许可文本——Anthropic 专有材料许可（© 2025 Anthropic, PBC），非开源许可（:1，:3「LICENSE: Use of these materials…」，:29-30 Anthropic 保留全部权利）；附加限制禁止提取/复制/衍生/分发/销售/逆向（:16-24）。
- 消费：谁加载→运行时无代码加载点（已查加载链：技能装配只读 SKILL.md，global-skill-manager.ts:239、agent-prompt-builder.ts:962；LICENSE.txt 无读取点=已 grep apps/electron/src 核实）；何时生效→随包分发的法律告知，人工/合规阅读；行为约束→约束本技能材料的使用与分发（:16-24），不约束模型运行时行为。
- 来源：Anthropic 技能材料许可（与 pptx/pdf/xlsx 的 LICENSE.txt 逐字节相同，同一 blob `c55ab42224874608473643de0a85736b7fec0730`）；sourceBlob `c55ab42224874608473643de0a85736b7fec0730`；sourceSha256 `79f6d8f5b427252fa3b1c11ecdbdb6bf610b944f7530b4de78f770f38741cfaa`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75 filter **/*）；seed 至 `~/.cdutai/default-skills/docx/`（config-paths.ts:956）。
- 影响：删除→技能目录缺失随附许可、违反分发条件（:16-24）；改动→许可文本失真。对模型行为无直接影响。
- 验证：核 :1/:3/:29-30 版权与许可类型、四目录 LICENSE.txt 哈希一致（已核同一 blob）；NOT_RUN。
- 证实/推断/未知：许可内容=**证实**；其与 docx/SKILL.md 的指向关系=**证实**（docx/SKILL.md:4 明写「license: Proprietary. LICENSE.txt has complete terms」，pptx/pdf/xlsx 三份 :4 同文，实读核实；r1 修正 F-01：原「docx 未明示」为假陈述）。

## apps--electron--default-skills--docx--SKILL.md

- 职责：Word/.docx 创建、读取、编辑、修订/批注、查找替换的技能指令主文件（`name: docx` :2，`license: Proprietary` :4，version "1.0.1" :5；Overview :10、Quick Reference :14、Creating New Documents :57、Editing Existing Documents :399、XML Reference :457、Dependencies :586）。
- 消费：谁加载→同家族加载链（系统提示 `<skills>` 块→模型按 description :3 触发词读取本文件）；何时生效→涉 .docx 产物的对话轮次；行为约束→页面尺寸必须显式设置（US Letter 12240×15840 DXA，:84, :381）、禁 unicode bullets 用 LevelFormat.BULLET（:143, :384）、表格双宽度+WidthType.DXA 禁 PERCENTAGE（:179-183, :208, :390）、编辑走 unpack→改 XML→pack 三步（:401-437）、修订/批注作者用 "Claude"（:413）、字符串替换用 Edit 工具禁写 Python（:415）、smart quotes 用 XML 实体（:417）。
- 来源：Anthropic 文档技能系（LICENSE.txt ©2025 Anthropic、修订作者默认 "Claude" :413，推断为 Claude Skills docx 技能）；sourceBlob `bed79c37c554b152fa4a5820281bb525b0ad38f6`；sourceSha256 `d313d9466c2a7cb4e15a10f2665510271b556f53f094fbe7cbf4efc414cd4738`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/docx/`（config-paths.ts:956）；随附 scripts/office（含 validate.py 与 microsoft/ISO XSD，见 vendor-xsd__microsoft 组）一并打包。
- 影响：删除→Word 文档创建/编辑工作流失约束，docx-js 默认 A4、unicode bullets 等已知坑（:379-391）复发；改动→:401 三步编辑流程漂移易产出损坏 .docx。
- 验证：核 :2-5 frontmatter、:586-591 依赖清单（pandoc/docx npm/LibreOffice/Poppler）、脚本引用 `scripts/office/soffice.py`（:27, :43, :590）、`scripts/office/unpack.py`（:37, :405）、`scripts/accept_changes.py`（:52）、`scripts/office/validate.py`（:78 创建后必验）、`scripts/comment.py`（:429-433）、`scripts/office/pack.py`（:439）与磁盘实存比对（已 ls 核实存在）；NOT_RUN（未跑脚本）。
- 证实/推断/未知：指令与脚本引用=**证实**；上游精确出处=**推断**；脚本在各平台的可用性=**未知**。

## apps--electron--default-skills--pptx--LICENSE.txt

- 职责：pptx 技能的上游许可文本——与 docx/LICENSE.txt 逐字节相同（Anthropic 专有材料许可 © 2025 Anthropic, PBC；:13-24 附加限制含禁止向第三方分发/转授权）。
- 消费：谁加载→运行时无代码加载点（同 docx/LICENSE.txt，已 grep 核实）；何时生效→随包法律告知，人工/合规阅读；行为约束→约束材料使用分发，不约束模型运行时。
- 来源：同 blob `c55ab42224874608473643de0a85736b7fec0730`（四 LICENSE.txt 同一）；sourceBlob `c55ab42224874608473643de0a85736b7fec0730`；sourceSha256 `79f6d8f5b427252fa3b1c11ecdbdb6bf610b944f7530b4de78f770f38741cfaa`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pptx/`（config-paths.ts:956）。
- 影响：删除→缺失随附许可、违反 :13-24 分发条件；对模型行为无直接影响。
- 验证：核 :1/:13-24 条款、与 docx/LICENSE.txt 哈希一致（已核）；NOT_RUN。
- 证实/推断/未知：许可内容=**证实**；与 pptx/SKILL.md 的指向关系=**证实**（pptx/SKILL.md:4 明写「license: Proprietary. LICENSE.txt has complete terms」，实读核实；r1 修正 N-01：原误标推断）。

## apps--electron--default-skills--pptx--SKILL.md

- 职责：PowerPoint/.pptx 创建、读取、编辑的技能指令主文件，含 Profer 定制视觉规范（`name: pptx` :2，version "1.2.3" :5；Profer Default Visual Conventions :10、Quick Reference :22、Editing Workflow :49、Creating from Scratch :58、Design Ideas :71、Profer Official Preview :161、QA :167、Dependencies :264）。
- 消费：谁加载→同家族加载链；何时生效→任何 .pptx 输入/输出任务（description :3）；行为约束→默认「Cloud Dancer Academic（云端舞者学术风）」且须先读 `workspace-files/.context/profer-ppt-design-system.md`（:12）、禁标题下强调线（:157）、禁纯文字页（:154）、必须走 Profer 官方预览 open_file_preview + inspect_file_preview 且禁 Preview.html/截图绕过（:161-165, :191）、QA 心态「首渲染几乎不可能正确」（:169-171）、视觉 QA 用 subagent（:193）、占位符 grep 清零（:184-187）、至少一轮修复-验证循环才准宣称完成（:231）。
- 来源：Anthropic pptx 技能系 + Profer 品牌定制层（:10/:161 Profer 命名，推断本地改造）；sourceBlob `cb38dcad755dc64637f52d343d18c2f6673ab13e`；sourceSha256 `5536ba7d92eaf0cd49b59bcdf0bc650eb20dd92a0dabc3249dcd5853fce18a0c`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pptx/`（config-paths.ts:956）；scripts（chartlib.py/gradient.js/office 工具）一并打包。
- 影响：删除→演示文稿工作流失约束与官方预览强制；改动→:161-165 预览红线或 :12 设计规范漂移直接影响交付视觉质量。
- 验证：核 :2-5 frontmatter、:264-270 依赖（markitdown[pptx]/Pillow/pptxgenjs/LibreOffice/Poppler）、交叉引用 editing.md（:27, :51）、pptxgenjs.md（:28, :60）、scripts/chartlib.md（:29, :64）、scripts/gradient.js（:30）均实存（已核）；NOT_RUN。
- 证实/推断/未知：指令与交叉引用=**证实**；上游改造程度=**推断**；`workspace-files/.context/profer-ppt-design-system.md` 由工作区提供=**推断**（:12 引用，文件不在仓内）。

## apps--electron--default-skills--pptx--editing.md

- 职责：基于模板的 PPTX 编辑参考——unpack→改 XML→pack 的脚本化流程与陷阱（:1 「# Editing Presentations」；Template-Based Workflow :3、Scripts :46、Slide Operations :101、Editing Content :113、Common Pitfalls :138）。
- 消费：谁加载→由 pptx/SKILL.md 指定按需读取（SKILL.md:27「Edit or create from template → Read editing.md」、SKILL.md:51）；何时生效→编辑/模板改造任务进入 Editing Workflow 时；行为约束→结构自建不用 subagent、逐页 XML 内容可并行 subagent（:31, :38）、用 Edit 工具禁 sed/Python（:117, :125）、禁手工拷 slide 文件须用 add_slide.py（:109）、禁 unicode bullets 用 `<a:buChar>/<a:buAutoNum>`（:129）、多条目各起 `<a:p>`（:157）、smart quotes 用 XML 实体（:187-192）、用 defusedxml.minidom（:205）。
- 来源：同 pptx 技能系；sourceBlob `f873e8a04ab20b5a79543ea28729149cfd70ef2c`；sourceSha256 `6cb47c3ab17e60b7de37e83131c409ef5a90a01bfb54e999905a9c9f7dd88e68`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pptx/`（config-paths.ts:956）。
- 影响：删除→模板编辑流程失参考，add_slide.py 等 5 脚本（:48-54）使用规则丢失；改动→:109/:125 红线漂移易产出损坏 PPTX。
- 验证：核 :48-54 脚本表（unpack/add_slide/clean/pack/thumbnail.py）与磁盘实存、:138-205 陷阱清单；NOT_RUN。
- 证实/推断/未知：内容=**证实**；脚本跨平台行为=**未知**。

## apps--electron--default-skills--pptx--pptxgenjs.md

- 职责：PptxGenJS（Node.js）从零创建演示文稿的 API 教程与坑清单（:1 「# PptxGenJS Tutorial」；Setup :3、Text :29、Shapes :85、Images :148、Icons :209、Tables :277、Charts :298、Slide Masters :361、Common Pitfalls :377、Quick Reference :425）。
- 消费：谁加载→由 pptx/SKILL.md 指定按需读取（SKILL.md:28「Create from scratch → Read pptxgenjs.md」、SKILL.md:60）；何时生效→无模板从零生成 PPTX 时；行为约束→颜色禁 "#" 前缀 hex（损坏文件，:381）、禁 8 位 hex 透明度（:387）、bullet 用 `bullet: true`（:393）、禁跨调用复用 options 对象（PptxGenJS 原地变异，:401）、禁 ROUNDED_RECTANGLE 叠加描边（:412）等 8 大坑（:379-421）。
- 来源：同 pptx 技能系；sourceBlob `c09d5600fbe0e2e1839683e7ab2d77388c4a83e6`；sourceSha256 `ee6ced0d657bc6fadd3ee9774740e41a391bfd6ba61844f67bce2fc88f40bc21`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pptx/`（config-paths.ts:956）。
- 影响：删除→从零生成流程失去 API 约定与坑清单，:381 hex 坑会直接产出损坏文件；改动→坑清单漂移。
- 验证：核 :377-421 Common Pitfalls、:37 charSpacing、:133 渐变须 scripts/gradient.js（PptxGenJS 无原生渐变）、:211/:249 图标 rasterize 流程；NOT_RUN。
- 证实/推断/未知：内容=**证实**；PptxGenJS 库行为描述与库版本对应性=**未知**（未锁版本）。

## apps--electron--default-skills--xlsx--LICENSE.txt

- 职责：xlsx 技能的上游许可文本——与 docx/LICENSE.txt 逐字节相同（Anthropic 专有材料许可 © 2025 Anthropic, PBC；:16-24 禁提取/复制/衍生/分发/逆向）。
- 消费：谁加载→运行时无代码加载点（已 grep 核实）；何时生效→随包法律告知；行为约束→约束材料使用分发，不约束模型运行时。
- 来源：同 blob `c55ab42224874608473643de0a85736b7fec0730`；sourceBlob `c55ab42224874608473643de0a85736b7fec0730`；sourceSha256 `79f6d8f5b427252fa3b1c11ecdbdb6bf610b944f7530b4de78f770f38741cfaa`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/xlsx/`（config-paths.ts:956）。
- 影响：删除→缺失随附许可、违反 :16-24 分发条件；对模型行为无直接影响。
- 验证：核 :1/:16-24 条款、三处同哈希（已核）；NOT_RUN。
- 证实/推断/未知：许可内容=**证实**；与 xlsx/SKILL.md:4「license: Proprietary. LICENSE.txt has complete terms」指向关系=**证实**（明文）。

## apps--electron--default-skills--xlsx--SKILL.md

- 职责：Excel/.xlsx 创建、编辑、分析的技能指令主文件，含财务建模输出规范（`name: xlsx` :2，version "1.0.1" :5；Requirements for Outputs :8、Financial models :23、Important Requirements :73、CRITICAL: Use Formulas, Not Hardcoded Values :100、Common Workflow :133、Recalculating :208、Formula Verification Checklist :228、Best Practices :266）。
- 消费：谁加载→同家族加载链；何时生效→表格文件为主要输入/输出（description :3）；行为约束→交付零公式错误（#REF!/#DIV/0! 等，:16）、改模板完全沿用原格式且模板惯例优先（:19-21）、财务配色蓝输入/黑公式/绿跨表/红外链/黄假设（:29-33）、必须用 Excel 公式而非 Python 硬编码（:100-102, :131）、假设独立单元格（:48-50）、用公式后必须跑 `python scripts/recalc.py` 重算并修复（:138-150）、openpyxl `data_only=True` 保存会永久丢公式（:275）。
- 来源：Anthropic xlsx 技能系（LICENSE.txt ©2025）；sourceBlob `3e0965299f7c7fe2f02a65c224d0c1196511ed0e`；sourceSha256 `2e587490e26cb376a38d793cfb8b1ccb13ff046fa1e3ae853dc011492c424afd`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/xlsx/`（config-paths.ts:956）；scripts/recalc.py、scripts/office 一并打包。
- 影响：删除→公式纪律与重算验证缺失，交付物易带静默错误值；改动→:100-102 红线漂移直接损害数据正确性。
- 验证：核 :75/:138-150 `scripts/recalc.py` 引用与磁盘实存、:75 `scripts/office/soffice.py`、:228-264 公式核对清单；NOT_RUN（未跑 recalc）。
- 证实/推断/未知：指令=**证实**；磁盘存在的 scripts/office/validate.py、schemas/ 等未被本文件引用=**证实**（全文 grep 无引用，推断为 docx/pptx 共享工具随目录复制而来）；LibreOffice 自动配置行为=**推断**（:75/:222 自述）。

## apps--electron--default-skills--pdf--LICENSE.txt

- 职责：pdf 技能的上游许可文本——与 docx/LICENSE.txt 逐字节相同（Anthropic 专有材料许可 © 2025 Anthropic, PBC；:20 禁「Create derivative works」）。
- 消费：谁加载→运行时无代码加载点（已 grep 核实）；何时生效→随包法律告知；行为约束→约束材料使用分发，不约束模型运行时。
- 来源：同 blob `c55ab42224874608473643de0a85736b7fec0730`；sourceBlob `c55ab42224874608473643de0a85736b7fec0730`；sourceSha256 `79f6d8f5b427252fa3b1c11ecdbdb6bf610b944f7530b4de78f770f38741cfaa`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pdf/`（config-paths.ts:956）。
- 影响：删除→缺失随附许可、违反 :16-24 分发条件；对模型行为无直接影响。
- 验证：核 :1/:20 条款、三处同哈希（已核）；NOT_RUN。
- 证实/推断/未知：许可内容=**证实**；与 pdf/SKILL.md 的指向关系=**证实**（pdf/SKILL.md:4 明写「license: Proprietary. LICENSE.txt has complete terms」，实读核实；r1 修正 N-01：原误标推断）。

## apps--electron--default-skills--pdf--SKILL.md

- 职责：PDF 处理技能指令主文件，含 CDUT Studio 双态内核契约（`name: pdf` :2，description :3「CRITICAL KERNEL CONTRACT: Attached PDFs are pre-parsed by CDUT Studio's high-precision kernel engine into dual-state…」自动注入 `<document_evidence>`；version "1.2.2" :5；Read-Only Operations :14、Modification :36、Python Libraries :40、Command-Line Tools :159、Common Tasks :189、Quick Reference :254）。
- 消费：谁加载→同家族加载链；何时生效→PDF 检视/总结/修改/创建（description :3）；行为约束→预摄取 PDF 禁用 pdfplumber/pypdf/pymupdf/pdftotext 等抽文本（:22）、引用格式 `[第X页·位置/图表名](#blockId)` 并信任 `<document_evidence>`（:26）、转 Markdown 产物已预写直接报路径（:25）、仅无文字层才走 OCR（:31-32）、ReportLab 禁 Unicode 上下标字符改 `<sub>/<super>`（:141-157）、仅用户要求修改/填表/OCR 时进修改章节（:38）。
- 来源：Anthropic pdf 技能系 + CDUT Studio 本地内核契约层（:3，推断本地改造）；sourceBlob `90d20eff61c4d71f6ffa3674dc8c15e55e865fa4`；sourceSha256 `8363a0acb58f6a0c945a15da3f8778713f6017b59dedf142bcfef89ca76e4314`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pdf/`（config-paths.ts:956）；pdf/scripts 8 脚本一并打包（由 forms.md 调用）。
- 影响：删除→PDF 双态内核契约与抽取禁令缺失，模型会重复解析浪费上下文或与内核产物冲突；改动→:22/:26 契约漂移破坏 `<document_evidence>` 信任链。
- 验证：核 :2-5 frontmatter、:22 禁令、:266/:272 FORMS.md 与 :270-273 REFERENCE.md 引用（实存文件名为小写 forms.md/reference.md，:266-273 引用大小写不一致=已核）、:159-252 CLI/库清单；NOT_RUN。
- 证实/推断/未知：指令与契约=**证实**；内核预解析实现（clean_markdown_path/anchored_markdown_path）在产品侧=**推断**（description 自述，实现位于其他模块未核）；FORMS/REFERENCE 大小写差异=**证实**（实读）。

## apps--electron--default-skills--pdf--forms.md

- 职责：PDF 表单填写分布式操作手册——可填写字段（fill_fillable_fields.py）与不可填写字段（文本注释法）、结构提取优先、视觉估计兜底（Fillable fields :6、Non-fillable fields :78、Approach A 结构坐标 :96、Approach B 视觉估计 :172、Hybrid :256、四步流程 :270-294）。
- 消费：谁加载→由 pdf/SKILL.md 指定按需读取（SKILL.md:272「If you need to fill out a PDF form, follow the instructions in FORMS.md」、SKILL.md:266）；何时生效→填表单任务；行为约束→步骤顺序强制「Do not skip ahead to writing code」（:1）、先 `check_fillable_fields` 判分支（:3-4）、填前必须 `check_bounding_boxes.py` 校验（:166-168, :249-252）、混合法坐标须统一 PDF 坐标系（:263-266）、填完转图片验证位置（:286-294）。
- 来源：同 pdf 技能系；sourceBlob `6e7e1e0d9e6ae17215db3e130aea3c3c546487e6`；sourceSha256 `9530b3f57034792e0242a3abfe8b3c296466329551916f2ff6c5a70db78f7e44`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pdf/`（config-paths.ts:956）。
- 影响：删除→填表单流程无护栏，坐标错填/越界填表复发；改动→:166-168 校验步骤漂移直接产出错误表单。
- 验证：核 :4/:8/:54/:74-75/:84/:166/:284 七个脚本名与 pdf/scripts 磁盘实存、:270-279 校验步；NOT_RUN（未跑脚本）。
- 证实/推断/未知：内容=**证实**；:4 `check_fillable_fields` 未带 `.py` 后缀=**证实**（原文如此，磁盘为 check_fillable_fields.py，推断笔误）；ImageMagick 裁剪流程（:193-207）跨平台=**未知**。

## apps--electron--default-skills--pdf--reference.md

- 职责：PDF 高级处理参考——pypdfium2 渲染、JS 库（pdf-lib/pdfjs-dist）、poppler/qpdf 进阶、reportlab 表格、抽图/批处理/裁剪工作流、性能与故障排除、库许可清单（pypdfium2 :7、JavaScript Libraries :38、Advanced CLI :221、Advanced Python :291、Complex Workflows :334、Performance :419、Troubleshooting :456、License Information :492）。
- 消费：谁加载→由 pdf/SKILL.md 指定按需读取（SKILL.md:270-273「see REFERENCE.md」三处）；何时生效→高级 pypdfium2/JS 库/故障排除场景；行为约束→文本/表格抽取已由内核预摄取禁用 pypdfium2/pdfplumber/pdftotext 抽取（:5, :426-427）、抽图用 pdfimages 且预览低分/成品高分（:429-431）、填表单 pdf-lib 保结构最好且先预校验（:433-435）、大 PDF 流式处理（:421-424, :437-454）。
- 来源：同 pdf 技能系；sourceBlob `239429bb4fab1a0e40266c920a63f55b63f31efd`；sourceSha256 `c197324c4a4d4094d7eb0300d53f2a036d05acb01576a85ca4e653a7bb9059f0`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/pdf/`（config-paths.ts:956）。
- 影响：删除→高级参考与许可清单缺失；改动→:5/:426-427 抽取禁令漂移会诱发重复解析。
- 验证：核 :492-501 许可清单（pypdf BSD/pdfplumber MIT/pypdfium2 Apache-BSD/reportlab BSD/poppler GPL-2/qpdf Apache/pdf-lib MIT/pdfjs-dist Apache）、:5/:426-427 禁令；NOT_RUN。
- 证实/推断/未知：内容=**证实**；第三方库许可声明与实际随包分发物的对应性=**未知**（lib 是否随包未核）。

## D. guizang-ppt-skill（上游 `github.com/op7418/guizang-ppt-skill`，MIT © 2026 op7418/歸藏）

## apps--electron--default-skills--guizang-ppt-skill--LICENSE

- 职责：guizang-ppt-skill 项目的 MIT License 全文（:1「MIT License」，:3「Copyright (c) 2026 op7418 (歸藏)」，:5-13 标准条款，:15-21 AS IS 免责）。
- 消费：谁加载→运行时无代码加载点（已 grep 核实；README.md:216-218 与 README.en.md:215-217 互链该许可）；何时生效→随包法律告知，人工/合规阅读；行为约束→约束本技能材料的使用分发（MIT 条款），不约束模型运行时。
- 来源：上游 op7418/guizang-ppt-skill 随附许可；sourceBlob `a638b33c53c25fb7c32d81ab52257f47b726b16f`；sourceSha256 `2b33f1f1d11c7bc2dc2985f4a7f014338323ff58a1cd6ae91c16b727275a3df3`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/guizang-ppt-skill/`（config-paths.ts:956）。
- 影响：删除→MIT 分发要求（保留版权与许可声明）不满足；对模型行为无直接影响。
- 验证：核 :1/:3 版权行、与 README.md:218「MIT © 2026 op7418」一致（已核）；NOT_RUN。
- 证实/推断/未知：许可与版权=**证实**。

## apps--electron--default-skills--guizang-ppt-skill--README.en.md

- 职责：guizang-ppt-skill 英文 README——生成单文件 HTML 横向翻页网页 PPT、配图、多平台封面的技能说明（:3 概述；What you get :20、Install :38、Workflow :75、Style B Swiss :90、Directory :137、Theme presets :160、Core design principles :187、License :215）。
- 消费：谁加载→运行时无加载点（已查加载链，技能装配只读 SKILL.md）；何时生效→人工阅读（安装/贡献者文档）；行为约束→对模型无直接约束（约束在 SKILL.md），但 :209-213 要求改动时同步更新 references/ 8 文件与模板、脚本。
- 来源：上游 `github.com/op7418/guizang-ppt-skill`（:43, :51, :60），作者 Guizang/歸藏（:10, x.com/op7418）；sourceBlob `58b9373400cb71aa659124252c6a401f5448187d`；sourceSha256 `6941afa904094fa0360bb182c17d4221394b190f5c8bb500afa6c85ba68c5d9b`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/guizang-ppt-skill/`（config-paths.ts:956）。
- 影响：删除→上游说明/安装文档缺失；改动→:139-158 目录树与实际文件漂移会误导维护者。
- 验证：核 :139-158 目录树与磁盘实存比对（SKILL.md/assets/references/scripts；注意 `references/swiss-map-component.md` 被 SKILL.md:262/:291 引用但不在 README 目录树=已核）、:215-217 许可行；NOT_RUN。
- 证实/推断/未知：README 内容=**证实**；上游仓库当前状态=**未知**（外部）。

## apps--electron--default-skills--guizang-ppt-skill--README.md

- 职责：guizang-ppt-skill 中文 README（与英文版同构）——网页 PPT/配图/封面技能说明（:5 概述；效果 :22、安装 :40、使用流程 :77、Style B 瑞士风 :92、目录结构 :139、主题色预设 :161、核心设计原则 :188、License :216）。
- 消费：谁加载→运行时无加载点（同英文版）；何时生效→人工阅读；行为约束→对模型无直接约束，但 README 侧规则与 SKILL.md 一致：主题色不许自定义 hex（:163, :177）、瑞士风正文页只能选 S01-S22（:96）、配图三规则（:120-124）。
- 来源：上游 `github.com/op7418/guizang-ppt-skill`（:45, :53, :62），MIT © 2026 op7418（:216-218）；sourceBlob `6d5fc196a7ef917a42ac5bd16b0834770487619f`；sourceSha256 `229f054af0f32926993505006c14fdae4a2a3a938cda62b62e5e820f803e0738`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/guizang-ppt-skill/`（config-paths.ts:956）。
- 影响：删除→中文说明缺失；改动→:161-186 主题色预设说明与 SKILL.md:160-181 漂移会引发错误用色。
- 验证：核 :141-159 目录树、:86 checklist.md / :126 image-prompts.md / :107/:212 `scripts/validate-swiss-deck.mjs` 引用与磁盘实存（已核）；NOT_RUN。
- 证实/推断/未知：README 内容=**证实**；与英文版的一致性=**推断**（抽查对应节，未逐行对照）。

## apps--electron--default-skills--guizang-ppt-skill--SKILL.md

- 职责：guizang 网页 PPT 技能主文件（「Magazine Web Ppt」:7）——横向翻页 HTML 演示（Style A 杂志风 :13 / Style B 瑞士风 :21）的完整生成工作流（`name: guizang-ppt-skill` :2，version "1.0.1" :4；Workflow :45、Resource Map :412、Core Design Principles :453）。
- 消费：谁加载→同家族加载链（系统提示→模型按 description :3 触发词「杂志风 PPT/瑞士风 PPT/Swiss Style」读取）；何时生效→网页 PPT 生成任务；行为约束→建前逐项澄清且风格 A/B 必问（:51, :62，Codex 环境每批最多 1-3 问 :55）、主题色只许 5+4 套预设禁自定义 hex（:160-181）、写页前必须读模板 `<style>` 做类名 pre-flight、类名不许臆造（:187-203）、瑞士风图必须进 data-image-slot（:320-327）、生成后逐项过 checklist（:346）、必须开页面目视验证并与参考 PPT 并排对比（:348-357）、Style B 21 条 must-check（:369-391）。
- 来源：上游 `github.com/op7418/guizang-ppt-skill`（README:45），MIT © 2026 op7418；sourceBlob `7b5a7cc1634d1fbecf8d2bdc424c36904a91d08d`；sourceSha256 `df0bb2963590bd17ca2139ffcdfe6d9fb93b86f61d705b303f57b422f95b817a`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/guizang-ppt-skill/`（config-paths.ts:956）；assets/template.html、template-swiss.html、references/、scripts/validate-swiss-deck.mjs、assets/motion.min.js（:451）一并打包。
- 影响：删除→网页 PPT 工作流整体缺失；改动→:187-203 类名 pre-flight 或 :369-391 瑞士风红线漂移直接产生视觉违规产出。
- 验证：核 :412-451 Resource Map 与磁盘实存、:346 checklist 引用 references/checklist.md、:300/:449 `scripts/validate-swiss-deck.mjs`、:262/:291 `references/swiss-map-component.md`（该文件实存但 README 目录树漏列=已核）；NOT_RUN（未跑验证脚本）。
- 证实/推断/未知：指令与引用=**证实**；:352 泄漏上游作者本机绝对路径 `/Users/guohao/Documents/op7418的仓库/...`（实读证实，属上游残留，无运行时影响）；:208 提及「2026-05 refactor」演化史=**证实**（原文），具体 commit 对应=**未知**。

## E. skill-creator（Apache-2.0，Anthropic）

## apps--electron--default-skills--skill-creator--LICENSE.txt

- 职责：skill-creator 的 Apache License 2.0 全文（:2-3「Apache License / Version 2.0, January 2004」，:177 条款结束，:179 附录，:190「Copyright 2026 Anthropic, PBC.」）。
- 消费：谁加载→运行时无代码加载点（已 grep 核实）；何时生效→随包法律告知；行为约束→约束本技能材料的使用分发（Apache-2.0），不约束模型运行时。
- 来源：Apache-2.0 许可文本，版权行指向 Anthropic（:190）；sourceBlob `4f881c52d1f72f4cfb720e339e2d35c3058d01a9`；sourceSha256 `bc6b3af2f331cbc7fb0da1344efb2cbe5877a31498b4d70dbc7000f3405a1362`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/skill-creator/`（config-paths.ts:956）。
- 影响：删除→Apache-2.0 分发条件不满足；对模型行为无直接影响。
- 验证：核 :2-3/:177/:190；注意文件末行无换行符（wc -l=201，实际 202 行，FILES.tsv 记 202）；NOT_RUN。
- 证实/推断/未知：许可与版权=**证实**；上游具体 repo=**推断**（Anthropic 官方 skill-creator，仅凭版权行）。

## apps--electron--default-skills--skill-creator--SKILL.md

- 职责：创建/修改/评测/优化 skill 的元技能（`name: skill-creator` :2，version "1.1.2" :4；Creating a skill :50、Writing Guide :76、Running and evaluating :168、Improving :297、Description Optimization :338、Reference files :464）。
- 消费：谁加载→同家族加载链；何时生效→用户要创建/改进技能（description :3）；行为约束→改名/换品牌只动用户明确拥有的内容（:13）、description 要 "pushy"、when-to-use 全写进 description（:72）、SKILL.md 控制 <500 行（:101-103）、禁恶意/误导/越权 skill（:118）、evals 先只存 prompt（:150）、评测禁用 /skill-test 且同轮 spawn 带/不带 skill 两个 subagent（:170-176）、grading.json 字段固定 text/passed/evidence（:230）、改进四原则（:303-309）。
- 来源：Anthropic skill-creator（Apache-2.0，LICENSE.txt:190）；sourceBlob `8b8d8be8cefab190b3ddcba4e10ea108e6dbe8c3`；sourceSha256 `528171501ba75ef5380833deb52bbbb888b294304fd77b821af42517ced66294`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）；seed 至 `~/.cdutai/default-skills/skill-creator/`（config-paths.ts:956）；agents/、references/schemas.md、eval-viewer/、assets/ 一并打包（文件属 group `p02-agent-runtime__apps__electron__default-skills__skill-creator`，不在本 group）。
- 影响：删除→技能创建/评测方法论缺失；改动→:101-103 行数约束或 :118 安全红线漂移会产出劣质/越权技能。
- 验证：核 :2-5 frontmatter、:230/:239/:332/:468-473 对 agents/grader.md、agents/comparator.md、agents/analyzer.md、references/schemas.md 的引用与磁盘实存（已核）、:22/:243/:483-488 eval-viewer/generate_review.py；NOT_RUN。
- 证实/推断/未知：指令与引用=**证实**；:425 Claude.ai 专属与 :450 Cowork 专属章节在本产品（Profer/CDUT Studio）中的适用性=**推断**（上游平台语境，本产品无对应入口）；上游 repo 名=**推断**。
