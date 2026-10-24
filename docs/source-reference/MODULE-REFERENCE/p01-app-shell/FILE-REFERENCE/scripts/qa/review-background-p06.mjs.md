---
path: scripts/qa/review-background-p06.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f238a4a76fdb49a0cdd3d710f0afbec86364ed2
sha256: 1f100d953371de88b069bcf26f217354bce2d7a9f61645787878a27fb1c0a0c9
lines: 347
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/qa/review-background-p06.mjs

## 1. 结论与边界

**P06-S02 真实 Electron/Pi 双轮回放验收驱动脚本**（347 行 ESM）：经隔离本机 CDP（`127.0.0.1:9222`）驱动真实渲染进程，seed 创建 4 个合成案卷（success/preflight/stop/failure，`scripts/qa/review-background-p06.mjs:206-223`），其中 success/stop 两案卷执行「同案 update 复用 owner / 停止后 restart 新 owner」双轮后台审核验收（`:338-339`），preflight/failure 为备用夹具仅创建未进入验收（头注释 `scripts/qa/review-background-p06.mjs:1-5`）。硬约束：必须使用**全新隔离 profile 且 Pi 模型已授权**（`:3`）；案卷为合成件；**UI 失败或不可达一律 NOT-RUN/FAIL，绝不静默 PASS**（`:4`）。边界：本脚本是本地验收驱动（非 CI 测试）；不测 Relay/Pocket/Feishu、跨进程崩溃注入与 late onRunOutcome 注入（`scripts/qa/review-background-p06.mjs:340` scope 声明）。

## 2. 导出与关键符号

无导出（CLI/独立脚本，顶层即执行）：无位置参数。环境变量（全部必填，缺失即抛）：`QA_REPORT_DIR`（`scripts/qa/review-background-p06.mjs:11-12`，报告输出目录，`:13` mkdirSync）、`REVIEW_QA_USERNAME`/`REVIEW_QA_PASSWORD`（`:15-17`，离线演示登录凭据，注释 `:14`：由本地环境显式提供，不依赖历史验收报告）、`QA_PROFILE_ROOT`/`QA_SOURCE_PATH`（`:122-124`，隔离 profile 根与合成申请材料源文件）。
内部函数（均「内部」，28 个）：`delay`（`:19`）、`deadline`（`:20`）、`connect`（`:25-54`）、`send`（`:55-66`）、`evaluate`（`:67-74`）、`eventually`（`:75-84`）、`screenshot`（`:85-88`）、`record`（`:89-103`）、`clickText`（`:104-114`）、`selectValue`（`:115-120`）、`readOwners`（`:126`）、`readAssignments`（`:127`）、`readMessages`（`:128-131`）、`trace`（`:137`）、`waitProvider`（`:138-148`）、`clickSelector`（`:149-154`）、`openReview`（`:155-184`）、`chooseCase`（`:185-198`）、`waitAccepted`（`:200-202`）、`waitTerminal`（`:203-205`）、`seed`（`:206-223`）、`boot`（`:225-247`）、`newAcceptance`（`:249-254`）、`queryRun`（`:255-257`）、`tryOldStop`（`:258-263`）、`clickStop`（`:264-277`）、`ensureNoPriorStopFeedback`（`:278-281`）、`runTwice`（`:282-335`）；表达式常量 `stateExpression`（`:199`）/`remoteState`（`:248`）。

## 3. 内部逻辑与关键流程

按真实执行顺序分段：
1. **环境与凭据校验**（`scripts/qa/review-background-p06.mjs:11-23`）：`QA_REPORT_DIR` 必填（`:12`）并建目录（`:13`）；双凭据必填（`:17`）；初始化 `results`/`delay`/`deadline`/`ws`/`seq`/`pending`（`:18-23`）。
2. **CDP 传输层**（`:25-74`）：`connect` 轮询 `http://127.0.0.1:9222/json/list`（120s 窗口，`:26-30`），选中 `url.startsWith('http://localhost:5176')` 且不含 `window=agent-preview` 的页面取 `webSocketDebuggerUrl`（`:32`），120s 内无目标抛「No real app renderer target…」（`:37`）；WebSocket 挂 message 分发 pending（error→reject，result→resolve，`:43-51`）；`Runtime.enable`/`Page.enable`（`:52-53`）。`send`：自增 id，30s 超时抛 `CDP timeout: <method>`（`:58-61`）。`evaluate`：`Runtime.evaluate`（awaitPromise/returnByValue/userGesture，`:68-70`），有 `exceptionDetails` 抛「Renderer JS exception」（`:71-72`），返回 `result.value`（`:73`）。`eventually`：400ms 轮询表达式至真值，超时抛 `name + ' timed out; last=…; page=…'`（`:75-84`）。
3. **断言/记录层**（`:85-103`）：`screenshot` 写 `reportDir/<name>.png`（`:86-87`）；`record(name, fn)` 成功 push `PASS`+details，失败 push `FAIL`+error、截 `failure-<n>` 图（`:98`）并**rethrow 终止后续用例**（`:99`），finally 全量写 `electron-ui-results.json`（`:101`）。
4. **UI 操作层**（`:104-120`、`:149-154`）：`clickText`（可见 button/a/[role=button]/[role=tab] 文本包含匹配或叶子精确匹配+closest 可点，失败抛「Visible clickable text not found」附页面文本，`:112-113`）；`selectValue`（native setter+change 事件，`:116-118`）；`clickSelector`（boundingRect 中心 Input.dispatchMouseEvent 按下+抬起，`:150-153`）。
5. **隔离 profile 门禁**（`:122-134`）：读 `review-module-settings.json.agentModelSelection`（`:125`）；`readOwners`（`agent-sessions.json` 过滤 `owner.kind==='review-case'`，`:126`）、`readAssignments`（`review-agent-assignments.json`，`:127`）、`readMessages`（`agent-sessions/<id>.jsonl` 逐行 JSON，`:128-131`）；若已有 review owner 或 assignments 文件存在 → 抛「P06 回放要求全新隔离 profile；拒绝复用历史审核数据」（`:132-134`）。
6. **provider 见证**（`:136-148`）：`trace` 追加 timeline.json（`:137`）；`waitProvider(ownerId, offset, …)` 120s 内以 `providerWitness(readMessages(ownerId).slice(offset))` 找真实 assistant token 回执（`:141`），见即 trace+返回（`:142`）；期间若 runId 变化或 phase≠accepted 抛「取得 provider 回执前运行已结束或发生变化」（`:143-144`）；超时抛「未观察到本轮真实 provider 回执；不能只凭 ACK 宣称模型双轮通过」（`:147`）。
7. **boot**（`:225-247`）：`connect` → preload 就绪（`window.electronAPI.getSettings && window.reviewAPI`，`:227`）→ 抑制引导（coach-tour 版本比对 + `updateSettings` + `Page.reload`，`:228-234`）→ 重载后就绪（`:235`）→ 欢迎页补 `onboardingCompleted`（`:236-239`）→ 确认 `stopBackgroundPiReviewV2` 存在（`:240`）→ 读本地 `settings.json` 验证 CDP 实例确实写入指定 profile，否则抛「CDP 实例未写入指定隔离 profile；在创建案卷前拒绝继续」（`:241-244`）→ `seed` → `openReview`。
8. **seed**（`:206-223`）：经 IPC 创建模板 `p06-double-round-synthetic-20261013`（schemaVersion 2，单 section 单判据「预算文本核验」——要求引用本轮实际读取的原文出处核对总预算 100 元，`scripts/qa/review-background-p06.mjs:209-211`；`sourceNote: 'P06_SYNTHETIC_ONLY…'`）；已存在则复用（`:212-213`）；创建/复用 4 案卷（success/preflight/stop/failure，标题 `:215`）并 `importDocumentFromPath` 装载合成申请（`:217`）；写 `synthetic-cases.json`（`:222`）。
9. **openReview**（`:155-184`）：等 `window.reviewAPI?.startBackgroundPiReviewV2` 与 React 壳（`:156-157`）→ Esc 关浮层（`:158-159`）→ 已在「待我处理」则返回（`:160`）→ 退出引导/「稍后再学」/展开侧边栏（`:161-163`）→ 点「CDUT 专区」（`:164-165`）→ 若现密码框则注入演示凭据并点「一键连接特区账户」（`:167-180`，字段缺失抛「Offline demo login fields unavailable」）→ 点「材料审核」（`:181-182`）→ 等「待我处理」真实工作台（`:183`）。
10. **chooseCase**（`:185-198`）：经 `/atoms/review-atoms.ts` 源码解析出 jotai store 地址，动态 import `review-actions-controller.selectCase(id)` 装载隔离 fixture（`:188-194`，注释 `:186`：审核启动/停止仍点击产品按钮）；再关引导（`:195-196`）。
11. **runTwice(key, mode)**（`:282-335`）核心验收序列：选案（`:284`）→ 记录历史 owner（`:285`）→ 点「开始审核」（`:286`）→ `waitAccepted` 取首轮 ACK（`:287`，45s 窗）→ 首轮 owner 必须真实落盘（否则抛「No actual atomically-persisted review owner」，`:289-290`）且不得复用历史 owner（`:292`）→ `waitProvider(owner1, 0, …)` 取真实回执（`:293`）→ `clickStop` 退场首轮（`:294`）并校验 `runStatus==='cancelled'`（`:268-270`）→ update 模式替换材料为 120 元版本 `p06-second-version.txt`（`:298-305`，注释 `:297`：update 必须处理本轮最新材料）→ 二次点击「更新审核结果」/「重新审核」（`:310`）→ `newAcceptance` 取第二轮 ACK（`:311`）→ `roundOwnerId`+`verifyOwnerTransition` 裁决 owner 政策（`:314-315`）→ 旧轮 stop 负例：`tryOldStop(first.runId)` 必须被拒且 reason 含「运行已变化」（`:316-317`），同时保持「当前 running / 历史 cancelled」窗口（`:318-320`）；update 模式校验 `inputManifest.hash` 已换新且旧轮快照未被改写（`:321-322`）→ `waitProvider(owner2, …)`（update 用 messageOffset 续读，`:324`）→ UI 回显「审核中，可切换页面」+ 可用「停止审核」按钮（`:325`）→ `ensureNoPriorStopFeedback` 禁止旧绿回执残留（`:278-281`）→ 截图（`:327`）→ 二次 `clickStop` 退场（`:328`）→ 旧账本不得被改写（`:329-330`）→ 截图（`:331`）→ 两轮指派须全部撤销（`grants.length===2 && 全部 revokedAt`，否则抛「停止释放后两轮指派未全部撤销」，`:332-333`）→ 返回含 `ownerPolicyVerified/bindingsVerified/grantsRevoked/materialSnapshotChanged/oldStopDenied/oldLedgerUnchanged/latestAckReal/guiButtonsClicked` 的结果对象（`:334`）。
12. **主序列**（`:336-347`）：`boot` → `record('P06-S02-E01 same-case update reuses owner, late old stop denied', runTwice('success','update'))`（`:338`）→ `record('P06-S02-E02 same-case restart creates new owner after stop release', runTwice('stop','restart'))`（`:339`）→ 写 `p06-summary.json` PASS（scope 注明 Deliberate late onRunOutcome injection, cross-process crash, Relay/Pocket/Feishu NOT-RUN，`:340`）；catch → 写 FAIL 摘要 + `process.exitCode=1`（`:341-344`）；finally 关闭 WebSocket（`:345-347`）。

## 4. 调用者与调用链

- 入向（grep 冻结树 `review-background-p06`）：`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:19` `resolve(import.meta.dir, '…/scripts/qa/review-background-p06.mjs')`——仅做 `node --check` 语法解析（`:20`）与源码文本断言（`:22-27`），**不执行回放**（该测试文件头注释 `:1-2` 明示）。无 package.json script、无 workflow 点名（否定结论检索范围：全树 grep `review-background-p06`，命中仅本文件与上述测试）。
- 出向：`node:fs`/`node:path`/`ws`（`scripts/qa/review-background-p06.mjs:6-8`）；`./review-background-p06-contract.mjs`（`:9`，调用点 `:141`、`:291`、`:314`、`:315`）；CDP HTTP+WebSocket（`:30`、`:38`）；`window.reviewAPI` IPC：`getTemplateV2`/`saveTemplateDraftV2`/`publishTemplateV2`/`listCases`/`createCase`/`importDocumentFromPath`（`:212-217`）、`getBackgroundPiReviewStateV2`（`:199`、`:248`）、`getRunV2`（`:256`）、`stopBackgroundPiReviewV2`（`:260`）、`getAggregateV2`/`registerMaterialPathV2`（`:301`、`:304`）、`startBackgroundPiReviewV2` 就绪探测（`:156`）；`window.electronAPI.getSettings/updateSettings`（`:230-232`、`:237`）；渲染端模块 `review-atoms.ts`/`review-actions-controller.ts`/`coach-tour-steps.ts`（`:189-192`、`:229`）。

## 5. 数据 I/O、读写与副作用

- 报告目录写（`QA_REPORT_DIR`）：`electron-ui-results.json`（`:101`）、`timeline.json`（`:137`）、`synthetic-cases.json`（`:222`）、`p06-summary.json`（PASS `:340` / FAIL `:342`）、截图 `*.png`（`:87`、`:98`、`:327`、`:331`）。
- 隔离 profile 写：`QA_PROFILE_ROOT/p06-second-version.txt`（update 模式材料替换，`:299`）；读 `config/review-module-settings.json`（`:125`）、`config/agent-sessions.json`（`:126`）、`config/review-agent-assignments.json`（`:127`、`:132`）、`config/agent-sessions/*.jsonl`（`:128-131`）、`config/settings.json`（`:241`）。
- 经真实 IPC 的产品状态副作用：创建模板/发布模板/建案卷/导入材料/注册替换材料/启动与停止审核运行（`:212-217`、`:304`、`:286`、`:266`）——全部落在隔离 profile 内。
- 原子性：`writeFileSync` 全量覆盖，非原子（崩溃可留半截 JSON）；幂等：`seed` 复用已存在模板/案卷（`:212-213`、`:216`），但整脚本因新鲜 profile 门禁（`:132-134`）不可在同一 profile 重跑。

## 6. 分支、失败、取消与恢复

- 失败语义：UI 失败/不可达 = FAIL/NOT-RUN，绝不静默 PASS（`scripts/qa/review-background-p06.mjs:4`）。exit code：主 catch 设 `process.exitCode=1`（`:344`）并写 FAIL 摘要；成功隐式 0。
- 关键抛错分支：env 缺失（`:12`、`:17`、`:124`）、profile 非全新（`:133`）、CDP 无目标（`:37`）、CDP 30s 超时（`:60`）、渲染端异常（`:71`）、eventually 超时（`:82`）、可见按钮缺失（`:112`）、owner 未落盘（`:290`）、owner 政策违例（`contract` 抛，`:291`/`:315`）、旧 stop 被接受（`:317`）、运行状态窗口破坏（`:320`）、输入快照被改写（`:322`）、旧账本被改写（`:330`）、指派未撤销（`:333`）、provider 回执缺失（`:147`）。
- 重试/恢复：无自动重试；`eventually`/`waitProvider` 为限时轮询（30/45/60/120/240s 窗）。`record` 失败即 rethrow（`:99`），E01 失败时 E02 不执行。恢复方式：修复后换全新隔离 profile 重跑（`:132-134` 门禁拒绝复用）。
- 取消：无信号处理；finally 仅关闭 ws（`:345-347`）。

## 7. 权限与权威状态

- 权限读取点：`REVIEW_QA_USERNAME`/`REVIEW_QA_PASSWORD` 测试凭据（`scripts/qa/review-background-p06.mjs:15-17`，注释 `:14` 明示来自本地环境而非历史验收报告）；前提「已授权 Pi 模型」的隔离 profile（`:3`）；本机 Electron 调试端口 9222（`:30`）。无 GitHub/签名类凭据。
- 权威状态：provider 真实回执权威 = `providerWitness` token/工具回执而非 ACK（`:147`、`scripts/qa/review-background-p06-contract.mjs:25` 注释）；owner 归属权威 = 契约模块 `roundOwnerId`/`verifyOwnerTransition`（`:314-315`）；账本权威 = `getRunV2` 持久化状态（`:318-322`、`:329-330`）；profile 新鲜性权威 = `:132-134` 门禁。

## 8. 修改影响面

- P06-S02 验收结论产物（`p06-summary.json`/`electron-ui-results.json`/`timeline.json`/截图）。
- 文本契约锚点：`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts:22-27` 断言本文件必须含 `'P06-S02-E01'`、`'P06-S02-E02'`、`'runTwice'`、`'p06-summary.json'`、`'waitProvider'`、`'真实界面停止收尾并可重新审核'`——改动这些字面量会使该测试失败；`:20` 的 `node --check` 要求语法可解析。
- 依赖面：`scripts/qa/review-background-p06-contract.mjs`（`:9`）；`window.reviewAPI`/`window.electronAPI` preload 契约（`:156`、`:227`、`:240`）；隔离 profile 文件布局（`config/review-module-settings.json`、`config/agent-sessions*.json*`、`config/review-agent-assignments.json`，`:125-132`）；渲染端 `review-actions-controller.ts`/`review-atoms.ts`/`coach-tour-steps.ts`（`:189-192`、`:229`）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。本文件是验收驱动脚本（其自身即含 `record` 断言式用例 E01/E02，`scripts/qa/review-background-p06.mjs:338-339`，非 bun 测试）。间接测试证据（标「间接」）：`apps/electron/src/main/lib/review/review-p06-driver-contract.test.ts` 6 用例（grep `test(` 计数 6），其中 `:18-27` 用例 `Node parses the standalone CDP replay script without loading credentials` 对本文件做 `execFileSync('node',['--check',path])` + `expect(source).toContain(...)`（真实断言行 `:20-27`）；其余用例断言契约纯函数（`:30-57`）。测试断言≠运行；P06 实机回放未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 段执行流、28 内部函数（22 个 `function` 声明 + 6 个箭头常量 `delay`/`deadline`/`readOwners`/`readAssignments`/`readMessages`/`trace`；另 `stateExpression`/`remoteState` 2 个表达式常量单列）、E01/E02 验收序列与全部断言分支 | 已证实 | `scripts/qa/review-background-p06.mjs:1-347` 全文 |
| 新鲜 profile 门禁、FAIL 不静默、exitCode=1 | 已证实 | `:4`、`:132-134`、`:344` |
| 报告/截图/JSON 写入点清单 | 已证实 | `:87,:101,:137,:222,:340,:342` |
| 入向仅静态消费（node --check + 文本断言） | 已证实 | `review-p06-driver-contract.test.ts:18-27` |
| CDP/IPC 实机交互行为 | 推断 | 代码静态阅读，实机未运行 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| env/凭据校验 | §2/§7 | 11-23 | covered |
| `connect`/`send`/`evaluate`/`eventually` | §3/§6 | 25-84 | covered |
| `screenshot`/`record` | §3/§5 | 85-103 | covered |
| `clickText`/`selectValue`/`clickSelector` | §3 | 104-120,149-154 | covered |
| profile 读取器 + 新鲜性门禁 | §3/§5/§7 | 122-134 | covered |
| `trace`/`waitProvider` | §3/§7 | 136-148 | covered |
| `openReview`（登录/导航全分支） | §3 | 155-184 | covered |
| `chooseCase`/`stateExpression`/`waitAccepted`/`waitTerminal` | §3 | 185-205 | covered |
| `seed`（模板+4 案卷） | §3/§5 | 206-223 | covered |
| `boot`（引导抑制+profile 验证） | §3 | 225-247 | covered |
| `newAcceptance`/`queryRun`/`tryOldStop`/`clickStop`/`ensureNoPriorStopFeedback` | §3 | 248-281 | covered |
| `runTwice`（双轮全断言链） | §3/§6 | 282-335 | covered |
| 主序列/摘要/退出 | §3/§6 | 336-347 | covered |
| 运行验证 | §10 | - | unknown（NOT_RUN） |
