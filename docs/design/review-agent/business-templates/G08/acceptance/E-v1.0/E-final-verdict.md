# G08 E v1.0｜独立交叉验收最终裁定（研究／设计层）

> **`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`**
>
> 状态：**`NEEDS_REWORK`（另有`BLOCKED_SOURCE`和历史独立性证明`BLOCKED_INPUT`）**；本轮**未批准发布任何G08正式模板**。2026-10-14，审计者：G08-E-independent-session。
>
> 本报告完成 E0～E4 的本轮评估与落盘；E4作者修复后复验**未完成**，不可将“完成报告”误认为“通过验收”。

## 1. 固定验收范围及版本

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`；`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`；独立审计分支：`audit/g08-e-v1-r01`。
- 已查A v0.2.1候选母集 **26项**；独立TXX只有T02（失物领回）和T03（公共诉求/再办）；历史T01用印并入G01。
- 原作者产物并不在一个Git冻结提交，A、B/T02、B/T03、C/T02、C/T03、D原Gold/盲输入/overlay都以 **各自原ZIP SHA256**冻结于`E0-input-manifest.json`，**禁止把audit commit误记为这些原产物的作者SHA**。
- C/T02 MD v0.1 SHA256 `7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418`；C/T03 `53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af`。D/T02 32案，D/T03 30案，Gold不在公开审计Git中。
- **E1独立事实预判先锁**：commit `5a24a0197d4b6d8260097da17be64e18346b511b`，记录Gold读取前E1两个文件Git blob SHA；后续才打开C正文和D隐藏Gold。

## 2. 分阶段完成程度

| 阶段 | 本次实际完成 | 尚未完成或限制 |
|---|---|---|
| E0 | 12个作者ZIP结构/CRC核验、逐包SHA冻结、C/Gold隔离、H/M/L事前抽查计划、主审计分支建立 | 原作者未在统一不可变Git提交；T02 D1可信绝对时间戳缺失 |
| E1 | 按事前计划独立审查**22/22 H主题**、8/8 M机制、4/4 L机制，形成14个源事实反例；Git锁后才开C/Gold | 不等于22个当前校本强制义务已获核；L全部规则分母不明；成都理工具体规则部分仍缺 |
| E2 | 对T02 **51条C规则及32案D结构**、T03 **52条C规则及30案D结构**作交叉追溯；22条H源事实crosswalk；C作者散件10/10和8/8原SHA实核；样本PDF人工视觉检查 | **并非**62案关键事实全页重判；部分Gold证据语义锚点不足；独立高风险覆盖欠缺 |
| E3 | A **26/26**候选处置核对，8组跨目的/字段/权限对比；直接检查G01旧T01合并目标原件与Git SHA | 正式学生申诉/教师人事复核跨域模板ID及授权未完整固定 |
| E4 | 整理4项P1、2项来源阻断、1项输入证据阻断，保留旧版与私有补丁验证结果、提出最小修复和复验清单 | **作者修复、全H Gold语义复算、新SHA复验尚未执行** |

## 3. 分维度审定（不可平均成一个PASS）

| 对象 | sourceValidity | templateFidelity | goldValidity | crossTemplate | provenanceIntegrity |
|---|---|---|---|---|---|
| G08-T02 | PARTIAL（校本`BLOCKED_SOURCE`） | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT（独立性法证缺口） |
| G08-T03 | PARTIAL（续办接口`BLOCKED_SOURCE`） | PARTIAL | PARTIAL | PARTIAL | PASS（原件SHA可重放；时戳勘误已留痕） |
| G08领域 | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT（T02独立性证明缺口） |

T03原件的Git/ZIP摘要可重复核对，但其原D冻结时间发生有证据的修订，不能把该日期当第三方可信盖戳。以上provenanceIntegrity的PASS**只对当前提交的版本链/哈希可重放性**，不表示D生产独立性有不可推翻的第三方证明。

## 4. 主要发现与问题台账

- **P1×4（均open）**：T02高风险Gold缺直接案例；T02所有32例Gold证据位置泛化致关键语义不能充分审计；T03重要阶段/管辖8条B候选未直接挑战；A跨域法定学生申诉/人事复核接收模板稳定ID没有锁定。
- **`BLOCKED_SOURCE`×2**：T02当前成都理工非校园卡普通失物现场规则与权限；T03本校正式二次办理系统/权限与接口。
- **`BLOCKED_INPUT`×1**：T02 D1先冻结Gold的外部可信时间证据不充分；这是`provenanceIntegrity`准入缺口，不等于发现P0金标泄漏。
- 未在已独立核的政策条款和已检查C业务文字中确认可裁定的**C/D共同事实错误，已证实数量0**；不能由此推断全体62案零错误。
- 修订T02 D21 overlay两处hash校验通过，但只代表封闭受控增量的完整性，**不表示Gold真实语义已完全验收**。
- 完整票据、负责层级和复验门槛见`E4-issue-ledger.md`及`E4-retest-ledger.md`。E本轮没擅改C或D，也没有覆盖其历史FAIL/待核。

## 5. 被明确阻断的学校硬规则

当前校本真实核查可支持：校级书记/校长信箱的实名『建议尽量』不等于强制实名；环土学院『匿名原则上不予回复』限特定渠道；教务处信箱覆盖校友；2024校园卡找卡小程序有独立登记；民法典遗失物与个人信息保护法相关上位义务仍需按实际办理主体适用。**外校西安文理贵重物规则、山东接诉即办平台功能不自动成为成都理工2026年拒件/续办硬条件。**

任何`POLICY_PENDING`不得作为当前本校强制拒件，成都理工出具正式校规/授权后应先修订B或源配置并刷新受影响C/D候选，重新进行受限E1/E2/E3复核。

## 6. 不属于本次E通过的工程/现实项目状态

- `technicalTemplateRuntime=NOT_RUN`：没有把当前两套业务母版编译成实际D4/Pi工作流，也未运行该代码。
- `onlineModelAccuracy=NOT_RUN`：没有真实模型输出、独立评分或准确率；结构检查中的32/30不能当作模型正确率。
- `administrativeAuthority=NOT_VERIFIED`：校方正式制度审核与个人身份/组织签署权未授权；E不代学校做政策签发或实体审批。
- `PRODUCT_END_TO_END=NOT_RUN`：没有可复核端到端业务流程和真实通知/出库/行政处理结果。

## 7. 下一轮 r02 准入与修复回流

1. D作者提供T02缺失高风险覆盖及逐项证据语义定位的受控新版本；对T03八条未覆盖规则补独立适用与反例。
2. A/域负责人提供学生正式处分申诉、教师人事复核、工程预算/验收的目标业务ID或保留明确的不可用/仅引导状态。
3. 成理有权部门提供当前非卡普通物品的交付/代理与保管规则，及本校信箱是否支持可信再办的授权；未取得前保持`POLICY_PENDING`/不可自动动作。
4. 生产维护者补T02 D1可信不可变版本链；无则保留审计限制，不追溯性改写历史。
5. 新交付必须有作者原分支、新40位commit或每文件SHA256、差异、影响范围、独立评估访问边界。E审计 r02 只检受影响高风险及必要横向回归，不覆盖本轮结论。

**最终：`NEEDS_REWORK`。这是一份完成E0–E4当轮研究性审查、但因P1与来源/版本依赖未关闭而不予完整设计放行的正式审计结论。**
