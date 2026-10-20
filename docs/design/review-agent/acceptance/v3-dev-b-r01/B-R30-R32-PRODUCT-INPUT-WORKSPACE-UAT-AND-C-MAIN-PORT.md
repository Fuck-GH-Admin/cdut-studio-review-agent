# Dev-B R30–R32｜真实审核输入用户流程、待办工作台及 C Main 最小接线合同

**任务** `V3-DEV-B-CONTINUATION-R30`，2026-10-20。基线 B R29 `4c4f277773c0e20185a7364d0bb66439d51ca7a4`，回滚到此固定绿 SHA。工程 Draft PR #142 持续，绝不自动合并。统一协调 #145 的 C 裁决优先于本 B 文档。C R09 `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`；I5 已签冻结 `a77a70b3a75da11728d99dba35717b18b02a5089`，**I5 源仅 B R23**，本批不擅自成为可导入源码。

## 已落地的实际产品界面与业务能力

B-owned 现存并复用 `ReviewV3AuthorWizard.tsx`（可编辑字段/Check/Subject/条件、作者修订、冻结、技术试跑、已保存候选重新读取）和 `ReviewV3CandidateIntakeSurface.tsx`（20 秒技术路由/明确 unmatched/技术目录）。无任何重复作者持久库、InputLedger 或 parser。

1. **R30 实时全材料清单**：新增 `review-v3-b30-current-materials-read.ts` 使用 C 注入的 **Main 当前 scope** + 已有 B2 staging，全量列出同一 Owner/case 下全部暂存 candidate（最大 500）；逐原件重读物理 bytes，并检查 SHA256、byteLength、Owner generation、case、前后 Main Principal/session/frame/epoch 不变。输出 B30SourceInventory，**第二份 ZIP / 多个 ZIP 条目不能遗漏**，不得自动赋权。无 C Main 即不显示伪原件。
2. **R30/R32 候选来源强绑定**：`review-v3-product-workflow.ts` 组合现有 B20/B19 当前冻结作者、逐 Check×Target×Object×Subject×SourceRef/parseBlock/DocumentVersion 的真实候选快照，B30 完整材料、B27 readiness 和 B26 全域缺口；不允许 Check 声称使用当前 B30 未列出的物理候选；按 25 条分页展示，不展开 4,163 行。来自 B2 的读取位置缺失显示未确认，绝不猜测页码。
3. **R30–R32 真实 B-owned UI**：新增 `ReviewV3ProductWorkspace.tsx` 并在原 `ReviewV3CandidateIntakeSurface` 增加可选 `product` 端口。五步为原件总览→50 模板保守匹配→Check/Subject/Source/Parser 定位→缺口和待复核观察→第 51 套临时作者。R26 来源问题按 **原字节缺失 / 版本冲突 / SourceRef 政策适用未知 / 对象范围缺失 / 高危独立 Gold 缺失** 分开，附具体操作解释、领域/类型筛选和分页。真实源未安装明示“Main 未接通”，不会把 fixture 伪装成正式数据。
4. **R31 第 51 套动态作者**：仅 Main 已返回的 `unmatched` 且只有一个申请件、一个 Subject、全部原件角色明确，用户明确填写候选 ID/名称/用途/场景/对象/Check/审核人后调用 C 注入的 `onPrepareUnmatchedDraft`。该调用必须重用已存在的 B29 `prepareB29UnmatchedAuthorDraft` 和既有 B1 编译器。构造前读 Main、返回后**再次读取**，对比两次完整原件/Owner/epoch/冻结作者，不允许漏掉第二 ZIP 或偷换版本。返回后借用原有 B1 作者编辑器修改、保存、对照修订、试跑、冻结。候选 `candidate-held`、条件 `unknown`，不生成“万能”校规，不自动 Case。
5. **R32 技术修复入口**：实际逐 Check/SourceRef 的候选观察表单，只有 `onProposeRemediation` 端口已连接才可提交，**提交前再次读取确认快照无变更，提交后重新读当前来源**。旧快照不可直接标记“已修复”。未安装持久服务时只显示本次会话事件，并明确“非持久业务历史”，绝不谎称已有跨重启审计。真正持久历史必须 C 注入可信读写/幂等来源回执后才可通过 Gate E/P。

## 真实接口以及需要 C 的最小接线（B 不编辑这些文件）

**B 提供、C 可精确采用的 B-owned 类型/入口**：

| B-owned 路径或函数 | 输入 | 结果 | 写入权限 |
|---|---|---|---|
| `review-v3-b30-current-materials-read.ts:readB30AllCurrentMaterials` | C 当前可信 `B20MainReadScope` 回调及 B2 staging | B30 全量暂存原件/原 bytes SHA、ZIP 标记 | 只读 |
| `review-v3-b1-b2-main-read-bundle-v3-b.ts:readB20CurrentCandidateBundle` | C 可信 Principal/Owner/Picker、B1 保存冻结/B2/B19依赖 | B20 当前作者候选和逐来源现况 | 只读 |
| `review-v3-b4-bulk-evidence-workbench.ts:buildB26HistoricalEvidenceWorkbench` | 精确 D4 八域 frozen JSON、实际原 bytes/观察 | 50 模板/4163 UNKNOWN/34 scope/高危 Gold 待办 | 只读 |
| `review-v3-b-candidate-readiness-workbench.ts:buildB27CandidateReadiness` | B20+B3+可选 B23/B26 | 候选行为缺口、原因、复核操作 | 只读 |
| `review-v3-b3-unmatched-author-bootstrap.ts:prepareB29UnmatchedAuthorDraft` | 完整 Main B2 staging candidates、人明确的 author intent、实际 `unmatched` | B1 可编译、待保存临时候选 `unknown` | 纯函数 |
| `review-v3-product-workflow.ts:buildB32ProductView/assertB32StillCurrent` | C 产出完整 `B32ProductRead` | Renderer 纯展示；局部提交后再读防旧来源 | 无权写 |
| `ReviewV3CandidateIntakeSurface.tsx` 可选 `product:B32ProductPorts` | onReadCurrent / onPrepareUnmatchedDraft / onProposeRemediation | 已实现的五步 UI，未连接时明确阻断 | 无 IPC |

**C 独占的文件级 CR 候选**（请 C 根据真实 C R09/current 分支决定修改或另起适配文件，不预先授权 I）：
`apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.ts`、`review-v3-main-trusted-assembly.ts`、`review-v3-main-native-archive-registry.ts`、`review-v3-main-trust-port.ts`，配套 `review-v3-main-b20-electron-ipc.test.ts`、`apps/electron/src/preload/index.ts`、C-owned 原工作台挂载组件。具体需求：
- C Main 真正取得当前 numeric Principal/session/Owner generation/frame/epoch；在每个 async 边界前后验证，禁止 Renderer、fixture/字符串冒充。
- C 主进程全量 B2 staged candidate + Main native Picker/ZIP vault/source parser + B20/B19/author revision 读取后组装 `B32ProductRead`。其中 `readVersion` 必须是完整**当前来源内容身份摘要**（同来源多次读取稳定，任一来源/权限/版本变化则改变），不能是每次刷新随机 UUID；所有来源校验必须在 Main 返回前执行。
- C 确保 `onPrepareUnmatchedDraft` 真正重读同一完整 B2 集合和业务路由，对 Subject/version/Owner/currentity 用持久 Main 验证，返回 B29 候选草稿；B1 修订/冻结继续走既有 Main 权限接口，不得从 Renderer 直接操作文件系统。
- C 接 `onProposeRemediation` 为可信当前 Scope + candidate-only 的来源观察；若尚无符合审计要求的**持久化技术观察历史账本**，必须返回“未安装”而非假成功。人工/校方发行者验证只接受独立签发，不允许候选资料自动更改官方 Policy/Gold。
- C 自有 Main/IPC/Preload/shared 合同的确切修改需要新的文件级 CR/CI/Gate E；本 B-only 开发不等于 C 授权、I 来源重放许可或业务 Writer 权限。

## 事实/缺口矩阵（严禁以工具变绿清零）

| 事实 | R30–32 产品解释与可进行的工作 | 必须阻断 |
|---|---|---|
| 50 D4 冻结原文字节 49/50 | 显示精确版本，用户可交付新原件重哈希 | G08-T03 frozen SHA 未取得，不自动替换 |
| G01 34 对象/范围缺口 | 逐项展示对象/Subject 纠正要求、补充来源候选 | 校方审批/委托人权限未验证 |
| 全域 4163 UNKNOWN SourceRef | 逐 Check×SourceRef 精确解释 locator/version、候选修复 | 不把观察或元数据变成 policy PASS |
| 32 高危独立 Gold 待办 | R25 原文/Check pin 候选显示，需要学校人类复核 | 不以 raw pin 冒充业务语义验证 |
| 第 51 套 unmatched | 人工输入→B29→B1 原编辑/保存/试跑/冻结 | 不自动发布，不创建正式 Case/Run |
| C Main 技术接口未接入 | UI 明示不可用，保留完整 B-only 组件和精确 CR | 不展示 fixture 为真实审批或原件 |

## 本批 CI、异常和回滚

原本 B R29 已签收 `4c4f277...`。本轮只编辑 B-owned 新组件/文件及原 B-owned IntakeSurface，不碰 C-owned Main/IPC/Preload/shared/Case/Run/Writer 或 D4 frozen 资源。首轮 TS18047/TS2345 有实际失败日志，明确 null 失败拒绝路径；不得用 `! as any` 在生产绕过 scope/currentity。**只有最后工程 HEAD 三项 PR CI / D2 / Baseline 成功且真实全 Bun 日志 0 FAIL 才可报告本轮 Gate O PASS**；另单独说明是否存在非 B flake retry。

可回滚父 SHA：`4c4f277773c0e20185a7364d0bb66439d51ca7a4`，只撤销 R30–32 B-owned 代码、视图/定向测试，不改旧作者修订/冻结、ZIP/InputLedger 或正式 Case/Run。Gate E = NOT_RUN；School L = BLOCKED_NO_AUTH；Gate P = NOT_RUN；Release = NO_GO。正式 Gate E/用户旅程必须 C Main 实机可用后补做，绝不可用 SSR HTML 或合成 staging 测试替代。
