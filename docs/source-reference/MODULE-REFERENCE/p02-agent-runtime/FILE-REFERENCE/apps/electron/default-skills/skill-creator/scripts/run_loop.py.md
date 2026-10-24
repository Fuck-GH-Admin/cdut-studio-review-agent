---
path: apps/electron/default-skills/skill-creator/scripts/run_loop.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30a263d674ef19de11c756d6f7537f91a421909e
sha256: 7bd6f674203168520517eec94c55f493c0d154339b061b4d7c0f0dad187d0f21
lines: 328
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/run_loop.py

## 1. 结论与边界

Eval+改进循环（头注释 :2-7）：循环「评测→改 description」直到全过或达最大迭代；train/test 分层切分防过拟合。

## 2. 导出与关键符号

函数 3 个（`def` :24/:47/:244）：`split_eval_set(eval_set, holdout, seed=42)`（:24，**按 should_trigger 分层** train/test）、`run_loop(...)`（:47，主循环）、`main()`（:244，CLI）。

## 3. 内部逻辑与关键流程

（导出段+docstring 级，328 行）：分层切分（:24-45）→循环（:47-）：run_eval train（+test）→全过/达上限停→否则 improve_description 携历史→取最高分版本收尾。

## 4. 调用者与调用链

入向：CLI（skill-creator 工作流）。出向：`run_eval`/`improve_description`（同目录）。

## 5. 数据 I/O、读写与副作用

子进程模型调用（NOT_RUN）；读写 eval/history/日志 JSON。

## 6. 分支、失败、取消与恢复

循环终止二条件（全过/max iterations）；不适用取消/恢复。

## 7. 权限与权威状态

train/test 分层（seed=42 确定性）为防过拟合权威。

## 8. 修改影响面

- 消费面：skill-creator 自优化工作流顶层。
- 依赖面：run_eval/improve_description 契约。
- 需同步测试：无（脚本层）。

## 9. 测试证据

无（脚本层无测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 函数职责+分层切分 | 已证实 | docstring+导出段 |
| 循环实现逐行 | 推断（大纲级） | :47-243 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 函数+循环链 | §2/§3 | :24-328 | covered（大纲级） |
