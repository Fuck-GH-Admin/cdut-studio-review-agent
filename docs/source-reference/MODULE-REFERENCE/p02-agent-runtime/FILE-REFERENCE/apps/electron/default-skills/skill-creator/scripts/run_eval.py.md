---
path: apps/electron/default-skills/skill-creator/scripts/run_eval.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e58c70bea39d5b252a1e819f242bbdcdf20e8b87
sha256: 43e3b8f80dbf69c343967ba77e268fae991d9fa3ed68b32a0ff02532cd48657f
lines: 310
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/run_eval.py

## 1. 结论与边界

Skill description 触发评测（头注释 :2-6）：对 eval 集逐 query 跑 `claude` 检测 skill 是否被触发，输出 pass/fail 与汇总。auth 同 improve_description（会话 Claude Code auth）。

## 2. 导出与关键符号

函数 4 个（`def` :22/:35/:184/:259）：`find_project_root()`（:22，向上找 `.claude/`）、`run_single_query(...)`（:35，单 query 判触发）、`run_eval(...)`（:184，全集跑+汇总）、`main()`（:259，CLI）。

## 3. 内部逻辑与关键流程

（导出段+docstring 级，310 行）：加载 eval 集（query+should_trigger）→逐 query 子进程跑判定触发次数（runs）→结果 `{pass, triggers, runs}` 汇总 `{passed,total}` →JSON 输出供 improve_description 消费。

## 4. 调用者与调用链

入向：`run_loop.py`（循环评测）+CLI。出向：`subprocess`（claude）、`scripts.utils` 系。

## 5. 数据 I/O、读写与副作用

子进程模型调用（NOT_RUN）；读 eval 集 JSON；写结果 JSON。

## 6. 分支、失败、取消与恢复

单 query 失败记 fail 不中断（结果级容错）；不适用取消/恢复。

## 7. 权限与权威状态

should_trigger 为评测权威标签。

## 8. 修改影响面

- 消费面：run_loop/train-test 评估流。
- 依赖面：`claude` CLI、eval 集 schema。
- 需同步测试：无（脚本层）。

## 9. 测试证据

无（脚本层无测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 函数职责+CLI | 已证实 | docstring+导出段 |
| 评测实现逐行 | 推断（大纲级） | :35-258 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 函数+评测链 | §2/§3 | :22-310 | covered（大纲级） |
