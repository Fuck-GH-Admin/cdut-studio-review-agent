---
path: apps/electron/src/main/lib/agent-orchestrator-p0-guards.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc2564b72f843924ac4e946fc66153560d818a5e
sha256: 19ff7037f919d3f92084ef393fbcc131978e790e93bfef3a5d667d57b79669d8
lines: 152
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-orchestrator-p0-guards.ts

## 1. 结论与边界

AgentOrchestrator 的 **P0 防护纯函数集**：运行互斥/队列消息去重/凭证注入隔离/Pi 流式预览过滤/Plan 模式只读判定/xAI 预检/浏览器工具权限/skill mentions 选项（`agent-orchestrator-p0-guards.ts` 全文）。全部纯函数+1 常量集合+1 类，无 I/O（凭证只注入入参 env）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentRunAlreadyActiveError` | 类 | `:8` | `code='AGENT_RUN_ALREADY_ACTIVE'`，构造参数 `stopping` | 文案二态：“正在停止”/“上一条消息仍在处理中”（`:12`） |
| `tryAcquireActiveSession` | 函数 | `:18` | `(Map, sessionId, runToken): boolean` | 任意 await 前原子占用（`:17`） |
| `releaseActiveSession` | 函数 | `:25` | 同上 → boolean | **仅当前 token 可释放**，防旧 finally 清新运行（`:24-28`） |
| `tryReserveQueuedMessage` | 函数 | `:35` | `(Set, uuid): boolean` | 队列消息 UUID 去重（`:31-38`） |
| `shouldPreInterruptQueuedMessage` | 函数 | `:42` | `(runtime, interrupt): boolean` | Pi 自建 reservation 再 abort，不预 interrupt（`:41-43`） |
| `isXaiChannelAvailableForRuntime` | 函数 | `:56` | `(channel, runtime): boolean` | xAI 只服务 Pi 内核（`:60-61`）；非 xAI 恒 true（`:60`） |
| `isPlanModeMarkdownPath` | 函数 | `:65` | `(agentCwd, filePath): boolean` | 仅 `.context/plan` 内 `.md`（`:66-73`） |
| `applySdkCredentials` | 函数 | `:80` | `(sdkEnv, apiKey, baseUrl, provider, forceBearerAuth=false): void` | **只写 query env 不碰 process.env**（`:76-79` 注释）；baseUrl 非默认才写 `ANTHROPIC_BASE_URL`（`:88-90`） |
| `isPartialSDKMessage` | 函数 | `:94` | `(message): boolean` | `_partial===true` 不入历史（`:93`） |
| `isPlanModeMcpTool` | 函数 | `:99` | `(toolName): boolean` | `mcp__` 前缀 Plan 模式拒（`:98-100`） |
| `isBrowserToolName` | 函数 | `:104` | `(toolName): boolean` | 规范名 `Browser*` 前缀 |
| `PLAN_MODE_READ_ONLY_BROWSER_TOOLS` | 常量集合 | `:114` | 5 项（Observe/Extract/Screenshot/ListTabs/PreviewOpen） | 唯一事实源（`:110-112`） |
| `BrowserToolPermissionDecision` | 接口 | `:123` | resolvePlanModeBrowserPermission 返回类型 |
| `resolvePlanModeBrowserPermission` | 函数 | `:135` | `(toolName): BrowserToolPermissionDecision` | 白名单 allow，否则 deny 文案“计划模式下只能观察受管浏览器…”（`:137-140`） |
| `buildPiSkillMentionOptions` | 函数 | `:150` | `(allowedSkillSlugs): {skillMentions?: string[]}` | 空数组不产字段（`:147-148`） |

## 3. 内部逻辑与关键流程

见 §2 各行要点。补充：`isPlanModeMarkdownPath` 用 `relative()` 四重防逃逸（`:69-72`，win32 分隔符特判）；`isXaiChannelAvailableForRuntime` 的设计动机长注释（`:47-54`）：旧判据 `isAgentEnabledForChannel` 语义收敛为“Claude 内核”会使 xAI+Pi 永久无法启动（deprecated 别名问题）。

## 4. 调用者与调用链

- 入向：`agent-orchestrator`（域外，grep）；测试 `agent-orchestrator-p0-guards.test.ts` 24 用例。
- 出向：`@profer/shared`（canonicalAgentToolName/isChannelEnabledForRuntime/supports1MContext 类）、`@profer/core`（normalizeAnthropicBaseUrlForSdk `:4`）、`./agent-sdk-auth-env`（applyAgentSdkAuthEnv `:5`，域外）。

## 5. 数据 I/O、读写与副作用

`applySdkCredentials` 仅改传入 `sdkEnv` 对象（测试断言 `process.env` 不变）；其余纯函数。无 I/O。

## 6. 分支、失败、取消与恢复

各判定分支（§2）；无抛错路径（除 `AgentRunAlreadyActiveError` 由调用方构造抛出）；无取消机制。

## 7. 权限与权威状态

- Plan 模式权威：Markdown 路径白名单（`.context/plan`）、MCP 全拒、浏览器只读白名单（唯一事实源 `:110-112`）。
- 凭证安全：query env 隔离（不污染 process.env）。
- 运行互斥：activeSessions Map + runToken。

## 8. 修改影响面

被 agent-orchestrator 编排层消费；浏览器白名单同时供单测使用（防漂移，`:111`）；`resolvePlanModeBrowserPermission` 调用点必须在通用权限 switch 之前（注释 `:131-133`：曾有不可达代码缺陷）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-orchestrator-p0-guards.test.ts`（212 行/**24 个 `test(`**，机械 grep 核）：错误类文案/码（`:21-28`）；tryAcquire 拒绝并保留原令牌（`:30-36`）；释放后可再占用（`:38-44`）；旧令牌释放不清新运行（`:46-51`）；UUID 预留一次/释放后可重试（`:53-68`）；Pi pre-interrupt 恒 false（`:70-73`）；凭证仅入 query env 且 process.env 不变（`:75-86`，BASE_URL 归一 `https://gateway.example`）；partial 消息识别（`:88-91`）；Plan Markdown 路径允许/拒绝（`:94-97`）；mcp__ 拒（`:98-101`）；Browser 名判定+白名单 5 项+其余 deny 文案（`:104-117`）；skillMentions 空/非空（`:118-125`）；xAI 组 6 用例（`:178-211`，enabled:false 拒、Pi 资格、非 xAI 不拦、回归 `isAgentEnabledForChannel(xai)=true`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 导出对象（14 函数/类/常量+1 接口）语义、Plan 白名单、env 隔离 | 已证实 | `:1-152` 逐行 + 24 测试互证 |
| 旧判据 deprecated 别名语义（isAgentEnabledForChannel=Claude 内核） | 推断+测试互证 | `:47-54` 注释 + `:209` 断言 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出对象 | §2/§3 | 1-152 | covered |
| 测试 24 用例 | §9 | test 文件 | covered（NOT_RUN） |
