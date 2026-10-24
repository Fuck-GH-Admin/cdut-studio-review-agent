---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassRightTabs.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 59c2400f37eb224a41ddfc413f10c263d889cceb
sha256: ceb36b6b468417e8292410008ece5f174820bbeaf93fdf73b4c723d9fc10c257
lines: 656
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassRightTabs.tsx

## 1. 结论与边界

AI 速课堂右栏 Chrome 风格动态多 Tab 引擎（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassRightTabs.tsx:1-11`）：固定首页（Home 恒居首不可关）+动态标签（导图/预览/抽认卡/测验）；拖拽重排、右键菜单（复制/关闭/关闭其它/关闭右侧）、新建；**标签拓扑按课堂落盘**（`~/.cdutai/study-sessions/{sessionId}/tabs.json`）。首页三入口经参数弹窗提交生成后自动新建标签并切换。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiClassRightTabs` | 组件（导出） | 92-541 | 主引擎 |
| `TAB_ICON`/`KIND_META` | 内部常量 | 56-62,544-548 | 类型图标/成果元信息 |
| `genTabId`/`buildArtifactTab`/`tabArtifactId` | 内部 | 69-90 | id 生成（时间基 36 进制+随机）；工件→标签；标签→工件 id |
| `AiClassHomeView` | 内部组件 | 551-656 | 首页（三入口卡+生成中骨架可取消+已生成成果常驻列表） |

## 3. 内部逻辑与关键流程

- **Tab 拓扑持久化**（`:130-155`）：getTabs 加载（alive 旗标）；loaded 后每次变更 saveTabs（失败静默）。
- **预览联动**（`:174-211`）：左栏点击课件→已有同文件标签聚焦否则新建；预览关闭同步移除标签**杜绝「空预览死标签」**（`:193-194` 注释）；点击预览标签实时更新 previewFileMap——否则「切换 Tab 内容纹丝不动的根因」（`:275-278` 注释）。
- 激活标签有效性守卫（`:213-219`）：拓扑损坏/标签被移除→回退。
- 标签操作（`:225-323`）：closeTab/closeOthers/closeRight（**home 不可关**）+`clearPreviewStateForRemovedTabs` 防孤儿预览状态；`duplicateTab`；`reorder` **Home 恒复位首位**（`:316-321`）。
- **生成工件**（`:326-372`）：取消令牌「会话#序号」跨会话/次数互不影响（`:328-332`）；渠道/模型继承（会话绑定>全局>主进程 settings，`:102`）；**先归档隔离缓存再按停留会话决定展示**（`:379` 注释：后台完成不丢成果）；用户已切会话→仅全局 Toast 不打断（`:386-389`）；finally 仅最新一次生成才解除加载锁（`:397`）。
- `cancelGeneration`（`:375-380`）：立即解锁；后台完成后仅静默归档。
- 右键菜单（`:425-438`）：fixed 光标锚定+**视口夹取防裁切**（MENU_W 144/MENU_H 136）；中键关闭（浏览器惯例 `:439-445`）。
- 内容区（`:502-529`）：按 type 分派五视图；**预览用 filePath 动态 key 强制重挂载**（`:516`）。

## 4. 调用者与调用链

入向：AI 速课堂右栏容器；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai（study-atoms/agent-atoms/preview-atoms）、`@/components/diff/SidebarFilePreview`、同目录三 Tab+FormModal、`window.electronAPI.study`（getTabs/saveTabs/listArtifacts/generateArtifact）。

## 5. 数据 I/O、读写与副作用

IPC 四调用（拓扑/成果/生成）；previewFileMap 写入；Toast；本地菜单/拖拽/生成序号状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 拓扑加载失败 | 仍标记 loaded | 143-146 |
| 激活标签失效 | 回退首个/Home | 213-219 |
| 生成取消 | 静默归档 | 375-380,382 |
| 生成失败 | toast（未取消时） | 391-394 |
| 跨会话完成 | 全局 Toast 不打断 | 386-389 |
| Home 被拖动 | 复位首位 | 316-321 |

## 7. 权限与权威状态

Tab 拓扑权威=落盘 tabs.json；生成成果权威=会话隔离缓存（listArtifacts）；取消令牌按会话#序号唯一。

## 8. 修改影响面

改引擎影响速课堂右栏全部交互；改生成流影响成果归档。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 拓扑落盘/预览联动/死标签杜绝 | 已证实 | `:130-219` |
| 取消令牌/后台归档语义 | 已证实 | `:326-380` |
| Home 恒首位/中键关闭/菜单夹取 | 已证实 | `:316-321,425-445` |
| 真实交互 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 引擎+helpers | §2,§3 | 56-541 | covered |
| 首页视图 | §2 | 544-656 | covered |
| 断言 | §9,§10 | — | unknown |
