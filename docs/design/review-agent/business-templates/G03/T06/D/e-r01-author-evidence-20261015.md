# G03-T06｜D 原作者 E r01 DEP-001 / DEP-003 证据补齐

**本次补齐日期**：2026-10-15。只做元数据和存储对接，不修改原 D 案卷、Gold、C 模板或 E r01 原裁定。E r01 审计冻结提交为 `1be43d8bacc015e1fd21949796defcdd3ecb96fc`，**不是原 A/B/C/D 作者提交**。

## 原始交付物字节级核验

| 来源 | 原始文件名 | SHA-256 | 核对 |
|---|---|---|---|
| A v0.1 | `G03_A_领域总调研_研究交接包_v0.1_20261011.zip` | `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3` | 与E0清单一致 |
| B v0.2 | `G03-T06_B_深度调研_v0.2_本校补证_20261011.zip` | `209d7ab976326c50ba6857e2b719e974f72069f6f3945a40d677314685a213f1` | 与E0清单一致 |
| D INPUT | `G03-T06_INPUT_ONLY.zip` | `304eec24b209791b7c2c96a2b260f60cfc979cf265692164f8dcad275a5fb344` | 与E0清单一致 |
| D EVAL | `G03-T06_EVALUATION_ONLY.zip` | `f5b7a676e100e6c4c3d4fe3d661846da5bb5e04eaa29e8c7dd218e9dbc2aaa38` | 与E0清单一致，**不要上传公开仓库** |
| D REPORT | `G03-T06_D_REPORTS.zip` | `596cbce176129e907b39292c8a66d111bd112071f70e73582578ba8cb37212fb` | 与E0清单一致 |

原受控 Gold 内容SHA256：`7b516fdd68f411df2e7ed1f83ad4086e23d90f998db6ea4ceabb3bebfbb3cddb`；标签：`FROZEN_GOLD_v0_PROVISIONAL_CONTAMINATED`。这是**候选Gold**，没有独立性证明。原D作者在同一会话此前已接触C规则/自检，不能通过重新哈希或本次移动文件消除该污染。

## 本次公开可复核的检查（不含逐案答案）

- D输入22案、124条ZIP成员、101份案内普通文档记录，全部manifest文件定位与SHA一致；ZIP CRC检查通过。
- 33份PDF可解析，11份图像型证明PDF含图片且无可提取文字层。
- 对输入ZIP路径、文件名、结构化材料、PDF文本层和元数据进行针对答案提示标记扫描，命中0；只证明**已扫描范围**，不是逐页人工视觉语义检查，更不是证明存储未泄漏。
- Gold的22份可信fixtures和冻结manifest完整性静态核验通过，但本公开归档**未包含**Gold、fixtures、逐案正确答案、评分文件或可泄露映射。
- D原状态保持：D0 PARTIAL、D1 PARTIAL（前序C污染）、D2 PASS、D3 PASS（静态检查范围）、D4 PARTIAL；整体 `D_NEEDS_FIX`，产品运行 `NOT_RUN`。

## 发现的B基线版本差异

D制作时读取的单项B文件，00/02/06的SHA和E0选定B-v0.2完整包内版本不同，差异均为**v0.2追加补证或交接段落**。原D也读取了与B-v0.2完全一致的07第二轮补证报告。因此目前不能把这个差异定性为Gold错误，也不能凭它直接宣称完全覆盖。E r02需逐项复核：`B_BASELINE_FILE_VARIANT`。相应两组文件哈希见随附public-manifest。

## ACL与来源状态

- `PRIVATE_GOLD_ACL=UNVERIFIED`；未能提供私有Gold位置、实际访问者名单、ACL规则、正/反向访问测试及日志。**未核ACL不等于证实泄漏**。
- 原D作者Git commit：`NOT_AVAILABLE`；这次修复分支产生的Git提交仅证明**2026-10-15新增的公开元数据**，不追认10月13日D原作者链。
- 通过E0 manifest引用上游C原始MD v0.1的SHA256 `8bc189af1d53125023b5e93ecd78cb07b4148abb5098921ccc0c02dae1bbaa88`；本轮**不读取C正文**。C-v2.1迁移配套附件仍由归档负责人核实。
- `SOURCE_PENDING`：成都理工2023大型仪器开放共享办法全文与当前T06 PI入组审批、经费绑定校本配置未确认。模拟高校测试规则不得当作校本强制规则。

## 对独立E r02的待办

E0：原三包/新增元数据SHA、内部manifest、真实ACL与正/反向授权访问记录；E1：完整A/B来源与C接触独立性复核、B-v0.2追加条款覆盖；E2：只有Gold独立性和访问授权得到有权处置后才进行C/D静态交叉验收；E3：核T06/T07/T08/T09边界及横向一致性。E r01裁定维持open，不在本次修复中改变。
