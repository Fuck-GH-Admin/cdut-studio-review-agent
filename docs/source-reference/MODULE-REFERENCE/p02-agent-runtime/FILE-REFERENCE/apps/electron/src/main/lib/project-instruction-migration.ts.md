---
path: apps/electron/src/main/lib/project-instruction-migration.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e40f9febf56b85980356a951c60446ef23dbb0ca
sha256: 51498a15d59692ddb4c362195a71073fa6e30a5ecb93bbd6284201f96018f67f
lines: 42
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/project-instruction-migration.ts

## 1. 结论与边界

生成 legacy `CLAUDE.md` → `AGENTS.md` 的**用户主动**迁移建议 prompt。普通项目操作不应调用此 helper；迁移是用户显式发起的独立动作（注释 `apps/electron/src/main/lib/project-instruction-migration.ts:6-8`）。指令解析器已保证每目录至多激活一个候选文件，故传入 legacy source 均表示该目录无更高优先级 `AGENTS.md`（`:10-12`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `buildLegacyProjectMigrationPrompt` | 函数（导出） | 20-42 | `(options:{sources,headingLevel?})=>string\|undefined` | 无 legacy 源返回 undefined |
| `LegacyMigrationPromptOptions`/`formatSourceEntry` | 内部 | 4-11 | 选项形状；`- \`<relativePath>\`（scope: \`<scopeRoot>\`，hash: \`<contentHash>\`）` | |

## 3. 内部逻辑与关键流程

`:20-42`：过滤 `kind==='claude'`（无→`undefined`，`:22-23`）；收集 `kind==='agents'` 活跃源拼接“本轮已激活、可能对迁移 scope 生效的 AGENTS.md”附录（`:25-28`）；标题层级默认 2（`:29`）；返回 Markdown prompt，四步证据驱动迁移指令（`:33-41`）：①读取与核验（Read 原文+父级/同目录 AGENTS.md+LS/Read 项目证据，不凭文件名猜）；②提炼非照抄（过时/冲突/密钥/仅 Claude 措辞不得复制；存疑先问）；③按 AGENTS.md 最佳实践写入（根放通用、子目录放增量、引用父级不重复）；④安全写入与报告（最小增量、保留原 CLAUDE.md 不删不改名）。冲突时以可验证当前事实与更近 scope 的 AGENTS.md 为准，不编造折中（`:41`）。

## 4. 调用者与调用链

入向：项目指令迁移 UI/命令（用户显式触发）；测试：本批无专属测试（scope 无 `.test.ts`）。出向：`./project-instruction-resolver.ts:1`（`ProjectInstructionSource` 类型）。

## 5. 数据 I/O、读写与副作用

纯字符串生成：无 IO/状态。

## 6. 分支、失败、取消与恢复

唯一分支：无 legacy 源→`undefined`（`:22-23`）。无抛错/取消概念。

## 7. 权限与权威状态

- 迁移权威=用户显式发起（`:6-8`）；内容权威=当前项目可验证事实+更近 scope AGENTS.md（`:41`）。
- 明令禁止删除/重命名用户 `CLAUDE.md`（`:38`）。

## 8. 修改影响面

改 prompt 影响迁移质量/安全规则；影响未来可能的测试与迁移 UI。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 用户显式迁移独立动作 | 已证实 | `:6-8` |
| 无 legacy→undefined | 已证实 | `:22-23` |
| 证据驱动四步+冲突裁决 | 已证实 | `:33-41` |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildLegacyProjectMigrationPrompt` | §3 | 20-42 | covered |
| 断言 | §9,§10 | — | unknown |
