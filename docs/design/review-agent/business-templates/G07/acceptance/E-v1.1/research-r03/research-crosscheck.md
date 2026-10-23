# G07 r03｜独立源事实 × C 冻结母版：高价值静态核查

> **状态 `RESEARCH_CROSSCHECK`，非正式 E1 或 E2。** 本文只评价源事实与 C 的**设计语义**；未接触 D Gold，未真实执行会计系统/模型。所有模拟申请人的事实均为虚构、封闭背景（S），不是校方强制规定。历史 r01/r02 E0 `BLOCKED_INPUT` 原样保存。

## 1. 取证时间与候选选择独立性

- 2026-10-15 22:32:11 / 22:33:05 / 22:34:44 +08:00：源登记、反例和锁档三文件依次由 Git 提交；末次源锁 `2287c74b3f7b979bd4cc7f8e21c5e36f31efe058`，早于新指令。真实先前哈希见旧 `source-lock.json`，**本轨不倒填**。
- 先查历史 [PR #26](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/26) / [PR #67](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/67)，固定 r01 `ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`、r02 `ff8d55026f45b09d3d4955167a6cbc4b4e8e409e`。二者均没有可供“新旧 E1 业务真值差分”的 E1 事实锁，不能虚构 r02/E1 结论。
- `pre-c-challenge-lock.md` **先于五套 C 正文接触**提交 `a709fc0dad5ae52e2be4b200efba202d6f09041d`，锁定五个 duty ID/最小反例/预期差异；之后才按照固定 SHA 读取 T02/T03/T04/T05/T07 C。未读 T01、T06 C 或任何 D/Gold。
- 用 **F** 指向已核 2025/2026 官方公布事实及其精确时空范围；用 **S** 仅指以下虚构人的事实背景；用 **U** 保留未核现行制度/权限，不能推断现行学校强制拒件。

## 2. 五个预锁高风险义务与实测结果

### Q1｜`G07-T02-02` 科研城市住宿客观无票——保留静态语义缺口候选

**官方依据 F（历史范围）**：[成都理工财务处 2025-04《只跑一次财务事项清单》PDF](https://jcc.cdut.edu.cn/__local/8/A8/96/748E97CB5061A750C78C9A841EF_9631E851_E5400.pdf#page=5)，物理第 5 页/第 6 项科研差旅住宿处理写了“无法取得住宿票据”可经情况说明、项目负责人签字、学院审批作为佐证。原文在这个处置句中未限定仅野外、帐篷或远郊。**但2025 清单不等于已经验证 2026 年新制下所有此类支出必可报或必给住宿费**（U）。

**封闭输入 S**：申请人实际进行已批准城市学术出差并支付一笔真实住宿费用，客观不能取得正式住宿发票，已提供说明、项目负责人签字和学院审批。仅将关键事实变为“无说明及签批”；另一个对照是“住宿完全由合作方免费提供”。

**合理预审差分**：有签批且符合当期有效制度时，应对**无票可替代证明**提供条件性受理并交财务核明金额，不能因为不是野外而无条件拒绝；无签批则待补/待审批；免费住宿不产生自付住宿费，不得凭“无票”自动得到住宿费。

**冻结 C 静态观察**：
- [冻结母版 L156–L180](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L156-L180)：`MS-06` 一般“无住宿费/租房情况说明”适用于“住宿无合法票据或非酒店”，说明作者**并非完全遗漏**材料入口。
- [冻结母版 L194–L215](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L194-L215)：`EV-06` 是合作方免费住宿，`EV-07` 被收窄为“科研艰苦野外无票”，`EV-08` 是租房；没有独立明确的“非野外、已发生付费、依法批准的客观无票”同效组。
- [冻结母版 L245–L257](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L245-L257)：`R-15` 免费住宿、`R-16` 租房、`R-17` field-trip-exception 无票，`R-14` 仅有发票但明细不足。普通城市已付住宿无发票且获正式说明审批，**没有清晰衔接到可操作规则路径**；[冻结母版 L310–L325](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L310-L325) 进一步将 `R-17` 说明为“明确 0 房费”，可能错误地把客观无票与真正免费住宿混为同一经济事实。

**最小可证伪要求**：让 C 作者指出一个**不靠默认野外前提**、可处理“已付款的城市科研住宿 + 说明 + 有权审批”的规则、等效组、触发条件及金额待核状态；如果真实存在有效通路，本项静态缺口即可被排除。反之属于 **C 规则触发域收窄、F/R 映射不闭合** 的 `RESEARCH_C_STATIC_GAP_CANDIDATE`，不作正式 P1 / 不推定 D Gold 有错。当前无法判定2026实际允许金额（U）。

### Q2｜`G07-T03-05` 采购事前 vs 完工结算——错误假设已排除

S：仍在采购需求草案阶段、未签合同未形成发票与验收；对照为已申请按合同付款的实际交付后案件。预期应分别受理 T03 需求前置资料或转 T04 履约结算。冻结 C 明确写在 [冻结母版 L13–L42](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e9f4db82176e235b87808787ddf12bd0806fa5ca/docs/design/review-agent/business-templates/G07/author-handoff/G07-T03/C-v0.1/G07-T03_正式业务模板_MD_v0.1.md#L13-L42) 草案 **不得要求**合同/发票/验收；[冻结母版 L175–L205](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e9f4db82176e235b87808787ddf12bd0806fa5ca/docs/design/review-agent/business-templates/G07/author-handoff/G07-T03/C-v0.1/G07-T03_正式业务模板_MD_v0.1.md#L175-L205) `M-25` 将成交、合同、发票列作后端排除槽；[冻结母版 L237–L247](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e9f4db82176e235b87808787ddf12bd0806fa5ca/docs/design/review-agent/business-templates/G07/author-handoff/G07-T03/C-v0.1/G07-T03_正式业务模板_MD_v0.1.md#L237-L247) `R-01` 逐动作路由。结论 `HYPOTHESIS_EXCLUDED_BY_FROZEN_C`；尚未验证实际 D4 编译/运行。

### Q3｜`G07-T04-04` 科研材料费连号发票合计门槛——错误假设已排除

**F 2025**：上述 PDF 物理第 6 页材料费项，科研单张或连号发票合计超过 **¥20,000**、非科研超过 **¥10,000**，严格是 `>` 而非 `≥`；这是旧材料费报销合同附件触发，**不是**全校 2026 采购方式限额，不能套到测试加工或服务。S：某科研材料费连续发票 12,000＋11,000，对照不连号、对照改变支出类型。C 的 [冻结母版 L90–L96](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4f914de38ec971d119fbeef20f44d82939aa70de/docs/design/review-agent/business-templates/G07/G07-T04/C-e0-r02/C-v0.1-original/G07-T04_正式业务模板_MD_v0.1.md#L90-L96) 显式写分资金性质和连号合计的 `>`，[冻结母版 L546–L556](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4f914de38ec971d119fbeef20f44d82939aa70de/docs/design/review-agent/business-templates/G07/G07-T04/C-e0-r02/C-v0.1-original/G07-T04_正式业务模板_MD_v0.1.md#L546-L556) `R-19` 区分年度/类别/合并条件，[冻结母版 L900–L907](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4f914de38ec971d119fbeef20f44d82939aa70de/docs/design/review-agent/business-templates/G07/G07-T04/C-e0-r02/C-v0.1-original/G07-T04_正式业务模板_MD_v0.1.md#L900-L907) 留 2026 校规未知。结论 `HYPOTHESIS_EXCLUDED_BY_FROZEN_C`。注意：**非连号不触发这一特定形式的合计判断，不等于合同必不需要**，仍可能因项目/采购方式/其他规则需要。

### Q4｜`G07-T05-03` 项目负责人本人为酬金受款人——错误假设已排除

F/U：校财务 2026 年审批人员选择通知的官网文字涉及本人受款时部门领导互签；当前完整真实 OA 节点/权限不得由搜索片段推断全部。S：同一项目负责人兼受款人，分别有有效独立领导互签和只有本人签字两案。冻结 C 的 [冻结母版 L73–L89](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/780cd209cecd6b90cd568997530b47ddde32aa2a/docs/design/review-agent/business-templates/G07/author-handoffs/G07-T05/E0-r02/C_frozen/original_v0.1/G07-T05_正式业务模板_MD_v0.1.md#L73-L89) `BR-11`、[冻结母版 L149–L152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/780cd209cecd6b90cd568997530b47ddde32aa2a/docs/design/review-agent/business-templates/G07/author-handoffs/G07-T05/E0-r02/C_frozen/original_v0.1/G07-T05_正式业务模板_MD_v0.1.md#L149-L152) `F-37`、[冻结母版 L298–L305](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/780cd209cecd6b90cd568997530b47ddde32aa2a/docs/design/review-agent/business-templates/G07/author-handoffs/G07-T05/E0-r02/C_frozen/original_v0.1/G07-T05_正式业务模板_MD_v0.1.md#L298-L305) `R-23` 已分离本人受益与领导互签，在初始申请阶段待批，不写“审批通过/已付款”。结论 `HYPOTHESIS_EXCLUDED_BY_FROZEN_C`。

### Q5｜`G07-T07-03` 借款归还截图 vs 财务会计结清——错误假设已排除

**F 2025**：财务清单 PDF 物理第 16 页现金归还借款的资金转入学校账户和“智能报销现金还款→冲销原借款”是不同步骤。S：个人只有一张自报转款截图；对照校方财务有交易到账、有效会计冲销和借款余额为零。冻结 C 的 [冻结母版 L61–L74](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/41b88bab6f84363e1d111f8c464cbe37cffddbcd/docs/design/review-agent/business-templates/G07/author-deliverables/G07-T07/C-v0.1/G07-T07_正式业务模板_MD_v0.1.md#L61-L74) `ST-07/ST-09`、[冻结母版 L164–L170](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/41b88bab6f84363e1d111f8c464cbe37cffddbcd/docs/design/review-agent/business-templates/G07/author-deliverables/G07-T07/C-v0.1/G07-T07_正式业务模板_MD_v0.1.md#L164-L170) 到账事实和 [冻结母版 L224–L229](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/41b88bab6f84363e1d111f8c464cbe37cffddbcd/docs/design/review-agent/business-templates/G07/author-deliverables/G07-T07/C-v0.1/G07-T07_正式业务模板_MD_v0.1.md#L224-L229) `EV-10`、[冻结母版 L249–L258](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/41b88bab6f84363e1d111f8c464cbe37cffddbcd/docs/design/review-agent/business-templates/G07/author-deliverables/G07-T07/C-v0.1/G07-T07_正式业务模板_MD_v0.1.md#L249-L258) 事件不变量，均禁止上传截图直接形成 `settled`。学生代填与真实借款人亦独立记录；2022 现行借款人资格全文尚未验证（U）。结论 `HYPOTHESIS_EXCLUDED_BY_FROZEN_C`。

## 3. 研究独立增量，不拿证据复印件冒充业务质量

| 指标 | 结果 | 含义 |
|---|---:|---|
| **相对事前源锁净新增的独立官方事实** | 0 | 2025无住宿发票例外、材料费连续发票与借款两阶段均已在旧锁登记。对 r01/r02 而言它们构成**首次有源锁的业务裁定基础**，却不能重复按“新发现政策”计数 |
| **完成预设对照并核到 C 的最小反例** | 5 | Q1—Q5 五组；其中 1 个**新精细子轴**是“城市已支付住宿无票但审批齐全”。旧 20 组不重算 |
| **真实系统执行复现的业务缺陷** | 0 | 仅静态语义可重放，不存在运行观察/Gold 解答。**另列 1 个 C 静态语义缺口候选** |
| **被充分排除的假设** | 4 | Q2—Q5，具冻结 C 行号与原文；不凭直觉断言作者错误 |
| **仍有可检验边界的 U** | 5 | ①2025年新版差旅制度对科研无票替代的影响；②现行非政采采购规则；③2026材料费合同触发与旧清单继承；④本人酬金领取实际授权OA节点；⑤实际借款到账/冲销接口、2022借款责任规则 |
| **受控 Gold / D / Pi / D4 业务实测** | 0 | `NOT_RUN` 或 `NOT_VERIFIED`；本轮无权推定 D Gold 正误 |

研究归因：Q1 疑似 C 作者规则适用范围表达问题，**也可能是当前来源效力未核或隐式规则存在**，不能不经复算定正式 P1；Q2—Q5 无现成 C 错误、不得登记虚假缺陷。若未来合规 Gold 再现相同失误才能追加 D 或 C/D `COMMON_MODE_ERROR`。

## 4. 正式门禁维持不变

- E v1.0 `E0 BLOCKED_INPUT` 尚未从 r01/r02 原审计解除；上一轮 `RESEARCH_SOURCE_LOCK` 是局部源事实，不是完整 E1 H/M/L 全量门禁。
- r02 的 T06 案数 21/23、T03 Gold 算法/时序仍属于旧作者主张和未验观察，不在本轮转成业务 P1。
- 私有 Gold 的 ACL、不可变可信生产时序和授权均未证明；不得检索或读取 `EVALUATION_ONLY`，本轮没有 `E2`。
- 作者分支均只作 **归档可重放**、不可冒充原始创建 commit；没有修改 A/B/C/D 正文或隐藏 Gold。
- CDUT Studio D4、真实 Pi 模型准确率、学校最终审批：`NOT_RUN/NOT_VERIFIED`，不产出真实“批准/可支付”承诺。

**下一步有价值的定向复算**：确认2025正式差旅办法与科研适用性，交 C 作者指出 T02 是否确有非野外、已付款但无住宿发票的“说明+审批”通路；只有定点证据可裁决缺口真伪。此路径不依赖读取 Gold。
