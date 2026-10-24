# NB-41 独立验收报告（G0/G1/G2）

- 批：nb-41（18 文件/3774 行，p07-shared-libs · p07.other-packages）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-41/` 封版字节（sealId `seal-e458e44fda060ceb`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：revision_required** —— 10 accepted / 8 revision_required / 0 unknown。
- 测试/构建/真实模型：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链 MANIFEST→READY→DONE→ZIP 实算一致；ZIP 21 条目无穿越/绝对路径/符号链接/外批、无 READY/DONE、逐条目==盘上；源绑定 18/18 ==SCOPE==MANIFEST；manualSha256 18/18 无 drift；changes.diff 重放一致；SOURCE-EVIDENCE/COVERAGE 人工列 18/18 非空；元数据 18/18。

## G1 格式：PASS
带名行号引用 39/39 在范围；章节数 11×11+2×7+2×6+1×8；18/18 三分法 + NOT_RUN。

## G2 源码真实性：PARTIAL（10 accepted / 8 revision_required）
18 源文件逐行深读（事实库 `reviews/nb-41/SOURCE-CHECKLIST.md`）+ 18 手册逐篇对照。评测程序的诚实口径体系（合成语料标注/不编造 QA 准确率/Null 拒答代理口径/金标解析审计）与指标公式被作者如实转写；但发现**两组系统性虚构**与若干符号/计数错误。

### 退回（revision_required，8 篇）

| 文件 | findings |
| --- | --- |
| `benchmark-multihop/src/server.ts.md` | **F-NB41-01（major）**：路由表虚构——`GET /api/report`、`GET /api/report/export` 不存在；`/api/dataset/download` 实为 `/api/datasets/download` 且无 SSE；`/api/run` 是 SSE 流（报告经 done 帧下发），"内存保存报告"不成立；导出实为 `POST /api/export`（body {report,format}）。 |
| `benchmark-multihop/public/index.html.md` | **F-NB41-02（major）**：前端数据流虚构——实际 `fetch('/api/run')`+ReadableStream 手工解析 SSE 帧（无 EventSource）、`POST /api/datasets/download` JSON、`POST /api/export` blob；函数实名 `renderReport`/`renderDetail`（手册写 renderMetrics/renderBars）。 |
| `project-core/package.json.md` | **F-NB41-03（major）**："@profer/project-core 零代码引用"不成立——实测 10+ 消费者（ipc.ts:4417、pi-harness×7、project-graph-service.ts、graph-atoms.ts）。 |
| `project-core/src/graph-query.ts.md` | **F-NB41-03（major）** 同上 + **F-NB41-04（minor）** `formatNodeDetail` 应为 `formatTaskContext:604`。 |
| `benchmark-multihop/src/dataset.ts.md` | **F-NB41-05（minor）**：`EMBEDDED_QUERIES` 为虚构导出（实为未导出的 `RAW_QUERIES:191`）；导出实为 3 个非 4。 |
| `project-core/src/graph-parser.ts.md` | **F-NB41-04（minor）**：同 formatNodeDetail 误名。 |
| `benchmark-multihop/src/dataset-loader.ts.md` | **F-NB41-06（minor）**：路由引用 `/api/dataset/download` → 应为 `/api/datasets/download`。 |
| `benchmark-multihop/src/report.ts.md` | **F-NB41-06（minor）**：路由引用 `/api/report/export` → 应为 `POST /api/export`。 |

### accepted（10，非阻断计数备注 5）
`agent-fabric/src/task.ts.md`（F-NB41-07：13→16 导出）、`benchmark-multihop/src/metrics.ts.md`（F-NB41-08：10→11、22→26 用例）、`runner.ts.md`（F-NB41-09：7→9）、`types.ts.md`（F-NB41-10：13→9）、`metrics.test.ts.md`（F-NB41-11：22→26，自身枚举已相加 26 自相矛盾）；`evaluator.ts.md`、`dataset.test.ts.md`、`benchmark-multihop/package.json.md`、两篇 `tsconfig.json.md`（含同 blob 机器核对，属实）无错误。计数备注均为汇总数字笔误、逐项清单正确，随 r1 顺带关闭。

### 处置
10 篇 accepted 按 `reviews/nb-41/REVIEWED-HASHES.json` exact manualSha256 合入；8 篇退回开 nb-41-r1（逐条修订见 TO-AUTHOR）。证据：`reviews/nb-41/{RESULT.json,REVIEWED-HASHES.json,DONE.json,SOURCE-CHECKLIST.md}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
