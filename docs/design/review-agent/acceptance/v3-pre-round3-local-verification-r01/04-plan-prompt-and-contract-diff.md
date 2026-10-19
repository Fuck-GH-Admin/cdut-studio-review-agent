# 04｜Plan、Prompt 与 IPC/DTO 合同差异

## D2 Plan 与模型 Prompt

本轮没有调用 Provider。以下是生成/校验层证据：

| 项目 | D4 W1 | P06 R03 |
|---|---|---|
| target schema | `generic-object` 等类型；每个对象独立 `objectKey`、business type、conditions、field key/source identity | 既有档案/学籍目标种类和 scenario/operation 形态 |
| 合成输入 | 2 targets，条件 applicability 为 applicable / not-applicable / unknown，含 source id/version | 3 个旧 archive targets；用于观察旧路径，和 D4 输入不等价 |
| 编译计划 | 6 个不同 Check×target 映射；每个 Check 保留 target/object/subject 关系 | 3 个目标/检查映射；prompt 有映射身份但没有完整的 D4 target contract |
| Prompt | 含完整 targets/conditions/source/check ID；6 项 pending | `promptContainsFullTargetContract=false`；3 项 pending |
| 直接传 D4 DTO | 正常编译；`PASS_SCOPED_FULL_TARGET_CONTRACT` | `generic-object` 被 runtime 拒绝为 `D2_TARGET_INVALID: 未知目标种类`；`BLOCKED_SCHEMA` |

P06 的 prompt 仍保留既有 archive Check 映射。证据显示当前固定 schema 缺少 D4 的通用多条件目标表示；这属于跨分支接口不兼容，尚不等于 P06 对相同输入“算错”。第三轮应先冻结 `PlanId + fingerprint + CheckKey × target + conditions/source version` 权威模型、映射版本与未知值语义，再开展同输入对照。

## Main / Preload / Renderer

| 命令 | Preload 暴露 | 固定 Main 行为/DTO | 本轮结果 |
|---|---|---|---|
| `CREATE_CASE_V2` | `createCaseV2({caseId, templateId, version, payload, actor})` | actor 为 renderer DTO，由 Main 直接传领域服务 | 合成 school/teacher actor 写入创建 Receipt |
| `UPDATE_FIELDS_V2` | `updateFieldsV2({caseId, command})` | command 含 `requestId/actor/expectedRevision/payload` | 合成 actor 写入 Receipt，revision+1 |
| `CORRECT_OBSERVATION_V2` | `correctObservationV2({caseId, command})` | command actor 直接传 `correctObservation` | 合成 actor 写入 Receipt，revision+1 |
| `SET_EVIDENCE_LINK_V2` | `setEvidenceLinkV2({caseId, command})` | command actor 直接传 `setEvidenceLink` | 合成 actor 写入 Receipt，revision+1 |
| `RESOLVE_APPEAL_V2` | `resolveAppealV2({caseId, command})` | Main 调 `resolveAppealV2`；service 要求授权 teacher | Main local reviewer 被拒，状态不变；可信 teacher 提供方未验明 |
| `BATCH_ACTION_V2` | `batchActionV2` 暴露，但 preload helper 的静态 action union 较 Main 窄 | Main handler 接受 `finalize-completed` 并执行 finalizer | Main-handler Harness 完成错配/缺失 Run 的定稿；live UI 调用未验 |
| `RESOLVE_D4_MATERIAL_TRANSITION` | D4 新增 `resolveD4MaterialTransition({caseId,newDocumentId,expectedRevision,decision})` | owner BrowserWindow 与 mainFrame 验证；服务验原件 size/hash 和 revision | 本轮读取源码静态验证；没有将这条 D4 handler 与 P06 当作相同 channel |

D4 与 P06 被对照的 V2 写入 handlers 都接收 Actor DTO；本轮只对 P06 做了受控写入反例，不能据此认为 D4 对应命令安全。D4 单独的材料转换 channel 校验 Main owner/mainFrame。`Actor` 类型字段只是调用方数据，不是身份凭据。Main sender/frame 检查、可信人员来源、角色授权与业务命令白名单需在统一合同中分别表达。

## Run / Batch 身份

R02 helper 的精确 Run 输入 hash 校验确实有一部分在 R03 自动路径中继续存在，不能以 helper 删除判定全丢。P06 归档复现中，运行时 Plan fingerprint 保持旧值，但 workspace 投影 Subjects/Rules 在替换材料导入时已改写；这两层状态需在 Canonical Plan 合同中明确谁是权威。R03 实测的剩余缺口位于 finalization 接缝：Batch entry 绑定与正式 decision `basedOnRunId` 没有在公开 Main finalize 路径及 `finalizeBatch()` 再次比较。建议第三轮统一 `BatchAttemptId + caseId + templateVersion + runId + inputHash + decision.basedOnRunId + basedOnRevision` 并把验证放在最终写入事务中；是否以独立 Runner/Batch 实现由第三轮裁决。
