---
path: apps/electron/src/main/lib/conversation-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b325394ab862086956c656bed72ed05281ed2674
sha256: 6b50299a9534f639a1f43ffbf665f724e85d89bb28fe9b3a49bbc30e235874e8
lines: 243
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/conversation-manager.test.ts

## 1. 测试目标

`conversation-manager.ts` 的**分支树契约单测**（`:1-11` 注释，对应 PR #121 review 三类主进程契约）：分叉隔离、严格 root→leaf、子树删除+activePath 修复。`PROFER_CONFIG_DIR` 隔离配置到 mkdtemp（`:9-10/:20-24`，必须先于模块副作用读 env `:22`）。

## 2. 用例清单

3 个 describe + **12 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| forkBranchAt 兄弟分叉隔离（2） | user 节点 fork 旧链不动/兄弟关系/activePath 切新分支；根处 fork 成新起点 | `:69-118` |
| setActivePath 严格契约（6） | 完整链接受/仅根接受/空抛错/非根起点抛错/跳节点抛错/不存在 id 抛错 | `:131-162` |
| deleteMessageFromTree 子树+修复（4） | 删叶整棵子树兄弟不动 activePath 退根前/删中间节点截断/删根全空/删非 active 支不影响 | `:166-242` |

夹具：`freshConv`/`user`/`assistant`（`:44-66`）；afterAll 清理+删 env（`:26-31`）。

## 3. 真实断言

- `:87-95` `forked.parentId` `toBe(r.id)`（兄弟）；根 childIds 含 u1 与 forked；`tree.activePath` `toEqual([r.id, forked.id])`；分支内容 `toEqual(['root','q-2 (新分支)'])`。
- `:110-117` 根处 fork：`forked.parentId` `toBeNull()`、旧节点都在、`activePath` `toEqual([forked.id])`。
- `:134/:140` 合法链接受（内容链断言）；`:145` 空 `toThrow(/空/)`；`:150` 非根起点 `toThrow(/root|parentId|null/)`；`:156` 跳节点 `toThrow(/连续|parentId/)`；`:161` 不存在 id `toThrow(/不存在/)`。
- `:180-186` 删叶：u2/a2 消失、u1/a1 保留、`activePath` `toEqual([r.id])`。
- `:202-206` 删中间：a1/u2 消失、`activePath` `toEqual([r.id, u1.id])`、内容 `['root','q-1']`。
- `:220-221` 删根：分支 `toEqual([])`、nodes 长度 0。
- `:238-241` 删非 active 支：`activePath` `toEqual([r.id, u1.id, a1.id])` 不变。

## 4. 未覆盖与脆弱点

- 未覆盖：`ensureTreeMigrated` 迁移、搜索、`truncateMessagesFrom`/`appendBranchTail`/丢弃段、`ensureActivePath`。
- 脆弱点：错误信息正则断言（`/空/`、`/连续|parentId/` 等）与实现文案耦合。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例断言如 §3 | 已证实 | 逐行读 `:1-243` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| forkBranchAt 隔离 | 2 | covered |
| setActivePath 契约 | 6 | covered |
| deleteMessageFromTree 修复 | 4 | covered |
| 迁移/搜索/截断等 | — | unknown |
