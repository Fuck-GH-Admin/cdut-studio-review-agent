# 08｜源码复用、十四项G05差异、旧案迁移与可回滚切换

## 固定集成起点与函数级移植（不可整文件覆盖）

起点main `8989941b6fb5651564e32d11c4215b6a6d5a5209`，**不是**直接把P06或D4整支合并。#139已保存四组merge-base/cherry/patch-id/function-context及#97资产比较；M–D与D–P分叉事实否决简单覆盖。

| 来源 | 有条件迁移的函数/工件 | 不可一起导入的旧缺陷 | 合并实证 |
|---|---|---|---|
| main/V2 | `case-store-v2.submitCommand` CAS、Receipt、人工stage/评分/补件与V1 SourceFocus | V1 `case.json`主写、`run@rev`假Run、未受信Actor | staleRevision/replay/requestId,payloadHash+历史复盘 |
| D4 W1 | `workspace-service-v2.projectedCase(fixedD2)`，archive confirmed撤效；`review-d2-runtime.compileD2RuntimePlan`的6 Check generic；W1 staging/picker/ZIP、`review-ipc`的D4材料入口 | V1+V2双写、未经验证的旧D2升级、新material transition绕Main边界 | L1-01/05同构、schema映射、原件hash |
| P06 R03 | `review-pi-run-bridge`、Owner revoke、`pi-case-review-service`真实read/submit、review batch/group/auto/outbox各有用能力 | actor DTO透传、旧Observation持续confirmed、finalize错Run、P06旧scenario覆盖多target | L1-02/03+L1-07、finalizer事务负例 |
| P06 R02 | `batch-run-provenance.ts`的`runId+runInputHash`双绑定思想及最终定稿拒止测试 | 不要求逐文件恢复helper；R03正常auto保护仍存在 | 旧R02 helper相同负例+新R3 exact gate |
| #97 G01–G08 | 50套candidate-held catalog、immutable originals/source/coverage/manifest | 仅有path/文件或旧合成运行不等于业务发布 | #91 14项+八域义务账+政策/独立Gold |
| V1 UX | `ContentReviewView`、`SourceBlockView`、`TemplateWizardPanel`及用户状态 | 两个可写Case列表、无授权teacher假UI | live GUI多格式SourceFocus/历史adapter |

迁移时每个源函数记录：源固定SHA+blob、目标提交SHA、意图、必要行为、不可移植副作用、对照fixture、前后Receipt/Run/Material hash；Dev-C对共享文件定稿。

## #91→#97：14个同路径blob/mode义务差异逐一核查

比较 #91 `b7618958169120a5cec2f0ccaea512b13b7bd079` 与集成I `b68443b23293b4714e61a3b81383d3d3a56434fc` 的Git tree：**14个blob不同、mode全部相同(100644)**。本轮再按固定ref读取双方14个文件，比较了JSON树的变化字段（非仅路径存在）：六份synthetic-pi-receipt每份仅RunId/DocumentVersion/EvidenceLink身份变化；六份synthetic-pi-run所测字段变化模式为RunId、inputManifest hash/原件与Evidence ID、checks执行时间、opinions ID、coverage源版本和start/end时间；未见检查字段语义/数量被差分列出。test-log各自18pass/0fail，仅耗时不同；checkout-sha分别为`0b79daa3daec659754dc0299c11a5c4cd17c035a`和`3b368722cc96a313c22e8c0b76e5b3459df899ab`。以上属于**历史合成运行实例/证据快照更新**，并不证明两次运行语义等价或真实Gold通过。

| # | 同路径差异 | 已审字段/处置 |
|---|---|---|
| 1 | `runtime/checkout-sha.txt` | checkout目标提交不同；保留两个原始Sha/溯源，不选较新替代源 |
| 2 | `runtime/test-log.txt` | 18 pass/0 fail、运行耗时变；不能冒充本次独立工程测试 |
| 3 | `runtime/templates/g05-t01/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 4 | `runtime/templates/g05-t01/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
| 5 | `runtime/templates/g05-t02/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 6 | `runtime/templates/g05-t02/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
| 7 | `runtime/templates/g05-t03/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 8 | `runtime/templates/g05-t03/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
| 9 | `runtime/templates/g05-t04/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 10 | `runtime/templates/g05-t04/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
| 11 | `runtime/templates/g05-t05/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 12 | `runtime/templates/g05-t05/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
| 13 | `runtime/templates/g05-t06/synthetic-pi-receipt.json` | 仅Run/DocVersion/EvidenceLink身份字段变化；旧新原始回执均只读保留 |
| 14 | `runtime/templates/g05-t06/synthetic-pi-run.json` | 变的是执行实例ID、输入Manifest与Source ID/hash、执行时间、Opinion ID、coverage引用；需要独立对齐源/Check和policy义务 |
所有原PR→#97 `source_only_paths=0` 仅代表tree没有原有独有路径丢失；**50 candidate-held不等于正式模板发布**。G03 10套GENERATED_NOT_RUN、G04/G07语义义务未全部结构化。Dev-B须为每套建立`source obligation→compiled check/condition→UI/manual fallback→policy signer`矩阵，没有真源/Gold或职责不全则BLOCKED；未授权不得读Gold。

## 旧案Shadow Read / Migrate / Rollback

1. **盘点冻结**：用户旧V1 `case.json`、旧V2 aggregate、Run、Receipt、离线Outbox逐案只读hash+版本+Count；旧run@rev明确legacy-only。禁止直接用迁移结果覆盖原件。
2. **Shadow read**：旧案打开时legacy adapter生成V3读模型，和已有视图字段/历史评分/意见/申诉/出站核对；与生产当前Case无双写。若冲突显示migration conflict并拒正式新决定。
3. **复制转换**：迁移器输出独立`migrationId`、源hash、字段映射/缺失记录；旧Run/Receipt/Score以历史对象复制/引用，缺原始Run不虚构真实Run，MaterialVersion旧SourceRef保留原指针；旧政策/Plan不可证则标UNVERIFIED_LEGACY。
4. **签收切换**：Dev-C在单案独占lock+expectedRevision下安装新权威aggregate与`legacy-tombstone`（只拒新写，不删除旧目录），维护migration mapping以及来源哈希；使用新的AppVersion才能触发CurrentCase写。
5. **回滚**：发生迁移差异/partial disk commit时恢复到已保存的旧只读快照，暂时冻结该案**新**业务写入；不可回写已追加的Receipt，也不可回滚已经发往学校的副作用。出站不确定先对账；绝不把旧写路径重新开放成双主写。
6. **退役**：shadow字段覆盖/历史回放/跨PID故障/GUI及用户确认通过后可移除旧写代码，历史reader至少保留至数据保留期；保留迁移工具/日志/哈希便于撤销。

## 旧补丁退役与失败处理

D4 fixedD2、R02 helper、Office71、P02迟到、C10双击token的实现形式可换，但对应拒止行为和测试不能丢。CI持续跑高风险反例、每批记录固定提交SHA和首败原样保留；集中验收不代替开发期快速负例。跨PID/ENOSPC后若存储状态不确定必须`RECOVERY_REQUIRED`并阻断Decision/Outbox。