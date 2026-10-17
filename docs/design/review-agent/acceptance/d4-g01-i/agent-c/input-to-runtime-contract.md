# G01-I B 输入 → D1/D2/Pi 数据契约（C0，未读取 Gold）

| B 数据字段/材料 | D1/D2/Pi 可用部分 | 无损映射及风险 |
|---|---|---|
| `caseId` | D2 创建技术案卷 `caseId` | **部分**；技术案卷 ID ≠ 学生 Subject |
| `applicant.syntheticId` | 可作待核文本事实 | **无**合法 student-identity Subject/Target |
| `school / level / international / enrollment` | `caseFields` 可存储声明 | **无**多轴选择器、制度有效性/适用范围可信依据 |
| `workflowStage`、可信 `workflow.decision` | 产品 `draft/submitted/decided/...` | **无** P0–P7 等价映射；后续部门否决不能通过初审覆写 |
| `request.intent` | `template.scenarios` | **无**合法 G01 目标：带 scenario 必须绑定校园卡 |
| `request.changes[]` 原旧/新值/更正原因 | `caseFields` 或非执行语义 Check | **无**逐字段 Subject + Claim + source 验证，不得把用户陈述当校方底账 |
| `evidenceRefs[].fieldsCovered[]` | 限定 `evidence-any` 可验 reviewer-confirmed subject+doc 链接 | **无**一般多事实覆盖/等效证明图；advanced 非空触发 `D2_UNMAPPED_ADVANCED` |
| `material-index.json`、材料 Markdown | 文档注册后有潜在 `documentVersionId/SourceRef` 对应 | **部分**；索引哈希有效 ≠ 已注册真实 SourceRef |
| 历史附件版本 | D2 对活动文档版本有限校验 | **部分**；旧版本确认不能继承至新版 |
| `trusted-fixtures.schoolRegistrySnapshot` | 不存在真实学籍库可信接线 | **无**；测试夹具禁止由申请人上传替代校方核查 |
| `trusted-fixtures.issuerChecks` | D2 正向必须 reviewer-confirmed 及精确版本 | **无**自动权威验真；UNKNOWN 必须保持未知 |
| `policyContext.currentStatus` | D1 policy-candidate / D2 unverified-policy | **部分**；SIMULATED_CONFIRMED 仅限合成假设，绝不意味着本校政策已确认 |
| P2/P5/P6/P7 责任 | D2 `material.provider` 和 `dueStages` | **部分**；禁止把后续学院/学籍部门责任当申请人当期缺件 |

**结论：** 原始 B JSON 是中立输入，不是 `ReviewCaseV2`。没有合法的业务 Subject/Target、字段多轴条件和受信来源时，不存在可计为 G01-I 业务运行成功的最小无损适配器。不可将此案伪装成校园卡、档案操作；仅适配工具概念不等于业务预审通过。

源码证据：D3-R0 `review-d2-runtime.ts` 的 `validateTargets` / `compileD2RuntimePlan` 及 `review-d2-execution-gates.ts` 当前文档版本、关联 Subject、确认来源校验。
