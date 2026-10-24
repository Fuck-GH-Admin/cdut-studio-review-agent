---
path: apps/electron/src/renderer/lib/resolved-blob-messages.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c706838b619decf0cb22b1bb7ca7f0071fb1f6ea
sha256: 5e1c9a586e961d3c0a154c2603f6061095de8495a2f32cf631c00523d1783c57
lines: 97
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/resolved-blob-messages.test.ts

## 1. 测试目标

固定两组契约（文件头场景见各 describe）：①`applyResolvedBlobMessages` 的「按 uuid 覆盖 + 引用稳定性」（覆盖逻辑最易错的两点——按什么键匹配、无 uuid 怎么办，`resolved-blob-messages.ts:8-9` 自述）；②`@profer/shared` 的 `readSessionBlobRefs` 引用表读取容错（跨模块，被测对象不是本批文件）。

## 2. 用例清单

用例数与源码一致：10 个 `test(`（2 个 `describe`，6+4；grep 实测 `^\s*test\(`=10）。依赖顺序：无（独立纯函数断言，无 beforeEach）。

describe「完整版覆盖 · 按 uuid 替换」6 例（`resolved-blob-messages.test.ts:5-58`）：
1. `:6-15` 命中 uuid 替换且保序——设置 `[a,b]` 与 `Map[['a',resolvedA]]`，动作 `applyResolvedBlobMessages`。
2. `:17-21` 空覆盖返回同一数组引用（零开销）——设置单条消息+空 Map。
3. `:23-28` 覆盖有值但零命中时数组引用不变（注释 `:24`：避免切换会话后残留覆盖让所有消息重算）。
4. `:30-37` 消息无 uuid 原样保留（无法定位不可被覆盖）。
5. `:39-46` 覆盖值与消息同对象时数组引用不变。
6. `:48-57` 多条命中全部替换——`Map[['a',…],['c',…]]` 覆盖 `[a,b,c]` 中 a、c。

describe「引用表读取」4 例（`:60-97`，被测 `readSessionBlobRefs` 来自 `@profer/shared`）：
7. `:61-70` 正常引用表逐条读出——`[SESSION_BLOB_REFS_FIELD]` 合法条目 1 条。
8. `:72-76` 无引用表（`{type:'user'}`/`null`/`'string'`）→ 空数组。
9. `:78-91` 形状不对的条目过滤而不整体失败——5 条输入（缺 hash/缺 path/字符串/null）只留 1 条。
10. `:93-96` 字段存在但非数组（字符串/对象）→ 空数组。

## 3. 真实断言

- `:13` `expect(result).toEqual([resolvedA, b])` + `:14` `expect(result[0]).toBe(resolvedA)`（替换为 Map 里的同一对象引用）。
- `:20` `expect(result).toBe(messages)`（空覆盖短路）；`:27` `toBe(messages)`（零命中引用不变）；`:35-36` `toBe(messages)`+`expect(result[0]).toBe(noUuid)`；`:44-45` 同对象情形引用不变。
- `:56` `expect(result).toEqual([{uuid:'a',value:11}, b, {uuid:'c',value:33}])`。
- `:68-69` `expect(refs).toHaveLength(1)` + `refs[0]!.path` `toBe('tool_use_result.content[0].text')`；`:73-75` 三种空输入 `toEqual([])`；`:88-90` `toHaveLength(1)`+`path==='ok'`；`:94-95` 两种非数组 `toEqual([])`。

mock 边界：**无 mock/spy**——`:1-3` 仅导入 `bun:test`、`@profer/shared`（真实 shared 包实现，非 mock）、被测模块；纯函数直测。

## 4. 未覆盖与脆弱点

- 未覆盖：`overrides` 值为 falsy/形状错配对象（`:23` 仅挡 falsy 与同对象）；`uuid` 重复的多条消息同键覆盖；`applyResolvedBlobMessages` 与真实 `SDKMessage` 载荷的集成（在 `AgentMessages.tsx:689`，无测试）。
- 脆弱点：describe 2 测的是 `@profer/shared` 的实现（`packages/shared/src/constants/session-storage.ts:31-41`）——shared 改实现会在此失败，属跨模块契约哨兵（`session-storage.ts:8-9` 注释自述历史上有过覆盖缺口事故）；`SESSION_BLOB_REFS_FIELD` 常量值 `'_proferBlobs'`（`session-storage.ts:13`）被夹具隐式绑定。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例设置/动作/断言逐条（§2/§3） | 已证实 | `resolved-blob-messages.test.ts:6-96` 逐行读 |
| 无 mock；describe 2 被测为 shared 真实实现 | 已证实 | `:1-3` 导入清单 + `session-storage.ts:31-41` |
| 引用稳定性契约（空 Map/零命中/同对象 → 原引用） | 已证实 | 测试 `:20,27,35,44-45` 与实现 `resolved-blob-messages.ts:17,23,28` 互证 |
| 「切换会话残留覆盖」真实场景的存在 | 推断 | `:24` 注释自述，未读会话切换时 atom 清理的全部路径 |
| 测试运行状态 | 未知 | NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI，不得视为已通过 |

## 6. 覆盖表

| 用例/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| uuid 命中/空 Map/零命中/无 uuid/同对象/多命中 | §2/§3 | 6-57 | covered |
| `readSessionBlobRefs` 4 例（跨模块） | §2/§3/§4 | 61-96 | covered（间接对象） |
| 覆盖值形状错配 | §4 | — | unknown |
| 与 `AgentMessages.tsx:689` 集成 | §4 | — | unknown（无测试） |
