# 内容审核专区：用户业务审查

> 日期：2026-10-03。审查对象为内容审核专区，结束时基线为 422aacdc（已包含同期提交的 Windows 顶栏修复）。按“用户已知道操作方法”评估，重点是材料是否真正纳入审核、结论能否核对、修改与补件是否形成闭环。本轮未修改产品代码。

## 判断

目前已有案卷新建/导入、三栏显示、AI 大纲与事项提取、审核运行、助手和报告导出的完整入口，固定样例能体现产品意图。处理用户自己的案卷时，仍有会漏审、串案卷和误报的问题；人工纠错、结果版本与处理记录也未闭环。应先处理下面的 P1，再补 P2。

P1 指直接影响结论可信度或把错误结果交给用户；P2 指阻断用户核对、继续修改和交接。本报告评估本组的内容审核区，不评价另外两组的 Agent 与学业备考功能。

## P1：优先处理

### 1. 用户上传了证明，但证明清单与实际审核没有完整接通

**用户情境**：上传综测表，再上传证书、活动证明 PDF 或 TXT；提示导入成功，用户开始审核。

**实际问题**：导入只追加 SourceDocument，没有生成 EvidenceDocument，后续识别也没有补出证明事实或反向关联。因此自建案卷的中栏可能始终显示“0 份证明”。AI 审核的文本证明输入来自 reviewCase.evidences，文本型证明的原文并没有送入模型。PNG/JPG 另走 Vision，可以送图，但没有随图片明确提供对应文件 ID、块 ID；用户也无法在中栏看原图或纠正归属。

隔离复现：导入一份证明.txt 后，案卷有 1 份 evidence 文档、0 张证明卡；其特有文本没有进入审核请求。另导入 9 张图片时，只发送 8 张，第 9 张跳过仅记录日志，结果的“未识别文件”仍为 0。扫描 PDF 也没有转成图片送 Vision。

**应有行为**：每份导入材料都可见并可打开；识别事实与事项关联可确认；文本证明和图像证明都进入对应审核上下文。未识别、超过数量/体积限制、被模型剔除的材料，要列入用户可见的未审核清单。

证据：[case-import.ts:101](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/case-import.ts:101)、[ai-review-service.ts:574](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:574)、[CenterPanel.tsx:194](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/CenterPanel.tsx:194)。图片限制与警告处理在 ai-review-service.ts:141。

### 2. 多份依据导入成功，实际只审核第一份

**用户情境**：同时上传学校综测办法、学院补充细则、活动通知或专项材料要求。

**实际问题**：左栏只展示第一份规则文档和第一个规则包；生成大纲和 AI 审核也只取第一个包。第二份以后已被保存，仍未进入审查。用户会认为整组依据已经生效，结果可能遗漏专项限制。

隔离复现：第一份依据的特有文本进入请求，第二份的特有文本不在请求中。

**应有行为**：显示所有依据及其启用/适用状态；审核消费全部适用规则；对冲突、版本和优先级让用户确认。不能把“文件已收录”视为“已参与审核”。

证据：[LeftPanel.tsx:38](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/LeftPanel.tsx:38)、[use-review-actions.ts:313](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/use-review-actions.ts:313)、[ai-review-service.ts:568](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:568)。

### 3. 真实案卷生成大纲失败，会得到无关的演示校规

**用户情境**：上传真实综测细则，模型超时或暂时无法连接；也可能是在合同/活动案卷中生成大纲。

**实际问题**：fallbackOutline 无论本案内容是什么，都返回演示综测规则。虽然标成“预置”，用户看到的仍是本案“AI 规则大纲”中的规则；其引用文档属于演示案卷，点击无法定位。降级大纲还没有写回本案，页面与后续审核/助手读取的依据可能不同。

隔离复现：自建案卷无模型出口时返回 7 条演示规则，12 个引用锚点都不属于本案文档。

**应有行为**：演示降级只作用于演示案卷；真实案卷保留本案已有大纲，或明确显示生成失败和人工补充入口。不能向真实依据区填入另一套规则。

证据：[ai-review-service.ts:240](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:240)、同文件:284、:325。

### 4. “没有问题”“无法审核”“没有规则覆盖”没有正确区分

**用户情境**：一份材料确实符合要求，模型输出空问题清单；或者审核失败、没有识别出事项。

**实际问题**：

- AI 返回合法的空数组，会被 parseFindings 当成异常，改用模拟引擎。模拟引擎可能再给出缺证明等无关结论。
- RightPanel 不检查 run.status；failed 运行只要 findings 为空，也显示“本次审核未发现问题”。底部可能有错误条，但右栏主体仍给出相反信号。
- AI 将全部事项计为“已审核”，又把没有问题卡引用的事项计为“规则未覆盖”。正常事项与未覆盖事项因此混在一起。
- 模型输出的 itemId 没验证是否属于本案，待人工复核统计还可能包含不存在的事项。

隔离复现：AI 空数组触发 mock 并产生 2 条 missing-evidence；渲染 failed run 时显示“未发现问题”及“AI 审核”；一条未被问题卡提及的正常事项被列为“规则未覆盖”。

**应有行为**：成功且零问题是合法结果；失败/未完成不能显示无问题；每条事项有独立的已覆盖、符合、冲突、补件、未覆盖状态，由审核结果明确给出，不能从“是否产生问题卡”反推。

证据：[ai-review-service.ts:498](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:498)、同文件:634、:660、[RightPanel.tsx:100](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/RightPanel.tsx:100)。

### 5. 等待审核时切换案卷，会出现结果串案或页面被旧请求切回

**用户情境**：A 正在审核或识别，用户先去看 B，或者同时点击“生成大纲”和“识别条目”。

**实际问题**：异步结果直接写全局 atom，没有确认当前案卷是否仍是请求所属案卷，也没有按最新状态合并。切案卷时还会清除 running/busy 标记，允许再发起任务。

隔离复现：

- 审核 A → 切 B → A 返回：页面案卷为 B，右栏 run.caseId 为 A。
- 识别 A → 切 B → A 返回：当前案卷又变为 A。
- 同时生成大纲和识别条目：识别先返回后，大纲用旧快照写回，刚识别出的事项从页面消失；落盘的主进程状态可能仍有这些事项。

**应有行为**：任务按 caseId/runId 隔离；返回时只更新相应案卷，当前页面仅显示当前案卷的结果；同案卷并行任务按最新状态合并，不能相互覆盖。

证据：[use-review-actions.ts:322](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/use-review-actions.ts:322)、同文件:342、:363；案卷切换入口在 CaseManagerBar，没有审核期间的隔离约束。

### 6. 修改材料或审核领域后，旧结果仍可被当成当前结论导出

**用户情境**：看到问题后补交证明、导入修订表、重新识别事项、修改大纲或切换领域包，然后查看/导出。

**实际问题**：这些操作没有让 reviewRun 失效，也没有显示输入已变化。inputVersion 被保存但没有在显示或导出时核对。报告把“现在的案卷标题/依据信息”和“最近一次旧运行”拼在一起。重新识别还可能改变事项 ID，原问题卡已不对应新事项。

隔离复现：切成合同领域包后，旧综测 run 仍在右栏；保存修订后的案卷再导出，报告采用新案卷信息与旧运行，未注明过期。

**应有行为**：任何影响判定的修改都使旧结果标为过期；保留旧结果对应的材料/规则快照；要求重审后导出，或允许明确导出某个旧版本。报告必须绑定同一份输入版本。

证据：[use-review-actions.ts:281](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/use-review-actions.ts:281)、同文件:229、:322、:342、[report-service.ts:73](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/report-service.ts:73)。

### 7. 红色问题卡的出处尚不能可靠核验，核心联动也有偏差

**用户情境**：用户点击红卡，要对照证明和校规判断 AI 有没有说错。

**实际问题**：

- 大纲/问题卡只做字段形状检查，没有验证 documentId/blockId/事项/规则是否真实存在。模型编造的出处仍以“AI 结论”红卡展示。
- 单份规则和单份待审文档的文本上下文仅提供块 ID，未明确提供真实 documentId；图片更缺文件与块的对应标记。模型被要求引用一组没有完整给出的 ID。
- 中栏只有事项对应的部分原文，没有待审全文和可打开的证明原件；问题引用非事项锚点或证据锚点时，往往没有对应 DOM 落点。
- 右侧问题触发的左栏规则高亮采用问题的 severity，实际会变红/黄，未按要求用蓝色。
- 文件级锚点会命中文档全部块并同时 scrollIntoView；块 ID 又只由文件名与行序生成，同名修订文件的块 ID 相同，增加错引风险。

隔离复现：模型给出不存在的申报文档和校规块 ID，服务仍返回 engine=ai、severity=red，原样保留假锚点。

**应有行为**：先给模型完整的真实来源标记，再核验引用；无合法出处的结论降为待确认并提示原因。中栏能打开全部申报和证明，点击卡片应有明确落点；依据固定蓝色；文件级定位只导航到一个明确容器。

证据：[ai-review-service.ts:509](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:509)、[SourceBlockView.tsx:98](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/SourceBlockView.tsx:98)、同文件:190、[document-service.ts:47](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/document-service.ts:47)。

## P2：补齐真实使用的闭环

### 8. 识别错误和误报没有可用的人工纠正路径

规则解释、等级/分数/日期、事项与证明关联均只读。用户无法修正 AI 识别错误、确认规则、忽略不属于申报的事项、标记误报或记录复核决定。导入修订文件只会追加，无法替换/移除旧文件；旧版可能与新版一起被审核。“重新运行”因此不一定能消掉问题。类型里虽有 manual/confirmed/ignored 等状态，但目前没有对应的 UI 和 IPC 动作。

应补：字段/大纲修正、事项与证明绑定、文件替换/停用、问题处理状态及复核备注。即使不接学校系统，也要能从发现问题走到确认处理结果。

证据：[review.ts:171](/home/miku/Bot/CDUTStudio/CDUT-Studio/packages/shared/src/types/review.ts:171)、同文件:419 的 IPC 契约、CenterPanel、RuleOutlineList；report-service.ts:89 将 manualNotes 固定为空。

### 9. 已保存的审核工作重新打开后不能恢复

切到另一案卷再切回来，selectCase 只加载案卷并清空运行。磁盘虽保留 runs，但页面没有读最近运行或查看历史的入口。右栏显示“尚未运行”，顶部导出却可通过服务导出最近运行；用户无法确定导出的哪一轮。助手聊天只存于内存 atom，重启后消失。

隔离复现：已有 run-A，重新 selectCase(A) 后 reviewRunAtom 为 null。

应补：打开案卷恢复最近运行与版本状态，选择历史审核，明确报告所属运行；持久化案卷内的助手和人工处理记录。

证据：[use-review-actions.ts:143](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/use-review-actions.ts:143)、[review-atoms.ts:88](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/atoms/review-atoms.ts:88)。

### 10. 导出的报告缺少供老师复核和学生修改的关键信息

Markdown 只写问题标题、内部事项 ID、粗处理类型与建议分，没有 detail、具体 suggestionText、原文引用、文件名/位置或事项名称映射；审核类型还写死“综合测评”。JSON 虽保留运行中的问题字段，也没有原材料/事项映射与人类可读引用，不能单独完成材料交接。人工处理记录始终为空。顶栏导出按钮直接调用返回路径，未显示成功反馈；右栏导出则仅短暂显示配置目录路径，不能直接打开。

隔离复现：报告不含该问题的详细说明和具体补件建议。

应补：真实审核类型、材料与事项清单、逐条事实/规则引用、修改或补件动作、覆盖与输入版本、人工记录，并提供打开报告/选择保存位置。

证据：[report-service.ts:116](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/report-service.ts:116)、同文件:147、:167、[ContentReviewView.tsx:153](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:153)。

### 11. 审核助手不足以回答当前材料的具体疑问

实际助手上下文只有案卷概况、选中卡片的转述，以及前 12 条规则摘要。没有申报原文、证明事实、图像和完整规则原文，也未纳入规则 confirmed 状态。用户问某一项分值怎么改、某张证书是否满足条件时，它往往只能复述问题卡或凭摘要推测。界面引用展示为内部 ID badge，不能点击回看出处。

隔离复现：请求助手解释本案材料，模型上下文没有申请表与证明中的特有原文。

应补：选中事项与问题对应的真实材料片段和经核验的规则；大案卷按选中事项取上下文，未确认解释明确标注；引用可点击定位。

证据：[ai-review-service.ts:764](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/main/lib/review/ai-review-service.ts:764)、同文件:779、[AssistantDrawer.tsx:198](/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx:198)。

## 其他可见的业务限制

| 用户操作 | 当前限制 |
| --- | --- |
| 换成活动、自定义、合同或报销 | 领域包有扩展，但活动无独立规则包；自定义未开放类别与检查项编辑。事项仍统一要求 declaredScore，页面显示“申报 0 分”；合同等新问题类型在卡片中文标签表里缺映射，类型 badge 可能为空。 |
| 一次准备大量证明 | 只能一次选择一个文件，材料包 ZIP 没有解包入口；模型回复上限为 4096 token，过多事项没有分批审核或明确的部分覆盖处理。 |
| 用扫描 PDF、RTF/ODT 等材料 | 扫描 PDF 无 OCR/转图，且没有原件查看入口；RTF/ODT/ODS/ODP 在导入过滤器中可选，但 review 的 DOCUMENT_EXTENSIONS 没包含，导入会失败。 |
| 需要准确分值 | 真实 AI 路径直接接受 suggestedScore，尚无按规则计算和上限核对的步骤；不能只因模型给了一个分数就当成可执行的核减结果。 |
| 使用用户配置的模型 | 网关取第一个启用的允许渠道和模型，没有在本区明确显示/选择具体模型；顶栏状态只在挂载时读取。 |

## 验证记录与边界

- 当前审核目录测试：56 pass / 0 fail。说明已有能力测试通过，不能覆盖上述跨步骤的业务问题。
- 另做了隔离的主进程服务、Jotai 动作与 React 服务端渲染复现：证明导入/模型上下文、多依据、演示大纲混入、空发现降级、伪造锚点、9 张图的未覆盖状态、跨案卷返回、同案卷并行覆盖、领域更换后旧结果、案卷重开、失败页面和报告缺项。
- 所有复现均使用临时配置目录、虚构材料和模拟模型回复，未请求真实模型或修改用户案卷。样例配置已清理，产品源码未修改。
- 本轮没有启动原生 Electron 做逐像素界面验收，没有校方 API 联调。颜色、出处落点和缺少人工操作的判断来自组件与服务实际代码；关键状态与输入输出另有隔离复现支持。

建议先完成 1–7 的正确性修补，再补 8–11 的处理闭环，最后扩展领域和格式。这样用户能够知道“系统究竟看了哪些材料、为什么给这个结论、我改完后结果有没有更新”。
