---
path: apps/electron/default-skills/skill-creator/scripts/generate_report.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 959e30a0014ec165c41a2bb7420b7dfe1416bbac
sha256: 13df7118a3c50c83c4c3250a606d5f2b20b25a3d44cbc392b3d669ec75281453
lines: 326
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/generate_report.py

## 1. 结论与边界

从 run_loop.py 输出生成**技能描述优化 HTML 报告**（`apps/electron/default-skills/skill-creator/scripts/generate_report.py:1-7`）：每行=一次描述迭代，列=train/test 查询的触发判定（✓/✗），区分 train/held-out test。CLI：`python generate_report.py <input|-> [-o out.html] [--skill-name]`（`:304-322`，支持 stdin）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `generate_html(data, auto_refresh, skill_name)` | 16-301 | 组装整页 HTML |

内部流程：train/test 查询清单取 `history[0]` 的 `train_results/results`+`test_results`（`:26-30`，`should_trigger` 默认 true）；`auto_refresh` 加 5s meta refresh（`:32`）；头部内嵌 Google Fonts 外链（Poppins/Lora，`:39-41`）与样式（`:42-146`）；summary 卡（original/best/best_score/iterations，`:156-165`）；图例（`:168-176`）；表头按查询极性着色（positive-col/negative-col、test-col 蓝底，`:191-198`）；best_iter 按 test_passed 或 train_passed 取最大（`:206-209`）；每行——`aggregate_runs` 跨重试聚合（should_trigger 取 triggers 否则 runs-triggers，`:227-238`）、`score_class` 阈值 0.8/0.5（`:244-251`）、`best-row` 高亮（`:256`）、逐查询 ✓/✗ + `triggers/runs` 小字（`:265-287`）。

## 3. 内部逻辑与关键流程

主链路：`main`（`:304-322`）读文件或 stdin → `generate_html(data, auto_refresh, skill_name)`（`:16-301`）：history[0] 取 train/test 查询清单（`:26-30`）→ summary 卡（`:156-165`）→ 表头按查询极性着色（`:191-198`）→ best_iter 按 test/train_passed 取最大（`:206-209`）→ 逐行 `aggregate_runs` 跨重试聚合（`:227-238`）+score 阈值 0.8/0.5 着色（`:244-251`）→ 输出整页 HTML（auto_refresh 加 5s meta `:32`）。
## 4. 调用者与调用链

入向：**`skill-creator/scripts/run_loop.py:18` `from scripts.generate_report import generate_html`（代码级 import，调用点 `:151/:317/:321`——QA F-NB64R2-01 校正，此前「零命中」为按文件名检索漏检模块式 import 的假负向）**；另有 CLI 直执行路径 `python generate_report.py <input|->`（`:304-322`，人工/Agent 执行，与 import 路径并列）。出向：stdlib json/argparse/sys。
## 5. 数据 I/O、读写与副作用

run_loop JSON：`{history:[{iteration, description, train_passed/total, test_passed/total, train_results/results:[{query, should_trigger, pass, triggers, runs}], test_results}], best_*, original_description, iterations_run, train_size, test_size, holdout}`（`holdout` 解构未用，`:19`——照实记录）。

## 6. 分支、失败、取消与恢复

字段缺失走 `.get` 默认（如 `train_passed` 回退 `passed`，`:214`）；空 history 时 `max()` 在 `:207-209` 会抛 ValueError（无空历史防御——照实记录）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

**依赖方向（QA F-NB64R2-01 校正）**：run_loop.py import 本脚本的 `generate_html` 生成实时/最终 report.html（`:151/:317/:321`）；本脚本 CLI 另可消费 run_loop 输出 JSON。样式/文案改动影响 report.html 展示。外链 Google Fonts 需网络（离线时字体回退 serif/sans，推断）。

## 9. 测试证据

无专属测试（冻结树检索零命中）；NOT_RUN。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全流程/聚合口径/阈值 | 已证实 | `:16-326` 逐行 |
| 空 history 无防御 | 已证实 | `:207-209`（静态） |
| `holdout` 未使用 | 已证实 | `:19` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| generate_html 全流程 | §2 | covered |
| 输入契约/降级 | §5-§6 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
