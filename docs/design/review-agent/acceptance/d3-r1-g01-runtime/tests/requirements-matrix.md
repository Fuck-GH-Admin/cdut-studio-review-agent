# 正/反例及 R0→R1 差异矩阵

| 项 | R0 失败/拒止 | R1 合成正向样本 | R1 单变量负样本及预期 |
|---|---|---|---|
| F01 双字段 | 0 subject, 0 target; 非法 student target | 1 student, name 与 credential 两个 Target/Subject/Check/Source 各自绑定 | 移除 credential 只剩 name；更改 `fieldKey` 与 `objectKey` 不一致 → `D2_TARGET_INVALID` |
| F02 动态条件 | `caseFields` 不更改 D2 任务 | 相同模板的不同字段数/intent/enrollmentStatus 影响 Check 或明确状态 | 仅变 intent → 该字段 `unknown`，不能 `compliant`；快照状态反向 → `not-applicable` |
| F03 多业务分支 | 单 `scenario` + 单一 campus-card | `scenarios` 两个条件都可激活各自字段任务 | 删除一个 scenario 使某字段无责任 → `D2_UNUSED_TARGET`；未知 → `D2_SCENARIO_REQUIRED` |
| F04 不允许整案假成功 | 49 项 case-scope 的 A plan 不等于 49 动态 student runs | 每个学生任务需 studentScope；真正政策整案例外必须 `caseScopeJustification` | 没两者的 case 任务 → `D2_STUDENT_UNSCOPED_CHECK`，仅有 studentScope 却无 target → `D2_STUDENT_SCOPE_REQUIRED` |
| F05 可信来源 | 学生自述在 caseFields 可伪装“登记旧值” | 独立受控合成 registry 绑定 subject/source/snapshot version，核验字段值 | 仅填 caseFields 保持 unknown；撤销、伪造 sourceKind、字段/状态矛盾拒止 |
| F06 一证多事实 | `advanced.evidenceRelations` 完整图被拒止 | 同一已注册文书版本两条 reviewer user-confirmed EvidenceLink，分别 name/credential | 错 Subject、旧 doc-v1 对新 doc-v2、无 link、第三 fact、注销文档各自不能通过 |
| F07 未确认依据 | 不应把 policy-candidate 生效 | 校本政策作为 unverified-policy 保留待核，不触发自动审批 | `awaiting-confirmation` 以外状态由 Pi 绑定/回执门禁拒止 |
| F08 流程归责 | Applicant material 与 authority 后续材料有分别 | reviewing 到期材料由 exact gate 检查，AI/技术预审仅待核 | authority-owned 缺件不能归责申请人，审批签署不能 AI 合规 |
| F09 旧兼容 | 老校园卡、档案、文本、D3 束 | 旧 schema1、原 D1/D3/Pi 回归继续 | 非法 `advanced` 继续 `D2_UNMAPPED_ADVANCED`，无权限发布/自增规则拒止 |
| F10 CLI 串行运行 | R0 只有单场景空 student | D1 validate/save/read/diff → D3 export/import → D2 preview/register/create → Pi 技术回执 | 无 `D2_ALLOW_SYNTHETIC_REGISTRY=1` 仍指定快照 → `D2_TRUSTED_SOURCE_DISABLED` |

**测试源**：`apps/electron/src/main/lib/review/review-d3-r1-student.test.ts`；原有 `review-d2-runtime.test.ts`、`review-d2-execution-gates.test.ts`、`review-authoring-v1.test.ts`、`review-d3-handoff*.test.ts`、`review-d3-pi-integration.test.ts`、`pi-case-review-service.test.ts`。

**范围声明**：人工确认合成证据的正向门禁为技术可用，不证明材料真实合法；模型服务运行是实际工具提交/回执接口，不是对在线 LLM 阅读能力或 Gold 的验证。
