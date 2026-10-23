# 10｜三层独立验收、永久负例及GO/NO-GO

**本R3阶段全部是验收设计，NOT_RUN_THIS_ROUND。** PR #139的239项PASS_SCOPED及三处有意红灯只是固定旧代码证据；未来新合并SHA必须亲自重跑，先记录首败，再证旧失败→新拒止。

## Gate O｜离线工程（必须使用真实统一合并快照）
- `typecheck`、`check:boundaries`、完整相关Bun单测、CAS/命令/DTO contract、静态依赖边界、固定M/D4/P06/R02差分负例；报告机器/依赖版本、测试命令、源HEAD、测试数量、exit code、日志sha、失败首因和fixtures。
- L1-01 archive后的Observation/Link/ReadReceipt/Check/Run/Readiness/Decision全层撤效；禁止删除Plan+人工造Run才可测试的替代，真实操作正负例都要有。
- L1-02 四Main写IPC伪school/teacher全部拒/可信local合法写正例，Receipt来源来自Main；RESOLVE_APPEAL非teacher拒止并验证有凭据teacher正例（授权无法供给则BLOCKED）。
- L1-03 `BATCH_ACTION_V2 finalize-completed`、直接`finalizeBatch`、auto、group、retry、outbox入口：缺entryRun、跨批错Run、旧revision、旧template、非法actor、hash冲突拒止；正常auto与正当人工定稿通过。
- L1-05 6 Check×target含unknown/sourceVersion不丢项；旧schema显式迁移或拒止；九Check漏一、200差额、执行失败、空发现全不被判pass。
- 跨PID CAS requestId+payloadHash/expectedRevision；多文件`PREPARED`时断电、Outbox待发送/发送超时/replay/reconcile；同ID异payload和旧done无Run fail closed。
- #91十四处blob的溯源和语义差分账；G01–08义务coverage尚缺不得标发布。

## Gate E｜目标设备 / Electron +真实文件/故障（独立）
- Renderer→Preload→Main实际入口与多窗口sender/owner鉴别、GUI正常finalize按钮可达性（与Main漏洞不混淆）、真实school登录/可信teacher功能存在时权限正例。
- 拖入/Picker/多ZIP/路径逃逸、symlink/损坏/同名、C10双击token和导入恢复；DOCX真正段落、XLSX sheet/cell、PDF坐标、OCR扫描、Office71 same-stem不同物理源和缓存隔离；点击SourceFocus需到具体版本及块。
- Owner hidden普通会话不可访问、after-await revoke/P02删除迟到/多窗口stop/重复启动；测试真ENOSPC、断电跨PID、冷启动recovery且不改已完成Receipt。UI历史只读/申诉/评分/补件可操作、窄屏三栏可用。

## Gate L｜授权LIVE / 学校业务与独立Gold（绝不由Mock替代）
- 真Provider tool_use→Main授权工具→实际读取→tool receipt→真实ReviewRun/SourceRef；仅在授权测试环境和匿名材料中记录model/channel/request/permission，不泄露凭据。
- 真实学校账户/校方角色来源、SchoolPort有权读/写与官方回执等级；无明确授权与沙盒环境必须`BLOCKED_NO_AUTH`。
- 50个candidate-held只作技术候选；独立Gold/政策原文完整义务和校方签署后才可升为发布。至少第51套从零配置无代码使用、政策/条件/字段/版控/评分/导出/重放端到端测试。

## NO-GO与保全表

| 障碍 | 失败即阻断 |
|---|---|
| archive旧值进入当前正式score；frozenPlan被V1投影变更 | 当前业务决策 & 完整工程集成 |
| Renderer伪Actor进入Receipt或教师角色；本地reviewer冒老师 | 所有有权写/审批 |
| Batch最终化缺/错Run仍finalized；hash/revision不符而通过 | ReviewBatch/auto/outbox上线 |
| SourceRef跨案/归档/未读算pass；Check未知漏项算符合 | 审核正确性 |
| 断电后双权威、Receipt丢历史、Outbox重复声称校方成功 | 数据安全/发布 |
| 评分/回避/补件/申诉/历史Run/报告/离线包被删 | 产品完整性 |
| Provider/校方/Gold/Electron未跑却标PASSED | 发布结论 |

每个失败至少保留`first_failure.json`、fixture SHA、stdout/stderr SHA256、实际persistent artifacts哈希、commit SHA和可重复步骤。允许累计功能后集中目标机验收，但不能停止日常离线CI。
## Gate P｜原始产品目标与评测保全
必须逐项核对原始`02`之F01–F18、`04`之A01–A18/C01–C04/S01–S03/D01–D12/K01–K16，以及120例+30盲测/用户可用性/规模/资源/真正Windows安装。详细见`16-original-product-acceptance-traceability.csv`及`16-original-product-acceptance-traceability.md`；全部R3状态NOT_RUN，不得以本轮架构与239选定离线测试覆盖原功能验收。
