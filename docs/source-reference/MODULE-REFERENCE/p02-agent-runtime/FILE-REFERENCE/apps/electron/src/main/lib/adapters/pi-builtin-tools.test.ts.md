---
path: apps/electron/src/main/lib/adapters/pi-builtin-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b83b5528232751df20902675156e7e9974675f90
sha256: 327b5a8588babe42e4406dec5b19b40356f879f53e2a753ccd6922b3b48ca581
lines: 626
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-builtin-tools.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Pi 内置业务工具桥接注册契约：①preset 变更工具的意图门禁（user 触发/allowedOperations/冻结引用/待确认变更才暴露对应工具、automation/委派触发不暴露、orchestrator 批准 create 到最终工具集）；②memory/planning/task-graph 注册面与 TASK_NOT_FOUND 拒写；③`disabledToolGroups`/`disabledTools` 裁剪（组优先/短名/速课堂/代码模式/十组全关/discover_tools 报告）；④image/preview/PPT/gpt-image/BrowserListTabs 暴露条件。

## 2. 用例清单

共 32 个 `test(`（`:81-607`，无 test.each；两个 describe：`:80` bridges、`:271` pruning）。mock 体系（`:4-49`）：`mock.module` 替换 `memory-archive-search`（node:sqlite 规避）、`chat-tool-config`/`auth-service`/`chat-tools/gpt-image-tool`/`agent-gpt-image-service`（`imageToolAvailable`/`webSearchToolAvailable`/`generatedImageResult` 开关）、`electron` 全家桶最小 mock；`createPiSdkStub` 捕获 `defineTool`（`:66-78`）。

### describe 1 `Pi Profer in-process tool bridges`（`:80`，12 个）

| # | 用例（行） | 关键断言 |
| --- | --- | --- |
| 1 | 无意图只暴露 preset_list（`:81`） | 仅 `preset_list` |
| 2 | create/copy 意图只暴露对应（`:92`） | 各自单工具 |
| 3 | switch 意图+冻结引用（`:118`） | 暴露 `preset_switch_session` |
| 4 | update/default 意图只暴露对应提案工具（`:134`） | |
| 5 | 待确认提案+确认才暴露 commit（`:154`） | |
| 6 | automation/委派/无工作区不暴露变更工具（`:171`） | |
| 7 | 任何意图下未确认高风险变更工具缺席（`:183`） | |
| 8 | orchestrator 批准 create 到最终工具集（`:200`） | `buildPiBuiltinTools` 含 create |
| 9 | 无工作区不暴露个人记忆搜索（`:214`） | |
| 10 | 有工作区暴露只读归档搜索（`:222`） | |
| 11 | planning 暴露 Todo+日历（`:231`） | |
| 12 | task-graph 结构化工具（`:249`） | 暴露结构化任务工具 |
| 12b | TASK_NOT_FOUND 拒写（`:260`） | 未知任务 ID 更新被拒且不建节点 |

### describe 2 `disabledToolGroups pruning`（`:271`，17 个）

组前缀事实表（`:281-288`）：memory/task-graph/automation/collaboration；`baseCtx`（`:290-296`）。

| # | 用例（行） | 关键断言 |
| --- | --- | --- |
| 13 | 工作区会话暴露 send_local_image+inspect_preview（`:298`） | |
| 14 | GPT Image 可用暴露 generate_image 统一 schema+结构化结果（`:317`） | |
| 15 | GPT Image 禁用/无工作区则缺席（`:339`） | |
| 16 | 无工作区保留 inspect_preview 但不授权 home 图片输出（`:350`） | |
| 17 | PPT 能力未激活不注册（`:358`） | |
| 18 | PPT 激活注册（`:369`） | |
| 19 | PPT 激活但 ppt-materials 禁用则缺席（`:386`） | |
| 20 | 无禁用组全注册（`:399`） | 四组 |
| 21 | 逐组禁用只裁该组（`:407`） | |
| 22 | automation 禁用连带 planning（`:424`） | |
| 23 | 速课堂会话裁 browser/automation/collaboration/clipboard/create_skin、学习工具存活（`:431`） | |
| 24 | 逐组单独禁用只裁该组（`:456`） | |
| 25 | 四组全关只剩 preset list（无意图）（`:470`） | |
| 26 | 代码模式关非开发组、研究与图片呈现保留（`:480`） | |
| 27 | 十组全关只剩 core+preset（`:514`） | |
| 28 | discover_tools 报告启用状态/已挂载工具/category 过滤（`:550`） | browser/automation `enabled:false`、memory `enabled:true`+mountedTools>0、category 过滤 |
| 29 | disabledTools 短名只裁列出工具（`:582`） | `proma_task_create`/`delegate_agent` 被裁、同组 update/delegate_agents 保留 |
| 30 | 组裁剪优先于单工具（`:595`） | task-graph 前缀全无 + delegate_agent 仍裁 |
| 31 | BrowserListTabs 无会话返回 exists=false 不建标签（`:607`） | description 含 `read-only`；`details` `{exists:false,activeTabId:null,agentTabId:null,tabs:[]}` |

（注：describe1 共 13 条（:81-260 含 :249、:260 两条独立 test），describe2 共 19 条（:298-607），合计 32 条 `test(`。）

## 3. 真实断言

抽样：`names).not.toContain('mcp__task-graph__proma_task_create')`、`expect(names.some((n)=>n.startsWith('mcp__task-graph__'))).toBe(false)`（`:582-605`）；discover 细节（`:555-579`）；BrowserListTabs 细节（`:613-625`）。mock 边界：Electron/记忆/图片/搜索全 mock，**工具注册/裁剪/discover 逻辑为真实实现**；无真实网络/磁盘。

## 4. 未覆盖与脆弱点

未覆盖：工具 execute 的业务端到端（planning/automation/cdut/browser 真实执行）、`buildPiCdutTools`/`buildProferCloudTools`/`InstallWindowsShell` 注册条件、`filterDisabledTools` 的 shared 实现。mock 与真实主进程差异可能掩盖 Electron 行为。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 32 个测试声明 | 已证实 | `grep -c "  test(" = 32`；`:81-607` |
| preset 意图门禁 | 已证实 | `:81-212` |
| 组/单工具裁剪叠加 | 已证实 | `:399-605` |
| discover_tools 报告契约 | 已证实 | `:550-580` |
| BrowserListTabs 只读契约 | 已证实 | `:607-625` |
| 真实业务执行 | 未知 | 全 mock |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| preset 门禁 | 1-8 | 81-212 | covered |
| memory/planning/task-graph | 9-12b | 214-269 | covered |
| 组裁剪/速课堂/代码模式 | 13-27 | 298-548 | covered |
| discover/单工具/浏览器契约 | 28-31 | 550-625 | covered |
| cdut/cloud/installer 注册 | 无 | — | unknown |
