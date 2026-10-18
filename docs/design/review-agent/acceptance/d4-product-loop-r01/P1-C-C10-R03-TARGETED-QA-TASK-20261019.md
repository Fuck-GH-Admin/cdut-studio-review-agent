# D4 P1-C｜C10-R03 定向 QA：真实双击时序、Enter+Click 与 Main 一次性令牌

> **QA 测试合同与执行任务书，绝非通过声明。** 不修改冻结生产建案逻辑，不覆盖 #122/#125 失败证据。不重新运行 P2/G01–G08/在线 Provider/P06。依据 #125 真实日志校正误导性硬断言，同时保留防重复建案的硬安全要求。

## 0. 固定输入与既有事实

- 生产修复：PR #124，HEAD `fc5100b339d1f097aea4ee60bd2d912276bf8429`，父基线 PR #120 `026cfe0f4905bf10f46291bdd7451788c60df5f9`。
- 旧 QA 失败：PR #125，`e9ae53274722ab73d26720c71d131583a37f935b`，**不修改**；实际 verdict `C10_GUI_FAIL`。
- R03 独立工程测试：PR #126，`test/d4-p1c-c10-r03-input-token-gates`，从 #124 HEAD 派生。R03 只有新增 Main token 负例、CDP 测试脚本和本任务书；不修改 Main/Renderer 生产实现。
- #125 C10-A：第一个 trusted button click 403536.9ms，第二个 pointerdown 404362.9ms，**实际约 826ms**，第二次落到 DIV；虽然 driver 标注了 40ms，**不能据此签精准 40ms 事件竞态覆盖**。
- #125 C10-B：归档 driver `keyDown/keyUp` + click 只观测到 1 form submit / 1 Main，物理 Return 单独正常。**不能把“强制观测到 2 个 trusted submit”当成产品必须满足的行为；浏览器正常禁用/移除按钮可能仅交付一个 submit。**
- #125 C10-C/D/F 已通过，Main 只读恢复、源哈希一致且未重复创建。#125 E 未执行 cross-sender/consumed replay。本轮保留以上证据，**不机械重做全部通过项**。

## 1. 先运行 R03 自动化负例

从远端 #126 **最新固定 HEAD** 创建全新 detached worktree，记录 exact SHA、`git status --porcelain`、`git merge-base`、Bun/Electron 版本、CI run IDs。不得把 #125 审计分支误作生产代码基线：

~~~bash
git fetch origin fix/d4-p1c-c10-lifecycle-r02 test/d4-p1c-c10-r03-input-token-gates audit/d4-p1c-c10-r02
FIXED=$(git rev-parse origin/test/d4-p1c-c10-r03-input-token-gates)
git merge-base --is-ancestor fc5100b339d1f097aea4ee60bd2d912276bf8429 "$FIXED" || exit 3
git worktree add --detach ../cdut-d4-c10-r03-qa "$FIXED"
cd ../cdut-d4-c10-r03-qa
git rev-parse HEAD
git status --porcelain
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test --isolate apps/electron/src/main/lib/review/review-d4-intake-token.test.ts
bun test --isolate apps/electron/src/renderer/components/content-review/review-case-submit-lock.test.ts apps/electron/src/renderer/components/content-review/review-case-submit-lifecycle.test.ts
~~~

要求保存 **完整 CLI、exit code**。Main 新测试真正调用 `stageD4Intake/claimD4Intake/releaseD4Intake/discardD4Intake`，仅以 Bun mock 代替 OS 选择器；覆盖未知 token、跨 sender、在用并发拒止、consumed 重放、失败 release 可重试、owner-only discard。测试独立于生产 IPC 实机验收，不允许宣称已执行跨真实 Electron sender 进程攻击。若新的 Main 自动化失败，先查是测试环境/mock 问题还是真实代码缺陷；禁止降低 Main 安全门槛使绿。

## 2. 仅运行 R03 小型 GUI 事件时序验收

环境使用隔离 Electron 43.7.7+Xvfb（示例 `:120` 1600×1000）和全新 user-data/config，空 Provider 配置，仅离线 demo，不读取真实用户文件。固定合成 40B 原件的 SHA-256 应为 `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`，由真实 OS 文件选择器入站。进入 G03-T01，1 Subject、`p-public-classroom`，8 条 condition=unknown，手动确认。不要直接调用 CREATE_CASE IPC 制造验收数据。

先保留 R02 临时 Main 入口计数补丁为**隔离 QA instrumentation**，日志只允许入口序号、时间、sender ID；不要将其合入本分支，不打印标题/文件正文/token。原补丁见 #125 `evidence/environment/temporary-main-instrumentation.patch`。测试结束确认 QA 实机补丁已撤销，产品树 SHA 不变。

**脚本**：`apps/electron/scripts/review-d4-c10-r03-input.mjs`，使用浏览器 CDP `Input.dispatchMouseEvent` 和 `Input.dispatchKeyEvent`。脚本会先 `scrollIntoView`、确认 `elementFromPoint` 确实命中已启用创建按钮，再安装 `isTrusted/performance.now()/targetTag` 捕获。**新增模式特意不 await 第一次 click 的 CDP ack 再睡 40ms**，避免把 Main/React 的 800ms 阻塞当作 40ms。实际浏览器事件时间戳才是有效间隔。

~~~bash
D4_CDP_PORT=9252 node apps/electron/scripts/review-d4-c10-r03-input.mjs mouse40 > evidence/logs/c10-r03-mouse40.json
# 创建另一个独立新案、确认焦点为标题输入框且按钮已滚动进入视口：
D4_CDP_PORT=9252 node apps/electron/scripts/review-d4-c10-r03-input.mjs enter-click > evidence/logs/c10-r03-enter-click.json
~~~

`enter-click` 改用 `rawKeyDown + char('\\r') + keyUp`，然后紧接真实 CDP 鼠标按放；不允许 `form.submit()` / `dispatchEvent()` / `element.click()` 冒充 `isTrusted`。测试每次选用不同标题和一次性暂存，禁止复用已消费的 token。当 CDP Key char 不产生键盘默认提交，应检查浏览器行为、activeElement、button hit target 并记录输入覆盖不足，而不是硬造第二次 submit。

### 关键硬断言

- **A1 时间与命中真实**：保存实际 `observedTrustedPointerDownGapMs`、两个事件 targetTag/是否命中 createButton、disabled 状态。如果差距超过 120ms，记录 `INPUT_GAP_NOT_MET` 并调整隔离时序环境；**不能称作已覆盖 40ms 压力**。若第 2 次 target 已被替换为 DIV/disabled，记录这是 UI 原生禁用/组件更新的安全抑制，不能称“第二次成功点击按钮”。
- **A2 结果必须正确**：每个独立用户动作至多一次 Main CREATE_CASE，有且仅有一个成功案卷和一份 40B application、绝无成功后虚假失败 Toast，D2 fingerprint、1 Subject、52 Rule、8 unknown、publicationAllowed=false、0 Pi Run/EvidenceLink，reload 后一致，源副本 SHA256 相同。
- **B1 Enter+Click 真实性**：必须实际命中 title INPUT 的可信 Enter 键与 create BUTTON 的可信鼠标序列。最终可能得到 1 或 2 个 trusted form-submit，这是浏览器和 React UI 的行为，**不要求产品为了满足数量产生重复 DOM submit**。如果只观测到 1 个，则记录 `NATIVE_SINGLE_SUBMIT_OBSERVED` 并结合自动化 `runReviewCaseSubmission` 的双回调测试说明另一层保护；如果 2 个则 `TRUSTED_DUAL_SUBMIT_OBSERVED`，Main 仍只能接收 1 次。
- **B2 不应扩大产品故障判定**：真正失败标准是重复 CREATE_CASE、有两个案卷/原件、错误 Toast，或可重入安全缺口。仅因浏览器正常抑制第二次 DOM submit 不得判产品 FAIL；但如果驱动根本没有向按钮/输入框产生有效事件，属于 `TEST_INPUT_INVALID`，不能签 GUI PASS。
- **C 令牌**：R03 Main 新自动回归必须 PASS，且至少一条已提交实际 Main token 被消费后再 claim 的拒止证据；可直接将已有自动单测结果作为 Main 层证据。不强求 GUI 伪造跨 sender 攻击。生产端 token 校验实现不得改变。
- **D 边界**：关闭中迟到 Main 回复由已有生命周期自动化覆盖；如本轮未做额外 GUI 可标 `GUI_STALE_REPLY_NOT_RUN`，不影响已由自动化测试证明的场景，但不得称该 GUI 子项 PASS。

## 3. 明确裁决与工作停止

- `C10_R03_PASS` 仅在 **A1、A2、B1、B2、C** 均有可信证据、以及测试环境固定可复现时签署。
- `C10_R03_FAIL`：确证生产多次 Main CREATE_CASE、双 Toast、令牌放行或数据重复。
- `C10_R03_BLOCKED_INPUT`：间隔未达标、点击未命中、trusted Enter 未触发预期可观测事件；修复仅测试驱动并重新执行，不对产品乱打补丁。
- `C10_R03_BLOCKED_ENV`：Electron 或原生选择器无法执行。

将独立审计成果提交 `audit/d4-p1c-c10-r03` Draft PR，基于 #126 的固定 HEAD：`REPORT.md`、`verification.json`、完整 GUI 截图（无私人文件列表）、事件/入口日志、只读 Main IPC、原件副本 SHA256、`SHA256SUMS`。不得覆盖 #125，必须区别 `CODE_CI_PASS`、`C10_R03_...`、`MODEL_NOT_RUN`、`P06_NOT_RUN`。只有独立 QA 签署通过、固定 HEAD 与安全门槛确认后，再讨论 D4 受限技术集成。保留全部 Draft，不自动合并 main。
