---
path: apps/electron/src/main/lib/title-generation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ee098f1a8fe0d89ec8ff6351b2963133477571e
sha256: 376a5b122e37fd0d42b808493072557d4e2bff78305f96f17f4ac20fd4cac531
lines: 296
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/title-generation.test.ts

## 1. 测试目标

`title-generation.ts` 全导出面（prompt/清洗/兜底/来源收集/窗口 prompt/首轮单次裁决）。被测逻辑见同组 `title-generation.ts.md`。多条为**回归测试**（注释明示：内联正则编码退化、content 数组 trim 抛异常、` 退化）。

## 2. 用例清单

9 个 describe + **44 个 `test()`**：

| describe | 用例数 | 行 |
| --- | --- | --- |
| buildTitlePrompt | 3 | `:22-33` |
| sanitizeGeneratedTitle | 14 | `:37-125` |
| createFallbackTitle | 4 | `:129-144` |
| 常量 | 1 | `:148-151` |
| evaluateTitleSource | 9 | `:157-221` |
| collectTitleSources | 5 | `:225-247` |
| buildWindowTitlePrompt | 1 | `:251-256` |
| createWindowFallbackTitle | 2 | `:260-266` |
| planAutoTitle | 5 | `:274-295` |

## 3. 真实断言（代表性）

- prompt：`toBe(UNIFIED_TITLE_PROMPT + msg)`（`:23/:27`）；约束语句 `toContain`（`:31-32`）。
- 清洗：直引号/弯引号/书名号剥离（`:38/:44-45/:49-50`）；content 数组拼接 `toBe('修复登录问题')`（`:56-59`）；thinking/reasoning/toolCall 块剔除只留显式 text（`:63-68`）；全非文本 → `toBeNull()`（`:72-75/:102-106`）；无 type `{text}` 兼容保留（`:79-80`）；混合时仅显式 text 权威（`:84-87`）；无 text 字段块跳过（`:95-98`）；` 包裹剥离（`:111-113`）；仅推理+fallbackSource → 首句兜底（`:118-119`）；超长截 `MAX_TITLE_LENGTH`（`:124`）。
- 兜底：首行/Markdown 前缀/截断/null（`:130-144`）；常量 `4`/`20`（`:149-150`）。
- 来源判定：纯命令无信息、载荷保留（`:158-166`）；**路径不当命令**（`:171-172`）；寒暄表（17 样本）无信息（`:176-178`）；6 有主题样本 informative（`:182-183`）；注入块剥离（`:189-192`）；SYSTEM_CONTEXT 连内容剥/USER_REQUEST 去标签留正文（`:209-210`）；划词引用/调度标记剥离（`:215/:220`）。
- 收集：过滤/去重/400 截断/4 条上限/全寒暄空数组（`:226-247`）。
- 窗口 prompt：编号列表+**'never copy the verbatim text of one message'**（`:253-255`）。
- 裁决：generate default（`:275`）、locked/auto-generated/human-named 短路（`:279/:283/:287`）、fork 分支 `allowNonDefaultTitle` → `generate/exploration` 且 false 时 human-named（`:292-294`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`collectTitleSources` 与真实会话转录集成（调用方跨文件）；模型输出质量。
- 脆弱点：prompt 全文镜像常量 `UNIFIED_TITLE_PROMPT`（`:18-19`）——prompt 变更需同步。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 44 用例断言如 §3 | 已证实 | 逐行读 `:1-296` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| prompt 构建 | 3 | covered |
| 清洗/归一（含 3 组回归） | 14 | covered |
| 兜底 | 6 | covered |
| 来源判定/收集 | 14 | covered |
| 窗口/裁决 | 7 | covered |
