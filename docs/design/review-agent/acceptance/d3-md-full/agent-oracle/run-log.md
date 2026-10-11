# 独立 Agent B 真实执行记录

| 项目 | 实际动作 | 结果 | 能证明什么 / 不能证明什么 |
|---|---|---|---|
| 原 MD 读取 | 文件库取得完整 `g01_archive_utilization_template_editor_spec_v1_5.md`，材料化到隔离 `/mnt/data/files/` | DONE | 有原始业务源，不需要根据 Agent A 或 pilot 反推 |
| 原始字节 | `sha256sum /mnt/data/files/g01_archive_utilization_template_editor_spec_v1_5.md` | `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785` — MATCH | 私有原 MD 正确版本；**不证明现行制度有效** |
| 行数与大小 | `wc -l -c` | `725 70413` | 原始完整规模 |
| R/B/S/E 解析 | 在已核源文上逐段解析第 4/5/6/9 节 | 42 / 15 / 14 / 16 | 索引按原文取值；不证明模块已编译 |
| 正文不变量 | 对原 MD 的关键正文句取稳定锚点 | P01–P16 | 不在 Rxx 表中的显式禁止/责任也被追踪 |
| 合成输入/预期 | 分目录制作 28 个虚构案卷与逐操作期望，验证 Rxx 关联集合 | R01–R42 均有案例链接（42/42） | 测试设计覆盖，不等于模型跑过 |
| 原 D3-MD 质量门禁 | 尚无 Agent A 的真实 ledger 与 D2 plan，按独立性不得读取 | **NOT-RUN** | 不能声称 Agent A 已通过 |
| 独立结构检查器 | `check_oracle.py`，CI 执行证据以 Actions 运行结果为准 | **CI-STATUS-PENDING** | 无私有 MD 的 CI 仅可结构检查 |
| Pi 真实案例、在线模型、校方权限接口 | 本 Agent 不执行另一作者的模板和正式审批 | **NOT-RUN** | 不得虚构 Case/Run/SourceRef |

**运行证据边界**：只有真实执行过的命令和观察才能更新本表。用户原 MD 未提交到仓库；公有 Actions 不读取这份私有业务原文。第三方与作者完成后另建交叉运行日志，不回填伪造的 Agent B 先验结果。
