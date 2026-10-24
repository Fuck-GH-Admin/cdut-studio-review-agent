---
path: apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6becf17eb5d888e8789762dde649c7d0776fa24c
sha256: f8a53435ab9d6530a25d1f5eeef893e2c94e0a1af8990d0c899098babf91dc72
lines: 108
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.ts

## 1. 结论与边界

Dev-A A26：为 C11 A25 端口构造**真实钉住的 Pi SDK AgentSession**。C Main 解析当前模型/渠道凭据与冻结案卷提示词；每次 A25 物理 SDK dispatch 新建隔离 Pi 会话（非普通聊天会话）（`apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.ts:1-7`）。仅 OpenAI 兼容 SSE 有单请求见证；其它 provider 须真实见证、**绝不伪造完成**（`:8-9`）。

边界：无 Renderer/模型生成的 actor 或 source ID；provider/凭据/工具处理器/提示词/目录全归 C Main（`:25-28`）。不发送请求本身（返回 `V3APiHttpRequestSpec` 交给 HTTP 引擎）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A26MainReviewPiSelection` | interface | 29-35 | `{options:PiAgentQueryOptions; prompt:string; tools:readonly ToolDefinition[]}` | 工具注释：特权 scoped Read/Check/Submit，非普通聊天工具（`:33`） |
| `A26MainReviewPiSelectionPort` | interface | 36-39 | `select(request:Readonly<V3APhysicalTurnInput>):Promise<A26MainReviewPiSelection>` | C Main 解析端口 |
| `A26NativeReviewPiSessionFactory` | class | 44-107 | `implements V3APiHttpSingleRequestFactory`；`create(request):Promise<V3APiHttpRequestSpec>` | 构造 1 参（trustedMain）+构造器校验 `fail('MAIN_MODEL_CHANNEL_NOT_INSTALLED')`（`:47`，select 非函数即拒） |

内部：`fail`（`:41-43`，`C0ContractError('RECOVERY_REQUIRED','A26_PI_'+code)`）。

## 3. 内部逻辑与关键流程

`create`（`:49-107`）顺序：

1. `:50` `request.signal?.aborted` → `CANCELLED_BEFORE_PI_SESSION`（不触碰 select）。
2. `:51-52` `trustedMain.select(request)`；其间 abort → `CANCELLED_DURING_MODEL_SELECTION`。
3. `:53-57` 校验 options：`apiKey` 非空（否则 `EXTERNAL_PROVIDER_NOT_CONFIGURED`）；`model/prompt/systemPrompt/piAgentDir/piSessionDir` 齐全（否则 `MAIN_FROZEN_PI_SELECTION_MISSING`）。
4. `:60-63` 动态 `import('@earendil-works/pi-coding-agent')` + `buildModel(sdk,options)`；`model.api` 不在 `openai-completions/openai-responses` → `PROVIDER_PROTOCOL_NOT_YET_SUPPORTED`（注释 `:58-59`：HTTP 引擎只对这两种有可证单请求见证）。
5. `:64-68` URL 解析失败 → `PROVIDER_URL_NOT_CONFIGURED`；协议非 `https:` 或带用户名/密码 → `PROVIDER_HTTPS_REQUIRED`。
6. `:69` abort → `CANCELLED_DURING_PI_SETUP`；`:70-71` `mkdirSync(piSessionDir,{recursive:true})`（唯一文件系统副作用）。
7. `:72-77` `SettingsManager.inMemory({retry:{enabled:false},compaction:{enabled:false},transport:'sse'})`——注释 `:73`：上游重试会重复物理 Provider 工作，故禁用。
8. `:78-86` `DefaultResourceLoader`（skills/agents 覆写 + `systemPromptOverride`），`await loader.reload()`。
9. `:87-95` `SessionManager.create(cwd, piSessionDir)` + `sdk.createAgentSession({…,thinkingLevel:options.thinkingLevel??'off',noTools:'builtin',customTools:[...selected.tools]})`；`session.agent.toolExecution='sequential'`。
10. `:96-99` abort → `session.dispose()` + `CANCELLED_AFTER_PI_SESSION_CREATION`。
11. `:100-106` 返回 `{session, prompt, trustedOrigin:url.origin}`——注释 `:103-104`：A HTTP 见证每次调用核**实际传输 URL** 对该钉住 HTTPS origin（不比模型文本）。

## 4. 调用者与调用链

出向：`node:fs`（mkdirSync）、`@profer/shared`（C0ContractError）、`@earendil-works/pi-coding-agent`（动态 import）、`../adapters/pi-agent-adapter`（PiAgentQueryOptions 类型）、`../adapters/pi-model-registry`（buildModel）、`../adapters/pi-skill-resources`、`../adapters/pi-resource-loader-overrides`、`./review-v3-pi-http-provider-engine`（V3APiHttpSingleRequestFactory）、`./review-v3-sdk-physical-turn-port`（V3APhysicalTurnInput）（`:11-23`）。

入向：`apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:32-34,50,128`（`new A26NativeReviewPiSessionFactory(piMainSelection)`）；测试 `review-v3-a26-native-pi-session-factory.test.ts:7,40,57,70`。产品入口层 0 命中（A 链，检索式=类名/模块名全冻结树）。

## 5. 数据 I/O、读写与副作用

- 磁盘：`mkdirSync(piSessionDir,{recursive:true})`（`:71`）+ `SessionManager.create` 会话目录写入（Pi SDK 行为，实现不在本批）。
- 网络：本文件不发请求；`trustedOrigin` 供下游 HTTP 引擎做传输校验。
- 内存：Pi SDK session 对象（`createAgentSession`）。
- 幂等：每次 `create` 新建独立会话（每次 dispatch 隔离，`:5-6`）；aborted 时 dispose 防泄漏（`:96-98`）。

## 6. 分支、失败、取消与恢复

- 失败统一抛 `C0ContractError('RECOVERY_REQUIRED','A26_PI_<CODE>')`，CODE 9 种（§3 各步）。
- 取消检查 4 处（`:50,52,69,96`），覆盖 select 前/中、setup 中、创建后；创建后取消会 `dispose()`。
- 恢复：RECOVERY_REQUIRED 由上层重建；不自动重试（retry 被显式禁用，`:73-74`）。

## 7. 权限与权威状态

无 sender/role 检查（依据：全文无 assertAuthorized/actor）；信任来自注入的 `A26MainReviewPiSelectionPort`（C Main 所有，`:25-28` 注释）。安全约束：HTTPS 强制 + 禁 URL 用户名密码（`:67-68`）；`trustedOrigin` 钉住传输源（`:100-105`）；`noTools:'builtin'` + customTools 限权（`:92-93`）。

## 8. 修改影响面

改 API 白名单/HTTPS 校验 → 影响 A25 真实 Pi dispatch 链与 `review-v3-a26-native-pi-session-factory.test.ts` 三用例；`SettingsManager` 的 retry/compaction 禁用是防重复物理副作用的关键（放开需重新评估 A23 不重试约定）；`trustedOrigin` 形状影响 `review-v3-pi-http-provider-engine` 的传输见证。

## 9. 测试证据

直接测试 `review-v3-a26-native-pi-session-factory.test.ts`（78 行，`it(` 3 个）：A26-01 真实构造（tmp 目录、`spec.trustedOrigin==='https://test-provider.invalid'`、prompt 含 'frozen local candidate'、`agent.state.model?.id==='gpt-4o-mini'`、`isStreaming===false`、dispose）；A26-02 `apiKey:''` → `rejects.toThrow('EXTERNAL_PROVIDER_NOT_CONFIGURED')`；A26-03 已取消请求 `rejects.toThrow('CANCELLED_BEFORE_PI_SESSION')` 且 `selected===0`（不读模型选择）。fixture `modelOptions` 用 `as unknown as PiAgentQueryOptions` 强转（mock 边界：test-provider.invalid 不发起真实网络；NOT_RUN 未验证是否绝对无网络）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 openai-completions/responses 放行 | 已证实 | `:62-63` |
| HTTPS+无凭据 URL 强制 | 已证实 | `:64-68` |
| 4 处取消检查 + 创建后 dispose | 已证实 | `:50,52,69,96-98` |
| retry/compaction 显式禁用 | 已证实 | `:72-77` |
| `trustedOrigin` 传输级钉住 | 已证实 | `:100-105` |
| 仅 A25/测试调用 | 已证实（否定结论，检索范围=类名+模块名全冻结树） | grep |
| `buildModel` 对其它 api 的判定细节 | 未知 | pi-model-registry 不在本批 |
| SessionManager 磁盘布局 | 未知 | Pi SDK 实现未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 interface + class | §2 | 29-48 | covered |
| `create` 11 步/9 错误码 + 构造器 `MAIN_MODEL_CHANNEL_NOT_INSTALLED`（`:47`） | §3, §6 | 47-107 | covered |
| 取消 4 点 | §6 | 50-98 | covered |
| buildModel/api 判定 | §10 | 60-63 | partial（依赖批外） |
