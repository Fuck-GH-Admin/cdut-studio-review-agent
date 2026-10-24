---
path: apps/electron/src/main/lib/preview-inspection-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d5e4d838cff736923c5e81e87b4cfc092a357af6
sha256: 3d15cad7d1a4c6dc60a35a9b6cfe31d5ef0532153a2128e6b6f1376f78f72002
lines: 274
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/preview-inspection-service.ts

## 1. 结论与边界

Agent 预览检查服务：读取**当前授权文件**的内容与视觉预览，每次调用重新计算 revision（`:166`）。授权语义（`resolveAuthorizedFile`）抽为公开函数供「文档内容解析」等常驻工具复用（`:71-74`）；`renderAuthorizedPreview` 是**唯一**把路径边界传入视觉 renderer 的位置（opaque `cdut-file://` URL，模型结果不含绝对路径，`:246-249`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 1 个 type + 3 个函数 + 2 个 re-export（`kindFromPath`/`defaultScope`，`:274`）= 10 个导出符号（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PreviewInspectionContext` | 接口（导出） | 17-20 | `{agentCwd,allowedRoots}` |
| `PreviewRenderInput` | 接口（导出） | 22-31 | 已 realpath 授权的本地路径**绝不返回**模型/renderer（`:23`） |
| `PreviewRenderOutput` | 接口（导出） | 33-36 | `{images,warnings?}` |
| `PreviewInspectionDependencies` | 接口（导出） | 38-41 | `render?/readText?` 可注入 |
| `PreviewInspectionResult` | type（导出） | 43 | `InspectPreviewResult\|InspectPreviewError` |
| `resolveAuthorizedFile` | 函数（导出） | 75-100 | 授权解析（错误或 realpath 目标） |
| `inspectPreview` | 函数（导出） | 167-244 | 主检查 |
| `renderAuthorizedPreview` | 函数（导出） | 250-272 | opaque URL 渲染 |
| `kindFromPath`/`defaultScope` | re-export（导出） | 274 | 内部实现 `:102-122` |
| `TEXT/MARKDOWN/HTML/IMAGE_EXTENSIONS` | 内部 | 45-51 | 扩展名分类 |
| `error/isInside/realDirectory/hashFile/truncateText/readStructuredContent/validateInput` | 内部 | 53-164 | 错误构造/根包含/realpath 目录/sha256 revision/截断/结构化内容/输入校验 |

## 3. 内部逻辑与关键流程

### 3.1 授权解析（`resolveAuthorizedFile`，`:75-100`）

空输入 `invalid_input`；相对路径无 agentCwd → `unauthorized_path`（不把 home 当默认根，`:77-78`）；`realpath` 失败 → `file_not_found`；非普通文件 → `unsupported_file_type`；roots=`[agentCwd,...allowedRoots]` 经 `realDirectory` 归一后逐一 `isInside`（`relative` 判定，`:57-60`）否则 `unauthorized_path`。

### 3.2 类型与范围（`:102-122`）

`kindFromPath`：md→markdown、html→html、图→image、pdf、docx→document、xlsx→spreadsheet（csv/tsv→text）、pptx→presentation、TEXT_EXTENSIONS/无扩展→text、其余 unknown（**ODT 等压缩包不伪装可视觉预览**，`:108-109`）；`defaultScope` 恒 `'overview'`（page 仅显式要求，`:119-122`）。

### 3.3 主检查（`inspectPreview`，`:167-244`）

校验（mode/scope/page 组合，`:157-164`）→ 授权 → kind unknown 拒 → `hashFile`（sha256 revision+size+mtime，`:124-132`）→ 超 `LIMITS.maxFileBytes` 拒 → mode=content/both：文本扩展直读（可注入 `readText`），否则 `readStructuredContent`（pdf=`document-parser.extractTextFromFile`、docx=HTML 去标签、xlsx/pptx=office 转换文本，`:139-155`）→ `truncateText`（`LIMITS.maxTextChars`）→ mode=visual/both：无 `render` 依赖 → `renderer_failed`（retryable）；**visual-only Markdown 仍补 source text**（`:212-217`）；渲染结果空图→`renderer_failed`、超图数/超 payload（0.75 折算 base64，`:227-229`）→`render_budget_exceeded` → **再 hash 一次**，revision 变化 → `file_changed_during_inspection`（retryable，`:234-235`）→ 返回结果（含 `changedSincePreviousRevision`，`:194`）。异常：消息含 `超过`→budget；`code:'page_out_of_range'`→页码错；其余→`renderer_failed`（retryable）（`:237-243`）。

### 3.4 渲染（`renderAuthorizedPreview`，`:250-272`）

html→注册父目录 URL+编码 basename；pdf→`preparePdfPreview`（**scope=page 只栅格化目标页**——整份 26 页 PDF 实测约 34s，逐页会放大几十倍，历史「材料登记卡住」根因注释 `:259-260`）；其余→注册文件 token；统一 `renderAgentPreview`。

## 4. 调用者与调用链

入向：`inspect_preview`/`open_file_preview` 工具（pi-builtin-tools 的 preview 族，nb-53 手册）；`resolveAuthorizedFile` 供文档内容解析工具复用。测试：`preview-inspection-service.test.ts`（126 行，本批）。出向：`node:crypto/fs/promises/path`、`@profer/shared`（LIMITS/DEFAULT_MODE/类型）、动态 import `./document-parser`/`./file-preview-service`/`./local-file-protocol`/`./agent-preview-renderer`。

## 5. 数据 I/O、读写与副作用

读：文件内容/hash/stat；副作用：注册 `cdut-file://` token（渲染）、依赖 renderer（外部进程/视图）。

## 6. 分支、失败、取消与恢复

| 情形 | code | retryable | 行 |
| --- | --- | --- | --- |
| 输入非法/page 组合 | `invalid_input`/`invalid_page` | 否 | 157-164 |
| 未授权/无 cwd | `unauthorized_path` | 否 | 78,98 |
| 缺失/非普通文件 | `file_not_found`/`unsupported_file_type` | 否 | 85-94,179 |
| 超文件/文本/图/payload 限制 | `file_too_large`/`render_budget_exceeded` | 否 | 187,227-229 |
| 无 renderer/渲染空图/异常 | `renderer_failed` | **是** | 211,226,242 |
| 检查期间文件变化 | `file_changed_during_inspection` | **是** | 235 |
| 页码越界 | `page_out_of_range` | 否 | 239-240 |

恢复：retryable 错误指示可重调用；revision 双 hash 保证检测并发修改。

## 7. 权限与权威状态

- 授权根=agentCwd+allowedRoots（realpath 归一）；renderer 只拿 opaque URL（`PreviewRenderInput.filePath` 注释 `:23`）。
- 输入模式/范围白名单校验（`:157-164`）。

## 8. 修改影响面

改授权语义影响所有预览/文档解析工具；改 LIMITS 影响预算错误；改 PDF 页栅格化影响材料登记性能（`:259-260`）。

## 9. 测试证据

直接测试：`preview-inspection-service.test.ts`（126 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`renderAuthorizedPreview` 的 renderer 真实行为、`readStructuredContent` 各转换分支以测试手册为准。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| realpath 授权+软链消解 | 已证实 | `:80-99` |
| revision 双 hash 防并发 | 已证实 | `:234-235` |
| opaque URL 唯一边界点 | 已证实 | `:246-256` |
| PDF 页级栅格化性能注释 | 已证实 | `:259-264` |
| ODT 不伪装 | 已证实 | `:108-109` |
| 真实 renderer/转换 | 未知 | 依赖外部 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 授权解析 | §3.1 | 57-100 | covered |
| 类型/范围 | §3.2 | 102-122 | covered |
| 主检查 | §3.3 | 157-244 | covered |
| 渲染 | §3.4 | 250-272 | covered |
| 失败码矩阵 | §6 | — | covered |
| 真实转换/renderer | §9,§10 | — | unknown |
