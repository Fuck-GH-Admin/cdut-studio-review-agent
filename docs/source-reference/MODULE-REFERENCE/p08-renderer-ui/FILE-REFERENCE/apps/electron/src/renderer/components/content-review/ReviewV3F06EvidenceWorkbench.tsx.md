---
path: apps/electron/src/renderer/components/content-review/ReviewV3F06EvidenceWorkbench.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6bdc8e32fb99153bc46d7510c0787be62cbeac4
sha256: b12c6ddf66ab3cb1e3344f6dfe45187c333c498c8b5009a93787c9d88e8580bc
lines: 181
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3F06EvidenceWorkbench.tsx

## 1. 结论与边界

**F06 独立证明核对视图**（`:1-4` 注释）：待工作台 Owner 挂载；**所有修改经既有 SetEvidenceLinkV2 CAS**；**不把 AI 提取候选、同名主体、相同字节文件直接视为已确认事实**。语义行：一证多人/多证一事实，计分去重由业务规则决定；**同名学生和文件名不自动成为身份依据**（`:101`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3F06EvidenceWorkbench` | function（export） | `:32-181` | jotai aggregate/extracted 驱动 |

内部：`localReviewer`（Actor 'local-user' `:15`）、`extractedFacts`（**:17-30，只收真实 SourceRef，缺字段即丢弃，不猜页码/定位**）。

## 3. 内部逻辑与关键流程

1. 投影（`:42-47`）：`projectF06Evidence` 按原件版本分组；`previewF06Assignment` 预检。
2. 提交（`:65-95`）：**提交前以 Main 最新 revision 重预检**（防打开后换版/删事项 `:67-73`）；已存在关联拒重复（`:74`）；`setEvidenceLinkV2` CAS（`expectedRevision` `:80`，requestId 生成 `:78`）；成功 refresh+清选。
3. 展示：汇总行（版本数/已确认/未归属 `:100`）；原件版本下拉（旧版标注 `:108`）；退役版本**禁新增关联**（`:115/:147/:160`）；同内容版本提示（**哈希同≠重复计分** `:116-118`）；歧义主体逐人确认（`:119-121`）；已有关联（candidate+current→「确认此人」、非 rejected→「拒绝关联」，经 `transitionEvidenceLink` `:126-144`）；提取候选按钮（**点击填入仍需人工核对** `:151`）。
4. 人工绑定（`:154-177`）：多主体勾选（**同名标「核对 ID」** `:164`）+事实字段；重复关联预览提示（`:171`）；错误预览琥珀（`:172`）；提交钮带主体计数（`:173-177`）。

## 4. 调用者与调用链

入向：内容审核工作台。出向：`@/atoms/review-atoms`、`./use-review-workspace-actions`、`../../../main/lib/review/review-v3-f06-evidence`（3 投影函数 `:10-13`）、`window.reviewAPI`（getAggregateV2/setEvidenceLinkV2）。

## 5. 数据 I/O、读写与副作用

写：证据关联（CAS 命令）；读：aggregate 刷新。

## 6. 分支、失败、取消与恢复

预检失败/重复/退役版本均拒（`:73-74/:147`）；busy 防重；错误消息展示。不适用取消/恢复。

## 7. 权限与权威状态

红线：候选≠事实（`:3`）；CAS 乐观并发（`:80`）；同名≠身份（`:101/:164`）；只收真实 SourceRef（`:17`）。

## 8. 修改影响面

改工作台 → 证明归属核对/计分前置事实链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3F06EvidenceWorkbench` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+CAS 全链 | 已证实 | 逐行读 `:1-181` |
| f06-evidence 投影实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+提交链 | §2/§3 | `:32-181` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
