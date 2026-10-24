---
path: apps/electron/src/renderer/components/content-review/FindingCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb1fa55acc8cc040307b4e8d2ac2fc54c7cade25
sha256: d44edf41f479f39f61d07b4866bbe904fc6cd9518b43dce85ca77f1649351290
lines: 109
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/FindingCard.tsx

## 1. 结论与边界

**审核问题卡**（`apps/electron/src/renderer/components/content-review/FindingCard.tsx:1-7`）：右栏列表项，展示严重度+类型+标题+详情+建议+来源标记。点击→父组件写 `reviewFocusAtom` 触发左/中栏滚动高亮（D8 联动）。左色条：红=冲突、黄=待处理。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FindingCard` | 组件 | `:40-109` | `{finding, selected, onClick}` |

内部：`KIND_LABELS`（`:15-24`，8 类问题→中文）、`GENERATED_BY_LABELS`（`:27-31`，`ai/mock-engine/fixture`）、`FindingCardProps`（`:33-38`）。

## 3. 内部逻辑与关键流程

纯展示组件：`isRed = severity==='red'`（`:41`）→ 色条（`:57-60`）/徽标（`:64-75`，「冲突」/「待处理」）；类型/来源徽标（`:76-83`）；标题（`:86`）；详情 3 行截断、选中展开（`:88-91`）；建议块（`:93-98`）；建议分数（`suggestedScore` 或「待确认」，`:101`）+ 依据规则数（`:102-104`）。`aria-pressed={selected}`（`:47`）。

## 4. 调用者与调用链

- 消费方：RightPanel（右栏列表）；点击回调由父写 `reviewFocusAtom`（联动左/中栏）。
- 出向：`@profer/shared` 类型、`@/lib/utils`（cn）。

## 5. 数据 I/O、读写与副作用

无 I/O（展示+回调）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| red/非 red | `:41` | 冲突/待处理双态 |
| 选中/未选 | `:51-53`、`:89` | 高亮+详情展开 |
| 无建议 | `:94` | 隐藏建议块 |

## 7. 权限与权威状态

`GENERATED_BY_LABELS`（`:27-31`）如实标注结论来源（AI/模拟引擎/预置）——与「模拟引擎≠真跑」的证据分级呼应。

## 8. 修改影响面

- `KIND_LABELS` 8 类与 `FindingKind` 联合绑定（漏配显示 undefined）。
- 联动语义（reviewFocusAtom）在父组件。

## 9. 测试证据

无专属测试（全树检索 `FindingCard` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、双态/联动/来源标记 | 已证实 | `:15-109` |
| 联动实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `FindingCard` | `:40-109` | covered |
| 标签表 | `:15-31` | covered |
