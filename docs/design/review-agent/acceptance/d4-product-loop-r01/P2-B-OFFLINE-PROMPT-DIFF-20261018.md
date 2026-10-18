# D4 P2-B｜真实 Pi Prompt 离线指标与两 SHA 差分工具（2026-10-18）

**当前状态：工程候选，不是线上模型效果验收。** 先阅读 [统一离线与批量验收制度](P2-B-C-BATCHED-ENGINEERING-AND-ACCEPTANCE-20261018.md)。

## 真实测量入口

`apps/electron/scripts/review-d4-p2-prompt-metrics.ts` 在独立临时 `PROFER_CONFIG_DIR` 创建 `g08-t02` 两合成对象真实 D2 案卷，调用既有 `preparePiReviewRunV2` 生成 `userMessage`，并读取同一案卷 `d2RuntimePlan` 的 107 个 Check / 107 个 Rule 文本摘要。**不创建 Provider、不开 Electron、不发送真实材料、不写用户默认配置**。完成后清除临时目录。JSON 不包含完整原文、申请者信息或真实文件路径；输出文件若指定则使用 `wx`，避免覆盖现有证据。

在两个已固定 Git worktree（不要在运行中更改 HEAD）运行：

```bash
# 在 PR #112 固定 SHA worktree 下
cd apps/electron
bun run review:d4:p2-metrics --out /tmp/d4-p2-old.json

# 在 P2-B/C 最终候选固定 SHA worktree 下
cd apps/electron
bun run review:d4:p2-metrics --out /tmp/d4-p2-new.json

# 可在新版本 worktree 下运行对照
bun run review:d4:p2-metrics --compare /tmp/d4-p2-old.json /tmp/d4-p2-new.json
```

**注意**：旧基线 PR #112 不包含该 Runner，直接执行会命令不存在。因此须使用相同 Runner 源文件复制到旧版 worktree 的**临时脚本路径**，从旧版工作树解析其生产模块；不能直接在旧分支运行新版本生产模块。可将 Runner 及只读 Metrics 辅助模块放到独立本地 QA worktree 的测试副本并临时引用两侧旧、新服务实现，但必须确保 import 路径来自被测版本；不改变冻结基线并留下 SHA 和执行命令。若做不到双侧实际生成，则只报告 `NEW_MEASURED / OLD_NOT_RUN`，禁止虚构百分比。

## 指标与严格配对

- 输出：`sourceSha`、template ID/version、`selectionHash`、Subject 数、完整有序规范 Rule/Check ID 集合、Rule requirements hash、真实 Prompt SHA、字符/UTF8 字节、规则区/映射区字符数、提交合同标识、未确认状态约束、证据范围约束、dictionary mode、`modelInvoked=false`。
- `comparePiReviewPromptMetrics` 对模板/版本、selection、subject 数、Rule ID、Check ID 和 requirement 原文摘要进行**硬配对**。任一改变输出 `UNPAIRED` + 原因，不计算任何节省百分比。
- JSON 只证明同场景的结构负载。跨两个随机生成的 caseId、运行随机 ID 或临时目录绝对路径不能直接用于哈希比较；使用 Selection 与不可变规则映射集合比较，仍须在报告里说明生成元数据差异。
- 已归档 129394 字符 G08 历史 Prompt **只是历史对照，不是严格同输入实验结果**。所有 token/费用/耗时和审核效果仍待未来经授权的真实 Provider A/B。

## 回归与接续

新增 `pi-review-prompt-metrics.test.ts` 检测配对、拒绝虚假节省、敏感原文不出 JSON；新增实际 `pi-review-prompt-metrics.integration.test.ts` 从真实 D4 G08 两 Subject 案卷生成 107 项 D2 Plan → 真实 Pi userMessage，确认来源、字段与未确认约束存在，并禁止模型请求。

P2-C 在本 P2-B 固定 HEAD 上另开独立开发分支，只负责提交反馈和继续机制，不改变 Prompt Runner / D2 契约。最终批量验收的授权及顺序以统一制度为准。
