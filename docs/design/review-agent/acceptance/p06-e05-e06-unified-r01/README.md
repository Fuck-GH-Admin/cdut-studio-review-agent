# P06 L02-01 E05 + P06 E06｜集中验收工作包 r01

此目录是**操作/证据合同**，不是已经执行的实机结果；执行者须把真实采集产物存到新建的同名现场归档中，不得把模板当现场证据上传。

## 文档读取顺序（不可跳过）

1. [87 号总体方案](../../87-p06-e05-e06-unified-acceptance-campaign-20261019.md) + [29 号唯一 LIVE 台账](../../29-background-session-preflight-audit.md)。
2. [验收矩阵](acceptance-matrix.md)：每项实际通过/拒止/环境阻断的判定条件。
3. [执行手册](local-runbook.md)：固定 SHA、隔离数据、已有脚本、CDP/Provider/真故障、安全退出。
4. [证据合同](evidence-contract.md)：每笔原始退出码、时序、hash、source/业务映射和公开脱敏。
5. [本地 Agent 提示词](local-agent-prompt.md)：按既定顺序做真实执行、归档并提交独立 Draft 证据 PR，不替换父版。
6. 历史入口：L02-01 [85 号](../../85-p06-l02-01-offline-gap-closure-20261019.md) + [E05 矩阵](../p06-l02-01-offline-r02/e05-unified-acceptance-matrix.md)；普通 Agent [86 号](../../86-p06-e06-ordinary-agent-entry-20261019.md) + [既有 E06 现场手册](../p06-e06-ordinary-agent-r01/local-agent-task.md)；E06 历史只读 [46 号](../../46-p06-recheck-live-local-acceptance-20261014.md)。

## 固定输入、不可更改的边界

- 冻结 U1：PR #118 / `3baf1fc2ccf27607f948923dbf5aff26d984729e`。
- E05 代码父：PR #121 / `4f8a68e26e5276e61883fa53c21447a703bbf94d`。
- E06 QA 工作 PR #127：**现场须以 PR #127 最新可复核 CI 成功提交作为唯一候选**，固定 commit+tree，测试到交卷不得随分支变更。
- 当前提交文档本身不改变 LIVE。禁止改 29 台账、冻结 Gold、历史 RED、上游安全基线，禁止合并 PR 或对现有用户真实案卷运行。

## 最小交付集（不能空白填“通过”）

| 产物 | 内容 | 来源 |
| --- | --- | --- |
| `candidate-lock.json` | HEAD/tree、PR 父关系、构建 hash、OS、配置别名、工作树状态 | 真实版本/本机 |
| `preflight.json` | 隔离 profile、授权 Pi、CDP/Main PID、端口目标、是否许可故障测试 | 真实本机 |
| `command-ledger.json` | 每条命令 argv、时间、退出码、日志 path、文件 digest（无密钥） | 真实执行 |
| `e05-case-ledger.json` | A/B/C 的 Run、SourceRef、人工动作/补件/多批、batch/outbox 的前后像与 verdict | 真实业务 |
| `e06-matrix.json` | 普通 Pi 四条实际运行的自证子矩阵，不能独立升格 FULL PASS | 现有 E06 驱动 |
| `scenario-matrix.json` | E05/E06/独立外部 lane 每条 PASS/FAIL/BLOCKED/NOT-RUN | 手册现场对表 |
| `first-failures.json` | 首次真实失败不可覆盖，后续修复挂新的 evidence ID | 真实失败 |
| `sha256-public.txt` / `sha256-private.txt` | 脱敏公开文件及不上传的原始现场文件分别计算散列 | 归档 |
| `acceptance-verdict.md` | 两套独立阶段结论、剩余阻断、建议后续批次、29 LIVE 差分建议（未修改权威账本） | 人工复核 |

缺少某项资料时应在 `scenario-matrix.json` 明确写 `NOT-RUN` 或 `BLOCKED_*` 及原因，**不能创作不存在的日志、截图或哈希**。

现场问题处理：不允许为了制造 PASS 降低 SourceRef/阅读证明、批准角色、Owner tombstone、跨案隔离或历史不可变性；有真实缺陷按 [证据合同](evidence-contract.md) 归档 RED，然后**独立分支**修复并单独回归。
