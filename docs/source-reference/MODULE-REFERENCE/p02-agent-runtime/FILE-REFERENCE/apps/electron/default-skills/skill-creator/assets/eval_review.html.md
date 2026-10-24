---
path: apps/electron/default-skills/skill-creator/assets/eval_review.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 938ff32aed9bffabf723bd5492d720f4736c8e4d
sha256: ce477dcc74dc1c0d1d3352646a79167b5a63634e936b1019160025065974e452
lines: 146
kind: template
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/assets/eval_review.html

## 1. 入口与加载方式

skill-creator 的 **Eval Set 审阅页模板**（单文件静态页）：三占位符供生成端替换——`__SKILL_NAME_PLACEHOLDER__`（`:6/:41`）、`__SKILL_DESCRIPTION_PLACEHOLDER__`（`:42`）、`__EVAL_DATA_PLACEHOLDER__`（`:63`）。Google Fonts 外链（`:7-9`）；无其他外部依赖。引用方为 skill-creator 工作流文档（非代码 import——静态检索）。

## 2. 脚本块与事件流

唯一内联 `<script>`（`:62-144`）：

- 状态：`EVAL_DATA`（占位符注入数组，`:63`）→ `evalItems` 拷贝（`:65`）。
- `render()`（`:67-103`）：按 should_trigger 分组排序（触发组在前，`:72-74`）+ 分组表头（`:79-85`）；每行 textarea+toggle 开关+Delete（`:88-100`）。
- 事件：`updateQuery/updateTrigger/deleteRow`（`:111-113`）、`addRow`（`:115-120`，追加后聚焦末行）、`updateSummary`（`:122-127`，计数文案）。
- `exportEvalSet()`（`:129-141`）：过滤空 query→JSON Blob→`eval_set.json` 下载（URL.createObjectURL+click+revoke）。
- 入口 `render()`（`:143`）。

## 3. DOM 契约

id：`skill-name`（`:41`）、`skill-desc`（`:42`）、`eval-body`（`:57`）、`summary`（`:60`）；按钮内联 `onclick="addRow()/exportEvalSet()"`（`:45-46`）；行内 `onchange="updateQuery/updateTrigger"`、`onclick="deleteRow"`（`:90/:93/:98`）。

## 4. 失败与降级

无 try/catch：`__EVAL_DATA_PLACEHOLDER__` 未替换即语法错误（静态）；`escapeHtml`（`:105-109`）防注入。

## 5. 修改影响面

占位符契约与生成端（skill-creator 工作流）同步；样式改动仅影响展示。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 占位符/全脚本/事件流 | 已证实 | `:1-146` 逐行 |
| 生成端脚本身份 | 未知 | 本批无对应生成器（generate_review.py 管 viewer，非本页） |
| 运行/渲染 | 未知 | NOT_RUN（GUI） |

## 7. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| 脚本/事件/DOM/占位符 | §1-§3 | covered |
| 降级/影响面 | §4-§5 | covered |
| 运行验证 | §6 | unknown（NOT_RUN） |
