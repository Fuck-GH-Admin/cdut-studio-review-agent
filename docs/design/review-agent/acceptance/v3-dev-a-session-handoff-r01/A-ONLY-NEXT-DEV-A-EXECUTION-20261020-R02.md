# CDUT Studio Review V3｜下一任 Dev-A 专属执行书（R19-08 / R20，2026-10-20，R02）

> **A_ONLY_NEXT_SESSION_TASK / FOR_NEXT_DEV_A_ONLY / NOT_SHARED_ABCI_RULE**
>
> 仅下一任 Dev-A 应阅读本书。Dev-B、Dev-C、Integrator-I 无需阅读、无需 ACK。所有跨线规则/权限仍以 #145 DECISIONS:C 为准。本文件不是生产 Main/Provider/Host/业务 writer 授权。

## 一、立即恢复（禁止重复旧 R19 工作）

1. 仓库 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent 。你是 Dev-A，工程 Draft #143 feat/v3-dev-a-pi-execution-r01；已确认最新绿色精确 HEAD **341c01144a5960b47f915461ee9d5e26a570ae20**，PR 未合并。先实时查 GitHub HEAD/CI，禁止假设其不变。
2. 先读同目录 A-only 总交接 A-ONLY-SESSION-HANDOFF-20261020-R02.md，再读 #145 唯一协议 DECISIONS:C / STATUS:A/B/C/I。A 只可改 STATUS:A；C #144 正式批 CR-A-R17-R19-SECURITY-SOURCE-R01 仅允许四个较旧的 R19-04 测试 blobs 后续隔离 I 技术复演，**不包含 A R19-05–07 新 blob**。I4 A18 #153 和 B18 #154 都已由 C 各自精确限定签收，绝不能将其误认成现场 Main/Provider/业务发行权。
3. 当前 #143 R19-07 的 PR CI 39337965334、D2 39337965399、Baseline 39337965345 **同一 SHA 3/3 GREEN**，原始 Bun **4177 PASS/5 OS SKIP/0 FAIL**；R19-07 评论 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143#issuecomment-6279190590 。回滚 R19-06 为 87cf182f4cfc970d39670658e89f038924989042。R19-08 从未开始，须真实提交+验收。
4. 本批不复制旧 R19-01/07 测试冒充新工作。R19-07 覆盖的是 **已经 Turn=1 落盘之后 Dispatch settlement CAS 前/后真 SIGKILL**。新 R19-08 的缺口是 **真实 Pi 已完成之后 Turn Journal 自己的 CAS 前/后真 SIGKILL**。

## 二、R19-08 工程实施约束

先核读这些真实文件：
- apps/electron/src/main/lib/review/review-v3-native-pi-crosspid-r19.worker.ts （现行 blob f3452061c750fd1d206e82720ac904552cb823cb）
- review-v3-native-pi-sigkill-settlement-r19.test.ts （现行 blob b5981414dd68e16867b783fdb721036b97683f86）
- review-v3-execution-turn-budget.ts；review-pi-owner-adapter.ts；review-v3-main-sdk-turn-bridge.ts；review-v3-sdk-dispatch-fence.ts；review-v3-pi-http-provider-engine.ts
- 参照 review-v3-native-pi-settlement-fault-r19.test.ts 和 review-v3-sdk-native-complete-crosspid-r19.test.ts 的真实 SDK、reopen 与 receipt 断言。

**必须形成两个独立 Linux OS PID 负例**：运行真实 Pi 0.86.1 createAgentSession()+真正 SDK 消费受控 .invalid HTTPS Responses SSE、clean EOF、全部 native lifecycle 与一个受控物理 test-fetch。SDK 已完成后，在 V3ATurnBudget.recordCompletedTurn 对真实磁盘 Budget file compareAndWrite 中设置精确 CAS kill 点：
- R19-08A：budget CAS **写盘之前** SIGKILL。原 dispatch intent 已 durable in-flight；真实 Turn 原盘仍 0；无正式 proposal/Host business ack。
- R19-08B：budget CAS **提交 rename/fsync 之后、返回之前** SIGKILL。原 dispatch intent 仍 durable in-flight；真实 Turn=1；不得凭旧 SDK 已完成的回执清除未知 dispatch，也不得多计同一 turn。
- 测试严格通过 OS 子进程退出 signal SIGKILL、原生 SDK event trace、由受控 fetch 同步生成的真 PID/dispatchId/Owner epoch marker、磁盘 journal hash/receiptId、CAS 前后 readback 来证明定位。对真实 abort、SDK success 和写盘状态不可通过“测试声称已发生”代替。
- 验证实际 Owner.write-lock orphan：新独立 PID 第一次自动恢复须 fail-closed、不得擅自删除；仅在专属测试 fixture 已 wait/reap SIGKILL 且检查一致性之后，才显式模拟外部可信 operator 修复并重新打开账本。**这不是生产自动锁清理**。
- 恢复验证：旧 Owner recovery-required；同 Case 换 Run/Attempt/Owner 的新 claim 被阻断；独立 Case 可合法授权时不被过宽全局锁误封；新的 Provider 请求 0、业务 proposal 0；不接受旧 receipt 给新 claim。
- 生产技术漏洞若真实暴露只修改 A-owned 文件并补实际反例，别为让测试绿而篡改 SSE clean EOF、Run hash/Owner CAS、派发未决隔离。不要修改 C Main/IPC/Preload、packages/shared、普通 Pi 等 C/I/B 所属边界。

## 三、以后 R20 与跨线依赖（不要冒险提前做）

1. R19-08 全绿后，再评估 **受信锁恢复和 operator reconciliation**，其中无法仅靠 PID/mtime 判断孤锁；测试必须覆盖旧进程仍存活、PID 复用、并发 Main 写入、Owner epoch 漂移、FS 一次性 CAS。先 A-only 完成独立负例/设计验证，**任何正式跨 Main 锁抢占、授权/业务 write API 都必须先 C exact CR**，批准之前不能写入生产接线。
2. I 已拿到旧 R19-04 四测试来源的固定有限准入；如 I 想导入 R19-07/08 新 worker 或 R20 API，必须由 I/C 另按最新 path、SHA、blob、ABI/依赖申请，不能以此前 CR 通用授权升级。
3. 若真实接线权限、学校政策/原件 Publisher、独立 privileged Host 证据、远程 Provider 等仍缺失，Gate E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO。所有研究/测试都不可声称产品已经具备 Demo/生产闭环。

## 四、施工与 CI/交付

- 改动只放 A Draft #143，最好按功能连续实际提交；使用 expected_sha 非强推 fast-forward，其他会话可能并行改文档。保留绿色回滚 341c01144a5960b47f915461ee9d5e26a570ae20。
- 代码单元/跨 PID/跨进程测试写完后要求 **同一新完整 SHA** 的 PR CI、D2 Scoped Pi Review Tests、Review Baseline 三项 completed/success。PR CI 还需 frozen deps、TS、packages boundary、skin、Electron Main/Preload/Renderer build、全量 Bun；在 raw job logs 中看 R19-08A/B PASS。
- 如 CI 首败，保存失败 SHA/job/stack 和失败类别；若 checkout/github.com 网络故障，可重试同 SHA 的 failed job，但不得报告为代码 PASS 直到重跑成功；如代码失败，修复新 SHA，三套重新验收。
- 真通过后 #143 留下 final exact-SHA 工程说明（首败、代码差异、两处 crash window、验证证据、局限、rollback、Gate），在 #145 **只更新 STATUS:A**；不触及 DECISIONS:C 或其他线状态。A-only 专属会话文档可独立更新，但禁止改变 A 已签代码 SHA 做纯文档。
- 新会话应直接开发，不需要再次问用户仓库、角色、批次、是否继续；如果现场工具有限，清晰报告限制，尽可完成现有工具支持的真实工作。

**工程完成定义不是又写一份计划，而是新增 R19-08 真实进程 + SDK + Turn CAS 失败点 + cold restart 证据，三 CI 精确绿色；跨线/生产 Gate 未获权就仍 NO_GO。**
