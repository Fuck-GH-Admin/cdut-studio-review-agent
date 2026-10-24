---
path: apps/electron/src/renderer/components/agent/AgentImageGenerationCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b9f792c2dd48020e6bbd6812e7712e22fb6f138f
sha256: 8780407981506865c03816a5cb3fc48698812efe6af6c6b61768b66d2eca6c85
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentImageGenerationCard.tsx

## 1. 结论与边界

图片生成进度卡（注释 `:6/:16`）：**瞬态状态 UI**——succeeded/failed 记录刻意不渲染（最终图片/错误留在正常 Agent 输出与工具审计）。紧凑单行进度指示。纯展示 + 本地计时。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `imageGenerationStatusLabel` | function | `:7-9` | status→文案（saving=“正在保存图片”，其余=“正在请求图片服务”） |
| `AgentImageGenerationCardView` | function 组件 | `:17-35` | `({card}) => ReactElement \| null`（非 pending 返回 null） |

内部：`formatElapsed`（`:11-14`，秒→“N秒/N分M秒”）。

## 3. 内部逻辑与关键流程

- `pending = status==='requesting' || 'saving'`（`:19`）；非 pending 渲染 null（终态刻意不渲染，`:25`）。
- pending 时 250ms interval 刷新计时（`:20-24`，卸载清定时器）。
- 行内布局（`ml-[56px]` 对齐消息体/运行指示器而非头像列，`:28`）：spinner+状态+prompt（truncate）+`kind · size · 耗时`；kind 由 `reference.kind`（last_generated=“编辑上一张图”/paths=“参考图编辑”/其余=“文本生图”）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 消息流（工具卡片渲染处）。出向：`react`、`lucide-react`、`@/lib/utils.cn`、`@profer/shared.AgentImageGenerationCard`。

## 5. 数据 I/O、读写与副作用

仅本地 `useState/useEffect` 计时器；无 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非 pending | `:25` | null（终态不渲染） |
| kind 三态 | `:27` | 文案映射 |
| 取消 | `:23` | 卸载清 interval |

## 7. 权限与权威状态

诚实边界：终态（成败）不在此渲染、归工具审计（`:6/:16` 注释）。

## 8. 修改影响面

改文案/布局 → 影响生成进度展示；`AgentImageGenerationCard` 契约联动 shared。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 终态刻意不渲染 | 已证实 | `:6/:25` |
| 250ms 计时+卸载清理 | 已证实 | `:20-24` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两导出+formatElapsed | 2/3 | `:7-35` | covered |
