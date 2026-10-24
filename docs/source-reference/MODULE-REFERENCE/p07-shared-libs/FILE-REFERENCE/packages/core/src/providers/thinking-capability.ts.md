---
path: packages/core/src/providers/thinking-capability.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c6c68793c5b372e90e08e5a6fd913031c95a1691
sha256: e3a5e38a98249d99d263c020e386644647a4a7bb2930fdc351dd894c58f3106b
lines: 107
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/thinking-capability.ts

## 1. 结论与边界

Claude/Anthropic 兼容线**思考模式能力检测**纯函数（`packages/core/src/providers/thinking-capability.ts:1-13`）：按模型 ID/供应商推断思考协议，供适配器构造请求体时分支。协议背景（`:3-10`）：Claude 4.6+ 的 adaptive thinking 与旧 extended thinking 不兼容；DeepSeek v4 走 Anthropic 兼容端点但用 `output_config.effort` 控制。

## 2. 导出与关键符号

`export` 共 **4 个**（2 type + 1 interface + 1 函数）。

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `ThinkingMode` | `:17-27` | 5 值：`adaptive-only`/`adaptive-preferred`/`manual-only`/`effort-based-max`/`none` | 协议能力 |
| `ThinkingDisableStrategy` | `:30-34` | `explicit-disabled`/`omit-field` | 禁用方式 |
| `ThinkingCapability` | `:36-39` | `{mode, disableStrategy}` | 结果 |
| `detectThinkingCapability` | `:61-107` | `(providerType, modelId) => ThinkingCapability` | 唯一逻辑入口 |

内部：`startsWith`（`:44-47`，小写化 + 精确/前缀- 匹配，容忍 `-latest` 等后缀）。

## 3. 内部逻辑与关键流程

判定顺序（`:67-106`，先命中先返回）：

1. `modelId` 以 `deepseek-v4` 开头 → `effort-based-max` + `explicit-disabled`（`:67-69`）。**按模型 ID 优先**的理由（`:53-55` 注释）：历史遗留渠道 providerType 是 `anthropic`，只靠 providerType 会误落 manual-only，导致思考关闭时不发 thinking 而 DeepSeek v4 默认开思考报「thinking must be passed back」。
2. `providerType==='deepseek'`（其它模型）→ `manual-only` + `explicit-disabled`（`:72-74`）。
3. `kimi-api`/`kimi-coding`/`zhipu-coding`/`minimax` → `none` + `omit-field`（`:78-80`，兼容差异直接省略保连接）。
4. 非 `anthropic`/`anthropic-compatible` → `manual-only` + `explicit-disabled`（`:83-85`）。
5. `claude-mythos-preview` → `adaptive-only` + `omit-field`（不接受 disabled，`:88-90`）。
6. `claude-opus-4-7` → `adaptive-only` + `explicit-disabled`（`:93-95`）。
7. `claude-opus-4-6`/`claude-sonnet-4-6` → `adaptive-preferred` + `explicit-disabled`（`:98-103`）。
8. 其余 Claude（4.5 及以下/3.x）→ `manual-only` + `explicit-disabled`（`:106`）。

## 4. 调用者与调用链

- 消费方：Anthropic 兼容适配器（构造请求体分支）；全树检索 `detectThinkingCapability` 的调用在 provider 适配器（`packages/core/src/providers/`）。
- 出向：仅 `ProviderType` 类型（`@profer/shared`）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无状态、无副作用。

## 6. 分支、失败、取消与恢复

8 个判定分支（第 3 节）；无异常抛出——任意输入都有返回（末路 `manual-only`）。

## 7. 权限与权威状态

无身份语义；输出只是请求体构造提示。`omit-field` 与 `explicit-disabled` 的选择直接决定 wire 行为。

## 8. 修改影响面

- 新模型家族接入需在本函数加分支；漏配会走末路 `manual-only`（对 adaptive-only 模型发旧协议会 400，`:5`）。
- `deepseek-v4` 的 ID 优先规则改动会触发历史渠道回归（`:53-55`）。
- 无存储/迁移。

## 9. 测试证据

- 本批 `usage-parsing.test.ts` 不覆盖本模块；全树检索 `detectThinkingCapability` 专属测试文件不在本批 scope（见第 10 节）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、8 分支判定顺序 | 已证实 | `:17-39`、`:67-106` |
| DeepSeek v4 按 ID 优先的历史原因 | 已证实 | `:53-55` 注释 |
| 兜底 `manual-only` 无抛错 | 已证实 | `:106` |
| 适配器消费形态 | 推断 | 注释意图（`:12`）；调用点未列 |
| 专属测试存在性 | 未知 | 本批 3 个 test 文件均不含 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 个导出 | 2 | — | covered |
| 8 判定分支 | 3、6 | `:67-106` | covered |
| `startsWith` | 2、3 | `:44-47` | covered |
| 调用链 | 4 | — | covered |
| 测试证据 | 9 | — | covered |
