---
path: apps/electron/src/main/lib/cslab/cslab-hpc.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6c8d05ea308d7741e383e821570b9772047b1d97
sha256: d01bec5d3e74fd01d018c9ab6847511f4b65c3aeb26aeb9e90f56a91267cd66a
lines: 266
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-hpc.test.ts

## 1. 测试目标

CSLab 超算网关测试（`apps/electron/src/main/lib/cslab/cslab-hpc.test.ts:1-6`）：统一计算契约转译、调度器状态归一化、JSON 解析、作业上下文持久化与**「重启后重水合仍可读」**、远程 JobID 白名单。被测 `cslab-hpc`/`cslab-hpc-db`。夹具：tmpdir+`PROFER_CONFIG_DIR` 环境注入+createLab（`:18-25`）；afterAll 全量回收（stopAllHpcBridges/closeAll*，`:27-39`）。**无网络 mock 边界**（不触发真实 SSH）。

## 2. 用例清单

共 **14 个 `test(`**（5 个 `describe`）：

### 统一计算契约转译（4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 40-57 | Slurm SBATCH+确定性 UUID 名 | jobName `cslab-550e8400`、7 行 SBATCH 指令、shellQuote cd、命令透传 |
| 2 | 59-71 | PBS select/walltime | `select=2:ncpus=16:ngpus=2:mem=128gb`、walltime 48:00:00 |
| 3 | 73-87 | LSF 总核数/span/GPU 独占 | `-n 32`、`span[ptile=16]`、`-W 48:00`、gpu exclusive_process |
| 4 | 89-105 | 队列/GPU 型号拒绝注入 | 换行/`rm -rf`/`$(whoami)` 三 toThrow（'队列分区名'/'GPU 型号'） |

### 调度器状态归一化（1）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 5 | 107-122 | 三调度器常见状态 | 14 断言（含 `CANCELLED by 1001`→CANCELLED、'???'→UNKNOWN） |

### 调度器 JSON 解析（4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 6 | 140-151 | sacct --json | toEqual `{jobId:'998244', rawState:'COMPLETED'}` |
| 7 | 153-163 | qstat -Fjson | '998.aurora'→'998'（去域名后缀） |
| 8 | 165-175 | bjobs -json | toEqual |
| 9 | 177-187 | Slurm 纯文本兜底+空输入 | 两行文本解析、空串 []、'not-json' [] |

### 作业上下文持久化与重水合基础（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 10 | 191-216 | 提交前落盘、关库后仍可读（模拟重启） | closeAll 后 jobs 仍 1、state PENDING、按 remoteId 找回 key |
| 11 | 218-243 | 终态作业不再进重水合候选 | active 不含 job-test-2、含 job-test-1 |
| 12 | 245-248 | 未知 MFA 返回 false 不抛 | toBe(false) |

### 远程 JobID 白名单（2）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 13 | 250-256 | 合法 JobID 原样通过 | 4 形态 toBe |
| 14 | 258-266 | 命令注入/非法字符阻断 | 7 恶意值全 toThrow('远程 JobID 格式非法') |

## 3. 真实断言

逐条见 §2（关键锚）：`:47-56` 10 断言；`:65-70`；`:79-86`；`:93-104` 三 toThrow；`:110-121` 14 断言；`:147,160,172,182-186`；`:206-215`（重启模拟）；`:238-241`；`:247`；`:252-255`；`:261-265` 七连 toThrow。

## 4. 未覆盖与脆弱点

- 真实 SSH/MFA/双跳/轮询/回传不测（无网络约束）；`harvestHpcJob`/`rehydrateHpcJobs` 真实调度器路径未测（仅 DB 层基础）。
- 用例 10 的「重启」= close+reopen 同库（无进程级重启）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 test/5 describe、tmpdir+env 夹具 | 已证实 | 全文 |
| 三调度器模板+注入防护 | 已证实 | `:40-105` |
| 重启可读（DB 层） | 已证实 | `:191-216` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| synthesizeBatchScript 三模板+校验 | §2 | 1-4 | covered |
| normalizeSchedulerState | §2 | 5 | covered |
| parseSchedulerJson | §2 | 6-9 | covered |
| 持久化/重水合基础/MFA miss | §2 | 10-12 | covered |
| assertSafeRemoteJobId | §2 | 13-14 | covered |
| 网络路径 | §4 | — | unknown（NOT_RUN 约束） |
