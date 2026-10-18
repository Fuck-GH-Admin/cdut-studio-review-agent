# E02–E04 差分覆盖矩阵
| Lane / 入口 | 原有保障 | 本次差分/新增回归 | 仍未签收 |
| --- | --- | --- | --- |
| E02 `decideWorkspaceCaseV2` | `submitCommand` 单案事务、requestId/revision、readiness | 学生角色驳回、普通 Agent 开全局开关、越过教师任务三条 RED，现加事务角色/任务/模板/Run 校验；保持 readiness-first 错误语义 | 学校角色凭据、真实 Provider/严格 SourceRef |
| E02 `recordStageDecision` | published 模板/阶段角色/任务锁，阶段与 finality 投影 | 普通 Agent 不许凭全局开关冒签；system 限真实已完成且新鲜的 auto-check 移交，不得最终决定；MVP 测试补完整移交 | 历史部分决定仍为 `run@rev...` 合成绑定，正式终审 Run/SourceRef 闭环缺口 |
| E02 `case-store-v2` | requestId + payloadHash、revision、receipt 与聚合原子落盘 | E01/本轮保留重复请求、冲突与 stale revision 正反例 | 真实校方身份系统 |
| E03 `respondSupplementV2` | open/responded/insufficient 阶段与责任角色 | 补件材料版本必须属于当前有效案卷且不得重复 | 多次补件附件物理可信性/真实图文原件 |
| E03 `assertCurrentRun` | inputManifest hash、回复时间、新鲜度 | run 模板锁；补件与 Run 同毫秒事件 fail-closed | 真实 provider/材料新版本变更后的 A/B/C |
| E03 `requeueCaseAfterSupplement` | E01 同 requestId replay 不重排；所有补件关闭方恢复 | 多个同案批次归属时不广播 old done→queued；唯一归属正向回流 | 多批次由授权人显式指定目标批次的入口待补 |
| E04 `batch-automation-gates.ts` | global×per-batch grant×published template×confirmed policy×current coverage×readiness | 复核已有代码与 `batch-automation-service.test.ts`，无新增生产变更 | 真业务授权及外部动作 |
| E04 `batch-group-action-service.ts` | previewHash、操作 ID WAL、confirmed、逐案事务 | 复核 `batch-group-action-service.test.ts`，无新增生产变更 | GUI 真预览/点选与异步故障 |
| E04 `batch-store.ts` / outbox | 最终正式决定/无开放任务、快照哈希定稿/重开、相同 actionId 重放且 payload 冲突拒绝 | 复核 `batch-store.test.ts`，未为通过率改生产；E03 仅动 requeue | SchoolPort 外部回执/跨 PID；assist 人工定稿 UI 合同仍待设计复核 |

本次新增 E03 负例所在的首测提交因新提交导致 Actions 取消，不能将其写成观察到的 RED；只以最终单一候选 CI 和 test 内容签受控结果。