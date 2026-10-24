---
path: apps/electron/default-skills/skill-creator/scripts/aggregate_benchmark.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e66e8c105be9bab9f0e9c61f0d1482619401580
sha256: 123ef128ea5ccc01a4b1ac212ef5567f21e9c13d3d240609780beeb3200c49aa
lines: 401
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/aggregate_benchmark.py

## 1. 结论与边界

把逐 run 的 `grading.json` 聚合成 **benchmark.json + benchmark.md**（`apps/electron/default-skills/skill-creator/scripts/aggregate_benchmark.py:1-35`）：支持 Workspace 布局（eval-N 直接在基准目录）与 Legacy 布局（`runs/` 子目录）；config 目录动态发现（with_skill/without_skill 或 new_skill/old_skill）。CLI：`python aggregate_benchmark.py <benchmark_dir> [--skill-name] [--skill-path] [-o]`。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `calculate_stats` | 45-64 | mean/stddev(样本,n-1)/min/max 四位小数；空表全 0 |
| `load_run_results` | 67-173 | 双布局探测（`:75-82`）；eval_id 三级来源（metadata→目录名→索引，`:87-98`）；config 目录需含 `run-*`（`:105`）；读 grading.json 提取 summary（pass_rate/passed/failed/total，`:127-134`）、timing（grading 或 sibling timing.json，`:136-147`）、execution_metrics（tool_calls/tokens 回退 output_chars/errors，`:150-154`）、expectations（校验 text/passed 字段，`:157-161`）、user_notes_summary 三键合并 notes（`:163-169`） |
| `aggregate_results` | 176-224 | 每 config 三组 stats；delta=前两 config 均值差（`:207-216`，格式化字符串 `+X.XX`） |
| `generate_benchmark` | 227-278 | runs 数组+metadata（executor_model/analyzer_model 占位 `<model-name>`、`runs_per_configuration: 3` 硬编码 `:271`、notes 留给 analyzer） |
| `generate_markdown` | 281-335 | 摘要表（Pass Rate/Time/Tokens ±stddev + delta）+ Notes |
| `main` | 338-401 | 写 benchmark.json+同名 .md；打印汇总 |

## 3. 内部逻辑与关键流程

主链路：`main`（`:338-401`）→ `load_run_results`（`:67-173`，双布局探测 `:75-82`、eval_id 三级来源 `:87-98`）→ `aggregate_results`（`:176-224`，每 config 三组 stats+delta 均值差）→ `generate_benchmark`（`:227-278`）/`generate_markdown`（`:281-335`）→ 写 `benchmark.json`+同名 `.md` 并打印汇总。
## 4. 调用者与调用链

入向：无代码级调用方（冻结树检索零命中，自身 docstring 用法除外）；**`skill-creator/SKILL.md:234` 指令点名 `python -m scripts.aggregate_benchmark`（非代码调用，QA N-NB64R2-01 补）**。出向：stdlib json/statistics/pathlib；**产物被 `generate_review.py --benchmark` 与 viewer.html Benchmark tab 消费**（§8）。
## 5. 数据 I/O、读写与副作用

输入：`eval-*/<config>/run-*/grading.json`（可含 timing.json）；输出：`benchmark.json`（metadata/runs/run_summary/notes）与 `benchmark.md`。`expectations` 项要求 `text/passed/evidence` 三字段（`:156` 注释，viewer 依赖）。

## 6. 分支、失败、取消与恢复

grading.json 缺失/坏 JSON→warning 跳过（`:116/:123`）；目录缺失→exit 1（`:366`）；空配置→全 0 stats（`:188-193`）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

benchmark.json 被 `generate_review.py --benchmark`/viewer.html Benchmark tab 消费；`runs_per_configuration` 硬编码与实际 run 数不符时仅影响 metadata 展示（照实记录）。

## 9. 测试证据

无专属测试（冻结树检索零命中）；NOT_RUN。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全函数/双布局/统计口径 | 已证实 | `:45-401` 逐行 |
| runs_per_configuration=3 硬编码 | 已证实 | `:271` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| 全部函数/契约/降级 | §2/§5/§6 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
