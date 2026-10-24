---
path: apps/electron/src/main/lib/review/review-v3-main-native-removal-observer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cee650e8ab44449dac06868e122499601d0e51ac
sha256: 0d5f8344e6ad456267348502eddc731dcc8433c54acc8a246a0d0a3221cb85f4
lines: 157
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-native-removal-observer.ts

## 1. 结论与边界

C-MAIN-HUMAN-R02：删除 canonical Plan 义务时的**真实特权 Electron Main 原生模态**观察器。绝不是 IPC 或 Renderer 确认（文件头 `apps/electron/src/main/lib/review/review-v3-main-native-removal-observer.ts:1-13`）。

边界：

- 同步模态刻意从既有串行 Case CAS 回调内触发，在 issuer/actor/Owner 复验与 Main 重算删除清单**之后**（`:5-7`）。
- 取消、窗口丢失、文本过长、身份不可解析一律 DENY（`:8`）。
- 即使模态成功，仍需独立的一次性 `CMainRemovalConsentGate`（`:9`）。
- 调用方必须显式把它作为 `removalConsentSource` 与独立授权的学校发布者并装；不建假 issuer（`:11-12`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 1 个 type + 1 个类 + 1 个函数 = 4 个导出（常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainNativeRemovalPrompt` | 接口（导出） | 22-28 | `{title,message,detail,buttonCancel,buttonConfirm}` | 对话框内容 |
| `CMainNativeRemovalDecision` | type（导出） | 29 | `(prompt)=>boolean` | 物理确认回调 |
| `CMainNativeRemovalObserver` | 类（导出） | 44-138 | `implements CMainRemovalWitnessSource` | Main 本地人类观察台账 |
| `createCMainElectronRemovalObserver` | 函数（导出） | 141-157 | `()=>CMainNativeRemovalObserver` | 真实 Electron 消息框 |
| `LIMIT`/`MAX_DETAIL`/`refuse`/`safe`/`sha`/`key` | 内部 | 31-37 | 4096 请求/16000 字符；抛 `C_MAIN_NATIVE_REMOVAL_*`；`key=JSON([caseId,requestId])` | |

## 3. 内部逻辑与关键流程

### 3.1 `observeAtCommit(ctx)`（`:52-125`）

1. 关闭或重入 → `CLOSED_OR_REENTRANT`（`:53`）。
2. 上下文校验（`:54-70`）：caseId/requestId/reason 安全、`currentCaseRevision` ≥0 安全整数、identity 七字段、两个 fingerprint 64hex、`computedRemovedIdentities` 非空数组且与 `acknowledgement.acknowledgedRemovedIdentities` **逐位相等**，否则 `COMPLETE_CURRENT_CAS_OBLIGATION_REQUIRED`。
3. `key(caseId,requestId)` 已见或容量 ≥4096 → `REQUEST_REUSED_OR_CAPACITY`；**先记账再弹窗**（失败的尝试绝不变成自动二次批准，须新 requestId，`:71-75`）。
4. 逐条解析义务身份为 5 元组 `[checkKey,targetKey,objectKey,subjectId,string[]]`（`OBLIGATION_ID_INVALID`，`:77-85`）。
5. 组装 `detail`（案卷/操作者/修订/前后 SHA/删除清单/理由/历史说明，`:86-96`）；>16000 → `FULL_OBLIGATION_LIST_TOO_LARGE_TO_SHOW`（`:97`）。
6. `observing=true` 后调 `physicalConfirm`（`finally` 复位，`:99-108`）；`!==true` → `HUMAN_CANCELLED`（`:109`）。
7. 生成 `CMainRemovalObservedConsent`（`approvalId=randomUUID()`、身份/修订/指纹/清单/理由/`observedAtMs`）入库（`:110-124`）。

### 3.2 `getObservedMainHumanConsent` / `close`（`:126-137`）

关闭返回 `undefined`；否则按 key 返回克隆。`close()` 置 closed + 清 approvals，但**保留 seen keys**——同对象重装绝不复活已弹过的批准或已取消的请求（`:132-137`）。

### 3.3 Electron 实现（`createCMainElectronRemovalObserver`，`:141-157`）

主窗口必须存活否则 `false`（拒绝）；`dialog.showMessageBoxSync`（warning、defaultId/cancelId=0、noLink）返回 1 才算批准（`:142-156`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `CMainNativeRemovalObserver` 类：无生产实例化（生产经工厂函数）。
- `createCMainElectronRemovalObserver`：`review-v3-main-author-plan-ipc.ts:38` 导入、`:174` 在 `installCMainV3NativePlanUpgradeAuthorities` 内调用（该安装器生产无调用者，见 nb-10 手册 §4）。
- 测试：`review-v3-main-native-removal-observer.test.ts:3-4`（本批 5 例）。

出向：`node:crypto`（randomUUID）、`electron`（`dialog`）、`../main-window-state.ts:5`、`review-v3-main-removal-consent.ts:17-20`（类型）。

## 5. 数据 I/O、读写与副作用

- 写：进程内 `seen`/`approvals` 两集合；不落盘（注释：权威 CAS 回执/一次性同意 ID 另行持久化，冷进程必须重新人工确认，`:40-42`）。
- 副作用：同步 OS 模态（`:101-105`）；无 IPC/网络。
- 并发：`observing` 标志防重入（`:53,99-108`）；`LIMIT=4096` 防容量。
- 幂等：同 `[caseId,requestId]` 永不二次弹窗（`:71-75`）。

## 6. 分支、失败、取消与恢复

| 拒绝（`C_MAIN_NATIVE_REMOVAL_*`） | 触发 | 行 |
| --- | --- | --- |
| `NATIVE_DIALOG_MISSING` | 构造非函数 | 50 |
| `CLOSED_OR_REENTRANT` | 关闭/重入 | 53 |
| `COMPLETE_CURRENT_CAS_OBLIGATION_REQUIRED` | 上下文/清单不齐或不等 | 69 |
| `REQUEST_REUSED_OR_CAPACITY` | 复用/容量 | 72 |
| `OBLIGATION_ID_INVALID` | 身份不可解析/形状 | 79,83 |
| `FULL_OBLIGATION_LIST_TOO_LARGE_TO_SHOW` | detail >16000 | 97 |
| `HUMAN_CANCELLED` | 用户取消 | 109 |

- 失败后状态：seen 已记账（`:75`），失败请求不可复用；无批准记录。
- 取消/恢复：取消/失败需调用方发新 requestId 重新走 CAS（`:73-75` 注释）。

## 7. 权限与权威状态

- 人类观察是 Main 本地台账，**非持久**（`:39-42`）；冷进程不继承（工厂重建 = 新对象 + 空台账）。
- 只有真实 OS 确认能产 `CMainRemovalObservedConsent`；成功后仍需 `CMainRemovalConsentGate.consumeAtCommit` 一次性消费（`:9`）。
- 义务清单逐字进入对话框（`:86-96`），“请逐项检查下方差异”（`:103`）。

## 8. 修改影响面

- 改 `CMainRemovalObservedConsent` 形状影响 `review-v3-main-removal-consent.ts`（消费方校验）与 `plan-binding-v3.ts` 的 `CMainUpgradeRemovalAck`。
- 改弹窗/记账语义影响 5 个测试与 `review-v3-main-author-plan-ipc.ts:170-184` 的安装器。

## 9. 测试证据

直接测试：`review-v3-main-native-removal-observer.test.ts`（91 行，5 例，详见其手册）：完整义务可见且批准一次使用、无批准/取消/缺物理源拒绝、篡改/非法 JSON/缺 owner/超长列表在弹窗前拒绝（`dialogs===0`）、Owner/修订漂移在最终 CAS 拒绝、模态中重入拒绝。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`OBLIGATION_ID_INVALID` 在弹窗后的独立触发、`LIMIT` 容量、真实 Electron 消息框（mock `physicalConfirm`）无用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 先记账后弹窗、失败不自动重批 | 已证实 | `:71-75` |
| 清单逐位相等校验 | 已证实 | `:62-69` |
| 非持久台账、冷进程重确认 | 已证实 | `:39-42,132-137` |
| 重入拒绝 | 已证实 | `:53,99-108`；测试 `:82-91` |
| 生产经 `installCMainV3NativePlanUpgradeAuthorities`（无生产调用者） | 已证实（检索） | 见 §4 |
| 真实对话框行为 | 未知 | mock `physicalConfirm` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `observeAtCommit` 全流程 | §3.1 | 52-125 | covered |
| `getObservedMainHumanConsent`/`close` | §3.2 | 126-137 | covered |
| Electron 工厂 | §3.3 | 141-157 | covered |
| 权限/非持久 | §7 | 39-42 | covered |
| 生产接线 | §4 | 检索记录 | covered（范围已声明） |
| 容量/真实对话框 | §9,§10 | — | unknown |
