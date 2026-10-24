---
path: packages/shared/src/constants/permission-rules.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5490cd1f2b5255925204b603557b65b09ad81676
sha256: 6ad55114a5664c67393e5a99196133961a95a95eb3d6502275342909d00f1fb3
lines: 201
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/permission-rules.ts

## 1. 结论与边界

Agent 权限系统的**工具分类规则数据与纯判定函数**：安全工具白名单（`SAFE_TOOLS`）、安全 Bash/PowerShell 命令模式、危险命令前缀、CSLab 工具分级、可执行文件后缀集合（CVE-2026-96951 防御）。用于智能模式下的自动允许/询问判断（`packages/shared/src/constants/permission-rules.ts:1-6`）。全部纯函数+常量，无 I/O。

边界：

- 本文件只回答「这个工具/命令/路径**看起来**是否安全」；真正的放行/拒绝/弹窗由消费方执行（`apps/electron/src/main/lib/agent-permission-service.ts` 等，见 §4/§7）。
- 不解析 shell AST——危险结构检测是简单正则（`:120-121` 注释自认 MVP）。
- `isPotentiallyExecutableFile` 是纯字符串后缀判断，不做内容嗅探（`:192-194`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `canonicalAgentToolName` | function | 9-12 | `(toolName: string) => string` | `trim` 后取 `split('__').at(-1)`，兼容 Claude MCP 命名空间（`mcp__browser__X` → `X`） |
| `isCanonicalAgentTool` | function | 15-17 | `(toolName, canonicalName) => boolean` | |
| `CSLAB_READ_ONLY_SCIENCE_TOOLS` | const | 22-28 | `readonly string[]`，5 项：`cslab_list_lab_tools`、`cslab_analyze_crystal`、`cslab_simulate_pxrd`、`cslab_fit_peaks`、`cslab_focus_structure` | |
| `isCsLabExecutionTool` | function | 34-37 | `(toolName: string) => boolean` | `startsWith('cslab_') && !CSLAB_READ_ONLY_SCIENCE_TOOLS.includes(name)`（先 trim，`:35`） |
| `SAFE_TOOLS` | const | 40-71 | `readonly string[]` | Read/Glob/Grep/WebSearch/WebFetch、Browser* 13 个、TodoRead/TodoWrite/TaskOutput、cslab 只读科学计算 4 个（不含 `cslab_list_lab_tools`）；注释明示 `AskUserQuestion` 不在此列（`:70`） |
| `SAFE_BASH_PATTERNS` | const | 74-100 | `readonly RegExp[]`，22 条 | 只读命令；注释明示 cat/echo/find 被排除及原因（`:96-99`） |
| `DANGEROUS_COMMANDS` | const | 103-115 | `readonly string[]`，23 项 | 危险前缀（rm/sudo/chmod/mv/dd/kill/git push/…/curl/wget/ssh/scp） |
| `hasDangerousStructure` | function | 123-135 | `(command: string) => boolean` | 管道/重定向/`-exec`/`-delete`/`&&`/独立分号/`$()`/反引号 |
| `isSafeBashCommand` | function | 140-144 | `(command: string) => boolean` | trim → 危险结构先拒 → `SAFE_BASH_PATTERNS.some` |
| `SAFE_POWERSHELL_PATTERNS` | const | 147-155 | `readonly RegExp[]`，7 条 | 仅不读内容、不写、不启进程的元数据查询 |
| `hasDangerousPowerShellStructure` | function | 158-160 | `(command: string) => boolean` | 单条正则 `/[|><;&`{}]|\$\(|\$[A-Za-z_]/` |
| `isSafePowerShellCommand` | function | 162-166 | `(command: string) => boolean` | 同 isSafeBashCommand 结构 |
| `isDangerousCommand` | function | 171-174 | `(command: string) => boolean` | trim+lowercase 后 `startsWith` 任一危险前缀 |
| `DANGEROUS_EXECUTABLE_EXTENSIONS` | const | 183-187 | `ReadonlySet<string>`，22 个后缀 | `.exe .bat .cmd .com .ps1 .vbs .vbe .js .jse .wsf .wsh .hta .scr .pif .reg .msi .msp .cpl .jar` |
| `isPotentiallyExecutableFile` | function | 195-201 | `(filePath: string) => boolean` | 纯字符串：取 basename（`/`/`\` 之后）、最后一个点之后小写匹配；`dot <= 0`（无扩展名/隐藏文件 `.bashrc`）→ false |

导出计数：function 8 + const 6（其中 `DANGEROUS_EXECUTABLE_EXTENSIONS` 为 Set）。无内部符号（`hasDangerousStructure`、`hasDangerousPowerShellStructure` 亦导出）。

## 3. 内部逻辑与关键流程

- `canonicalAgentToolName`（`:9-12`）：`trimmed.split('__').at(-1) ?? trimmed`——无 `__` 时原样；尾随 `__` 会产生空串（静态推断，未见消费方防御）。
- `isCsLabExecutionTool`（`:34-37`）：分类边界是「执行类 = cslab_ 前缀 − 5 个只读白名单」。`cslab_list_lab_tools` 在只读白名单里（`:23`），但**不在** `SAFE_TOOLS`（`:65-69` 只列 4 个科学工具）——即它既非执行类（不硬拦）也非免询问（见 §7 现存口径不对称）。
- `isSafeBashCommand`（`:140-144`）：先 `hasDangerousStructure`（一票拒），再正则白名单。`hasDangerousStructure`（`:123-135`）逐条：`/[|]/`（任意管道）、`/{1,2}/`（任意 `>`）、`\b-exec\b`/`\b-delete\b`、`&&` 或 `;\s*(?=\S)`（引号内分号不做排除，`:130` 注释仅声称意图）、`$\(` 或反引号。
- `isSafePowerShellCommand`（`:162-166`）+ `hasDangerousPowerShellStructure`（`:158-160`）：管道/重定向/`&`/`;`/反引号/`{}`/`$(`/`$var` 全拒。
- `isDangerousCommand`（`:171-174`）：小写前缀匹配——`'mv'` 会命中 `mvn …`、`'su'` 会命中 `sudo/sum/…`、`'git branch -D'` 与 `'git branch -d'` 小写后重复（冗余无害）。前缀语义是已证实行为（`:173` `startsWith`）。
- `isPotentiallyExecutableFile`（`:195-201`）：空串/非字符串 → false；basename 按最后的 `/` 或 `\` 切（`:197`）；`lastIndexOf('.') <= 0` → false（保护 `.exe` 这类隐藏文件名与无扩展名）；扩展名小写后查 Set。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- `apps/electron/src/main/lib/agent-permission-service.ts:21-28,142-158,248-305,426-427`——`canUseTool` 主闸门：子代理分支 `isCsLabExecutionTool` 硬 deny（`:142-148`）、PowerShell 仅 `isSafePowerShellCommand`（`:151-155`）、Bash 查 `isDangerousCommand`/`hasDangerousStructure`（`:156-161`）；`isReadOnlyTool`（`:247-260`）：`SAFE_TOOLS.includes(canonical)` 自动放行、Bash/PowerShell 分别走 `isSafeBashCommand`/`isSafePowerShellCommand`；`isWhitelisted`/`addToWhitelist` 对 Bash/PowerShell 重新做危险语法检查（`:277-284`）、CSLab 执行工具禁止白名单（`:266-267,291-292`）；`buildPermissionRequest` 危险等级标注（`:426-427`）。
- `apps/electron/src/main/lib/agent-orchestrator.ts:40,55,1932,2147-2150`——`isCsLabExecutionTool` 与 plan 模式关系（`:1932`）、`SAFE_TOOLS` 派生 `autoAllowedTools`（`:2147-2150`）。
- `apps/electron/src/main/lib/agent-orchestrator-p0-guards.ts:3,105,136`——`canonicalAgentToolName` 归一 Browser* 工具名。
- `apps/electron/src/main/lib/security/executable-open-guard.ts:17,34`——`isPotentiallyExecutableFile` 是 `shouldConfirmExecutableOpen` 的一环（win32 + 非测试 + 未勾选「不再提醒」，`:26-36`），在 `shell.openPath` 前弹确认（`:42-43`）。
- `apps/electron/src/renderer/components/agent/PermissionBanner.tsx:17,81`——`isCsLabExecutionTool` 决定是否提供「总是允许」（allowAlways = 非执行类）。
- 间接测试：`apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts:2,110-111,147-150`（`canonicalAgentToolName` 的 MCP 命名空间归一、`SAFE_TOOLS` 包含只读白名单子集）。

## 5. 数据 I/O、读写与副作用

无。常量在模块加载时构造（2 个 RegExp 数组、1 个 Set），函数无副作用、无状态。

## 6. 分支、失败、取消与恢复

- 无异常路径：所有函数对任意字符串输入返回布尔/字符串（`isPotentiallyExecutableFile:196` 对非字符串返回 false）。
- 无取消/恢复概念。误判的「恢复」在消费方：询问被拒后可重试（`agent-permission-service.ts:177-187` pendingPermissions 模式）。
- 已知误判面（已证实的前缀/正则语义）：危险前缀 `startsWith` 有假阳性（`mvn`）；`hasDangerousStructure` 的 `;\s*(?=\S)` 对「分号后紧跟空白」不触发（但该命令仍不会匹配安全白名单）；引号内分号不排除（`:130` 注释与实现不完全一致，照实记录）。

## 7. 权限与权威状态

本文件是**被消费的策略数据**，自身无权限分支（无 sender/role 检查）。各消费者的守卫互不替代（按实际消费者列）：

- 子代理（`options.agentID`）：CSLab 执行类硬拒绝、PowerShell 保守只读、Bash 危险结构拦截（`agent-permission-service.ts:140-163`）；无交互通道。
- 主 Agent：会话白名单 → 只读自动放行 → 弹窗人工（`:165-187`）；「总是允许」入白名单时 Bash/PowerShell 仍重查危险语法（`:277-284`）。
- 渲染层 `PermissionBanner.tsx:81` 只影响 UI 是否提供「总是允许」按钮，不是放行权威。
- Windows 打开文件：`executable-open-guard.ts:26-36` 的确认框是 `shell.openPath` 前的唯一防线（CVE-2026-96951）。

**现存口径不对称（照实记录）**：`cslab_list_lab_tools` 被 `isCsLabExecutionTool` 判非执行类（`:36` + `:23`），但不在 `SAFE_TOOLS`（`:65-69`）——经 `isReadOnlyTool`（`agent-permission-service.ts:247-259`）会落到「非 Bash/PowerShell 且不在白名单」→ 返回 false → 走人工询问。注释只解释执行分类（`:31-33`），未解释 SAFE_TOOLS 排除；本批测试也只断言 `isCsLabExecutionTool`（`permission-rules.test.ts:40`），未断言其 SAFE_TOOLS 成员资格（对比 `:38` 对另 4 个工具的双断言）。

## 8. 修改影响面

- 改 `SAFE_TOOLS`：改变自动放行面（`agent-permission-service.ts:252`、`agent-orchestrator.ts:2147-2150` 的 `autoAllowedTools`）；`agent-orchestrator-p0-guards.test.ts:147-150` 的子集断言可能失效。
- 改 Bash/PowerShell 规则：影响 `isReadOnlyTool` 自动放行、子代理限制（`:151-161`）与白名单重查（`:277-284`）。
- 改 `isPotentiallyExecutableFile`/`DANGEROUS_EXECUTABLE_EXTENSIONS`：影响 `executable-open-guard.ts` 的确认弹窗触发面。
- 改 `canonicalAgentToolName`：影响 `agent-orchestrator-p0-guards.ts:105,136` 的工具名归一与白名单匹配。
- 需同步测试：`packages/shared/src/constants/permission-rules.test.ts`（本批）、`apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts`（间接）。

## 9. 测试证据

直接测试 `packages/shared/src/constants/permission-rules.test.ts`（79 行，9 个 `test(`，3 个 `describe`）：

- `describe('PowerShell permission rules')`（3 个）：`:11-17` 元数据查询自动允许（`Get-Location/Get-Date/Get-Process -Name explorer/Get-Command git/Test-Path C:\Windows` → true）；`:19-24` 读内容/变更/组合脚本 → false（`Get-Content $HOME\…`、`Remove-Item`、`Get-Location; Remove-Item`、`Get-Process | Stop-Process`）；`:26-31` `hasDangerousPowerShellStructure` 对 `;`/`|`/`$(...)`/`>` → true。
- `describe('CSLab 科学工具权限分级')`（2 个）：`:35-41` 只读科学工具 `isCsLabExecutionTool===false` 且 `SAFE_TOOLS` 含之（3 个工具双断言；`cslab_list_lab_tools` 仅断言非执行类）；`:43-48` `cslab_render_plot`/`cslab_export_figure` → 执行类 true 且不在 `SAFE_TOOLS`。
- `describe('潜在可执行文件后缀判定')`（4 个）：`:52-59` 6 个 Windows/脚本后缀命中；`:61-64` 大小写不敏感（`VIRUS.EXE`、`run.Cmd`）；`:66-72` 普通文档/目录/空串不命中；`:74-78` `.exe`（点开头）、`.bashrc`、`README` 不命中。

覆盖缺口（静态）：`canonicalAgentToolName`/`isCanonicalAgentTool`/`isSafeBashCommand`/`hasDangerousStructure`/`isDangerousCommand`/`SAFE_BASH_PATTERNS`/`DANGEROUS_COMMANDS` 在本批测试中**未被引用**（grep 全冻结树测试文件，`isSafeBashCommand`/`hasDangerousStructure`/`isDangerousCommand` 仅出现在实现与 `agent-permission-service.ts`）；`canonicalAgentToolName` 由间接测试 `agent-orchestrator-p0-guards.test.ts:110-111` 覆盖（含 MCP 命名空间）。无 `isSafeBashCommand` 的直接单测。

**NOT_RUN**：本轮未执行任何测试；断言仅代表源码中写有该 `expect`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯常量/纯函数，无 I/O | 已证实 | 全文 `:1-201` |
| MCP 命名空间归一取最后一段 | 已证实 | `:9-12`；间接测试 `agent-orchestrator-p0-guards.test.ts:110-111` |
| CSLab 执行类 = `cslab_` 前缀 − 5 只读 | 已证实 | `:34-37` |
| `cslab_list_lab_tools` 非执行类但也不在 SAFE_TOOLS → 实际走人工询问 | 已证实（行为）/注释未覆盖（原因） | `:23,36,40-71` + `agent-permission-service.ts:247-259` |
| 危险前缀 `startsWith` 语义（`mv`→`mvn` 假阳性） | 已证实 | `:171-174` |
| `hasDangerousStructure` 引号内分号不排除 | 已证实 | `:131` 正则无引号感知；与 `:130` 注释意图不完全一致 |
| `isPotentiallyExecutableFile` 对 `.exe`/无扩展名返回 false | 已证实 | `:198-199`；测试 `:74-78` |
| PowerShell 变量展开 `$x` 一律判危险 | 已证实 | `:159` |
| `split('__').at(-1)` 对尾随 `__` 产生空串的影响 | 推断 | `:11`；未见消费方防御或测试 |
| 真实会话中自动放行/询问的实际比例 | 未知 | NOT_RUN，无遥测 |
| `agent-permission-service` 单测对 Bash 规则的覆盖 | 未知 | 未逐行核该测试文件（非本批） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `canonicalAgentToolName`/`isCanonicalAgentTool` | §2, §3 | 9-17 | covered（间接测试） |
| `CSLAB_READ_ONLY_SCIENCE_TOOLS`/`isCsLabExecutionTool` | §2, §3, §7 | 22-37 | covered |
| `SAFE_TOOLS` | §2, §7 | 40-71 | covered |
| `SAFE_BASH_PATTERNS`/`isSafeBashCommand`/`hasDangerousStructure` | §2, §3, §6 | 74-144 | covered（无直接测试） |
| `DANGEROUS_COMMANDS`/`isDangerousCommand` | §2, §3 | 103-115,171-174 | covered（无直接测试） |
| `SAFE_POWERSHELL_PATTERNS`/两个 PowerShell 函数 | §2, §3 | 147-166 | covered |
| `DANGEROUS_EXECUTABLE_EXTENSIONS`/`isPotentiallyExecutableFile` | §2, §3 | 183-201 | covered |
| cslab_list_lab_tools 口径不对称 | §7 | 23,36,65-69 | covered（照实记录） |
