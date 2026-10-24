---
path: apps/electron/src/renderer/components/content-review/ReviewV3T01AuthoringLaunchpad.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b4cd4aa1b1316d89393185e38d37fd1fcb57d9f
sha256: 5c460736dc1635f478860673e19a725270e2bca62481fb75d2551da3386816f6
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T01AuthoringLaunchpad.tsx

## 1. 结论与边界

**T01 需求起草与业务验收材料启动台**（`:12-15` 注释）：挂载于 TemplateWizardPanel；**自然语言输入/下载示例材料不发布、不安装任何东西**。语义红线：明确数值门槛→**待确认规则，不变成表单限制**；含糊制度不猜成确定性规则（`:60`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T01AuthoringLaunchpad` | function（export） | `:16-87` | `({onDraft, modelDraftInvoke?})`；Props `:11` |

内部：`analyze`（`draftT01FromBrief` 本地提取 `:22-31`）、`modelDraft`（`draftT01ViaAuthorizedModel`，**仅传入 modelDraftInvoke** `:32-42`）、`download`（JSZip 示例包 `:43-55`）。

## 3. 内部逻辑与关键流程

左栏「从自然语言起草模板」：textarea（含示例格式 `:62`）→「提取明确要求」/「使用已授权模型起草」（invoke 存在才显示 `:64`）→草稿卡（字段/材料槽计数、extracted 列表、**发布前需确认 questions 琥珀列表** `:65-71`）→「送入模板编辑器」（onDraft）。
右栏「六类真实文件验收案例包」：`T01_STANDARD_EXAMPLES` 场景选择+ZIP 导出（`exampleT01PackFiles`，DEFLATE `:46-52`）；文案明示「**下载成功不等于审核成功**」（`:75`）、模拟标识（`:83`）。

## 4. 调用者与调用链

入向：TemplateWizardPanel。出向：`./review-v3-t01-brief-authoring`/`-example-packs`/`-business-presets`/`-model-draft-port`（`:6-9`）、@profer/ui、jszip、sonner。

## 5. 数据 I/O、读写与副作用

浏览器下载 ZIP（createObjectURL+revoke `:49-52`）；toast；模型调用经注入 invoke（不自建通道）。

## 6. 分支、失败、取消与恢复

起草/模型/下载三链均 try-catch→toast（`:27-30/:38-41/:53`）；busy/modelBusy 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：输入不发布/安装（`:13-14`）；模型起草须「已授权」invoke（`:9/:64`）；待确认规则不静默生效（`:60`）。

## 8. 修改影响面

改启动台 → T01 起草/示例包 UX 与规则边界文案。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T01AuthoringLaunchpad` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+三链+边界文案 | 已证实 | 逐行读 `:1-87` |
| 起草/模型端口实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:16-87` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
