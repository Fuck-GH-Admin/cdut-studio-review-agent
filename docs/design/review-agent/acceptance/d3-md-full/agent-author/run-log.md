# 真实命令与运行证据

## 先前原件验证（本地私有环境）

- 文件 `g01_archive_utilization_template_editor_spec_v1_5.md`：70,413字节，725行；SHA-256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785` 核对成功。原件从未上传到仓库或CI。
- 原始MD解析：R01–R42、50字段、14材料槽、15分支、16例外；额外X01–X12均有原文定位。
- 本地 `git ls-remote` 仍不可解析 `github.com`，故改由GitHub Actions运行真正的仓库Bun CLI。

## GitHub Actions实际执行记录

| 执行 | 工作流运行 | 结论 |
|---|---|---|
| 新workflow初次定义 | [#38098543730](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098543730) | YAML作业作用域错误（`runner.temp`写于job env），解析失败；已修复 |
| 第一次可运行技术回放 | [#38098605903](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098605903) | D1/D3/D2/携包/高级拒止均执行，作者校验器误要求tooling-blocked R24/R29/R40必须编译，exit 1；原始日志Artifact保留 |
| **复测成功** | **[#38098657888](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098657888)** | **两Job success**；D1修订1→2，D3 validate/export/import，D2 preview 77 Check，指纹一致，`D2_UNMAPPED_ADVANCED`实测拒止，Python对照成功 |

技术成功run的输入commit：`d2cced085d802feb7c7cd4a1cb41dea380687da2`。

**D2 Fingerprint**：`19b615276bd3c64fbebe0ef97afd03841237502c25f3ae6698ba1fdcb091c0f2`。**D3 Bundle Fingerprint**：`12ef294151ef577247f3aa82c37d724f058cc9368bfffd6711918916f0be46e2`。77条Check中`request-scope`为21，`unverified-policy`为56（不代表正式校规有效）；冻结共享模块0（全部本地作者态）。原始技术stdout/stderr、各命令退出码、作者态回读、两个D2 plans、携包bundle、import workspace、报告gap和summary由Actions Artifact `d3-md-agent-a-technical-38098657888-1`（ID `11686093144`）提供，未把后验推测写成原始日志。

Pi独立回归：`review-d3-pi-integration.test.ts` + `review-d2-runtime.test.ts` **17 pass / 0 fail**；Artifact `d3-md-agent-a-pi-contract-38098657888-1`（ID `11686098057`）。这只证明共享D2/Pi基础合成服务契约，而不是本次档案完整模板Run/Case/SourceRef已验。

`sourceHashVerifiedInCI=false` 是刻意设计：原始私有MD不提供给公开CI；可在私有机运行`tests/verify-source.sh`。完整原文对照/独立金标仍NOT-RUN，onlineModelRun=not-run。
