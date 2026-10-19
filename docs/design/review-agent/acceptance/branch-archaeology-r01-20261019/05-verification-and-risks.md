# 05 验证情况、风险与阻断
基于 2026-10-19 调查窗口远端 REST、PR 文件全分页、GitHub 比较和 git/tree 对照；本环境容器无法解析 github.com，未能本机 clone，亦未能运行任何源码测试。

## 可独立复核的事实
- 190 个原始远端 branch 条目和 128 个 PR 条目已分别跨两个分页抓取，完整 SHA 见 01/02；open 115 / closed 13 / merged 11 / closed-unmerged 2。**closed != merged**：#19、#20 是关闭但未合并的典型。
- GitHub Compare 返回大差异时 `files` 常为 300 条上限；例如 #97 实际 PR changed-filenames **575** 条（已全分页获取），不可依赖 compare 的前 300 条推断完整实现。
- **固定 HEAD 上的 GitHub workflow 观察**：D4 COMMON `a7a6a11d...` 的 7 项列举工作流为 success；P06 R02 `c2378988...` 的 4 项为 success；P06 R03 `db028487...` 的 4 项为 success；D4 W1 `c2f965d2...` 取证时 7 项中 5 项 success、2 项 in_progress（PR CI、D4 unified）；**属于 CI 观察而非完成验收结论**。main 的 PR-triggered workflow 此次查询返回 0，不表示 main 无 CI。
- 当前 compare：D4 W1 与 main diverged (333/170)，P06 R03 ahead main 113。R03 与 R02 diverged (5/4)，已核对两份完整非截断 git tree：R02 4189 blobs，R03 4185 blobs，其中删除两份 `batch-run-provenance*`、三份 R02 文档，新增一份 R03 文档。
- D4 W1 的 `review-d4-case-batch.ts` 调用 `case-store` 和 `case-import`，P06 R03 的 `batch-automation-service.ts` 调用 `case-store-v2`、`batch-store`、`run-store-v2`。这是**代码入口和存储边界不同**的已读源码证据；是否应在统一 V3 模型中收敛属第二轮架构结论。

## 分层状态（严禁互相代替）
| 级别 | 本轮是否证实 | 说明 |
|---|---|---|
| HEAD 与 PR 元数据 | YES，全量 | GitHub 2 页 branches、2 页 pulls |
| 关键 git ancestry / merge-base | PARTIAL | 07 索引收录已验证若干对；全体逐支 UNKNOWN |
| 关键 tree/blob & PR 变更文件 | PARTIAL | 主要 #1/#21/#88/#97/#100/#120/#124/#126/#129/#131/#132 抽样 |
| GitHub CI 工作流状态 | PARTIAL | 固定 SHA 的记录性查询，不保证后来状态 |
| 实际本机 `git merge-base`, `git cherry`, patch-id | NOT_RUN | 工作容器无 github.com DNS，缺完整可 clone 的仓库 |
| 单元、集成、Electron GUI 重跑 | NOT_RUN | 本轮只读工程历史调查 |
| Provider 真调用、权限实机验证 | NOT_RUN | 历史 PR 的测试声明不能充作本轮实测 |
| 学校流程/材料业务确认 | NOT_RUN | 技术模板通过不等于校内审核流程批准 |
| 原始材料 / ACL / Gold 隔离复验 | NOT_RUN | 不读取、传播私有材料 |

## 下一轮必须防止的误判
1. 以 PR 编号/创建时间/分支名判定继承：P06 #131→#132 **明确分叉**。
2. 以“合入领域集成 #97”断言 G01–G08 所有提交都已携带：八支都非 #97 提交祖先。
3. 以 D4 W1 存在的 `D4CaseBatch` 等同 P06 的 `BatchStateV2`；二者执行入口不同。
4. 以“独立 provenance 文件在 R03 消失”断言验证消失；R03 已有内联 Run/模板锁核验，需构造真实差分回归。
5. 以旧 D3 MD、D4 COMMON、R1 合成测试通过断言 Provider/GUI/业务已验收。
6. `EVIDENCE_ONLY` 是初筛类目；报告正文已承认部分审计分支含实际补丁，后续不得单纯按名称剔除。
