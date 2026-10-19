# 04｜15项正式架构裁决（设计签名，不是验收证书）

## Q01
**裁决：**CURRENT_CASE = V2 CaseAggregate唯一命令写owner（Dev-C）；旧V1 case.json只读/shadow，不再有新案双写。

**排除的做法：**拒绝继续V1写完再project。

**证据：**ARCH-001/018; #135/#139 L1-06。**未关闭/门禁：**迁移/跨PID恢复未验，DEV-C接口先冻结。

## Q02
**裁决：**Canonical immutable PlanId+fingerprint+CheckKey×target/objectKey+conditions三值+source version；Subjects/Rules从Plan派生且不可由V1投影回写。

**排除的做法：**拒绝P06旧scenario作为统一schema。

**证据：**ARCH-002/005; #139 L1-01/05。**未关闭/门禁：**旧schema有损映射标UNSUPPORTED/PENDING_ACK。

## Q03
**裁决：**Fact历史值与CurrentValidity双层；归档链触发Observation/Link/Read/Check/Run/Readiness/Decision失效，不抹Receipt。

**排除的做法：**拒绝自动复活confirmed。

**证据：**ARCH-003/010; #139 L1-01。**未关闭/门禁：**新快照正常操作→真实决定负例未跑。

## Q04
**裁决：**Main从可信sender+owner+受信会话/校方凭据生成Principal；Renderer actor字段忽略或拒止，service按角色命令再验。

**排除的做法：**拒绝前端teacher字段/硬编码授权。

**证据：**ARCH-004; #139 L1-02。**未关闭/门禁：**可信校方teacher正例BLOCKED_AUTH。

## Q05
**裁决：**Graph与Direct Pi允许作为两执行适配器，但只有CanonicalRunEvidenceIdentity/Check/Coverage提交合同+Dev-C唯一Run writer。

**排除的做法：**拒绝双重完成定义及模型空发现判PASS。

**证据：**ARCH-006/013; #137。**未关闭/门禁：**Provider真回执/覆盖未验。

## Q06
**裁决：**ReviewBatchAttempt冻结成员、源模板、RunId/InputHash/Revision，finalize事务内exact Run=Decision.basedOnRunId，不许空Run旧done转真。

**排除的做法：**拒绝latestRun fallback。

**证据：**ARCH-007/008; #139 L1-03。**未关闭/门禁：**GUI自动+direct finalizer双正反例待跑。

## Q07
**裁决：**preview/apply/commit三层校验 policy+principal+BatchAttempt+Run exact ID+revision+hash；受信system actor是受限capability非万能teacher。

**排除的做法：**拒绝只在外层检。

**证据：**ARCH-009; #137/#139。**未关闭/门禁：**内层system actor受控绕过未测。

## Q08
**裁决：**ImportBatch材料导入与ReviewBatchAttempt多案审核运行分离，状态机/DTO/命令域不复用。

**排除的做法：**拒绝名为batch即合并。

**证据：**ARCH-011; #136/#137。**未关闭/门禁：**跨模块CLI/Electron联调。

## Q09
**裁决：**模板升级创建新PlanVersion，显示义务差异并由有权人ACK；旧Plan/Run/Receipt永不变，显式触发重审核。

**排除的做法：**拒绝silent module digest upgrade。

**证据：**ARCH-015/020; #136。**未关闭/门禁：**G04/G07义务coverage仍待独立复核。

## Q10
**裁决：**teacher-gated申诉/评分/回避必须由Main校方可信Principal+领域gate确认；无授权时显示BLOCKED而非跳过。

**排除的做法：**拒绝把local reviewer升级teacher。

**证据：**ARCH-014/004; #139 L1-02。**未关闭/门禁：**可信school account尚未证明。

## Q11
**裁决：**Outbox只可分状态intent persisted/pending/sent/acknowledged/failed/unknown；学校ack需外部signed/provider receipt+verified source；幂等重放对账。

**排除的做法：**拒绝mock accepted表示校方批准。

**证据：**ARCH-016/017; #135/#137。**未关闭/门禁：**跨PID断电及校方授权BLOCKED。

## Q12
**裁决：**统一三栏工作台+按需折叠/响应式；业务历史/原件来源只读适配；Run旧run@rev显示历史非真实执行。

**排除的做法：**拒绝删除V1源导航或双列表再造。

**证据：**ARCH-018; #135/#134。**未关闭/门禁：**目标机GUI待验。

## Q13
**裁决：**72/72逐ID唯一Owner、选定源SHA、输入输出/依赖/回归及退役条件写02 CSV和索引；所有未证状态保留。

**排除的做法：**拒绝按分支将整套功能划给谁。

**证据：**PR134/138; 02-index。**未关闭/门禁：**实际签名回归仍需开发。

## Q14
**裁决：**接受#139完整Git lineage与路径级保全；#91 14个运行证明差异逐项核对，Gold/校规和业务义务独立待签。

**排除的做法：**拒绝按文件数给50候选标发布。

**证据：**ARCH-020; #139 L0。**未关闭/门禁：**业务文本义务手工证明未完成。

## Q15
**裁决：**选择增强A混合：V2 CAS作为唯一当前权威；D4、P06适配器保全；只对跨文件事务/Actor/Batch finalizer重建。

**排除的做法：**拒绝第四个聚合核心。

**证据：**#135–139; 05选型。**未关闭/门禁：**设计可启动不等于上线。
