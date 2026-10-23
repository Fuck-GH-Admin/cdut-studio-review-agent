# 04｜V1/V2/D4 历史数据迁移、兼容和回滚风险

**性质**：Round 2A 独立只读审查，不是迁移实施方案或数据库选型。**整体状态 PARTIAL**。固定 SHA main `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`、#134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`。

## 一、真实存在的持久数据及可变权威

| 对象 | 来源/读写函数 | 可变角色 | 不能无损假设 |
|---|---|---|---|
| V1 `case.json` 与目录内 `documents` / archive metadata | main [`apps/electron/src/main/lib/review/case-store.ts:50`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store.ts#L50), [`apps/electron/src/main/lib/review/case-import.ts:276`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/case-import.ts#L276) | V1 三栏、D4 材料和 reviewer form | 不是 V2 aggregate 镜像；revision 独立 |
| V1 `runs/` 历史 | [`apps/electron/src/main/lib/review/case-store.ts:324`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store.ts#L324) | V1 run service | 不能作为 V2 有效 Run / formal signed decision |
| 旧兼容 `case.v2.json` | [`apps/electron/src/main/lib/review/migration.ts:104`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/migration.ts#L104) | `migrateCaseToV2` 的 legacy 写 | 此路径明确不迁移 V1 runs，且不能当 V2 aggregate 唯一真值 |
| V2 Aggregate（含 `caseV2/observations/evidenceLinks/dispositions/tasks/decisions/supplements/appeals/ratings/receiptLog`） | [`apps/electron/src/main/lib/review/case-store-v2.ts:22`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store-v2.ts#L22), [`apps/electron/src/main/lib/review/case-store-v2.ts:79`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store-v2.ts#L79) | `submitCommand` + `createAggregate` | 单 JSON 聚合内一致，不代表与 V1、Run、outbox 同事务 |
| V2 Run manifest / artifacts | [`apps/electron/src/main/lib/review/workspace-business-service-v2.ts:358`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-business-service-v2.ts#L358), [`apps/electron/src/main/lib/review/review-ipc.ts:474`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L474) | Run store / Pi executor | 输入 hash、模板锁、检查覆盖必须核验，只有 ID 不等于有效 |
| 交接 outbox | [`apps/electron/src/main/lib/review/offline-roundtrip.ts:135`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/offline-roundtrip.ts#L135), [`apps/electron/src/main/lib/review/offline-roundtrip.ts:229`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/offline-roundtrip.ts#L229) | 独立副本导入 | pending → aggregate cmd → accepted 跨文件非原子 |
| report Markdown 快照 | [`apps/electron/src/main/lib/review/report-export-v2-service.ts:15`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/report-export-v2-service.ts#L15) | 导出服务 | 源码生成 `.md`；无实测 PDF/XLSX，最新报告文本可能跟其他 live 状态不同 |
| SchoolPort / external Receipt | [`apps/electron/src/main/lib/review/external-ports.ts:29`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/external-ports.ts#L29), [`apps/electron/src/main/lib/review/external-ports.ts:76`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/external-ports.ts#L76) | 内存 `MockSchoolAdapter` 或 `LocalPackageAdapter` | 并未连接真实校方可信 API，不得把模拟 accepted 叫学校确认 |

**VERIFIED（源码事实）**：V1 输入模型与 V2 业务命令模型均有可写表示，但分工不完全相同。例：旧材料来自 V1，人工观察与业务决定存在 V2 聚合；新 D4 Plan 特殊冻结；原生 V2 案卷不一定有 V1 输入行。**PARTIAL（系统权威）**：新版本若需要唯一业务事实写权，必须先给每字段/事件明确定义 owner 与迁移事件，不是立即删除任何一方。

## 二、已证实的兼容策略及其盲区

1. **传统 V1 进 V2**：`ensureWorkspaceAggregateV2` 从 V1 读快照、初始化 aggregate 和系统 Receipt；`syncWorkspaceProjectionV2` 用投影 digest + expectedRevision 写 `SyncReviewWorkspaceProjection`；人工观察、业务决定仍在 V2，不因普通投影直接清空。出处：[`apps/electron/src/main/lib/review/workspace-service-v2.ts:123`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L123), [`apps/electron/src/main/lib/review/workspace-service-v2.ts:163`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L163)。已有 `workspace-service-v2.test.ts` 对保留人工事实/V2-only 材料版本及归档证据做测试定义；**此轮没有执行**。
2. **D4 技术案卷与 V1 façade**：D4 先 `createD2TechnicalCase` 建冻结 V2 计划，后 `saveCase` V1，最后同步/逐文件导入。D4 的 `projectedCase(..., fixedD2)` 阻止 V1 把冻结 V2 subjects/rules 改回普通 V1 事项；P06 同名源码**缺该 D4 特有栅栏**。出处：[`apps/electron/src/main/lib/review/review-d4-client.ts:82`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts#L82), [`apps/electron/src/main/lib/review/workspace-service-v2.ts:22`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/workspace-service-v2.ts#L22)，对照 [`apps/electron/src/main/lib/review/workspace-service-v2.ts:22`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L22)。**2D 合并时必须把这个差异当硬冲突**。
3. **历史 Run 不混版**：`migration.migrateCaseToV2` 自身注释明确 V1 runs 不迁移；阶段决定 final 路径必须 `getRunV2` + input hash + status + template + staleness；非 final 旧决定仍有 `run@rev...` 替代字符串。出处：[`apps/electron/src/main/lib/review/migration.ts:104`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/migration.ts#L104), [`apps/electron/src/main/lib/review/stage-workflow.ts:120`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow.ts#L120), [`apps/electron/src/main/lib/review/stage-workflow.ts:171`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow.ts#L171)。正式报告/时间线需保留旧文字但不得当可签字的真实 Run。
4. **归档材料**：从 V1 `archivedDocuments` 投影成 V2 inactive/unread 并将相应 EvidenceLink 标为 rejected；V2-only 文档独立保留。出处：[`apps/electron/src/main/lib/review/workspace-service-v2.ts:74`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L74), [`apps/electron/src/main/lib/review/workspace-service-v2.ts:176`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L176)。若被确认观察仍携 archived SourceRef，应进一步阻止其被现行 readiness 使用；不能仅凭归档时否决 EvidenceLink 宣称全链完成。
5. **校验和、幂等与数据丢失风险**：`submitCommand` 对同一个 aggregate 文件的业务状态+Receipt 同步 rename；独立 outbox 的 pending/accepted 不能一起提交；V1 写后 V2 sync 失败也没有统一 journal/rollback。出处：[`apps/electron/src/main/lib/review/case-store-v2.ts:115`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/case-store-v2.ts#L115), [`apps/electron/src/main/lib/review/offline-roundtrip.ts:229`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/offline-roundtrip.ts#L229)。应把 `failed after V1 persist`、`failed after V2 persist`、`failed after outbox pending` 分别设计恢复状态。

## 三、两个需明确隔离的安全疑点

### A. 用户写命令身份来源（PARTIAL）

P06 Main IPC 对 `RECORD_STAGE_DECISION_V2` 等调用 `bindLocalReviewerCommand`：客户端声称的 teacher/school/system/agent 不能直接变成可信身份；但是 `CREATE_CASE_V2`、`UPDATE_FIELDS_V2`、`CORRECT_OBSERVATION_V2`、`SET_EVIDENCE_LINK_V2` 在同一 `review-ipc.ts` 是薄委托并直接传入 `command.actor`。出处：[`apps/electron/src/main/lib/review/review-ipc.ts:515`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L515), [`apps/electron/src/main/lib/review/review-ipc.ts:586`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L586), [`apps/electron/src/main/lib/review/review-ipc.ts:618`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L618), [`apps/electron/src/main/lib/review/review-ipc-actor-guard.ts:16`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc-actor-guard.ts#L16)。需要逐个检查 application service 是否限定合法角色/SourceRef 并跑伪造 Actor 负例；**已证实的是不一致的身份重绑定位置，不是已实测的提权成功**。

### B. 独立副本校验与作用域（PARTIAL）

`report-service-v2.importHandoffPackage` 可回 `HASH_MISMATCH` 或（有 `expectedExternalRevision` 时）`CONFLICT`；`offline-roundtrip.applyRoundTripPackage` 仅显式拒绝 `HASH_MISMATCH`，其他失败条件落到 `pkg.payload` 继续处理。**在当前调用中不传 expectedExternalRevision，CONFLICT 分支按已读源码不可到达；这是未来扩展与接口误用的 fail-closed 风险，不应宣称现有冲突包已可绕过**。出处：[`apps/electron/src/main/lib/review/report-service-v2.ts:111`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/report-service-v2.ts#L111), [`apps/electron/src/main/lib/review/offline-roundtrip.ts:166`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/offline-roundtrip.ts#L166)。

更实质的作用域问题是离线导入 actor 和 viewer 的真实性（项目当前是本地模拟/独立副本而非实名学校登录）。`projectForRole` 对未知字段默认 internal；`judge` 自身 rating 投影；`student/judge` decision reason 掩码：[`apps/electron/src/main/lib/review/offline-roundtrip.ts:46`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/offline-roundtrip.ts#L46)。这些都是值得继承的**服务器侧过滤思想**，但不是已证明的真实组织授权。

## 四、第三轮迁移与回滚设计必须满足的先决条件

| 场景 | 必须保留 | 必须试验的反例 | 状态 |
|---|---|---|---|
| V1-only 旧案，初次 V2 打开 | caseId、原件 hash/SourceRef、V1 历史 runs/可读报告 | 连续重进、坏 JSON、case.v2.json 残留、模板缺失 | BLOCKED（本轮未跑） |
| V2-native 无 V1 case.json | 原生多 Subject 与事务 Receipt | 打开 V1 三栏、批次列表 fallback、不允许凭空建空 V1 | BLOCKED |
| D4 frozen Plan 旧材料追加 | 计划/subjects/rules 不漂移，V1 文档可补入 | P06 投影函数覆盖 D2 状态；重放同 token | BLOCKED |
| 已确认事实重提取 | 人工更正历史、effective value、观察链 | 新 AI 观察追加后 `latestObservations` 只按时间选新候选 | BLOCKED |
| 归档并撤销材料 | 旧观察+链接保留历史，当前无效 | 归档文件仍支持已确认事实/最终 pass | BLOCKED |
| 阶段/补件/申诉/评分 | 旧决定不可静默改写、轮次/授权 | 重试导致新决定/重复评分，教师角色来源伪造 | BLOCKED |
| 回滚到历史版本 | V1/V2 目录保留不可删，Receipt 不可丢，schema 可检测 | 新字段旧版读写发生静默截断 | BLOCKED |

**建议而非实施授权**：选型后可考虑版本化导入清单与逐案事务日志，按受测的冻结快照回滚；本轮**不提出特定数据库产品/表结构的定案**。必须先用真实旧案副本及脱敏合成数据复演，不能动校务材料、Gold 或生产库。

## 五、对 2D 的兼容性闸门

- 能明确回答每一字段只由谁写、每一事件何时转态，兼容映射可逆/可追溯才允许改写。
- 保留 V1 案卷/材料/Run 阅读兼容至少到双向迁移、用户历史导出全部通过验收。
- 不允许临时 `run@rev`、mock external accepted、静态 UI 显示代替可信 Run、真实身份或学校回执。
- D4 和 P06 共同基线不可凭 PR 号建立；必须固定可组合的 SHA、变更集、冲突解决清单和针对性测试。
