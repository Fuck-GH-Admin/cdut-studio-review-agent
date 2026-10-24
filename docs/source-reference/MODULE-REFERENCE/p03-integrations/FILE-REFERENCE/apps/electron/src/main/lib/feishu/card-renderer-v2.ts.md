---
path: apps/electron/src/main/lib/feishu/card-renderer-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a9028f424a6500c1b753daf20a8afb298633bc8
sha256: a603da2d5602ab2f8dbcb1798f5fd6ab486fd3f36b3a2a1de31a91b04bfa3d2a
lines: 290
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu/card-renderer-v2.ts

## 1. 结论与边界

**RunState → CardKit 2.0 卡片 JSON 纯函数渲染器**（设计参考 zara run-renderer）：streaming_mode 标志动态卡；工具调用 ≥3 合并单面板防撞飞书 30KB/element 限制；面板默认收起（手机端清晰）；底部 summary=通知预览短文本（`apps/electron/src/main/lib/feishu/card-renderer-v2.ts:3-15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RenderOptions` | 接口 | 23-30 | stopHint/showToolCalls/header |
| `renderCard` | 函数 | 42-99 | `(RunState, opts): object` |

内部常量：REASONING_MAX 1500、MIN_TOOLS_TO_COLLAPSE 3、TOOL_BODY_MAX 4000、TEXT_BLOCK_MAX 20000（`:17-21`）；`groupBlocks`（text/tool 分组生成器 `:101-115`）、`renderToolGroup`（**<3 独立面板；finalized 全并摘要；running 期旧并摘要+最新单独**，`:117-132`）、`reasoningPanel`（`:134-142`）、`toolPanel/toolSummaryPanel/collapsiblePanel/panelHeader`（`:144-196`）、`footerStatus`（thinking/streaming/「正在调用 \`名\`」，`:206-217`）、`metaFooter`（时长/tokens/模型，`:219-233`）、`summaryText`（终态短语映射，`:235-243`）、`toolHeaderText/toolInputSummary/toolBodyMd`（常见参数预览 80 字、未识别不展示防乱码，`:249-285`）。

## 3. 内部逻辑与关键流程

`renderCard`：reasoning 面板→visibleBlocks（可关 tool）→分组渲染→终态注记（interrupted/idle_timeout/error/done 空内容兜底，`:64-73`）→running 期 footerStatus+stopHint / 否则 metaFooter→卡片 schema 2.0（`streaming_mode: terminal==='running'`、summary，`:82-89`）→可选 header（error 红/running 蓝，`:91-96`）。

## 4. 调用者与调用链

入向：飞书桥接发送层（非本批）、`card-renderer-v2.test.ts:2`。出向：`./card-run-state` 类型。

## 5. 数据 I/O 与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

truncate 统一「…（已截断）」（`:245-247`）；JSON.stringify 失败忽略（`:277-279`）。

## 7. 权限与权威状态

不适用。

## 8. 修改影响面

element 结构与飞书 CardKit 2.0 schema 契约；工具折叠阈值影响 30KB 限制规避。

## 9. 测试证据

`card-renderer-v2.test.ts`（3 用例，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+折叠策略+截断口径 | 已证实 | `:1-290` 逐行 |
| 飞书端渲染效果 | 未知 | NOT_RUN（网络/GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/渲染分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
