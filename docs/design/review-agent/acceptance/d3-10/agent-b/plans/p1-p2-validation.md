# P1 / P2 复验报告：实际 Pi Run 与高级规则编译拒止

**运行基线**：D3 固定代码 `d16f047af653f7ba259456807c1fc150e9d0f417`。  
**独立工作区**：Agent B 的 `workspaces/archive-r3.json`（D1 revision=3）；未修改 D3/D2/Pi 公共实现。  
**执行环境**：GitHub Actions Ubuntu、Bun 1.4.0、独立临时 `PROFER_CONFIG_DIR`。  
**结果**：P1 PASS；P2 PASS。合成工具回执 `syntheticToolReceipt=true`，线上模型审读 `onlineModelRun=not-run`。

## P1｜Agent B 原版作者态自己的 Pi 案卷

输入：`workspaces/archive-r3.json`（D3 导出的冻结包先在全新配置目录导入后，与原工作区逐字段校验），真实 `createD2TechnicalCase` 固定6条 D2 Rule/Check 映射，真实 `registerMaterial` 注册只有查阅内容的合成文档，真实 `setEvidenceLink` **仅给 `d2-item1-read` 绑定 `d2:archive:read`**。

| 实证项 | 结果 |
|---|---|
| 新建案卷 ID | `d310-agent-b-archive-r3-run` |
| 实际运行 ID | `run-pi-mv2zcewk-7y1vm` |
| read Subject | `d2-item1-read` |
| copy Subject | `d2-item1-copy` |
| 被故意错误提交的 Check | `module/item-1-copy/authorization` |
| Pi submit 返回 | `accepted=0`, `rejected=1` |
| 真正拒绝理由 | `规则尚未确认，不能提交符合/不符合结论` |
| 提交改正后的全部 Check | `accepted=6`, `rejected=[]`, `missingChecks=[]` |
| 存储运行验证 | `status=completed`; `verifyD2PiRun={complete:true,problems:[]}` |
| 最终两个 copy Check | 均为 `awaiting-confirmation`，没有符合结论 |

**重要辨析**：以上原版 A-r3 的 Pi 提交首先被「制度未核」门禁拒绝。不能把这个拒止理由误写成 Pi 已执行到操作证据门禁。已独立调用 `validateD2OperationEvidence` 证明只给 read 绑定的材料不满足 copy 授权。

## P1 附加受控探针｜Pi 实际到达逐操作证据门禁

为避免误归因，使用 `tests/p1-synthetic-copy-authority-probe-workspace.json` 建立**另一个非正式、仅测试的克隆工作区**。它保持 archive-r3 的操作和 Check 责任，只把两项 copy 的来源在该克隆中改成 `synthetic-source/request-scope`，排除「校规未核」的提前拒止；**没有改变原版作者态、没有假称成都理工规定已确认，也没有提交为正式学校规则**。

| 实证项 | 结果 |
|---|---|
| 控制案卷 ID | `d310-agent-b-copy-evidence-probe` |
| 真实控制 Run ID | `run-pi-mv2zcex0-oav4q` |
| 错误 copy compliant 提交 | `accepted=0`, `rejected=1` |
| Pi 实际拒绝理由 | `档案逐操作/开放状态缺少审核员确认的独立证据绑定：item-1/copy（d2:archive:copy）；不得挪用其他操作的授权` |
| 控制 Run 之后 | 按全部待确认状态完成；`verifyD2PiRun.complete=true` |

这使两道门禁均获得可区分的真实 Pi 服务回执，**不是直接调用已有仓库测试去替代 Agent B 新案卷执行**。

实证文件：
- `plans/pi-archive-r3-own-run.json` — 原版案卷、Run ID、材料版本、拒止与完成回执
- `plans/pi-copy-operation-guard-probe.json` — 操作门禁专项回执
- `tests/p1-original-run-snapshot.json`、`tests/p1-original-case-aggregate.json`、`tests/p1-probe-run-snapshot.json` — 已保存的真实运行和案卷状态快照
- `tests/p1-p2-execution-summary.json` — 独立判定与错误数组（本次 `errors=[]`）

## P2｜真实高级证据关系拒止

从原版 A-r3 复制为 `workspaces/archive-r3-advanced-evidence-alternative.json`，增加 D1 已声明支持的 `advanced.claimKeys` 与 `advanced.evidenceRelations`，引用已有 `synthetic-source`、`school-policy-unverified`；完整基础来源仍有效。

**注意**：D1 的 `requiredSourceIds` 只能表达很有限的来源列表，并不能在数据结构中真实表示复杂的「合法替代路径 OR 条件」。本试验只证明高级关系请求受到编译拒止，不假称替代关系已实现。

| 检查 | 实际结果 |
|---|---|
| `validateReviewAuthoringV1` | `issues=[]` |
| `bun ... review-d2-plan.ts preview` | 真实退出码 `1` |
| 编译器 stderr | `D2_UNMAPPED_ADVANCED: 高级 Claim/Evidence 关系尚无无损执行映射，不得忽略` |
| `review-d3-library.ts report-gap` | 实际成功，`status=tooling-blocked` |
| 原文责任 | `R08`、`R09`、`R10`、`R29` |
| 受影响 Check | `module/item-1-read/authorization`；`module/item-1-read/scope-trace`；`module/item-1-copy/authorization`；`module/item-1-copy-local/copy-authorization` |
| 问题票 Run 映射 | `runIds=["run-pi-mv2zcewk-7y1vm"]` — **仅指原版 A-r3 成功基线** |
| 票据 run 实例核验 | `verifiedAgainstRun=false`，**高级编译失败没有真实新 Run** |

完整证据链：

1. `workspaces/archive-r3-advanced-evidence-alternative.json` — Agent B 的最小输入
2. `gaps/advanced-evidence-compile-repro.json` — D1 结构校验、实际 D2 CLI 命令/退出码/原样 stderr/受影响 ID
3. `gaps/gap-p2-advanced-reproduced-request.json` — 原 MD 定位和四个业务责任 ID
4. `gaps/gap-p2-advanced-reproduced-response.json` — D3 工具输出的影响报告

## 裁定范围

- **P1：PASS** — Agent B 原版 A-r3 自建案卷和 Run 确实运行，错误 copy 回执未入库；控制探针额外证明 Pi 操作门禁在测试性已确认来源情况下也拒绝读证据挪用于复制。
- **P2：PASS（编译拒止与问题追溯）** — D1 有效的高级关系输入真实触发 D2 拒止，来源、Check、Run 基线及问题票保持映射；但高级规则执行能力仍是 `TOOLING-BLOCKED`，**并没有变成已支持**。
- **NOT-RUN** — 在线大模型审读；未获得校方正式业务批准，未签发 D3 Release。
