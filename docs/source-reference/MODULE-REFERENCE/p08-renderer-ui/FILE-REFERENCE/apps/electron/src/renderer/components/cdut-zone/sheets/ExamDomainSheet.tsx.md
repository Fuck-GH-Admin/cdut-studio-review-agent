---
path: apps/electron/src/renderer/components/cdut-zone/sheets/ExamDomainSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f831cb24bb11338db6f0738aaafdd4f9d4e52f6b
sha256: 6ea882f7eda2796c6dd740849064cec382e806da8ddd689143253afb69bd03bf
lines: 310
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/sheets/ExamDomainSheet.tsx

## 1. 结论与边界

CDUT「期末考场日程」抽屉业务卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/sheets/ExamDomainSheet.tsx:1-10`）：高保真电子准考证风格（座位号大字+距开考倒计时雷达）；最近一场置顶呼吸光晕、已考置灰归档；详细考场卡（科目/时间/教室/座位/准考证号/统考形式）；考前防作弊贴士；实时教务与演示数据无缝回退。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ExamDomainSheet` | 组件（导出） | 96-310 | 主卡片 |
| `ExamItem` | 内部接口 | 28-35 | 科目/时间/考场/座位/准考证/形式 |
| `normalizeExams` | 内部 | 38-67 | 双式兼容（数组/`exams`）；字段多别名回退默认（`时间待定/考场待定/—/期末统考`）；无科目名跳过 |
| `parseExamStart` | 内部 | 70-81 | 时间文本解析（`2027-01-18 14:30~16:30` 式；失败 null） |
| `describeCountdown` | 内部 | 84-94 | 天/时/分倒计时（≤1 天 urgent） |

## 3. 内部逻辑与关键流程

- 倒计时 30s 刷新 interval（`:102-105`）；查询 `callDomainTool({domain:'exams',action:'query_exam_schedule'})`（失败→isDemo 错误结果，`:115-121`）。
- upcoming/archived 分流（`:136-146`）：开始时间已过→归档；未考按开考升序（**无时间解析的排前** `:140`）。
- `renderExamCard`（`:154-220`）：isNext 高亮+「最近一场」徽标+倒计时（urgent 呼吸动画）；座位号虚线准考证大字；准考证号 `—` 不展示（`:211`）。
- 总览看板（`:252-271`）：已排期门数+「距下一门」；提醒贴士（**身份证与学生证提前 15 分钟、严禁手机**，`:274-279`）。

## 4. 调用者与调用链

入向：CDUT 专区考务抽屉；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/shared`、`window.electronAPI.cdutZone.callDomainTool`。

## 5. 数据 I/O、读写与副作用

IPC 域工具调用；30s interval；本地状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 查询失败 | isDemo 错误 | 115-121 |
| 时间解析失败 | 视为未考排前 | 140 |
| 空/加载 | 空态/骨架 | 295-301 |
| 倒计时过期 | null 不显示 | 86 |

## 7. 权限与权威状态

考务权威=青果考务（实时/演示 `isDemo` 显式）；倒计时本地推算。

## 8. 修改影响面

改排序/倒计时影响考前提醒。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实教务。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 准考证风格/归档分流 | 已证实 | `:136-220` |
| 倒计时雷达 | 已证实 | `:70-105` |
| isDemo 回退 | 已证实 | `:115-121,228-238` |
| 真实考务数据 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 规范化+helpers | §2 | 28-94 | covered |
| 主组件 | §3 | 96-310 | covered |
| 断言 | §9,§10 | — | unknown |
