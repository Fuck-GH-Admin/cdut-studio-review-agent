---
path: packages/session-core/src/session-core.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9c4477e12ab5190ecbf42e5befabc0436ef03d2c
sha256: 4399d2831c2002e084fa24e5da24a46bddd2823ffb187a631453f7f9e5cb62ca
lines: 118
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/session-core.test.ts

## 1. 测试目标

`session-core` 的**转录管线端到端**（经包入口 `./index`）：JSONL 读取容错 → 分组 → 快照去重 → 工具摘要折叠 → search/select/markdown 渲染原语。被测对象含本批 `transcript.ts`/`search.ts`/`select.ts`（主手册见各 `.md`）与非本批 `read.ts`/`group.ts`/`render-markdown.ts`。

## 2. 用例清单

共 **12 个 `test()`**，4 个 describe（`test(` 计数 12）：

| describe | 用例 | 行 |
| --- | --- | --- |
| 快照去重（格式 B）（5） | 合并两 turn 下标稳定 / 取最完整快照 / thinking 丢弃 / tool_use 摘要+tool_result 不进正文 / 纯 tool_result 不产 user turn | `:31-53` |
| 工具折叠 ×N（2） | 连续相同折叠计数 / summarizeToolInput 跳空值截长值 | `:57-65` |
| 旧扁平格式（格式 A）归一（1） | role 字段识别转换 | `:76-79` |
| 容错与渐进式读取原语（4） | 损坏行静默跳过 / searchTurns 命中 / selectTurns 三窗口 / renderTranscriptMarkdown 分段 | `:90-117` |

夹具：`jsonl()` 序列化器（`:14-16`）；格式 B 6 行原始（3 行递增快照共享 `message.id='m1'`，`:20-27`）；格式 A 3 行扁平（`:69-73`）；4 turn 回答集（`:83-88`）。

## 3. 真实断言

- `:32-33` `roles` `toEqual(['user','assistant'])`、`index` `toEqual([0,1])`；`:38-39` `text` `toBe('Hello world')` 且 `not.toContain('Hel\n')`；`:43` `not.toContain('想一下')`；`:47-48` `toolSummaries` `toEqual(['Read file_path=/a'])`、`text` `not.toContain('data')`；`:52` user turn `toHaveLength(1)`。
- `:58` `collapseToolSummaries([...])` `toEqual(['OCR p=1 ×3','Read f=a'])`；`:62` `summarizeToolInput('Read',{file_path:'/a',limit:0,empty:''})` `toBe('Read file_path=/a limit=0')`；`:64` 200 字值摘要长度 `toBeLessThan(100)`。
- `:77-78` 格式 A `toMatchObject({role:'user',text:'你好'})`/`{role:'assistant',text:'旧版回复'}`。
- `:93` 坏行追加后 `msgs.length` `toBe(4)`（静默跳过）；`:100-102` `searchTurns` 1 命中、`index` 1、snippet 含 'needle'；`:106-108` select `range:[2,3]→[2,3]`、`head:1→[0]`、`tail:1→[3]`；`:113-116` markdown 含 `# Session: demo`、`## 用户`、`## 助手`、正文。

## 4. 未覆盖与脆弱点

- 未覆盖：`offset/limit` 窗口、`estimateTokens` 数值、`<attached_files>/<quoted_file>` 剥除、Goal 迭代分支、`__anon_` 快照兜底、caseSensitive/context/limit 搜索选项。
- 脆弱点：断言含精确字符串（`'Hello world'`/`'Read file_path=/a'`/`## 用户` 等）——格式/文案变动会碎；`jsonl` 夹具为合成对象。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例与断言如 §3 | 已证实 | 逐行读 `:1-118` |
| 夹具为合成 JSONL（含共享 message.id） | 已证实 | `:20-27` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 快照去重/正文剥除/摘要折叠 | 5+2 用例 | covered |
| 格式 A 归一 | 1 用例 | covered |
| 容错读取/search/select/markdown | 4 用例 | covered |
| 未列分支（§4） | — | unknown |
