---
path: apps/electron/src/renderer/lib/quoted-selection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5733f062de53f1f642eb1a0cb47e4f29859416a4
sha256: cca2435c6643e60eeb7a04fbd6dfb07703c617c17d9338125693041f0f2fe8e6
lines: 85
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/quoted-selection.test.ts

## 1. 测试目标

固定引用选中（quoted selection）**XML 构建/解析往返**契约：`buildQuotedSelectionBlock` 与 `parseQuotedSelectionRefs`（`quoted-selection.test.ts:2` 导入）——引用标签的转义、内嵌闭合标签消毒、Markdown 反斜杠转义容错、来源类型区分与「隐藏 XML 从正文剥离」。

## 2. 用例清单

用例数与源码一致：3 个 `test(`（1 个 `describe`，grep 实测 `^\s*test\(`=3）。依赖顺序：无（独立纯函数断言）。Given/When/Then 命名：
1. `:5-24` Given 文件引用 When 构建并解析引用块 Then 保留文件名并移除隐藏 XML——设置含 `</quoted_file>` 注入与 `&` 特殊字符的路径 `/tmp/demo & draft.md`（`:6-11`），动作 `buildQuotedSelectionBlock` 后 `parseQuotedSelectionRefs(block + '我的问题：')`（`:12`）。
2. `:26-45` Given 反斜杠转义的 `quoted_context` When 解析 Then 移除标签并保留展示标签——设置 4 行转义标签+正文+续问（`:27-32`），动作纯 `parseQuotedSelectionRefs`。
3. `:47-84` Given Agent 和草稿引用 When 解析 Then 区分来源类型并使用展示标签——设置 3 个 `quoted_context`（agent-history/scratch-pad/agent-history，`:48-59`），动作纯解析。

## 3. 真实断言

- 用例 1：`:14` `expect(block).toContain('path="/tmp/demo &amp; draft.md"')`（XML 转义）；`:15` `toContain('</quoted_file_>')`（内嵌闭合标签被消毒改写）；`:16-22` `parsed.quotes` `toEqual([{path:'/tmp/demo & draft.md', filename:'demo & draft.md', sourceType:'file'}])`（解码还原+basename 提取）；`:23` `expect(parsed.text).toBe('我的问题：')`（标签全部剥离）。
- 用例 2：`:36-43` `parsed.quotes` `toEqual` 单条 `{path:'Agent 历史 · Agent 回复', filename 同, sourceType:'agent-history', label 同}`；`:44` `parsed.text` `toBe('继续提问')`（反斜杠转义标签也被剥除）。
- 用例 3：`:63-82` `parsed.quotes` `toEqual` 三条按序（agent-history/scratch-pad/agent-history，path=filename=label）；`:83` `parsed.text` `toBe('继续提问')`。

mock 边界：**无 mock**——`bun:test`（`:1`）直测真实 `./quoted-selection` 实现；纯字符串函数，无 Main/IPC/文件系统依赖。

## 4. 未覆盖与脆弱点

- 未覆盖：`escapeXmlAttribute`/`decodeXmlAttribute` 的独立往返（仅经用例 1 间接覆盖 `&` 与 `"`）；`sourceType: 'agent-interruption'` 分支（`quoted-selection.ts:62`）无用例；`quoted_file` 缺 `path` 属性的跳过分支（`:73-74`）无用例；`label` 缺失默认值「Agent 历史」（`:87`）无用例；`message_id`/`role` 属性的解析（解析端根本不读这两个属性，`quoted-selection.ts:66-95`）无用例。
- 脆弱点：用例 1 断言绑定消毒实现的字面输出 `</quoted_file_>`（`quoted-selection.ts:41` 的替换格式）——改消毒策略会连锁失效；解析依赖正则（`:14-15`）对畸形嵌套标签的行为未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例的设置/动作/断言逐条（见 §2/§3） | 已证实 | `quoted-selection.test.ts:5-84` 逐行读 |
| 无 mock、纯函数直测 | 已证实 | `:1-2` 导入仅 `bun:test` 与被测模块 |
| 解析端不读 `message_id`/`role`（构建端写、解析端丢弃） | 已证实 | `quoted-selection.ts:51-53` 写 vs `:66-95` 解析仅取 path/label/source |
| 用例 2 的「Markdown/富文本转义来源」场景 | 推断 | 场景来自真实富文本管线（`:17` 注释自述），未核对该管线实现 |
| 测试运行状态 | 未知 | NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI，不得视为已通过 |

## 6. 覆盖表

| 用例/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 文件引用构建+解析+消毒 | §2/§3 | 5-24 | covered |
| 转义 quoted_context 解析 | §2/§3 | 26-45 | covered |
| 多来源区分+顺序 | §2/§3 | 47-84 | covered |
| `agent-interruption`/缺 path/缺 label 分支 | §4 | — | unknown（未断言） |
| `escape/decodeXmlAttribute` 独立往返 | §4 | — | partial（间接） |
