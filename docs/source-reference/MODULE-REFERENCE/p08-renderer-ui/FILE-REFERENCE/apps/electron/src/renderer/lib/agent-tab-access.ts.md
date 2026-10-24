---
path: apps/electron/src/renderer/lib/agent-tab-access.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d1156071042430ae728015f8665747c4672f2127
sha256: fe64afd0d3710b74474c582dd78881f996a88aa0d6b25d2851da847fd36dbdd2
lines: 79
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-tab-access.ts

## 1. 结论与边界

**Agent 会话→工作 Tab 访问裁决模块**（79 行）：历史快照恢复、工作 Tab 打开、Main 元数据水合的「普通会话准入」规则集。核心原则：历史设置不可信、隐藏/内部 owner（review-case）会话永不准入、未知 ID 一律先经 Main GET_SESSION_META 确认（`agent-tab-access.ts:16`、`:58-62`）。

## 2. 导出与关键符号

导出 6 条（1 atom + 5 函数）、0 独立类型导出：`revokedAgentSessionIdsAtom`（`agent-tab-access.ts:10`，atom<ReadonlySet<string>>，renderer 本地撤销登记）、`markAgentSessionRevoked`（`:12`）、`selectRestorableAgentTabs`（`:17`）、`canOpenOrdinaryWorkTab`（`:36`）、`resolveOrdinaryTabSession`（`:45`，async）、`ensureOrdinaryWorkTabOwner`（`:63`，async）。内部符号 1 个：`type Store = ReturnType<typeof getDefaultStore>`（`:7`，内部）。

## 3. 内部逻辑与关键流程

- `markAgentSessionRevoked`（`:12-14`）：向 revoked 集合追加 id（新 Set 写回）。
- `selectRestorableAgentTabs`（`:17-33`）：建 id→session Map（`:22`）；过滤快照：对象形状校验（type==='agent'、sessionId/id/title 均 string、id===sessionId，`:26-28`）、session 必须存在且非 review-owned、workspaceId 缺省或在 visibleWorkspaceIds 内（`:30-31`）。
- `canOpenOrdinaryWorkTab`（`:36-42`）：sessions 中存在该 id 且非 review-owned。
- `resolveOrdinaryTabSession`（`:45-56`）：`:49` 空白 id → null；try 内 `load(sessionId)`，`:52` 要求 `session?.id === sessionId`（防 mismatch）且非 review-owned；catch → null。
- `ensureOrdinaryWorkTabOwner`（`:63-79`）：`:69` isCurrent() 为 false 或已撤销 → false；`:70` 本地已知普通会话 → true；`:71` 本地已有同 id（含 review-owned）→ false；`:72` 异步 `resolveOrdinaryTabSession` 水合；`:73` 水合失败/期间被撤销/失效 → false；`:75-76` 本地已存在 review-owned 同 id 条目 → false（新本地 owner 不被更旧的异步响应覆盖）；`:77` `upsertAgentSession` 写入 agentSessionsAtom；`:78` 重新裁决返回。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:67` import 4 符号（`:550`、`:668`、`:763-772`、`:876-886`、`:1347-1366`、`:1693-1731` 等大量调用点）；`apps/electron/src/renderer/hooks/useOpenSession.ts:11` import `resolveOrdinaryTabSession`（`:137`）；`apps/electron/src/renderer/main.tsx:119` import `selectRestorableAgentTabs`（`:819`）；`apps/electron/src/renderer/components/diff/preview-opener.ts:19` import 3 符号（`:83-84`、`:133`）；`apps/electron/src/renderer/lib/browser-tab.ts:27`（`:89-90`、`:117`、`:138-140`）。测试：`agent-tab-access.test.ts:10`。
- 出向：`@profer/shared`（`isReviewOwnedAgentSession`、类型，`:1`）、`@/atoms/tab-atoms`（TabItem，`:2`）、`@/atoms/agent-atoms`（agentSessionsAtom，`:3`）、`@/lib/agent-session-list`（upsertAgentSession，`:4`）、`jotai`（atom/getDefaultStore，`:5`）。
- 动态调用：未知；检索方式——冻结树 grep 模块名与 6 个导出名（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

模块级状态：`revokedAgentSessionIdsAtom`（Jotai atom，撤销集合，`:10`）；读写 `agentSessionsAtom`（`:77` upsert 写入）。区分：前四函数纯函数（仅读入参），后两函数是有状态操作（经 store 读写）。副作用：无 DOM/toast/窗口；异步 load 委托给调用方注入（`window.electronAPI.getAgentSessionMeta`）。

## 6. 分支、失败、取消与恢复

空/非法快照项 → 过滤（`:24-28`）；空白 sessionId → null（`:49`）；load 抛错 → catch 返回 null（`:53-55`）；mismatch id → null（`:52`）；竞态守卫：水合期间 isCurrent 失效/被撤销 → false（`:73`）；迟到的 Main 响应不覆盖新本地 owner（`:75-76`）。删除通知后的撤销：markAgentSessionRevoked 登记后，排队事件与恢复路径全部被拒（`useGlobalAgentListeners.ts:734` 等读取该 atom）。无 throw；失败收敛为 false/null。

## 7. 权限与权威状态

有访问规则：裁决人是本模块各函数（renderer 侧），依据三类状态——① `isReviewOwnedAgentSession(session)`（`@profer/shared`）判定内部 review-case owner，一律拒绝（`:30`、`:41`、`:52`）；② `revokedAgentSessionIdsAtom` renderer 本地撤销登记（`:69`、`:73`）；③ Main GET_SESSION_META 为最终权威（注释 `:44`、`:60`：隐藏内部 owner、已删除返回 null），未知 ID 不得凭工作 Tab 事件/负载授权（`:61`）。可见工作区过滤依据 `visibleWorkspaceIds`（`:31`）。

## 8. 修改影响面

浏览器/预览工作 Tab 打开（browser-tab.ts、preview-opener.ts）、会话列表水合（useGlobalAgentListeners.ts）、会话恢复（main.tsx:819）、会话打开（useOpenSession.ts）。放宽裁决会泄漏 review-case 会话或复活已删会话。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`agent-tab-access.test.ts` 11 个 test（grep `test(` 计数=11），如 `:27` expect 恢复 ['ordinary','archived','draft']、`:37-39` expect(true/false/false)、`:43-47` expect null×5、`:135` expect false（撤销后回放拒绝）、`:140-142` expect true（archived/draft 兼容）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三类准入依据与竞态守卫 | 已证实 | `agent-tab-access.ts:26-31,49-55,69-78` |
| GET_SESSION_META 为权威 | 推断 | 注释 `:44,60`，Main 实现域外 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| revokedAgentSessionIdsAtom / markAgentSessionRevoked | §2/§5 | 10-14 | covered |
| selectRestorableAgentTabs | §3/§6 | 17-33 | covered |
| canOpenOrdinaryWorkTab | §3/§7 | 36-42 | covered |
| resolveOrdinaryTabSession | §3/§6 | 45-56 | covered |
| ensureOrdinaryWorkTabOwner | §3/§6/§7 | 63-79 | covered |
