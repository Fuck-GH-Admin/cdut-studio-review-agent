# NB-68 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 10 文件/1768 行（p02-agent-runtime · p02.residual）
- 交付：`deliveries/nb-68/`（seal_delivery.py/1 v2，sealId `seal-001317b884d36028`）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-68/SOURCE-CHECKLIST.md`（10 文件全读）；本轮 10 篇手册全文比对
- **批次判定：revision_required（9 accepted / 1 revision_required / 0 unknown）**——9 篇按 exact hash 合入；1 篇退回 `nb-68-r1`
- 测试/脚本执行/typecheck/build **NOT_RUN**

## G0 完整性（PASS）

10/10 源绑定 == MANIFEST == SCOPE 独立重算全等（行数 splitlines 口径；`quick_validate.py` 无尾换行，103=SCOPE，blob/sha 全等）；10/10 `manualSha256` == stage；DONE 三哈希链自洽；ZIP `R07-nb-68-05fb2565.zip` 13 条目（不含 READY/DONE 属 v2）无穿越/0 mismatch；人工列 10/10。

## G1 结构（PASS）

10 篇章节齐全；7 用例一致；三分+NOT_RUN 10/10。

## G2 源码真实性（9 PASS / 1 返修）

**正面确认**：heatmap 缓存非权威三态（全量/补算/当天实时合并）+四类 token 口径（input+cache_read+cache_creation+output）+`mergeDaily` 覆盖防 retry 双计；watcher 高噪音 11 目录过滤/仅顶层 config.json 精确忽略/error 自愈 5s（EventEmitter 无监听崩主进程注释）/附加目录 error 移除不重启；mcp-config 一行再导出诚实标「不适用」；脚本链全对（quick_validate 6 键白名单+kebab-case ≤64、package_skill 根级 evals 排除、utils YAML 多行、improve 1024 兜底重写+CLAUDECODE 剔除、run_eval 流事件触发探测+kill 子进程清理、run_loop 分层 seed=42）。

**返修 1 篇**：

| id | 对象 | 摘要 |
| --- | --- | --- |
| F-01 | workspace-heatmap-service.ts.md | 「导出 7 条」实 **8**（自列 8 个 export 位置） |

非阻断：M-01 契约逐点吻合；M-02 行数口径提示（quick_validate 无尾换行）+诚实降级（run_eval/run_loop「导出段+docstring 级」）。

## 合入绑定

- **acceptedHashes（9）**：heatmap.test / watcher / mcp-config / 六脚本手册。
- **rejectedHashes（1）**：heatmap-service.ts.md（F-01）；`nb-68-r1` 修订后按新 hash 复验。
- 未写 deliveries/inventory/manager/candidate/全局账；预读产物原样保留。
