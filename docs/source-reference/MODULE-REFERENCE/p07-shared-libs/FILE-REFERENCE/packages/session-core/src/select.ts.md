---
path: packages/session-core/src/select.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a456be266c8260ec99f423ce41c3de80a66b8424
sha256: 6c09557d592b1aebbdcadde45267ea435b13cef677e24a2948f6f045b9f645ea
lines: 36
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/select.ts

## 1. 结论与边界

**turn 窗口截取纯函数**（`packages/session-core/src/select.ts:1-36`）：按 `range/head/tail/offset/limit` 截取 `TranscriptTurn[]` 子集，下标稳定；优先级 `range > head > tail > offset/limit`，不传窗口返回全部（`:16-19` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SelectOptions` | interface（export） | `:3-14` | `{ range?: [number,number]; head?; tail?; offset?; limit? }` | range 为闭区间（`:4`） |
| `selectTurns` | function（export） | `:20-36` | `(turns, opts?) => TranscriptTurn[]` | 唯一函数 |

## 3. 内部逻辑与关键流程

`selectTurns`（`:20-36`）按优先级短路：

1. `range`（`:22-27`）：`lo/hi` 归一（`Math.min/max`，`:24-25`），**按 `t.index` 过滤**闭区间（`:26`）——不是按数组位置。
2. `head`（`:28`）：`slice(0, max(0, head))`。
3. `tail`（`:29`）：`slice(max(0, len-tail))`。
4. `offset/limit`（`:30-34`）：`start = offset ?? 0`，`end = limit ? start+limit : undefined`，`slice(start, end)`。
5. 无窗口 → 原数组返回（`:35`）。

## 4. 调用者与调用链

- 入向（包外 2 文件）：`apps/cli/src/commands/export.ts`、`apps/cli/src/commands/outline.ts`（CLI `--turns` 窗口语义）；`packages/session-core/src/index.ts` 再导出；注释提及（非调用）：`search.ts:22`。
- 测试入向：`packages/session-core/src/session-core.test.ts:105-109`（range/head/tail 三断言）。
- 出向：类型 `./transcript`（`:1`）。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O、无副作用；返回新数组或原数组（无窗口时）。

## 6. 分支、失败、取消与恢复

五分支（§3）；不抛错。边界行为：`head`/`tail` 负值→`max(0,…)`；`range` 反序→自动归一；`offset > len`→空数组（slice 语义）。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改优先级/区间语义 → CLI `export --turns`/`outline` 的窗口输出与 `session-core.test.ts:105-109` 断言。

## 9. 测试证据

**直接测试 `packages/session-core/src/session-core.test.ts:105-109`（1 用例，NOT_RUN）**：`selectTurns(turns,{range:[2,3]})` 下标 `toEqual([2,3])`（`:106`）、`{head:1}`→`[0]`（`:107`）、`{tail:1}`→`[3]`（`:108`）。未覆盖：`offset/limit`、反序 range、负值。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、五分支优先级、index 过滤语义 | 已证实 | 逐行读 `:1-36` |
| 测试 1 用例断言 | 已证实 | 测试 `:105-109` |
| offset/limit 边界 | 已证实（slice 语义）/未测 | `:30-34` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `selectTurns` 五分支 | §3/§6 | `:20-36` | covered |
| `SelectOptions` | §2 | `:3-14` | covered |
| 测试 | §9 | 测试行号 | covered（NOT_RUN） |
