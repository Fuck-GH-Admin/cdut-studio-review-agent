# 30｜D3-10 两名独立制作 Agent + 第三方隔离复验签收（2026-10-11）

> **本文件只签署 D3-10 的技术交接验收：PASS。不是整个 D3 Release 的签署，不授权 D4 五套模板或 D5 开工。**  
> 公共代码基线：`d16f047af653f7ba259456807c1fc150e9d0f417`。Agent A/B 分别从此 SHA 派生；两个作者测试 PR 均保留 Draft，不合并。  
> 本文件追加本身产生新的 D3 分支 HEAD，因此未来完整 Release 的 D3-11 必须核对新 HEAD 的同 SHA 全量 CI，不能混用作者 PR 的绿灯。

## 1. 三方独立性和确凿证据

| 身份 | 交付 PR / 固定 SHA | 同 SHA CI 和执行事实 | 结论 |
| --- | --- | --- | --- |
| Agent A 首次使用 | [PR #11](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/11) `5d5caa3ef35572f57485e0f783443fcfd967d66e` | [独立制作工作流 #38092360705](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38092360705)、[完整 PR CI #38092360669](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38092360669) 均 success | 技术制作 PASS |
| Agent B 跨业务和升级 | [PR #12](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/12) `e69d22dce3d329fc5db19efdd4c6b369f21f68c4` | [P1/P2 实际执行 #38092412502](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38092412502)、[最新完整 PR CI #38092523912](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38092523912) success。工作流自写证据的提交与最终 PR HEAD 不同，实际脚本复跑由第三方补证 | 技术制作 PASS |
| 第三方统一验收者 | [独立审计 Draft PR #13](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/13) `8216ffa5a3e72a6f8aa1abdd646b2c084700c6d8` | [第三方隔离复验 #38093886953](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093886953)：不同 GitHub Actions runner 固定两作者 SHA，在新配置目录分别重新执行，A/B 两 job 均 success，产物上传 artifact；审计者额外检查来源、Check、状态、边界、指纹及归因 | **D3-10 PASS** |

独立性口径：两名作者在不同 Git 分支与隔离环境工作；第三方不使用作者私有配置，也不把仅同一开发者运行两个 CLI 子进程算成两名 Agent。审计 CI 执行的是作者实际 CLI/Pi 服务测试与第三方断言；这不是联网模型盲测。

## 2. 交付物及正确性判据

### Agent A：最简文本 → 独立审核粒度

- 不依赖共享模块或 Claim 图，完成 D1 revision 1→2 自行实质性编辑、read/diff/save、D2 preview/register/create、导出/干净配置导入、版本冲突及输出冲突拒止。
- revision 2 将「摘要、正文、结论」合并成一条复合 Check；独立试用发现一条 SourceRef **不能证明三个子责任均已执行**，于是自行制作 revision 3，拆为三条有独立 SourceBinding 的 Rule/Check（`abstract-completeness`、`body-completeness`、`conclusion-completeness`）。
- 对正例/负例/不可读文本分别验证真实 Pi **服务端**可以保存三条不同状态的结构化回执；预期状态由合成金标预先指定，**没有在线模型判断准确率证据**。
- A 的 CI 自行提交日志曾导致 bot 新 HEAD `action_required`；已改为只读、固定 SHA checkout + artifact 上传。最新同 SHA CI 均 success。

### Agent B：共享、迁移、业务边界和异常闭环

- B01/B02 在 A 档案、C 校园卡引用同一冻结版本和 digest；各自 SourceBinding 隔离；A 旧版 read/copy 与 C family/temporary 的适用范围不串用。
- 独立冻结 B01 v2，D1 A revision 1→2→3、C revision 1→2，`impact` 枚举四个 v1 消费者；仅 A read 显式升级，A copy 与 C 保持 v1。删除旧 Check 而未确认，实际拒绝 `D3_UPGRADE_REMOVAL_NOT_ACKNOWLEDGED`。
- 制作中曾把「复制独立授权」做成案卷级 localTask，独立查看 D2 编译计划后改为 `objectKey=item-1/copy` 的业务本地模块，这是作者可诊断并恢复的建模问题，不是公共编译器缺陷。
- B 用**自己制作的** `archive-r3.json` 实际新建技术案卷 `d310-agent-b-archive-r3-run` 与 Pi 服务 Run `run-pi-mv2zcewk-7y1vm`；只给 read 绑定证据，误报 copy `compliant` 实际拒绝、`accepted=0`；随后六个 Check 结构化回执完成，copy 两条皆 `awaiting-confirmation`，`verifyD2PiRun.complete=true`。
- **拒止原因不能串归因**：原版模板 copy `compliant` 首先遭到「校规未核」门禁拒绝；B 又建立明确标为非正式合成来源的独立控制案卷 `d310-agent-b-copy-evidence-probe`、Run `run-pi-mv2zcex0-oav4q`，越过该先行门禁后**实际到达**逐操作证据门禁，确认 read 证据不能授权 copy。不能把控制样例描述为校规已确认。
- 高级合法替代证据的最小输入 D1 验证通过，D2 CLI 实际失败于 `D2_UNMAPPED_ADVANCED`（exit 1）；`report-gap` 成功记录原始 MD 的 R08/R09/R10/R29、影响模板、实例、Check 与上述**原基线** Run ID，且 `verifiedAgainstRun:false`。高级关系版本未创建 Run；「正确拒止」不等于「高级替代已支持」。
- 档案原 MD `g01_archive_utilization_template_editor_spec_v1_5.md` 的规则位置经第三方与文件本体抽样比对，未将仓库概要冒充原文。当前成都理工三张审批表及个别现行权限仍须校本待核。

## 3. D3-10 签署与保留事项

**D3-10 判定：PASS（Agent-first 交接工具能力，含可追溯非阻断限制）。**

判据：两名互不共享开发上下文的作者均独立完成从工作区制作、版本管理、编译、跨模块适用、安全回执与错误恢复的适用任务；真实补测及第三方隔离复跑成功；没有通过删除责任、擅自升格来源、模拟在线模型、修改公共 D3 代码取得通过。

保留事项（**不可**因 D3-10 PASS 自动结案）：
1. **P2 工具 UX**：仍缺一个通用、只接受 JSON/合成材料输入的公开 Pi material smoke CLI；当前作者需自己写 TypeScript 调用已存在服务。建议进入 D3 Release 前补充或明确作为 D4 入口已文档化的工作约束。
2. **D3→D4 粒度规范**：需要分别判定和追踪的原子义务，应分别获得 Check ID、sourceBinding 及状态。不能把一个复合 Check 当作多个独立业务结论已经覆盖；不要求引入复杂 Claim 图。
3. **真实在线模型审读/提示注入盲测：NOT-RUN**；合成 Pi 工具回执仅证明服务端契约、证据引用和权限边界，不代表识别准确率。
4. **高级替代关系：TOOLING-BLOCKED**；保持 `D2_UNMAPPED_ADVANCED` 和完整 source/Check/Run 缺口报告，未经无损映射前不得声称支持正式业务。
5. **校本现行制度有效性：BLOCKED-BY-SOURCE**；绝不可将合成测试当成正式校方批准。
6. 新文件追加后必须按 D3 最新 HEAD 重新核对全仓 + D1/D2/D3/旧基线 CI；D3-01～12 仍需整体 release matrix 签署，**整个 D3 Release 尚未签发**。

## 4. 分支和阶段纪律

- PR #9 继续 Draft、未合并 main。
- PR #11/#12/#13 都是**验收输入和运行证据分支**，不得当作正式模板或自动合入公共 D3。
- 不启动 D4 五套生产模板，不启动 D5。
- 下一步：集中核对第 23 号 D3-01～12 的整体验收矩阵及 P2 公开运行入口，再单独作 Release 决策。
