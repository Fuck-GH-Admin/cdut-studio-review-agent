# 03｜实验遗产、失败与隐藏价值
## 已有失败，后续修复/缓解（分证据级别）
1. **Pi 审核漏检查和过早结束**：旧 [12 号实测](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/12-template-audit-failure-analysis-and-repair.md) 记录 9 项系统补出的“没有有效 Pi 结论”和 1680/1480 差额漏检；根因不宜全部归到一次工具事件。后续 D4 #120 `pi-review-submit-repair.ts` 的被拒/漏项提示与 P06 #131 `pi-review-agent-client.ts` 的 requiredToolKeys 完整性是部分修复。**当前仍未取得真实不同模型盲测收口**。归属 EXP-08/RUN-05/RUN-06。
2. **P02 会话删除后迟到 metadata 复活**：P06 [65 首败](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/docs/design/review-agent/65-p06-l02-u1-local-real-result-20261018.md) 真实 Electron FAIL，后 PR #106 修复；[79 号](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/docs/design/review-agent/79-p06-l02-u1-unified-local-result-20261018.md) 内 P02 scoped PASS。保留测试负例而不是删掉失败记录。
3. **Office #71 不同物理源串 index/cache**：65 号本机可复现，PR #110 修复；71/79 号的 Office 双案真实 Main/Renderer scoped PASS，但移植上游遭 403，**BLOCKED_UPSTREAM**。归属 DOC-03/EXP-06。
4. **多批 Run 混归属隐患**：R02 单凭 case+template+latestRun 会借另一批较新 Run；[90 号](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/docs/design/review-agent/90-p06-l02-01-r03-batch-run-binding-and-acceptance-gates-20261019.md) 已提交持久绑定 `BatchStateV2.cases[].runId`，无绑定 fail closed；R02 的独立 provenance helper 在 R03 消失，内联逻辑是否完全等价尚需差分。
5. **C10 双击与生命周期**：D4 #112/#124/#126 形成修复/定向输入 token 回归；#128 的历史真实 GUI 结论为 `BLOCKED_INPUT`，不能因为 #129 CI 成功回填 PASS。

## 失败仍未真实解决 / 因环境阻断
- **Provider Live**：P06 74 号证明 SDK 0.86.1 的模型可见工具清单与实际活跃集匹配，但无授权 Provider 请求，未得到真实 tool_use、来源读取回执和提交回执；状态 **BLOCKED_ENV**。
- **磁盘故障卷/跨 PID**：79 号 /dev/full controlled scoped PASS；安全私有 mount namespace 不允许，真实满卷与跨 PID 恢复 **BLOCKED_ENV**。
- **校务权限、政策与资料**：学校接口、政策生效版本、部门审批与 Gold 独立性不能从工程 PASS 推出；状态 **NOT_TESTED/BLOCKED_INPUT**。
- **D3 高级关系**：`D2_UNMAPPED_ADVANCED`、certified_copy 相关真实职权关系仍存在工具边界，不能把正确拒绝说成功支持。

## 实验可行但未产品化
- [13 号单 Agent 试验](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/13-single-agent-framework-trial.md)：Deep Agents 的大结果文件引用/短预览和 Docling 的富格式提取提供思路；未替换 Pi 或现有解析器。扫描证书仅一次合成/样张视觉成功，不能外推准确率。结论 EXP-01/02/03。
- [D3 31/32 号](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/docs/design/review-agent/32-md-to-modular-template-agent-quality-protocol.md)：不完整 MD 片段让源责任漏掉 R08/R33 的负例被 gate 检出，质量门禁有价值；**全原文独立 Gold 和真实完整转换并未整体 PASS**。EXP-04/TPL-09。
- W1 的逐文件角色、材料归属与更多目录名推荐已具代码和固定 SHA CI；尚未集中独立 GUI 签收，属于 **PARTIAL**。

## 从错误架构补偿中提取必要不变量
- `run@rev` 不该继续作正式 Run；真正价值是“每次业务决定必须绑定可信当前 Run/hash”。
- 每案、每批、每会话重复查版本与权限不是天然重复功能；跨 Main/Renderer/Pi/持久化边界必须独立受控。
- 截断、OCR 缺字、工具成功不等于阅读完成；应保留页/块级阅读账本和原件核验入口。
- 历史首败和 harness 错误需要分别保存；修测试夹具不能改变产品事实，也不能合并红灯为成功。
