---
path: apps/electron/src/main/lib/review/external-ports.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 50222aaa3b631ff1cedb395a70cd5d731e1eeb96
sha256: c28eeb0d1b32e75ec615c96311595c172a7cd227a84f3d988f99623de0a85f86
lines: 82
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/external-ports.test.ts

## 1. 测试目标

外部端口单测（文件头 `:1-3`，M5，C01/C02）：幂等/冲突/离线包往返，同一合同两实现。被测：`MockSchoolAdapter`、`LocalPackageAdapter`（`external-ports`）。夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/t09-port-{pid}`（`:9-11`）；`payload()` 构造器。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**6 test**：

### 2.1 MockSchoolAdapter（C 类模拟，4，`:17-55`）
1. `:18-23` 首推：`accepted`、`externalId==='ext-c1-1'`（版本+1）。
2. `:25-30` 同 actionId 重放：`second.id===first.id`（幂等）。
3. `:32-46` 综合：seedCase/seedTask/seedVerification 后 `fetchCase.source==='mock'`、tasks 1、`verify==='verified'`；push 后 `getReceipt` 同 id、case revision 1；**同 actionId 异 body → `rejected`**（载荷漂移）；`setOnline(false)` 后 `listTasks` 抛 `MOCK_PORT_OFFLINE`。
4. `:48-54` 版本推进：`seedRevision('c1',5)` 后持 3 推送 → `conflict`、message 含“外部版本已推进”（C02）。

### 2.2 LocalPackageAdapter（2，`:57-82`）
5. `:58-70` 两段式：push → `awaiting-receipt`；`getIssuedPackage` payload.actionId 正确；`buildAcknowledgement(true,'线下已收到')`；**重建 adapter**（重启等价）`confirm` → `accepted`；再 push 返回同一回执 id。
6. `:72-81` 同 actionId 异载荷 → `rejected`；`new LocalPackageAdapter(()=>9)` 版本变化后 `confirm` → `conflict`。

## 3. 真实断言

- #3 覆盖 Mock 全能力面（读/核验/回执/漂移/断线），“断线不伪造成功”为测试名断言。
- #5 用**重建 adapter**（`new LocalPackageAdapter(() => 0)`）证明状态在磁盘 issued 文件（重启存活）。
- #6 的 `()=>9` 版本函数制造导出后版本变化 → confirm 冲突分支。

## 4. 未覆盖与脆弱点

**未覆盖**：`confirm` 四要素不匹配 throw；`buildAcknowledgement` 导入失败 throw；`confirm` 终态幂等（accepted 后再 confirm）；Mock `seedRevision` 对 caseView 的同步；`capabilities()` 形状。

**脆弱点**：CONFIG_DIR 用 pid 隔离；`externalRevision` 用闭包函数注入（`() => 0/9`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、6 test | 已证实 | `:17/:57`；`grep -c test(`=6 |
| 幂等含载荷身份 | 已证实 | `:25-30`、`:72-76` |
| 版本 conflict（C02） | 已证实 | `:48-54`、`:79-80` |
| 两段式+重启存活 | 已证实 | `:58-70` |
| 断线不伪造成功 | 已证实 | `:44-45` |
| confirm 校验/终态分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| Mock push/幂等/能力/冲突/离线 | #1-#4 | `:18-54` | covered |
| Local push/confirm 两段式 | #5 | `:58-70` | covered |
| Local 漂移/版本冲突 | #6 | `:72-81` | covered |
| confirm 校验 throw/终态幂等 | — | — | unknown |
