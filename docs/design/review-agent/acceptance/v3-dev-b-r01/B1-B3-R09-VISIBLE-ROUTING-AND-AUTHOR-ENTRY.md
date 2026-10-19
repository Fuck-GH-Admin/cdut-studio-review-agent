# Dev-B B1+B3-R09｜20 秒保守路由可见界面与第 51 套自建业务入口

**工程身份**：CDUT Studio Review V3 `V3-DEV-B-R01`，原 Draft PR #142、B 自有分支 `feat/v3-dev-b-template-intake-r01`。本批是实质产品能力开发（Main-only 技术服务 + Renderer UI + 正反例），不是开启一轮新的研究，也不是 C-owned 正式 Main/案卷接线。

## 1. 准入 / 上游冻结 / 安全边界

- 基准：C0 `review-c0/1` `5682057c7232c914e72fdae525ce95fd33f32b53`，本批 B 起点 `b26ac6fe87e801e6d10d11d2020570f07f1f844b`。代码检查点 `75891ea793d3d4ba58ccec1f6d6cfbc73a0040f5`；后续文档提交会改变当前 HEAD，Gate O 必须针对最终精确 SHA 重验。
- Dev-C #145 `B-CR-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`。B1/B3 可提供保守技术候选、UI 和安全适配器，但无法发布校方政策、验证学校 Gold、签发 Principal、修改 Main IPC/Preload，也不允许写 CurrentCase/Run/Decision/Batch/Outbox。
- I1 PR #147 原有冻结 B 原件 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 不可因 B 最新提交自动漂移；须等本批 Gate O 真实验收与 C 独立锁定新 B slice。
- 本轮没有把路由器变成不透明模型分类器，也没有伪造文件来源、人员身份或学校政策。已有 B4 的 50 套仍全部 `candidate-held`；`authorized-for-technical-selection` 也**不是**已获学校正式发布授权。

## 2. 实际新代码

| 范围 | B 自有文件 | 交付与不变量 |
|---|---|---|
| Main 技术会话 | `review-intake-routing-adapter-v3-b3.ts` | 新 `ReviewB3OwnerBoundRouteSession`：时间由 Main 调用时钟提供，不接受 Renderer 的倒计时起点；所有候选逐条由 B2 当前 `getCandidate(ctx,id)` 重取并核对 physical/version/SHA/owner/generation/role/Subject；换来源或目录版本/建议证据重新计 20s；手动选择必须属于当前 Main supplied technical catalog 且不处于 candidate-held；跨 frame/owner/session 混用拒绝；手动中断不可被一次刷新静默抹去；始终输出 `B3RouteState` 而非 C 建案命令。 |
| Main 负例 | `review-intake-routing-adapter-v3-b3.test.ts` | 在原保守技术路由测试外，新增真实 B2 staged bytes 正反例：伪证据、错误 Subject/role/version、目录不授权、owner revoke、计时过期/刷新变化、窗口变更、时钟回退、重复目录。 |
| Renderer 只读展示 | `review-v3-route-view.ts` + `*.test.ts` | 区分可技术选择/未获得技术选择资格的模板；显示 Main 计算倒计时，严格版本候选可见性；Renderer 不推断学校发布权限。 |
| Renderer 产品表面 | `ReviewV3CandidateIntakeSurface.tsx` | 独立材料业务类型确认、主进程驱动轮询倒计时、手动停用自动建议、人工选模板并向外传 `proposalOnly: true`、候选不可选提示；从“没有匹配模板”切入 B1 `ReviewV3AuthorWizard`，能返回候选路由；切案/新 session 使用 scope-key 重新挂载，避免前一个案卷的作者表单/路由下拉状态沿用。 |
| UI 快照核验 | `ReviewV3CandidateIntakeSurface.test.tsx` | React SSR 提交的静态可见性检查：倒计时、停用按钮、候选目录、技术非建案提示，以及 B1+B3 联合入口。注意 SSR 不等于真实 Electron 点击/IME/UAT。 |

**设计选择**：Renderer 依赖 Main 已核验的 `B3RouteState`，其自身不会在 20 秒到期时自作主张选择模板或创建 Case；在 countdown 时每 500ms 调 `onRequestRefresh` 请求 Main 重算。用户手动选择发往 `onManualChoice` 的是明确 `B3TechnicalChoice {proposalOnly:true, caseCandidateId, sessionKey, templateId,templateVersion}`，其中 Renderer 所附 case/session 仅为**待验证的关联输入**，不视作授权。真正 Case/Plan/材料写入仍须 C Main 依据真实 sender/frame/owner/session/source 重新验证并持久 Receipt。

## 3. 集成合同（交 C/I 执行但未越权接线）

1. C 负责从真实 Main `IpcMainEvent.sender/senderFrame`、窗口 owner/session 与原始物理材料派生 `B2MainContext`，保持按案隔离的 B3 Session。绝不把 Renderer 自称 `ownerId`、物理键或计时起点注入此类；同案候选集合/可信 catalog 变更，Main 须推送新 `B3RouteState`。
2. I 的技术只读胶水可把 C 授权提供的 B2 stage → B3 session → 独立 B1 candidate-held 编辑窗拼接验证，但**未获**在正式 `review-ipc.ts`/Preload 写 handler 租约，不能利用本组件私自打通共享通道。
3. C 对正式建案/选择模板的唯一业务写口执行模板当前授权、案卷 CAS revision、当前 Owner、物理文件版本、Subject/role、已发布政策 provenance 与 durable Receipt 验证。B3 `default-selected` 和 `manually-selected` 都不是业务 ACK；B1 自建冻结结果也仅 `publicationAllowed=false`。
4. 候选 Held 的模板仍可在 UI 展示“资格不足”提示，但不能进入技术可选择列表。B1 第 51 套技术合成样本可以创建候选，但 5 人×30 分钟真实无代码 UAT 仍须 C 真实工作台 Main/Preload 接线后独立进行。

## 4. 必须集中保留的验收门禁

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts
bun test apps/electron/src/renderer/components/review-v3-dev-b/review-v3-route-view.test.ts apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.test.tsx
bun test apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-edit.test.ts apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-trial.test.ts
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:renderer
```

- **Gate O**：上述代码均已实际提交，但当前没有精确源码/文档同 SHA 的完整 CI 成功证据。需锁定最终 HEAD 的 PR CI、Review Baseline、D2，并归档 step+exit+first failure；别把 #142 旧绿切片或新测试定义记成 PASS。
- **Gate E**：`NOT_RUN`。真实 Electron Main window / Renderer，500ms 定时刷新、20s 到点、手工覆盖、异步 late response/切案、Owner revoke、主窗口关闭/重开、中文 IME、键盘可访问性、C10 双击；与 B2 ZIP/Office71/100案500文件并入集中验收。
- **Gate L**：`BLOCKED_NO_AUTH`。校方真实制度原文、版本/ACL/签发人和独立 Gold 未就绪，且 50 套现全部 candidate-held。
- **Gate P**：`PARTIAL`。第51套五人×30分钟独立无代码真实 UI UAT 未执行；原文 12/50 字节复核、38 无对象、G01 34 Scope UNKNOWN、来源 4,163 applicability unknown 保留。B1/B3 新界面不等于 B4 业务核查完成。

## 5. 后续产品进度

- 本轮不继续对 B2 做新低层加固；优先让已具备可视操作形态的 B1/B3 获得 C/I 安全接线资格。
- 根据新 CI 首败先修 B 自有源码；再由 I 提交独立锁定来源、C 审查后的只读技术桥接。没有 C 正式 handler 租约时可保留专用候选界面与离线业务演练，不能伪称主窗口已使用。
- 在目标机做真正五人无代码第51套；G01–G08 原文/Scope/Gold 独立补证不应变成等待整个 B 完成后才允许 I 接成熟切片的串行堵点。
