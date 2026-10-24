---
path: apps/electron/src/renderer/lib/channel-model-discovery.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3a9c1a3df13e67aefc5080f62a3409d5ebc6e0e
sha256: 7143dedfcd68ec0db2442aaa6d014422c375474d6f7cea2dcc2de139f909e631
lines: 71
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-model-discovery.ts

## 1. 结论与边界

渠道远端模型发现的纯函数决策层（71 行）：`applyModelDiscoveryResult` 把一次远端发现结果安全合并进当前配置（失败绝不当权威空列表，防 auto-save 清空用户模型，`apps/electron/src/renderer/lib/channel-model-discovery.ts:6-8`）；`buildModelDiscoveryAttemptKey`/`shouldAutoDiscoverModels` 负责自动拉取的幂等键与门控。边界：不发请求（IPC 调用在调用方）、无状态、无权限逻辑；渠道不预置模型，清单来自端点（`apps/electron/src/renderer/lib/channel-model-discovery.ts:49`）。

## 2. 导出与关键符号

- 函数导出 3 个：`applyModelDiscoveryResult(current, result)`（`apps/electron/src/renderer/lib/channel-model-discovery.ts:9`）、`buildModelDiscoveryAttemptKey(input)`（`:38`）、`shouldAutoDiscoverModels(input)`（`:52`）。
- 类型导出 0 个、常量导出 0 个（参数对象类型均内联）。合计导出 3 个符号，与源码逐条一致。
- 关键内部符号：`discoveredById` Map（`apps/electron/src/renderer/lib/channel-model-discovery.ts:15`，"内部"）、`locallyConfigured` 过滤（`:18-20`，"内部"）。

## 3. 内部逻辑与关键流程

- `applyModelDiscoveryResult`（`apps/electron/src/renderer/lib/channel-model-discovery.ts:9-35`）：(1) `!result.success` 返回原 `current` 引用短路（`:13`）；(2) 发现清单按 id 建 Map（`:15`）；(3) 保留本地配置：`source !== 'fetched'` 且未被远端发现的旧模型（含无 source 的历史配置）原样保留（`:18-20`）；(4) 远端模型逐个映射：继承旧 `enabled`（无旧条目默认 false，`:26`）、显式保留用户 `context1m` 勾选（`:29`）、`source` 置 `'fetched'`（`:30`）；(5) 返回 `[...locallyConfigured, ...refreshedModels]`（`:34`）。
- `buildModelDiscoveryAttemptKey`（`:38-44`）：拼接 `provider|baseUrl.trim()|apiKey.trim()`（`:43`），（baseUrl/apiKey 的）首尾空白不改变键；`provider` 原样拼接不 trim（`ChannelForm.tsx:526` 直传）。
- `shouldAutoDiscoverModels`（`:52-71`）：先拦截 `awaitingCredentials || userEditedModels`（`:68`），再拦截 `!canDiscover || fetching || modelCount > 0`（`:69`），最后要求 `lastAttemptKey !== attemptKey`（`:70`）。返回布尔，无状态。

## 4. 调用者与调用链

- 入向（冻结树全量 grep）：`apps/electron/src/renderer/components/settings/ChannelForm.tsx:51`（import 三函数）→ `apps/electron/src/renderer/components/settings/ChannelForm.tsx:503`（`applyModelDiscoveryResult` 写回 setModels）、`:514`/`:526`（`buildModelDiscoveryAttemptKey` 构键）、`:527`（`shouldAutoDiscoverModels` 门控自动拉取）。测试 import：`apps/electron/src/renderer/lib/channel-model-discovery.test.ts:3-7`。
- 出向：仅类型导入 `@profer/shared` 的 `ChannelModel`/`FetchModelsResult`（`apps/electron/src/renderer/lib/channel-model-discovery.ts:1`）；网络请求与 IPC 在 ChannelForm 侧完成，无动态调用。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}` 全文（含测试）。

## 5. 数据 I/O、读写与副作用

纯函数模块：无模块级状态/缓存；三个函数均无副作用，`applyModelDiscoveryResult` 不改入参（`:34` 组新数组，`:18-20` filter 出新数组）。无 DOM/剪贴板/localStorage/Worker/IPC 读写。

## 6. 分支、失败、取消与恢复

- 失败恢复：`result.success === false` 原样返回 `current`（`apps/electron/src/renderer/lib/channel-model-discovery.ts:13`），失败绝不视为权威空列表。
- 空发现清单：success 且 `models: []` 时 `locallyConfigured` 保留全部非 fetched 模型，fetched 旧模型被移除（`:18-20` 与 `:34` 组合语义）。
- 门控短路顺序见 §3；`attemptKey` 相同即视为已尝试（`:70`），错误凭证不反复打点。
- 无 throw、无异步、无取消概念（本文件不适用，依据：全文无 Promise/AbortSignal/定时器）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态约定：远端发现只是补充来源，本地配置与用户显式设置（`enabled`、`context1m`）优先（`apps/electron/src/renderer/lib/channel-model-discovery.ts:16-17,27-28` 注释）；凭证就绪与否由 `awaitingCredentials` 入参表达，凭证本身不经手本文件。

## 8. 修改影响面

- `apps/electron/src/renderer/components/settings/ChannelForm.tsx:503` 的模型列表状态与编辑模式 auto-save 落盘内容；`:527` 的自动发现触发（网络打点频率）。
- 改 `:18-20` 保留规则会直接影响旧配置兼容性；改 `:26`/`:29` 会洗掉用户 enabled/1M 勾选。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/channel-model-discovery.test.ts`（本批次内）：机械计数 `test(` = 10、`it(` = 0。真实断言：`apps/electron/src/renderer/lib/channel-model-discovery.test.ts:25`（失败时 `toBe(configured)` 同引用）、`:39-43`（成功合并三模型精确列表）、`:57-61`（context1m 保留）、`:67-68`（trim 后键相等）、`:74-75`（换地址/换 Key 键不等）、`:91`/`:95`/`:99`/`:103-104`/`:108-109`（门控各分支 true/false）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 失败原样返回、成功合并语义、键构造 | 已证实 | `apps/electron/src/renderer/lib/channel-model-discovery.ts:9-44` |
| 门控 6 个布尔入参的短路顺序 | 已证实 | `apps/electron/src/renderer/lib/channel-model-discovery.ts:68-70` |
| 无 source 历史模型在成功刷新下保留 | 已证实 | `apps/electron/src/renderer/lib/channel-model-discovery.ts:18-20`（测试 :20 的无 source 条目仅在失败路径断言，见 §11 partial） |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `applyModelDiscoveryResult` 失败短路 | §3,§6,§9 | `channel-model-discovery.ts:13` | covered |
| 成功合并 + enabled 继承 | §3,§9 | `channel-model-discovery.ts:22-34` | covered |
| context1m 保留 | §3,§9 | `channel-model-discovery.ts:29` | covered |
| 无 source 历史模型保留（成功路径） | §3,§10 | `channel-model-discovery.ts:18-20` | partial |
| `buildModelDiscoveryAttemptKey` | §3,§9 | `channel-model-discovery.ts:38-44` | covered |
| `shouldAutoDiscoverModels` 全分支 | §3,§9 | `channel-model-discovery.ts:68-70` | covered |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
