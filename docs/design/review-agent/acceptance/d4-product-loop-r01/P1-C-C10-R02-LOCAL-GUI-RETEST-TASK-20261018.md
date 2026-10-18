# D4 P1-C｜C10 R02 最小独立 Electron/Xvfb 实机验收任务书

> 仅执行 C10；不得重跑整个 P2、不测真实学校用户/模型、不修改 #122 历史证据；本文件不表示 GUI 已通过。独立 QA Agent 在本机执行并出 Draft 审计 PR。

## 1. 固定输入与准备

- Repo：`Fuck-GH-Admin/cdut-studio-review-agent`。
- 生产父 SHA：`026cfe0f4905bf10f46291bdd7451788c60df5f9`。
- 测试对象：PR #124 `fix/d4-p1c-c10-lifecycle-r02` **执行时远端最新 HEAD，先记完整 SHA，验收中不得漂移**。
- 历史原始对照：PR #122 `audit/d4-p1p2-batched-r01`；可复用已归档的 CDP driver、可信 Enter+Click 脚本、只读 IPC 脚本和 40B 合成材料，不改原文件。
- 与主开发隔离：全新 detached worktree、Xvfb、临时 profile、空模型配置；禁止真实 CAS/Provider、历史 profile、生产数据库、Main 写入型假造测试数据。

参考命令（在已授权克隆目录执行；先核对 SHA 再测试）：

~~~bash
git fetch origin feat/d4-p2c-submit-repair-feedback-r01 fix/d4-p1c-c10-lifecycle-r02 audit/d4-p1p2-batched-r01
FIX_SHA=$(git rev-parse origin/fix/d4-p1c-c10-lifecycle-r02)
git merge-base --is-ancestor 026cfe0f4905bf10f46291bdd7451788c60df5f9 "$FIX_SHA" || exit 2
git worktree add --detach ../cdut-d4-c10-r02-qa "$FIX_SHA"
cd ../cdut-d4-c10-r02-qa
git status --porcelain
git rev-parse HEAD
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
bun test --isolate apps/electron/src/renderer/components/content-review/review-case-submit-lock.test.ts apps/electron/src/renderer/components/content-review/review-case-submit-lifecycle.test.ts
~~~

以上命令每项保存 stdout/stderr、退出码；失败即标 BLOCKED，不得静默改本轮受测 SHA。CI 已有完整全仓 GREEN，但这一步用于 QA 在受测机上确认可运行；D2/D3/COMMON 分项可按对应固定 CI workflow 复核，另记独立退出码。

## 2. GUI 环境与现有执行器

准备 Xvfb 1600×1000×24（示例 `:120`）、窗口管理器 openbox、Electron 及两个独立 shell：一个启动 Vite，另一个启动 Electron。先确保旧 app 全部退出且不复用历史 profile。仅使用合成 fixture 和离线 demo，空模型配置目录与独立 user-data：

~~~bash
mkdir -p audit/d4-p1c-c10-r02/tmp audit/d4-p1c-c10-r02/evidence/{logs,screenshots,readback,environment}
git show origin/audit/d4-p1p2-batched-r01:audit/d4-p1p2-batched-r01/evidence/cdp-driver.mjs > audit/d4-p1c-c10-r02/tmp/cdp-driver.mjs
git show origin/audit/d4-p1p2-batched-r01:audit/d4-p1p2-batched-r01/evidence/readback/d4-gui-case-readback.js > audit/d4-p1c-c10-r02/tmp/d4-gui-case-readback.js
git show origin/audit/d4-p1p2-batched-r01:audit/d4-p1p2-batched-r01/evidence/logs/enter-click-dispatch-instrumented.mjs > audit/d4-p1c-c10-r02/tmp/enter-click-dispatch-instrumented.mjs
git show origin/audit/d4-p1p2-batched-r01:audit/d4-p1p2-batched-r01/evidence/fixtures/公共教学教室借用申请.md > audit/d4-p1c-c10-r02/tmp/公共教学教室借用申请.md
sha256sum audit/d4-p1c-c10-r02/tmp/公共教学教室借用申请.md
~~~

期望 fixture 40 字节，SHA256 `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`。启动命令由本机现有 Electron dev/QA 环境确认后记入 `environment/runtime.txt`；必须能使用远程调试端口（例如 9252）、原生 OS 文件选择器和实际鼠标/键盘 CDP 事件，不能通过 DOM `element.click()` 或直接 create IPC 代替。参考执行器：

~~~bash
D4_CDP_PORT=9252 node audit/d4-p1c-c10-r02/tmp/cdp-driver.mjs dump
D4_CDP_PORT=9252 node audit/d4-p1c-c10-r02/tmp/cdp-driver.mjs double-click 'text:创建项目'
D4_CDP_PORT=9252 node audit/d4-p1c-c10-r02/tmp/cdp-driver.mjs screenshot audit/d4-p1c-c10-r02/evidence/screenshots/c10-a-result.png
D4_CDP_PORT=9252 node audit/d4-p1c-c10-r02/tmp/cdp-driver.mjs eval-file audit/d4-p1c-c10-r02/tmp/d4-gui-case-readback.js
~~~

注意：原 Enter+Click 插桩脚本内部固定端口 9252，且有预设的合成标题包含 EVENT-INSTRUMENTED 的防误执行断言；按脚本要求准备对应标题，不要删安全断言。审计时记录事件序列及可信标志，所有外部 CDP 注入只限 QA profile。

## 3. 必测用例及硬断言

**C10-A 鼠标双击**：原生选择 40B fixture，D4 自动采用 `g03-t01` 后人工设置 1 Subject、`p-public-classroom`，八项 condition 留 unknown，人工确认。标题命名 `C10-R02-MOUSE-<唯一标识>`，鼠标在约 40ms 间隔发送两次真实 pointer/click，保留 dispatch JSON、submit 计数、双击前/后的全屏截图。必须是 **1 次 Renderer→Main CREATE_CASE，1 次 Main 有效建案，只有成功 Toast，没有失败 Toast**。如果获取 Main 入口次数需要临时 QA instrumentation，只允许在隔离 QA 工作树给 CREATE_CASE handler 入口打印无材料内容的时间/自增序号，不可更改 token 或业务分支；记录并回滚该临时插桩，禁止混入修复 PR。

**C10-B Enter+Click**：在另一个新 dialog、另一个不同名称案卷下，使用原 #122 的 trusted Enter keyDown 和 pointerDown/up/click 联合事件脚本，验证两次 form-submit 事件但仅一次 Main create；仍不得有虚假失败 Toast。保存事件、入口计数、截图和 IPC。

**C10-C 失败→编辑→重试；取消/重开**：用 QA 可证明的真实失败路径（例如原生暂存 token 到期后被 Main 拒绝；不得伪造成功回执），记录失败 Toast、**0 新案卷**；用户重新选择有效 40B fixture/修正表单，再主动提交必须成功。取消/ESC 或关闭后重新打开新 dialog，建立另一个独立名称案卷；确认前一个成功锁不会造成永久死锁。单独记录打开/关闭中异步回包是否实际测过，未测标 NOT_RUN。

**C10-D Main 持久化**：用只读 `window.reviewAPI.listCases/getCase/getAggregateV2/listRunsV2`（原驱动的 eval-file），逐案对齐标题/ID，恰好一份 role=application 且 size=40 的原件，1 Subject，D2 fingerprint、52 rules、条件 unknown、`publicationAllowed=false`、0 EvidenceLink、0 PiRun；保存来源与每份 source-docs 副本的 SHA256，必须与上述 fixture 一致。Ctrl+R 后重复读回，ID、原件数与 fingerprint 不变化。**fingerprint 取新测试输入实际值，不强行等于 #122 旧案卷指纹**。

**C10-E Main 安全拒止**：现有 Main 负向回归再次运行、保留输出，确认非法/跨 sender/已消费 token 仍明确被拒。若 GUI 不便手动重放 token，应将 GUI 手动重放子项标 NOT_RUN，不可绕过 Main 保护以满足测试。

**C10-F 兼容边界**：以已发布模板（非 D4 暂存）新建一次小型合成案卷，连续提交不会重建；重新打开允许创建第二案。该项可由新增自动测试辅助但不得冒称完整已发布 GUI 路径已测。

## 4. 证据、裁定、停机

保存：`REPORT.md`、`verification.json`、`evidence/environment/{source-sha,runtime,profile-isolation,model-config-empty}.txt`、`evidence/logs/{mouse,enter,main,renderer,fail-retry}.log/json`、`evidence/screenshots/`、`evidence/readback/`、`SHA256SUMS` 与 `SHA256SUMS.sha256`。SHA manifest 避免包含自己；敏感环境路径脱敏，不泄漏登录、密钥或材料正文。记录源/副本哈希、CLI 退出码和 test commands；合成案卷属于**验收测试**，不得混入真实客户材料。

断言任一失败，正式结果 **C10_GUI_FAIL**，保留截图与日志并停在问题定位；Electron/原生窗口不可用，正式结果 **BLOCKED_ENV**；所有必测项有机器证据后才允许签 **C10_GUI_PASS**。固定新验收 SHA，另建 audit Draft PR，原 #122 PARTIAL/GUI_FAIL 不修改。P2 历史离线 PASS、在线 Provider MODEL_NOT_RUN、P06 NOT_RUN 保持独立，正式发布依然 candidate-held。
