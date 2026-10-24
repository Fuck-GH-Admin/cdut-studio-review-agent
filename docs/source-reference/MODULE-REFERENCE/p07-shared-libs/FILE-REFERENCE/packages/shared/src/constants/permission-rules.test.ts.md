---
path: packages/shared/src/constants/permission-rules.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83dfb3bf7cbe404d35ddfaf97a1b084f9436aa9a
sha256: 98ee0e663a62e7a9d6767c67c86b3528013b186360f950248fe72d7318ce5fe6
lines: 79
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/permission-rules.test.ts

## 1. 测试目标

验证 `packages/shared/src/constants/permission-rules.ts` 的三个消费面：PowerShell 只读分级（`isSafePowerShellCommand`/`hasDangerousPowerShellStructure`）、CSLab 工具分级（`isCsLabExecutionTool` + `SAFE_TOOLS` 成员资格）、潜在可执行文件后缀判定（`isPotentiallyExecutableFile`，CVE-2026-96951 防御）。bun:test（`:1`）；导入 5 符号（`:2-8`）：`SAFE_TOOLS`、`hasDangerousPowerShellStructure`、`isCsLabExecutionTool`、`isPotentiallyExecutableFile`、`isSafePowerShellCommand`。NOT_RUN，只读断言。

## 2. 用例清单

共 **9 个 `test(`**（3 个 `describe`，Given/When/Then 命名）：

| # | 行 | describe / 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 11 | PowerShell / 简单元数据查询自动允许 | `Get-Location`、`Get-Date`、`Get-Process -Name explorer`、`Get-Command git`、`Test-Path C:\Windows` | 5 次 `isSafePowerShellCommand` | 独立 |
| 2 | 19 | PowerShell / 读内容·变更·组合脚本需审批 | `Get-Content $HOME\…`、`Remove-Item`、`Get-Location; Remove-Item`、`Get-Process \| Stop-Process` | 4 次判定 | 独立 |
| 3 | 26 | PowerShell / 组合语法判危险 | `;`、`\|`、`$(...)`、`>` | 4 次 `hasDangerousPowerShellStructure` | 独立 |
| 4 | 35 | CSLab / 只读科学计算免审批且入白名单 | `cslab_analyze_crystal`/`cslab_simulate_pxrd`/`cslab_fit_peaks` | 循环双断言 + `cslab_list_lab_tools` 单断言 | 独立 |
| 5 | 43 | CSLab / 写文件或改画板仍为执行类 | `cslab_render_plot`/`cslab_export_figure` | 判定 + `SAFE_TOOLS` 反向断言 | 独立 |
| 6 | 52 | 后缀 / Windows 可执行与脚本后缀命中 | 6 路径（exe/bat/ps1/vbs/msi/hta） | 6 次 `isPotentiallyExecutableFile` | 独立 |
| 7 | 61 | 后缀 / 大小写混合不敏感 | `VIRUS.EXE`、`run.Cmd` | 2 次判定 | 独立 |
| 8 | 66 | 后缀 / 普通文档与目录不命中 | docx/txt/json/目录/空串 | 5 次判定 | 独立 |
| 9 | 74 | 后缀 / 无扩展名或点开头隐藏文件不命中 | `.exe`、`.bashrc`、`README` | 3 次判定 | 独立 |

## 3. 真实断言

- `:12-16` 5× `expect(isSafePowerShellCommand(...)).toBe(true)`。
- `:20-23` 4× `.toBe(false)`。
- `:27-30` 4× `expect(hasDangerousPowerShellStructure(...)).toBe(true)`。
- `:37-38` `expect(isCsLabExecutionTool(toolName)).toBe(false)` + `expect(SAFE_TOOLS).toContain(toolName)`（3 工具）；`:40` `expect(isCsLabExecutionTool('cslab_list_lab_tools')).toBe(false)`（**仅**判定断言，无 SAFE_TOOLS 断言）。
- `:44-47` `toBe(true)`×2 + `expect(SAFE_TOOLS).not.toContain(...)`×2。
- `:53-58` 6× `toBe(true)`；`:62-63` 2× `toBe(true)`；`:67-71` 5× `toBe(false)`；`:75-77` 3× `toBe(false)`。

## 4. 未覆盖与脆弱点

- 导入清单外的 8 个导出无直接断言：`canonicalAgentToolName`/`isCanonicalAgentTool`（间接测于 `apps/electron/src/main/lib/agent-orchestrator-p0-guards.test.ts:110-111`）、`isSafeBashCommand`/`hasDangerousStructure`/`isDangerousCommand`/`SAFE_BASH_PATTERNS`/`DANGEROUS_COMMANDS`（grep 全冻结树测试文件无引用）、`SAFE_POWERSHELL_PATTERNS`（仅经 `isSafePowerShellCommand` 间接）。
- `cslab_list_lab_tools` 的 SAFE_TOOLS 成员资格未断言（对比 `:38` 的双断言）——与实现的口径不对称一致（见源篇 §7），测试未锁定期望。
- PowerShell 用例未覆盖变量展开 `$x`（`hasDangerousPowerShellStructure` 正则第三分支）、`{}` 脚本块、反引号。
- 后缀用例未覆盖多点文件（`a.tar.gz`）、尾随点（`x.`）、路径含 `..` 形态。
- Bash 侧规则（22 条正则）完全无测试面。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例/3 describe 结构 | 已证实 | `:10,34,51` 及各 test 行 |
| PowerShell 允许/拒绝两面 | 已证实 | `:11-31` |
| CSLab 分级 + SAFE_TOOLS 成员/排除双向 | 已证实 | `:35-48` |
| 后缀判定大小写不敏感与隐藏文件边界 | 已证实 | `:52-78` |
| `cslab_list_lab_tools` 未锁 SAFE_TOOLS 期望 | 已证实（核对用例） | `:40` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| `isSafePowerShellCommand` | §2/§3 | 1,2 | covered |
| `hasDangerousPowerShellStructure` | §2/§3 | 3 | partial（4/6 分支） |
| `isCsLabExecutionTool` | §2/§3 | 4,5 | covered |
| `SAFE_TOOLS` 成员资格 | §2/§3 | 4,5 | partial（list_lab_tools 未锁） |
| `isPotentiallyExecutableFile` | §2/§3 | 6-9 | covered |
| Bash 规则族 | §4 | — | unknown（无测试） |
