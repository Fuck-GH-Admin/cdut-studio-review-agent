# STAGE2 issues-p07-p08 对账 SUMMARY

- 轨：p07/p08 模块 + 不可映射记录；生成 2026-10-23T21:47:57Z；源码仅 baseline/source@05fb2565…37c2 只读
- 范围：OPEN-ISSUES 1317 条 → 本轨 588 条（p07/p08 全命中 374 + 不可映射 214），其余 729 条他轨；**零静默丢弃**（588/588 有行）

## 结论分布（RECONCILIATION.json 逐条）
| 状态 | 数量 | 说明 |
| --- | --- | --- |
| 原已关闭保留映射 | 332 | CLOSED_MERGED/CLOSED_SUPERSEDED，不重复派修 |
| 三证关闭（本轨实证） | 11 | fixBatch 封版+独立QA复验+exact hash 合入 candidate（HASH_MATCH） |
| 已复验待 lead 合入 | 3 | nb-115-r1/nb-121-r1 修复已被独立QA接受，candidate 仍为修复前字节——非作者缺陷 |
| 审计待核（schema 缺字段） | 116 | file/claim/sourceFact 缺失——非作者缺陷 |
| 证据不足 UNVERIFIED | 122 | 已写明逐条查过什么；不发作者垃圾任务 |
| 产品待决 | 2 | X-FILE-A/B 保留给阶段三设计差异报告 |
| 重复映射 | 2 | 同根因多版→唯一当前问题 |

## 本轨实证抽查
- ONB-N-01/02：当前 candidate 索引文档误引仍存在=True（grep 消费行仍在=True）；cslab-demo.ts 实测常量=['DEMO_LAB_NAME', 'DEMO_DATA_FILES', 'DEMO_FIGURE_FILES', 'DEMO_FILES', 'DEMO_DATA_SET']
- nb-131-r1 的 migration-service N-06/N-07 修复 exact hash 已合入 candidate（三证闭合）；nb-115-r1 goal-atoms（4fe29a95…）与 nb-121-r1 ofv-extensions/navigation-controller 修复版未合入

## 缺口（不虚报完整）
1. 118 条无 fixBatch 记录未完成 claim 级当前手册比对（逐条列于 RECONCILIATION）
2. ONB 源 LICENSE 行号逐行核对、IDX-G08 索引文档常量名最终比对未完成
3. 时间窗 30 分钟到期收口；上述缺口下窗续，不冒充 DONE 完整
