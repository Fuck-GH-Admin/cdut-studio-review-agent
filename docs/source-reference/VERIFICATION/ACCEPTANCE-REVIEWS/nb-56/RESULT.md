# NB-56 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05）

**对象**：p02.pi-harness 18 文件/1860 行 + 18 手册/1158 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-92a1a77c3461bef5`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18 accepted / 0 revision_required / 0 unknown）**，3 条 minor 备注（N-01~N-03）不阻断。18 篇全部可按 exact hash 合入。

## 核验摘要

- **G0**：链一致、ZIP 21 条目 0 mismatch、18/18 源绑定独立实算、非返修批。
- **G2（全文件）**：18 源（bridge 491/reducer 164/focus-packet 125/store 108/…）+8 测试（643 行）+18 手册逐行；机械核 test( 39（replay 2 静态含 for 循环 6 fixture=运行 7——手册精确区分）。
- **准确面**：特性门默认开+trim 语义、intake 四类保守判定+行级 marker、governor 四级"只记不跑"+失败无 mutation 阻断、reducer 11 类事件、store fork settled-only+ID 全重映射、focus 包双限+脱敏、bridge 一次性票据三拒/消耗前重校验/modelCalls 防双计/Turn settle≠Goal settle/setup 失败兜底、evals 12 指标；域外边界（telemetry/tool-facts/verification-evaluator/fixtures）全部如实。

## Findings（均 minor）

| id | 文件 | 摘要 |
| --- | --- | --- |
| N-01 | governor.ts.md | `blockedReason` 死枚举 'repeat_failed_verification'（代码从未产出）未照实 |
| N-02 | graph-focus-packet.ts.md | §11 "4 导出+4 内部"→实 5 导出+5 内部（estimateTokens 未单列） |
| N-03 | orchestrator-bridge.ts.md | §11 "7 导出"→实 8（两测试访问器合并致漏 1） |

## 合入（18 篇 accepted）

| manual（…/pi-harness/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/main/lib/pi-harness/evals/replay.test.ts.md` | `4557b5585c05ef18466808e94df55cd7ed9cdc073db7ddba5f5b924649f68b87` |
| `apps/electron/src/main/lib/pi-harness/evals/replay.ts.md` | `24888c0509521b6b7cc055aacfcb8381ad8a290a54365718bc0437b9c1557eae` |
| `apps/electron/src/main/lib/pi-harness/evals/types.ts.md` | `e350dc5cfde67cef5ec7d19848e44ecb689d49c59c8e91f300b631443c306235` |
| `apps/electron/src/main/lib/pi-harness/feature-gate.test.ts.md` | `3eb5a230f9583636f234235f38c49fe3522e26c4bc0b40321f0a26517ca8cfc0` |
| `apps/electron/src/main/lib/pi-harness/feature-gate.ts.md` | `d8939c111b6234acbafac5744c7743c479db93d54fc7bfafc1460885b9e2d1ab` |
| `apps/electron/src/main/lib/pi-harness/goal-controller.test.ts.md` | `9fd6b71552c5b979fa09fdd01614c2737a35a01671544c91bc74c64f0d47cc27` |
| `apps/electron/src/main/lib/pi-harness/goal-controller.ts.md` | `c300cbf56847bb0df8d71d919c7f9895e3d41ee5ed5f6fcf83fd56abd794659f` |
| `apps/electron/src/main/lib/pi-harness/governor.test.ts.md` | `25213a85c47e173da989c33dc7fdf08c377c2ae4b53e070c78384aaad2b5db37` |
| `apps/electron/src/main/lib/pi-harness/governor.ts.md` | `673f8490dfac45c0897b9f2665457017453eed725a64899acc56eef59271036f` |
| `apps/electron/src/main/lib/pi-harness/graph-focus-packet.test.ts.md` | `fe10a4316fa3e793da967c790fc935a75d6e5ee6b5d9f358ef3f6f55c504879c` |
| `apps/electron/src/main/lib/pi-harness/graph-focus-packet.ts.md` | `a36b758b28c39a203f02ef0397201d3fde94b108891efc893bda01b22f6f9823` |
| `apps/electron/src/main/lib/pi-harness/orchestrator-bridge.test.ts.md` | `ee85b739f9ae8127b358ad977350962fbecc845ace669b4c8c5fecca081a641c` |
| `apps/electron/src/main/lib/pi-harness/orchestrator-bridge.ts.md` | `ae621245de5dfc2cd0c7d47b6ab4ce108ef84c6e5dbe20308087b9b0b9ab7ba0` |
| `apps/electron/src/main/lib/pi-harness/pi-harness-reducer.ts.md` | `f963113ba7777c3cbdbd09e38b8eaf65a11d43d39cdc7282bd689fb7dd6e149c` |
| `apps/electron/src/main/lib/pi-harness/pi-harness-store.test.ts.md` | `4590a87c4da5a90cd916df902a2e5fe5110c39faaf4525263bb7238dc2f0a5d9` |
| `apps/electron/src/main/lib/pi-harness/pi-harness-store.ts.md` | `a83c042076cbf0e4ca547d0eaa0cccce336817aa4dff6a77c3feb57e6a136bf4` |
| `apps/electron/src/main/lib/pi-harness/reconciler.ts.md` | `4208562a38cc21a205ba15e331f341aeee98db24ff3211a6d4e7bd349f62cde6` |
| `apps/electron/src/main/lib/pi-harness/session-telemetry.test.ts.md` | `0239a4e92760aae6d8bd6336de290a01a30eeef72059b988db4048834be3816e` |

NOT_RUN 全部（含 bun 运行）；未改源码/作者正文/candidate/全局账。
