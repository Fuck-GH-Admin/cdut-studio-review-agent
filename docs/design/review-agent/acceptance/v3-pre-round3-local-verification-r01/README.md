# Review V3｜第三轮前本地定向核验 R01

本报告按任务包固定生产 SHA 对 #138 的高风险静态判断补充本地可执行证据。用途是第三轮离线架构讨论，不是公开漏洞报告、产品发布结论或 A/B/C 选型。

## 结论摘要

- **P06 R03 归档来源**：REPRODUCED_FAIL。旧 Observation 保持 confirmed，test-only state setup 后调用正式决定函数的受控探针返回归档 V1 来源的分值 4；普通 UI 到该状态的路径未证。D4 对照会撤销当前确认并保留历史。
- **P06 R03 Actor**：REPRODUCED_FAIL。四个 Main 写入口把合成伪造 school/teacher actor 写进 Receipt；appeal 以 local reviewer 被正确拒止但可信 teacher 通路未证。
- **P06 R03 Batch**：REPRODUCED_FAIL。Main finalize 和低层 finalizer 对 Run mismatch/缺失仍最终化；所测正常自动路径精确使用 entry Run，R02 的错配保护用例通过。
- **Office / Plan / 回归**：合成真实 DOCX/XLSX ingestion PASS_SCOPED；D4 多条件 target prompt 合同通过，P06 schema 对照为 partial/blocked；所选基线共 239 tests 全绿。
- **Git**：四组 lineage/function diff 完整保存；#95/#89/#96/#93/#91/#92/#90/#94 到 #97 的 path/blob 检查未发现原路径完全丢失，#91 有 14 个同路径 blob/mode 差异。语义迁移并未因此全部签字。

## 文件

- 01-environment-and-fixed-snapshots.md：执行环境、固定 SHA、worktree 与边界。
- 02-git-lineage-and-asset-delta.md：branch lineage、完整 function-context diff 索引、R02/R03 helper 与 #97 资产比较。
- 02-git-lineage-and-asset-delta/：原始 lineage JSON、完整 patch、每个 PR 的路径/提交输出。
- 03-high-risk-reproduction.md：L1 高风险正反例、实际持久状态、可达性范围、首败记录。
- 03-high-risk-reproduction-evidence/：经过筛选的 synthetic-only 证据 JSON。
- 04-plan-prompt-and-contract-diff.md：D2/Prompt 与 IPC/Preload/Renderer DTO 差异。
- 05-test-results.csv：精确命令、快照 SHA、退出码、状态、证据路径。
- 06-v3-decision-impact.md：对 #138 Q01–Q15 的逐题状态与裁决边界。
- 07-third-round-agent-handoff.md：第三轮要带入的事实和门禁顺序。
- 08-test-only-harness-index.md：隔离 harness 的路径、SHA 和复现方式索引。
- private-evidence-sha256.txt：不随报告提交的原始日志/profile SHA256 索引。
- SHA256SUMS.txt：本目录内已提交文件的校验和。

## 边界

新 harness 只在独立 M/D4/P06/R02 worktree 执行；没有改产品实现。所有运行数据和 Office 包均为合成数据。无 Electron GUI、真实 Provider、学校系统、真实材料或账户验收。测试代码文件仍留在本机隔离 worktree，以 test-only 索引和 SHA 标识；报告提交不携带可被应用误用的测试源码。

第三轮可以据此开始离线架构设计；在 P06 归档旧 Observation、Actor provenance 与 batch finalization 三个负例被实现层约束并重验前，不应签署真实自动业务处理可上线。

固定生产源与审计文档 SHA 的机器可读清单见 inputs-and-sha.json。
