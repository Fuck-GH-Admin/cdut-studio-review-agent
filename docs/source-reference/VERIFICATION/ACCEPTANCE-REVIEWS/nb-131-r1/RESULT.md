# nb-131-r1 独立复验报告（QA：docs-r07-qa-extra-06-20261024）

- 批：nb-131-r1（revisionOf nb-131）；sealId `seal-406f5f412ccc3281`；复核时间 2026-10-23T20:17:10Z
- **batchVerdict：accepted（18/18）**——F-01 关闭、7 minor 全部关闭、无新增问题

## G0 — PASS
- 哈希链自洽（MANIFEST/READY/ZIP），sealId 独立复算 `seal-406f5f412ccc3281` 一致；revisionOf=nb-131。
- 返修范围纪律：变更恰好 6 篇（F-01 所在 pi-additional-directories-prompt + errata 所在 main-window-state/mac-traffic-light/node-detector/pi-background-task-manager/migration-service）；其余 12 篇与 r0 逐字节一致（12/12 比对），按 r0 accepted 沿用。
- ZIP 22 条目无 READY/DONE/reviews；6 篇变更 front matter/章节/NOT_RUN 全合规。

## G1 — PASS
- FINDINGS-RESPONSE.md 8 条逐条"属实→修复"，before 哈希与 reviews/nb-131/REVIEWED-HASHES 全等；12 篇未改清单与实际字节差一致。

## G2 — 修复回源验证（6/6 通过）
| 项 | 验证结果 |
| --- | --- |
| NB131-F-01 | §4 三元条件已改 `isStudyClass ? '' : buildPi…`（含 :2040 projectCandidates 置空、:15 函数内短路归位）——与 agent-orchestrator.ts:2040-2043 一致 |
| N-01/N-02 | main-window-state 计数统一：8 个测试文件、22 个 import 方（21 静态+1 动态） |
| N-03 | mac-traffic-light 补列 :491/:521/menu.ts:239 常量消费点（§4/§8 同步） |
| N-04 | node-detector win32 9 项（注册表 1+scoop 3+LOCALAPPDATA 2+choco 1+官方 2）与源分解一致 |
| N-05 | pi-background-task-manager "5 处 throw/4 种文案" |
| N-06 | migration-service 内部关键函数 43 |
| N-07 | toolCredentials 措辞精确（本地经 {...current} 保留、导入值不落入） |

## 边界
NOT_RUN=产品测试/typecheck/build/GUI/真实进程网络；未改源码/测试/依赖/作者正文/candidate/全局总账；未 commit/push。
