# L02-U0 兼容性核查证据索引

> 状态：**PARTIAL / BLOCKED_ENV**。U1 仍未准入。不得改写 29 号 LIVE-01～08、37/38/44 首败或 46 号旧版本实测结论。

- [52 号完整审计报告](../../52-p06-l02-u0-compatibility-audit-20261016.md) — 现行新旧代码调用路径、十四项风险/测试覆盖、Git 拓扑和历史证据适用边界。
- [u0-matrix.csv](u0-matrix.csv) — 14 项机器可读兼容性矩阵，保留原始 CSV CRLF。
- [u0-run-isolated.sh](u0-run-isolated.sh) — 不推送、不切换用户分支的定版隔离复验脚本，本轮停于 clone。
- [00-clone.stderr](00-clone.stderr) — 本次实际首败，exit 128 / DNS 不通，与产品本身的 CI/测试 FAIL 不同。
- [u0-observations.json](u0-observations.json) — 版本、状态与证据来源。

冻结目标 `main@8989941b6fb5651564e32d11c4215b6a6d5a5209` / tree `b3df4773afc20ee46facd2366f35c5a78ee99e98`；本证据提交前 PR #21 HEAD `ad92e3965d43f551849d5e490a4c8e5a134d1ad8`；上游 `c179f2575d5bb5abdc883268fb885d1a6449325e`。

源文件原始 SHA-256：
```
ca78077e58e225f733f47ccfbb41c5a9b2e7c6aad713325b052f49f66cd1c13e  L02-U0-report.md
510d1419768d89cf00698120e03b404135ed0a40f34bd3cd0fd29ad902f26ac1  u0-matrix.csv
fcd9922cd0e4213479ef277efca32b6249be94013e112ecc9f9ff1b764cd6a1f  u0-run-isolated.sh
6c6f96c3bc6d34f5acaab99d74595a196f830d8563beae90060397b80f75519d  00-clone.stderr
```

责任归属：D-U0-01 属 **上游通用 Office 索引实现中存在的静态风险**（我方 main 与上游对应 Git Blob 完全相同；真实同名文档复现 NOT-RUN）；D-U0-02 是 **审核模块 SourceRef 集成合同尚未验证**，不是已证实缺陷；严格 Pi 五工具安全边界必须由我方模块持续证明。未修改生产代码、Gold、main、上游或 PR Draft 状态。
