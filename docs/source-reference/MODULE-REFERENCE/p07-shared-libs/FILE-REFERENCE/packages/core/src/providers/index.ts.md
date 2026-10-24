---
path: packages/core/src/providers/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba89bcf6b6e9cd1e27135de843aeac664f2c33c4
sha256: d3a540188905214927b7e835e37b14319a26b364c6fbd494a64a6712bbda4f6a
lines: 64
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/index.ts

## 1. 结论与边界

Provider 适配器**注册表**：`ProviderType → 适配器工厂` 映射 + `getAdapter` 查找 + 集中再导出（`providers/index.ts:1-6`）。边界：4 个适配器实现与 `sse-reader/url-utils/thinking-capability/user-agent/types` 均**不在本批 scope**（他批主责），本手册只证注册表与导出面。

## 2. 导出与关键符号

`export` 逐条核：6 条 `export *`（`:16-21`：types/sse-reader/url-utils/thinking-capability/user-agent/insufficient-credits）+ 4 个适配器类再导出（`:24-27`）+ 1 个导出函数 `getAdapter`（`:58`）+ 模块私有 `adapterRegistry`（`:30`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `adapterRegistry`（内部） | `Map<ProviderType, () => ProviderAdapter>` | `:30-49` | **18 键** | 工厂每次 `new` 新实例（无共享状态） |
| `getAdapter` | 导出函数 | `:58` | `(provider: ProviderType): ProviderAdapter` | 未注册键抛错（商业版文案，`:61`） |

18 键映射（`:31-48`，已逐条核）：`anthropic`/`anthropic-compatible`（带协议串）/`kimi-api`/`kimi-coding`/`zhipu-coding`/`minimax`/`xiaomi`/`xiaomi-token-plan` → `AnthropicAdapter`；`openai`/`deepseek`（带 'deepseek'）/`zhipu`/`ollama`（带 'ollama'）/`doubao`/`qwen`/`custom` → `OpenAIAdapter`；`openai-responses`（无参）/`xai`（带 'xai'）→ `OpenAIResponsesAdapter`；`google` → `GoogleAdapter`。

## 3. 内部逻辑与关键流程

`getAdapter`（`:58-64`）：`adapterRegistry.get(provider)`；未命中 **throw** `不支持的供应商: ${provider}。你可能过去使用的是 Profer 商业版，请重新下载商业版覆盖安装，当前版本为开源版本。`（`:61`）；命中返回 `createAdapter()` **新实例**（`:63`）。

## 4. 调用者与调用链

- 入向（生产 6 处，grep 全树）：`conversation-title-service.ts`、`lightweight-completion.ts`、`agent-orchestrator.ts`、`cdut/cdut-ai-class-manager.ts`、`cdut/yanhu/yanhu-pi-runtime.ts`、`retrospective-service.ts`（各文件 `getAdapter(` 命中；具体行未逐一摘录=边界）。
- 出向：4 个适配器实现（域外）+ 6 个工具模块再导出（域外）。
- 测试：`providers/index.test.ts` 2 用例（见 §9）。

## 5. 数据 I/O、读写与副作用

无 I/O；无全局可变状态（registry 为 const Map，仅注册期填充）；副作用=创建适配器实例（实例内部状态属各适配器，域外）。

## 6. 分支、失败、取消与恢复

唯一失败分支：未注册键抛错（`:60-62`）；无恢复/取消路径。**注册表 18/23 缺口**（见 §10）：shared `ProviderType` 共 23 值（`packages/shared/src/types/channel.ts:13` 起，行号为 QA 预读证据+本批抽样核对该行存在，未逐值核=边界），缺 `opencode-go-openai`/`zhipu-coding-team`/`ark-coding-plan`/`qwen-anthropic`/`openai-codex` 5 值——`getAdapter` 对这些抛错，调用方需特判/兜底（6 个调用点行为未深读=边界）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/角色检查。

## 8. 修改影响面

增删注册键影响 6 个调用链；适配器工厂改共享实例会破坏"每请求独立实例"契约（§9 测试断言点）；`export *` 面改动影响 `@profer/core` 消费方。

## 9. 测试证据

`NOT_RUN`（未运行）。直接测试 `providers/index.test.ts`（12 行/2 用例）：①`getAdapter('anthropic')` 两次返回**不同实例**（防流式 block 状态跨请求污染，`index.test.ts:5-7`）；②`getAdapter('google')` 同（防工具计数器污染，`index.test.ts:9-11`）。mock 边界：无 mock，真实工厂实例比较（`not.toBe`）。缺口：18 键逐一映射、抛错分支无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 键映射逐条、新实例工厂、抛错文案 | 已证实 | `:30-64` 逐行 |
| 注册表 18/23 缺 5 值 | 已证实（键=本文件逐条；23 值=抽样+QA 预读） | `:30-49` vs `shared/types/channel.ts:13`（该文件未逐值核=边界） |
| 6 个调用点对抛错的处理 | 未知 | 调用点未深读（边界） |
| 适配器实例内部状态隔离 | 推断 | 测试断言 + 工厂 new（实现域外） |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 18 键 registry + getAdapter + 再导出面 | §2/§3 | 16-64 | covered |
| 18/23 缺口 | §6/§10 | — | covered（边界标注） |
| 测试 2 用例 | §9 | index.test.ts | covered（NOT_RUN） |
