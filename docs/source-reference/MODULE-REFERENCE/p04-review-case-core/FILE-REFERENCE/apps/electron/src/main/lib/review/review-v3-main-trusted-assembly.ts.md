---
path: apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 04a5fd6e87b04d3f78de6caf2da5401a92d0905b
sha256: bc4f028542e6faaf79e0f62570ec4224f9e13642a6f5fa5cc50f14941aa23be0
lines: 151
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.ts

## 1. 结论与边界

Dev-C C2-R04：C2 提议、专用 Pi、独立观察物理 Host 回执的**唯一 Main 本地装配**。不是生产 Electron/IPC/Provider 入口：可信发布者、Owner 注册表、物理 Host 观察器与 SDK 构建器仍是特权外部注入依赖，须在真实 Gate E 前接线并独立认证；合成输入仅限测试（文件头 `apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.ts:1-12`）。

关键语义：**关闭装配即撤销全部暴露入口，包括台账在异步事务前已捕获的回调**（`:8-9`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 1 个类 = 2 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2MainTrustedAssemblyAuthority` | 接口（导出） | 35-42 | `C2MainPhysicalHostSource` + `trustedOrigin` + `assertPublishedPlan` + `createFreshSession` | 单一特权权威 |
| `C2MainTrustedExecutionAssembly` | 类（导出） | 47-151 | 见 §3 | 装配本体 |
| `TechnicalPort` | 内部 | 44 | `ReturnType<typeof createC2MainTrustedRunPort>` | |

类成员：`closed`/`registry`/`pi`/`technical`（`:48-51`）；构造 `:53-88`；`requireOpen` `:90-93`；`rememberObservedHostReceipt` `:96-99`；`invalidateRun` `:102-105`；`invalidateRunDurably` `:112-122`；`createPi` `:125-128`；`admit`/`record`/`seal` `:130-143`；`close` `:146-150`。

## 3. 内部逻辑与关键流程

### 3.1 构造（`:53-88`）

- 权威四方法齐全，否则 `ACTOR_UNTRUSTED: One privileged Main Plan/Owner/Host/Pi authority is required`（`:54-60`）。
- 包装 `inputs`：`getCurrentOwner`/`getObservedPhysicalReceipt` 在 `closed` 后返回 `undefined`（`:61-65`）。
- `published` 包装：先 `requireOpen` 再委托（`:66-69`）。
- `registry = new C2MainPhysicalHostReceiptRegistry(inputs,{isRunFenced:isC2RunDurablyFenced})`（`:70-73`）——注入持久围栏。
- `pi = new C2MainPiAgentSessionFactory({trustedOrigin,assertPublishedPlan:published,getCurrentOwner,createFreshSession:…requireOpen…})`（`:74-82`）。
- `technical = createC2MainTrustedRunPort({assertPublishedPlan:published,getCurrentOwner,getPhysicalHostReceipt: id=>closed?undefined:registry.getPhysicalHostReceipt(id)})`（`:83-88`）。

### 3.2 入口

- `requireOpen`（`:90-93`）：关闭后 `RECOVERY_REQUIRED: C2 Main authority disposed; a cold registry cannot be rehydrated`。
- `rememberObservedHostReceipt(id)`（`:96-99`）：只接受独立特权 Host 观察器记录的回调 ID（`:95`）。
- `invalidateRun(run)`（`:102-105`）：显式 Run 撤销，全部旧 ID 进程内墓碑。
- `invalidateRunDurably(run,command,authorize)`（`:112-122`）：**C-only 持久 Run 失效**：`command.payload.run` 的 caseId/runId 必须与目标一致（`fence command targets different Run`，`:96-98` 区段 `:91-92`）；`fenceC2HostRunDurably` 先提交 Case CAS+Receipt；**CAS 失败则内存注册表不标记持久撤销**（`:85-88` 注释 + `:94`）；成功才 `registry.invalidateRun`。绝不以 A 技术提议/SDK 传输回执为授权者（`:86-87`）。
- `createPi(input)`/`admit/record/seal(...)`（`:125-143`）：`requireOpen` 后透传。
- `close()`（`:146-150`）：幂等；`registry.close()`；绝不从 journal 事件重建 Host 回执（`:145`）。

## 4. 调用者与调用链

入向（冻结树 grep）：**无生产调用者**（模块名/类名在 `apps/`+`packages/` 非测试 `*.ts`/`*.tsx` 0 命中）。测试：`review-v3-main-trusted-assembly.test.ts:15-16`（本批 5 例）。

出向：`@profer/shared`（`C0ContractError`/类型）；`review-v3-durable-host-fence.ts`（`isC2RunDurablyFenced` 定义 `:60`，`fenceC2HostRunDurably`/`C2MainAuthorizeRunFence` 同文件）；`review-v3-main-trust-port.ts:184`（`createC2MainTrustedRunPort`）；`review-v3-main-pi-factory.ts:107`（`C2MainPiAgentSessionFactory`）；`review-v3-main-host-receipt-registry.ts:86`（`C2MainPhysicalHostReceiptRegistry`）。

## 5. 数据 I/O、读写与副作用

- 无直接磁盘；写入经 `technical.admit/record/seal` 与 `fenceC2HostRunDurably` 的既有事务。
- 副作用：构造三个内部组件（registry/pi/technical）；`createFreshSession` 是外部注入。
- 并发/原子性：`closed` 标志 + 包装回调的 `undefined` 语义（`:61-65,86-87`）；持久失效先 CAS 后内存（`:94`）。
- 幂等：`close` 幂等（`:147`）；冷进程不可重建（`:92`）。

## 6. 分支、失败、取消与恢复

| 失败 | 语义 | 行 |
| --- | --- | --- |
| `ACTOR_UNTRUSTED: One privileged Main…authority is required` | 构造 | 62-63 |
| `RECOVERY_REQUIRED: C2 Main authority disposed…` | 关闭后调用 | 66（registry 层）/92（requireOpen） |
| `RECOVERY_REQUIRED: fence command targets different Run` | fence 目标错 | 98 |
| registry/pi/trust-port 各自拒绝 | 透传 | 见各手册 |

- 失败后状态：`close` 后全部入口拒绝；`invalidateRunDurably` CAS 失败时内存不标记（`:94`）。
- 恢复：无（冷进程需重新装配并重新观察）。

## 7. 权限与权威状态

- 单一特权权威注入（`:35-42`）；合成输入仅测试（`:5-7`）。
- 关闭即撤销一切（含已捕获回调，`:8-9`）；持久 Run 失效的授权者是 C 的 Case CAS+Receipt，不是 A/SDK 回执（`:85-87`）。

## 8. 修改影响面

- 改构造/方法影响 `review-v3-main-trusted-assembly.test.ts` 5 例与未来 Gate E 接线。
- 改 `invalidateRunDurably` 影响 `review-v3-durable-host-fence.ts` 契约。

## 9. 测试证据

直接测试：`review-v3-main-trusted-assembly.test.ts`（222 行，5 例，详见其手册）：单一权威共享（admit/createPi/record + 自证拒绝 + 独立观察后 record 成功）、candidate-held/轮换/原件篡改不可绕过、Run 失效墓碑 + close 后 disposed、异步 createPi 期间 close→dispose+拒、缺权威构造拒绝。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`invalidateRunDurably` 无用例、`seal` 入口无用例、`closed` 包装回调 `undefined` 语义无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 关闭撤销全部入口 | 已证实 | `:8-9,61-65,90-93` |
| 持久失效先 CAS 后内存 | 已证实 | `:85-94` |
| 无生产调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`/`*.tsx`） | 0 命中 |
| 冷进程不可重建 | 已证实 | `:92` |
| `invalidateRunDurably` 行为 | 未知 | 无用例 |
| Gate E 生产接线 | 未知 | 注释自述待接线（`:5-7`） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/包装 | §3.1 | 53-88 | covered |
| `requireOpen`/各入口 | §3.2 | 90-143 | covered |
| `invalidateRunDurably` | §3.2 | 112-122 | covered（源码）；unknown（断言） |
| `close` | §3.2 | 146-150 | covered |
| 权威/关闭语义 | §7 | 35-42,85-93 | covered |
| 生产接线 | §4 | 检索记录 | covered（范围已声明） |
| fence/seal 断言 | §9,§10 | — | unknown |
