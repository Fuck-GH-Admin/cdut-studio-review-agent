# G07 E v1.1 研究 r04｜证据、版本差分、可重放静态实验

> 范围：G07-T02；公开可复核的官方页面与 Git 固定输入。标记：**F** 校方来源支持的限定事实；**S** 封闭合成事实；**U** 未取得的适用政策/权限/系统状态；**O** 静态观察；**I** 推断。2026-10-16。

## 一、源侧核验：同一月份的两个校方文本并不等价

| 类型 | 官方 URL、定位 | 本轮实际能够确认的内容 | 不可外推的部分 |
| --- | --- | --- | --- |
| **F-01** | 成都理工大学财务处 2025-04《“只跑一次”财务事项清单》[PDF](https://jcc.cdut.edu.cn/__local/8/A8/96/748E97CB5061A750C78C9A841EF_9631E851_E5400.pdf#page=5)，PDF 物理第 **5** 页（索引4），第6项科研差旅④(3) | 在不能取得住宿票据的材料情形，列举情况说明、项目负责人签字及所在学院审批；该格表述本身未显式写“仅野外”。取消科研管理部门额外审批。 | 这是**办理清单**，不能证明城市已付无票等于合法住宿发票替代，也不能证明 2026 可报。 |
| **F-02** | 成都理工大学财务处 2025-04《财务报销应知应会手册》[PDF](https://jcc.cdut.edu.cn/__local/D/23/C5/05E72CFA4532D2A2946EBEBE258_FFC48E39_8EEE3.pdf#page=12)，PDF 物理第 **12** 页（索引11；印刷页码10），科研经费国内差旅“所需材料”(5) | 该处将**野外艰苦地区住宿**无法取得住宿票据，与遗失/节假日造成交通票据不全，列为特定说明、负责人签字、学院审批的佐证情形。 | 该手册不是已核实的 2026 全部有效制度；不能排除后发正式修改。 |
| **F-03（作者旁证，非本轮独立全文核验）** | [成理校发〔2024〕20号相关PDF](https://skc.cdut.edu.cn/__local/0/81/F8/F213AF25A8DDE36DF9DC104CDD7_3BB8AB3B_3BB05.pdf)，作者归档定位第七条 | C-T02 作者记录该正式文件对艰苦野外无票有特定条件；本轮直接独立可核的范围以 F-01/F-02 为准。 | 不把未逐页独立复核的原文写作新获得的独立事实。 |
| **F-04（入口存在）/ U** | 财务处 [“无票报销使用说明”](https://jcc.cdut.edu.cn/info/1052/2726.htm)、[智能报销入口](https://jcc.cdut.edu.cn/znbx.htm) | 官方存在无票操作指引入口。 | 未完成权限、模块支持的费用类型、政策合法性与审批状态核验；**按钮存在≠同意城市有偿无票住宿费报销**。 |

**I-01：** F-01 与 F-02 的表述范围存在可定位差异。这项比较足以否定“单凭 2025 清单较宽字面即可确认 2026 城市无票免税票政策”的强命题，**不足以肯定**城市合法可报，也不足以证明城市一律禁止。需财务处就具体适用条款澄清。两份原站 PDF 已打开并检查相关 PDF 页面视觉版面；**官方远端原始文件 SHA-256 未独立下载复算**，不虚构源文件哈希。

## 二、冻结输入与内容完整性边界

| 输入 | 固定 SHA / 路径 | 证据类型 |
| --- | --- | --- |
| r03 E 研究提交 | `4650eadf5fe50d1bf7a343c9b05f628f9b7729c7`；`acceptance/E-v1.1/research-r03/research-crosscheck.md` 的 Git blob `f5d6c7173d1c683389712170112a61c1d8742e91` | 实查提交/固定文件；历史不可篡改 |
| C-T02 v0.1 原稿 | `1564a20fb99c5ff13fd78ce3162d0ac93005e65c`；`T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md`，Git blob `46c48f80df90e99274986633ae29d7d407ed84b9` | 实查原版 |
| C 作者 v0.1.1 新候选 | `author/g07-t02-c-urban-no-invoice-r01@b9ffd7b358f46ff271a479f8e27da6818986c388`；`T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md`，Git blob `e57a5877474ab0c45abfadbfda1a13dd34a813aa` | 实查新候选，未合入本研究分支/主线 |
| C 作者源规则差分 | `T02/source-and-rules-delta.md`，Git blob `58a820ba4e224e554e6ebe680ef94ec943969a18` | **作者自述**，不视为独立 E 运行验证 |
| C 作者清单 | `T02/C-v2.1/urban-lodging-author-manifest.json`，Git blob `06693490e9bb143fefacd1ff0f4a7abaaea85cb7` | **作者声明**旧母版 SHA-256 `543f73ea...ef556`、新母版 SHA-256 `1e5a2e0b...ad240e`；本轮未复算这些完整 SHA-256，不冒称核验完成 |

上述相对路径前缀为 `docs/design/review-agent/business-templates/G07/`。本轮通过 GitHub Git blob 和固定提交读取及比较；**Git blob SHA-1 不是文件 SHA-256**。比较 `1564a20... → b9ffd7...` 实查仅新增 5 个 T02 作者交付文件，旧 v0.1 未被覆写。

## 三、规则→材料→对照：直接静态复现

**O-01 旧版**：
- [旧母版 MS-06 与 MS-16](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L160-L179)：一般无住宿票据说明可收件，但申请住宿费的常规材料槽为酒店发票。
- [旧 EV-05/06/07/08](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L198-L207)：分列有票、免费、野外无票、租房，无城市自付无票的明确同效组。
- [旧 R-14～R-17](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1564a20fb99c5ff13fd78ce3162d0ac93005e65c/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md#L250-L254)：R-17 仅 field-trip-exception；通用 R-34 能维持“政策未知”，但没有明确城市可执行导航。**没有推定旧版一定机器拒绝**。

**O-02 v0.1.1 候选**：
- [BR-07-U（L54）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L54)、[MS-06/MS-16（L167/L177）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L167-L177)：已显式接受**城市科研已付款无票待核申请**，保留说明、签字、学院审批及住宿支付记录各自证据角色；不把支付凭证或说明直接转化为合法税票。
- [EV-07/R-17（L206/L254）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L206-L254) 仍限定野外；[R-34（L271）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L271) 明示城市源冲突→`HUMAN_REVIEW/POLICY_UNRESOLVED`，住房金额 `AMOUNT_PENDING`。
- [城市例外特别说明（L446）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L446) 明确尚无证据证明城市已被正式允许免票，其他交通等费用行独立审核。
- 作者 manifest 声称 55 字段、31 材料槽、16 等效组、14 条件轴、36 规则 ID 均保留；本轮逐点核验了被改的规则入口，但**未独立逐条审完全部 55/31/16/14/36 项**。

**O-03｜一事实变化的 S 静态对照（完整输入见同目录 question 文档）**：
```text
共有事实: 科研资金/已批出差/实际支付住宿/无住宿发票/
         客观不能取票/情况说明+项目负责人签字+学院审批/
         同样房晚与付款证据/旅后提交/其余交通证据均相同
唯一变量: lodging_environment
S-U 城市有偿 -> BR-07-U -> MS-06 -> R-34
                -> 源效力与房费金额待财务核，交通独立
S-F 艰苦野外 -> EV-07 -> R-17 (前提: 当期制度适用)
                -> 有佐证路径，但不等于自动可报或0元
```
这一静态规则追踪确实区分两案，**未实际调用引擎/模型/财务审批系统**。

## 四、新候选的两个可定位一致性待办

1. **O-04 状态名未落正式枚举。** v0.1.1 [L54/L167/L271](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L271) 使用 `SOURCE_PENDING`；但 [L365 的 `CheckState` 枚举](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L365) 无该项，全文也未独立定义 `source_status` 字段。**I**：适合作为独立来源诊断标签，但在可执行输出里必须明确映射为合法 `check_state`（如 `POLICY_UNRESOLVED` 或人工待核）、`line_precheck=PRECHECK_PENDING` 以及 `amount=uncomputed`；否则存在编译/接口歧义。不是已复现编译失败。
2. **O-05 野外“明确0房费”仍残留。** 新版 [R-17 的扩展说明 L321](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b9ffd7b358f46ff271a479f8e27da6818986c388/docs/design/review-agent/business-templates/G07/T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.1.md#L321) 仍保留“明确0房费”，但主规则要求核合法例外材料；对于 **S-F 同样实付**情形，不能以“没有正规发票”推导“实际房费为0”。**I**：将这一句改为“费用真实性及是否可核由现行校规、佐证和财务确认；免费住宿才为0”。这是语义文案冲突候选，不是已执行错误核销。

## 五、实验性质与可重放步骤

1. 打开 F-01 PDF 第5物理页与 F-02 PDF 第12物理页，核对“无票佐证”是否存在及限定地点；截取页面定位，不把图片或 OCR 当制度权威的替代。
2. 用给定固定 SHA 读取 v0.1 的 BR-07、MS-06/16、EV-05~08、R-14~17/34 与输出状态；不访问 D/Gold。
3. 用固定作者 SHA 读取 v0.1.1 相同规则与 author manifest/源差分；在 S-U/S-F 输入上手动逐条件遍历，并检查状态枚举。
4. 不做“城市发票缺失→自动拒绝”、“签字齐全→自动应报”的主观跃迁。保存未知、定位需财务处回答的事实。

**运行证据：** 以上为真实 GitHub 文件读取、Git 版本 diff、官方 PDF 页面核验和**静态**谓词对照；`D4/Pi/真实系统/授权Gold/真实审批/财务核算` 均 **NOT_RUN**。公开档案不含身份证、银行卡、真实支付记录、受限 URL、隐藏 Gold 或预期评分答案。
