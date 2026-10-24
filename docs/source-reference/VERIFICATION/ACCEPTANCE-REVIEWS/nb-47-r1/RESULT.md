# NB-47-R1 复验报告（QA：docs-r07-qa-nb-47-20261023）

- revisionOf `nb-47`（父批 sealed seal-ab78d9648baba40c，字节未动已核实）；r1 sealId `seal-dfa8d09d170a1e25`（2026-10-23T20:11:17Z）
- **判定：accepted（18 accepted / 0 revision_required）**——F-01+G1 行号+N-01/N-02 全部闭合
- 修订 3 篇/15 篇未变（15 篇与 r0 acceptedHashes 逐字节相同）；NOT_RUN

## 闭合核验（逐字节）

| 项 | 结论 | 证据 |
| --- | --- | --- |
| F-01（blocking）agent-end-reason 虚假一致性 | **CLOSED** | 「注释与代码一致」已改为「注释 9 级漏列 delegation_cancelled，代码 :76-78」；§10 同步 10 出口 |
| G1-LINE-REF-RANGE ask-user 越界引用 | **CLOSED** | `:16-23`→`:16-22`（22 行文件核实） |
| N-01 collaboration-tools 门禁行号 | **CLOSED** | `:2171/:2173`→`:2173/:2175`（sed 逐行核实） |
| N-02 恢复分支不可达 | **CLOSED** | 改述为防御性守卫+照实记录不可达性（:173） |

## 非阻断

- **N-01（note）**：FINDINGS-RESPONSE「before/ 存父批原字节」对 collaboration-tools 不成立（before sha=stage 3f92021e≠父批 efa97edd）；**父批交付本身未动**（r0 stage sha 仍与 r0 acceptedHashes 全等）——快照记账瑕疵，rN 可选补正。

## 绑定

- `REVIEWED-HASHES.json`：18 新 acceptedHashes（3 新字节+15 原字节）+supersededManualHashes（3 篇旧→新）。旧 hash 不适用新字节（合同口径）。
