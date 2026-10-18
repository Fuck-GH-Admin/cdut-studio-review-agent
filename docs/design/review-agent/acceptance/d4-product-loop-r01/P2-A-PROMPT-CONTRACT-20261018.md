# D4 P2-A｜低成本普通 Pi 工具合同与提示负载首轮优化（2026-10-18）

> P2-A 工程候选，**不是在线模型性能验收**。从 PR #112 固定提交 `2e24e0c9a24d378a5b7f2e160c81c03041a2859c` 开独立分支；保留其本机 C-10 复验门禁。未经用户明确签署，不合并正式 main、P06 或校方发布。

## 原始量化证据和真实问题

历史 PR #100 的 G08 双对象 Pi 实测文件：

- `evidence/g08-online-task-prompt.txt`：129,394 字符，其中 `【检查要求】` 区约 104,928 字符，约 81%；逐对象 mapping 描述约 17,756 字符。
- `evidence/g08-online-tools.jsonl`：107 个最终 Check，126 次 Check 候选提交；34 条工具拒绝：15 个未声明的 Observation 字段、12 个逐对象证据缺口、6 个校方规则未确认却请求确定状态、1 个错误的适用性。`finish=false`、续交、`CompactContext` 均已存在。
- 输入 105,996、输出 43,594、cache-read 845,568 均是 SDK 原样不同计数口径；**不可简单相加、不可由字符数推算真实付费 token 节省**。模型准确率、业务 Gold、规则真实性未独立签署。

## P2-A 实际修改

仅在 `apps/electron/src/main/lib/review/pi-case-review-service.ts` 的 **prompt 组装**处引入辅助模块 `pi-review-prompt-contract.ts`：

1. 明列该模板的实际 `FieldSpec` key、kind、scope、分项；无字段时明确告知模型 `observations=[]`，不再诱导虚构 `d2ObjectKey`、`claim_item`、`d2Scenario` 等 Observation 字段。**Main 仍照常独立拒绝非法字段。**
2. 对每条完整 `RuleSpec` 提醒确认状态：`confirmed` 或 `unconfirmed→仅允许 awaiting-confirmation`。规则正文/title/ID、每项 Check 均**原样完整保留**。
3. 提示 `review_submit_result` 的唯一允许字段、有效状态、SourceRef 逐材料块引用、逐对象证据关联、unknown 不能默认 false、`finish=false` 分批提交和 `rejected/missingChecks` 修正。
4. D2 逐项映射从冗长汉字重复标签改成带列名的管道分隔表，逐行保留原 `ruleId/checkId/subjectId/objectKey/authority/applicability/supportsFacts`，不归并主体、不遗漏任何 107 Check。
5. D2 Subject 展示不再重复打印固定 Plan 中已经出现的 `d2ObjectKey/d2BusinessType/d2Scenario/d2Conditions`，但所有非 D2 实际字段仍展示。

当前 G08 结构测试量化 mapping 区：旧格式约 17,756 字符→压缩格式约 9.2k 字符（减少约 8.5k 字符，**仅针对 mapping 区**）。由于新合同和规则确认态会增加少量说明，**必须在实机/实际 prompt 再测整段净变化**，不得用 8.5k 当完整 Prompt 或 token 节省。

## 断言/边界

- 新 `pi-review-prompt-contract.test.ts` 实际读取已归档 `g08-plan.json`，复核 107 映射各自的 Rule/Check/Subject/Object/Authority/Applicability/Fact 不丢失，所有 107 完整规则正文和全部未确认规则提示存在。
- **未修改** `review_submit_result` 校验/持久化、`validateD2GuardSubmission`、SourceRef/EvidenceLink、TemplateStore、Pi 自定义工具数、P06 Main owner 和后台会话权限。任何 prompt 的指令始终是低可信辅助，Main 确权不靠模型守约。
- 仍全部传送 107 条长规则正文（原约 105k 字符）；没有在本轮增加按需拉取规则的工具。跨越 P06 五工具 allowlist 来换 token 是禁止的。

## 下轮 P2-B 的门禁

P2-A CI 通过后，在**单一**受控同模板样本上做新旧提示词差分，记录：Prompt 实际 chars、run ID、模型/渠道、输入/输出/cache-read 各自计数、`review_submit_result` 接受/拒绝及原因、Missing/Check/Subject 完整覆盖、EvidenceLink 串证、耗时。优先选择去掉显式“正确答案”的少量合成输入，避免重复 PR #100 的泄露样本；若没有授权的模型 Provider，就做离线契约与真实 Prompt 字符测量，并把在线效果标 NOT_RUN。反例包含虚构 Observation、未确认规则确定结论和跨主体证据。

只有 P2-A 的 Prompt 合同与回归确实改善失败原因后，再考虑 P2-B 是否值得做更激进的任务分组、紧缩规则按需读取。**不能擅自新增 Pi 工具或改 P06 五工具权限**；任何按需读取 API 需要先被 P06 或所有受影响严格工具合约接受。

## 关联状态

- PR #111 P1-C 原始独立 GUI 结论：PARTIAL，确认 C10 双击误报。
- PR #112 代码和全仓 CI 已通过（3,729 PASS / 6 SKIP / 0 FAIL）；**尚未发现新的 C10 独立 GUI 复验 PR**。此缺项不阻挡 P2 作为独立工程候选开发，但阻挡“P1-C 完全验收”和正式集成签署。
- P06 仍为外部受控依赖；本轮不宣布 P06-S02、Provider LIVE、正式 school approval 或 Gold 通过。
