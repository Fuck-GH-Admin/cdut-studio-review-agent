# NB-117 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 18 文件/1130 行（p08-renderer-ui · p08.renderer-lib）
- 交付：`deliveries/nb-117/`（seal_delivery.py/1 v2，sealId `seal-e95c34dac08fc153`）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-117/SOURCE-CHECKLIST.md`（18 文件全读）；本轮 18 篇手册比对
- **批次判定：revision_required（14 accepted / 4 revision_required / 0 unknown）**
- 测试/typecheck/build/GUI **NOT_RUN**

## G0 完整性（PASS）

18/18 源绑定 == MANIFEST == SCOPE；18/18 `manualSha256` == stage；DONE 三哈希链自洽；ZIP `R07-nb-117-05fb2565.zip` 21 条目（v2）无穿越/0 mismatch；人工列 18/18。

## G1 结构（PASS）；G2（14 PASS / 4 返修）

**正面确认**：7 条契约注释锚点全回源为真——教程空态历史缺陷（shouldShowWelcomeLauncher）、ExitPlanMode 审批门（不算退出）、/compact 原位覆盖（mergeMessagesByUuid type:uuid 去重+位置保持）、Pi partial 累计帧规则（live-upsert 仅 final→final 去重）、documentHasFocus 一律未查看（completion-presence）、陈旧信号消费（autosend 七步决策链）、agentRuntimes 迁移兜底（channel-selection）；active-tab-side-effects 单一事实源（React hook 委托）+团队/个人 scratch 语义。如实标注：running-indicator.test 测批外源、side-effects 无测试。

**返修 4 篇（F-01..F-04，计数错）**：

| id | 对象 | 摘要 |
| --- | --- | --- |
| F-01 | agent-autosend-turn.test.ts.md | 「17 用例」实 **16** |
| F-02 | agent-autosend-turn.ts.md | 「导出 3 条」实 **4**（AutoSendTurnState :25 漏计，正文已提及） |
| F-03 | agent-channel-selection.test.ts.md | 「11 用例」实 **10** |
| F-04 | agent-message-queue.ts.md | 「导出 12 条」实 **14** |

非阻断：M-01 契约确认；M-02 如实标注。

## 合入绑定

- **acceptedHashes（14）**：active-tab-content.{ts,test}/active-tab-side-effects/agent-channel-selection.ts/agent-completion-presence.{ts,test}/agent-live-message-upsert.{ts,test}/agent-message-merge.{ts,test}/agent-message-queue.test/agent-plan-mode.{ts,test}/agent-running-indicator.test。
- **rejectedHashes（4）**：F-01..F-04；`nb-117-r1` 修订后按新 hash 复验。
- **全组 14 批首审至此全部完成**（3 accepted + 11 revision_required 待 r1）。
