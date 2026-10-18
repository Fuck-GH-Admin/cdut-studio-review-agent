# D4 P1-C｜D4-C10-01 双击建案误报修复与最小实机复验（2026-10-18）

> 本文档是修复候选及执行依据，**不宣称修复已获 GUI 验收**。原始 FAIL 保留在 [PR #111](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/111)；原产品候选 [PR #109](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/109) 仍保持 Draft。

## 原始故障与事实

- 验收版本：`4dce31f4792a188e969c0bdbedd844620a82aaf6`。
- 原始证据：`audit/d4-p1c-gui-r01/REPORT.md`、`verification.json`、`evidence/logs/electron-retry.log`、`evidence/readback/c10-main-ipc-readback.json`（原始证据都属于 #111，不在本修复分支修改）。
- C-01～C-09 在约定范围内通过：Electron Xvfb 原生选文件、20s 模板推荐与覆盖、固定 D2 2 个 Subject、真实原件 SHA256 一致、1 application、0 EvidenceLink、0 Run。
- C-10 FAIL `D4-C10-01`：真实 UI 双击创建后第一个建案和原件导入成功；第二个 `CREATE_CASE` 被 Main 拒绝 `D4_INTAKE_TOKEN_INVALID`，造成误导性“新建案卷失败”错误提示。实际只有一个 case 和一份文件。Main 的一次性令牌拒绝是**正确行为**，不得删除或放宽。

## 定向修复范围

- `apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx`：通过同步 `submitLock.current.acquire()` 在任何异步调用及 React `setSubmitting` 之前拒绝重复事件；`finally` 和对话框重新打开时释放锁；保留原先状态控制、禁用按钮和错误提示机制。
- `review-case-submit-lock.ts`：小型无副作用的同步单次执行锁，绝不向 Renderer 赋予 Main 来源/审批权限。
- `review-case-submit-lock.test.ts`：同事件轮次双次提交仅发生一次业务请求、一次文件导入，失败后释放允许用户主动重试，以及 token 语义仍交由 Main 判断。
- Electron patch + CHANGELOG 更新。**没有修改** `review-d4-client.ts`、`review-d4-intake.ts`、IPC/Preload、审核工具/SourceRef、冻结模板、Gold 或 P06。
- 修复作用域只对应 `D4-C10-01`。禁止把代码层绿色回归当作真实 Xvfb 复验通过。

## 本机 Agent 须执行的最小真实复验

1. 读取并冻结本修复 Draft PR 的**真实最新 HEAD**、base PR #109 的固定 `4dce31f4792a188e969c0bdbedd844620a82aaf6` 和当前 CI 状态。建立独立测试 worktree 和新的隔离 profile，禁止污染 #109、#111、main。不得重复之前 C-01～C-09 的全部流程，除非出现新增错误。
2. 仿照 #111 原始场景：新 Xvfb/Electron 真实窗口，原生 GTK 系统文件选择框选合成 `公共教学教室借用申请.md`，选择 g03-t01，填写一对象和申请人，手动确认；使用真实鼠标或 CDP 事件**快速双击“创建项目”**（还应补一个 Enter+点击的竞态场景）。
3. 断言：只有一条请求能进入 Main 的建案接口；只出现一个成功的新案卷、一个 application 原件，Source 文本与输入文件 SHA256 一致，D2 Plan 独立 Subject 与 fingerprint 不空、0 Pi Run、0 EvidenceLink、`publicationAllowed=false`。
4. GUI 必须没有虚假的红色“新建案卷失败”Toast，也不能重复产生两个案卷。Main 的无权限/已失效 token 手动重放应仍 `D4_INTAKE_TOKEN_INVALID`；如本地安全条件不允许独立手动重放，则保留原 #111 证据并标 `NOT_RUN`，**不可声称这轮重测过**。
5. 用户创建后 Ctrl+R：案卷和原件保持，未重复导入。对于纯表单校验失败，检查会释放锁并允许用户再次确认创建（允许使用普通非法表单输入验证，不得调用真实校务）。
6. 保留原始截图/录屏、受控 Main IPC 只读回执、关键环境值、源码 SHA、命令退出码、错误日志、原件与落盘哈希和 SHA256SUMS。可以另建 `audit/d4-p1c-c10-retest-r01` 并在本修复分支上开 docs-only Draft PR；不要回写 #111 首败。
7. 终审判词：`C10_PASS` / `C10_FAIL` / `BLOCKED_ENV`，需逐点标 `GUI_OBSERVED`、`IPC_READBACK`、`CI` 与 `NOT_RUN`。若 C10_PASS 并确认无 P1-C 新回归，才可建议 P1-C 进入 P2；不能宣布学校审批/在线模型/P06 通过。

## 门禁与依赖

- 全部 CI 按**当前代码 HEAD**查：typecheck、Electron Main/Preload/Renderer build、全仓单测、D4 50 候选一致性、D2/D3/COMMON。
- 本修复 PR base 应为 `feat/d4-p1c-intake-routing-r01`，禁止覆盖原 #109 的历史 HEAD。
- P1-C 仍为 `candidate-held`、`technical-pre-review`，不能自动设置场景或代替用户确认。
