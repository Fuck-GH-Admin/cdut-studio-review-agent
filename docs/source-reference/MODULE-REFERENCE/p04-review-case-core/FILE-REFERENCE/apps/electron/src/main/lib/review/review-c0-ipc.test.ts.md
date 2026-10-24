---
path: apps/electron/src/main/lib/review/review-c0-ipc.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c4d73b209e926369747ae50f5ce4a5601e3effa
sha256: 0ea16ff75b7dc4ad7dd098638eda0f295efcbc854e65c25e77bee0b8c9ec7fcf
lines: 147
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-c0-ipc.test.ts

## 1. 测试目标

C0 四个真实 Main IPC 写 handler 的边界（describe 标题自述 "synthetic harness"，:31）：伪造学校/教师 actor 的命令必须在**不产生任何回执/revision 变化**的前提下被拒；合法本地命令的幂等、载荷碰撞、模板版本碰撞、并发建案、CAS、作用域与 sender 拒绝。覆盖链 = `registerReviewIpc` handler → `review-c0-authority` 绑定 → `review-c0-case-service` → `case-store-v2` 事务（真实磁盘隔离目录）。

## 2. 用例清单

3 用例 / 1 describe。夹具与 mock 边界：
- Electron 为 **mock**：`globalThis.__proferElectronTestHooks.ipcMainHandlers`（:12-14，由 `test/preload-electron-mock.ts:46/:150` 提供，记录 `ipcMain.handle` 注册的 handler）；`invoke()` 直调 handler（:21-25）。
- 事件对象为最小 fake：`frame={id:1}`、`sender={id:91, mainFrame:frame, isDestroyed:()=>false}`、`event={sender, senderFrame}`（:15-17）；`setMainWindow({isDestroyed:()=>false, webContents:sender})`（:34）。
- 磁盘隔离 `PROFER_CONFIG_DIR=work/tmp/v3-c0-ipc-{Date.now()}`（:10-11），`afterAll` 复位主窗 + rmSync（:29）。
- 合成聚合：`createAggregate` 直写 fixture `ReviewCaseV2`（:36-47，含 `s1` subject 与 `d1` evidence 文档）。
- 模板夹具 `TemplateVersion`（:69-75）经 `saveDraft`+`publishTemplate` 发布。

| # | 用例 | 行 | 场景 |
| --- | --- | --- | --- |
| 1 | 四个伪造学校-教师命令失败且无回执/revision 变化 | 32-66 | 4 通道 spoof + 本地 teacher 角色伪造 |
| 2 | 合法本地建案、幂等与载荷碰撞 | 68-105 | CREATE_CASE_V2 系列 |
| 3 | 合法三写、重复请求、过期 CAS、作用域与 sender 拒绝 | 107-146 | UPDATE_FIELDS/CORRECT_OBSERVATION/SET_EVIDENCE_LINK |

## 3. 真实断言

- 用例 1（:60-65）：四个通道（`CREATE_CASE_V2`/`UPDATE_FIELDS_V2`/`CORRECT_OBSERVATION_V2`/`SET_EVIDENCE_LINK_V2`）逐一 `expect(() => invoke(...)).toThrow('ACTOR_UNTRUSTED')`（:60）；本地 `role:'teacher'` 伪造同样抛（:61-64）；`JSON.stringify(readAggregate(caseId))` 前后相等（:65，**无任何落盘副作用**）。
- 用例 2（:81-104）：`one.ok` true 且 `one.receipt.actor` `toMatchObject({ actorSource:'local', actorId:'local-reviewer' })`（:82，renderer 自填 `actorId:'renderer-custom-id'` 被覆盖）；幂等重放 `two.ok` true 且聚合 JSON 不变（:84-86）；载荷变更 → `rejects.toThrow('REQUEST_ID_COLLISION')` 且聚合不变（:87-90）；**同载荷换模板版本**（`version:2`）同样 `REQUEST_ID_COLLISION`（:93-95，:91-92 注释点明旧回执 hash 不含模板绑定）；并发同 caseId 双建案两 ok 且 `receiptLog` 长度 1（:98-104）。
- 用例 3（:108-145）：`f1` 写入 ok 且回执 actor `{actorId:'local-reviewer', actorSource:'local'}`（:111-112）；同 `f1` 重放 ok 且 `revision` 停在 1（:113-117）；`o1`/`l1` 依次 ok（:119-128）；同 requestId 不同载荷 → `{ok:false, code:'REQUEST_ID_COLLISION'}`（:130-132）；过期 revision → `{ok:false, code:'VERSION_CONFLICT'}`（:133-135）；嵌套 `caseId:'other'` → `toThrow('CASE_SCOPE_FORBIDDEN')`（:136-137）；`senderFrame:{id:2}`（子帧）→ `toThrow('SENDER_UNTRUSTED')`（:138-140）；异 sender 对象 → `toThrow('SENDER_UNTRUSTED')`（:141-143）；其后快照不变、`receiptLog` 长度 3（:144-145）。

## 4. 未覆盖与脆弱点

- 未覆盖：`UPSERT_CASE_SUBJECT_V2` 通道（在 `review-c0-subject-upsert.test.ts`）、`bindC0LocalCreateIntent` 的 `REVISION_CONFLICT`/requestId 确定式分支、payloadHash 不匹配分支、destroyed window/sender、真实 BrowserWindow 的 `senderFrame===mainFrame` 行为、`BLOCKED_AUTH`/`ROLE_FORBIDDEN`。
- 脆弱点：mock Electron（fake sender/frame）与真实 IPC 运行时有距离；`toThrow('ACTOR_UNTRUSTED')` 为子串匹配（`C0ContractError` 消息前缀 code，`review-v3-c0.ts:151`）；`invoke` 同步 handler 直调，真实 `ipcMain.handle` 的异步包装/序列化未覆盖；`createAggregate` fixture 的 stage/subject 形状为合成。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言/夹具如 §2-3 | 已证实 | 本文件逐行 |
| 伪造 actor 全拒且零副作用 | 已证实 | :60-65 |
| 幂等含模板绑定双维度 | 已证实 | :91-95 |
| 并发建案单回执 | 已证实 | :98-104 |
| Electron 边界为 mock（非真实窗口） | 已证实 | :12-17 + `test/preload-electron-mock.ts:46` |
| 真实 Electron 运行时行为 | 未知 | NOT_RUN/无真实窗口 |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ACTOR_UNTRUSTED（来源/角色伪造） | §3 | 60-64 | covered |
| 幂等重放/载荷碰撞/模板碰撞 | §3 | 84-95 | covered |
| 并发建案 | §3 | 98-104 | covered |
| CAS/重复 requestId/作用域/sender | §3 | 111-143 | covered |
| UPSERT 通道/REVISION_CONFLICT/hash 不匹配 | §4 | — | unknown（未测/他篇） |
| 真实窗口 senderFrame 判定 | §4 | — | unknown |
