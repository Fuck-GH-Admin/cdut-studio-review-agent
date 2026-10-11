# D3-MD-Q1 / Agent A：高校档案利用MD完整性独立作者试验

- 固定基线：`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`，从该SHA创建`test/d3-md-full-author-archive`。
- 原业务：`g01_archive_utilization_template_editor_spec_v1_5.md`，SHA-256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`（私有文件字节经容器`sha256sum`核对一致）。
- 工具：从固定基线实际检查D1/D2/D3 TypeScript类型与脚本，而非照搬旧pilot gold。
- **当前交付性质**：业务索引/完整作者态候选/预期对象/合成反例/风险账本。尚未完成CLI实际运行与Pi/CI，绝不标示整体PASS或已经发布。
- catalog：42原子R责任 + 12正文不变量，另完整登记50字段/14槽/15分支/16例外；ledger包含各项预期Check路径但**没有伪称D2实际编译Check**。
- D1工作区共11个本地模块，分别保留部分可独立输出的审查职责；`sharedModuleLocks=[]`不伪装共用模块。
- 独立gold：NOT-RUN（不得读取或生成自身金标代替评审者）。
- 合成Pi服务：NOT-RUN；在线模型：NOT-RUN；无Run ID/Case ID不伪造。
- 该分支所有内容只在指定acceptance子目录，无公共D3/D2/Pi代码修改。

下一位独立复跑者应先执行`tests/replay.sh`并核对CLI输出，更新ledger/checkIds与真实plan fingerprint，再交独立gold评审。
