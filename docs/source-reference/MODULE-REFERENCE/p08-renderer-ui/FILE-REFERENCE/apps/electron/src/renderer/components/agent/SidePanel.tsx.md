---
path: apps/electron/src/renderer/components/agent/SidePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6bd47f6725d495db9a66dae14d451d1e9c7507a5
sha256: 6ed01c984fe721a2003b123088af95f0b51c7a21be0aaed236ef430e3c342ecf
lines: 1589
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/SidePanel.tsx

## 1. 结论与边界

Agent 侧面板容器（文件头 `apps/electron/src/renderer/components/agent/SidePanel.tsx:1-6`）：文件浏览器默认打开；关闭时切换按钮显示活动指示点。四个 Tab（preview/changes/session/workspace）+附加文件/目录管理（会话级与工作区级双域）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SidePanel` | 组件（导出） | 97-818 | 主容器 |
| `SidePanelProps` | 内部接口 | 87-93 | `{sessionId,sessionPath,activeTab,onTabChange,width?=280}` |
| `getMediaTypeFromFilename`/`appendPath`/`getSiblingPath`/`getMovedPath` | 内部 | 62-85 | MIME 推断；**原路径分隔符拼接**（win/unix 兼容，`:70-74`）；同级/移动路径 |
| `AttachedFilesSection`/`AttachedDirsSection`/`AttachedDirTree`/`AttachedDirItem` | 内部组件 | 821-1589 | 附加项列表/目录树（选中集/reveal/重命名/移动/删除/回收站） |

## 3. 内部逻辑与关键流程

- **显示状态分层**（`:98-101`）：B=`panelVisibilityAtom.filePanel`（意图 A ∧ 窗口宽度足够）；关闭只改 A；动画基于 B 平滑过渡。懒挂载 `everOpened`（`:103-107` 首展才渲染重型 DOM，收起保活不重挂）。
- **焦点守卫**（`:110-127`）：收起时焦点若在右面板内→移回 ProseMirror 输入框（防隐藏面板焦点悬空致方向导航/确认落空）。
- **自动定位 Tab 抢占**（`:125-147`）：仅 Agent 写入 reveal（`select` 未置位）切 Tab；用户搜索点击不抢占；ts 去重防手动切回后再被抢。路径归属判定 session/workspace（含附加目录/文件）。
- **附加管理双域**：会话级（`:250-369` attach/detach/rename/move/delete/trash）与工作区级（`:373-501` 同构）；IPC 失败均 console.error 不打断；重命名/移动用 `replace*Directory`（detach+attach 成对，`:289-297`）。
- **添加到聊天**（`:510-525`）：去重在 setter 外检查（`:521` 注释：避免 updater 内不可逆副作用）；**有 sourcePath 直接引用原路径不存 base64**（`:524`）。
- **reveal 递归**（`AttachedDirsSection` `:930-998`）：嵌套附加目录取**最深匹配**只展开真正包含目标的树；`AttachedDirItem` `:1318-1360` 祖先自动展开+目标行 scrollIntoView 中心（展开后再滚防行高偏移，`:1350-1351`）。
- Windows 标题带/命中区特判（`:585-596` 注释：Electron Windows 命中区计算丢弃 overlay 型拖拽带；padding 盒覆盖顶部会被判 no-drag）。

## 4. 调用者与调用链

入向：右侧边栏（index.ts re-export）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai atoms（agent-atoms/panel-layout/preview）、`@/components/file-browser`（FileBrowser/DropZone/SearchBar/布局工具）、`@/components/diff/*`、`@/components/diff/preview-opener`、`window.electronAPI`（attach/detach/rename/move/delete/trash/listAttachedDirectory/openFile/showAttachedInFolder 等）。

## 5. 数据 I/O、读写与副作用

IPC 全家（文件/目录附加管理+对话框）；jotai 状态（filesVersion/seenVersion/pendingFiles 等）；DOM（document 监听/焦点/scrollIntoView）；本地状态（选中集/展开/重命名）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| IPC 失败 | console.error 各 handler | 250-501 等 |
| 窗口宽度不足 | B=false、A 不变 | 98-101 |
| 焦点悬空 | 收起移回输入框 | 110-127 |
| reveal 嵌套 | 最深根匹配 | 938-948 |
| reveal 加载失败 | 跳过滚动 | 1343-1346 |
| 删除确认 | AlertDialog 回收站/永久二选 | 1233-1251 |

## 7. 权限与权威状态

- 路径安全权威=IPC 侧 `candidateBasePaths` 校验（所有文件操作携带 `allowedPaths`）。
- 会话文件 vs 工作区文件边界=双域 Tab+IPC 分离。
- 会话专属文件仅本会话 Agent 可访问（`:1046` Tooltip 文案）。

## 8. 修改影响面

改附加管理影响 Agent 文件供给；改 reveal/Tab 影响定位体验；影响 file-browser/diff 组件。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 显示分层/懒挂载/焦点守卫 | 已证实 | `:98-127` |
| Tab 抢占防误切 | 已证实 | `:125-147` |
| 双域附加管理+成对替换 | 已证实 | `:250-501` |
| 不存 base64 直引路径 | 已证实 | `:524` |
| reveal 最深匹配/展开后滚 | 已证实 | `:938-948,1350-1351` |
| 渲染/IPC 行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 主容器 | §2,§3 | 62-818 | covered |
| 附加组件族 | §2,§3 | 821-1589 | covered |
| 断言 | §9,§10 | — | unknown |
