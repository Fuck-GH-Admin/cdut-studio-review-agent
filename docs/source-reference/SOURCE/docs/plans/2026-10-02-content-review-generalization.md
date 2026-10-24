# 内容审核专区升级：从「综测专用」到「通用文件审批引擎」

> 日期：2026-10-02。前置文档：`work/reports/2026-10-02-acceptance-report.md`（demo 验收）、`2026-10-02-module-porting-guide.md`（可移植性）。
> 本文档记录本轮升级的决策（D12-D18）与任务分解，作为实施与验收依据。

## 一、问题定性（灵活性评估结论）

用户提问：审核功能对「各种文件的审批」是否足够灵活（指使用灵活性，非配置项多少）。

代码事实核查结论——三堵硬墙：

| 墙 | 证据 | 后果 |
| --- | --- | --- |
| **格式墙** | `document-service.ts:12` 明写 PDF/DOCX/XLSX/图片 → 单块占位 + `parseStatus:'failed'`；真正解析的只有 `.md/.txt/.csv/.json`+SVG | 现实审批材料 99% 是 PDF/扫描件/Word/Excel，导入即"等于没看见" |
| **领域墙** | 三处 system prompt 写死"你是学生综合素质测评审核助手"（`ai-review-service.ts:156/261/400`）；发现类型写死六类；规则类别写死八类（`review.ts` `RuleOutlineCategory`） | 换领域后模型输出被六类框住（"合同缺违约条款"只能塞进 missing-evidence）；`ReviewCaseType` 的 `'自定义审核'` 是空标签 |
| **入口墙** | 渲染层只调 `loadDemoCase`（`use-review-actions.ts:83`），无任何新建案卷/导入入口 | 用户只能用演示案卷，无法导入自己的文件——灵活性的直接否决项 |

次要限制：角色仅 `rule/application/evidence`；`extractItems` 强依赖「案卷中有申报表文档」且只取第一份；无「N 份待审文件」抽象；检查框架偏三方对账（形式审核）。

## 二、升级决策（D12-D18）

| 决策 | 内容 | 理由 |
| --- | --- | --- |
| **D12** | 文件解析复用既有 `document-parser.extractTextFromFile`：PDF/DOC/DOT/WPS/DOCX/XLSX/PPTX/ODT/ODP/ODS/RTF → 提取文本后走 `parseTextIntoBlocks`，`parseStatus:'parsed'`；提取为空（扫描件无文本层）→ `parseStatus:'partial'` + `parseError` 说明"无文本层，需人工复核或 OCR"，**不假装解析成功** | 项目已具备成熟解析器（pdf-parse/pdfjs-dist/word-extractor/mammoth/officeparser），重复造轮子无收益；诚实标注降级优于伪造 |
| **D13** | 图片走 Vision：`ReviewChatMessage.content` 支持 `string \| ReviewContentPart[]`（OpenAI 兼容 `{type:'text'\|'image_url'}`）；审核时把 image 块以 base64 data URL 附到 user 消息；模型不支持图片（报错/非多模态）→ 自动降级纯文本并在 `parseError`/报告注明"图片未纳入模型判断" | 证书/发票/合同扫描件是审批核心材料，不接 Vision 则格式墙只解决一半 |
| **D14** | 引入**领域包** `ReviewDomainPack`：`{id, name, description, ruleCategories[], findingKinds[{id,label,defaultSeverity,hint}], prompts{outline, extractItems, review}, sampleTemplates}`；内置四包：`comprehensive-assessment`（综测）/`contract-review`（合同审批）/`expense-reimbursement`（费用报销）/`custom`（自定义，用户可填类别与发现类型） | 领域墙的根治方案：把写死的类别/类型/prompt 抽成数据，一套引擎多场景 |
| **D15** | 类型放宽 + 兜底：`FindingKind`/`RuleOutlineCategory` 由封闭联合放宽为 `string` + `BUILTIN_*` 常量表；未知类型展示回落（标签用原字符串，严重度回落 `yellow`）；新增 `'other'` 兜底类型 | 封闭联合是领域墙的类型学根源；放宽后用常量表保住内置场景的类型提示与展示一致性 |
| **D16** | 案卷增 `domainPackId?: string` 与 `subjectDocumentIds?: string[]`（多份待审文件）；`extractItems` 合并**全部** `role==='application'` 文档并逐份标注来源，条目锚点可指向任一份；无 application 文档时退化为「以首份 rule 之外的文档为待审主体」 | 解除"单文档流"假设，支持"多份申报/多份合同" |
| **D17** | 新增跨文档比对：`ReviewFinding.counterpartAnchor?: ReviewSourceAnchor` + 内置类型 `cross-document-mismatch`；审核 prompt 注入全部待审文档以支持比对；联动时中栏同时高亮主体块与对照块 | 支持"两版合同 diff/申报与证明互证"这类审批的实质需求 |
| **D18** | 导入 UI：左栏顶部加「案卷选择器 + 新建案卷 + 按角色导入材料（依据/待审/证明）+ 删除案卷」；复用既有 `case-creation`/`case-import` 服务与 `reviewCaseListAtom`，仅补 preload 方法与渲染层动作 | 服务层早已就绪（F11 已知边界），本轮接线即解除入口墙 |

| **D19** | 审核运行使用专用超时 150 秒（`REVIEW_RUN_TIMEOUT_MS`），其余操作保持 60 秒默认 | 真机实测：领域类型表扩充后，综测案卷（21 块依据 + 7 块申报 + 领域 prompt）在推理模型上稳定触及 60 秒上限而降级 mock。审核运行是长上下文操作且 UI 有进行中状态，放宽超时换真实结论；大纲/识别/助手等中小 prompt 仍快速失败以便及时降级 |
| **D20** | 导入 `role==='rule'` 材料时自动登记 `RulePack`（名称取文件名、publisher 留空、outline 空、confirmed false） | 真机暴露：新案卷导入依据后没有任何 RulePack，导致大纲生成与审核运行都找不到"依据包"。原先 demo 案卷靠 fixture 预置才没暴露。同时加固降级路径：`fallbackOutline` 遇未知 packId 不再抛错，回落演示案卷首个包 |

## 三、任务分解

| 阶段 | 任务 | 交付物 | 验收 |
| --- | --- | --- | --- |
| **T1（契约，主会话）** | 扩展 `review.ts`：领域包类型、放宽 kind/category、`counterpartAnchor`、案卷新字段、图片 content part 类型；新建 `review-domain-packs.ts`（四内置包） | 类型 + 四个领域包数据 | tsc 全绿 |
| **T2（解析，并行）** | `document-service` 接 `extractTextFromFile`；图片块记录 data URL；扫描件 partial 标注 | 解析层实现 + 单测 | PDF/Office/图片三格式单测 |
| **T3（UI，并行）** | 左栏案卷管理（选择/新建/导入/删除）+ 领域包切换下拉 | 组件 + 动作 + preload | tsc + 截图 |
| **T4（AI，主会话）** | 网关多模态；`ai-review-service` 三处 prompt 改领域包模板；多待审文档合并；跨文档比对注入 | 服务层实现 | 单测 + 真机 |
| **T5（联动扩展）** | `reviewFocusAtom` 支持 counterpart；`SourceBlockView` 双高亮 | 渲染层 | 截图 |
| **T6（测试）** | 解析/领域包/多文档/跨文档单测 | 测试文件 | 全绿 |
| **T7（真机 E2E）** | 真实 PDF + 图片导入 → 选合同领域包 → AI 审核 → 截图 | 截图 + 报告 | engine='ai' |
| **T8（文档）** | 升级说明、验收报告补章、决策日志、移植指南更新 | 文档 | — |

### 实施结果（2026-10-02 收尾）

| 阶段 | 状态 | 证据 |
| --- | --- | --- |
| T1 契约 | ✅ | `review-domain-packs.ts` 四内置包（综测/合同/报销/自定义）+ 类型放宽（kind/category 为 string + BUILTIN 常量表）+ `counterpartAnchor` + 案卷新字段 + 多模态部件类型 + `UPDATE_CASE_SETTINGS` 通道 |
| T2 解析 | ✅ | PDF 真实提取（真机：371 字符/8 块）、Office 走 document-parser、图片块带 `imageAssetPath`、扫描件 `partial` 诚实标注；13 个解析测试 |
| T3 UI | ✅ | `CaseManagerBar.tsx` + `CreateCaseDialog.tsx`；真机截图确认案卷选择/新建/导入/领域包下拉；领域包切换 IPC 实测可切三包并复原 |
| T4 AI | ✅ | 三处 prompt 领域化、多待审文档合并、跨文档比对注入、Vision 附件与去图降级、类型/严重度按包回落；真机合同案卷产出 missing-clause/unclear-payment/unclear-liability/invalid-reference |
| T5 联动 | ✅ | `ReviewFocus.counterpartAnchor` + `SourceBlockView` 命中判定（跨文件矛盾两处同色高亮） |
| T6 测试 | ✅ | 新增 `review-generalization.test.ts` 19 用例；review 目录 **56 pass / 0 fail** |
| T7 真机 E2E | ✅ | 真实 PDF+PNG+TXT 导入 → 合同领域包 → AI 6 条领域化发现（20s）；综测 demo 回归 AI 7 条（41.6s） |
| T8 文档 | ✅ | 本文件 + 决策日志 + 验收报告 + 移植指南更新 |

## 四、验收标准

1. `bun test`（review 全目录）全绿，新增测试覆盖：PDF 解析、图片 Vision 附件、领域包 prompt 渲染、多待审文档合并、跨文档比对发现。
2. `bun run typecheck` 9 包全绿；`check:boundaries` 无违规。
3. 真机：导入一份真实 PDF + 一张 PNG 证明 → 选择「合同审批」领域包 → AI 审核产出具领域语义的发现（非六类硬编码）→ 截图取证。
4. 现有综测 demo 流程不回归（7 条发现、三栏联动、助手、导出照常）。

## 五、风险与对策

| 风险 | 对策 |
| --- | --- |
| 领域包放宽类型后展示错乱 | 保留 `BUILTIN_*` 常量表 + 未知类型回落（标签原样、严重度 yellow），UI 不因未知类型崩溃 |
| 模型不支持多模态 | 网关捕获图片相关报错 → 去图重试一次 → 仍失败则纯文本降级并显式标注 |
| 扫描件 PDF 无文本 | `partial` + 中文原因 + 报告"未识别文件"计数，不伪造内容 |
| 大 PDF/多文档超出上下文 | 沿用现有 `buildTextDigest` 思路截断并标注截断量；单文件 50MB 上限不变 |
