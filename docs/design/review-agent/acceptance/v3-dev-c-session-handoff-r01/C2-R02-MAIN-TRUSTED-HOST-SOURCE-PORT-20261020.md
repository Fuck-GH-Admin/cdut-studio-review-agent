# Dev-C C2-R02｜Main Owner/Host/真实原件可信消费端口与 Gate O

> **C_ONLY_SESSION_MEMORY / NOT_SHARED_ABCI_POLICY**：本文件只解释 C 自身本批实施、源码边界和离线回归，不向 A/B/I 授权。跨线唯一裁决见 #145 四线共同协议的 `DECISIONS:C`。

## 固定输入与代码

- 仓库 `Fuck-GH-Admin/cdut-studio-review-agent`；C 工程 [Draft PR #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)，分支 `feat/v3-dev-c-business-r01`。
- **前一已通过 C2-R01 工程基线**：`3242b22a0825eec347b2748680bb746eb0f55215`（PR CI、D1、D2、Batch、Baseline 同 SHA **5/5 成功**）。I2 已由 C 正式授权使用这一基线，**不能自动切换到本批新开发 SHA**。
- **本批新增文件**：
  - `apps/electron/src/main/lib/review/review-v3-main-trust-port.ts`：C-owned `createC2MainTrustedRunPort`，提供 `admit/record/seal` 三个接口。每次业务 CAS handler 内再次从**Main 注入的活 Owner/grant 和注册物理 Host 回执库**取得证据，核对 `RunEvidenceIdentity`、`ownerGeneration`、`inputManifestHash`、grant、事件 Host 来源，并委托已有 C2-R00/R01 CAS ledger/Run writer。没有 Main adapter 任一项即 fail-closed、不会从前端传入 mock/Renderer Actor，不接正式 IPC。
  - `assertC2PhysicalOriginalBytes`：对 `CaseAggregateV2` 所选当前 `DocumentVersion` 源原件文件从业务配置目录实际重新读取 SHA-256；要求唯一活跃版本、登记 byteHash、目录内相对路径、realpath 不逃逸及真 regular file；拒绝绝对/../逃逸/符号链接到外部/原件字节变化。**不是**仅对 DTO `rawSha256` 与 `byteHash` 做字符串相等。
  - `apps/electron/src/main/lib/review/review-v3-main-trust-port.test.ts`：用临时真实磁盘原件跑完整 C2 CAS 技术链，在 Main/Host **合成已验证 Port** fixture 下，复验物理读→Check→技术终态→不可变 Run + 无 School Decision；检查无注入端口、候选 Plan、Owner revoke、grant rotation、丢失的 Host receipt、跨 Run 冒用、软链逃逸/原件 SHA 变化及终态后冷 Registry 丢失无法 Seal。
- **原有文件/接口**：本批不动 `review-c0/1` DTO、不动 C `review-v3-execution/1`/Run writer 稳定合同，不改 Preload/Renderer/IPC，不覆盖 V2 旧业务流程。保持 I2 唯一 C 锚点为 R01 新旧来源锁，I Main/Biz writer 无任何新租约。

## 真实性与不能冒充的能力

本批 `getCurrentOwner`、`getPhysicalHostReceipt`、`assertPublishedPlan` **由将来的实际 Electron Main 所持 trusted adapter 注入**；测试中的 Host 回执均为明确合成 fixture，不能代表 A Pi SDK 真物理 Provider 请求、学校身份、校方正式 policy/Gold 或真实 Electron/多 PID Gate E。**Main 生产 SDK factory / B1 出版验证器尚未接线**，故此模块是安全端口已开发，不是正式审核执行按钮已可用。

此外 `state.v2.json` 的 CAS 队列仍是同进程串行，不能自动保证跨 PID 与外部 source-file 在重新计算至持久业务提交之间零竞态；C4 需跨对象锁/fence、fsync/ENOSPC/断电恢复。冷启动不能从已提交的 proposal body 逆造活 Host 回执。

## 单一新 SHA Gate O 测试标准

将本批最后工程 HEAD 固定为不可变 40 位 SHA，CI 必须五条单独与该 SHA 对齐：PR CI、Review Baseline、Review batch focused、D1 Authoring、D2 Scoped Pi；完成后复核真实 GitHub job/step/log/exit。

集中重点：

```bash
git rev-parse HEAD
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test --isolate \
  apps/electron/src/main/lib/review/review-v3-main-trust-port.test.ts \
  apps/electron/src/main/lib/review/review-v3-technical-ledger.test.ts \
  apps/electron/src/main/lib/review/review-v3-run-writer.test.ts
bun test --isolate --timeout 30000
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
```

如果最新 CI 暴露 TypeScript 或新真实测试错误，先核实具体失败命令/行号和回归语义，修复仅 C-own 文件后固定**新的** SHA 重新集中 Gate O，不移除负例、不借父 SHA pass。E/L/P 仍独立 NO-GO。

## 下一步

1. 先签本批唯一精确 SHA 的离线 Gate O（不得用 I2 已授权 R01 基线替代）。
2. C 与 A 新 SDK 实际 Main factory/Host token registry、B 作者出版来源验真进行接口 CR，严禁把旧 A `review-c0/1` outbox local ACK 当成 C2 receipt 或把 B candidate-held 模板当出版政策。
3. 真正生产路径注册可信 Electron Main adapter；补物理 Provider/文件替换、跨 PID 和可中断 SDK Gate E 集中验收。
4. 后续 C-Tx 跨文件 Case/Run commit intent、C3 BatchAttempt/Decision basedOnRunId、C4 Outbox、C5 UI/UAT 依设计顺序推进。

**权限**：I1 技术检查点已由 C 接收；I2 只能使用其已签的新 C R01 锚点，除非 C 针对此 R02 SHA 另发授权。I Test lease 原样；Main port lease CONDITIONAL_NOT_ACTIVE；I Business writer DENIED。
