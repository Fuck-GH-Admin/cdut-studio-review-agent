# G07 E v1.1 研究试点 r03｜限定源事实到 C 静态语义核查

> **研究轨状态：RESEARCH_CROSSCHECK / STATIC_ONLY**。不是已生效的 E v1.1 正式标准、不是 E1 PASS、不是 E2、不是实际财务审批、不是 Gold 质量结论。

## 可信顺序与前置证据

1. **上轮事前盲源锁**：`research/g07-e-v1p1-r03-source@2287c74b3f7b979bd4cc7f8e21c5e36f31efe058`，`independent-source-register.md`、`adversarial-cases.md`、`source-lock.json` 三文件 Git blob 经重读核对；源锁最终提交时间 2026-10-15 14:34:44 UTC（北京时间 22:34:44），**早于 2026-10-16 01:52+08 的本次后续指令**。不可回填时刻或更改旧锁。
2. 先完整读取历史 r01、r02，确认二者 E0 `BLOCKED_INPUT`，未做独立 E1 或业务 E2。历史固定：`audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab` [PR #26](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/26)；`audit/g07-e-v1-r02@ff8d55026f45b09d3d4955167a6cbc4b4e8e409e` [PR #67](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/67)。两 PR 实查为 Draft，未覆盖旧记录。审计 SHA **不是**作者生产 SHA。
3. **真正先挑战后读 C**：`pre-c-challenge-lock.md` 由 Git 提交 `a709fc0dad5ae52e2be4b200efba202d6f09041d` 写入，在任何 G07 C 业务正文读取前，事先指定 Q1—Q5 五项，来自旧 H=38 独立候选，而非事后从 C/D 缺陷挑选。
4. 随后读取五份历史 C 母版的固定归档 SHA，仅做静态核查。**没有打开、复制、查询或公开任何 D Gold、EVALUATION_ONLY、评分答案或受控财务数据**；对 D 不能裁定共同错误。
5. `targeted-adversarial-cases.json` 五例是公开虚构、可复核的封闭合成案情；每例含 `dutyId/sourceLocator/applicability/changedFact/expectedDecision/admissibleAlternatives/evidenceAnchors/failureMode/confidence/unresolved`。F 仅为校方来源对应年份事实；S 是显式合成输入；U 是现行效力、权限及真实系统未核，绝不把 S/U 写成本校拒件条件。

## 核心研究增量

- **高价值静态语义缺口**：2025 CDUT 财务清单科研差旅无住宿票据“说明＋经费负责人签认＋学院审批”的公开办理情形并不限野外。C-T02 既有一般无票据材料槽 MS-06，却把执行性例外 `R-17` 写成 `field-trip-exception`，`EV-07` 定为“科研艰苦野外无票”，因此城市学术会议真实付费、已获批准但不能取住宿发票的情形没有明确独立可执行条件路径。为 `RESEARCH_C_STATIC_GAP_CANDIDATE`，不是已运行误拒或 D 错答；2026 新规可能改变适用性。
- **四项被证据排除的误判假设**：T03 事前强索后置验收/发票；T04 漏掉连号发票合计或误写 `≥`；T05 经费负责人本人领酬金自批；T07 上传转账截图当作正式债务结清。四份相应 C 冻结母版已经显式区分这些情况，不能谎报 4 个缺陷。详见 `research-crosscheck.md`。

## 计数规则（保守）

| 指标 | 计数 | 可复核边界 |
|---|---:|---|
| 相对于上轮已锁源事实，**本轮净新增已证实的官方业务事实** | **0** | 三条重要校本依据由上轮源锁首次调查；本轮仅重新定位并用于挑战历史无 E1 的审计，不以重读算新事实 |
| 有区分力、按锁定方案完成 C 静态核查的最小反例 | **5** | Q1—Q5，来自事前 H 候选；其中 **1 个新增重点覆盖轴**（城市科研已支付住宿但无票），不能把原 20 组重新计为新增 |
| **真实输入执行复现**的业务缺陷 | **0** | 未运行实际系统、模型、D Gold；另有 **1 项可定位的 C 静态语义缺口候选**，单列不充当运行缺陷 |
| 被 C 固定原文排除的错误假设 | **4** | Q2—Q5 与母版行号、Git blob 对照 |
| 仍有明确范围/取证入口的独立问题 | **5** | 现行差旅无票效力、现行采购方式细则、现行材料费合同触发、负责人领酬金实权限、借款实时台账/清结（Gold ACL 为既有独立正式门禁，不重复加分） |

## 分离的评价状态

- `RESEARCH_SOURCE_LOCK`：上一轮局部源事实，**不是正式 E1 完成或全量 H 分母复核**。
- `RESEARCH_CROSSCHECK`：本轮五例 C 静态比较，**不是正式 E2 C ↔ D Gold 交叉验收**。
- 正式 r01/r02 结论原封保持 `E0 BLOCKED_INPUT`；完整 A/B 定版、E1 门禁、D Gold 可信 ACL/独立生产时序和输入包仍待各责任方按正式规范解决。
- 系统 D4、Pi/模型准确率均 `NOT_RUN`；校方最终审批授权 `NOT_VERIFIED`；研究不写真实可支付金额。

**不在本轨查阅 Gold、不修改 A/B/C/D 原件、不关闭 r01/r02 既有工单、不合并 main。**
