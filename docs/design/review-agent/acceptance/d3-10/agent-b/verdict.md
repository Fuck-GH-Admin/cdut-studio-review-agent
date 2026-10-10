# D3-10 Agent B 独立验收结论

**总体：Agent B 工具执行层 PASS；完整在线业务审核 NOT-RUN；成都理工正式规则 BLOCKED-BY-SOURCE。**

## PASS：有真实执行证据

- 固定代码基线：`d16f047af653f7ba259456807c1fc150e9d0f417`。
- 33条独立 Bun/D1/D2/D3 命令均按预期退出，17项独立断言通过；2个预期错误路径分别得到非零退出：未签收删 Check 和缺 `runIds` 的 report-gap。
- B01/B02 跨档案与校园卡复用，相同锁相同局部语义、不同来源绑定。
- B01 v2 真实冻结、D1 r1→r2→r3 revision 链、CLI impact 的4个旧版消费者、仅档案 read 实例升级；copy 及校园卡仍为 v1。
- 拒绝删除旧 Check 责任，补充明确签收后可执行 *Check ID* 迁移；不代表撤销原始 R08–R10。
- 双业务携包在干净配置中重导入，A D2 指纹稳定；A read/copy 分别匹配不同 subject，本地 copy 规则也精确绑定 copy。
- 仓库既有真实 Pi **服务合成测试**在独立执行环境运行成功；不等于 Agent B 自行生成真实 Pi Run。
- 隔离配置、输出、实际命令及 stderr 均在仓库的 `run-log.md` 与 `logs/`。

## NOT-RUN / BLOCKED

- **NOT-RUN**：Agent B 新建的 Pi Run / 在线大模型材料审读。由于未创建运行记录，问题票 `runIds: []`；在线模型 `onlineModelRun=not-run`。
- **BLOCKED-BY-SOURCE**：2026成都理工三张档案审批表的精确栏目及现行批准职责，未能确认；A 专属签批与开放许可保持待核，不以跨校规则作为本校强制标准。
- **TOOLING-BLOCKED / 待完整运行复现**：合法电子委托及条件证据替代的复杂关系未被证明可以无损表达；原 MD R08-R10、R29 责任保留，并提交结构化 gap。
- **未签发**：正式 D3 Release、五模板 D4 验收、校方批准。PR 保持 Draft，不合并。

## 发现与恢复

首次独立产物审计发现 Agent 把档案专属“复制不得继承查阅”写成 `case` 级 localTask；已通过业务本地模块 + `objectKey=item-1/copy` 修正，D2 编译再次确认。`plans/independent-assessment.md` 详细记录实际指纹、规则/Check 来源、历史版本和错误归因。

**可独立复核**：`README.md`、`run-log.md`、`source-map.md`、`workspaces/`、`module-locks.json`、`bundles/`、`plans/`、`tests/`、`gaps/`、`logs/`。

最终由不参与制作的第三方按23/24/29号契约及 Agent A 的独立结果裁定整体 D3-10，不能用本结论替代统一验收。
