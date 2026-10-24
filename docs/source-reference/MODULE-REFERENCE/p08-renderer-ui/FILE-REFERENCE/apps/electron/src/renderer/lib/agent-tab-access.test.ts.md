---
path: apps/electron/src/renderer/lib/agent-tab-access.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d86f08a27e6f94729fb6693a115589d28c473ba7
sha256: d9bbe646efe911019e8e80969986b52ad9af31eec68154d0ea9cbc48a48f98c8
lines: 143
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-tab-access.test.ts

## 1. 测试目标

验证 `agent-tab-access.ts`（同批收录）的会话→工作 Tab 准入裁决，并联测消费方 `preview-opener.ts`（openFilePreviewTab/openFilePreviewTabAuthorized）与 `browser-tab.ts`（reconcileBrowserTabs）的准入集成：历史快照恢复过滤、Main 元数据裁决、撤销竞态、内部 owner（review-case）永不泄漏。用 Jotai 真实 `createStore`（`agent-tab-access.test.ts:2`）。

## 2. 用例清单

grep `test(` 机械计数=11、`describe(`=0、`it(`=0（顶层平铺）：`:22` 历史快照恢复过滤；`:30` 可见工作区+Tab 身份校验；`:36` canOpenOrdinaryWorkTab 三分支；`:42` resolveOrdinaryTabSession 五种拒绝；`:50` archived 主进程授权可重开；`:55` 预览不能复活隐藏/删除 owner；`:67` 浏览器对账拒绝内部会话；`:82` 早期事件单次水合回退；`:104` 内部/删除/mismatch/抛错拒绝；`:121` 撤销竞态；`:138` archived/draft 兼容。计数与标签一致。

## 3. 真实断言

- `:27`：expect ids toEqual(['ordinary','archived','draft'])（内部/deleted/team/损坏项全过滤）。
- `:32-33`：expect toEqual(['team','ordinary'])（hidden-workspace 可见时放行、id!==sessionId 拒绝）。
- `:37-39`：expect true/false/false（普通/内部/未知）。
- `:43-47`：expect(await ...).toBeNull() ×5（内部、缺失、id mismatch、load 抛错、空串）；`:52` expect(restored?.id).toBe('archived')。
- `:58-64`：expect(openFilePreviewTab(...)).toBe('')×2、tabs 长度 0、allowed=to('/tmp/regular.png')、previewFileMapAtom readOnly:true。
- `:74-79`：expect(reconcileBrowserTabs('internal')).toBeNull()、('ordinary')='__browser__:ordinary:page-1'、('deleted')=null 且无残留 Tab。
- `:92-101`：expect(preview).toBe('/tmp/early.png')、lookups===1（单次水合）、sessions=['ordinary']、浏览器复用同一授权（lookups 仍 1）。
- `:114-118`：四类伪造/失败 load 全 expect(result).toBe('')，且 previewFileMap/agentSessions/tabs 全空。
- `:129-135`：撤销后 expect(await pending).toBe('')、三 store 全空；回放 expect(openFilePreviewTab(...)).toBe('')、expect(await ensureOrdinaryWorkTabOwner(...)).toBe(false)。
- `:140-142`：expect true（archived）、true（draft）、store ids toEqual(['archived','draft'])。

## 4. 未覆盖与脆弱点

未覆盖：`selectRestorableAgentTabs` 对 `title` 非 string 等损坏形状的独立断言（并入 `:22-25` 的 null/{type:'agent']} 混样）；`ensureOrdinaryWorkTabOwner` 的 `isCurrent` 参数为 false 分支（`agent-tab-access.ts:69`）仅经默认值测试；`markAgentSessionRevoked` 重复标记幂等无断言。脆弱点：`snap`/`session` 工厂（`:12-20`）用 `as AgentSessionMeta` 强转，SUT 字段约束收紧时可能静默失真；预览/浏览器联测把 preview-opener、browser-tab 行为混入本文件（跨模块耦合）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例清单与断言文本 | 已证实 | `agent-tab-access.test.ts:22-143` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| Main GET_SESSION_META 行为 | 间接 | 测试以 load mock 代替（`:85-88`） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| selectRestorableAgentTabs | §2/§3 | 22-34 | covered |
| canOpenOrdinaryWorkTab | §2/§3 | 36-40 | covered |
| resolveOrdinaryTabSession | §2/§3 | 42-53 | covered |
| ensureOrdinaryWorkTabOwner | §2/§3 | 82-102, 121-143 | covered |
| markAgentSessionRevoked | §2/§3 | 127-135 | covered |
| revokedAgentSessionIdsAtom | §3 | 127-135 | covered |
