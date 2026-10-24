---
path: apps/electron/src/renderer/components/settings/SkillFilesPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 161b7b6d427462fa471d5ead6098d113105ecfca
sha256: 713cdf2cf6638a6992a3e5ab5a688f20f595edd94328903e1006f6da0b3c1f18
lines: 598
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/SkillFilesPanel.tsx

## 1. 结论与边界

**Skill 子文件树+编辑器面板**（`:1-6` 注释）：管理 Skill 目录下资源文件（references/scripts/assets 等）；**SKILL.md 由主面板管理，不出现在文件树**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillFilesPanel` | function（export） | `:54-384` | `({workspaceSlug, skillSlug, onFileCountChange?})` |

内部：`countTree`（递归计数 `:36-52`）、`FileTree`（`:409-428`）、`TreeNode`（**:435-550 递归节点**）、`CreatePlaceholder`（`:552-592`）、`formatSize`（`:594-598`）。

## 3. 内部逻辑与关键流程

1. 树加载（`refreshTree` `:77-89`）：`listSkillFiles`；**文件数经 ref 回调上报 Tab 徽章**（`:72-75/:82`，ref 防闭包陈旧）。
2. 文件读写（`:99-143`）：`readSkillFile` 取内容+isText；**二进制不支持内置编辑如实显示**（`:324-329`）；保存 `writeSkillFile` 后本地更新 size+刷新树。
3. 新建（`:145-174`）：**名称拒含 `/` `\` 防路径注入**（`:158-161`）；父目录展开；建文件后自动打开。
4. 删除（`:176-192`）：`window.confirm` 确认（「此操作不可撤销」）；**删目录后清选择/编辑态**（`:182-186`）。
5. 重命名（`:194-224`）：同样拒 `/` `\`（`:205`）；选中态路径跟随迁移（`:214-217`）。
6. 编辑器（`:311-379`）：未选/加载/失败/二进制/文本五态；编辑态 textarea（spellCheck off）vs 只读 pre。
7. 树节点（`:435-550`）：缩进 `depth*12+4`；hover 显示操作钮（目录内建文件/目录、重命名、删除）；重命名输入 Enter 确认/Esc 取消/blur 提交（`:468-472`）。

## 4. 调用者与调用链

入向：Skill 详情页 Tab。出向：`@profer/shared`（SkillFileNode/SkillFileContent）、`window.electronAPI`（listSkillFiles/readSkillFile/writeSkillFile/createSkillEntry/deleteSkillEntry/renameSkillEntry）、`./primitives`、sonner。

## 5. 数据 I/O、读写与副作用

读写 Skill 目录文件（经 Main）；确认对话框。

## 6. 分支、失败、取消与恢复

各操作失败 console.error+toast（`:83-85/:108-111/:137-139` 等）；创建/重命名 Esc 取消。不适用恢复。

## 7. 权限与权威状态

红线：SKILL.md 不入树（`:5`）；名称禁路径分隔符（`:158/:205`）；删除需显式确认（`:178`）。

## 8. 修改影响面

- 改树/编辑器交互 → Skill 资源管理全链。
- 放宽名称校验（`:158/:205`）→ 路径注入面。
- 改文件数回调 → Tab 徽章准确性。
- 改二进制/编辑态分支 → 文件查看体验。
- 无测试锁定（§9）：改动需人工验证文件树操作。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SkillFilesPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部+全链 | 已证实 | 逐行读 `:1-598` |
| Main Skill 文件服务 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+树+编辑器 | §2/§3 | `:54-598` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
