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

### 本轮自动化覆盖

- `review-d4-intake-roles.test.ts`：正常、缺省、role 注入、长度错、越界拒绝。
- `review-d4-client-intake-roles.test.ts`：真实 Main + D2 建案、Application/Evidence 分道落库、角色污染拒绝后原 token 可重试、消费后不可重复、旧版 fallback。
- `d4-generic-object-builder.test.ts`：独立对象 ID、默认 unknown、批量重复/上限与伪来源拒绝。
- `review-d4-routing.test.ts`：冻结完整名称路由、短泛词不推荐、跨事项拒绝、PDF 正文不作已解析内容。
- `review-d4-batch-staging.test.ts`：真实目录/ZIP、SHA 去重、源顺序、路径穿越、符号链接、损坏 ZIP、100 份上限；`review-d4-client-intake-roles.test.ts` 增加文件夹跳过后 Main 强制确认、真实案卷未导入清单、来源哈希、token 重放拒止。

- C10 Main 已消费/跨 sender 安全回归持续沿用 #126，C10 独立 GUI 门禁仍未签。
- **CI 状态须以 PR #129 最后固定 HEAD 的实际远端运行回执为准**，不以本台账预先宣布通过。

## 后续仍属 W1，绝非删减交付范围

以下能力在 W1 的后续开发会话继续实际落代码，完成后才进入一次集中 W1 实机验收：

- **已交付**原生选择器下的文件夹/ZIP/单坏文件隔离与批内内容去重；**仍需开发**建案之后同样可信的批量追加入口、材料替换与版本/重复文件冲突处理、更详细的进度/失败重试和不依赖二次原生选择的真实桌面拖放授权合同。不能直接把 Renderer 传来的路径当已获授权。
- 把可解析材料的候选审核事项、对象/事实分离显示为**待审核人确认**的建议；不能根据 filename/textSample 直接确定事实，无法确认维持 unknown；多事项必须拆案/明确拒绝。
- 接通跨格式原件预览、页/段/单元格定位、人工提取纠错和版本化、证明对照对象的实际关联工作区；复用现有 `CenterPanel`、`ReviewMaterialControls`、`use-review-workspace-actions`、`SourceBlockView`，不新开第二套责任账本。
- 模板适用表单从技术 ID 进一步转成作者态声明驱动的业务友好名称与校验；保留 G01-I student-field 单独通道与真实来源适配阻断，不让合成 student fixture 进入正式模式。

## 一次集中 W1 验收（开发收口后执行，不是现在声称已过）

对固定 HEAD，在干净 Electron 用户环境、隔离文件、无真实校务数据下操作完整业务链：新建多对象 → 批量文件与 ZIP/文件夹 → 路由建议/人工改选/多事项拒绝 → 确认三态条件 → D2 建案/Subject/Rule/fingerprint → 材料角色、原件 hash、证明主体绑定 → 事实纠错与来源定位 → 重新启动核对持久化。正反例含重名、空文件、损坏 PDF、跨对象串证、同 token 双消费、晚到 native picker、过期与换案、混合事项、人工纠错过期状态。综合验收记录截图、只读 Main、文件 hash、真实事件；不能通过补写文档宣布 PASS。

批次正式验收之前，功能可持续开发，保留 Draft/不合 main；对已知越权、串案、丢原件等 S0 安全问题必须当轮修复，不能以集中验收为由延后。C10 历史 GUI 风险在同一集中测试窗口进行差分复核，但不能篡改 #128。
