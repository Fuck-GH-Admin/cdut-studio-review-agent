# 07｜不可丢失的历史行为、信任边界及集中回归套件

**版本**：V3 Round 2D；**本轮执行状态全部 NOT_RUN**。原有测试文件存在和历史 CI success 只能证明有实现/历史曾验；下列每个测试需要真实命令、固定 SHA、stdout/stderr、exit code、fixture hash、失败样本匿名摘要。禁止改隐藏 Gold 或学校真实数据。

## I. 业务正反例（Gate A：离线确定性一次集中执行）

| Gate / 关联 ID | 正例 | 必须拒绝或正确保留的反例 | 最小断言 |
|---|---|---|---|
| A01 CASE-01/02 | V1建案→V2投影与V2-native原建案 | V1落盘后V2失败、两次同requestId、expectedRevision过期 | 聚合CAS/Receipt、半事务恢复、原始文档保留 |
| A02 CASE-03/TPL-03 | D2多target冻结 | 旧V1编辑同步导致subjects/rules/target改变 | frozen fingerprint和映射不变 |
| A03 CASE-04/05/06 | 人工更正且有真实SourceRef | archive旧版本后仍confirmed、later AI覆盖human | revoke current efficacy + immutable history |
| A04 RUN-01/02/05 | 每Check accepted/rejected/missing | 漏一项/跨案quote/blockId/虚构引文 | coverage未完成时不得completed/passed |
| A05 RUN-03/EXP-08 | 数字预算正确差额/日期去重 | 1680−1480=200漏检、模型自算绕确定性 | deterministic evaluator产生独立结果 |
| A06 RUN-05/06 | finish=false后补全 | finish=true但missing/rejected/第24轮耗尽 | 已接受结果不丢；缺项绝不默认pass |
| A07 RUN-07/CASE-07 | 真实Run+输入hash+published policy | synthetic run@rev / D2技术预审申请行政pass | readiness拒止且旧记录显示只读 |
| A08 BAT-05/06 | Batch A/B各自exact Run | B newer Run污染A、旧done无runId | triage/group/auto/finalize均拒跨批 |
| A09 BAT-03/04 | preview hash+组处置+opt-in policy | 改模板或input revision后仍应用预览 | CAS/receipt、role、global approve重验 |
| A10 BAT-07/08 | 明确选定补件回流批次/重试失败项 | 两个batch自动广播或重跑已通过项 | 只更改单一batch，历史Attempt保持 |
| A11 CASE-08/09/11 | 补件→评分→决定→申诉 | 评委回避仍评分、reviewer伪teacher、重开覆旧结论 | stage+actor+historical decision一致 |
| A12 CASE-10/12/EXT-01 | 离线包/outbox/reports固定snapshot | current数据补造旧snapshot、mock accepted标school | trust tier和immutable receipt |
| A13 TPL-04/05/06 | D3模块digest、升级签收 | 删Check未ACK/unknown当N/A/循环依赖 | 责任映射和旧Plan不变 |
| A14 TPL-08/09 | 50候选/八域清册 | G03 generated-not-run/G04 G07义务未结构化被说成PASS | manifest来源和Gold门禁不越级 |
| A15 IN-01..07 | Main token、角色、逐文件导入、retry | token跨sender、任意Renderer路径、ZIP同名/替换冲突 | origin/hash/revision/role不串 |
| A16 DOC-01..04 | Office/PDF/图像块精确出处 | 同名不同物理文件复用缓存、旧block与现版本混用 | 不跨案、不越根、partial不冒充full |
| A17 RET-01..03 | 历史只读展示+测试保全 | demo被当生产引擎、关键词推荐被认作全业务 | 旧语义隔离并可追溯 |
| A18 UI-01..06 | 三栏联动/批次异常解释 | 未读来源显示通过、历史状态与当前状态混淆 | 状态来源一致且未测GUI明确待验 |

## II. 系统与安全反例（Gate B：真实 Electron / Main / 故障卷）

| Gate | 执行环境 | 需要检查的事实 | 预计证据 |
|---|---|---|---|
| B01 BG-01/02/04 | Electron主窗口+后台Owner | 离开页面后任务持续，可用RunId定位，不与普通Agent工具/会话交叉 | Main journal & UI event trace |
| B02 BG-03/05/06 | Main Host tool await + stop/delete | 撤权后迟到回执拒止；删除后metadata不会复活；Bash/MCP/越根拒绝 | timestamps, grant ID, denial logs |
| B03 DOC-03/04 | Office real parser 两个物理同名doc | 解析hash/quote/blockId绝不串源 | anonymized file/hash/SourceRef |
| B04 BG-07/EXP-07/EXT-01 | 隔离磁盘故障卷/跨PID | ENOSPC触发Run终态、Owner日记、snapshot、outbox写点，重启没有假成功 | first failure, disk trace, recovery |
| B05 BAT-04/06/08 | 同案双batch、真实持久重启 | 旧批自动/finalize不消费后批 Run | exact Run IDs/decision ID/snapshot hash |
| B06 IN-01/05 | Electron拖放/窗口关闭 | sender token/revoke与重试幂等 | per-file/import receipts |
| B07 UI/DOC/CASE | 真实 Renderer/Office预览 | 原件高亮精确页码、缩放/窄屏、partial提醒、用户确认修改 | GUI录像/测试断言/匿名截图 |
| B08 CASE-02/EXT-01 | 多PID崩溃前后Case CAS / outbox | 请求幂等与actionId/payloadHash一致；外部不重复提交 | cold restart receipt lineage |

## III. 授权隔离 LIVE（Gate C：必须另行授权，不可由模拟器冒充）

- **C01 EXP-05/RUN-01/BG-03**：正式 Provider **真** `tool_use → Host handler → Main guard → receipt → Run SourceRef`，记录脱敏交互、token/role及工具错误；普通 SDK 模型profile/模拟 tool 返回不算。
- **C02 EXT-01**：获得校方授权账户/沙箱协议后复核 SchoolPort 错误/冲突/accepted 的**真实签名或可信来源**，mock/offline accepted不能升格。
- **C03 DOC-01/EXP-03**：实体扫描PDF/多图/Office在真实Reader中的全文 vs 视觉阅读差异；scope=all实际读取才能记 full。
- **C04 EXP-07**：独立维护隔离故障卷/跨PID权限，真实磁盘满后的终态不可谎报；不在用户正式卷执行风险实验。

## IV. 必须保留独立校验，禁止错误“去重”

1. **Actor**：Renderer sender 校验、Main可信角色绑定、领域服务角色门禁、Batch policy/global approval 是不同信任边界；多个层次都通过才可行动。
2. **Source**：token owner、真实文件路径与hash、document version、block/quote/read receipt、Renderer高亮必须分别核验。
3. **Run**：Pi提交校验、Check覆盖账、Run终态、案卷业务readiness、批次exact run绑定、外部回执必须彼此独立。
4. **Time/history**：历史 Observation/source/Run/决策/Receipt 是不可变事件；撤销的是当前效力而不是消除旧事实。
5. **Batch**：D4 File Import Batch 与 P06 Review Execution Batch 不等价；不同身份/权限/生命周期，不为代码去重而共用事务状态。

## V. 回归证据保存格式

每套测试新增一行 `test-id,linked-capability,conflict-id,source-code-sha,fixture-sha256,environment,command,exit-code,assertions,real-provider,real-electron,real-office,real-school,evidence-path,status`，状态仅 `VERIFIED/PARTIAL/FAILED/BLOCKED/UNKNOWN`。不把 CHECK 被拒错写为业务 `failed`；不把 CI green 或新增 `.test.ts` 定义当作本轮运行。

**实施建议**：先集中 Gate A 做跨模块联调与源逻辑负例，再 Gate B 完整 GUI/磁盘/Office，最后独立授权 Gate C；批次内每个门禁在固定代码 SHA 下运行并回收完整证据，不做碎片化空转测试。
