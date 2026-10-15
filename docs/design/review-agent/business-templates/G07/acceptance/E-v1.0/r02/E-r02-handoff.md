# G07 r02｜新会话续审交接

审计链：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e` → `audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`（PR #26）→ `audit/g07-e-v1-r02`（本轮 E0 差分）。r01 四文件保持不变；r02 在本 `r02/` 子目录单独保存。

1. 先看 `E-r02-stage-status-and-verdict.md`，确认 `BLOCKED_INPUT`；再看 `E0-r02-delta-manifest.json` 的每 TXX C/D 作者 HEAD、文件 blob 与校验状态。
2. r01 未编号的三项原始问题在 `E4-r02-issue-ledger.md` 中使用**r02 新追踪号**延续，注意不能覆盖/重命名历史裁定。
3. 新证据中 **七份 C 作者 Git MD 文件已独立定位并完成 7/7 SHA-256 自动复算（无语义审读）**，但 **不得在 E1 事实冻结前读取正文**。四份 INPUT_ONLY ZIP 外层 SHA/CRC 已独立通过，T02 B ZIP 同样通过；T01/T05/T07 D 输入只有作者报送，需后续获取真实安全输入副本。
4. **七套 D Gold ACL 全部未获得可信配置/访问日志证明**，不要打开 EVALUATION_ONLY 或私人补充包；作者 Git 新 SHA 不证明原 Gold 制作时间/独立性。
5. E1 必须基于完整 A/B 来源清单事前冻结 H 全量、M 机制、L 样本及官方有效原文；不得通过补一个 MD 标记或改 Gold 哈希来“修复盲审”。
6. E2/E3/E4 严格受 E1 门槛；当前没有可关闭的业务缺陷票。工程 D4、在线模型、校方行政权保持独立状态。

读者如发现新作者版本，应新增受影响差异与校验记录，保留 r01/r02 原文件 SHA 以及历史结论。
