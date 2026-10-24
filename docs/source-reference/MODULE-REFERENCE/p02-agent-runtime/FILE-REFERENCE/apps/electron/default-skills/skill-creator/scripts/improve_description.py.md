---
path: apps/electron/default-skills/skill-creator/scripts/improve_description.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 06bcec76122446986e3610c20a39c466de36f495
sha256: 87d864570220b699fac52da309d2d6efdb060647bfebc74f768128e646accf80
lines: 247
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/improve_description.py

## 1. 结论与边界

基于 eval 结果改进 skill description（头注释 :1-7）：调 `claude -p` 子进程（复用会话 Claude Code auth，无需独立 API key）。description 是 Claude 触发 skill 的唯一依据（prompt :79-81）。

## 2. 导出与关键符号

导出 2 条（`def` :20/:50）：`_call_claude(prompt, model, timeout=300)`（:20-47，prompt 走 stdin 防 argv 超长 :23-24；**删 CLAUDECODE 环境变量允许嵌套** :30-33）、`improve_description(skill_name, skill_content, current_description, eval_results, history, model, test_results?, log_dir?, iteration?)`（:50-247）。

## 3. 内部逻辑与关键流程

（:50-247）：失败/误触发分类（:62-69）→prompt 组装（当前描述/分数/失败清单/历史尝试「勿重复」:103-118/技能全文）→优化准则（不过拟合 :126-131、100-200 词/1024 字符硬限 :133、祈使句 :136-140）→`<new_description>` 标签解析（:145-146）→**超 1024 兜底重写**（:162-183，单轮内联前文，注释 :157-161：claude -p 一次性无法多轮）→transcript 全量落盘（log_dir :187-191）。

## 4. 调用者与调用链

入向：`run_loop.py`（优化循环）。出向：`scripts.utils`（parse_skill_md :17）、`subprocess`（claude -p）。

## 5. 数据 I/O、读写与副作用

子进程 `claude -p`（模型调用！NOT_RUN）；写 transcript JSON 日志。

## 6. 分支、失败、取消与恢复

claude 非 0 抛 RuntimeError（:43-46）；超长兜底重写（:162）。timeout 300s（:20）。

## 7. 权限与权威状态

1024 字符硬限权威（prompt+兜底双保险）；auth 复用会话凭据（不落 key）。

## 8. 修改影响面

- 消费面：run_loop 优化循环。
- 依赖面：`claude -p` CLI、eval_results 结构、SKILL.md 规范。
- 需同步测试：无（脚本层）。

## 9. 测试证据

无（脚本层无测试）。`NOT_RUN`（含 `claude -p` 子进程调用不执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；1024 兜底/CLAUDECODE 移除 | 已证实 | :30-33/:162-183 |
| claude 输出解析行为 | 未知（依赖模型） | — |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+改进链 | §2/§3 | :20-247 | covered |
