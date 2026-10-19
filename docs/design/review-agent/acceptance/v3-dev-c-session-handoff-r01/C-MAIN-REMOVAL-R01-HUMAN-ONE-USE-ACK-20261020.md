# Dev-C C-MAIN-REMOVAL-R01：Plan Check 删除义务的 Main 真实人工一次性确认

> C-ONLY engineering evidence。A/B/I 无需阅读或确认。本案仅 C-owned 代码开发与 Gate O；不改变 #145 的四线共同协议或赋予 A/B/I Main 写入权。正式签收仅由 C 在 #145 DECISIONS:C 以精确 SHA、完整同基线 CI 后进行。

## 已核的真实缺口

既有 `plan-binding-v3.ts` 在 Case CAS 时计算完整 Check×target×object×subject×source-version-set 删除义务，并要求精确 `removalAck` 与 `authorizeRemoved` Main callback；真实 Electron `review-v3-main-author-plan-ipc.ts` 上一个版本虽然反复检查 Main frame、Owner 和正式学校 publisher，但它的 `authorizeRemoved` 仅检验 Main 当前授权，**缺独立已观察的人工确认存在/绑定与一次性消费**。攻击者或误操作通过 Renderer 传入准确的 ACK 列表，理论上可以越过真正 human consent 的证明。本次修复它，不改变 Case 真正的 CAS/Receipt 写模型。

## C-owned 实现（当前是工程候选，不能提前签）

- 新 `apps/electron/src/main/lib/review/review-v3-main-removal-consent.ts`：`CMainRemovalConsentGate`；必须注入 Main 独立实际观察的人类确认源 `getObservedMainHumanConsent(caseId,requestId)`，**不接受 Renderer 作为许可来源**。确认记录绑定 Main principal/session/window/frame、Owner generation、authority epoch、Case ID、请求 ID、当前 Case revision、前后 Plan fingerprint、由 Case CAS 计算的完整删除 identities、显示并确认的 reason；5 分钟有效、未来/旧时间拒绝，唯一 approval ID 用过即消耗且不会自动复活；最多 4096 个一次性 ID，达到上限整门禁关闭，不删除旧 tombstone。
- 真实 `review-v3-main-author-plan-ipc.ts` 的 `handleCMainUpgradeCanonicalPlan` 不再仅凭 Renderer `removalAck` 通过；有删除义务时 `authorizeRemoved` 在业务 Case CAS **读取当前 Main 物理帧/Owner 授权并消费真实观察记录**，前后复核 grant/安装代次/Publisher。仅 C 主进程安装者可以提供 `removalConsentSource`；未安装默认 fail closed；独立 author read 通路/不删除 Check 的 Plan upgrade 不强制这一人为确认。
- 既有 `review-v3-main-author-plan-ipc.test.ts` 真正注册的 Electron Main handler + Case CAS fixture 新增显式 Main 观察回执模拟与负例；测试里可模拟 `getObservedMainHumanConsent`，不等于真实生产已经安装 OS Main 对话框或用户点击事件。

## 安全负例覆盖与后续门禁

1. 精确 Renderer ACK 但没有 Main human-observed receipt，拒绝且无 Case mutation/Receipt。
2. 确认实际 Case revision、Main principal/frame/Owner/epoch、旧/新 fingerprint 或删除身份列表与 CAS 实时状态不一致，拒绝；Reason 不一致同样拒绝。
3. Main UI human confirmation 超时或时间戳来自未来拒绝；同一 approval ID 不能再次消费。
4. Main installation uninstall + reinstall 后，缺独立 human observer 拒绝；旧 async producer 无法偷渡。
5. 原有正式 Plan 发布者、真 Case 原件、Main Owner/grant、幂等请求 ID、无删除普通升级与既有 C/B/A tests 需全量回归。

## 首次 CI 真实失败与修复

首个候选工程 SHA `474fc70483beca89cbc6d034e9c367279d29315d`：PR CI `39338716627`、D2 `39338716577` 在 workspace TypeScript 报 TS18048/TS2532（consent source 与 `installed.removalGate` 缺失分支 TypeScript narrowing），**未进入全量 Bun**；Baseline `39338716731` 与 Batch `39338716581` 通过。失败源代码/日志保留，没有跳过 typecheck。仅修通过显式 `throw` 拒绝，先 `b349152b...` 再 `5d1272effa299be0a6014fb6a690c9914ce68d58`，修改仍仅 C-owned。第二批 PR CI `39339006952`、Baseline `39339006932`、Batch `39339006916`、D1 `39339006941`、D2 `39339006967` **当时 PENDING**。最终状态必须读取最新 SHA 原始 CI 再单独签收。

## 产品边界

- `removalConsentSource` 目前**没有真实 Electron Main human UI observer 安装**，因此没有达到 Gate E，不宣称允许删除业务义务的真实用户操作已可用。
- 本地 Case CAS 的 `UpgradeCanonicalPlan` 仍需要**真实独立 School Publisher**，测试发行者只是 fixture；没有学校授权的系统默认拒绝正式发布/升级。
- 没有开启新的 IPC/Preload channel、未赋予 Renderer 发行身份或 Main installation 能力；业务 writer 仅 C，I main lease inactive/writer denied。没有删除或改动 B owned 来源代码。
- 本地 Gate O 全绿以后才能签工程质量；真实 Electron Main UI confirmation/install/school L/5×30min product P 仍须集中验收。Release `NO_GO`。

## 同一 Main 观察源重装后的审批重放

安全细读发现：如果只用每次安装内的 `Set<approvalId>`，旧真实 Main 观察源对象在 uninstall/reinstall 后、若仍可返回相同历史回执，一个成功消费但 Case 尚未正常落盘的审批可能被再次视为未使用。后续 C-owned 额外提交 `0a6935ae651e9c12a5a8960e2af02d53d16a81ec`，改用 `WeakMap<privilegedPhysicalObserver, Set<approvalId>>`，进程内同一 Main observer 对象重装共享已消费 tombstone，`close()` 只封闭该安装的 gate、**不清空已消费 ID**。另一独立 Main observer/source 不因此自动获得可信证明；真正生产发布时需确保旧确认源不可在进程冷启动重新水合，也需要真正的 Main 人工观察事件与 Owner 授权来源。

独立新测试文件 `review-v3-main-removal-consent.test.ts` 首次 `b927d04bbecc12896956f4dcfd367e4fc6071505`，最后 `66f89699260ef181fffdb556394f05a2b8aa8407` 补同源重新安装拒绝；正反例含：同一审批 ID 只能用一次、无 Main 观察源 fail-closed、精准版本/身份/义务/理由绑定、5 分钟 TTL/未来时间拒绝、4096 容量整门禁关闭、同源 reinstall 仍拒绝重放。当前最终候选为 `66f89699260ef181fffdb556394f05a2b8aa8407`，PR CI `39339668422`、Baseline `39339668453`、Batch `39339668360`、D1 `39339668400`、D2 `39339668358`，**尚未独立最终签 Gate O**。须读取原始新 SHA TS、全 Bun 与专项再签。

## 全量 Bun 首次成功执行后的遗留夹具失败

C 候选 `66f89699260ef181fffdb556394f05a2b8aa8407`：PR CI [39339668422](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339668422) job `118358979451`：TS、boundaries、skin、三端 Electron build 全通过，原始 Bun **4159 PASS / 5 SKIP / 1 FAIL（4165 tests/479 files）**；Baseline `39339668453`、Batch `39339668360`、D1 `39339668400`、D2 `39339668358` **4/5 SUCCESS**，不得签。
唯一失败是原先已绿的 `C-MAIN-WIRE-R02 ... published Plan writer can be installed independently` 在 `review-v3-main-author-plan-ipc.test.ts:327`：该测试模拟只安装 writer 时使用一个精简对象字面量，仅注入旧 `getCaseGrant/canUpgradeCase/publishedPlanSource`，忘记加入当前强制删除必须有的物理 Main `removalConsentSource`；CAS 正确拒绝，旧断言期待 `true` 因而失败。**不是**发布者/Case 原件或新审批逻辑被绕过。

修复提交 `67960811880e0a84bf62eb6f828ea6c72a101901`，仅修改该 C-owned **旧测试夹具**，从已存在的 `f.authority.removalConsentSource` 注入独立 Main 观察源。生产 `consent` gate、默认 fail-closed、原来的精确 identities/Owner/TTL/one-use 否决未弱化。最新准确 CI 状态应按此新 SHA 重新查询 PR + 4 专项全部结果。

## 最终精确 SHA 质量签收

C #144 最新唯一工程 SHA `67960811880e0a84bf62eb6f828ea6c72a101901`，相对已签 `C-MAIN-B20-R01@d5a61304ddb09c38fea7982623786f0ce56ed220` 对比 **9 commits、4 个 C-owned 文件、0 B/A/I/shared/Preload/SchoolPort 修改**。实体生产变更只含真实注册的 `review-v3-main-author-plan-ipc.ts` Main-CAS handler + 独立 Main one-use consent gate，**不替换 C Case 事务、不开新 IPC、不让 Renderer 执行同意授权**。

同一 SHA GitHub Actions **5/5 completed SUCCESS**：
- PR CI [39340406876](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39340406876) job `118360234929`：frozen deps、全仓 TS、package boundaries、built-in skin、Main+Preload+Renderer build，原始 Bun **4,160 PASS / 5 OS SKIP / 0 FAIL（4,165 tests / 479 files）**。
- Baseline `39340406742`、Batch `39340406718`、D1 `39340407022`、D2 `39340406724`：4/4 success。
- 原始 Bun 新 `C-MAIN-REMOVAL-R01` 测试 **10/10 PASS**：4 个真实 Main IPC+Case CAS fixture，6 个独立 one-use gate 负例；前次唯一失败的独立 C-MAIN-WIRE-R02 published Plan writer fixture 同 SHA **PASS**。
- 唯一共享权威 `DECISIONS:C` 与 `STATUS:C` 正式 `C-MAIN-REMOVAL-R01-FINAL-EXACT-GATE-O / PASS_EXACT_SHA_67960811`，[commit `4bb40300f60538b55ee1ddb5c4c1568b729a22f7`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/4bb40300f60538b55ee1ddb5c4c1568b729a22f7)。

**依然不是可使用的学校业务功能**。尚未由真实 Main OS 对话框回调安装 observation source；安装源缺失时此安全修复刻意拒绝所有删 Check 的升级，而不将 Renderer ACK 伪称真实人类确认。真实 school publisher、B20 来源真 Main 接线、Electron Gate E、学校政策授权 Gate L 与实际非开发者 UAT Gate P 全未完成；C 工作优先级继续是**真实 trusted Principal/Owner/native picker 的 B20 Main 装配与 Main 人机确认源实机验收**，再进入跨 PID durable Run recovery。
