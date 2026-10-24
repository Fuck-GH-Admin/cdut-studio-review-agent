---
path: apps/electron/src/renderer/lib/channel-manual-model.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 408647df3b5a211edf9d9a80762c22aacda9a247
sha256: f03dca723f1349c4ed6e80e446086c0e4fdc76317286d1390a12f594f2242506
lines: 51
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-manual-model.test.ts

## 1. 测试目标

验证 `addManualModel`（`apps/electron/src/renderer/lib/channel-manual-model.ts:23`）的手动添加模型语义：正常追加、显示名处理、输入法组词残留/粘贴夹带空白的拒绝、空输入拒绝、同 ID 去重，确保垃圾条目不进入渠道模型列表（防 auto-save 落盘污染）。测试为同步纯函数测试，`bun:test` 框架（`apps/electron/src/renderer/lib/channel-manual-model.test.ts:1`）。

## 2. 用例清单

机械计数：`test(` = 6、`it(` = 0（grep `^\s*(it|test)\(` 于 `apps/electron/src/renderer/lib/channel-manual-model.test.ts`），与下表一致：

1. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:6`：Given 正常输入 When 添加 Then 追加 enabled 的 manual 模型。
2. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:15`：Given 输入了可选显示名 When 添加 Then 使用显示名。
3. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:28`：Given 输入法组词中残留文字带空格 When 添加 Then 拒绝且不改变列表。
4. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:35`：Given 粘贴的多行文本 When 添加 Then 含内部换行视为非法。
5. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:39`：Given 空输入或纯空白输入 When 添加 Then 拒绝。
6. `apps/electron/src/renderer/lib/channel-manual-model.test.ts:44`：Given 已存在同 ID 模型 When 重复添加 Then 不再追加重复条目。

## 3. 真实断言

- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:8`：`expect(result).toEqual({ kind: 'added', id: 'gpt-4o-mini', models: [...] })`（trim 后 ID、显示名回退 ID、enabled/source 字段全量比对）。
- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:17`：`expect(result.kind).toBe('added')`；`:19`：`expect(result.models[0]).toEqual({ id: 'claude-opus-4-6', name: 'Opus 4.6', ... })`（显示名 trim）。
- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:32`：`expect(addManualModel(current, 'cl aude', '').kind).toBe('invalid')`。
- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:36`：`expect(addManualModel([], 'gpt-4o\ngpt-4o-mini', '').kind).toBe('invalid')`。
- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:40-41`：`expect(...kind).toBe('empty')`（'' 与 '   ' 两输入）。
- `apps/electron/src/renderer/lib/channel-manual-model.test.ts:49`：`expect(result).toEqual({ kind: 'duplicate', models: current, id: 'gpt-4o' })`（返回原列表对象语义）。

## 4. 未覆盖与脆弱点

- 未覆盖：`duplicate` 分支对 `current` 的引用同一性仅用 toEqual 值比较（`apps/electron/src/renderer/lib/channel-manual-model.test.ts:49`），未用 `toBe` 断言不新建数组；`invalid` 情形只测空格与换行，未测 Tab；显示名内部含空白（合法）未测。
- 用例 3 的 `current` 列表（`apps/electron/src/renderer/lib/channel-manual-model.test.ts:29-31`）在 invalid 分支下未再读回，未直接断言"列表不变"（标题宣称，断言只验 kind）。
- 脆弱点：全部同步断言、无 fake timer/异步，无时序脆弱性；toEqual 对字段集合全量比对，被测类型加字段会同时打破多条断言（有意的契约锁）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 用例数 6、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/channel-manual-model.test.ts:8-49` |
| 六种输入形态与 `AddManualModelResult` 四态对应 | 已证实 | `apps/electron/src/renderer/lib/channel-manual-model.test.ts:6-50` |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `addManualModel` added | §2,§3 | `channel-manual-model.test.ts:6-13` | covered |
| added + 显示名 | §2,§3 | `channel-manual-model.test.ts:15-26` | covered |
| invalid（内部空格） | §2,§3 | `channel-manual-model.test.ts:28-33` | covered |
| invalid（内部换行） | §2,§3 | `channel-manual-model.test.ts:35-37` | covered |
| empty | §2,§3 | `channel-manual-model.test.ts:39-42` | covered |
| duplicate | §2,§3 | `channel-manual-model.test.ts:44-50` | covered |
| duplicate 引用同一性 / Tab 非法 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
