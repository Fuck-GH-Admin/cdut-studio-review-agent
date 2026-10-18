# CDUT Studio D4 P2-C｜既有 Pi 提交拒绝说明与原 Run 续交优化（2026-10-18）

> **离线工程候选**。必须结合 [P2-B/C 批量验收制度](P2-B-C-BATCHED-ENGINEERING-AND-ACCEPTANCE-20261018.md) 执行。父技术 SHA：P2-B #119 `f54771806da2dc4e9942dbc038a0ebbc101b3b68`。P06 权限和真正模型调用保持独立。

## 修复内容与不变量

历史 G08 提交 34 条拒绝中存在虚构 Observation 字段、逐对象证据缺口、未确认规则返回确定状态、未验证的适用性。单纯缩短提示词不等于减少模型错误；保留 Main 对每条结果的真实拒绝，同时令回复更易修正。

- 新纯函数 `pi-review-submit-repair.ts`：从**现有实际 rejected.reason** 得到 11 类稳定代码及静态行动建议；默认最多 12 条/硬上限 24 条，隐藏其余数量但**原始 rejected[] 完整保留**；建议不复述用户/文档的危险原文或伪造身份。
- `submitPiReviewResultV2` 追加可选 `repairGuide` 字段，含 `rejectedCount/pendingChecks/hints/hiddenHints/nextStep`。**旧字段** `accepted`、`rejected`、`missingChecks`、`status` 不变，保存/关闭运行的条件不变；有拒绝或缺项的 `finish=true` 仍保持 running。真正 Main 验证和 ScopeRef 结果比建议优先。
- 已有 `continuationPrompt` 中只展开前 12 条、每条最多 240 字符的上次拒绝原因，再给结构化静态纠正建议；其余仍可在审计历史查到，不因压缩视为接受。避免 34 条冗长拒绝正文在模型续交阶段再次重复消费上下文。
- 未改 `validateD2GuardSubmission`、`validateD2OperationEvidence`、RuleSpec confirmation、SourceRef、EvidenceLink、作者态、Pi 工具权限/数量、IPC、后台 owner、P06、Gold 或学校真实制度。

## 最小负例矩阵

| 负例 | 主服务端拒绝仍有效 | 优化诊断（不放行） |
|---|---|---|
| 未声明 `fieldKey` | 不能写入 Observation | `OBS_FIELD_NOT_DECLARED` |
| FieldSpec 类型/Subject 不符 | 仍拒绝 | `OBS_TYPE_OR_TARGET_MISMATCH` |
| 未确认规则报 compliant | 仍拒绝、不关闭运行 | `RULE_UNCONFIRMED` |
| 无逐对象真实证明 | 仍拒绝 | `EVIDENCE_SCOPE_MISSING` |
| unknown 错报 not-applicable | D2 适用性不变 | `APPLICABILITY_UNVERIFIED` |
| 无效 blockId/图像尚未实际读取 | 仍拒绝 | `SOURCE_REF_UNVERIFIED` / `IMAGE_NOT_READ` |
| 无效 Subject 或空理由 | 仍拒绝 | `CHECK_TARGET_INVALID` / `CHECK_REASON_EMPTY` |
| `finish=true` 仍缺检查 | `status=running` | `pendingChecks` 精确保留 |
| 按真实 source 修复重交 | 同一 runId 可完成 | 回执无拒绝、状态 completed |

测试：`pi-review-submit-repair.test.ts`（分类、截断、未可信文本过滤）+ `pi-case-review-service.test.ts`（真实 Main 非法 Observation/空理由→有效 SourceRef 五 Check 同 Run 续交）+ `pi-review-submit-repair-d4.test.ts`（真实 G08 D2 未确认规则决定性结论拒绝）。不能用纯字符串分类测试代替真 Main 拒止断言。

## 统一验收出口

P2-C 完成 CI 后**暂停增加新功能**，先将 P2-A/#117、P2-B/#119 和本 PR 按 SHA 链整理为一个技术候选；在独立工作树执行一次集中批量验收：

1. P1-C C10 修复后真正 Electron/Xvfb GUI 快速双击、Enter+click、原件 SHA 和 IPC readback（PR #111 首轮 FAIL 仍保留）。
2. 受控 Provider 同输入样本比较旧版与 P2 新版实际 token/拒绝数/Check 完成和证据作用域；没有凭据则标 `MODEL_BLOCKED_ENV`，不可谎称提升。
3. 若总体 CI PASS、GUI PASS，但在线 Provider 未跑，只能签工程候选，不是“模型效果证明”。

仓库路径和固定 HEAD 均由对应 PR 记录，不靠聊天转述作为证据。
