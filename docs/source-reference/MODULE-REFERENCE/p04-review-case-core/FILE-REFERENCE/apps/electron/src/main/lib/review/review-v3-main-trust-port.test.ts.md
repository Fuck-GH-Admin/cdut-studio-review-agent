---
path: apps/electron/src/main/lib/review/review-v3-main-trust-port.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8338e5de998718bb136e0004bc7bf66237479960
sha256: 513322ab420213eeb5584021f8aaaa4319ce2aca1cd9c2c79aab781294fe9914
lines: 269
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-trust-port.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 C2 Main 物理 Host 与当前 Source 信任端口（`assertC2PhysicalOriginalBytes` + `createC2MainTrustedRunPort`）：缺 Main 权威端口拒绝且不装 Renderer 回退；真实磁盘字节 + 活 Owner + 注册 Host read/check/terminal 才能 seal 到 human-review；缺源/篡改/路径穿越/符号链接阻断 admit；candidate-held/撤权/轮换不得 ACK；跨 Run 回执替换与缺 Host 拒绝回执变更；冷 Host 丢失/撤权/原件变更禁 seal。

## 2. 用例清单

共 7 个 `test(`（`review-v3-main-trust-port.test.ts:170-268`，单一 `describe`）。

夹具（`:88-168`）：真实 `createAggregate` 案卷（原件 `original.txt` + block1 + `stage:'reviewing'`）+ `canonicalPlan`（`templateVersion:'2'`、单 binding `rule-1`）；注释自述 contract-only 合成 publisher/Owner 夹具（`:113-114`）；`addHost/revoke/rejectPlan/wrongGrant/removeHost` 控制柄；`admit/record/seal` 辅助走真实端口命令。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | rejects missing Main-owned source ports, never installs renderer fallback（`:171`） | `createC2MainTrustedRunPort({} as never)` | `toThrow('REQUIRED')` |
| 2 | real on-disk bytes + live Owner + registered Host Read/Check/terminal seal to human-review only（`:175`） | admit + read/check/terminal 逐条 record + seal | `admit.ok===true`；三条 `record.ok===true`；`seal.ok===true`；`entity.state==='requires-human-review'`；`coverage` `toMatchObject({totalBindings:1,observedBindings:1,unobservedBindings:0})`；`decisions` `toEqual([])`；`stage` 仍 `'reviewing'` |
| 3 | missing actual saved source, byte tamper and path traversal block admission（`:196`） | 改字节；`assetPath='../outside-file'` | 两次 `admit.ok===false` 且 `v3TechnicalExecution` 为 `undefined` |
| 4 | physical source symlink escape is rejected before any host event（`:209`） | 外部文件符号链接替换原件 | `admit.ok===false`；`receiptLog` 长度 0 |
| 5 | candidate-held Plan, revoked owner and rotated grant cannot gain durable ACK（`:219`） | `rejectPlan`；record 前 `revoke`；record 前 `wrongGrant` | `admit.ok===false`；两次 `record.ok===false` |
| 6 | cross-Run Host receipt substitution and missing physical Host deny receipt mutation（`:237`） | 无 Host 直接 record；`addHost` 换 attemptId | 两次 `record.ok===false` 且 `events` `toEqual([])`；补正确 Host 后 `record.ok===true` |
| 7 | cold Host registry loss, revoked Owner or changed original forbids sealing even after terminal（`:249`） | 三组：seal 前 removeHost/revoke/改原件 | 三次 `seal.ok===false`；`v3ReviewRun` 为 `undefined`；`decisions` `toEqual([])` |

## 3. 真实断言

- 用例 2：`expect(outcome.entity?.state).toBe('requires-human-review')`（`:188`）；`expect(outcome.entity?.coverage).toMatchObject({...})`（`:189-191`）；`expect(readAggregate(f.id)?.decisions).toEqual([])`（`:192`）。
- 用例 3-4：`expect((await admit(f)).ok).toBe(false)`（`:199,205,215`）；`expect(readAggregate(f.id)?.v3TechnicalExecution).toBeUndefined()`（`:200,206`）；`receiptLog` `toHaveLength(0)`（`:216`）。
- 用例 5-7：`expect((await record(g,ev)).ok).toBe(false)`（`:228,234,241,243`）；`expect(readAggregate(f.id)?.v3TechnicalExecution?.events).toEqual([])`（`:244`）；`expect(denied.ok).toBe(false)`（`:264`）。

夹具/mock 边界：案卷/原件/plan 真实落盘（case-store-v2）；`assertPublishedPlan`/`getCurrentOwner`/`getPhysicalHostReceipt` 是内存 mock（`:121-135`）；无 Electron/IPC/网络。

## 4. 未覆盖与脆弱点

- 未覆盖：`verifyHost` 的 verified.kind 不匹配、`seal` 重复 receiptId、`record` 事件内容（C 校验器）、`getConfigDir` 根缺失、并发。
- 脆弱点：用例 1 `toThrow('REQUIRED')` 子串匹配 `C2_MAIN_TRUSTED_INPUT_PORTS_REQUIRED`；用例 2 的 coverage 数字依赖单 binding 夹具。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:171,175,196,209,219,237,249` |
| 真实磁盘 + mock 权威 | 已证实 | fixture `:88-135` |
| seal 只到 human-review | 已证实 | `:188-193` |
| 三类 seal 前失效禁封 | 已证实 | `:249-268` |
| 跨 Run 回执拒绝 | 已证实 | `:237-247` |
| C 校验器内容语义 | 未知 | 不在被测范围 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造拒绝 | 1 | 171-173 | covered |
| admit→record→seal 全链 | 2 | 175-194 | covered |
| 字节/路径阻断 | 3 | 196-207 | covered |
| 符号链接 | 4 | 209-217 | covered |
| 非发布/撤权/轮换 | 5 | 219-235 | covered |
| 跨 Run/缺 Host | 6 | 237-247 | covered |
| seal 前三类失效 | 7 | 249-268 | covered |
| 内容校验/并发 | 无 | — | unknown |
