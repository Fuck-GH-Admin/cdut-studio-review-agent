# D4｜P1-C + P2-A/B/C 一次集中独立验收任务书（2026-10-18）

> **尚未执行的独立验收任务，非签署报告。** 请先完整阅读 [批量验收制度](P2-B-C-BATCHED-ENGINEERING-AND-ACCEPTANCE-20261018.md)、[P2-B Runner 说明](P2-B-OFFLINE-PROMPT-DIFF-20261018.md)、[P2-C 拒绝诊断合同](P2-C-REJECTION-REPAIR-20261018.md)。要以交接时 PR #120 **最新冻结 HEAD** 为唯一待测候选；不能拿旧 CI、PR #111 GUI 截图或本 Agent 自测充当最终验收。

## 输入与核验顺序

- 生产代码父链：#109 `4dce31f4792a188e969c0bdbedd844620a82aaf6` → #112 `2e24e0c9a24d378a5b7f2e160c81c03041a2859c` → #117 `ff1aa01670bbeeeba33aa0f01efdf4d8da87bb9e` → #119 `f54771806da2dc4e9942dbc038a0ebbc101b3b68` → #120 *执行时从 GitHub 读取 HEAD*。
- 原始 GUI evidence：#111 `56d2492cd1d8c3559d55de28ab7383948df394f8`，C01–C09 scoped PASS，C10 **FAIL**。必须保留旧失败，不覆盖旧报告。
- 先核对各 PR Draft/HEAD、当前 CI、文件差异及 P06 并发状态；记录本地 Git HEAD 与远端 SHA 完全一致。每阶段只处理同一隔离 profile 中的合成输入，不使用真实 CDUT 登录、历史个人目录、Provider Key 或生产数据。
- 在全新的 detached worktree（测试版 #120）、临时 Electron profile、空模型配置文件夹和独立 Xvfb `DISPLAY` 启动真实产品。`apps/electron/scripts/review-d4-product-loop.ts` 是已有受控启动入口。若沙箱启动失败，记录命令和降级边界，不静默切换到真实用户 profile。

## A｜GUI 最小回归包（只需一次 Electron 启动；不用 Provider）

1. 在真实 GUI 中 `材料审核 → 新建审核项目 → D4 技术预审`，通过 GTK/操作系统原生文件选择框选非敏感合成 `公共教学教室借用申请.md`。确认仅建议 `g03-t01`，20 秒不会自动填写场景、条件或确认建案。手动改选另一模板后停留超过 20 秒，人工选择优先；取消不得增加案卷。
2. 新建 G03 单 Subject 案卷，真实填写名称/主场景，保留 unknown，人工确认，然后以真实鼠标或 CDP 对“创建项目”**快速双击**。必须只触发一次 Main create，GUI 不再显示“新建案卷失败”，案卷有 1 application 文件与 1 Subject、固定 D2 fingerprint、`publicationAllowed=false`、0 Pi Run、0 EvidenceLink。
3. 另开一轮合成新案，复现 **Enter + click** 同轮提交竞态，若两次触发不可重复建案、不能第二次消费 Main token，也不能产生虚假失败 Toast。报告须明确该场景是否真实触发两个事件，不能用单击截图冒充竞态。
4. 核验文件原件到 `source-docs/` 哈希一致、Main IPC 只读 `listCases/getAggregateV2/listRunsV2` 状态与 GUI 一致；Ctrl+R 重载后同 caseId/Plan fingerprint/Subject/文件保持，无重复导入。
5. 对 PR #111 中所有通过项目，只补“容易受新代码影响”的最小 GUI 烟测，不重跑 C01–C09 的每个细节。若任何失败出现，记录首次错误并停留在**最小复现**，不要直接在独立验收分支修改生产代码。

验收 A 强制证据：固定 SHA、原生对话框截图、双击前后截图、真实 UI event log、成功/失败 Toast、真实 Main IPC 读回、单文件两端 SHA256、reload readback、0 Run；敏感字段必须脱敏。判词只选 `GUI_PASS` / `GUI_FAIL` / `BLOCKED_ENV`。

## B｜纯离线 P2 回归包（独立于 GUI、无需模型）

1. 在 #112 固定版本和 #120 冻结版本同条件分别执行 **真实 `preparePiReviewRunV2.userMessage`** 合成 G08 两 Subject 测量，按照 [P2-B 说明](P2-B-OFFLINE-PROMPT-DIFF-20261018.md) 在旧 worktree 用临时 Runner 适配旧版模块路径，不覆盖冻结代码。禁止把 #100 历史 129394 字符当同输入 A/B。
2. 使用差分工具核对 `templateId/version/selectionHash/subjectCount/ruleIdSet/checkIdSet/requirementHash`。任何不等得到 `UNPAIRED` 并 **不产生节省率**。报告 Prompt 完整字符/字节、规则区/映射区负载、Rule ID/Check ID 精确全集、70 正文字典重建；另记录真实 CLI 退出码。
3. 受控 Main 调用校验 P2-C 的虚构 FieldSpec、未确认规则 compliant、缺逐对象 EvidenceLink、非法 SourceRef、unknown 错报 not-applicable、空理由和不完整 finish=true，正确 rejected/missingChecks/repairGuide、保持 `running`；合法纠正后同 runId 继续提交，不能“建议即可放行”。
4. 若 CI 中已执行完全同一逻辑，可以复用其提交 SHA 对应原始测试日志和退出码作为**离线证据**，无需机械重复 3 次；但新旧 Prompt 对照的双工作树实测仍需单独保存。
   
判词 `OFFLINE_P2_PASS` / `OFFLINE_P2_FAIL` / `BLOCKED_ENV`。**字符缩减≠模型省钱，分类说明≠已降低实际模型拒绝数。**

## C｜受控真实 Pi A/B（仅有合法授权与 Provider 时执行）

- 在独立 profile 显式使用用户授权的测试模型配置和**全部合成材料**，保持同一模板、2 Subject、规则身份、Provider/model、采样参数和预算上限；新旧版本必须都走同样的 SourceRef/EvidenceLink Main 授权。如果旧版后端安全限制比新版宽松，不得在模型实验里悄悄更改结果真值标准，应通过共同最严格 Main 判分回放。
- 先验证每次 run 的完整输入/检查和证据授权，再开始模型请求；建议先一组有效材料加一组故意无效/未确认规则的对照，避免为统计而无意义增加运行次数。
- 独立记录 ① input/output/cache_read/cache_write 分项 token（不可简单相加）；② 真实 wall-time；③ `accepted/rejected/missingChecks` 全量及每类原因；④ SourceRef 原文匹配和证据 A/B 不串用；⑤ 107 Check 完成/未完成、Pi run 状态；⑥模型 Provider 返回异常和重试次数；⑦最多小样本的结果差异而不宣称统计显著。
- 无凭据、没有授权、无法确认 Provider 用量时标 `MODEL_BLOCKED_ENV` / `MODEL_NOT_RUN`。**不要借口无法在线运行而创建假 Provider transcript、擅自启用已有用户凭据或放宽五工具权限。**

## D｜仅提交独立 QA 证据，不提交开发代码

- 在 #120 固定 HEAD 派生全新的 `audit/d4-p1p2-batched-r01`；Draft PR base 指向 #120 分支，**仅**包含 `REPORT.md`、`verification.json`、必要 CI/CLI 日志、脱敏截图、只读回执、输入和输出哈希 `SHA256SUMS`。
- 每项区分 `GUI_OBSERVED` / `MAIN_IPC_READBACK` / `OFFLINE_CLI` / `CI_HISTORICAL` / `PROVIDER_OBSERVED` / `NOT_RUN`。不要把离线结构测试与在线模型结果混成一个 PASS。
- 最终报表至少包含：`A_GUI`、`B_OFFLINE`、`C_MODEL`、`P06_EXTERNAL_DEPENDENCY`、`RELEASE_GATE`。只在验收证据覆盖对应门禁时才允许签对应 `PASS`。P06 的 Provider/后台会话仍由 P06 自己的独立会话裁决，不可因本阶段测试自动放行。
- 必须给出明确是否允许**准备进入受限技术集成**、哪些能力仍保持 `candidate-held` 和下一个最小修复任务；未经用户批准不合并 main，不发布正式校规审核。
