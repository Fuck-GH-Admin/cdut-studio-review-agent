---
path: apps/electron/scripts/agent-session-smoke.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dba21010cced79cbf42f6e11fb9ce2b27edb8a6d
sha256: 258fa2fa9c08478887df0f1e1cb134141f8e598926a2c07f6a3f9ff04afa926a
lines: 362
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/agent-session-smoke.ts

## 1. 结论与边界

Agent 会话端到端冒烟脚本（362 行，esbuild 打包后由真实 Electron 主进程执行）：走真实 agent-preset-manager / agent-session-manager / orchestrator 链路，验证「预设创建 → 绑定会话 → 运行时生效 → 会话内 preset 工具调用」，并附解密环境自检、派生预设合并自检（B2-2）、单工具裁剪自检（B2-3）（`apps/electron/scripts/agent-session-smoke.ts:1-20`）。默认进入候选渠道探测模式，首个认证通过的渠道跑完整流程。边界：不覆盖 UI/IPC 层；判定以 onError 有无为准（`:300-301`）；这是手动运维资产，不接 npm script（检索见 §4）。

## 2. 导出与关键符号

无导出（CLI 入口脚本，esbuild bundle 后由 electron.exe 直接执行）。参数：`--probe-only`（只跑解密自检不发模型调用，`:192-196`）、`--claude`（Claude runtime 候选前置排序，`:209-214`）。

内部符号：
- 常量 `LOG_FILE`（`:33`，`join(__dirname,'smoke.log')`——bundle 同目录，按 `:15` 启动方式即 `scripts/.smoke/smoke.log`）、`OVERALL_TIMEOUT_MS`（`:44`，8 分钟）、`FALLBACK_CANDIDATES`（内部，`:54-59`，4 个候选渠道含 DeepSeek/newapi-8/newapi-5/Claude 特价）。
- 类型 `Candidate`（内部接口，`:46-51`：label/channelId/runtime/modelId）。
- `runTurn(input, label)`（内部，`:62-85`）：包一次 `runAgentHeadless`，onError/onComplete/异常都 resolve `{ finalText, error? }`，不 reject。
- `extractFinalText(message)`（内部，`:87-98`）：从 assistant 消息 content 数组拼接 text 块或取字符串。
- `countToolUses(transcript)`（内部，`:101-118`）：逐行 JSON.parse transcript，严格统计 `tool_use|toolUse|toolCall` 块的工具名计数。
- `readTranscript(sessionId)`（内部，`:120-141`）：meta 的 piSessionFile/sdkSessionFile → 兜底扫 `~/.profer-dev/sdk-config/sessions/pi/`。
- `presetTurnPrompt(runtime)`（内部，`:143-147`）：按 runtime 生成 `preset_list`/`preset_create`（Pi 侧为 `mcp__agent-presets__*`）指令。
- `main()`（内部，`:149-351`）：主流程；`watchdog`（`:353-356`）超时 `app.exit(2)`；`main().catch`（`:358-362`）失败 `app.exit(1)`。

## 3. 内部逻辑与关键流程

1. 文件日志初始化（`:32-42`）：`writeFileSync(LOG_FILE,'')` 清空（失败忽略）；monkey-patch `console.log/error` 双写到 smoke.log；`process.on('exit')` 记退出码。状态变化：全局 console 被替换。
2. `main()` 启动（`:149-159`）：`app.setName('profer-dev')`、`app.setPath('userData', %APPDATA%\@profer\electron-dev)`（`:156-157`，脚本硬编码的遗留 profile 身份）、`await app.whenReady()`——脚本注释声称 Electron 43 app-bound safeStorage 解密需「与 dev 应用一致才能解出渠道密钥」，但按 05fb 源码 dev 应用身份已切换为 `cdutai-dev`/`@cdutai/electron-dev`（`apps/electron/src/main/index.ts:47-48` → `apps/electron/src/main/lib/dev-instance.ts` `resolveDevAppName`/`resolveDevUserDataPath`，`DEFAULT_DEV_USER_DATA_DIR='@cdutai/electron-dev'` `:3`），且 `index.ts:53` 注明品牌已切换、不读 `@profer` 遗留数据——smoke 的 profer-dev/@profer/electron-dev 身份与现行 dev 应用身份脱节，「与 dev 应用一致」属过期注释声称（不证实，实际密钥可解性 NOT_RUN）。
3. 解密诊断（`:161-189`）：打印 `safeStorage.isEncryptionAvailable()`/backend/appPath/userData/execPath；`encryptString→decryptString` 往返自检；动态 import `getChannelsPath`（`src/main/lib/config-paths.ts:97`）读 channels.json 中默认渠道 apiKey 存量密文并直接 `decryptString`，全部只打印长度/前缀，不落盘密钥。
4. `--probe-only` 短路（`:192-196`）：`app.exit(0)`。
5. 候选队列（`:204-214`）：默认渠道 + FALLBACK_CANDIDATES 过滤空 channelId/modelId；`--claude` 时按 runtime 稳定排序把 claude 候选前置。
6. ① 预设创建（`:216-227`）：`createAgentPreset(workspaceSlug, …)` 建「冒烟验证预设」，记 `smokePresetId`。
7. ①.5 派生合并自检（`:229-255`）：`createAgentPreset(… basePresetId:'minimal', disabledToolGroups:['automation'])` → `getAgentPreset` 解析，校验 suppress 数=4、工具组=基座∪automation、提示词含「极简模式」→ `derivedMergeOk`；随后 `deleteAgentPreset` 清理；异常仅打印。
8. ①.6 单工具裁剪自检（`:257-275`）：动态 import `@earendil-works/pi-coding-agent` 与 `buildPiBuiltinTools`（`src/main/lib/adapters/pi-builtin-tools.ts:2046`），`disabledTools:['proma_task_create']` 后断言 `proma_task_create` 被过滤且 `proma_task_update` 保留 → `toolFilterOk`。
9. ② 候选循环（`:283-317`）：每候选 `createAgentSession('冒烟测试', …)` 建会话 → `runTurn` 跑第一轮（prompt=§2 的 preset 工具指令，`permissionModeOverride:'bypassPermissions'`、`triggeredBy:'automation'`）；`run1.error` 存在则 `continue` 下一候选；成功则记 `working`、经 `countToolUses(readTranscript(session.id))` 打印工具调用取证后 `break`。
10. ⑤ 汇总与清理（`:319-350`）：打印生效渠道/会话 meta.presetId/预设列表/第一轮回复前 400 字；删除会话内创建的「冒烟验证」预设与 `smokePresetId` 预设（会话保留）；判定 `ok = working && run1 && !run1.error && presetChecksOk`（无工作区时自检视为通过，`:345-346`）→ `app.exit(ok ? 0 : 1)`。

## 4. 调用者与调用链

- 入向：无自动调用点。全树 grep（工具：ripgrep，pattern `agent-session-smoke`）命中仅：本文件注释（`:14-19` 用法）、`docs/plans/2026-08-16-agent-preset-phase-b-plan.md:16,46,62,69`、`docs/plans/2026-08-16-session-handoff.md:22,40`（文档说明手动执行：esbuild 打包 `scripts/.smoke/agent-session-smoke.cjs` 后 electron.exe 启动）、`.gitignore:8`（注释提及本脚本 --outfile 目录，非调用点）。无 package.json script、无 CI 调用（`.github/workflows` grep 无命中）。
- 出向（imports + 关键调用）：`electron`（app/safeStorage）；`../src/main/lib/settings-service`（getSettings，`settings-service.ts:45`）；`agent-workspace-manager`（getAgentWorkspace，`:185`）；`agent-session-manager`（createAgentSession `:552`/getAgentSessionMeta `:469`）；`agent-preset-manager`（createAgentPreset `:1174`/listAgentPresets `:252`/deleteAgentPreset `:1325`/getAgentPreset `:389`）；`agent-service`（runAgentHeadless，`agent-service.ts:404`）；`@profer/shared`（BUILTIN_AGENT_PRESETS）；`config-paths`（getChannelsPath `:97`）；`adapters/pi-builtin-tools`（buildPiBuiltinTools `:2046`）；`@earendil-works/pi-coding-agent`（动态 import）。

## 5. 数据 I/O、读写与副作用

- 写：`smoke.log`（bundle 同目录=按 `:15` 启动方式为 `scripts/.smoke/smoke.log`；appendFileSync 全程日志，`:33-37`）；经 manager 真实落盘预设（workspace preset 存储）与会话记录；清理阶段删除预设（会话保留）。
- 读：channels.json（getChannelsPath）存量密文、transcript JSONL（piSessionFile/sdkSessionFile 或 `~/.profer-dev/sdk-config/sessions/pi/*.jsonl`，`:127-139`）。
- 网络：真实模型调用（runAgentHeadless → 渠道 API）。密钥仅在内存解密，明确不写盘（`:176-186` 只打长度/前缀）。
- 全局状态：替换 `console.log/error`、注册 `process.on('exit')`、修改 `app.name`/`userData` 路径（`:38-42, 156-157`）。无锁；清理幂等（删不存在的预设被 try/catch 吞，`:337-342`）。
- 副作用：进程退出码 0/1/2 作为 PASS/FAIL/超时信号；watchdog 8 分钟强制 `app.exit(2)`（`:353-356`）。

## 6. 分支、失败、取消与恢复

- 短路：`--probe-only` → exit 0（`:192-196`）。
- 候选失败分支：`run1.error` → 打印「候选 … 失败，尝试下一个」→ continue（`:302-305`）；全部失败时 `working` 为空 → 汇总打印「（全部失败）」→ ok=false → exit 1。
- runTurn 不抛：onError/异常都转 `error` 字段（`:67-83`）；`countToolUses` JSON.parse 失败跳行（`:106`）；`readTranscript` 目录缺失吞异常返回 ''（`:139-140`）。
- 自检异常：①.5/①.6 各自 try/catch 仅打印，对应 flag 保持 false；有工作区时计入判定失败（`:345-347`）。
- 顶层失败：`main().catch` 打印「[冒烟] 失败:」→ clearTimeout → exit 1（`:358-362`）；超时 watchdog exit 2。
- 恢复：无自动重试（候选探测即重试机制）；预设清理尽力而为，失败不阻塞。

## 7. 权限与权威状态

无 sender/role 检查，依据：本文件无 IPC/权限校验代码。会话以 `permissionModeOverride:'bypassPermissions'` 运行（`:295`），属冒烟资产的显式提权；渠道密钥权威 = safeStorage app-bound 解密（`:150-155` 注释锁定身份三要素：`.bun` 规范 exe 路径、appPath=apps/electron、userData=@profer/electron-dev，且 dev 应用须先退出避免 profile 单例锁）；该 userData=@profer/electron-dev 为脚本硬编码的**遗留 profile 身份**，与现行 dev 应用身份 `@cdutai/electron-dev`（`dev-instance.ts:3`）不一致，注释所引 `index.ts:12`/`:64` 为品牌切换前的过期行号声称（详见 §3 第 2 步）——身份三要素按脚本自述记录，不作权威事实。

## 8. 修改影响面

- 冒烟资产本体（手动取证流程）；`docs/plans/2026-08-16-agent-preset-phase-b-plan.md:62` 将其列为行为改动的取证手段。
- 依赖面：agent-preset-manager 合并语义（B2-2 判定 hardcode suppress 数=4，`:246`，基座定义变动会致自检失配）、pi-builtin-tools 过滤语义（B2-3）、runAgentHeadless 回调契约、transcript JSONL 格式（`countToolUses` 兼容三种 tool 块命名，`:111`）。
- 产物：`smoke.log`（bundle 同目录= `scripts/.smoke/smoke.log`，`:33`+`:15`）、`scripts/.smoke/`（esbuild 输出目录，注释 `:15`）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。本文件自身是冒烟脚本而非测试文件，无 `it(/test(` 断言；全树无 *.test.ts 引用本文件（grep `agent-session-smoke` 于 *.test.ts 零命中）。间接证据：`docs/plans/2026-08-16-agent-preset-phase-b-plan.md:69` 记载其在 B2-2/B2-3 取证中的使用（文档自述，非测试断言）。测试断言≠运行，不得写"通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全流程结构、判定式、退出码、清理逻辑 | 已证实 | `apps/electron/scripts/agent-session-smoke.ts:1-362` 全文 |
| 被调 manager/服务符号真实存在（10 个） | 已证实 | §4 所列各 export 行号 |
| 硬编码候选渠道 key 的有效性 | 未知 | 需运行+真实渠道，NOT_RUN |
| suppress 数=4 与当前 minimal 基座一致 | 推断 | 期望值取自 BUILTIN_AGENT_PRESETS 运行时计算（`:243-246`），静态未核对基座定义 |
| transcript 三种 tool 块命名覆盖真实格式 | 推断 | 代码兼容 `tool_use/toolUse/toolCall`（`:111`），实况未取证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 日志 monkey-patch + watchdog | §3/§5 | 32-44, 353-362 | covered |
| main 启动/解密诊断/--probe-only | §3 | 149-196 | covered |
| 候选队列与 --claude 排序 | §3/§6 | 204-214 | covered |
| ① 预设创建 | §3 | 216-227 | covered |
| ①.5 派生合并自检 | §3/§6 | 229-255 | covered |
| ①.6 单工具裁剪自检 | §3/§6 | 257-275 | covered |
| ② 候选循环 + 工具取证 | §3/§6 | 283-317 | covered |
| ⑤ 汇总/清理/判定/exit | §3/§6 | 319-350 | covered |
| runTurn/extractFinalText/countToolUses/readTranscript/presetTurnPrompt | §2/§3 | 62-147 | covered |
