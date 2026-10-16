# D4 G01-I v1.7｜Agent A 技术交付（初始候选）

本分支严格以 D3-R0 `4b191c729f3d5f8135c73b87c17642023f6c3986` 为技术父提交，业务原件 SHA-256 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329` 实际一致。**此版是可检验的作者态候选，未获业务验收或正式发布资格。**

作者态：一份 `g01-student-identity-correction@1`，10 个 workspace-local 聚合语义模块、49 条精确来源绑定（含原 28 条规则、13 条条件、28 字段、6 种材料、8 个阶段及状态/例外约定）；未套用 B01/B02 共享冻结模块，`sharedModuleLocks=[]` 正确反映当前选择。D1 / D2 的实际检查与候选输出必须以已执行的测试结果为准。

责任账：`conversion-ledger.json` 共 85 项，区分语义 Check、仅描述的条件和缺少技术表达的字段证据关系。尤其不能以 28 条 rule Check 已存在推断 13 个 S 分支可动态生效。所有含 C/E 的规则保留适用权限待核，国定文本也不由这次工程转换给予行政授权。

工作方式：`workspace/workspace.json` 为符合当前类型字段的 D1 输入候选，`workspace/selection.json` 为只按全案范围编译的 D2 选择；`tests/g01-i-technical.test.ts` 为只使用合成数据的实际服务测试，不是隐藏 Gold。需以 Bun 环境运行 `bun test --isolate ...`，而不是报告脚本存在即已通过。

当前不可声称：G01-I 两业务条件实际产生不同任务实例；一证多事实得到真实来源授权；业务状态汇总器已完整运行；Pi 在线业务准确率；CDUT 现行政策适用已核；任何行政批准。关键阻断详见 `issues/tooling-gates.md`。


## 实际 CI 回归与完整运行快照（追加）

- 完成并检查的 PR CI：<https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38978918519>，测试对应提交 `5ec5258f3f4d5c533203ad7ad09ad6159498951e`。
- Bun 1.4.0 / Node 22；类型检查、边界检查、界面契约、构建均 PASS。全仓 3624 测试：**3618 PASS、6 SKIP、0 FAIL**。
- 新增的 D1 CLI validate/save/read、D3 validate/freeze/inspect/export/import、D2 preview/register/create 已在隔离配置内真实执行；`g01i-case-synthetic` 是实际创建的合成技术预审案卷，绝非正式学籍审批。
- 经四份 CI 独立真实引擎快照重组并校验的 D2 plan：`runtime/actual-d2-draft-plan.json`。精确 `RuleSpec=49`、`mapping=49`、`subjects=0`；指纹 `31b1240de64e4f2038790c7f7cdbdb7f139b14ce9db8e9689620fafdcce472ef`，`publicationAllowed=false`。
- 携包导出/换隔离配置重导入后 D2 指纹仍与原值一致；命令回执详见 `runtime/ci-cli-receipt.json`，工作流汇总 `runtime/verification.json`。
- **未解决的成功门槛**：两组真正不同的 G01-I 身份业务条件无法无损形成各自独立、结构化的 D2 有效任务；一证多事实的 G01-I 主体/法定效力图不能运行编译。对应主开发问题依旧 OPEN，不能将语义 Check 存在误报为全业务 PASS。
- 线上 Pi、学校现行制度授权、行政批准及独立隐藏 Gold 均未执行/未取得；本次成功范围仅为合成技术验证。
