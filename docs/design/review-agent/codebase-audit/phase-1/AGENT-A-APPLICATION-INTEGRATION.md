# A 会话｜应用接入与 IPC 边界源码盘点

- 仓库：Fuck-GH-Admin/cdut-studio-review-agent
- 固定基线：7b6cdc843d26e926c0c63b8c51a451ff3925cfad
- 基线时间：2026-10-21T08:32:09Z
- 审查方式：只读源码、共享通道定义与现有测试核对；未修改生产代码，未运行测试或 CI。
- 本报告范围：应用启动与 IPC 接线、Preload 审核 API、共享 IPC 通道、审核 IPC 注册、主窗口/操作者/路径边界，以及专用 V3 Main 安装器。
- 盘点清单：17 个实现/契约文件与 10 个相关测试文件。该清单是 A 的责任范围，不代表全仓逐文件盘点已经完成。

## 1. 结论摘要

审核模块并非只借用 CDUT Studio 的界面壳和 Pi。它有独立的业务 IPC 注册入口、Preload API、共享通道契约、主进程权限校验，以及对宿主通用 Agent 文件访问的隔离措施。宿主接入是明确的 Electron Main/Preload 边界。

但当前接入层仍呈现迁移期形态：

1. 同一套 reviewAPI 同时暴露无版本后缀的 review 通道、review-v2 通道和 review-v3 通道。
2. 业务 IPC 主要集中在一个 1,471 行的 review-ipc.ts 中；该文件既注册路由，也承担大量参数验证、分支判断和业务协调，并非纯粹的薄控制器。
3. 部分 V3 能力采用“先注册处理器、再单独安装 Main 权限/数据源”的设计。若安装器未接入正常启动组合，处理器会按设计拒绝请求，而不是自动完成业务。
4. 正常启动与降级启动的审核能力安装路径不一致。降级路径只调用通用 registerIpcHandlers，没有重复执行四个 C11 安装器；同时通用注册函数在注册全部处理器前就设置了幂等标志。
5. IPC 发送方校验、操作者绑定和存储 ID 校验已经存在，但各路由使用方式并不一致；需要按通道敏感度建立完整矩阵。静态文本扫描不能单独证明某个接口可被利用。
6. REVIEW_IPC_CHANNELS 有 121 个常量：24 个 review:、62 个 review-v2:、35 个 review-v3:。Preload 引用了其中 119 个不同通道；当前 A 范围内核对到 118 个 invoke 处理器，以及 1 个用于主进程向渲染进程发送进度的事件通道。ENSURE_INITIAL_TASK_V2 和 SUBMIT_APPEAL_V2 暂未找到对应处理器或 Preload 方法，是待确认的遗留常量候选。

## 2. 真实接入链路

### 2.1 正常启动

1. apps/electron/src/main/index.ts 在 app.whenReady() 后进入 bootstrap。
2. bootstrap 调用 registerIpcHandlers()。
3. apps/electron/src/main/ipc.ts 的 registerIpcHandlers() 注册宿主 IPC，并在后段调用 registerReviewIpc()。
4. registerReviewIpc() 注册审核主要通道，并调用 registerCMainV3AuthorPlanIpc()。
5. bootstrap 随后依次调用四个独立的本地能力安装器：
   - installC11LocalAuthorWorkbench()
   - installC11LocalNativeProductIntake()
   - installC11NativeD4TechnicalPlan()
   - installC11NativeB1TechnicalPlan()
6. BrowserWindow 使用 preload.cjs；Preload 通过 contextBridge 暴露 reviewAPI。reviewAPI 只在主 frame 上暴露，调用方通过共享 REVIEW_IPC_CHANNELS 常量进入 Main 处理器。

源码依据：
- [main/index.ts 启动与四个安装器，L877-L920](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts#L877-L920)
- [main/index.ts BrowserWindow 安全选项，L452-L494](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts#L452-L494)
- [main/ipc.ts 注册守卫，L1298-L1338](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts#L1298-L1338)
- [main/ipc.ts 注册审核 IPC，L6240-L6250](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts#L6240-L6250)
- [review-ipc.ts 注册入口，L88-L103](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-ipc.ts#L88-L103)
- [Preload reviewAPI 暴露，L4555-L4898](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/preload/index.ts#L4555-L4898)

### 2.2 IPC 数量与通道归属

| 项目 | 盘点结果 | 说明 |
|---|---:|---|
| REVIEW_IPC_CHANNELS 常量 | 121 | 定义于 shared types/review.ts |
| review: | 24 | 早期未加版本后缀的通道 |
| review-v2: | 62 | V2 通道 |
| review-v3: | 35 | V3 通道 |
| review-ipc.ts 直接注册 | 103 | 不包含它调用的独立注册函数 |
| registerCMainV3AuthorPlanIpc 另行注册 | 4 | 由 registerReviewIpc() 调用 |
| 四个 C11 安装器注册 | 11 | 3 个本地作者工作台、5 个材料/路由、2 个 D4、1 个 B1 |
| 当前 A 范围内可对应的 invoke handler | 118 | 103 + 4 + 11 |
| Preload 引用的不同通道 | 119 | 118 个 invoke 通道 + IMPORT_DOCUMENT_PROGRESS 事件 |
| 待确认的未接线常量 | 2 | ENSURE_INITIAL_TASK_V2、SUBMIT_APPEAL_V2 |

以上数字来自固定基线的源码静态盘点。IMPORT_DOCUMENT_PROGRESS 是 Main 向 Renderer 发送的进度事件，因此没有 ipcMain.handle 是正常设计，不计为缺失处理器。

通道定义位置：[shared review.ts，L486-L666](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/packages/shared/src/types/review.ts#L486-L666)。

### 2.3 宿主与审核模块的交叉边界

main/ipc.ts 不只转发审核调用。它还把审核内部路径与普通桌面 Agent 文件能力隔离，并过滤审核专属 Agent 会话：

- 普通 Agent 会话列表与会话元数据会排除审核拥有的会话。
- 普通桌面文件读取、目录列表、预览和变更路径中多处调用 isReviewPrivateDesktopPath。
- review-private-file-access.ts 同时检查原始路径与可解析的真实路径，以阻止符号链接别名绕过私有路径规则。
- 该文件明确是 deny-only 防线：调用方仍需执行普通的根目录、会话和权限授权，不能把它当作完整授权器。

源码依据：
- [main/ipc.ts 相关依赖与隔离点，L133-L149](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts#L133-L149)
- [main/ipc.ts 审核会话过滤，L2670-L2710](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts#L2670-L2710)
- [review-private-file-access.ts，L1-L66](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review-private-file-access.ts#L1-L66)

## 3. 单文件档案

### 3.1 宿主入口与公共桥接

| 文件 | 职责与实际行为 | 入口/依赖与盘点结论 |
|---|---|---|
| [apps/electron/src/main/index.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts)（1,243 行） | Electron 生命周期、窗口、协议、启动流程。直接导入并安装四个审核 C11 能力。 | 是审核模块的宿主组合入口，不只是通用外壳。正常启动和降级启动的安装集合不同，见 A-01。 |
| [apps/electron/src/main/ipc.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts)（8,108 行） | 宿主通用 IPC、Agent/文件等公共能力；导入 registerReviewIpc，并在注册函数后段调用它。 | 审核业务已经从这个大文件拆出独立注册器，但宿主文件访问隔离和审核会话隔离仍位于这里。注册标志过早置位，见 A-01。 |
| [apps/electron/src/preload/index.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/preload/index.ts)（4,900 行） | 声明并实现 reviewAPI，方法映射到 REVIEW_IPC_CHANNELS；通过 contextBridge 暴露给主 frame。 | reviewAPI 占 L4555-L4898，共 339 行。与宿主 Preload 共用一个大文件，但 API 命名空间独立。 |
| [packages/shared/src/types/review.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/packages/shared/src/types/review.ts)（807 行） | 定义共享审核类型，并在 L486-L666 定义 REVIEW_IPC_CHANNELS。 | A 负责通道定义与调用契约对照；Case、Run、材料等业务数据类型的深入分析交由 G。 |

### 3.2 审核 IPC 与边界校验

| 文件 | 职责与实际行为 | 入口/依赖与盘点结论 |
|---|---|---|
| [review-ipc.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-ipc.ts)（1,471 行） | 注册 103 个直接 ipcMain.handle；涵盖旧式案卷、材料、模板、V2 业务命令、Pi、批量审核、申诉和部分 V3 功能。 | 是 transport registry 加业务协调器的混合体。大量 handler 自身包含验证、分支和业务逻辑；不同代接口并存。 |
| [ipc-sender-guard.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/ipc-sender-guard.ts)（35 行） | 验证 IPC sender 是否是当前有效主窗口的 webContents。 | 这是传输来源校验，不验证学校身份。审核 C0 校验器额外要求 senderFrame 为 mainFrame。 |
| [review-c0-authority.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-c0-authority.ts)（113 行） | 组合主窗口/主 frame 检查，生成本地 reviewer Principal，并把 Renderer 意图绑定为有 case/action 范围、requestId、revision、payloadHash 的授权命令。 | 不能把主窗口来源等同于学校或教师凭据；校方身份不得由 Renderer 自行声明。 |
| [review-ipc-actor-guard.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-ipc-actor-guard.ts)（45 行） | 将本地 reviewer / submitter 的 Actor 绑定为 Main 认可的身份，拒绝 Renderer 声称 school、teacher、system、agent 等身份。 | 这是业务操作者身份归一化器，不等同于 sender/frame 授权；调用方仍需正确组合传输边界。 |
| [review-storage-id.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-storage-id.ts)（17 行） | 统一验证 caseId、runId、nodeId 等路径片段，拒绝分隔符、相对路径、连续点和超长值。 | 作为存储路径安全边界；必须与实际目录解析和业务授权一起使用。 |
| [review-private-file-access.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review-private-file-access.ts)（66 行） | 阻止普通桌面 Agent 文件操作访问审核私有路径，检查真实路径与符号链接目标。 | 宿主集成层的隔离防线；没有在本范围中找到同名直接测试，需核对间接测试覆盖。 |

### 3.3 V3 独立安装器与跨模块接口

| 文件 | 职责与实际行为 | 正常启动情况与盘点结论 |
|---|---|---|
| [review-v3-main-author-plan-ipc.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts)（522 行） | 注册 AUTHOR_READ_LATEST_V3、B20_CANDIDATE_READ_V3、B20_NATIVE_REPICK_V3、UPGRADE_CANONICAL_PLAN_V3 四个通道；读取与写入授权槽位独立安装。 | 注册入口由 review-ipc.ts 调用。没有安装相应 Main authority 时按设计拒绝，见 A-02。 |
| [review-v3-main-local-author-workbench.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts)（91 行） | 安装本地作者工作台的读取授权，并注册 AUTHOR_SAVE_LOCAL_V3、AUTHOR_PREVIEW_LOCAL_V3、AUTHOR_FREEZE_LOCAL_V3。 | 由正常 bootstrap 调用。该安装器安装作者读取授权，不等同于安装正式 Plan 升版写入授权。 |
| [review-v3-main-local-product-intake.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts)（324 行） | 注册五个材料/路由通道：当前读取、中断、T02 暂存清单、未匹配草稿和手动选择。依赖原生 Case、物理原件校验、B2 暂存、B30 当前材料与 B3 路由。 | 由正常 bootstrap 调用。代码声明结果是 candidate-only，不应凭此产生 Run、学校确认或第二份持久化 Case。未找到同名直接测试，直接接线覆盖需补核。 |
| [review-v3-main-d4-local-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts)（129 行） | 注册 LOCAL_D4_LIST_V3 和 LOCAL_D4_ATTACH_PLAN_V3；读取 D4 目录候选，并将选定技术方案绑定到符合条件的原生草稿案卷。 | 由正常 bootstrap 调用。对应测试验证 50 套候选及真实入口的非零 checks。 |
| [review-v3-main-b1-local-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts)（152 行） | 注册 LOCAL_B1_ATTACH_PLAN_V3；要求原生草稿案卷、冻结 B1 候选、版本和指纹一致，再把候选映射为技术计划。 | 由正常 bootstrap 调用。本范围未找到同名直接测试，需继续核对实际 UI 调用与跨模块测试。 |
| [review-v3-main-b20-physical-composition.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.ts)（219 行） | 组合物理 B20 来源与 Main 授权，安装可信候选读取依赖。 | 不在 main/index.ts 显式调用的四个正常启动安装器中。专用测试可以手动安装它；正常产品启动是否有其他组合入口尚待全仓交叉确认。 |
| [review-v3-main-template-plan-bridge.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts)（211 行） | 将已发布模板、有效规则和案卷目标转换为可编译的审核计划；不是独立 IPC 注册器。 | 作为 TEMPLATE_RULE_RUN_V3 下游的跨模块适配层。计划编译规则的详细审查交由 C/D。 |

### 3.4 相关测试档案

| 测试文件 | 已核对的覆盖意图 | 限制 |
|---|---|---|
| [ipc-sender-guard.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/ipc-sender-guard.test.ts) | 当前主窗口、辅助窗口和销毁 sender 的判定。 | 测试独立 guard，不覆盖完整应用启动。 |
| [review-c0-ipc.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-c0-ipc.test.ts) | 四个 C0 Main 写入边界；伪造校方/教师命令、幂等、payload 冲突、旧 revision、范围与 sender 拒绝。 | 使用合成 IPC handler harness，不是完整 Electron 应用启动测试。 |
| [review-ipc-actor-guard.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-ipc-actor-guard.test.ts) | 拒绝 Renderer 伪造系统、Agent、校方、教师等身份；本地 submitter/reviewer 身份绑定。 | 只验证身份归一化函数。 |
| [review-ipc-path.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-ipc-path.test.ts) | 通过注册后的 V2 IPC 输入恶意 caseId/runId，验证不在配置目录外创建文件。 | 合成 handler harness；覆盖的只是所选路径。 |
| [review-storage-id.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-storage-id.test.ts) | Case、Run、节点产物、Pi 材料目录、报告导出与批次路径 ID 的安全检查。 | 是存储边界测试，不证明每个 IPC handler 都使用了它。 |
| [review-v3-main-author-plan-ipc.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts) | 未安装 authority 时 fail-closed；读写授权独立安装；owner、frame、revision、授权撤销、CAS 和人工移除确认约束。 | 大量测试通过合成 handler 注册与依赖注入完成；不等同于 main/index.ts 的启动接线验收。 |
| [review-v3-main-b20-electron-ipc.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b20-electron-ipc.test.ts) | B20 通道已注册；缺少物理可信来源时默认拒绝；验证主身份、owner 轮换与授权撤销。 | 证明 fail-closed 行为，不证明正式启动已经安装物理来源。 |
| [review-v3-main-b20-physical-composition.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.test.ts) | 真实原件、ZIP CRC、来源台账、原生重选、B1 版本与 Main owner 授权的组合行为。 | 测试主动安装组合依赖；与正常 bootstrap 是否安装仍需分开判断。 |
| [review-v3-main-d4-local-plan.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts) | 50/50 候选目录、冻结选择、单候选损坏隔离、真实 IPC 入口绑定非零 checks。 | 对 D4 路径覆盖较直接；不覆盖整个产品流程。 |
| [review-v3-main-template-plan-bridge.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.test.ts) | 模板约束编译、未知值 pending、材料缺失、规则算子与未确认约束。 | 主要验证计划适配与编译行为，不覆盖 IPC 到 Run 的完整集成。 |

## 4. 发现与待办

### A-01｜启动降级路径与正常安装路径不一致

**状态：源码已证实；影响范围需由启动故障场景进一步验证。**

正常 bootstrap 在 registerIpcHandlers() 后安装四个 C11 能力。handleBootstrapFailure() 只调用 registerIpcHandlers() 和 createWindow()，不安装这些 C11 能力。

此外，registerIpcHandlers() 在开始注册时就把 _ipcHandlersRegistered 置为 true，而审核注册器位于约第 6245 行。若注册过程在到达审核注册器前异常，降级路径再次调用 registerIpcHandlers() 会因标志而直接跳过；若某个 C11 安装器中途抛错，降级路径也不会补装剩余安装器。

依据：
- [正常启动，main/index.ts L912-L920](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts#L912-L920)
- [降级启动，main/index.ts L1153-L1177](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts#L1153-L1177)
- [注册标志提前置位，main/ipc.ts L1328-L1338](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/ipc.ts#L1328-L1338)

建议后续由主协调者裁决启动器是否需要统一安装清单、失败回滚或逐安装器隔离。A 阶段不改生产代码。

### A-02｜部分 V3 处理器注册与其可信依赖安装是两个独立步骤

**状态：fail-closed 设计已证实；正常产品组合是否缺少安装器需交叉确认。**

review-v3-main-author-plan-ipc.ts 注册 B20 候选读取、原生重选和正式 Plan 升版通道，但其实现依赖独立安装的可信 Main authority。main/index.ts 明确调用的四个 C11 安装器中，没有 B20 物理来源组合器，也没有显式的 Plan 升版写入 authority 安装器。

现有测试验证了未安装 authority 时的拒绝行为，例如 INDEPENDENT_AUTHORITIES_NOT_INSTALLED 和 B20_TRUSTED_SOURCE_NOT_INSTALLED。它们证明默认拒绝是有意设计，不能据此认定这些功能已经在正常产品启动时可用。

依据：
- [Main 通道注册，review-v3-main-author-plan-ipc.ts L516-L520](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts#L516-L520)
- [四个正常启动安装器，main/index.ts L916-L919](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/index.ts#L916-L919)
- [未安装 authority 的拒绝测试，author-plan IPC test L183-L195](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts#L183-L195)
- [B20 缺少可信来源时默认拒绝，B20 IPC test L77-L84](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b20-electron-ipc.test.ts#L77-L84)

后续需要在全仓引用和实际启动组合中核实：哪些 authority 只是测试安装，哪些已经有正式产品安装入口，哪些功能应继续保持禁用。

### A-03｜三代 IPC 合同仍同时对 Renderer 暴露

**状态：已证实。**

REVIEW_IPC_CHANNELS 仍同时包含 review:、review-v2: 和 review-v3: 通道；reviewAPI 同时提供无版本后缀方法、V2 方法和 V3 方法。当前可确认它们不是只有类型残留：对应的旧式处理器、V2 处理器、V3 处理器和独立安装器均有实际注册代码。

这不自动意味着所有路径都应立即删除。下一步应与 B、D、F 一起逐条确认：旧通道仍由哪些页面或业务流程调用、是否只服务历史案卷、是否存在绕过原生 Case/统一 Run 的写入路径。

### A-04｜主窗口/操作者校验的使用并不统一

**状态：静态覆盖差异已证实；是否构成安全缺陷需逐路由判断。**

新原生 Case 和部分 V3 写入明确调用 assertC0ReviewMainSender；C0 命令再绑定 Main 派生的 Principal、case/action 范围和 revision。另有 bindLocalReviewerCommand / bindLocalSubmitterCommand 用于旧业务命令的 Actor 归一化。

静态扫描 103 个 review-ipc.ts 直接 handler 时，有 58 个 handler 代码块内没有直接出现 assertC0ReviewMainSender、assertMainWindowSender 或本地 Actor binder。这个数字只表示显式调用分布，不能单独证明漏洞：部分只读接口、参数校验或下游服务可能另有约束。

应优先逐条复核的示例包括 UPDATE_RULE_OUTLINE、CONFIRM_RULE_PACK、模板发布/归档操作、MIGRATE_CASE_V2、批次操作，以及旧 RUN_REVIEW 入口。重点记录每个通道的 sender/frame 来源、权限、输入验证和实际写入副作用，而不是机械地给所有路由加同一种 guard。

### A-05｜两个共享通道常量可能已经失去接线

**状态：当前 A 接线范围未找到对应 handler 或 Preload 方法；待全仓引用确认。**

- ENSURE_INITIAL_TASK_V2（review-v2:ensure-initial-task）
- SUBMIT_APPEAL_V2（review-v2:submit-appeal）

它们仍定义在 REVIEW_IPC_CHANNELS 中，但没有出现在 reviewAPI 的通道引用清单，也没有出现在当前审核注册器和已检查的独立安装器中。删除前需检查全仓字符串引用与历史兼容用途，确认它们确实是孤立常量。

### A-06｜演示/fixture 操作需要明确产品边界

**状态：通道已暴露；用途与构建门槛需确认。**

SEED_FIXTURE_V2 和 D4_DEMO_PUBLISH_V3 都在共享通道与 reviewAPI 中出现，处理器也有注册。IMPORT_DOCUMENT_FROM_PATH 则明确检查 app.isPackaged，正式构建拒绝路径直导。

后续应确认 fixture seeding 与 demo template publish 是否也应只在开发/验收构建开放，还是作为正式产品的受控功能保留。当前只记录暴露路径，不预判为缺陷。

### A-07｜测试证明了不少边界，但尚不能代替实际启动集成验收

**状态：已证实。**

现有测试覆盖 sender guard、Actor 伪造、路径穿越、Case/Run ID、Main authority 撤销、B20 物理来源和 D4 候选计划等关键行为。多项测试使用合成 ipcMain handler map 或手动安装 authority；这适合验证模块契约，但不能自动证明 main/index.ts 的正常启动和降级启动安装集合一致。

本轮未运行测试，也没有修改任何代码。下一步由主协调者决定是否需要针对启动安装矩阵补一个精确的集成验证；无需因此运行全仓 CI。

## 5. 需要其他分工接手的交叉问题

- **B（案卷与持久化）**：逐一确认无版本后缀接口和 V2 接口是否仍写入真实业务数据，哪些旧入口只服务兼容投影。
- **C（模板与路由）**：核实模板发布、候选草稿、兜底模板、D4/B1 方案与各 IPC 通道之间的实际关系。
- **D（执行与 Pi）**：从 RUN_REVIEW、RUN_REVIEW_V2、TEMPLATE_RULE_RUN_V3 和后台 Pi 入口分别追踪到实际执行器，确认是否存在多套执行入口或未接入路径。
- **E（批量审核）**：核对批次创建、自动处理、分组办理和重试接口的 Main sender/授权校验与单案业务事务复用情况。
- **F（前端）**：逐一追踪 reviewAPI 的实际调用者，区分当前页面路径、兼容页面和未使用 API。
- **G（共享契约与测试）**：核对 121 个通道常量、Preload 方法、Main handler、共享类型与测试之间的完整映射，最终确认两个孤立常量是否可清理。

## 6. A 阶段交付状态

- 已固定并使用同一个基线 SHA。
- 已建立 A 负责范围的单文件清单，覆盖 17 个实现/契约文件和 10 个相关测试文件。
- 已核对应用启动、审核 IPC 注册、Preload API、共享通道、专用 V3 安装器和关键权限/路径边界。
- 已记录可直接复核的调用链、通道数量、启动路径差异、默认拒绝的授权依赖，以及需其他分工确认的交叉问题。
- 本轮为只读审查；没有改动生产代码，没有运行测试或 CI。
- 本报告是 A 的模块盘点成果，不等于全仓 CODEBASE-MAP.md，也不替代总协调者后续的统一架构裁决。
