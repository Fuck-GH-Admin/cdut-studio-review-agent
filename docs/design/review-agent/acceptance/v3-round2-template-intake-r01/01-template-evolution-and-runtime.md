# 01｜模板演进、冻结编译与运行事实（Review V3 第二轮 2B）

> 审计状态：STATIC_INSPECTED / NOT_RUN_THIS_ROUND。2026-10-19 固定快照；不可将不同 SHA 当成一套产品。主线 main `8989941b6fb5651564e32d11c4215b6a6d5a5209`；D0.5 `5709c562696a7560aba092afc86c0af83cc5cd2c`；D1 `f05c17e1f620f3f3fcaddeb5c9b36c7492f30d2e`；D2 `56fa52a5173dfd5acd75af52f63d821ed9d5cf47`；D3 `4b191c729f3d5f8135c73b87c17642023f6c3986`；COMMON `a7a6a11d4840ad64cfc858c17b35f35180adf063`；集成 `b68443b23293b4714e61a3b81383d3d3a56434fc`；W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`。第一轮 [#133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/133)、1.5轮 [#134](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/134)。

## 一、实际能力成熟度（不是发布成熟度）

| 代际 | 已见实现与价值 | 不等于什么 | 固定证据 |
| --- | --- | --- | --- |
| D0.5 | `semantic-module-demo` 的规则/模块编辑、preview 和冲突演示 | 不等于真实持久化案卷引擎；演示状态机应退役，保留 UX/回归价值 | [semantic-module-demo.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/5709c562696a7560aba092afc86c0af83cc5cd2c/apps/electron/src/main/lib/review/semantic-module-demo.ts) |
| D1 | `ReviewAuthoringWorkspaceV1`、独立来源 `sources/sourceBindings`、validate、编译候选/manifest；阻断未知字段、高级关系降级、未经证实的授权 | 无法将完整原文业务/自然语言自动证明等价；`publicationAllowed=false` | [review-authoring-v1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-authoring-v1.ts) |
| D2 | `D2ScenarioSelection`/target 和不可变 `RuntimePlan`、fingerprint、rule/subject/check 映射、计划安装/核验、技术案卷创建 | `CreateD2TechnicalReviewCase` 是技术草案，不是校方发布或审核最终决定 | [review-d2-runtime.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d2-runtime.ts) |
| D3 | 冻结模块 SHA-256 digest、依赖树/循环、携包转入转出、反向消费者/升级影响、删除 Check ACK | 只在作者工作区升级，不等于逐案旧 Run/结论全部失效映射 | [review-d3-module-library.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-module-library.ts), [review-d3-upgrade.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-upgrade.ts) |
| D3 动态 | 按实际档案件+操作生成唯一 `objectKey`、重新绑定来源、对未定义操作/含糊原型 fail closed | 尚不支持嵌套原型、全复杂关系；不是模板发布路径 | [review-d3-dynamic-case.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-dynamic-case.ts) |
| COMMON | 泛化 `generic-object`，primary + conditions，`applicable/not-applicable/unknown`，每个对象独立 Check | 条件轴均有限额、来源 authority 需确认，不能把 unknown 自动视作通过 | [review-d4-common.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-common.ts) |
| D4 集成/W1 | 50 候选冻结 catalogue、技术加载、reviewer 输入表单、原生导入和建案 | 目录和技术合成运行不是业务政策批准/正式可用 | [review-d4-catalog.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-catalog.ts), [review-d4-client.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts) |

## 二、端到端合同重建

| 节点 | 输入 → 输出 | 权威/持久化归属 | 失败路径及可测边界 |
| --- | --- | --- | --- |
| 0 原文抽责 | 完整业务 MD、source hash、责任 ID/定位 → 独立 source-catalog 和 Gold | 作者/业务审查资料；不可塞进正式案卷事实 | 原文不可读、政策版本不确知、漏非 R 文本；不可借已编译数量过关 |
| 1 D1 作者态 | `definitions.modules/templates`、`sources`、`sourceBindings`、`advanced` → 可验证 workspace revision | `review-authoring-store-v1` 维护作者工作区修订，与 V2 案卷分属不同域 | 字段非法/缺绑定/虚构权威；D1 manifest 比对 fingerprint/digest |
| 2 D3 组合 | moduleId@version、digest、依赖、SourceBindings → 完整 Use 展开 | shared-frozen module 注册和工作区锁，不能原地覆盖 | `D3_DEPENDENCY_MISSING/CYCLE/DIGEST`、`D3_LOCK_MISMATCH`、包 digest 失败 |
| 3 D2 冻结 | workspace + 选定模板版本 + 目标/场景 + `ReviewCaseV2` → fingerprint/mapping/rules/subjects/guards | D2 Plan 附加至 `CaseAggregateV2.d2RuntimePlan`，不是第二份案卷仓库 | `D2_UNMAPPED_ADVANCED`、`D2_TEMPLATE_MISMATCH`、不完整 primary/condition、错来源 |
| 4 案卷建立 | candidate-held TemplateStore shell + reviewer actor + D2 plan → `CreateD2TechnicalReviewCase` 然后 `attachD2RuntimePlan` | `case-store-v2` aggregate 是技术案卷事务；W1 同时有 legacy `case-store` metadata/材料导入路径 | 创建与 attach 是两个事务；后者失败保留不可运行裸草稿，须显式恢复 |
| 5 D4 实例 | `generic-object` 真实 `objectKey/businessType`、每项条件 reviewer 来源 → `instanceCheckId` 和 `applicability` | 冻结 Plan 的 subject/Check 映射，不授权业务身份或学校决定 | 多对象混合、少条件、来源版本不符、无 scope 的 Check 被拒 |
| 6 Run 与校验 | Plan fingerprint + `SourceRef` + 单项状态 → Pi 运行验证、coverage/read ledger | `RunV2` 与 `CaseAggregateV2`，由事务和执行边界赋权；不属于作者态 | `verifyD2PiRun`/SourceRef/source gate；无有效检查不得自动完全符合 |
| 7 模块升级 | 冻结 from/to digest + 旧责任映射 + 显式 ACK → 新作者 revision | D3 的升级**只写作者工作区**；旧案 Plan 不得暗中改写 | 未签收删除 Check 拒止；V3 需另定义旧案 `Plan/Run/Outcome` 失效和重审协议 |

**特别注意**：[review-d2-runtime.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d2-runtime.ts) 中 `createD2TechnicalCase` 的两步事务与 W1 [review-d4-client.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts) 中的 legacy `ReviewCase` 视图共存；不可直接声称已经形成唯一、原子、无双写的业务输入合同。V3 需与 2A 作命令级对照。

## 三、源码已确认的限制与反例

- D1 的候选编译对 `advanced` 未映射关系和结构化 gate 的无条件投影均拒绝，避免“看起来有规则、运行时已经丢掉”的假完成。
- D2 `compileD2RuntimePlan` 遇未映射高级 Claim/Evidence 关系立即抛出 `D2_UNMAPPED_ADVANCED`；generic target 和传统对象不能混编。COMMON `compileD4Generic` 要求每对象的 primary 已确定，所有 condition 都显式三值，绑定来源版本。
- D3 `upgradeD3ModuleUse` 比较旧/新 `sourceBindings` 的 Check ID，删除名单必须与 `acknowledgeRemovedCheckIds` 完全一致；升级不等于迁移已发生的案卷结论。
- 需额外检查 COMMON 的多分支同一 Check 去重语义：现有 `records` 以 instanceCheckId 先写为准；若同一 Check 在若干分支有不同适用性，须用反例判断该合并是否丢失可解释性，不能仅看最终 mapping 数。

## 四、证据等级

`review-d3-module-library.test.ts` 包含摘要篡改、依赖缺失、版本锁、删除 Check 未 ACK、导入碰撞等断言；`review-d4-common.test.ts` 包含 unknown、跨对象证据与 stale source 的拒止；`review-d4-unified.test.ts` 只声明 50 D1+50 D3 transfer 和至少 45 个 D2 plan 测试门槛。**本轮仅阅读测试代码及历史报告，未执行；不得在验收表上盖 PASS**。

## 五、V3 继承建议

保留 D1 作者意图/来源解释、D3 不可变资产与升级差异、D2 编译后的不可变计划、COMMON 的对象/unknown guard；适配单一 V2 aggregate 命令接口。D0.5 状态机和将两个领域关键词当通用路由引擎的实现退役，保留用户交互与 fail-closed 测试。见 05 的契约冲突与 06 的阻断矩阵。
