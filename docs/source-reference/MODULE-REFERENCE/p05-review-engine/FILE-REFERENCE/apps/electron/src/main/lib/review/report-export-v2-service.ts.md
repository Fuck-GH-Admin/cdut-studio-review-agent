---
path: apps/electron/src/main/lib/review/report-export-v2-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1deb81d7a8b8d388e097a9b11b9786696f866717
sha256: 6997e22505d27c4fb70347468ffa9006bb235e135cd13941525a8c44ef092dde
lines: 161
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/report-export-v2-service.ts

## 1. 结论与边界

V2 报告导出服务（08 设计 §4，头注 :1-6）：从 `EXPORT_REPORT_V2` handler 抽出，IPC 与 Agent 工具薄委托；公开反馈投影（字段可见性按模板默认 public）+ 真实检查结果摘要 → MD 落盘到案卷受控目录 `reports/`（**不覆盖任意宿主路径**）。

边界：运行/受众/代次语义在 `review-v3-report-snapshot`；聚合与反馈在 `application-service`/`report-service-v2`；本文件做装配与落盘。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ExportReportResultV2` | interface | 11-20 | file/decision/run/audience/snapshotDigest/archiveCycle |
| `ExportReportOptionsV2` | interface | 22-28 | runId/audience/actor |
| `exportCaseReport` | fn | 30-161 | 唯一函数导出 |

无内部函数（动态 require 装配）。

## 3. 内部逻辑与关键流程

1. **装配**（:31-38）：id 守卫后动态 require 7 个模块（`getCaseV2Aggregate`/`buildCaseFeedback`/`listRunsV2`/`reconcilePiReviewRunsWithReadReceipts`/`getTemplate`/`resolveEffectiveRules`/`review-v3-report-snapshot`，注释 :2 解耦）。
2. **选取**（:39-53）：聚合缺失 → throw `案卷聚合不存在: …`（:40）；反馈 `buildCaseFeedback(…, {})`（可见性默认 public，:41）；运行列表经 Pi 对账（注释 :42-44「**不过滤未完成，不隐藏当前运行**」）；`resolveReportRun`（requestedRunId 或决定绑定或最新）；无运行 → throw `报告没有可用的审核运行：{reason}`（:47）；受众 `resolveReportAudience`（未授权降级学生版，:49-50）；代次 `resolveReportCaseCycle`（:51）。
3. **正文**（:54-143）：头部含受众授权状态/运行选择依据/归档代次（:54）；决定段含**归属**（`基于运行 X` 或 `该决定不基于所选运行，仅作案卷历史展示`，:55）；依据段含 `技术运行状态：…（尚未完成不等于审核通过）`、输入哈希、覆盖四数、**RUN-42**：completed 但有待处理检查/未读材料时显式「业务可办理性：…completed 不代表完整业务通过」（:58-65）；模型意见数、有效规则集哈希（旧运行 `旧运行未记录`）、运行错误、本地 D4/D2 计划（`非校方发布`，:66-72）；实际材料覆盖逐条（:73-77）；有效规则列表（政策/模板/案卷规则来源，:78-82）；检查结果逐条（状态/原因/执行来源/原件引用/计算明细，:83-94）；internal 受众才给「模型建议（必须人工复核，非最终认定）」（:95-105）；pendingChecks 警示行（:106-107）；internal 才列人工豁免（`不代表规则符合`，:108-113）；补件/事项字段（:114-120）；事项最终认定（accepted/modified/rejected 三态 + 最终分值 + 裁定作用域说明，:121-138）；最终分数（:139-145）。
4. **落盘**（:144-160）：`review-cases/{caseId}/reports/` mkdir；`reportSnapshotDigest`（基于正文 JSON）→ 文末 `<!-- report-snapshot: {digest} -->`；`report-{ms36}.md` 写盘；返回 file/decision/run(含 `historical`)/audience(请求/授予/授权/原因)/snapshotDigest/archiveCycle。

## 4. 调用者与调用链

入向（生产）：`review-ipc.ts:664-665`（IPC `EXPORT_REPORT_V2` 薄委托）；`adapters/pi-review-ops-tools.ts:534-535`（Agent 工具 `exportCaseReport`）。测试：无专属测试文件（全树 glob）。出向：动态 require 7 模块（:32-38）+ `./review-storage-id`（:8）+ `node:fs/path`/`../config-paths`（:144-147）。

## 5. 数据 I/O、读写与副作用

- 写 `{configDir}/review-cases/{caseId}/reports/report-{ms36}.md`（直接 writeFileSync，无 tmp+rename——与 V1 原子写不同，边界如实记录）。
- 副作用：mkdir（:147）；无日志/网络。

## 6. 分支、失败、取消与恢复

- 两 throw（聚合缺失 :40、无可用运行 :47）；受众未授权不 throw 而**降级学生版**（:49-50，结果字段 `authorized:false`）。
- 无取消；同毫秒多次导出文件名 ms36 有碰撞余量（`Date.now().toString(36)`，未加随机后缀——与 V1 stamp 不同，记录）。

## 7. 权限与权威状态

- 受众权威：Main 依据可信 actor 决定授予（注释 :25）；未授权降级并如实标注（:54）。
- RUN 系语义：RUN-42（completed≠业务通过，:58-65）；RUN-02/21/31/32（运行选择/历史标注 `historical`，:14/:156）。
- 诚实性：豁免/模型建议仅 internal 且标注「不代表规则符合/非最终认定」；未完成运行不过滤（:42-44）。
- 路径权威：受控目录 `reports/`，id 守卫防穿越（:31）。

## 8. 修改影响面

- `EXPORT_REPORT_V2` IPC/Agent 工具契约（`ExportReportResultV2`）；preload `review-semantic-demo` 类调用面。
- snapshot 摘要算法变更影响 `snapshotDigest` 历史重导比对。
- 无专属测试；回归面在 `review-ipc`/Pi 工具链（他批）。

## 9. 测试证据

无直接测试文件（全树 glob）。间接线索：`review-v3-report-snapshot.test.ts`（他批）覆盖 resolve* 语义。缺口：`exportCaseReport` 端到端、降级路径、RUN-42 行文、digest 稳定性。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/行号如 §2 | 已证实 | 逐条 |
| 受众降级/RUN-42/豁免限制 | 已证实 | :49-50/:58-65/:108-113 |
| 双消费点 review-ipc:664/pi-review-ops-tools:534 | 已证实 | grep |
| writeFileSync 无原子写/文件名无随机 | 已证实 | :151-152 |
| 运行行为 | 未知 | 无测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 装配/选取/两 throw | §3.1-3.2 | 31-53 | covered（未测） |
| 正文 RUN 系行文 | §3.3 | 54-143 | covered（未测） |
| 落盘/返回 | §3.4 | 144-160 | covered（未测） |
| 降级/豁免/digest | §9 | 49-50/108-113/149 | unknown（未测） |
