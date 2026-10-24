# p05-review-engine__apps__electron__src__main__lib__review__fixtures__mvp-single-case 索引（评审引擎单案 MVP 端到端测试 fixture 语料）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p05-review-engine__apps__electron__src__main__lib__review__fixtures__mvp-single-case`（owner `p05-review-engine`，family `apps/electron/src/main/lib/review/fixtures/mvp-single-case`）共 3 个 docs（txt fixture）：申报表/获奖证书/审核规则三类案卷材料的模拟数据。每文件七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（整组共同事实）：

- **谁加载（唯一消费链）**：`apps/electron/src/main/lib/review/single-case-mvp.e2e.test.ts`（bun test 端到端用例「单案审核 MVP 全链路（真实存储与执行器，模型调用使用稳定模拟客户端）」，:85-86）——`fixtureRoot = join(import.meta.dir,'fixtures/mvp-single-case')`（:27）、`fixture()` 路径拼装（:28）、`addMaterial()`（:80-83）把 fixture 路径作为 `sourcePath` 交 `registerMaterial`（`material-service`）登记为案卷材料。全树 grep `mvp-single-case|student-application|competition-certificate|comprehensive-rules` 仅命中本测试（负向检索=证实），无其它加载者。
- **何时生效**：仅 `bun test`（apps/electron/package.json:46 `test: bun test --isolate`）执行该 e2e 用例时；产品运行时零加载（fixture 不被任何产品模块 import/读取）。
- **行为约束（fixture 是场景的固定输入语料）**：测试流程钉死——建案（:88-94，3 个事项 subject-a/b/c）→ 登记规则+申报表（:98-99）→ 模拟 LLM 从 `student-application.txt` 抽取 3 条事项（:52 正则匹配文件名定位文档版本；抽取断言 :118-121）→ 编译等级分值映射/必备证书两条规则（:102-103）→ 提交初审运行 6 项检查、3 项 awaiting-supplement（:114-117）→ 开缺件补件（:126-131）→ 补交获奖证书（:135）→ 响应/解除补件（:137-140）→ 逐事项裁定与报告导出。任何 fixture 内容改动会直接改变抽取结果、规则匹配与断言预期。
- **打包口径（整组）**：**不进产物**——fixture 在 `src/` 下但无产品模块 import，esbuild `build:main`（package.json:17，入口 src/main/index.ts）不嵌入；electron-builder `files:`（:44-68）仅 dist/**、package.json、node_modules/**，`extraResources`（:70 起）无 fixtures 条目（配置证据=证实）。
- 3 个文件均自述「模拟数据/模拟证明，不对应真实学生/活动」（各文件 :1），虚构学生「林小满」贯穿全场景。

## apps--electron--src--main--lib--review--fixtures--mvp-single-case--application--student-application.txt

- 职责：模拟「申报表」材料（5 行/398 字节）——:1 自述「模拟数据，不对应真实学生」；:2 学生林小满、申报学年 2025-2026；:3-5 三个申报事项（A 星火竞赛/国家级一等奖/8 分/2025-10-01/A-001，B 青禾竞赛/国家级一等奖/8 分/B-002，C 晨星竞赛/校级二等奖/2 分/C-003），是「申报事项抽取」环节的输入语料（含申报等级/分值/日期/活动编号四要素）。
- 消费：`single-case-mvp.e2e.test.ts:99` `addMaterial('application/student-application.txt','application','application-form')` 登记进 `application-form` 材料槽（:27 fixtureRoot 路径）；模拟 LLM 提取提示词以「`student-application.txt（<doc-version>）`」引用本文件（:52 正则捕获文档版本号回查案卷文档），抽取 3 条事项并断言 `fieldKey==='level'` 共 3 条（:118-121）；事项标题（星火/青禾/晨星竞赛）与 `sourceBlock.text.includes(itemLabel)` 回链断言（:62-64）。谁加载→何时生效→行为约束：e2e 测试在材料导入阶段加载→仅 bun test 时生效→三事项结构是抽取/规则/裁定全链路的固定事实基线。
- 来源：测试 fixture 手写模拟数据（自述「模拟数据」）；`change=unchanged_since_093f`。sourceBlob `f4c18a4752042493eed9378d75e601c4e4f6924e`；sourceSha256 `d00b61bb9a0d4d4c3f8abff252604944078a1e1e09e903a581e9435918f0b0f2`。
- 打包：不进产物（家族背景打包口径：无 import、不入 esbuild bundle、不在 electron-builder files/extraResources）。
- 影响：删除→e2e 用例在 :99 登记材料失败、抽取提示词匹配不到文档、测试红；改事项内容→:52 抽取模拟返回的 3 事项与新文本不符（sourceBlock 回链断言 :62-64 失败）、等级/分值断言漂移——本文件是「材料导入→抽取→规则核对→补件→裁定」链的根输入。
- 验证：①通读 5 行核三事项四要素；②sha256=lock（封版实测）；③核 single-case-mvp.e2e.test.ts:27/:52/:99 引用行与抽取断言一致性；④`bun test` 实跑=NOT_RUN（本轮统一不跑产品测试）。
- 证实/推断·未知：加载链、内容结构、断言绑定=**证实**（实读测试与本文件）；「抽取提示词模板与模拟返回的匹配是构造好的确定性桩」=**证实**（fakeClient :50-67）；fixture 与真实申报表格式的代表性=**未知**（无真实样本对照）。

## apps--electron--src--main--lib--review--fixtures--mvp-single-case--evidence--competition-certificate.txt

- 职责：模拟「获奖证书」证明材料（2 行/163 字节）——:1 自述「模拟证明，不对应真实活动」；:2 林小满参加星火竞赛获国家级一等奖、颁发日期 2025-10-01、颁发单位：模拟竞赛组委会，恰好覆盖模板证书槽要求的「等级+日期」要素（模板 `certificates` 槽 `requiredElements:['等级','日期']`，:41），但**只覆盖事项 A**（B/C 无证书），支撑缺件补件场景。
- 消费：`single-case-mvp.e2e.test.ts:135` `addMaterial('evidence/competition-certificate.txt','evidence','certificates')`——在初审运行 3 项 awaiting-supplement（:116-117）、开补件（:126-131）后补交进 `certificates` 槽，随后 `respondSupplementV2`（:137-138，`documentVersionIds` 引用本文档版本）与 `resolveSupplementV2`（:139-140，outcome=satisfied）走完补件闭环。谁加载→何时生效→行为约束：e2e 测试在补件响应阶段加载→仅 bun test 时生效→「等级+日期」两要素是补件解除（requiredElements 校验）的判定输入。
- 来源：测试 fixture 手写模拟数据（自述「模拟证明」）；`change=unchanged_since_093f`。sourceBlob `88df337b525fab8a6d34df0f05d00a70a10c38df`；sourceSha256 `0125f5f26c49e10f34f6c74ef1fd8e782e3d8f6a592c83b03947c11ac9aaa2e9`。
- 打包：不进产物（同家族口径）。
- 影响：删除→:135 补交失败、补件响应/解除断言红；改等级或日期→requiredElements 判定与逐事项裁定断言（:142 起）漂移；只覆盖事项 A 的结构是「部分补件→partial-pass」剧本的关键输入（改全覆盖会改变终局断言）。
- 验证：①通读 2 行核等级/日期/颁发单位；②sha256=lock（封版实测）；③核 e2e :135-140 引用行与模板 requiredElements（:41）对照；④bun test=NOT_RUN。
- 证实/推断/未知：加载链、要素结构、补件闭环绑定=**证实**；「partial-pass 终局依赖只覆盖 A」=**推断**（由初审 3 项 awaiting-supplement 与终局断言推断，未实跑）；真实证书格式代表性=**未知**。

## apps--electron--src--main--lib--review--fixtures--mvp-single-case--rules--comprehensive-rules.txt

- 职责：模拟「审核规则」文本（4 行/346 字节）——:1 自述「模拟数据」；:2-4 三条规则：①竞赛证书等级与申报分值映射一致（国家级一等奖 8 分/省级二等奖 4 分/校级二等奖 2 分）；②每个申报事项须绑定一份获奖证书，缺件进补件且证明关联须审核员确认；③审核员逐事项确认/修改/不予认定并保留理由。
- 消费：`single-case-mvp.e2e.test.ts:98` `addMaterial('rules/comprehensive-rules.txt','rule')` 登记为 `role:'rule'` 规则文档（:100 取 ruleDocument）；随后 `compileWorkspaceRule`（:102-103）把两条结构化规则（`level-mapping` 等级分值映射含 8/4/2 与本文件 :2 一致；`required-evidence` 要求 certificates 与本文件 :3 一致）编译为 `RulePack`（:101）经 `ConfirmWorkspaceRules` 落案（:104-107）并进入运行 `effectiveRuleIds`（:115）。谁加载→何时生效→行为约束：e2e 测试在规则确认阶段加载→仅 bun test 时生效→本文件是两条结构化规则的文本出处（`generatedBy:'fixture'`，:102-103），等级映射/必备证书断言以其数值为准。
- 来源：测试 fixture 手写模拟规则（自述「模拟数据」）；`change=unchanged_since_093f`。sourceBlob `2160ed6441350e39c27de0fca60b3c9b79c63717`；sourceSha256 `7bce30331312c7e281a5b32beaeaba5b6030fc00eb24e5879d8521b85464114d`。
- 打包：不进产物（同家族口径）。
- 影响：删除→:98 登记失败、规则文档/RulePack 链断裂、运行 `effectiveRuleIds` 断言（:115）红；改分值映射→`level-mapping` 编译数值（:102）与文本脱节、核对断言漂移；改「须绑定证书」规则→补件场景判定改变（:116-131）。
- 验证：①通读 4 行核三规则文本；②sha256=lock（封版实测）；③核 :98/:102-103 引用行与文本数值一致性（8/4/2 分、certificates）；④bun test=NOT_RUN。
- 证实/推断/未知：加载链、文本↔结构化规则一致性=**证实**；「规则编译器对文本的解析不依赖本文件字面（outline 为构造）」=**证实**（:102-103 outline 由测试内联构造，本文件是文本语料/出处，非解析输入）；真实审核规则文本的代表性=**未知**。

## 未运行 / 未知

- NOT_RUN（本轮统一）：产品测试（bun test，含 `single-case-mvp.e2e.test.ts` 全链路）、typecheck、构建、Electron/GUI、真实 LLM 调用（测试用 fakeClient 稳定模拟，:50-67）。
- 未知汇总：fixture 对真实申报表/证书/审核规则文档的代表性（无真实样本对照）；「partial-pass 终局依赖事项 B/C 无证书」的终局断言细节未逐行展开核（:142 起循环在本次只读至 :145）。
- 依据边界：消费/打包结论均冻结树实读+负向检索；`inventory/INDEX-FACTS.tsv` 仅作检索线索未抄入正文。
