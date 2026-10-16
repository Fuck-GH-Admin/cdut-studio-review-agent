# D4 G01-I v1.7｜Agent A 技术交付（初始候选）

本分支严格以 D3-R0 `4b191c729f3d5f8135c73b87c17642023f6c3986` 为技术父提交，业务原件 SHA-256 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329` 实际一致。**此版是可检验的作者态候选，未获业务验收或正式发布资格。**

作者态：一份 `g01-student-identity-correction@1`，10 个 workspace-local 聚合语义模块、49 条精确来源绑定（含原 28 条规则、13 条条件、28 字段、6 种材料、8 个阶段及状态/例外约定）；未套用 B01/B02 共享冻结模块，`sharedModuleLocks=[]` 正确反映当前选择。D1 / D2 的实际检查与候选输出必须以已执行的测试结果为准。

责任账：`conversion-ledger.json` 共 85 项，区分语义 Check、仅描述的条件和缺少技术表达的字段证据关系。尤其不能以 28 条 rule Check 已存在推断 13 个 S 分支可动态生效。所有含 C/E 的规则保留适用权限待核，国定文本也不由这次工程转换给予行政授权。

工作方式：`workspace/workspace.json` 为符合当前类型字段的 D1 输入候选，`workspace/selection.json` 为只按全案范围编译的 D2 选择；`tests/g01-i-technical.test.ts` 为只使用合成数据的实际服务测试，不是隐藏 Gold。需以 Bun 环境运行 `bun test --isolate ...`，而不是报告脚本存在即已通过。

当前不可声称：G01-I 两业务条件实际产生不同任务实例；一证多事实得到真实来源授权；业务状态汇总器已完整运行；Pi 在线业务准确率；CDUT 现行政策适用已核；任何行政批准。关键阻断详见 `issues/tooling-gates.md`。
