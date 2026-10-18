# D4-C10-01｜R02 Renderer 生命周期修复工程记录（2026-10-18）

## 结论与范围

- 代码基线：PR #120，固定 `026cfe0f4905bf10f46291bdd7451788c60df5f9`。
- 原始实机 FAIL：PR #122，`dbbc481aa5c0909adb0e3f06e818dc92bd35e5a2`，保留不改。
- 交接输入：PR #123，docs-only；不用于生产代码父版本。
- 独立修复分支：`fix/d4-p1c-c10-lifecycle-r02`；Draft PR #124。
- 生产修复提交：`d5724e2450bc2667bfa5a60dbd82c2a17550487b`（锁生命周期），`dca91678c2b46231a99599e586637b1b3e6fca16`（实际 CreateCaseDialog 接线）。
- 初始失败回归提交：`5352ef29155a27357ea10092764a726028c72fd1`。
- **状态**：`CODE_CI_PASS`（以下固定代码提交）；`GUI_C10_NOT_RUN/BLOCKED_ENV`（当前 Agent 无仓库克隆网络/Bun/Electron GUI）；`MODEL_NOT_RUN`；`P06_NOT_RUN`；`RELEASE_GATE=HELD`。

## 独立根因核验

#122 在 40ms 真实鼠标双击后记录首次 Main 建案成功并导入 40B application，随后第二次 `review:create-case` 拒绝 `D4_INTAKE_TOKEN_INVALID`，且 GUI 同时出现成功和“新建案卷失败”。只读 Main IPC 恰好 1 case、1 application、1 Subject、52 Rule；八条件 unknown、`publicationAllowed=false`、0 EvidenceLink、0 Pi Run；来源文件和存储副本 SHA256 一致。Enter+click 的已插桩路径未触发双请求。

对 #120 源码静态复核发现 `CreateCaseDialog.handleSubmit` 在首次成功后 `onOpenChange(false)`，随后无条件 `finally.release()`：成功 Promise settled 到 Dialog 真正关闭前存在重复建案入口。Main 的一次性 token 行为正确，不应修改。由于历史证据没有 lock acquire/release 微时序打点，**该具体释放次序是由源码证实的可达竞态机制，不把它夸称为历史 GUI 日志已直接记录的锁时序**。

## RED → GREEN

- RED: PR CI [#39134864981](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39134864981)，commit `5352ef2`，typecheck 失败 exit 2；新增测试找不到 `runReviewCaseSubmission`、`openSession`、`closeSession`。**这是缺失生命周期合同的编译 RED，不是已在测试容器跑出第二次 Main IPC 的运行时 RED；后者的独立真实证据来自 #122。**
- GREEN: PR CI [#39135027090](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39135027090)，commit `dca91678c2b46231a99599e586637b1b3e6fca16`，**SUCCESS，3751 PASS / 6 SKIP / 0 FAIL**。Typecheck、package boundaries、skin contract、Main/Preload/Renderer build、全仓测试均成功。
- 本轮新增 6 个生命周期驱动器测试：pending 连点；成功 Promise resolved 但 parent 尚未 commit close；null/抛错后修正重试；关闭中异步回包+重开隔离；Enter+click；无 D4 暂存的旧模板建案。测试调用的 `runReviewCaseSubmission` 就是 CreateCaseDialog 实际 form handler 的公共提交驱动器，不是复制另一份虚构锁。
- **测试限制**：新增自动测试不是 mounted React/真实鼠标事件或 Electron GUI 测试；仍须执行独立 C10 GUI 短程复验。CI full suite 已包含现有 D2/D3/COMMON 测试，但本 Agent **未单独执行新的 scoped workflow runs**；正式分项复验记录应追加对应 run IDs，不能挪用 #120 的结果。

## 实际变更及安全边界

1. `review-case-submit-lock.ts`：对话框会话标识+状态：idle / submitting / succeeded-awaiting-close / closed；成功锁保持到真正新开会话；失败解锁；close/reopen invalidate 旧 Promise；提供实际提交驱动器。
2. `CreateCaseDialog.tsx`：实际鼠标和 Enter 共用同步 guard；toast/close 发生前就标记成功，立即关闭 admission；失败 unlock 允许编辑重试；取消/ESC 关闭失效化旧回调；只在新 open effect 时复位。
3. `review-case-submit-lifecycle.test.ts`：以上六条正反例。
4. Main 的 `claimD4Intake`、`releaseD4Intake`、IPC、D2 Plan、P2 prompt、Gold、P06 和模板文件均未改变；不取消非法 token 的真实拒绝/失败提示。

## 后续独立签署门槛

完整执行同目录 `P1-C-C10-R02-LOCAL-GUI-RETEST-TASK-20261018.md`。验收者从 #124 最终固定 HEAD 独立 worktree 开始，保存可视截图、可信事件日志、Main CREATE_CASE 计数与错误、只读 IPC、来源与副本 SHA256、重载，以及 Main 非法 token 正反例，并单独签署 C10 GUI 结论。未签署前保持 P1-C GUI BLOCKED；P2 离线历史 PASS 不等于在线模型通过。
