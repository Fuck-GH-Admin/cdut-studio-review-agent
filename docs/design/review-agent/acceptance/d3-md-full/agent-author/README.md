# D3-MD-Q1 Agent A 独立档案模板制作 + 定向技术补测

- **原件核验**：私有原MD `g01_archive_utilization_template_editor_spec_v1_5.md`，SHA-256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`，源文件不上传GitHub Actions，也不放进公共仓库。
- 固定初始基线：`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`；始终在 `test/d3-md-full-author-archive` 单独分支。
- **CI技术回放成功**：`d2cced085d802feb7c7cd4a1cb41dea380687da2` 的 [独立工作流 #38098657888](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098657888)，D1保存/读取/修订、D3校验、D2预览、携包导出/空配置导入、导入前后D2指纹相同、高级拒止全 PASS，原始日志及所有JSON收在Artifacts。
- **实测编译**：77条运行Check、39个R号有Check；R24、R29、R40仍未实例化且明确`tooling-blocked`。其余进入D2的责任也只是技术文本Check，并不自动证明阶段/角色/高级证据规则语义得以执行。
- `conversion-ledger.json` 每条R的 `checkIds` 已与真实D2 `byRule` 对照；`proposedCheckIds` 保留以便检测漂移；`planFingerprint`为实测值。正文X不变量关联的Check只是辅助证据，不等同X独立判定。
- 独立Pi合成 **基础服务回归**：同CI两测试文件共17 pass、0 fail；**没有运行本档案全量77Check的Pi案卷，也未执行在线模型或独立Gold**。
- 原文覆盖：42个R + 12个正文责任 + 50字段/14材料槽/15分支/16例外。不能因为CI绿色就删掉或降级任何一条业务义务。

## 可独立复跑

```bash
bun install --frozen-lockfile
bash docs/design/review-agent/acceptance/d3-md-full/agent-author/tests/replay-technical.sh "$(mktemp -d)" # 不需要MD
bash docs/design/review-agent/acceptance/d3-md-full/agent-author/tests/verify-source.sh /PRIVATE/PATH/g01_archive_utilization_template_editor_spec_v1_5.md # 在私有环境核验SHA和源责任，不上传原件
```

详见 `run-log.md`、`plans/ci-technical-summary.json`、`verdict.md`。独立跨验收仍待Gold Agent执行。
