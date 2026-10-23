# 02｜作者态、字段 Schema 与完整无代码制作缺口

证据快照 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`。本报告区分“作者工具链可以用 API/CLI 操作”和“普通用户在客户端完成不写代码的业务设计”；后者**未证实完成**。

## 一、已有可靠底座

- [review-authoring-v1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-authoring-v1.ts) `validateReviewAuthoringV1` 校验 workspace、模板、模块、source、sourceBinding、允许字段，并保留候选侧 manifest `publicationAllowed=false`；`compileReviewAuthoringCandidateV1` 拒绝无法无损映射的 advanced 关系。
- [review-d3-module-library.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-module-library.ts) 有 freeze/discover/reuse/export/import/diff，`review-d3-upgrade.ts` 提供 impact/显式升级和删除责任签收。测试覆盖隔离配置目录下 CLI 完整往返；是工程作者接口，不等于完整 GUI。
- [review-d4-field-form.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-field-form.ts) reviewer-owned 字段快照从**已安装冻结 Subject plan** 取允许的 fieldKey，不能任意扩展正式规则。类型明确支持 `text/number/date/boolean/enum/multi`，必填、enum options、数值 min/max 并在 Main 校验；日期用 YYYY-MM-DD 且检查实际日期。
- `assertD4ObservationScope` 检查 subjectId、文档 role、active、parseRevision 和来源坐标；`assertD4EvidenceLinkScope` 将证据限定于一个 Subject、证据文档与对应 supportsFact。该守卫是一个输入边界，不能替代完整 SourceRef/业务结果端门禁。

## 二、完整无代码路径逐项判定

| 用户操作 | 实际证明 | 当前判定 | 缺失的端到端验收 |
| --- | --- | --- | --- |
| 新建空白业务/模板 | D1 workspace 数据结构及 CLI 可创建 | 工程底座有、普通用户 GUI 未证实 | 从空白通过 UI 创建第 51 套，保存后回读 |
| 自然语言描述审核目的 | D0.5 语义演示、结构化作者工具 | 未证明 NL→业务完整责任的独立校验 | 原文责任提取 vs 独立参考，未知明确待核 |
| 组合共享/本地模块 | D3 freeze/reuse 与锁验证 | API/CLI 有，复杂组合 GUI 未验 | 依赖循环、冲突、缺 module/digest |
| 配置场景与复合条件 | COMMON + D2 有明确三值和来源 | 受限结构化条件有，跨对象 Claim 图未映射 | 多分支冲突可视解释；unknown 不变通过 |
| 作者字段和来源元数据 | D1 source/reference、D4 reviewer field snapshot | **二层接口尚未合一**：D4 是 reviewer 数据入案而非 D1 正式 author schema | 必填/枚举/多值、来源身份、校规版本/生效期迁移 |
| 预览试跑/修正 | previewDemo、D2 technical candidate，Pi pending-only fixture | 合成技术试跑已有；用户 GUI/多模态质量未签 | 正/负/未知、缺件、替代、复核、撤销的真实素材 |
| 发布/撤回/回退 | 现有 50 项 `candidate-held` 不允许发布 | 未证明正式发布权限与审批工作流 | 权威来源+审核人+学校授权+生效范围+审计事件 |
| 复制/升级/导出 | D3 bundle、digest/升级 impact | 底层有；GUI 回退与运行案卷迁移未证 | 拷贝到新工作区、删 Check ACK、旧 Plan/Run 失效 |

## 三、显式合同缺口（2D 决策，不在本轮开发）

1. **AuthorSchema vs ReviewerFormSchema**：D1 `ReviewAuthoringWorkspaceV1` 定义责任/来源；W1 `D4ReviewerFormSnapshot` 由 reviewer 在确定的 `planFingerprint` 和 `subjectId` 下配置显示与值约束。不能以 reviewer snapshot 反向改写作者态，更不能凭这些字段假造校规。
2. **业务事实状态**：字段值、人工 Observation、EvidenceLink、unknown applicability、Check conclusion 是不同对象。请为同一个 `fieldKey` 制定类型、出处、确认人、所属 Subject、版次和无效条件，不要拆成 D1/D4/V2 三种互不兼容事实。
3. **对象枚举不该隐藏于示例**：D2 历史学籍/校园卡、D3 archive-item/archive-operation、D4 generic-object 与 V2 `SubjectV2` 的主键、业务类型和实例身份需形成版本化转换，且要求 source binding 不漂移。
4. **模板权威生命周期**：候选由谁创建、何时独立核查完整性、哪项学校政策及有效范围、谁批准发布、如何回滚，必须区别于机器 fingerprint 成功。
5. **适用性/条件表达式**：目前 COMMON primary 和 conditions 上限各 13；G07 的 BR-13..BR-22 已明确留在语义原文。若原文需要跨时点、跨文书合法替代、阶段条件，不能压成一个布尔开关。
6. **配置无法减少真实职责**：删除模块、切换分支、复制他域通用模块，必须获得可视化 `source obligation → Check → subject → source binding` 差异报告。已冻结源技术版本与“规则已获授权”需独立字段。

## 四、测试/质量签收

已有可定位断言：`review-d4-field-form.test.ts`；`review-d3-module-library.test.ts`；`review-d4-common.test.ts`。本轮 NOT_RUN，历史案例和字段 UI 实机接受度 UNKNOWN。要求 2D 给统一 Schema 原则；第三轮做**第 51 项陌生业务**无代码制作，从零开始并由独立审核员验收原文义务，模板创建者不得读取独立 Gold。该测试必须保留所有不支持关系的 `tooling-blocked`，不允许偷偷删除。
