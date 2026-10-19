# 03｜高风险正反例复现

所有可执行反例均使用 `synthetic-only` 案卷；状态描述的是固定代码 SHA 与指定入口。不得把它们外推为已部署版本的漏洞利用结论。

## 结果总表

| Gate | 风险/快照 | 状态 | 核心观察 |
|---|---|---|---|
| L1-01 | ARCH-002/003，D4 vs P06 | D4 `PASS_SCOPED`；P06 `REPRODUCED_FAIL` | P06 归档后旧 Observation 仍 confirmed；test-only state setup 后真实 `decideWorkspaceCaseV2` 返回分数 4，来源仍是归档 V1；D4 会撤销确认效力且拒绝旧 EvidenceLink |
| L1-02 | ARCH-004/014，P06 | actor 写入 `REPRODUCED_FAIL`；appeal `REPRODUCED_DENY / BLOCKED_AUTH_DESIGN` | 四条 Main handler 写入伪造 school/teacher actor 的 Receipt；本地 reviewer 不能 resolve appeal，且状态不变 |
| L1-03 | ARCH-007/008/009，P06 R03/R02 | P06 R03 finalize `REPRODUCED_FAIL`；正常自动路径 `PASS_SCOPED`；R02 保护用例通过 | 公开 Main handler 与低层 finalizer 接受缺失或错配的 entry Run；自动执行仍使用 entry 精确 Run |
| L1-04 | ARCH-010/012，P06 | `PASS_SCOPED`（限定） | 自造 DOCX/XLSX OOXML 实际进入解析器，生成标题/段落/表格块；来源身份和 SourceRef 边界回归通过；不是 same-stem 缓存/原件授权全量通过 |
| L1-05 | ARCH-002/005，D4 vs P06 | D4 `PASS_SCOPED_FULL_TARGET_CONTRACT`；P06 `PROMPT_CONTRACT_PARTIAL` / `BLOCKED_SCHEMA` | D4 保留多 target 的 conditions、unknown 和所有 Check ID；P06 旧 archive prompt 保留 3 个映射，但不接受 D4 `generic-object` schema |
| L1-06 | ARCH-001/006，M/D/P/R02 | `PASS_SCOPED` | 选定 CAS、coverage、Run 与 batch 回归：21 + 30 + 114 + 74 测试全部通过 |
| L1-07 | ARCH-013，P06 | `NOT_RUN` | 撤权后异步写入、删除 session metadata、owner overlap 未测 |
| L2 | live GUI /真实 Renderer 到 Main | `BLOCKED_ENV / NOT_RUN` | 环境无 Electron 命令，未做 live GUI；本轮 Main handler Harness 已足以确认被测 Main path 收到输入并持久化，但不覆盖 UI 可见性与实际调用条件 |

## L1-01｜归档事实与冻结 Plan

以真实的 `importDocumentFromPath` 与 `removeDocumentsFromCase` 入口执行合成 V1→V2 替换和归档。案卷先有 2 Subject / 2 Check 冻结计划、人工确认的数值 Observation（值 4、SourceRef 指向 V1）、confirmed EvidenceLink 与 Receipt；然后导入 V2，再将 V1 从当前审核材料移除。持久化聚合 revision 从 5 到 6，前后 aggregate SHA256 被保存。

- **D4 `c2f965d…`**：Observation 从 `confirmed=true` 变 `false`；原始 value、SourceRef、Receipt 保留；V1 EvidenceLink 变 `rejected`；Subject/Rule 与 fingerprint 保持一致。V2 `usage=read`，但没有人工阅读回执；Coverage 仍明确阻断（4 项 pending，旧文档移除）。之后调用真实正式决定服务，返回 `ok:true`、`finalScores:[]`，没有把旧值作为分数消费。
- **P06 R03 `db028487…`**：运行时 Plan fingerprint 保持旧值，但 workspace 投影的 Subject 与 Check Rules 被改写（发生在归档动作前）；归档后 Observation 仍 `confirmed=true`，原 V1 SourceRef 保留；旧 EvidenceLink 虽被改为 `rejected`，仍未撤销 Observation 确认；Coverage 报告旧材料移除且 42 项检查 pending。随后通过 harness-only aggregate mutation 删除 Plan 并构造最小合成模板与 Rule，手工保存一条 input hash 包含旧 Observation 的 completed Run 和 adjudication，清理与该单一决策无关的 fixture 候选链接，再调用真实 `decideWorkspaceCaseV2`。服务返回 `ok:true`，final score 为 `4`，`basisRunId` 是当前 Run，但 score 的 Observation 来源仍是已归档 V1。

P06 结果证明固定服务路径会消费仍确认的历史 Observation，尽管其 EvidenceLink 已拒绝。它不是普通 UI 已可无条件定稿的证明：决策探针显式设置了合成 Run/adjudication 前置；它也不证明任何部署版本、真实案件或学校流程的实际可达性。详见 `03-high-risk-reproduction-evidence/L1-01-*.json`。

## L1-02｜Main Actor 与 appeal

在 P06 `registerReviewIpc()` 注册的 Main handler Harness 中，通过 Preload 已暴露的 `CREATE_CASE_V2`、`UPDATE_FIELDS_V2`、`CORRECT_OBSERVATION_V2`、`SET_EVIDENCE_LINK_V2` 输入合成 `actorId=synthetic-spoof-school, actorSource=school, role=teacher`。四个写操作均成功；Case revision 0–3 的四个 Receipt 均保留这个伪造 Actor。Main handlers 未从 IPC sender/frame 重绑定身份。测试没有启动 live Renderer/Electron，也没有拿真实学校凭据。

同一 Harness 以 Main 绑定出的 local reviewer 调 `RESOLVE_APPEAL_V2`：Service 返回 `INVALID_TRANSITION`（需要授权 teacher）；revision=1、Receipt 数=1、appeal status=`in-review` 前后不变。结果是拒止正确，但可信 school/teacher 来源与业务入口仍缺少证明，故标记 `BLOCKED_AUTH_DESIGN`。

## L1-03｜批次 Run 与定稿

R03 正常自动执行路径的选定回归通过：entry 有绑定时用对应 Run；历史 `done` 且没有 Run 绑定时不借用同案 `latestRun`。R02 的 provenance helper 和“entry Run 与正式决定 Run 不一致不得定稿”用例通过。

对 R03 另通过注册的 Main `BATCH_ACTION_V2 action=finalize-completed` 执行两条合成记录：

1. Entry `runId=run-entry-bound`，正式决定 `basedOnRunId=run-final-reference`：Main handler 返回 finalized；
2. Entry 无 `runId`，决定引用 `run-final-no-entry-binding`：Main handler 同样返回 finalized。

最终持久化 Batch snapshot 中两条均为 `done`，Run binding 均不匹配。直接调用真实低层 `finalizeBatch()` 也能 finalized `run-bottom-entry` vs `run-bottom-decision` 不匹配的记录。新增测试的保护性期望故意失败（Bun 1 fail），实际证据 JSON 记录了最终 Batch 状态与 snapshot SHA。

Main handler 已由 Preload 暴露，但 Preload 的静态 TypeScript helper 将 action 类型限制为 `finalize | reopen`，本轮未启动 Renderer 验证 `finalize-completed` 的正常 UI 按钮/调用者。因此这证明 Main handler 路径和低层函数可到达，不单独证明标准 UI 操作者可触发任意 Run 错配。第三轮应在 live Electron harness 查清调用入口并保留精确绑定断言；不能以正常自动路径安全替代 finalizer 自身检查。

## L1-04｜SourceRef 与实际 Office 解析

使用 JSZip 现场生成最小合成 DOCX/XLSX OOXML 包，调用 P06 实际 `parseFileIntoSourceDocument`。DOCX 返回 `parsed`，包含标题、正文和两个表格单元格；XLSX 返回 `parsed`，包含 B4 单元格及 sheet/row/column 位置。不是 mock parser 结果。

`document-parse-tools.office71.test.ts`（10 tests / 94 assertions）覆盖同名物理文件身份与 cache/index 行为，但其解析器结果是 mock；`review-office-v2-sourceref-boundary.l02.test.ts`（3 tests / 24 assertions）覆盖旧 version、伪 block/quote 拒止。两项都包含在 P06 选定基线套件内。故本轮可以确认真实合成 DOCX/XLSX 解析和 SourceRef 约束的选定范围；未做真实同 stem 不同内容的端到端缓存分流、live owner 撤权、真实文件权限或完整 Office GUI 验收。

## L1-05｜Plan/Prompt 合同

D4 合成两个 target，各有不同 `objectKey`、scenario、条件来源/版本、不同 applicability（含 `unknown`），编译为 6 个 Check×target 映射。实际 prompt 包含完整 target contract 和全部 Check ID；6 项仍为 pending，没有假装完成。

P06 的 archive fixture 将 3 个旧目标编成 3 个 mapping，prompt 含对应 object/Check identity，但 `promptContainsFullTargetContract=false`。尝试把 D4 同类 `generic-object` + `unknown` condition 交给 P06 runtime 时得到 `D2_TARGET_INVALID: 未知目标种类`。这说明两套类型并非同输入 A/B：应先在第三轮决定 Canonical Plan DTO 和受控映射/版本，再比较语义输出；不以 prompt 文本长短推断准确率。

## L1-06｜选定回归

M 两个文件 21/0；D4 三个文件 30/0；P06 R03 十二个文件 114/0；R02 六个文件 74/0。总计 239 tests、0 failed。文件和精确命令列在 `05-test-results.csv`。这些是所选专项，不是全仓 CI 或 GUI 验收。

## 首次失败与修正记录

首败和失败日志未删除，保存在私有证据目录。L1-01 初始 fixture 误把解析型新材料期望为未读；实际系统将 parsed 文件置为 `read`，但没有人工 `manualReadReceipt`，故修正测试断言而没有改产品行为。第二次 harness 有未定义的 `active` 投影字段，按真实对象结构修正。L1-03 两次 fixture setup/读取断言错误均留存，最后一次建立成功后有意保留保护性期望红灯。Office 初次生成的 DOCX 缺 Word Title 样式，按 OOXML fixture 要求修正后实测解析通过。日志名与 SHA256 列在 `private-evidence-sha256.txt`。

### L1-01 正式决定探针的边界

P06 的消费探针在归档快照之后执行 test-only aggregate mutation：切换到最小合成模板/Rule、删除冻结 D2 runtime plan、保留旧 Observation/SourceRef，并手工保存一条 completed synthetic Run（其 input hash 包含该 Observation）和 accepted adjudication，然后调用真实 decideWorkspaceCaseV2。因而它确证决定函数会把仍 confirmed 的归档事实作为当前分数来源，但不证明普通 Renderer/UI 能按正常流程完成这组 test-only 状态装配。归档后原投影的 Coverage 仍报告 42 项 pending；探针随后使用新合成 Run 的 1 个完整检查构成正式决定输入。这个条件必须随 REPRODUCED_FAIL 一起保留。
