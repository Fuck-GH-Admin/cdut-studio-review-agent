# 07｜七条完整业务旅程、状态及高级能力保全

以下是**目标产品状态流**，不表示已在同一SHA跑通。每条必须同时保留失败路径、可见状态、审计来源和历史只读版。

## A. 首次单案审核 + 第51套用户自建模板
`未配置 → 可信拖入/picker bytes staging（Dev-B token + sender/hash） → 分类/角色确认/20s保守路由可中止 → 作者DSL/既有50候选或第51套空白模板 → 原始规则义务核验/版本发布权限 → D2 compile+fingerprint → Dev-C唯一CreateCase/InstallPlan → Dev-A Pi执行 → Dev-C Run保存 → 三栏Check/原件定位/待办`。拒不确定路由，不隐式把示例当校规，候选held模板不等于正式published。用户无需操作JSON/Prompt。

## B. 替换归档原件 + 事实更正 + 重审
`active Version1 + confirmed Observation/Link + Run1 → 新Version2 staged → 明确替换/归档命令CAS → currentValidity失效链 → old Run1/Decision1仅历史可见 → human reconfirm new SourceRef/read → Run2 → readiness2`。归档保留value4及Receipt但撤销当前confirmed; UI同时显示历史结论与“当前待重审”，禁止因旧链接rejected却旧Observation仍confirmed而评分。

## C. 单案Pi部分提交、计算与工具失败
`frozen Check×target → 受限read/inspect + readReceipt → submit accepted/rejected/missing → 继续修复 → complete coverage → real Run`。九Check缺一/条件unknown/200差额/跨案quote/24轮终止时必须`pending/unknown/execution-failed`，不是pass；合法零问题必须在9/9独立覆盖后可成为全符合。Pi技术完成不替代教师决定。

## D. 同一Case跨批两次Run（含Group与自动化）
`BatchAttemptA frozen RunA; BatchAttemptB frozen RunB → independent triage/group/补件关联/auto opt-in → 授权reviewer逐步确认 → finalizer exact[A,RunA,Decision.basedOnRunA,hash,rev]`。RunB后来再优秀也不能被A借用；历史done无runId fail closed；用户可看到批次自己的异常状态、需复核列表与首次失败。

## E. 人工复杂审核 + 评分/回避/补件/申诉
`technical Run → subject级adjudication(通过/不通过/待补) → supplement open→student reply→resolve→rerun → independent judge rating+recusal+conflict/tie/aggregate → authorized Decision → appeal open/withdraw/review(teacher身份) → revised decision+report`。分数/回避和审查人意见独立；本地reviewer不能伪作学校teacher；未有可信学校账户时申诉解决动作显示“需授权”，本地可保留合法草稿/导出。

## F. 后台Owner、停止恢复、离线出站
`Main Owner grant → session hidden from ordinary chat → scoped inspect tools → cancellation/revoke/after-await-deny → Run/Batch业务readmodel → report/offline package → outbox durable intent → attempt/retry/reconcile → external receipt`。删除P02旧session迟到事件必须被tombstone/UUID generation拒绝；Stop/ENOSPC后只标执行失败/待恢复，不允许算业务成功。Mock返回和学校真回执分级。

## G. 模板编辑、版本升级和原义务差分
`原始政策/用户业务意图 → source-linked obligation catalog → D1 author fields/flow/constraints → D3 module version/digest and dependency cycle check → D2 CanonicalPlan + 3-valued applicability → simulate/candidate → 独立政策/Gold审核 → published → case install → 改版diff+删除Check ACK → newPlan and rerun`。原Plan永冻，G03/G04/G07未结构化责任不能偷偷弃掉；G01–08现有50候选全保持candidate-held，必须逐项签政策来源才能标可实际批准。

## 最终工作台的用户约束

保留V1原件/规则/问题三栏的直接跳转，同时允许按内容折叠和移动端单栏导航；保留人工改字段/事实、批次异常和待办、评分/回避、补件、申诉、报告、离线包、时间线。每个状态至少有`technicalState / businessState / approvalState / sourceValidity`四种可见信息；不能把`Run completed`着色等同`学校审批通过`。SourceFocus读取明确documentVersion、page/rect、sheet/cell、paragraph；无法精准定位要显示“定位不确定”，不能虚构坐标。

每条旅程保存合成/授权真实样本ID、旧新状态、actor/receipt、Run/Plan/source hash、失败首次日志与恢复回放；七条未统一跑通前不宣称产品完成。