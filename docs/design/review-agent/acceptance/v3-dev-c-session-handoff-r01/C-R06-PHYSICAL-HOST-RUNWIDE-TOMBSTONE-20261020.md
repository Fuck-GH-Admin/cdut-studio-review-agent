# Dev-C C2-R06 | Physical Host Run-wide invalidation / late ingress fencing

> C-ONLY ENGINEERING EVIDENCE / NOT_ABCI_SHARED_POLICY。本文只给 C 用户与后续 Dev-C；A/B/I 不必读/ACK，不作为四线权限或新 Source Lock。唯一正式决议以 #145 DECISIONS:C 为准。

## 精确工程范围（只改 C-owned 源）

- C #144 已签前批 C-MAIN-WIRE-R02 `5005ecd7a034d6e983fca5e377d3da751e5a8811`，GitHub 5/5 Gate O（Bun 4138 pass/5 OS skip/0 fail）。
- R06 首个源码提交 `de5e26647f55c0e968899c528d396cb523b3c789`：`apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.ts`。
- R06 同批安全负例提交 `81dfe52a741d5f1f1648faa4fdc1b81d2dfe063a`：`apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.test.ts`，新增 4 项真实正反例，修正旧用例对应的新拒绝语义。
- 本次精确 SHA 的 GitHub CI **初始 PENDING**：PR CI `39327669157`、Baseline `39327669023`、Batch `39327669064`、D1 `39327669041`、D2 `39327669029`。必须以后续同 SHA 完成结果正式签署，不能继承 R02 旧绿。

## 核查发现的安全边界

此前 `invalidateRun` 仅遍历内存中已经登记的 physical Host 回执，删除匹配**完整 Run DTO** 的 ID。后续独立 Host observer 若第一次报告一个同 Run 的全新 `hostReceiptId`，且其 current Owner 仍然 active，旧 `rememberObservedReceipt` 可以重新登记。这是已有源码真实语义允许的潜在迟到回执复活，属于进程内 Run-wide revoke 漏项，并不是宣称已发生过用户数据事故。

修复：
1. `invalidateRun(run)` 先以 `JSON.stringify([caseId,runId])` 建立一次登记、永久**本 registry 实例**有效的 tombstone；该键不含 attempt/Owner generation，因此无法通过在同 Case 重用原 RunId 绕过。
2. `rememberObservedReceipt` 在独立 observer 当前物理 Host 身份回调后、接收与写入前先检查 Run fence，拒绝未知或迟到 ID；`getPhysicalHostReceipt` 对已登记历史也先检查，返回 undefined。
3. 按 RunId+CaseId 清除该 Run 所有已登记回执。重复 invalidate 幂等且不会释放 tombstone；同 Case 真正新 RunId 仍可独立被登记。
4. Tombstone 最多 8192 个，达到容量绝不驱逐旧 deny fence；将整个 registry 封闭并继续拒绝所有 receipt。普通 `close()` 仍禁止任何恢复。
5. 保持 `C2MainPhysicalHostReceiptRegistry` **仅进程本地**；真实 Main 重启后的跨 PID crash fencing 不可凭这个 Set 继承，仍依赖 C Case/Run 持久 ReviewRun recovery gate / C-Tx / 独立 Main Owner 状态。**没有将本进程内状态误称持久实体 ACK**。

## 新用例

- R06-01：Run 尚未拥有任何 observed ID 就被 invalidate，稍后物理 observer 才出现新的 ID，禁止新登记和 readback；重复 revoke 仍拦截。
- R06-02：相同 Case + RunId、不同 attempt / Owner generation 并配合另一个声称合法的当前 Owner，仍被同 Run-wide fence 拦截。
- R06-03：同一 Case 真正新的 RunId（独立 current Owner）正常工作，撤销老 Run 不误挡新 Run；旧已登记回执不可复活。
- R06-04：8192 个 tombstone 容量耗尽，整个 registry 直接关闭拒绝，不允许 FIFO/LRU 删除旧围栏产生 late resurrection。
- 原 R03 既有重复观察、物理伪造、Owner 撤销、Run attempt 不一致、不同 sourceVersion/receipt rebound 和 close 负例必须继续通过。

## 签收边界

只有 GitHub 同 SHA PR CI + Baseline + Batch + D1 + D2 全成功、全量 Bun 新 4 用例从原始日志独立核验才能签 `C-C2-R06-EXACT-GATE-O`。即便签过也仅是**进程内 Main Host 技术安全**，不是 Pi 真实 Provider、物理真实 Electron Gate E、完整崩溃后 durable Run fencing、School L/P 或发布。B R20 接口任务已异步通知 #142，C 不应等 B。
