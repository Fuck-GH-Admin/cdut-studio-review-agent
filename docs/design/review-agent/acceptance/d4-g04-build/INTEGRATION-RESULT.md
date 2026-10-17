# G04 D4｜八套模块化技术制作实测及集成交接
> COMMON SHA：`a7a6a11d4840ad64cfc858c17b35f35180adf063`；本文件基于 [专项真实 Actions #39051277664](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051277664) 的八套执行记录。Run 是 **pending-only 的合成技术预审**，不是学校行政批准。

## 已经真实完成
- 8 个完整业务 Markdown 已按 SHA 读取；343 条 R 责任保存于 D1 tasks；8×7 = **56 个本地模块**；**972** 项 Check→SourceBindings；F/MS/BR/EV/阶段等原文章节全文另存 `source-sections.json`，逐章有独立语义 Check。
- 每套一份可读 `workspace.json`、`selection.json`、`case.json`、`manifest.json`、`coverage.json`、`source-sections.json`，以及真实执行后的 `runtime/<TXX>/d2-plan.json`、`pi-run.json`、`registered-evidence.json`、`d1-revisions.json`、`runtime-summary.json`。
- 真实 D1 保存 1→2 修订、旧修订哈希不漂移；D3 export/import 往返；D2 generic-object 两目标，每条原始 R 为独立 scoped Check；Pi 服务 prepare→submit pending→verify **8/8 完成且 issues=0**。
- 真实 registerMaterial + setEvidenceLink 每模板各 1 次：只为对象 A 绑定，B 不能引用 A 的证据；旧版本不能承接；UNKNOWN 不变作 compliant。**16 个 Subject，988 个 RuleSpec/Check**。
- 所有测试使用隔离 PROFER_CONFIG_DIR，文档为合成文本，无 Gold、无学校账号，权限字段只供技术预审。

## 分模板状态
| 模板 | R 原文 | local 模块 | SourceBindings | 编译 Check | Subject | D1/D3/D2/Pi | 完成状态 |
|---|---:|---:|---:|---:|---:|---|---|
| G04-T01 | 40 | 7 | 116 | 118 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T02 | 53 | 7 | 142 | 144 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T03 | 46 | 7 | 128 | 130 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T04 | 35 | 7 | 106 | 108 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T05 | 36 | 7 | 108 | 110 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T06 | 48 | 7 | 132 | 134 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T07 | 46 | 7 | 128 | 130 | 2 | PASS (pending-only) | **PARTIAL** |
| G04-T08 | 39 | 7 | 112 | 114 | 2 | PASS (pending-only) | **PARTIAL** |
| **合计** | **343** | **56** | **972** | **988** | **16** | 技术链路通过 | **8 PARTIAL** |

## 尚不能宣称完成
1. **AUTHORING**：原文细分 BR，特别是 T06 的会议/大型群众活动多轴法律条件，当前是原文语义 Check + 两主轴两叠加条件的可运行候选，并未把 19 BR 全部程序分流。T01/T08 等亦同。
2. **AUTHORING/POLICY**：完整 F/MS/EV/ST 原文章节已保留，但每一材料的提供方、到期阶段、替代性及来源权威尚未全部强类型分配。不能把 C 原文长度、生成了 988 个 Check，直接当“业务语义全量验收”。
3. **SOURCE/POLICY/EXTERNAL**：校本实际制度与审批部门授权、真实监管/OA/车辆等系统接口、E Gold 私有权限证明仍没有在本轮获得。技术结果仅待人工确认。
4. **ENGINE**：高级 Claim 图仍需真实反例证明是否构成不可替代阻断，不应预先拉起第二套审核引擎。
5. **TEST**：online Pi 模型业务准确率、历史 Gold 对照、正式行政审批都 NOT_RUN；旧 E 记录不由本轮覆盖。

细项归因和最小关闭动作见机器可读 [integration-manifest.json](integration-manifest.json)。用户与集成负责人可以现在接收八套 **D1/D3 技术候选**，但**不能按 READY_FOR_INTEGRATION 直接合并声称完整 G04 生产版**。后续按本地作者分支的剩余条件补完并执行独立 E/模拟材料复核，不重新启动 A/B/C/D/E 全研究。
