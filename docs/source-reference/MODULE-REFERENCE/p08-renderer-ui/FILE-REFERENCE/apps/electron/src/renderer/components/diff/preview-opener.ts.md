---
path: apps/electron/src/renderer/components/diff/preview-opener.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b2cef2b735cfba062f7388c0cf87c2aef4f26b8d
sha256: aa8d908066756c983539abef37b2d657e913a4b22ef1bddfcc241baca5e9dfe5
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/preview-opener.ts

## 1. 结论与边界

**统一文件预览入口**（156 行，`:1-13`）：所有入口（文件树/课件/文件芯片/引用锚点/Agent 自动预览）收敛到 `openSidebarFilePreview`——写 previewFileMapAtom+右侧边栏切"预览"；**绝不向顶栏插 Tab**；**严格只读**（readOnly=true 不支持写回）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SidebarPreviewOptions` | 接口 | `:66` | `activate?`（false=静默自动预览不展开侧栏） |
| `openSidebarFilePreview` | 函数 | `:76` | 核心入口→返回归一绝对路径（失败 ''） |
| `openFilePreviewTab` | 别名 | `:114` | 兼容旧命名（不再建 Tab） |
| `openFilePreviewTabAuthorized` | 异步 | `:124` | Main 授权查一次+isCurrent 校验再开（"never trust unknown event metadata" `:123`） |
| `openFilePreviewTabForSession` | 模块级 | `:139` | getDefaultStore 直调（非 React 上下文） |
| `useOpenPreview` | Hook | `:147` | 包 Authorized 的回调 |

## 3. 内部逻辑与关键流程

- 门禁（`:83-84`）：`revoekdAgentSessionIds` 有该会话 或 `canOpenOrdinaryWorkTab` 不过→返回 ''（owner 审核/撤销会话不能进普通预览）。
- 归一（`normalizePreviewFile` `:49-64`）：绝对→`normalizePreviewPath`（隐藏目录还原正则同 preview-open-path 但**不含 cdutai 变体**，`:39` 照实）；相对→basePaths[0]??dirPath??sessionPath 拼接。
- 只读强制（`:87`）→写 map（`:88-92`）。
- 双宿主（`:94-108`）：AI 速课堂（cdut-zone+ai-class）→展开 study 右栏；否则 Agent→`agentDiffPanelTabAtom` 切 'preview'+`activate!==false` 时开侧栏。

## 4. 调用者与调用链

- 入向：文件树/课件/消息文件芯片/引用锚点/Agent 自动预览（域外调用方）。
- 出向：preview/agent/active-view/cdut/study atoms、`@/lib/agent-tab-access`、`@/lib/file-utils`。

## 5. 数据 I/O、读写与副作用

写 `previewFileMapAtom`（会话级单文件槽）、`agentDiffPanelTabAtom`、`agentSidePanelOpenAtom`/`studyRightPanelCollapsedAtom`；Authorized 变体调 `getAgentSessionMeta`（IPC）。

## 6. 分支、失败、取消与恢复

门禁失败→''；isCurrent 竞态检查（`:133-134`）；无自动回滚。

## 7. 权限与权威状态

**普通预览权威=归属门禁**（撤销会话/owner 审核拦截 `:82-84`）；事件入口须 Main 授权查证（`:123`）；只读强制（`:86-87`）。

## 8. 修改影响面

全部文件预览打开路径；与 agent-tab-access 门禁耦合。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 门禁/只读/双宿主/归一取序 | 已证实 | `:1-156` 全文 |
| **normalizePreviewPath 正则缺 cdutai 变体**（与 preview-open-path 的同名正则不一致） | 已证实（照实记录） | `:39` vs preview-open-path `:18` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+内部 | §2/§3 | 33-156 | covered |
