# D4 P1-C｜C10 快速建案重复提交：继任工程 Agent 任务书（2026-10-18）

> **必须实际修改代码、运行测试、提交独立分支及 Draft PR，之后组织一次最小真实 GUI 复验。** 这是 PR #122 统一独立验收后的新修复任务，不是旧 #112 任务的重新执行。请先完整读 `P1-P2-C10-SESSION-HANDOFF-20261018.md`，再核对 GitHub 上固定证据。

## 一、角色、目标和范围

你是 CDUT Studio D4 P1-C 的定向工程修复 Agent，唯一生产目标为消除已重复实机复现的 `D4-C10-01`：原生暂存材料的已确认 G03 案卷，在可视 Electron 中 **40ms 快速双击“创建项目”** 后，Main 实际创建 1 case + 1 document，但 Renderer 又发出第二个 `CREATE_CASE`，导致成功 Toast 与 `D4_INTAKE_TOKEN_INVALID` 错误 Toast 并存。

**验收必须同时满足**：(1) 一次明确的用户提交最多启动一次 Main create；(2) 不出现成功后虚假失败；(3) 首次创建案卷、application 原件和 D2 Plan 完整；(4) 失败修正后可重试，重新打开真正的新对话框可建另一案；(5) Main 对真实非法 token/replay 依旧拒绝。不得为隐藏红 Toast 而吞掉真正的 IPC 拒绝或放宽一次性令牌校验。

本轮不再重做 P2-A/B/C 功能，不做 50 套业务研究，不动校规 Gold、审核引擎授权、P06、Provider、后台 owner，也不自行合并 main。

## 二、固定父版本与先读材料

仓库：<https://github.com/Fuck-GH-Admin/cdut-studio-review-agent>

- **唯一生产代码父版本**：Draft [PR #120](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/120)，`026cfe0f4905bf10f46291bdd7451788c60df5f9`，分支 `feat/d4-p2c-submit-repair-feedback-r01`；若远端移动，先记录差异、不可静默跟随。
- 新的独立验收失败档案：Draft [PR #122](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/122)，`dbbc481aa5c0909adb0e3f06e818dc92bd35e5a2`，目录 `audit/d4-p1p2-batched-r01/`；**证据分支不是代码父版本**。
- 老失败 #111：`56d2492cd1d8c3559d55de28ab7383948df394f8`；老同步锁尝试 #112：`2e24e0c9a24d378a5b7f2e160c81c03041a2859c`；修复后仍 GUI FAIL，须保持历史。
- #120 通过 [PR CI #39128291306](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39128291306) 3745 PASS / 6 SKIP / 0 FAIL。**CI PASS 不替代独立 GUI PASS**。
- 必读 #122 `REPORT.md`、`verification.json`、`evidence/logs/mouse-doubleclick-dispatch.json`、`evidence/logs/electron-120.log`、`evidence/logs/after-mouse-doubleclick-ui.json`、`evidence/readback/after-mouse-doubleclick-main-ipc.json`、`evidence/logs/enter-click-dispatch-instrumented-result.json`。
- 关键源码：`apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx`、`review-case-submit-lock.ts` / `.test.ts`、`review-actions-controller.ts`；只读查看 `apps/electron/src/main/lib/review/review-ipc.ts`、`review-d4-intake.ts`、`review-d4-client.ts`。

## 三、先证伪/证实根因，不允许直接猜测性补丁

已证实：两次 Main IPC；第二次被一次性 token 正确拒绝；真实 GUI 双 Toast；仅一份原件落盘。尚未证实：React 组件具体在哪两个事件之间 `acquire/release`。

首要怀疑：`CreateCaseDialog.handleSubmit` 当前在提交成功后 `onOpenChange(false)`，但 `finally` **无条件** `submitLock.current.release()`、`setSubmitting(false)`；新一轮 click 若落在关闭过渡阶段可能再次提交。前版测试只验证 Promise pending 时的重复提交，**没有模拟 Promise 已成功 resolve 且对话框尚未关闭时第二次 submit**。

1. 检查组件生命周期、close/update state 时序、onCreate 的 Promise 和 selectionGeneration 行为；确认组件是否因 Dialog 动画、父组件 props 或业务刷新重挂载。
2. 建立 **RED 回归**：一次提交启动；同步重提必须被拦截；模拟 `onCreate` resolve 为成功案卷后、尚未发生 `open=false` 确认前再次 submit 也不得发第二次请求。必要时在测试环境只记录不含个人数据的 eventType、attemptId、lockPhase、create-start/resolve、open-transition。
3. 再验证失败 `onCreate=null` 或抛错后可重试、新建对话框再次打开重置成功态；模拟 Enter+Click 与连续真实 Mouse click 两种路径。**优先组件级测试**，不能仅靠孤立 `createReviewCaseSubmitLock` 的纯函数单测证明 React lifecycle。
4. 若实测推翻“finally 释放过早”假设，按同等证据逐项排查重新挂载、外部父组件重复调用或 Main IPC 入口；以最小差异修改，报告真实归因，禁止增加无必要的巨大框架。

## 四、最小且兼容的修复标准

- 建议采用明确的每次对话框建案生命周期，例如 `idle → submitting → succeeded-awaiting-close`；或者等价可测试状态。**成功后在当前 dialog 生命周期保持 single-flight 锁，不因 Promise settled 就恢复可提交**；真实新会话打开时才复位。
- **失败**（Main/网络实际拒绝）要解除锁并允许用户修改字段后再次主动提交，不丢失当前安全暂存状态；**成功**不因关闭动画短暂仍可收到 click 而再次调用 `onCreate`。
- 取消/ESC/外部关闭、关闭后立即重开、提交中窗口关闭、异步回调晚到、StrictMode/re-render 等容易造成 stale handler 的情况必须明确处理；若边界因本轮未执行标 `NOT_RUN`，不得宣称覆盖。
- 按已有 Promise 与组件单次创建合同决定是否需要 Main 幂等 API。除非明确证明 UI 层无法完整修复并得到正式设计证据，**严禁**在本轮改 Main token 校验、放宽 `D4_INTAKE_TOKEN_INVALID`，或吞掉真实失败 Toast 让结果显得通过。
- 非 D4 已发布模板路径必须保持原操作习惯；P1-C 20 秒模板采用/人工覆盖、对象和条件确认仍受限；P2 Prompt、Schema、Pi 回执、SourceRef、EvidenceLink 不变化。
- 保持 `candidate-held`、`publicationAllowed=false`、D2 Plan fingerprint、原件 SHA、逐 Subject unknown。不会自动启动 Pi。

## 五、开发和自动化回归门禁

1. 从固定 `026cfe0f4905bf10f46291bdd7451788c60df5f9` 用独立 Git worktree 创建 `fix/d4-p1c-c10-lifecycle-r02`（如重名可加时间后缀）；不修改 #120、#122、#112 任何历史分支。
2. **先补能证明旧实现失败的测试和红灯日志**，再最小修复，保留红灯原始退出码与日志。若旧实现未 RED，说明测试没有捕捉真实缺陷，不能继续自报成功。
3. 增加组件生命周期测试 + 同步锁正反例：pending 连点、success 尚未关闭连点、failure 可重试、close/reopen、Enter+click、已发布模板；至少保障关键路径。
4. 运行本仓真实 `bun` typecheck、package boundaries、Main/Preload/Renderer build、C10 相关测试、全仓单测与 D2/D3/COMMON 专项 CI；录入新最终 HEAD SHA、run URL、pass/skip/fail。任何红灯修复再跑，不借用 #120 的旧 CI。
5. 仅在必要时更新 Electron patch/changelog，保持其他文件范围最小。GitHub 提交独立分支、Draft PR base **`feat/d4-p2c-submit-repair-feedback-r01`**，PR 包含问题复现、最小 diff、原始失败、最终 CI、剩余风险。

## 六、一次**最小**独立 Electron GUI 复验（与开发同轮交接，但结果须独立）

代码 CI 通过后，另一个独立 QA Agent 或隔离复验工作树检查新固定 HEAD，建议另开 docs-only `audit/d4-p1c-c10-r02` Draft PR，保留旧 #122 失败。

**只测下列必须项目，不重新开展全八域、在线 Pi 或 26+ 个无关回归：**

- Xvfb/真实 Electron，新的临时 profile 和 synthetic `公共教学教室借用申请.md`，用真实原生文件框授权 G03-T01，1 Subject，主场景 `p-public-classroom`，八条件 unknown，人工确认。
- **C10-A**：鼠标真实连续双击，间隔约 40ms；保存可信 pointer/click/submit 事件计数、Main CREATE_CASE 入口计数与后端日志、成功 Toast 和**不存在失败 Toast**的全屏截图。
- **C10-B**：Trusted Enter+click 两个 form-submit 事件；保证 Main CREATE_CASE 仅一次、同样没有虚假失败。
- **C10-C**：模拟一次真实失败后用户修改并重新提交；另开新对话框可以建立第二个不同名称的案卷；证明锁不是永久死锁。
- **C10-D**：每个成功案卷恰好 1 个 `application` 解析文件、1 Subject、D2 fingerprint、`publicationAllowed=false`、0 Pi Run / 0 EvidenceLink，源副本 SHA256 一致；Ctrl+R 后稳定、不重复。
- **C10-E**：无效/已消费 token 由 Main **仍明确拒绝**；不能靠 `catch` 全部静默吞错取巧。若手动跨 sender 重放不宜执行，则保留原有 Main 自动回归，标该 GUI 子项 `NOT_RUN`。

独立报告区分 `C10_GUI_PASS`、`C10_GUI_FAIL`、`BLOCKED_ENV`；证据为 read-only IPC + 事件与 IPC 日志 + Screenshots + SHA256SUMS。没有真实 GUI 不能签 `C10_GUI_PASS`。

## 七、最终交付格式及停止条件

- 输出修复 Draft PR URL、分支、父 SHA、最终 HEAD、变更文件、RED→GREEN 回归、完整 CI 与实际 GUI 独立验收 PR/报告 URL。
- 将原 #122 `GUI_FAIL` 保留；新报告签署成功后才能补充结论，不得覆写旧 PR。
- 给用户明确判断 **P1-C 是否解除 GUI 阻断、P2 离线是否仍通过、是否可准备受限技术集成**；模型 A/B 和 P06 仍属于独立外部门禁。
- 如果只能完成代码无法启动实机，也要提交完整可执行短程 QA 任务书，标 `CODE_CI_PASS / GUI_NOT_RUN`，不许宣布发布完成。
- 一旦 C10 小范围实机通过则停止继续添加功能，不扩大到 P2 新优化；等待用户下一阶段集成决策。

结论：下一会话的任务不是再次审核 #122，也不是复写整个 P1/P2，而是**对 #122 已证实的双击路径补准确回归、最小修复、独立重新签署 GUI**。
