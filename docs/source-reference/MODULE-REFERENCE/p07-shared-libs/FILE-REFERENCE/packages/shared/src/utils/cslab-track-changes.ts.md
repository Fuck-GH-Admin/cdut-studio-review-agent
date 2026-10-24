---
path: packages/shared/src/utils/cslab-track-changes.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6cb53a1c38d22ba8357fc1e06de9fa7579022d9e
sha256: 5cdddf8da186b04db020d16a6cbf5800b4b70171c23341e1a86f5b2bbe4e5d55
lines: 118
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-track-changes.ts

## 1. 结论与边界

CSLab **审稿建议→ProseMirror 切片计划**（主/渲染共用，`packages/shared/src/utils/cslab-track-changes.ts:1-11`）。ProseMirror Inline Mark 不允许跨 Block 边界，因此施加建议前：① 单块唯一命中→单切片；② 跨块命中→按块边界切多段；③ 多处歧义/无法精确命中→**显式失败**由调用方降级为段落批注。**红线**（`:10`）：不做模糊替换，不猜测用户意图。

边界：只做命中规划（不改文档）；跨块仅支持**相邻两块**拼接（`:69-97`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabDocBlock` | interface | 13-19 | `{start; text; blockType}` | start=PM 文档起始 pos |
| `CsLabSuggestionSlice` | interface | 21-27 | `{from; to; blockType; text}` | |
| `CsLabSuggestionPlan` | type | 29-32 | 三态：`ok:true+slices+degraded:false` \| `ok:true+空+degraded:true+reason` \| `ok:false+空+reason('quote-not-found'\|'quote-ambiguous'\|'quote-empty')` | |
| `planSuggestionApplication` | function | 43-104 | `(blocks, quote) => CsLabSuggestionPlan` | |
| `describeSuggestionPlanFailure` | function | 107-117 | `(plan) => string` | ok→''；三态中文文案 |

内部：`occurrences`（`:34-41`，全位置 indexOf 链）。

## 3. 内部逻辑与关键流程

`planSuggestionApplication`（`:43-104`）：

1. `:45-46` quote trim 空 → `quote-empty`。
2. `:48-66` 逐块全命中（`occurrences`）：恰 1 → 单切片成功；>1 → `quote-ambiguous`。
3. `:69-97` **跨块相邻拼接**：needle 归一空白（`\s+→' '`）；逐相邻块对×逐分割点：左块归一文本以 head 结尾且右块以 tail 开头 → 双切片（左 `from=headOffset→块尾`、右 `块首→tail 末端`）。
4. 未命中 → `quote-not-found`。

`describeSuggestionPlanFailure`（`:107-117`）：三态文案（空/「出现多次，已跳过以避免误改」/「请人工确认或改为段落批注」）。

注：`CsLabSuggestionPlan` 的 `degraded:true` 分支（`:31`）在本文件**无产出点**（planSuggestionApplication 只产出 ok:true+degraded:false 或 ok:false）——降级由调用方构造（照实记录）。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：

- `planSuggestionApplication`：`apps/electron/src/renderer/components/cdut-science/cslab-track-changes-extension.ts:17,573`、`apps/electron/src/main/lib/cslab/cslab-track-changes.test.ts:14,255-284`（批外 10 test 中 3 例直测）；经 `apps/electron/src/main/lib/cslab/cslab-track-changes.ts:16`（**同 basename 转发再导出**）间接入 main。
- `describeSuggestionPlanFailure`：同转发 `:15` + extension `:16,764`（再导出无消费方）。
- `CsLabDocBlock`：extension `:18,314-315` 类型消费。
- `CsLabSuggestionSlice`/`CsLabSuggestionPlan`：仅转发再导出（零实际消费）。
- **同名碰撞警示**：`apps/electron/src/main/lib/cslab/cslab-track-changes.ts` 与本文件同 basename 不同模块（转发+OOXML），检索模块名须区分。
- 产品入口：main（经转发）+ renderer（extension）；preload/core/cli 无。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯规划函数。

## 6. 分支、失败、取消与恢复

失败=显式三态（红线不猜）；「恢复」=调用方降级段落批注（`:5`）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:10`）：不模糊替换。

## 8. 修改影响面

- 命中语义（trim/空白归一/相邻两块限制）影响审稿建议批改可靠性。
- 测试：批外 `cslab-track-changes.test.ts`（10 test）。

## 9. 测试证据

本批**无**直接测试；间接 `apps/electron/src/main/lib/cslab/cslab-track-changes.test.ts`（批外 10 test，3 例直测）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（不模糊替换）+三态显式失败 | 已证实 | `:10,29-32` |
| 跨块仅相邻两块 | 已证实 | `:69` |
| `degraded:true` 无本文件产出点 | 已证实（照实记录） | `:31,54-102` |
| 2 类型零实际消费 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 PM 文档操作 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 类型 + 2 函数 | §2 | 13-117 | covered |
| 三态命中 | §3 | 43-104 | covered |
| 文案 | §3 | 107-117 | covered |
