# TO-AUTHORS（issues-p01-p03 定向修复清单，2026-10-23T21:57Z）

说明：以下为**同 hash 未改/本轮实证坐实**的文档错误（唯一当前问题，历史映射见 RECONCILIATION.json）。全部按当前 manual hash 修复后另开 rN 封版（revisionOf 规则照旧）；**不要动** PENDING 待验清单（未证已错）。实现缺陷（DOCUMENTED_IMPLEMENTATION_GAP）留给阶段三，不做产品修复。

## docs-r07-author-nb-07-20261023（6 条，计数/启发式计数）

- N-NB69-01 `cdut-demo/demo-service.test`：「2 describe、6 test」→ 7 test（:97 成绩域与 :106 写操作是两个 test）。
- N-NB69-02 `cdut-jw-client.ts` §3：「写操作成败启发式…6 处」→ 10 处精确 + 1 变体（:2660 附加「不符合」）。
- N-NB76-01 `cslab-uv.ts`：「12 导出」→ 14（表内 14 符号）。
- N-NB76-02 `cslab-vault-cache.ts`：「14 导出」→ 16（表内 16 符号）。
- N-NB76-03 `cslab-uv.test.ts`+`cslab-uv.ts.md` §9：「8 test/8 用例」→ 9（2+3+4，grep test(=9）。

## docs-r07-author-extra-03-20261024（5 条，引用/计数）

- NB137-N-02 `memory-archive-backup.mjs` §6：引用 :178——74 行文件不存在 :178，疑串稿残留，改正确行或删。
- NB137-N-01 `sign-update-metadata.cjs` §4：verify-update-metadata.cjs:29-31 行为描述与实际 verifier.verify 语义不符，按源码改。
- NB142-F-01 `electron-builder.yml`：顶层键计数 17→19（以当前文件重数）。
- NB142-N-01 `test/cdut-jw-parsers.test.ts`：红线断言行号 :451→:446。
- N-01 `agent-collaboration-tools` §4：门禁引用行号偏 2（collaborationAvailable 实为 pi-builtin-tools.ts:2173，isGroup…同步核）。

## docs-r07-author-nb-06-20261023（5 条，计数）

- NB55-N1 `pi-review-ops-tools` §10：「3 导出+3 内部」→ 4 内部。
- NB55-N3 `pi-skill-resources…` §10：「3 导出+7 内部」→ 8 内部。
- NB60-N3 `skill-routing-eval.test` §2：「30 个 test()」→ 29（参数化 28+1）。
- NB60-N6 `title-generation.test`：交付字节含标签剥离残片 2 处（§1「` 退化）」、§3「` 包裹剥离」），按 NB43-N1 同法清理。
- NB82-N6 `skin-manager-service.test` §2/§5：「8 个 test()」→ 10（6+4），§6「8 中 7」口径同步。

## docs-r07-author-extra-02-20261024（2 条，用例计数）

- F-05 `agent-goal-runtime-bridge.test` §2：「双 runtime×4=8+3」→ 循环实为 `['pi'] as const` 单 runtime，按实数改。
- F-04 `agent-retry-utils.test` §2/§5：「24 用例」→ 39 实例（34 test() + test.each 5 行 :228-234）。

## docs-r07-author-ui-20261023（1 条，本轮实证）

- N-01 `docx/scripts/comment.py`（行号漂移）：TEMPLATE_DIR :22→**:25**；shutil.copy(comments.xml) :235→**:236**（QA grep -n 实测）。

## docs-r07-author-nb-03-20261023（1 条）

- NB70-COUNT-01 `yanhu-dom-distill.test`：逐 describe 表改精确计数（24 行全列，消除 ~N 估计；合计 79 不变）。

## index 系（index-p01/index-p02 家族，共 10 条；owner=INDEX 批，交 lead 归口 index 作者）

- IDX-G01-F-01 `LICENSE`（blocking）：「随仓库初始提交引入」不实——首添加于 `6382c6a2`≠初始 `019f64e8`（QA git log 实证）。
- IDX-G08-F-01（7 条副本/6 文件家族）`cslab/__pycache__`+demo：来源行「change=unchanged_since_093f」不实（FILES.tsv 实为 r03_pr44；QA 核 1 行代表）。
- IDX-G03-N-01 `.cursor/rules/science-ui.mdc` §1：「严格遵从 AGENTS.md」登记目标状态。
- IDX-G21-N-01 `work/reports/assets/…03-submit-conflict.png`：index.md 行号 12/12/13/13、00-overview.md:27 校准。
- N-04 `docx/scripts/templates/`：负向证据口径（「除 base.py:52 外零命中」）按 grep 实测收窄。
- N-01 `pptx/scripts/chartlib.md`：§三 :61-79、§四 :81-96 行号漂移修正。

## 不要动（待验/非文档错）

- PENDING_REVERIFICATION_MANUAL_CHANGED 139（含 vendor-xsd 家族 135）、PENDING_VERIFICATION_AUTHOR_CLAIMED 27、TEST_CLAIM 6——未证已错，勿顺手改。
- DOCUMENTED_IMPLEMENTATION_GAP 1（agent-collaboration-utils 恢复 running 派生不可达分支）：手册表述准确，产品待决（阶段三设计差异），当前不改产品。
- UNVERIFIED_TIMESTAMP_METADATA 1、INFO_HASH_EQUAL_RECORD 20、DEDUP 7、CLOSED 184：无手册动作。
