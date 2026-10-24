# F07｜持久恢复与 V1/V2 旧决定边界隔离｜阶段报告（2026-10-24）

## 0. 基线与任务边界

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`
- F07 独立分支：`fix/v3-f07-recovery-legacy-isolation`
- 开发取材基线：PR #249 head `59612a7a1e42c4066ac5cc1074f4009652fad5bc`。
- 冻结共同 base：`feat/v3-r02-template-library` @ `150acfe761cb7ad0424a2ca009fd57f12dbfddfd`。
- #246 / #249 / #250 的统一集成由另一独立会话负责，**本分支未擅自合并、改写或向三个原 PR 提交**。
- F07 只修：本地业务确认跨进程存活；旧 V2 决定/申诉入口不可改写原生 V3 决定；核心状态冷读回归。144 模板、学校身份/政策发布、T08 新报告权限属于其他批次。

## 1. 阶段一｜源码复现与原因

1. `review-v3-t05-main-service.ts` 原以 `Map<caseId, confirmation>` 记录本地业务发布确认。进程退出丢失；更重要的是 `registerT05LocalBusinessConfirmation` 在生产代码中没有实际调用，只有测试调用。结果是已有 `canonicalPlan` 的案卷冷启动后缺少独立确认，T05 降为 `technical-pre-review`。
2. `stage-workflow.recordStageDecision` 已拒绝原生 V3 用 `run@rev` 生成旧阶段决定；但 `workspace-business-service-v2.decideWorkspaceCaseV2` 只检查 D2/CanonicalPlan，没有拒绝“原生 V3、尚无冻结 Plan”这一情况。
3. `stage-workflow.resolveAppealV2` 未隔离原生 V3，旧路径仍能尝试追加更正决定。
4. `case-store.ts` 对旧 V1 `case.json` 的原生案卷写入已经有 `isLegacyProjectionAllowed` 门禁；`case-store-v2.ts` 的材料、补件、决定、事务回执为持久状态，Run Store 也落盘。F07 不复制这些仓库。

## 2. 阶段二｜最小修复及理由

| 问题 | 处理 | 原因 |
| --- | --- | --- |
| T05 确认仅在进程内 | 为现有 `CaseAggregateV2` 增加可选 `localBusinessConfirmation`，改由 `submitCommand` 同一事务提交记录与回执 | 与 Case revision、幂等 requestId、写队列和磁盘事务保持一致，不造第二套状态存储 |
| 重新启动丢确认 | `resolveT05BusinessMode` 从传入的当前持久聚合读取；校验 caseId、planId、fingerprint、模板版本、本地确认来源、时间和理由 | 不使用旧进程 Map，也不把未匹配确认升级为发布许可 |
| 计划升版后的旧确认 | 严格比对当前冻结 Plan；指纹不同即 `technical-pre-review` | 必须重新确认，不跨计划复用权利 |
| 旧最终决定/申诉改判 | 新建 `review-v3-legacy-decision-gate.ts`，供三个旧决定路径复用 | 原生 V3 创建回执代表所有权，即使后来普通投影字段损坏也不得降级走旧写入口 |
| 历史 V2 兼容 | 仅拦原生 V3、冻结 CanonicalPlan、D2；旧非原生 V2 保持原有业务校验 | 不破坏历史读取和合法旧案卷处理 |

本地业务确认只产生**本机**能力，不证明学校授权。新增确认命令没有暴露 Renderer IPC；需要集成负责人在有独立本地发布确认来源后接入，不能因为有 CanonicalPlan 而自动调用它。

## 3. 阶段三｜实际验证

环境：Bun 1.4.2；仓库锁文件依赖；Linux 测试容器。

已通过：

- 新 `review-v3-f07-recovery.test.ts`：5/5。含确认写盘和回执、requestId 幂等、真实子进程重新加载、Plan 升版失效、畸形确认拒绝、三种旧决定入口拒绝写入、材料/补件/Run/决定历史磁盘冷读。
- `review-v3-t05-business-mode.test.ts` + `workspace-business-service-v2.test.ts`：24/24。既有 T05 模式、Run 适格性与 V2 正常业务无回归。
- `stage-workflow.test.ts` + `review-v3-legacy-entry-gates.test.ts`：40/40。旧历史办理流程与 V1 原生保护不回退。
- shared TypeScript：通过。

**验证等级声明**：测试验证了进程级重载和持久化读取，但没有自动等价为真实 Electron GUI 退出、重新登录、重开历史 T08 PDF/ZIP 的实机验收。后者必须依赖 #246/#249/#250 统合且报告链已接入的最终 HEAD。

## 4. 后续集成门槛 / 未关闭风险

1. **统一 HEAD 尚未提供**：本分支基于 #249 独立实施；由统合负责人明确固定 SHA 和最终 PR base 后才变基/挑拣，不自行把 PR 指向 main。
2. **Main 发布确认接线**：当前本地没有正式学校发布者；必须从可信 Main 的显式用户操作接入 `confirmT05LocalBusinessPublication`，不能从 Renderer 角色字符串、计划存在、模型输出自动登记。没有确认时继续 fail closed。
3. **T08/F16 报告冷启动**：#250 的不可变快照、另存审计和历史恢复不在 #249 基线上；统一 HEAD 后追加重启/篡改/历史与当前区分的真实测试。
4. **真实 Electron 全链**：材料导入→补件→新 Run→T05 决定→T08 快照→关闭应用→重启恢复；验证回执、案卷 revision 和磁盘文件一致。
5. **已损坏旧案卷**：原生创建回执存在但核心状态损坏时，本次旧决定门禁拒绝写；人工修复/迁移应另有受控恢复路径，不可自动将其当旧 V2。
6. **未新增学校授权**：`local-organizer` 是本机模拟业务确认，仍不能充当学校认证、政策证据或正式签发。

## 5. 交付状态

- **已实现**：F07 的独立存储/旧决定写入安全增量与回归。
- **待依赖**：统一集成固定 HEAD、与 #250 的 T08 历史报告联测、真实 GUI 冷启动证据。
- **禁止认定**：仅凭本分支单测通过就宣称 F07 跨模块业务验收完成。
