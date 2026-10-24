---
path: apps/electron/src/renderer/lib/agent-session-list.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8817619d7756dfee98397a2500e388152bcf9f9c
sha256: 1f0146e8f602fbd74b1d3a1c2ad448fe78a0d9e7a787b32a02ff5092c7b2e889
lines: 158
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-session-list.ts

## 1. 结论与边界

**Agent 会话列表纯函数集**（158 行）：草稿标记幂等增删、按 updatedAt 降序排序、单条替换/upsert、实时投影合并、后端全量快照合并（含删除语义与陈旧快照防御）、review-owned（内部 owner）过滤。边界：不读写 store/Jotai，全部函数接收数组/集合并返回新值；竞态防御策略见 `agent-session-list.ts:127-138` 注释。

## 2. 导出与关键符号

导出 8 个函数、0 常量、0 独立类型：`addDraftSessionId`（`agent-session-list.ts:10`）、`removeDraftSessionId`（`:20`）、`syncDraftSessionId`（`:31`）、`sortAgentSessionsByUpdatedAtDesc`（`:41`）、`replaceAgentSessionInFreshnessOrder`（`:48`）、`upsertAgentSessionProjection`（`:63`）、`upsertAgentSession`（`:112`）、`mergeFetchedAgentSessions`（`:140`）。内部符号：无未导出函数；`addDraftSessionId`/`removeDraftSessionId` 虽导出但冻结树未见文件外调用（仅 `:36-37` 经 syncDraftSessionId 内部调用）。

## 3. 内部逻辑与关键流程

- `addDraftSessionId`/`removeDraftSessionId`（`:10-28`）：已存在/不存在短路返回原集合，否则新 Set 增删（幂等、引用稳定）。
- `syncDraftSessionId`（`:31-38`）：`session.draft === true` → add，否则（含 draft 缺失）→ remove。
- `sortAgentSessionsByUpdatedAtDesc`（`:41-45`）：拷贝数组按 `b.updatedAt - a.updatedAt` 降序。
- `replaceAgentSessionInFreshnessOrder`（`:48-54`）：`:52` 剔除同 id 旧条目与 review-owned 条目；`:53` updated 是 review-owned 则只留 others，否则置顶后重排。
- `upsertAgentSessionProjection`（`:63-110`）：`:69` 既有条目是 review-owned → 删除该 id 防复活；`:70` 低 revision 投影不覆盖（返回浅拷贝）；`:71-107` 展开 existing 后逐字段映射投影（`?? undefined` 归一，含探索血缘三字段 `:94-96`）；`:108-109` 过滤后重排。
- `upsertAgentSession`（`:112-125`）：`:117-119` incoming/existing 任一 review-owned → 过滤删除该 id；`:120-122` 浅合并 `{...existing, ...incoming}`；`:123-124` 重排。
- `mergeFetchedAgentSessions`（`:140-158`）：`:145` visibleFetched 过滤 review-owned 与 revokedIds；`:147-150` snapshotWatermark=快照最大 updatedAt；`:151-156` 本地独有条目仅当非 review-owned、未撤销、fetched 缺失且 `updatedAt >= snapshotWatermark`（乐观更新）才保留；`:157` 合并重排。

## 4. 调用者与调用链

- 入向：`hooks/useGlobalAgentListeners.ts:77` import 4 函数（`:510-515`、`:861`、`:1694`、`:1715` upsertAgentSession；`:747` upsertAgentSessionProjection；`:748`、`:1696` syncDraftSessionId；`:910`、`:1611`、`:1686` mergeFetchedAgentSessions）；`hooks/useOpenSession.ts:32`（`:121`、`:140`）；`components/tabs/TabBar.tsx:78`（`:1180` replaceAgentSessionInFreshnessOrder）；`components/app-shell/left-sidebar/use-left-sidebar.ts:100-105`（`:557`、`:1711`、`:1748` sort；`:1469-1635` replace；`:1354` upsert；`:1000` syncDraft）；`components/welcome/WelcomeView.tsx:16`（`:74`）；`lib/agent-tab-access.ts:4`（`:77`）。测试：`agent-session-list.test.ts:3-10`。
- 出向：`@profer/shared`（isReviewOwnedAgentSession、类型，`:1`）。无 IPC。
- 动态调用：未知；检索方式——冻结树 grep 模块名与 8 个导出名（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

全部纯函数：无模块级状态/缓存/Map/注册表写入，返回新数组/Set，入参不被修改（`:310-316` 测试锁定）。无事件订阅/DOM/toast/窗口副作用。

## 6. 分支、失败、取消与恢复

- 幂等短路（`:14`、`:24`）；draft 缺失按正式处理（`:35`）。
- review-owned 三重过滤：replace（`:52`）、projection（`:69` 防复活）、upsert（`:117-119`）、merge（`:145`、`:153`）。
- revision 单调：低 revision 投影丢弃（`:70`）。
- 陈旧快照防御：本地 updatedAt ≥ 水位的缺失条目保留（`:155`），真实删除（早于水位）被消化（`agent-session-list.ts:136-138`）；revokedIds 强制移除（`:145`、`:154`）。
- 无 throw、无异步、无取消。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。隐藏内部 owner（review-case）的可见性规则由 `isReviewOwnedAgentSession` 裁决并在各入口过滤（`:52`、`:69`、`:117`、`:145`）。

## 8. 修改影响面

agentSessionsAtom/draftSessionIdsAtom 的所有写入点（useGlobalAgentListeners.ts、useOpenSession.ts、TabBar.tsx、use-left-sidebar.ts、WelcomeView.tsx、agent-tab-access.ts）；改动过滤/合并语义会引发会话列表消失、草稿卡隐藏或 review 会话泄漏。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`agent-session-list.test.ts` 24 个 test（grep `test(` 计数=24；describe 拆分逐项：sort 1、replace 1、upsert 4、projection 3、merge 4、P04-S01 owner 过滤 4、syncDraft 6、顶层 P04-S04 1）。关键 expect：`:33` 降序、`:83` 不删其它会话、`:195` 陈旧快照保留父会话、`:205` 删除语义、`:223`、`:227-228` owner 过滤、`:275` 迟投影不复活、`:283-315` 草稿幂等、`:324` 撤销优先。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 函数合并/过滤/幂等语义 | 已证实 | `agent-session-list.ts:10-158` |
| 陈旧快照水位算法 | 已证实 | `agent-session-list.ts:147-156` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| addDraftSessionId / removeDraftSessionId | §2/§3 | 10-28 | covered |
| syncDraftSessionId | §3/§6 | 31-38 | covered |
| sortAgentSessionsByUpdatedAtDesc | §3 | 41-45 | covered |
| replaceAgentSessionInFreshnessOrder | §3/§6 | 48-54 | covered |
| upsertAgentSessionProjection | §3/§6 | 63-110 | covered |
| upsertAgentSession | §3/§6 | 112-125 | covered |
| mergeFetchedAgentSessions | §3/§6 | 140-158 | covered |
