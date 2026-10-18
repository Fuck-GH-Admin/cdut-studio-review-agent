# CDUT Studio D4｜P1-C / P2-A/B/C 统一验收后交接（2026-10-18）

> **本文件是当前会话的正式上下文交接，不是验收通过声明或修复提交。** 关联下一份执行任务书：`P1-C-C10-POST-ACCEPTANCE-FIX-TASK-20261018.md`。任何继任 Agent 先读取本文件与任务书，再到 GitHub 阅读原始报告/日志/代码；不得仅根据聊天摘要执行。

## 1. 本次交接的唯一目标与权限

- 当前任务：在不破坏 P1-C 真实建案、D2 不可变 Plan、Main 一次性材料令牌和 P2 现有优化的前提下，**修复 D4-C10-01 快速鼠标双击导致的成功 + 虚假失败 Toast**。
- 下一会话负责 **真实代码修改、正反回归、独立开发分支、提交、Draft PR、形成短程独立 GUI 复验接口/任务**；不能仅重写方案。
- 保持技术候选 `candidate-held` / `technical-pre-review`；不自行并入 main，不宣布校方正式授权；P06、在线 Provider、Gold、作者态五十模板和相关权限为其他独立工作流。
- 本次交接分支 **docs-only**，不包含生产修复。下一会话的修复分支应以 P2-C PR #120 固定生产 SHA 为代码父版本，**不是**本交接文档分支、PR #122 审计分支、PR #112 旧修复分支，更不得绕回 main。

## 2. 固定技术与证据版本链（截至交接时）

| 阶段 | PR | 固定 HEAD SHA | 已证实的状态 |
|---|---|---|---|
| P1-A/B 对象和三态 GUI | [#104](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/104) | `26a482c0a53813455166d74bd71c728b13a237e0` | 独立 #107 GUI/D2 scoped PASS |
| P1-C OS 文件暂存 / 20 秒候选路由 | [#109](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/109) | `4dce31f4792a188e969c0bdbedd844620a82aaf6` | 独立 #111 首次 C10 FAIL |
| C10 首轮同步提交锁补丁 | [#112](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/112) | `2e24e0c9a24d378a5b7f2e160c81c03041a2859c` | 3729 pass / 6 skip / 0 fail，但实机仍 FAIL |
| P2-A 规则/合同压缩 | [#117](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/117) | `ff1aa01670bbeeeba33aa0f01efdf4d8da87bb9e` | 3735 pass / 6 skip / 0 fail |
| P2-B 实际 Prompt 离线差分 | [#119](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/119) | `f54771806da2dc4e9942dbc038a0ebbc101b3b68` | 3740 pass / 6 skip / 0 fail |
| **P2-C 含此前全部代码的最终受测候选** | **[#120](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/120)** | **`026cfe0f4905bf10f46291bdd7451788c60df5f9`** | **3745 pass / 6 skip / 0 fail；不等于 GUI PASS** |
| 旧 P1-C 独立 GUI 证据 | [#111](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/111) | `56d2492cd1d8c3559d55de28ab7383948df394f8` | `PARTIAL` / C10 FAIL |
| **最新 P1/P2 统一独立验收证据** | **[#122](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/122)** | **`dbbc481aa5c0909adb0e3f06e818dc92bd35e5a2`** | **`PARTIAL`；A_GUI=GUI_FAIL，B_OFFLINE=OFFLINE_P2_PASS** |

- 所有相关 PR 仍为 Draft，不因本交接改变发布/合并权限。继任者开始工作前须重新读取远端 HEAD、PR 状态和并发代码差异，若 SHA 变化先停下来归因。
- #122 相对 #120 多三个审计提交、122 个新增/变更文件，**均在** `audit/d4-p1p2-batched-r01/`；不含产品代码改动。不得把 #122 当作已经修复的生产版本。
- #120 最终 [PR CI #39128291306](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39128291306) `SUCCESS`（3745 PASS / 6 SKIP / 0 FAIL），D2/D3-R1/D3-MD/COMMON/Baseline 专项全部 SUCCESS。

## 3. 验收实际做到了什么（必须保留的事实）

### 3.1 A_GUI：`GUI_FAIL`，问题严格限定为 C10 鼠标快速双击

测试环境：Electron 43.7.7 / Xvfb `:120`，1600×1000，独立 profile、无在线模型与真实 CDUT 登录。通过可视 GUI 和系统原生文件选择器选择**合成** `公共教学教室借用申请.md`，40 字节，SHA256 `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`。

- `g03-t01` 自动推荐：20 秒只自动采用模板，不自动填对象、条件或确认；用户手选 `g03-t02` 再等 21 秒保持，取消创建后案卷数为 0。
- **失败事件**：鼠标 40ms 间隔双击“创建项目”，真实 UI 同时出现“已创建审核项目”和“新建案卷失败”。Main 日志存在第二个 `review:create-case` 并拒绝 `D4_INTAKE_TOKEN_INVALID`。
- Main 只读 IPC 读回：**恰好 1 case + 1 parsed application (40B) + 1 Subject + 52 D2 Rule**；八项条件均 unknown；Plan fingerprint `0092f616f43f29ce9baf6830434e0fb22313c5206a7f2290e3b11183dea4e290`，`publicationAllowed=false`，0 EvidenceLink，0 Pi Run，原件/副本哈希相同。
- 实测的 Enter+click 和带 trusted keydown/pointer/click、两个 form-submit 事件插桩的另一次 Enter+click **没有**产生双请求或错误 Toast；这只是两种不同事件时序，不能掩盖鼠标双击失败。
- Ctrl+R 后测试产生的三个**不同名字**合成案卷、各一份 application、对应 Subject 与 Plan 均保持；三个案卷来源于分别执行三组测试，不是 C10 产生了三个重复案卷。
- 阶段正式裁定 `GUI_FAIL`、整体 `PARTIAL`、`RELEASE_GATE=BLOCKED_GUI_FAIL`。不能宣称 C10/P1-C 全部通过，也不能因最终没有重复数据就忽略虚假失败。

关键原始证据目录（均为 #122 的 `audit/d4-p1p2-batched-r01/` 下）：

- `REPORT.md` 与 `verification.json`：完整判词、固定环境与机器回执。
- `evidence/logs/mouse-doubleclick-dispatch.json`：双击事件输入（40ms）。
- `evidence/logs/electron-120.log`：成功导入后出现第二个 `CREATE_CASE` 和 `D4_INTAKE_TOKEN_INVALID`；`review-actions-controller.ts` 随后显示失败。
- `evidence/logs/after-mouse-doubleclick-ui.json` / `evidence/screenshots/32-mouse-doubleclick-result.png`：同屏成功及失败。
- `evidence/readback/after-mouse-doubleclick-main-ipc.json`：案卷、文档、D2 Plan、规则、所有八个 unknown 的只读证明。
- `evidence/logs/enter-click-dispatch-instrumented-result.json`：双 form-submit 的可信事件输入，结果无重复错误。
- `evidence/readback/source-and-copy.sha256` 与 `SHA256SUMS`：文件来源、证据完整性。

### 3.2 B_OFFLINE：`OFFLINE_P2_PASS`

- #112 与 #120 **同一 G08-T02 双 Subject 冻结合成输入**，实际调用 `preparePiReviewRunV2.userMessage` 形成两个真实 Prompt；比较程序 `PAIRED`，template/version、selectionHash、107 Rule IDs、107 Check IDs、requirementHash 一致。
- #112：128358 characters / 243080 UTF-8 bytes；#120：100816 characters / 183673 UTF-8 bytes；减少 **27542 字符（21.46%）/ 59407 字节**。
- 规则区 104849 → 79762 字符；映射区 17687 → 16419 字符；107 RuleSpec 引用 70 条完整、可重建的不同 requirement，未删除审核义务。
- 七份离线测试 26 PASS / 0 FAIL / 1980 assertions；另有 G08 Main 定向回归 12 PASS / 320 assertions；Runner 和对照 CLI 均最终退出码 0。
- 归档中部分早期 Runner 使用相同输出路径遇到 `EEXIST`（安全的 `wx` 防覆盖）；后续以独立结果文件成功重跑。**不是运行功能故障，不可隐瞒，也不能拿失败中途日志替代最后成功退出码。**
- 真实 Provider 请求 **未执行**：`C_MODEL=MODEL_NOT_RUN`，没有 token、真实工具拒绝率、质量、耗时、费用改善的结论；P06 为 `NOT_RUN`，不关联其 LIVE/后台 owner 门禁。

## 4. 当前失败的代码定位与根因假设（非已证明事实）

涉及四处：

1. `apps/electron/src/renderer/components/content-review/CreateCaseDialog.tsx`：`handleSubmit` 调用 `submitLock.current.acquire()`，提交成功后先 `onOpenChange(false)`，再在 **无条件 finally** 执行 `submitLock.current.release()` 和 `setSubmitting(false)`；旧锁只保护同一 pending Promise，不保护“已经成功但仍在关闭过渡中的表单”。
2. `apps/electron/src/renderer/components/content-review/review-case-submit-lock.ts` 与 `review-case-submit-lock.test.ts`：当前三条测试重点覆盖**请求尚未完成时**的双提交、失败重试、重开复位，**没有**覆盖成功响应后而组件/对话框仍可接收第二次 submit 的竞态。
3. `apps/electron/src/renderer/components/content-review/review-actions-controller.ts`：`createCase` catch 会调用 `reportError("新建案卷失败", error)`；第二次 IPC 令牌拒止因而转成前端错误。**不能直接吞掉这一错误**，它对真正未授权重放仍必须可见。
4. `apps/electron/src/main/lib/review/review-ipc.ts`、`review-d4-intake.ts`、`review-d4-client.ts`：Main 校验 token 的 owner、TTL、是否消费与多任务范围；第一次使用后单次消费是**正确的安全行为**。修复禁止放宽该门禁。

**最优先的、仍待事件日志验证的假设**：成功返回后 `finally` 过早释放同步锁，且 UI 关闭尚未完成，第二次点击进入新的 `handleSubmit`，形成第二个 Main IPC。证据已证明第二次 IPC，**尚未直接证明两次 `acquire/release` 的实际发生顺序**；也须检查组件重新挂载、点击时序与状态更新。先针对该窗口设计失败→通过的测试，不要把假设写成既成事实。

## 5. 下一会话的执行顺序

1. 完整阅读本文件、同目录的 `P1-C-C10-POST-ACCEPTANCE-FIX-TASK-20261018.md`、#122 `REPORT.md`/`verification.json`、旧 #112 补丁与 #120 当前源码；核对远端 HEAD/CI。
2. 从 #120 固定 SHA 派生 **独立生产修复分支**，首先建立能让旧实现失败的“成功已经返回、关闭尚未提交时再 submit”的回归，补必要的时序插桩（避免日志泄露材料）。
3. 只修复一个建案生命周期的 UI single-flight，正确区分 success-pending-close、失败可重试、关闭后重开。保持 Main 一次性令牌和 D2 实现不动；如证据证明非 UI 缺陷，按任务书记录阻断和最小扩展理由。
4. 跑类型检查、构建、完整单测、D2/D3/COMMON 及 C10 新正反例，提交固定 SHA、Draft PR，真实日志引用。
5. 修复代码 CI 通过后，单独用 Electron/Xvfb 进行 **仅 C10 鼠标 40ms 双击 + Enter+click** 的独立短程复验，确认 Main 仅收到一次建案、GUI 没有成功+失败双 Toast、原件哈希和 D2 指纹不变；不重跑 P2 全部模型实验。
6. 只有独立 GUI `C10_PASS` 后才申请变更 `P1-C` 的 GUI 阶段结论；`MODEL_NOT_RUN`、`P06 NOT_RUN` 保持原样。

## 6. 遗留项目边界与停止条件

- **不继续开发 P2 新功能**：P2-A/B/C 已完成离线工程和 #122 配对差分；本次只修复明确 GUI 阻断，不重新设计 50 模板、自动路由或提示词。
- 禁止修改 #111/#122 证据历史、隐藏 Gold、校方业务 Markdown、candidate 发布权限或 P06 LIVE/Owner/Pi tool allowlist。
- 不接受“3750+ 测试全绿所以 GUI 已通过”；测试层级必须标为 `CODE_CI_PASS`、`GUI_C10_PASS/FAIL/BLOCKED_ENV`、`MODEL_NOT_RUN`、`P06_NOT_RUN`。
- 修复 PR 不合并主仓；下一会话完成真实代码修复及可复现回执后暂停新增功能，向用户报告剩余门禁和建议。

## 7. 项目中原有重要文档（按阅读顺序）

- `P2-B-C-BATCHED-ENGINEERING-AND-ACCEPTANCE-20261018.md`：我们已达成一致的连续离线开发、统一验收和成本控制制度。
- `P1-P2-UNIFIED-OFFLINE-AND-LIVE-ACCEPTANCE-TASK-20261018.md`：已经执行过的统一验收任务书；对应完成证据见 #122，**不要照它机械重复全套**。
- `P1-C-C10-FIX-RETEST-20261018.md`：#112 旧修复阶段任务书，**不能把它作为新修复的固定代码父版本**；新 C10 专项任务书优先。
- `P2-A-PROMPT-CONTRACT-20261018.md`、`P2-B-OFFLINE-PROMPT-DIFF-20261018.md`、`P2-C-REJECTION-REPAIR-20261018.md`：P2 结果解释和测量边界。

最终交接状态：`P2_OFFLINE_ENGINEERING_ACCEPTED_SCOPED`；`P1C_C10_GUI_BLOCKED`；`MODEL_NOT_RUN`；`P06_EXTERNAL_DEPENDENCY_NOT_RUN`；发布 `CANDIDATE_HELD`。
