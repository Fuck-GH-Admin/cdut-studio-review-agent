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
