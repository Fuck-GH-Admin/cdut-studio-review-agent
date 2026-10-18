# D4 W1｜完整业务输入与材料处理：开发台账（2026-10-19）

> **这是 W1 大功能批次的持续工程台账，不是 W1 完工声明或降低原 A/C 验收标准。** W1 可以跨多个开发会话。每次新增代码立即做对应 typecheck / 正反回归 / CI，等同批次功能收齐后集中做一次独立 Electron/Xvfb 业务操作验收。安全缺陷单独阻断，普通 UI 小问题允许列入集中修复。

## 固定基线和不可变边界

- D4 生产父链：P2-C #120 `026cfe0f4905bf10f46291bdd7451788c60df5f9` → C10 生命周期修复 #124 `fc5100b339d1f097aea4ee60bd2d912276bf8429` → C10 Main 负例/QA 工具 #126 `412e1520b22591818463dff3e6658cfa09fe124d`。
- W1 开发分支 `feat/d4-w1-intake-assignment-and-routing-r01`，PR #129 基于 #126 固定 SHA；#128 结果 `C10_R03_BLOCKED_INPUT` 保留，不重标 GUI PASS。
- P06 后台 owner/IPC/Pi Provider 在独立分支实现，D4 不抢安全归因、不引入第二引擎；D2 不可变 Plan、逐对象 SourceRef/EvidenceLink、candidate-held、unverified-policy、三态 unknown、Gold/真实校规均不放宽。
- 规范以 `02-product-and-templates.md`、`04-acceptance-and-evaluation.md`、`05-completion-roadmap-and-feasibility.md` 为准；它们的全部最终要求未被本台账删减。

## 已提交本轮生产能力（截至本文）

1. **逐文件材料归类**：`D4IntakePicker` 在建案前显示原生选择器实际暂存的每个材料及大小；默认申报材料，审核人可以明确改为证明材料。原有 20 秒候选路由、人工覆盖不变。只允许 `application|evidence`，材料从不自动升级成已授权规则或自动跨 Subject 关联。
2. **Main 安全接线与持久化**：`D4ClientSelection.intakeRoles` 只携带按原生 picker 顺序的业务用途；`resolveD4IntakeRoles` 检查个数/全部值，token 的 sender、时效、消费依然由 Main 校验。角色异常会释放 token 允许用户改正后重试，不创建空案；老版本不传 plan 仍全部导入 application。实际 `createD4ClientCase` 调用原 D2 compile/create 和原导入解析、落库。
3. **文件名与暂存可靠性**：Main 暂存改为按文件索引独立目录，而不是给原始文件名增加 `0-`/`1-` 前缀；来源列表与解析记录保存真实原始文件名。Picker 在提交中冻结，关闭后迟到的原生选择结果立即 discard，不把旧材料送入新案卷；外部父组件关闭也尝试清理不用的 token。
4. **通用候选路由**：在既有精确信号外，允许使用冻结作者态模板的**完整且足够长的名称**做保守的文件名/受限纯文本片段建议，覆盖此前未显式硬编码的 G01–G08 模板。歧义、部分材料不明或多事项依然拒绝自动决定；不会凭文件名推定主场景、条件、校方权属。
5. **批量业务对象输入**：`D4GenericObjectForm` 保留逐对象新增/删除，增加每行一个名称、每次最多 20 个、总量最多 100 个的批量入口。自动创建独立对象/Subject ID；每个主场景仍需用户明确选择，全部条件默认 unknown，必须逐项确认，不能从名称造审核结论。

6. **文件夹/ZIP 可信批量入站**：Main 原生文件夹选择器和原有多选/ZIP 选择器统一进入 `stageD4NativeBatch`。支持递归目录和压缩包条目，100 份/50 MB 单文件/100 MB 总解压体积/8 层目录/最多 5000 条目；超限和损坏条目记录到 skip ledger；符号链接、ZIP Slip、非普通文件和不可移植文件名 fail-closed。JSZip 使用受限 Node Transform 管线流式解压，不按 ZIP entry 原路径写磁盘。
7. **去重与缺失清单**：同批内容采用 SHA-256 去重，首份保留、后续重复项明确登记原因；unsupported/empty/oversize/坏 ZIP/重复来源不会静默消失。Main 在 `createD4ClientCase` 验证用户对 skipped manifest 的明确确认，角色计划仍只接受 application/evidence；提示与落盘明确区分已导入和未导入。
8. **持久来源与状态可见**：`ReviewCase.d4IntakeOrigins` 为每份导入材料保存 documentId、文件夹/ZIP 内相对来源标签和 staging bytes SHA-256；`d4IntakeWarnings` 保存全部跳过和解析异常。重新打开案卷时，`CenterPanel` 可浏览已导入来源/哈希与需要补交的材料清单。未自动为证明建立 Subject EvidenceLink，仍需人工操作。

9. **已建案批次追加与版本冲突处理**：新增 `review-d4-case-batch.ts`。Main 对既有案卷执行 owner-bound native token 检查、case revision 预检、逐文件 SHA-256 与同名冲突评估；预检只传文件名、索引、来源标签及同案 documentId，不发送宿主文件路径。每份选择 `skip|append|replace(documentId)`，同内容必须跳过、同名异内容仅能明示替换或跳过；替换仅在新材料**完整解析成功之后**调用原 `removeDocumentsFromCase` 归档旧文档，不删除旧原件。禁止同一替换目标被重复使用。
10. **用户实际处理界面**：新增 `D4CaseBatchControls` 并嵌入 `CenterPanel` 申报/证明区，调用新版 Main/Preload IPC 先选择文件/ZIP 或文件夹，再显示逐文件冲突清单、重复判定、跳过明细及替换选项。案卷修订号变化则拒绝应用，须重新预检；迟到的本机文件选择在换案时丢弃。处理结果写回原案卷，并仅在仍查看此案时刷新。
11. **失败与历史追溯**：追加过程继续用已有 `importDocumentFromPath`、`removeDocumentsFromCase`、`updateCase` 和 V2 同步机制，保留原 SourceDocument 和存储历史。未导入清单要求明确同意，失败和部分解析记入永久历史；不能用表面上的导入成功掩盖漏材料。现为非原子多步补充/替换，审计保证“新材料收录成功后才归档旧件”，异常需检查日志与案卷版本，不能宣称完整数据库事务。

12. **D4 Subject 事实确认可用化**：原 `CenterPanel` 的 V2 Observation 校对、人工事实录入和最终认定仅在 V1 申报条目分支内可用，D4 Subject 页面只有静态对象卡。现直接把事实候选卡、单对象来源核验、人工更正、人工新增及确认关联摘要接到每一个独立 D2 Subject；各对象之间不复用事实或来源状态。字段候选来自该 Subject 的固定 `evidenceCoverage.fieldKey`/`supportsFacts` 或嵌套 `confirmed-observation` 执行 gate，仍不构成校方规则授权。
13. **真实 SourceRef 与来源定位**：`w1-fact-source` 只接受当前案卷仍有效、parseStatus 为 parsed/partial 的 DocumentVersion，审核人明确选择文件和可选的具体文本块；无法可靠对应到块则声明为文件级。V2 原生 SourceRef 的准确坐标，仅当 caseId、parseRevision 和实际块完全一致才继承。模型摘录只在非空、唯一完全匹配时得到块精度；模糊匹配不伪造定位。候选事实无有效来源时不能直接人工确认；支持选择来源并点击原始资料定位、补充理由与更正。全部提交沿用 `CorrectObservation` 的 V2 expectedRevision/actor/append 机制。
14. **业务表单兜底语义**：候选模板自身如果没有声明 `TemplateVersion.fields`，事实 UI 不把任意自然语言当字段；只使用本 Subject 的冻结 D2 事实责任键。无法提供业务标签时显示真实字段 key 而非所有字段同名为“补充信息”。特殊 G01-I 学籍没有被转换成未经授权的通用学生底账。
15. **字段类型与跨案防护**：`w1-fact-value.ts` 按 V2 FieldValue 原 kind 校验 number/date/boolean/enum/multi/text，不再把数字更正悄悄降级成字符串；错误数值、无效日期、无授权 enum 拒绝并在事实卡显示原因。当前案卷必须包含被操作 Subject；D2 候选字段必须来自本对象固定 `evidenceCoverage` / gate，或已存在的 Subject 字段；超出范围的候选事实可见但不得点击确认。人工无有效来源禁止保存，错误通过 UI 可见并保留编辑状态。

16. **定向材料重新解析**：新增 `review-d4-document-retry.ts`，D4 的申报/证明区对 failed/partial 材料提供“重新解析案卷内原件”。Main 仅从本案 `source-docs` 定位原件，验证普通文件、相对路径边界、原始大小和首次 Main 暂存 SHA-256；拒绝来自 Renderer 的路径、非 D4、已归档原件、旧 revision 和篡改字节。沿用 `importDocumentFromPath` 生成新的源文件 ID 和不可变版本；只有新版本 parsed 才归档旧文件，仍 partial/failed 则归档本次尝试、保留原文件，保存失败原因和所有版本来源。与批量追加共享 Main case BUSY 守卫；非数据库事务，不能宣称 OCR 或视觉自动补齐。
17. **直接拖放的无路径安全契约**：新增 `stageD4DroppedBytes` 和 Preload typed IPC。Renderer 从真实拖入 File 提取用户提供的字节，**只上传 name + Uint8Array，不上传宿主路径**；Main 限制 16 份、每份 10 MB、总计 40 MB，验证可移植文件名并写到隔离目录，再统一复用 ZIP/文件夹、SHA 去重、跳过列表、跨 sender token 与建案后逐项冲突预检。D4 旧版路径拖放区隐藏；其他非 D4 审核保留旧体验。目录拖放不自动扫描，需使用原生文件夹 picker；仍待集中 Electron GUI/负载验收。
18. **失败不是通过**：解析重试不自动确认 Subject 事实、不授权 EvidenceLink。无法完整解析的图片仍显示 partial，拖入材料仍受候选路由多任务阻断与 D2 immutable plan/unknown 条件约束。

### 本轮自动化覆盖

- `review-d4-intake-roles.test.ts`：正常、缺省、role 注入、长度错、越界拒绝。
- `review-d4-client-intake-roles.test.ts`：真实 Main + D2 建案、Application/Evidence 分道落库、角色污染拒绝后原 token 可重试、消费后不可重复、旧版 fallback。
- `d4-generic-object-builder.test.ts`：独立对象 ID、默认 unknown、批量重复/上限与伪来源拒绝。
- `review-d4-routing.test.ts`：冻结完整名称路由、短泛词不推荐、跨事项拒绝、PDF 正文不作已解析内容。
- `review-d4-batch-staging.test.ts`：真实目录/ZIP、SHA 去重、源顺序、路径穿越、符号链接、损坏 ZIP、100 份上限；`review-d4-client-intake-roles.test.ts` 增加文件夹跳过后 Main 强制确认、真实案卷未导入清单、来源哈希、token 重放拒止。

- `review-d4-case-batch.test.ts`：在真实 D2 案卷使用本机 picker 暂存，再检验追加、SHA 重复拒绝、跨 sender、旧 revision、伪造替换目标、成功新版归档旧件、永久来源 hash 与重复 token、已建案文件夹 skip 强制同意。
- `w1-fact-source.test.ts`：同案 Subject 自己的候选事实与 gate 递归键、真实 block/paragraph 精度、file 级降级、已归档/未解析来源拒绝、伪造块和旧 parseRevision 阴性测试。
- `w1-fact-value.test.ts`：数值和单位保留、非法数字、日期/布尔/枚举、多值去重、未声明对象种类的拒绝；`review-d4-case-batch.test.ts` 补真实 D2 Subject `CorrectObservation` 原件 SourceRef + Receipt 持久化回归。
- `review-d4-document-retry.test.ts`：真实 D2 案卷旧解析失败→重试成功/旧件归档、图片 partial→旧件有效、原件同长度篡改 SHA 拒绝、旧 revision 拒绝。
- `review-d4-case-batch.test.ts` 新增真正字节拖放、SHA 去重、跳过清单人工确认、跨 owner、token 重放、危险名称和超限拒绝。
- C10 Main 已消费/跨 sender 安全回归持续沿用 #126，C10 独立 GUI 门禁仍未签。
- **CI 状态须以 PR #129 最后固定 HEAD 的实际远端运行回执为准**，不以本台账预先宣布通过。

## 后续仍属 W1，绝非删减交付范围

以下能力在 W1 的后续开发会话继续实际落代码，完成后才进入一次集中 W1 实机验收：

- **已交付**原生文件夹/ZIP 批量展开、批内哈希去重、案卷追加/同名替换，以及可信字节拖放和 failed/partial 原件的定向重试；**仍需完善**重试历史/版本图更细致的 UI、进度/取消、大批次流式传输与异常中断恢复。不可把 Renderer 路径视为已授权。
- **已交付**D4 Subject 对象下的逐对象候选事实显示、人工来源确认与更正、字段责任限界及原文坐标定位；**仍需完善**提取器对更多 Office/PDF 格式的对象归属建议、待确认的候选事项拆案操作、批量纠错的可视化一致性、人工事实审查操作在旧/新版本之间的版本差异提示。来源不足仍须 unknown，不得从文件名推定事实。
- 接通跨格式原件预览、页/段/单元格定位、人工提取纠错和版本化、证明对照对象的实际关联工作区；复用现有 `CenterPanel`、`ReviewMaterialControls`、`use-review-workspace-actions`、`SourceBlockView`，不新开第二套责任账本。
- 模板适用表单从技术 ID 进一步转成作者态声明驱动的业务友好名称与校验；保留 G01-I student-field 单独通道与真实来源适配阻断，不让合成 student fixture 进入正式模式。

## 一次集中 W1 验收（开发收口后执行，不是现在声称已过）

对固定 HEAD，在干净 Electron 用户环境、隔离文件、无真实校务数据下操作完整业务链：新建多对象 → 批量文件与 ZIP/文件夹 → 路由建议/人工改选/多事项拒绝 → 确认三态条件 → D2 建案/Subject/Rule/fingerprint → 材料角色、原件 hash、证明主体绑定 → 事实纠错与来源定位 → 重新启动核对持久化。正反例含重名、空文件、损坏 PDF、跨对象串证、同 token 双消费、晚到 native picker、过期与换案、混合事项、人工纠错过期状态。综合验收记录截图、只读 Main、文件 hash、真实事件；不能通过补写文档宣布 PASS。

批次正式验收之前，功能可持续开发，保留 Draft/不合 main；对已知越权、串案、丢原件等 S0 安全问题必须当轮修复，不能以集中验收为由延后。C10 历史 GUI 风险在同一集中测试窗口进行差分复核，但不能篡改 #128。
