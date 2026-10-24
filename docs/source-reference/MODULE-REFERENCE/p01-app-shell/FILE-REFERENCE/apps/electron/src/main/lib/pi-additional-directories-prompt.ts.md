---
path: apps/electron/src/main/lib/pi-additional-directories-prompt.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00724454e61f7fb559e2049037fa9bae99618868
sha256: a1b2ebcf1487f31a7a35a5f232f3a4381517aaf193a6ab5c0c34bdea4b5322fe
lines: 46
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-additional-directories-prompt.ts

## 1. 结论与边界

为 Pi 构造"附加授权目录 + 检测到的项目候选"的提示词注入块（46 行，注释 `:10`）：Pi 没有 Claude SDK 的 additionalDirectories 原生访问说明，需在提示词中显式给出授权路径与项目候选消歧规则。纯字符串构造，无 I/O。

**边界**：不做目录检测（`AttachedDirectoryProjectCandidate` 由 `attached-directory-project-detector` 产出，类型来自 `:1` 跨批）；不发送提示词（调用方拼接进 prompt）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `escapePromptXml` | 函数（内部） | 3-8 | `(value: string) => string` | 仅转义 `&` `<` `>` 三字符 |
| `buildPiAdditionalDirectoriesPrompt` | 函数（导出） | 11-45 | `(directories: string[], projectCandidates: AttachedDirectoryProjectCandidate[] = []) => string` | 构造注入块 |

导出合计 1；内部 1。候选渲染字段（`:24-30`）：`rootPath/name/type/relativePath/evidence`（必有）、`packageName/gitRemote/repositoryRoot`（条件）、`sourceDirectory`（必有）。

## 3. 内部逻辑与关键流程

1. `directories.length === 0` → 返回 `''`（`:15`，空目录不加提示词）。
2. 目录行（`:16-18`）：`<directory index="N">转义路径</directory>` 逐行 join。
3. 候选块（`:19-37`）：无候选 → `''`；否则 `<detected_project_candidates>` 内每候选一个 `<project>`：必有字段 `root/name/type/relative_to_attached_directory/evidence`（evidence 数组 `join(', ')`，`:29`），条件字段 `package_name/git_remote/repository_root` 仅在非空时渲染（`:30`，尾随换行缩进处理），`source_attached_directory` 必有（`:30`）；块后附双语（英文主体+中文词表）消歧指令（`:34-37`）：root 是实际操作绝对路径、按用户明确提及的 name/package_name/git_remote/type/repository_root 消歧、仅唯一语义匹配时直接用、无匹配或多候选项时询问用户。
4. 返回 `<attached_directories>` 块（授权声明+绝对路径使用规则，`:41-43`）+ 目录行 + 候选块（`:39-45`）。

## 4. 调用者与调用链

- 入向（全冻结树检索 `buildPiAdditionalDirectoriesPrompt`）：
  - `lib/agent-orchestrator.ts:204`（import）→ `agent-orchestrator.ts:2043` `buildPiAdditionalDirectoriesPrompt(allAdditionalDirectories, projectCandidates)`（调用点为 `agent-orchestrator.ts:2041-2043` 的三元：`isStudyClass ? '' : buildPiAdditionalDirectoriesPrompt(allAdditionalDirectories, projectCandidates)`——速课堂（study-class）模式整体跳过提示词注入（`projectCandidates` 同样置空 `[]`，`agent-orchestrator.ts:2040`）；空目录返回 `''` 的短路在被调函数内部 `pi-additional-directories-prompt.ts:15`）。
  - `lib/agent-orchestrator.test.ts:2`（直接测试，4 用例）。
- 出向：类型 `AttachedDirectoryProjectCandidate`（`:1`，跨批）。无其他运行时依赖。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：全文纯字符串操作，无 fs/net/全局状态）。输出为提示词文本，副作用仅提示词内容对模型行为的影响（模型行为不可静态验证，〔未知〕）。

## 6. 分支、失败、取消与恢复

- 分支：空目录短路（`:15`）；候选空/非空（`:19`）；条件字段三元渲染（`:30`）。
- 失败：无 throw（不适用，依据：全文无 throw/异步）。
- 转义边界：`escapePromptXml` 只处理 `&<>`（`:4-7`）——引号/反斜杠不转义（照实记录，路径含引号时输出原样；当前调用面为绝对路径字符串）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。授权语义在提示词文本中声明（`:42-43`："directories have been authorized to the current session by Profer"），但**真正的授权判定不在本文件**（由调用方/会话权限层决定哪些目录进入 `directories`）。

## 8. 修改影响面

- 影响 `agent-orchestrator.ts:2043` 的 Pi 提示词内容与模型的目录/项目寻址行为（消歧指令 `:34-37` 是任务路由规则的唯一注入点）。
- XML 结构字段名（`<attached_directories>`/`<detected_project_candidates>`/`<project>` 等）是提示词契约；改动影响测试断言（`agent-orchestrator.test.ts` 4 用例的 toContain 值）。
- 需同步修改的测试：`apps/electron/src/main/lib/agent-orchestrator.test.ts`。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-orchestrator.test.ts`（批外，`describe('buildPiAdditionalDirectoriesPrompt')` `:5-45`，4 test/13 expect，断言逐条）：
1. `:6-16` 注入授权目录：toContain `<attached_directories>`、`use absolute paths directly`、`<directory index="1">…</directory>`、`<directory index="2">…</directory>`（含 Windows 反斜杠原样）。
2. `:18-36` 候选+路由规则：toContain `<detected_project_candidates>`、`<root>`、`<type>obsidian-vault</type>`、`<name>`、`<relative_to_attached_directory>`、`repository_root`、`unique semantic match`。
3. `:38-40` 空目录 → toBe `''`。
4. `:42-44` XML 转义：toContain `C:\a&amp;b&lt;test&gt;`。

未覆盖：条件字段（package_name/git_remote/repositoryRoot）的有/无分支无断言；evidence join 格式无断言；多候选消歧文本无断言。

`NOT_RUN`：本轮未运行 bun test，断言仅静态阅读。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 构造逻辑/分支/转义面/条件渲染 | 已证实 | `:1-46` 全文逐行 |
| 入向=agent-orchestrator.ts:2043 + 测试 4 用例 | 已证实 | 全树检索 |
| 提示词对模型的实际约束力 | 未知 | 模型行为不可静态验证 |
| `AttachedDirectoryProjectCandidate` 产出逻辑 | 边界（跨批未深读） | `:1` 类型来源 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `escapePromptXml` | §2/§6 | 3-8 | covered |
| `buildPiAdditionalDirectoriesPrompt`（空目录/目录块/候选块/条件字段/指令段） | §3 | 11-45 | covered |
| 调用者 | §4 | - | covered |
| 测试断言 4 用例 | §9 | - | covered |
