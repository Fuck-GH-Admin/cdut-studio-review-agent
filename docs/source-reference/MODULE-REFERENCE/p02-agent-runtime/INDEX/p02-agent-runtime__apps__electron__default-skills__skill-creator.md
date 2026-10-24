# p02-agent-runtime__apps__electron__default-skills__skill-creator 索引（子代理指令与 JSON 契约）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p02-agent-runtime__apps__electron__default-skills__skill-creator`（owner `p02-agent-runtime`，family `apps/electron/default-skills/skill-creator`）共 4 个文件，七项必填：职责 / 消费（谁加载→何时生效→行为约束）/ 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## 家族背景（实读证实）

`skill-creator` 是「创建/评测/迭代技能」的元技能（`SKILL.md` 490 行）。`agents/` 与 `references/` 是**运行时加载的子代理指令/数据契约文本**：

- **谁加载**：`SKILL.md:466-470` 明示「The agents/ directory contains instructions for specialized subagents. Read them when you need to spawn the relevant subagent」并逐个列出 grader/comparator/analyzer；`SKILL.md:166/:236` 指向 `references/schemas.md`（「See `references/schemas.md` for the full schema…」）。运行时加载链=打包进 `process.resourcesPath/default-skills`（`apps/electron/electron-builder.yml:71-73` extraResources）→ `index.ts:940-941` 定位 → `~/.cdutai/default-skills/`（skill-master-manager.ts:1-13）→ agent 系统提示（`agent-prompt-builder.ts:961-963`）按 frontmatter 描述触发 skill-creator，读 SKILL.md 后按其指引读本组文件并 spawn 对应子代理。
- **何时生效**：技能评测循环（写 evals→跑测→逐 run 评分）、benchmark 聚合与归因、双版本盲对比环节。
- **行为约束（共通）**：这些文本是子代理的**行为规范**——定义 8 步流程、判分标准（如「证据须反映真实完成而非表面合规」）、输出 JSON 的**精确字段名**（viewer/聚合脚本按字段名消费，SKILL.md:230「The grading.json expectations array must use the fields `text`, `passed`, and `evidence` … the viewer depends on these exact field names」）。
- **打包（共通）**：进产物——electron-builder.yml:71-73 `extraResources: default-skills/**/*`。
- **来源（共通）**：项目自撰（Profer skill-creator），`change=unchanged_since_093f`（锁列照录）。
- **验证方法（共通）**：①核 SKILL.md 引用行；②输出格式与 `references/schemas.md` 各 schema 对齐；③实跑一次评测循环（NOT_RUN）。

## apps--electron--default-skills--skill-creator--agents--analyzer.md

- 职责：Post-hoc Analyzer 子代理指令（274 行），双角色：①**盲评后归因**（:1-186）——「unblind」对比结果，8 步流程（读 comparison 结果→读双方技能→读双方 transcript→分析指令遵循→赢家优势→败者弱点→生成改进建议→写结果，:21-89），输出 JSON（:91-155）含 `comparison_summary/winner_strengths/loser_weaknesses/instruction_following/improvement_suggestions/transcript_insights`，建议按类别（:166-178）与优先级（:179-186）组织；②**Benchmark 结果分析**（:187-274）——「surface patterns and anomalies」：逐断言模式（永远通过的非区分性断言）、跨 eval 模式（高方差疑 flaky）、指标模式（时间/token 权衡），输出 notes JSON 字符串数组（:249-261）。
- 消费（谁加载→何时生效→行为约束）：`skill-creator/SKILL.md:239`（benchmark 分析步「See `agents/analyzer.md`（the "Analyzing Benchmark Results" section）for what to look for」）与 `:332`（盲对比「Read `agents/comparator.md` and `agents/analyzer.md` for the details」）；由 agent 按 SKILL.md:466-470 读取后 spawn 子代理执行；生效于盲评出结果后/多轮 benchmark 聚合后；行为约束=按上述 8 步产出结构化 JSON、建议须带类别+优先级+expected_impact（schemas.md:384 analysis.json 契约，实测两处字段一致）。
- 来源与 hash：项目自撰子代理指令，`change=unchanged_since_093f`；sourceBlob `14e41d6068635f4dd3fb878fd1626312395dda63`；sourceSha256 `bf68f4cac5a56c673a928c2e6d619586c5b93ea364026ab37547772cb45a663a`；10376 字节 274 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→SKILL.md:239/:332 悬空，盲评只剩 winner 无归因、benchmark 只剩聚合数无异常模式（非区分性断言/flaky eval 不被识别，技能迭代方向失据）；改错→分析结论失真误导技能改进。
- 验证：①`grep -n analyzer.md skill-creator/SKILL.md` 命中 :239/:332（另 :470 列名）；②输出字段与 schemas.md:384 `analysis.json` 逐名比对（已实测一致）；③实跑盲评归因一次（NOT_RUN）。
- 证实/推断/未知：引用链、双角色结构、输出字段对齐 schemas.md=**证实**（实读三文件）；「unblind 防偏」实效=**推断**（流程设计自述，未复跑）；引入 commit=**未知**。

## apps--electron--default-skills--skill-creator--agents--comparator.md

- 职责：Blind Comparator 子代理指令（202 行）——对两个匿名输出（A/B）做**盲评**：7 步流程（读双方输出→理解任务→生成评分 rubric→按 rubric 逐项评→核对期望断言→定 winner→写结果，:20-89），输出 JSON（:91-173）含 `winner("A"|"B"|"TIE")/reasoning/rubric(content/structure/各分与 overall_score 1-10)/output_quality/expectation_results`，字段语义见 §Field Descriptions（:174-193）。
- 消费（谁加载→何时生效→行为约束）：`skill-creator/SKILL.md:332`（「Read `agents/comparator.md` … The basic idea is: give two outputs to an independent agent without telling it which is which」）；agent 读取后 spawn 独立子代理执行；生效于「用户要求严格比较两个技能版本」时；行为约束=硬盲评——:7「you do NOT know which skill produced which. This prevents bias」、:196「**Stay blind**: DO NOT try to infer which skill produced which output」，另 :194-202 Guidelines（具体引用例子、果断定 winner、输出质量优先于断言分、双败取败得少者）。
- 来源与 hash：项目自撰子代理指令，`change=unchanged_since_093f`；sourceBlob `80e00eb45db3ee53a132fc2ba97fd59a7339e563`；sourceSha256 `fe1fc9787c495d864c5d6eada47396478572325fde1b33a96d78bf4b849b7a3e`；7287 字节 202 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→SKILL.md:332 悬空，双版本 A/B 盲评能力失能（无独立判官，比较退回主观自评）；改坏盲评规则（如泄漏哪个是哪个）→偏倚复活、对比结论不可信。
- 验证：①`grep -n comparator.md skill-creator/SKILL.md` 命中 :332（另 :469 列名）；②盲评约束 :7/:196 在文；③实跑一次 A/B 盲评（NOT_RUN）。
- 证实/推断/未知：引用链、盲评规则文本、输出字段=**证实**（实读）；rubric 防偏实效=**推断**；引入 commit=**未知**。

## apps--electron--default-skills--skill-creator--agents--grader.md

- 职责：Grader 子代理指令（223 行）——按期望断言给一次执行「判分+批判断言本身」（:7-8「A passing grade on a weak assertion is worse than useless — it creates false confidence」）：8 步（读 transcript→查输出文件→逐断言 PASS/FAIL 判定并引证→提取并验证隐含主张（factual/process/quality 三类）→读用户笔记→批判 eval 本身→写结果→读 executor metrics/timing，:19-104），判分标准（:85-100：PASS 须「证据反映真实任务完成而非表面合规」；存疑时举证责任在断言方），输出 JSON（:106-185）=`expectations[{text,passed,evidence}]+summary(passed/failed/total/pass_rate)+execution_metrics+timing+claims+user_notes_summary`。
- 消费（谁加载→何时生效→行为约束）：`skill-creator/SKILL.md:230`（「spawn a grader subagent (or grade inline) that reads `agents/grader.md` and evaluates each assertion … The grading.json expectations array must use the fields `text`, `passed`, and `evidence` (not `name`/`met`/`details`…) — the viewer depends on these exact field names」）；生效于每个 run 完成后逐 run 评分；行为约束=字段名精确、证据必引原文、Step 8 读 `{outputs_dir}/metrics.json` 与 `{outputs_dir}/../timing.json` 并入输出、能脚本化的断言用脚本判（SKILL.md:230 末句）。
- 来源与 hash：项目自撰子代理指令，`change=unchanged_since_093f`；sourceBlob `558ab05c0a9a8bb062ef4c51823d4d76c3acf7c4`；sourceSha256 `57134da0c1a4eea33fbd74a1c9c44aa814f07d6bc64de303edb586f941e5d21a`；9049 字节 223 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→SKILL.md:230 悬空，评测循环的评分环节失能（grading.json 无人产出，aggregate_benchmark.py:113-116 读不到 grading.json 直接告警跳过）；改坏字段名→viewer/聚合脚本解析失败（aggregate_benchmark.py:156-160 明校验 text/passed/evidence）。
- 验证：①`grep -n grader.md skill-creator/SKILL.md` 命中 :230（另 :468 列名）；②字段名与 schemas.md:86 `grading.json` 及 aggregate_benchmark.py:156-160 校验一致（实测）；③实跑评分一次（NOT_RUN）。
- 证实/推断/未知：引用链、字段契约及其消费者（SKILL.md:230、aggregate_benchmark.py:156-160）=**证实**（实读）；「弱断言假信心」判分哲学实效=**推断**；引入 commit=**未知**。

## apps--electron--default-skills--skill-creator--references--schemas.md

- 职责：skill-creator 全部评测数据文件的 **JSON 结构契约**（430 行）——8 个 schema：`evals.json`（:7，evals/evals.json，含后续追加的 assertions 字段）、`history.json`（:39）、`grading.json`（:86）、`metrics.json`（:163）、`timing.json`（:197）、`benchmark.json`（:219）、`comparison.json`（:309）、`analysis.json`（:384），各注明存放位置与字段。
- 消费（谁加载→何时生效→行为约束）：①**谁加载**——`SKILL.md:166`（「See `references/schemas.md` for the full schema (including the `assertions` field…)」）、`:236`（「If generating benchmark.json manually, see `references/schemas.md` for the exact schema the viewer expects」），agent 评测流程中按需读；②**何时生效**——写 evals/grading/benchmark/comparison/analysis 数据文件或手写 benchmark.json 时；③**行为约束**——数据字段契约：`eval-viewer/generate_review.py:131`（读 run 目录或上级 `grading.json`）、`:398`（`--benchmark` 传 benchmark.json）、`scripts/aggregate_benchmark.py:113-161`（读 grading.json/timing.json、按 :156-160 校验 expectations 字段名）、`:373-376`（写 benchmark.json）按字段消费，字段名错则 viewer/聚合失败（`eval-viewer/viewer.html` 实测 10 处依赖 evidence/passed 字段）。
- 来源与 hash：项目自撰契约文档，`change=unchanged_since_093f`；sourceBlob `b6eeaa2d4a34c1653069585c6c5603da39a5bdbe`；sourceSha256 `8e8876180a8989b406a4d3edddf875b04cdfd5805cc8616686d552b11ce4455f`；12061 字节 430 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→SKILL.md:166/:236 悬空，agent 手写数据文件无契约可依、viewer/聚合脚本字段漂移风险陡增（benchmark 页/grading 解析坏）；改错 schema→产出数据与 generate_review.py/aggregate_benchmark.py/viewer.html 消费端不匹配，评测报告失真或崩溃。
- 验证：①`grep -n schemas.md skill-creator/SKILL.md` 命中 :166/:236（另 :473 列名）；②8 个 schema 与消费端字段比对（aggregate_benchmark.py:156-160、generate_review.py:131/:398、viewer.html 字段依赖，实测）；③实跑 aggregate_benchmark.py + generate_review.py 全链（NOT_RUN）。
- 证实/推断/未知：8 个 schema 章节、消费端引用与字段校验=**证实**（实读三脚本+viewer.html）；`history.json` 的生产方=**未知**（grep SKILL.md/scripts/eval-viewer 无写入方命中，仅本契约定义；已查范围如上）；引入 commit=**未知**。
