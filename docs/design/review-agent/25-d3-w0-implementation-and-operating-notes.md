# D3 W0 · 已实现共享冻结模块库与 Agent 操作接口（非 D3 终验）

> 基线：main 已含 D2 PR #8；设计依据 [15](15-template-modules-and-runtime-boundary-spec.md) / [16](16-template-editor-five-g01-gap-and-module-extraction-v0.1.md) / [23](23-d3-shared-module-library-and-d4-handoff-contract.md) / [24](24-d4-five-template-authoring-and-feedback-loop.md)。  
> 阶段：**D3-W0 开发中**；仓库分支 `feat/review-d3-shared-frozen-modules`，Draft PR #9；不表示 D3-01～12 均验收通过，也不是 D4 Release。

## 为什么先做这些

D1 的 `workspaceId + revision` 是草稿历史，工作区允许反复修改同一个 `moduleId@version`；D3 的 **`moduleId + version + digest`** 才是跨工作区固定的共享内容。普通 Pi 只收到 D1/D2 生效规则/任务包；D3 不新增运行 Harness，也不给模块作者校方审批能力。

W0 的数据面独立于 D1 作者态，所有新字段在 [review-d3.ts](../../../packages/shared/src/types/review-d3.ts) 中定义：
- `ReviewD3FrozenModule`：完整模块快照、SHA-256、依赖锁与样例定位，冻结后 `wx` 写入，不覆盖老版；
- `ReviewD3TransferBundle`：D1 workspace + 冻结快照/依赖 + 整体指纹；用于隔离目录离线导出、再次导入；
- `reuseFrozenD3Module`：必须提交期望摘要、固定引用实例、对应的**模板本地 sourceBindings** 和乐观 revision；模块库绝不能携带跨校有效政策权限。

## 真实可运行命令

在仓库根目录安装 Bun 依赖后，为每个 D4 会话设置**自己的** `PROFER_CONFIG_DIR`（不使用生产目录）：

```bash
export PROFER_CONFIG_DIR=/tmp/d3-author-A
bun apps/electron/scripts/review-d3-library.ts discover delegation
bun apps/electron/scripts/review-d3-library.ts freeze /tmp/d3-b01.json /tmp/d3-b01-tests.json
bun apps/electron/scripts/review-d3-library.ts inspect delegation-scope 1
bun apps/electron/scripts/review-d3-library.ts reuse /tmp/d3-workspace.json /tmp/d3-reuse-request.json > /tmp/d3-new-workspace.json
bun apps/electron/scripts/review-d3-library.ts validate /tmp/d3-new-workspace.json
bun apps/electron/scripts/review-d3-library.ts export /tmp/d3-new-workspace.json /tmp/d3-export.json
bun apps/electron/scripts/review-d3-library.ts import /tmp/d3-export.json /tmp/d3-restored-workspace.json
bun apps/electron/scripts/review-d3-library.ts diff /tmp/d3-b01-v1.json /tmp/d3-b01-v2.json
bun apps/electron/scripts/review-d3-library.ts report-gap /tmp/d3-tool-gap.json
```

- 路径仅作展示；`/tmp/d3-b01.json` 等输入须由业务作者准备，**不是仓库已交付的现成文件**。本阶段真正可复跑的最小资产为 `review-d3-module-library.test.ts` 的独立目录合成数据。
- `freeze` 前须有至少一项非空测试资产 ID（第二个 JSON 为字符串数组）。当前 W0 **只登记样例引用，不执行外部金标回归**，不能因此宣称业务模块已通过准确率验收。
- `reuse` 参数 JSON：`expectedRevision`、`templateId`、`templateVersion`、`use: { id,moduleId,version,bindings? }`、`expectedDigest`、`sourceBindings: [{ checkId,sourceIds }]`。当前命令输出下一版完整 D1 workspace，**不会自动绕过 D1 历史追加事务**；编辑者应显式使用 D1 的 `save` 命令登记新修订。
- W1 新增 **`workspace.sharedModuleLocks[]`**：每次 `reuse` 明确登记共享模块及传递依赖摘要；D1 作者态保存验证工作区锁与定义一致，D1/D2 候选编译还必须与本地冻结注册表及其递归依赖核对。删除锁、变更同版本内容、替换目录中的资产均不得偷偷保持可运行资格。
- 新增 `impact <moduleId> <oldVersion> <newVersion>`，查询**通过 D1 保存的最新工作区修订**中的反向模板实例路径、内容差异；`upgrade <workspace.json> <upgrade-request.json>` 只迁移指定模板实例，须提供旧/新 digest、期望 revision、新版实例 sourceBindings 和 `acknowledgeRemovedCheckIds`。它输出新工作区 JSON，随后仍须用 D1 `save` 明确追加。**不自动重跑金标，也不自动更新未迁移的消费者。**
- `export/import` 创建新文件（`wx`）拒绝静默覆盖。新配置目录导入前验证包摘要、内部所有冻结内容和依赖；冲突拒止。导入只是制作资料，不会自动正式发布校规。
- 新公共版本需要新 `module.version`；W0 `diff` 只显示任务变动，**不会静默把老模板重定向到新版本**。

## 代码事实与验收范围

| 当前实现 | 对应契约 | 已知限制 |
| --- | --- | --- |
| 冻结与不可覆盖 | D3-02/03 的一部分 | 摘要防意外修改，不是外部签名；样例登记尚不等于回归通过 |
| 跨工作区引用与来源重新绑定 | D3-02/04 的基础 | 首次 `reuse` 必须提供准确 D1 sourceBindings，否则失败关闭 |
| 冻结组合依赖的递归锁校验 | D3-03 | 首版不实现高级任意 Claim/Evidence DSL |
| 保留旧版、差异与新版本 | D3-05 的局部能力 | W1 已补当前 D1 保存工作区的反向索引和显式单实例升级；尚缺独立金标回归选择与更多业务分支 |
| 离线导出/导入 | D3-09 的技术基础 | 尚需跨场景 Pi 编译与金标重跑及完整 D4 交付清单 |
| Agent JSON CLI 与失败码 | D3-01/10/12 的基础 | 尚未通过两名独立 Agent 的陌生人可用性验证 |

## W1 后续优先项（阻断 D3→D4 正式交接）

1. 补齐**真实可复制的**最简文档与 G01 局部场景资产、明确工具失败恢复命令，并让另一个 Agent 从干净环境复跑，不靠写死本机路径。
2. W1 已加入显式锁、D1/D2 编译前核验、反向消费者/受控升级与旧版不漂移合成回归；下一轮要用真实 D4 业务场景验证迁移前后任务覆盖、来源变化和金标范围。
3. 对 B01「代办授权范围」和 B02「待证事实证据链」做窄范围合成样本复用/拒用比较，绝不让它们导出发卡、查档或用印资格。
4. 对无法表达的证据替代、阶段、权限条件清楚上报 `tooling-blocked`；不能为了 D4 顺利而静默丢掉原业务的必核规则。
5. 按 [23 号 D3-01～12](23-d3-shared-module-library-and-d4-handoff-contract.md#7-d3-自验收门槛先交给两个陌生-agent再交给五个业务会话) 真正执行全部测试，并冻结统一 D3 Release SHA/模块锁/使用说明后，才通知五个原业务会话开始 D4。

**阶段边界**：上述不完成时 W0/W1 的 CI 绿色仍不能声明“D3 可以交给 D4”；业务的实际审批须有对应政策授权，合成回执绝不代表正式校规生效。
