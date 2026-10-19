# Dev-B B1-R08｜无代码作者工作流引用完整性、保存/冻结一致性与第 51 套集中 UAT

**性质**：Review V3 Dev-B R01 真实产品功能开发 + 源码/合成验证 + 后续独立真人 UAT。**不是正式政策/学校 Gold 发布，不是 C 案卷/Plan/Run/Decision 写入，也不是第 51 套验收已经通过**。

## 0. 准入、来源锁与当前状态

- 源工程 PR [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)，base `feat/v3-dev-c-c0-contract-r01`，起点 R07 `8fda631971b726f0651df88955b365e579fd2ed9`。
- 本轮代码截止 `f6bd5bf8a39d41bcd673f83546adc1a474de5cba`，**5 个 B-owned 生产/测试文件**，均来自实际 commit（非仅计划）；文档提交会生成更新的 HEAD，故最终 Gate O 以新 HEAD 重新确认。
- 此 SHA 的 PR CI `39267593492`、Baseline `39267593341`、D2 `39267593402` 首读均 `QUEUED`；未取得 Bun/TS/build 成功记录，`Gate O=PENDING_CI`。
- C 对 B 的 `B-CR-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`，B 只可实现 Author candidate / technical preview / candidate freeze；正式 Main IPC、Preload、可信 Owner Principal、InstallPlan/Policy Publisher/Gold 仍由 C 决定。I1 旧 B 锁 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 不浮动替换。

## 1. 本批源代码及责任

| 路径 | 本批作用 |
|---|---|
| `apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.ts` | 纯函数重命名 `source/field/target`、引用图级联、占用拒绝删除、试跑输入键搬迁、未保存检测、删除后唯一 ID 分配 |
| `apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.test.ts` | 6 个提交的合成测试：第51套 2 Subject×2 Check/4 Binding、三值与来源保持、引用删除阻断、缺口 ID、新/旧 Plan 删除 Check ACK、试跑值不会污染作者配置 |
| `apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx` | 新编辑 helper 真实接入 UI；来源、字段、对象 ID 同步更新；删除被引用元素警示；保存后记录可核对快照；有未保存修改时禁冻；等待异步保存/预览期间继续输入则分别保持 dirty 或丢弃过时预览；新增唯一编号逻辑 |
| `apps/electron/src/main/lib/review/review-template-author-main-port-v3-b1.ts` | 增加 Main-only `freezeSavedDocument(ctx,doc,expectedRevision)`：以可信 ctx 重写 recordedBy 后与实际持久 revision 的作者源对比，再调用持锁 `freezeB1Candidate`；不能用 renderer 的自称 author/role 作为身份 |
| `apps/electron/src/main/lib/review/review-template-author-main-port-v3-b1.test.ts` | 新增保存后变更内容拒冻、合法持久快照可冻、旧 revision/伪 owner 拒止；文件现 4 个测试定义 |

**显式集成要求**：未来由 C 授权接入真实工作台时，`ReviewV3AuthorWizard.onFreezeCandidate(document,expectedRevision)` 应映射到 `ReviewB1AuthorMainPort.freezeSavedDocument`，不要调用没有显示源快照参数的旧 `freezeCandidate(templateId,revision)`。旧接口仍为内部兼容，不能用 UI 的本地 dirty 状态代替 Main 可信校验。Main port 目前是 B 自有可组合能力，**尚无 C IPC/Preload/工作台接线**。

## 2. 已实现的用户问题修正

**R08-01 关联引用丢失**：过去重命名字段 ID 后条件 DSL `fieldKey` 和对象 `fieldValues` 使用旧键；重命名来源 ID 后字段 `sourceId`、Check `sourceIds` 保留旧键；修改 targetKey 后 Check `targetKeys` 脱离目标。R08 纯变换同一不可变候选 source 中的所有引用，并且失败不部分写入。已被条件使用的字段/被 Check 指向的目标或来源不能直接删除，需要先解除绑定；不靠编译失败时才发现数据损坏。

**R08-02 冻结了屏幕上看不到的旧修订**：旧 UI 只带 revision 冻结磁盘中最新已保存记录，未校验屏幕内容是否又被编辑。R08 增加本地 saved snapshot/dirty 禁止与 Main 源快照二次比对；保存请求中途继续编辑时保存的是请求快照，新的 UI 修改保持未保存。旧预览异步回执若晚于用户编辑会被丢弃，避免用过时技术试跑误导用户。

**R08-03 增删后 ID 碰撞**：字段、来源、Check、对象、阶段与输出不再使用数组长度作新 ID，统一寻找未占用 ID，不覆盖既有原文和 Check 绑定。

**尚存交互成本**：ID 当前由受控输入在每次字符变更时验证合法性，完整替换 ID 的输入法体验要在真人 UAT 中测量；未来可考虑编辑缓冲区 + blur commit，但必须保持 Main 层引用一致性。新增“删除 Check”仍**只属于候选作者内容**；正式版本升级删 Check 仍需 Dev-C `InstallPlan/UpgradePlan` 对旧/新固定 Plan diff 的明确 ACK。这里没有赋予 UI 任何发布权。

## 3. 第51套合成技术流与严守边界

测试实例 `custom-community-project-51` 为**完全由用户声明的合成项目证明核验**（不是学校制度第 51 套政策）。定义两个具体对象和学生 Subject，来源含用户声明与明确 `policy-candidate/unverified`，字段含 boolean/enum/evidence，两个 Check：同意字段的条件责任与真实证明的人审责任，共 **4 个 Check×target** 候选绑定。

离线技术证明目标：
1. 空白条件产生 `unknown`，输入技术样例 `true` 可显示 `applicable`、`false` 为 `not-applicable`；样例不能进 author freeze/export。
2. 未经真实 B2 SourceIdentity 的 `evidence` 不得被试跑文本冒充为真实已验。
3. 依次重命名 source、condition field、target，四项 Binding 不会丢失，原始 Author 对象未被原位篡改。
4. 删除仍被 Check 引用的元素得到可见错误；删除无引用字段清理相应 Target fieldValues；试跑键随 ID 搬迁。
5. 保存后存在未提交编辑，UI 与 Main 双重阻止冻结；保存新 revision 后可以冻结 **candidate-held**，结果 `publicationAllowed=false`，没有 CurrentCase 或 SchoolPort 权力。
6. 删除已有 Check / target binding 后计算固定旧/新描述符 diff，必须提供显式 removed Binding ACK；旧版描述符保留。
7. 相同当前 revision 下另一个作者/进程不应伪造 saved-source 身份，Main 以当前可信 session 重新验权（完整实体 Main/IPC 需 Gate E）。

## 4. 集中验收：5 人 × 30 分钟，不能由合成测试代替

在 Dev-C 提供受信 Main / Preload / 实际工作台作者入口并通过对应精确 SHA 集成 Gate O 后开展 5 人独立无代码 UAT；参与者必须从**真实可见 UI 空白状态**构建第 51 套，禁止通过修改源码、复制合成 JSON、数据库直写来冒充无代码使用。

| 环节 | 用户操作 | 必留证据/判定 |
|---|---|---|
| 00–05 分 | 新建业务名、目的、声明性质；尝试切换政策候选 | 屏录含明确 candidate-held/未获授权，保存 Main receipt 和修订 |
| 05–12 分 | 添加两来源、三个字段（含枚举/附件）、两 Subject/对象、两个 Check | 字段/引用图/试跑样例展示；编译不得暗删 Check 或漏对象 |
| 12–18 分 | 修改 source/field/target ID，删除一个在用字段后解除引用，再加回来 | 正确级联和阻断，重建无重号，原责任不改写 |
| 18–23 分 | 先不填条件，再填 true/false；预览各状态；尝试伪造附件试跑 | unknown/applicable/not-applicable 技术三态、附件无证据不得变真；记录指纹 |
| 23–27 分 | 保存，做未保存修改后尝试冻结，随后保存新修订再冻结 | 必须阻止冻结旧草稿，冻结结果固定到真实 Main source/Revision |
| 27–30 分 | 删除 Check、查看升级需 ACK，导出候选，重开查看历史 | 无权限安装/发布，导出不携带试跑值；旧 Plan 仍可追溯 |

五名参与者分别给出完整任务完成率、用时、误触发、状态理解、数据丢失/引用错乱、失败恢复能力；失败必须保留原屏录/日志而不是用补丁化“演示 PASS”。检查中文 IME、键盘操作、窗口关闭与恢复、保存冲突、渲染器伪造 Main actor、离线与异常退出。场景覆盖全部真实目标机文件来源需由 B2 和 C 合并验收另行证明。

## 5. 门禁、测试命令与下一批

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.test.ts apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-trial.test.ts apps/electron/src/main/lib/review/review-template-author-main-port-v3-b1.test.ts apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.test.ts apps/electron/src/main/lib/review/review-template-author-store-v3-b1.test.ts
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
```

- **Gate O** `PENDING_EXACT_SHA`：需最终 PR CI / Baseline / D2 一致 SHA 跑完并记录实际 pass/fail/OS skip；先前 R07 CI 也一直排队，不能借旧的绿色切片证据。
- **Gate E** `NOT_RUN`：Renderer 可见界面交互、Main 真实授权/原文件、IME、五人 30 分钟、窗口关闭/重开/更新并发、Office71 等尚待本机集中验收。
- **Gate L** `BLOCKED_NO_AUTH`：学校政策原文/签发人/Gold/发布权无授权，`policy-candidate` 严禁伪称正式。
- **Gate P** `PARTIAL`：第 51 套无代码 UAT 未运行，B4 50 套仍 candidate-held、G01 34 Scope UNKNOWN、38 原文未独立核验；本次 B1 增强不是对这些缺口的替代。

**后续**：若同 SHA CI 首败必须由 B 修复；下一轮可开发 B1 规则来源/流程编辑体验和“删除 Check 的审阅确认”候选 UX，正式升级 ACK 和 Plan/Case 持久写由 C 实施。C 未接线前继续完善 B 自身独立 author UI 和真实目标机集中验收文档，不宣称第 51 套已经成为正式第 51 套学校模板。
