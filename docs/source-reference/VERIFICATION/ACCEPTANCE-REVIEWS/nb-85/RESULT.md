# NB-85 独立 QA 验收报告（D0）

- 批次 `nb-85`（p08-renderer-ui · p08.content-review，18 组件 / 2534 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-da446ce6ae62f168`（18:57:58Z）；QA `docs-r07-qa-nb-06-20261023`（13:30:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（5 minor，每文件恰 1 条）
- **NOT_RUN**（批内无测试文件；全部手册负向检索口径一致）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-85-SCOPE。

## G2 — 逐文件（18 组件 2534 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| ReviewV3T03RestructurePanel | accepted | NB85-N1（"2 内部" vs 自列 3） |
| ReviewV3LocalPiControls | accepted | NB85-N2（"2 内部" vs 自列 4） |
| ReviewV3F12SupplementCycle | accepted | NB85-N3（"1 内部" vs 自列 4） |
| ReviewV3T03FactWorkbench | accepted | NB85-N4（"4 内部" vs 自列 5） |
| ReviewV3T05HumanWorkflow | accepted | NB85-N5（"8 导出" vs 7，grep 定案） |
| 其余 13 篇 | accepted | — |

**红线逐条对源命中**（本批是 Renderer 权限边界密集区，摘录全部准确）：LocalManualItem revision 取自权威 aggregate+来源锚点不替换+声明≠审批；T05 能力=读投影非令牌、Renderer 零 actor/不伪造教师校方、撤回须识别原申诉人；F06 候选≠事实+同名≠身份+CAS 乐观并发+提交前以 Main 最新 revision 重预检；T03 canonical ref 闸（不转旧解析版本引用）+无写入器"不能假装已保存"；F12 回复≠核验/核结≠审核通过/阶段回流不擅改；LocalPiControls 过期判定归 Main/不写 Decision/范围校验 MISMATCH 抛错；QuickIntake UI-10/11 草稿与失败清单不丢+原件走审核导入事务；OCR/暂存预览明示"非正式结论"。

## findings（5 minor，计数口径）

全部为总结行"N 内部/导出"与自家列表不一致（每文件恰 1 条）。无行为/红线/测试存在性错误。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-85/RESULT.json.acceptedHashes`，脚本生成三方核验）；5 findings 记 ACCEPTED-ERRATA，G4 前关闭。
