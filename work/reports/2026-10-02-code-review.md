# CDUT-Studio「内容审核专区」代码审查报告

> 注：本报告是 2026-10-02 审查时点的**时间点快照**，发现内容不随后续修复改写；F1-F15 的修复去向见 `work/reports/2026-10-02-acceptance-report.md`（§三、§四、§八·一）与 `work/decision-log/2026-10-02-decision-log.md`（#27、#28、#38、#39）。文中"13 通道/13 handler/13 方法、白名单 4 出口、32 测试"等数字均为当时事实（现行 14/14/14、3 出口、56 用例）。

- 日期：2026-10-02
- 审查方式：按根目录 `software-development-code-review.md` 准则执行；逐文件通读 + 全链路追踪（renderer → preload → ipcMain → service → fs/network → 返回）+ 实测复现（`bun test`、`bun run typecheck`、esbuild 打包、最小复现脚本）
- 审查范围：`packages/shared/src/types/review.ts`、`apps/electron/src/main/lib/review/**`、`apps/electron/src/main/ipc.ts`（2 行接入）、`apps/electron/src/preload/index.ts`（reviewAPI 段）、`apps/electron/src/renderer/{atoms,components/content-review}/**`、导航接入（`active-view.ts`、`MainArea.tsx`、`left-sidebar/*`）
- 验证结果：`bun run typecheck` 全绿；`bun test --isolate apps/electron/src/main/lib/review/` 32 pass / 0 fail（4 个测试文件）；全量 `bun test --isolate --timeout 30000` 在审查期间为 74 fail，与 stash 掉本改动后的基线 74 fail 完全一致（本改动**没有引入**新的全量测试失败）

> 审查期间的并发情况说明（重要）：审查过程中工作区被并行操作过两次（stash/pop 往返，review 源码一度只存在于 stash 中），以及 `case-store.test.ts` / `document-service.test.ts` / `mock-review-engine.test.ts` / `review-model-gateway.test.ts` 四个测试文件是在审查中途由主会话补入的（mtime 02:39 / 02:45）。最终报告以**当前工作区状态**为准，所有结论均已按当前文件内容与行号复核；stash 已全部恢复/清空，`git stash list` 为空，`git status` 只含本任务变更，无遗留污染。以下发现不包含"缺少测试"这一项——4 个测试文件已覆盖 case-store、document-service、mock 引擎、网关白名单与 extractJson 的 happy path；但失败路径仍有盲区（见 F12）。

---

## 发现（按严重级别排序）

### P0

未发现需要立即阻止合并的 P0 问题。路径拼接点（`caseId`/`runId`）全部经 `assertSafeId`（`case-store.ts:29-33`，白名单 `[a-zA-Z0-9_-]`），已用 `../evil`、`a/b`、`x y`、`x.y` 等实测全部 throw；`case-import.ts:53-54` 的文件名取自 `filePath.split(/[\\/]/).pop()` 且落在案卷目录内、目录名经 `assertSafeId` 校验，不构成穿越；API Key 只进 `Authorization` 头（`review-model-gateway.ts:176-179`），日志只打 `url` 与 `error.message`（`review-model-gateway.ts:210`），未见明文 key 入日志。

---

### P1

#### F1. `case-import.ts` 导入文件 100% 失败：`source-docs` 目录从未创建（ENOENT）

- **文件/行号**：`apps/electron/src/main/lib/review/case-import.ts:53-54`（`assetDir` 拼接后直接 `copyFileSync`，全文件无任何 `mkdir`）
- **触发条件**：任何一次 `IMPORT_DOCUMENT` IPC 调用（`review-ipc.ts:78-83` → `importDocumentIntoCase`），无论案卷是否存在——`getCaseDir` 只建 `{review-cases}/{caseId}/`，不建其下的 `source-docs/`
- **实际影响**：`copyFileSync` 抛 `ENOENT: no such file or directory`，导入永远失败，错误直接冒泡到渲染层错误条。已用最小脚本复现：即使案卷目录已存在，`copyFileSync → .../source-docs/x.md` 仍 `ENOENT`。这是"原件按案卷保存"契约（决策 D4/决策 #21）的核心路径，首次使用即坏
- **为什么会发生**：写复制语句时假设了目标目录存在，但目录创建逻辑只存在于 `getReviewCasesDir()`（根）与 `getCaseDir()`（案卷级），中间层 `source-docs/` 没有任何创建点；E2E 冒烟脚本（`work/tmp/verify-e2e.ts`）不覆盖导入链路，故未暴露
- **修复方向**：`copyFileSync` 前 `mkdirSync(assetDir, { recursive: true })`；同时补一条失败路径测试（案卷目录存在/不存在两种前置下导入均成功），并给 `importDocument` 接上渲染层入口（见 F11）或本轮先不暴露该 IPC

#### F2. mock 引擎「分值超上限」检查对 demo 案卷**永不触发**：预埋的第 3 类缺陷缺失，`suggestedScore` 永远不出现

- **文件/行号**：`apps/electron/src/main/lib/review/mock-review-engine.ts:43-45`（`isCompetitionCategory = category.includes('竞赛')`）、`mock-review-engine.ts:234`（只对命中项求和）；对照 fixture `demo-fixtures/demo-case-fixture.ts:250/263`（两条学科竞赛申报的 `category` 是 `'智育'`，标题里才有"学科竞赛"）
- **触发条件**：运行演示案卷的任何一次审核（默认离线 mock 路径，决策 D6）
- **实际影响**：
  1. 计划文档 `docs/plans/...-implementation.md:60` 明确承诺"预埋缺陷：…分值超上限（红）…"，实际产出的 7 条 findings 只有等级冲突/缺证明/看不清/互斥/日期越界 5 类（实测 `kinds = [level-conflict, missing-evidence ×2, unclear-evidence, mutual-exclusion ×2, date-out-of-range]`），演示叙事与实现不符；
  2. 该分支是全引擎唯一产出 `suggestedScore` 的路径（`mock-review-engine.ts:243-258`），永不触发 ⇒ 右栏问题卡"建议分数"列恒为"待确认"，设计文档 §"只有规则分值明确…才输出建议分数"的正例永远演示不出来；
  3. 更普遍地：**任何真实案卷只要指标类别填"智育/德育/…"（即申报表的正常填法），上限检查全部漏报**——审核工具的假阴性
- **为什么会发生**：`isCompetitionCategory` 拿"指标类别"字段去匹配"项目名称"里的关键词；fixture 的 category 按五育分类填写，两者语义空间不同。单测反而把这个错误固化了：`mock-review-engine.test.ts:33-45` 断言"7 条（无 score-over-limit）"，并在注释里引用"报告中的产品问题 #3"（该报告不在仓库内），等于用测试锁死了缺陷
- **修复方向**：判定改为对 `title`（或 `category + title`）匹配，例如 `belongsToVolunteerLabor` 已有的 haystack 模式（`mock-review-engine.ts:48-51`）；或给 fixture 的两条竞赛申报加可判定信号（category 含"竞赛"）。修复后同步更新 `mock-review-engine.test.ts` 的 7 条基准与计划文档的验收描述

#### F3. 模型网关忽略 `channel.enabled` / `models[].enabled`：已停用渠道与已停用模型仍被审核专区调用

- **文件/行号**：`apps/electron/src/main/lib/review/review-model-gateway.ts:53-59`（`findFirstAllowedChannel` 只查 provider 白名单与 models 非空，不查 `channel.enabled`、不查 `models[0].enabled`）；`review-model-gateway.ts:62-64`（`firstModelId` 取 `models[0]` 不管 enabled）
- **触发条件**：用户在渠道设置里停用某渠道（`enabled:false` 是渠道表单的一等开关，`ChannelForm.tsx:294` 默认 true、可随时关）或停用首个模型后打开内容审核专区并执行任意 AI 动作（规则大纲/条目识别/审核/助手）
- **实际影响**：
  1. 行为不一致：`chat-service.ts:254-263` 对停用渠道/停用模型会明确报错"当前渠道已停用"，审核专区却照常解密 key 并把案卷内容（规则文档、申报表、证明事实、条目 JSON）发往用户已明确停用的端点——**安全语义上等同于绕过用户的停用决定**（`chatCompletion` 内 `decryptApiKey` 照走，`review-model-gateway.ts:152`）；
  2. 停用"首选模型"却继续用它（`models[0]` 即使 `enabled:false`），与用户"此模型不可用"的预期矛盾；
  3. 顶栏徽标 `getReviewModelGatewayStatus` 同样基于该函数，会显示"OpenAI 兼容出口"可用，而实际渠道已停用
- **为什么会发生**：`findFirstAllowedChannel` 复刻了"白名单"这一新关注点，但漏掉了仓库既有的渠道可用性判据；白名单审查只对照了 `REVIEW_MODEL_PROVIDERS`，没对照 `chat-service` 的 enabled 检查
- **修复方向**：`findFirstAllowedChannel` 增加 `channel.enabled === true` 过滤；`firstModelId` 改为优先取 `models.find(m => m.enabled)?.id`，无启用模型则视同无可用出口（返回 `available:false` + reason）；`chatCompletion` 入口再加一次防御性校验。补一条"停用渠道 → status.available=false"的测试

---

### P2

#### F4. `openai-responses` 在白名单内但网关按 `/chat/completions` 调用，该类渠道必然 404 → 永久降级

- **文件/行号**：`review-model-gateway.ts:146-148`（非 ollama 一律拼 `/chat/completions`）；白名单含 `'openai-responses'`（`packages/shared/src/types/review.ts:330`，计划 D5 也点名允许）
- **触发条件**：配置中存在 provider 为 `openai-responses` 的渠道（旧版本配置或手工改 `channels.json`；渠道表单的 `PROVIDER_OPTIONS` 当前不含它，故只能经历史配置进入）。此时 `getReviewModelGatewayStatus` 返回 `available:true`，选中它后每次审核调用打到 `${baseUrl}/chat/completions` 返回 404
- **实际影响**：顶栏显示"OpenAI 兼容出口"绿徽标（`ContentReviewView.tsx:226-231`），但大纲/条目/审核/助手四条路径**每次都失败并降级**——用户看到的是"可用"，得到的是 mock 结果；404 循环不可自愈，且错误只落 `console.warn`
- **为什么会发生**：白名单按"厂商协议族"分类（把 responses 归入 OpenAI 兼容线），但网关实现只写了一条 OpenAI 协议的 URL/请求体；`packages/core` 里明明有 `resolveOpenAIResponsesUrl` 与 `OpenAIResponsesAdapter` 可复用（`url-utils.ts:213`、`openai-responses-adapter.ts:387` 的请求体是 `input:` + `max_output_tokens`）
- **修复方向**：二选一——(a) 网关按 provider 分派：`openai-responses` 走 `${baseUrl}/responses` + `{model, input, stream:false}`（复用 `resolveOpenAIResponsesUrl`）；(b) 本轮把 `openai-responses` 移出 `REVIEW_MODEL_PROVIDERS` 并同步修订 D5，让自检如实返回 `available:false`。无论哪种，补一条"responses 渠道请求 URL/请求体形状"测试

#### F5. `custom` 渠道 baseUrl 若存的是完整端点，网关重复拼接 `/chat/completions`

- **文件/行号**：`review-model-gateway.ts:44-46,147-148`（只去尾斜杠再拼后缀）
- **触发条件**：`channels.json` 中 `provider:'custom'` 且 `baseUrl` 为 `https://gw.example.com/v1/chat/completions`。仓库对这类值有明确共识：`ChannelForm.tsx` 的 custom 预览文案显示 `/chat/completions` 后缀，`packages/core/src/providers/url-utils.ts:194-206` 的 `resolveOpenAIChatCompletionsUrl(baseUrl,'custom')` 是**原样返回**，`chat-service` 通过 `OpenAIAdapter` 走同一 helper——即存量 custom 渠道可以合法地存完整端点
- **实际影响**：实际请求 `…/chat/completions/chat/completions` → 404 → 该渠道所有审核 AI 调用失败并降级（同 F4 的"徽标绿、实际废"表象）。已用脚本模拟 URL 拼接确认：`custom + 完整端点 → 双后缀`
- **为什么会发生**：网关自己实现了一行 `trimTrailingSlash + 拼后缀`，没有复用 `@profer/core` 已有的、带 `hasPathSuffix` 守卫的 URL 解析器；而 `ollama` 分支还额外需要 `.replace(/\/v1$/,'')` 归一（`channel-manager.ts:1662` 对 `/api/tags` 就是这么做的），网关也没做——`baseUrl` 存 `http://127.0.0.1:11434/v1` 时会拼出 `/v1/api/chat`
- **修复方向**：直接复用 `resolveOpenAIChatCompletionsUrl(baseUrl, provider)` 与对 ollama 的根地址归一逻辑（strip `/v1` 后缀再拼 `/api/chat`）；补"custom 完整端点 / ollama 带 `/v1`"两个 URL 形状测试

#### F6. 生成的规则大纲**不落盘**，与 `extractItems` 的回写不对称：助手与报告读到的永远是 fixture 大纲

- **文件/行号**：`ai-review-service.ts:135-175`（`generateRuleOutline` 全函数无 `saveCase`；对照 `ai-review-service.ts:248` `extractItems` 明确 `saveCase` 回写）；消费端 `ai-review-service.ts:521-526`（`reviewAssistantChat` 的 `rulesBrief` 读 `reviewCase.rulePacks[].outline`）、`run-service → runMockReview → buildFindingsForCase:114`（读 `rulePacks[0].outline` 的 constraint）
- **触发条件**：网关可用时点"生成大纲"，随后（a）重启应用再打开助手/审核，或（b）不重启直接点"开始审核"且走 mock 降级路径
- **实际影响**：
  1. 大纲只写进 `reviewCaseAtom`（`use-review-actions.ts:125`），主进程案卷未变 ⇒ 重启后左栏回到 fixture 大纲，AI 生成结果无痕丢失；
  2. 助手上下文（`rulesBrief`）与 mock 引擎的 constraint（上限/互斥/日期区间判定的依据）读的是磁盘上的 fixture outline——AI 生成的新大纲对审核/助手**完全不生效**，两个"事实来源"长期分叉；
  3. 与同文件 `extractItems` 的回写语义（注释自述"案卷是唯一事实来源"）不一致，属于同一批动作里两种相反契约，后续维护者极易踩坑
- **为什么会发生**：渲染层注释写了"大纲结果回写案卷（渲染层唯一事实来源仍是 reviewCaseAtom）"，把持久化责任含糊地留在渲染层，而渲染层没有对应 IPC
- **修复方向**：`generateRuleOutline` 成功分支 `saveCase({ ...reviewCase, rulePacks: 替换该 pack.outline, updatedAt })`，与 `extractItems` 对齐；同时渲染层回写改为覆盖原子后从主进程返回值读回。补一条"生成大纲 → 重新 getCase 可见"的测试

#### F7. review 的 13 个 IPC handler 全部无入参校验，与仓库 ipc.ts 校验规范不一致；`role` 枚举与助手 `history.role` 可穿透

- **文件/行号**：`apps/electron/src/main/lib/review/review-ipc.ts:51-146`（全部 handler 原样透传参数；对照 `apps/electron/src/main/ipc.ts` 现有 handler 普遍做 `typeof x === 'string'`/枚举校验，如 `ipc.ts:1446`、`ipc.ts:3124`）。具体未校验点：
  - `IMPORT_DOCUMENT` 的 `role`（`review-ipc.ts:80`）：任意字符串被写进 `SourceDocument.role`，渲染层 `documentsByRoleAtom`（`review-atoms.ts:102-109`）只认三种值 ⇒ 静默丢弃该文档（不进任何一栏）；
  - `ASSISTANT_CHAT` 的 `history[].role`（`ai-review-service.ts:528-531`）：渲染层原样转发，`role:'system'` 会被放进模型消息数组，构成**提示词注入面**（注入者需要能构造 renderer 状态，当前入口只有助手抽屉自建消息，故为纵深防御缺口而非直接可打）；
  - `CREATE_CASE` 的 `type`（`review-ipc.ts:72`）不校验 `ReviewCaseType` 合法值，`input` 非对象时 `input.title.trim` 抛 TypeError 而非中文业务错误；
  - `GET_RUN`（`review-ipc.ts:121`）`input` 为 null 时 `input.caseId` 直接 TypeError
- **触发条件**：恶意/异常渲染层输入（插件、被污染的 preload 桥、未来任何新调用方）
- **实际影响**：非法数据入库（role/type 枚举穿透）、错误信息为 JS TypeError 而非设计要求的"不吞异常 + 中文可解释"；助手路径存在 system 角色注入的理论通道
- **为什么会发生**：`review-ipc.ts` 作为独立注册单元没有沿用 `ipc.ts` 的逐 handler 校验惯例；类型注解在 IPC 边界上是编译期假设，运行时不生效
- **修复方向**：每个 handler 入口统一加守卫（caseId/runId 已由 `assertSafeId` 覆盖；补 `role ∈ {rule,application,application…}` 枚举、`type ∈ ReviewCaseType`、`history` 为数组且 `role ∈ {user,assistant}` 白名单、`input` 对象性检查），非法即 `throw new Error('中文原因')`；可抽一个小工具与 `ipc.ts` 复用

#### F8. `case.json` 读-改-写无并发保护：`extractItems` 的模型调用窗口（可达 60s）内其他写入会被覆盖

- **文件/行号**：`ai-review-service.ts:219-249`（`getCase` → `await chatCompletion`（60s 超时，`review-model-gateway.ts:19`）→ `saveCase({ ...reviewCase, items })`）；对照写入方 `case-import.ts:66`、`run-service.ts`（只写 runs 不写 case）、`loadDemoCase`
- **触发条件**：`extractItems` 进行中（等模型响应）发生 `IMPORT_DOCUMENT` 或 `CREATE_CASE`（后者不冲突，但导入冲突）——当前渲染层无导入 UI，故是"下一次迭代接上导入即中"的确定性缺陷
- **实际影响**：导入写入的 `documents`/`updatedAt` 被 `extractItems` 用陈旧快照整体覆盖（已用脚本实测：交错后 AI items 丢失 / 导入文档丢失，二者必居其一）；`saveCase` 是整文件 JSON 重写（`case-store.ts:65-69`），原子性只保证"单次写不半截"，不保证"多写者不丢更新"
- **为什么会发生**：`saveCase` 以整个 `ReviewCase` 对象为参数，写者各自持有自己的快照；主进程单线程消除了字节级撕裂，但 await 点让出了逻辑时间片
- **修复方向**：以 `caseId` 为键的写串行化（进程内 per-case Promise 队列），或写回前重新 `getCase` 合并（`{ ...fresh, items }`），或把 items 落到独立文件按段合并。至少在 `extractItems` 写回时改用最新案卷合并

#### F9. 报告导出：Markdown 表格不转义模型输出 + 两次 `writeFileSync` 非原子 + 文件名秒级精度可撞

- **文件/行号**：`report-service.ts:128-138`（`finding.title`/`detail` 等直接插进 Markdown 表格行，无 `|`/换行/反引号转义）、`report-service.ts:84-85`（JSON 与 MD 两次独立同步写，无 `.tmp+rename`）、`report-service.ts:80`（`stamp` 精度到秒）
- **触发条件**：
  1. AI 引擎产出的 `finding.title/detail` 含 `|` 或换行（模型输出不受控）→ MD 表格错列，`<script>` 等内容原样进文件（本机打开时取决于查看器）；
  2. 第 84 行写成功、第 85 行抛错（磁盘满/权限）→ 留下只有 JSON 没有 MD 的半套产物，且 `exportReport` 抛错后调用方认为"全失败"，用户找不到已落盘的 JSON；
  3. 同一秒内两次导出（或并发两次 invoke）→ 文件名相同互相覆盖
- **实际影响**：导出是验收链最后一环（计划 §4），产物损坏/半套/覆盖都会直接出现在演示与交接场景
- **为什么会发生**：`case-store` 已有 `writeJsonAtomic`（`case-store.ts:65-69`）却没有复用；Markdown 渲染函数只管拼接没考虑字段逃逸；时间戳取到秒
- **修复方向**：字段统一 `escapeMdCell()`（`|`→`\|`、换行→`<br>`）；两个文件都走 `.tmp+rename` 且先写完再整体可见（或接受 JSON 先写、失败时清理已写文件）；`stamp` 加毫秒或加随机后缀

#### F10. `review-model-gateway.test.ts` / `case-store.test.ts` 把本机绝对路径写死进配置根，CI 与他人机器不可移植

- **文件/行号**：`case-store.test.ts:36` 与 `review-model-gateway.test.ts:29`：`` process.env.PROFER_CONFIG_DIR = `/home/miku/Bot/CDUTStudio/CDUT-Studio/work/tmp/profer-test-…-${Date.now()}` ``
- **触发条件**：在非本机路径的检出目录（CI `windows-latest` 跑全量 `bun test`，`release.yml:72`；其他开发者的 clone 路径）运行测试
- **实际影响**：Windows 上该 POSIX 路径会解析成 `<当前盘>:\home\miku\…`，在 runner 上**大概率可建**（Administrators）但把测试数据写到仓库外的怪异位置；在任何不可写的根上 `mkdirSync` 抛错 → 测试文件整体失败。同仓库其它测试一律用 `mkdtempSync(join(tmpdir(), '…'))`（`agent-gpt-image-service.test.ts:31`、`document-service.test.ts:22` 本批自己就用了正确写法），此处是唯一的反例
- **为什么会发生**：调试期在本机跑通即定稿，没有对照同批 `document-service.test.ts` 的 tmpdir 模式
- **修复方向**：改为 `mkdtempSync(join(tmpdir(), 'profer-review-case-store-'))` / `'profer-review-gateway-'`，`afterAll` 里 `rmSync(dir, { recursive: true, force: true })`（顺带解决每次跑测试在 `work/tmp` 留 10+ 个残留目录的卫生问题）

---

### P3

#### F11. `IMPORT_DOCUMENT` / `CREATE_CASE` / `DELETE_CASE` 三层已通（handler+preload）但渲染层零调用，`reviewCaseListAtom` 只写不读

- **文件/行号**：preload `index.ts:3862-3866`（`createCase`/`importDocument`/`deleteCase`）；`use-review-actions.ts:93`（写 `reviewCaseListAtom`）；`content-review/**` 无任何 `reviewCaseListAtom` 消费、无 `importDocument`/`createCase`/`deleteCase` 调用
- **触发条件**：—（死代码路径）
- **实际影响**：接口面大于功能面；案卷列表/新建/导入/删除在 UI 上不可达（演示只有"载入演示案卷"）。维护者会以为这些能力已可用（尤其 F1 的导入 bug 藏在其中）；也是 F1 未被发现的原因
- **修复方向**：本轮明确"demo 不含案卷管理 UI"并从 preload 摘掉这三个方法（或注释标注 T-迭代），或补上入口。与 F1 一起处理

#### F12. 失败路径测试盲区：网关 404/500/停用渠道、`startReviewRun` 落 failed、`exportReport` 无运行抛错、`case-import` ENOENT 均无测试

- **文件/行号**：现有 4 个测试文件 `case-store.test.ts` / `document-service.test.ts` / `mock-review-engine.test.ts` / `review-model-gateway.test.ts`（均只测 happy path 与纯函数）
- **触发条件**：—（回归风险）
- **实际影响**：F1（导入 ENOENT）、F3（停用渠道）、F4/F5（URL 形状）、`run-service.ts:93-106`（引擎异常必须落 failed 不上抛）这些**契约型行为**无测试锁定；`mock-review-engine.test.ts:33-45` 甚至把 F2 的缺陷当基准断言（注释自指一份不在仓库里的"报告问题 #3"）
- **修复方向**：优先补 4 条：① `startReviewRun` 引擎 throw → 返回 `status:'failed'` 且 `error` 非空、不向上抛；② 停用渠道 → `getReviewModelGatewayStatus().available===false`；③ `case-import` 成功复制（临时目录内）；④ `exportReport` 未运行 → throw 中文错误。并把 mock 基准测试在修复 F2 后改为含 score-over-limit 的期望

#### F13. `runAiReview` 覆盖摘要的 `ruleUncoveredItemIds` 条件恒假：AI 路径"规则未覆盖"永远为 0

- **文件/行号**：`ai-review-service.ts:406`：`reviewedItemIds.filter((id) => !hitItemIds.has(id) && id.length === 0)` —— `id` 来自 `reviewCase.items.map(i => i.id)`，永非空串 ⇒ 过滤结果恒为 `[]`；注释也自述"这里只报…异常项"，但表达式与"AI 未命中"语义无关
- **触发条件**：网关可用、AI 审核成功时，看右栏"规则未覆盖"格（`RightPanel.tsx:152`）
- **实际影响**：AI 引擎的覆盖摘要少一个真实信号（AI 路径下该格恒 0，mock 路径正常）；报告 Markdown 的"规则未覆盖"同样恒 0。属指标失真而非崩溃
- **修复方向**：明确语义后二选一——若按注释意图"AI 未提及且未被任何 constraint 覆盖"，应复用 mock 的 `coveredItemIds` 逻辑或直接 `!hitItemIds.has(id)`；若本就不想报，删除该字段计算并同步报告展示。补一条断言

#### F14. 中栏点条目卡产生的合成 finding id 污染选中态：助手"当前问题卡"静默丢失、右栏无选中态

- **文件/行号**：`CenterPanel.tsx:71-88`（构造 `id: 'item-focus-${item.id}'` 的合成 finding 调 `focusFinding`）→ `use-review-actions.ts:237`（写 `selectedFindingIdAtom = 'item-focus-…'`）→ `selectedFindingAtom`（`review-atoms.ts:112-117`）在 `run.findings` 里查不到该 id ⇒ `null`；`use-review-actions.ts:199` 又把该 id 当 `focusFindingId` 发给主进程，`findFocusFinding`（`ai-review-service.ts:435-439`）查不到 ⇒ 返回 undefined
- **触发条件**：用户先点某申报条目卡定位，再打开助手抽屉或直接提问
- **实际影响**：助手不带焦点作答（UI 上"当前问题卡"一行消失），而用户的直觉是"我刚点了这条"；右栏问题卡也没有任何选中高亮。低危但真实的行为偏差
- **修复方向**：中栏点击只写 `reviewFocusAtom`（联动定位）不写 `selectedFindingIdAtom`；或 `selectedFindingAtom` 对 `item-focus-*` 前缀回落到该条目最新 finding/条目本身

#### F15. `RightPanel` 导出提示的 6s `setTimeout` 卸载后不清；`window-controls-host-coverage.test.ts` 未纳入 `ContentReviewView`

- **文件/行号**：`RightPanel.tsx:44`（`window.setTimeout(() => setExportNotice(null), 6000)` 无清理 ref/effect）；`apps/electron/src/renderer/lib/window-controls-host-coverage.test.ts:19-31`（`FULLSCREEN_VIEWS` 只列 planning 与 agent-skills）
- **触发条件**：导出提示显示期间切走视图（卸载）；以及未来重构移除 `ContentReviewView` 的 `WindowControlsHost` 时
- **实际影响**：React 18 下卸载后 setState 仅是无害 no-op + 该 6s 定时器存活（微小泄漏）；覆盖测试漏掉本视图意味着该仓库曾发生过的"Windows 窗口按钮整组消失"回归（测试文件头注释记录）在新全屏视图上没有 CI 守卫——虽然 `MainArea.tsx:297` 的兜底 host 条件 `activeView !== 'conversations'` 已覆盖 content-review，回归风险主要在"视图自身 host 被删且兜底条件被改窄"的叠加情形
- **修复方向**：定时器句柄存 ref、effect cleanup 里 `clearTimeout`；把 `ContentReviewView`（minHosts 1）加进 `FULLSCREEN_VIEWS`

---

## 开放问题 / 假设

1. **demo 范围假设**：按 D1-D11，把"案卷管理 UI（列表/新建/导入/删除）不在本轮"作为假设审查（据此 F11 记 P3 而非功能缺失）。若本轮其实要求导入可用，F1 升为 P1 中的必修且需补渲染层入口。
2. **F4 的取舍**：`openai-responses` 是"实现适配"还是"移出白名单"，涉及 D5 的对外叙事与 `REVIEW_MODEL_PROVIDER_REJECTED_NOTICE` 文案，需要产品/文档负责人拍板。
3. **F2 的期望基准**：修复方向我推荐改判定（对 title 匹配），但这会让 `mock-review-engine.test.ts` 的"7 条"基准变为"8 条（含 score-over-limit）"，并让验收脚本 §4 的红卡数从 4 变 5——需确认演示话术同步更新。
4. **`enabled` 语义**：假设"渠道设置里的停用开关对审核专区同样生效"（F3 的判定依据是 `chat-service` 的既有行为与常识）；若产品有意让审核专区无视停用，请在 D5 中显式记录，否则按 F3 修。
5. **IPC 校验强度**：`review-ipc.ts` 未使用 `assertMainWindowSender`（仓库里只有敏感 Agent/插件 IPC 用），我按"与 `ipc.ts` 普通 handler 同级"评判（F7 记 P2 而非 P1）。若安全基线要求审核专区（处理学生材料）走主窗口来源校验，可在 `registerReviewIpc` 统一加。
6. **测试并发补入**：审查中途主会话补了 4 个测试文件，我按"最终状态"评审其覆盖面；若 T8 计划中还有其他文件未落地（如计划 D10 点名的"焦点纯函数"测试——`hitAnchor`/`findBlockByAnchor` 确实仍无测试），属 F12 范围。
7. **审查工具副作用**：审查期间为取基线跑过 `git stash push -u/-p` 往返，已全部恢复（`git stash list` 为空、源码字节数与审查开始时一致、typecheck/测试复跑通过）；期间删除的仅为我自己的临时日志与 `profer-test-*` 残留目录，未触碰任务产物。此过程若与主会话的并行操作有过交叠，请以当前工作区为准复核一次。

---

## 变更摘要

- 新增共享契约：`ReviewCase/ReviewRun/ReviewFinding/…` + `REVIEW_IPC_CHANNELS`（13 通道）+ `REVIEW_MODEL_PROVIDERS` 四出口白名单；类型文件自查无 `any`、无契约内部矛盾。
- 主进程新增 `review/` 14 个文件：案卷原子存储（`assertSafeId` 防穿越、`.tmp+rename`）、文档切块（稳定 `blk-*` 锚点）、双协议模型网关（白名单前置拒绝、60s 超时、代理尊重）、AI/降级双路径服务、确定性 mock 引擎、运行编排（failed 落盘不上抛）、报告导出；`ipc.ts` 仅 +4 行接入。
- 渲染层新增三栏工作台 + Jotai atoms（focus nonce 联动、窄屏单栏、Ctrl+Shift+A 助手抽屉），侧栏/rail/`MainArea`/`enterableViewSelector` 接入 `content-review` 视图与键盘焦点移交；全屏视图自带拖拽区与 `WindowControlsHost(priority 20)`（与既有全屏视图同款，含高 DPI 防误判处理）。
- 验证：`typecheck` 全绿；review 测试 32/32 绿；全量测试失败数与基线持平（74=74，本改动零新增失败）；`build:main` 打包通过，`registerReviewIpc` 已进 bundle，`require('./run-service')` 被 esbuild 正确内联为 `init_run_service()`（无运行时 require 缺失）。
- 结论：**无 P0**；3 个 P1（导入 ENOENT、上限检查死代码、停用渠道穿透）与 6 个 P2 建议合并前修复，7 个 P3 可排期。

### 发现列表（一行一条）

- P1-F1 `case-import.ts:53` — `source-docs` 目录从不创建，`IMPORT_DOCUMENT` 首次调用即 ENOENT 失败
- P1-F2 `mock-review-engine.ts:43,234` — category 含"竞赛"的判定对 fixture 恒假，预埋的"分值超上限"红卡与 `suggestedScore` 永不出现（测试还把该缺陷锁成基准）
- P1-F3 `review-model-gateway.ts:53-64` — 忽略 `channel.enabled`/`models[].enabled`，已停用渠道/模型仍被调用并外发案卷数据
- P2-F4 `review-model-gateway.ts:146` — 白名单放行 `openai-responses` 却按 `/chat/completions` 调用，该类渠道必 404 且徽标仍显示可用
- P2-F5 `review-model-gateway.ts:147` — custom 渠道存完整端点时重复拼接 `/chat/completions`（ollama 带 `/v1` 同理），未复用 `resolveOpenAIChatCompletionsUrl`
- P2-F6 `ai-review-service.ts:135-175` — AI 生成的大纲不落盘，助手/mock 引擎读到的永远是 fixture outline，与 `extractItems` 回写不对称
- P2-F7 `review-ipc.ts:51-146` — 13 个 handler 无入参校验：`role`/`type` 枚举穿透、助手 `history.role` 可为 `system`（注入面）、null input 抛 TypeError
- P2-F8 `ai-review-service.ts:219-249` — `getCase → await 60s → saveCase` 读改写窗口内并发写会被整体覆盖（丢更新）
- P2-F9 `report-service.ts:80,84-85,128-138` — 报告 MD 不转义 `|`/换行、两次非原子写、文件名秒级可撞
- P2-F10 `case-store.test.ts:36`、`review-model-gateway.test.ts:29` — 测试写死本机绝对配置路径，CI/他人机器不可移植且不清理临时目录
- P3-F11 `preload/index.ts:3862-3866` — `createCase/importDocument/deleteCase` 与 `reviewCaseListAtom` 三层已通但渲染层零调用（死接口面）
- P3-F12 现有 4 个测试文件 — 失败路径（导入 ENOENT、停用渠道、引擎异常落 failed、报告无运行、URL 形状）无测试
- P3-F13 `ai-review-service.ts:406` — `ruleUncoveredItemIds` 过滤条件含 `id.length === 0` 恒假，AI 路径"规则未覆盖"永远 0
- P3-F14 `CenterPanel.tsx:75` — 合成 `item-focus-*` id 污染 `selectedFindingIdAtom`，助手焦点与右栏选中态静默丢失
- P3-F15 `RightPanel.tsx:44`、`window-controls-host-coverage.test.ts` — 导出提示定时器卸载不清理；覆盖测试未纳入 ContentReviewView
