# 实际运行/访问日志（不得把计划写成成功）

| 步骤 | 真实方式 | 结果 |
|---|---|---|
| 原始文件检索 | Library按精确文件名查到70,413字节完整MD并materialize到隔离容器 | PASS |
| SHA-256 | `sha256sum /mnt/data/files/g01_archive_utilization_template_editor_spec_v1_5.md` | exit 0；`65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`匹配 |
| 原文原子索引 | 本地Python独立读取725行解析R/F/S/B/E行 | exit 0；42/50/14/15/16，均无重复ID |
| GitHub Git CLI | `git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git ...` | exit 128；`Could not resolve host: github.com` |
| 固定GitHub基线 | 已连接GitHub仓库接口读取`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`与七份设计文档，D1/D2/D3脚本及TypeScript类型 | READ成功；不等于CLI真实执行 |
| D1 save/read/diff | 需完整clone仓库，当前无法执行 | NOT-RUN |
| D3 discover/validate/export/import | 需完整clone仓库，当前无法执行 | NOT-RUN |
| D2 preview | 需完整clone仓库，当前无法执行 | NOT-RUN；没有真实RuleSpec/Check/指纹 |
| Pi服务与Run/SourceRef | 没有可运行仓库及可信证据输入 | NOT-RUN；绝无合成成功宣称 |
| onlineModelRun | 未调用在线模型 | not-run |
| 独立gold对照 | 不得读取或替代独立Gold | NOT-RUN |

预备可复跑命令位于`tests/replay.sh`。当前ledger不写伪造的planFingerprint，也不将Check预测ID填充为actual Check。此PR仅是部分独立作者产物，不能签D3-MD-Q1 PASS。
