---
path: apps/electron/src/renderer/components/diff/DiffPanelTabBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 694de397c541be20ef9852b01f9da91aaae9acd9
sha256: 29de672361b0f940e0c3aa64eec17b0a0e321928f3a92c90e33bae5579f81004
lines: 197
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DiffPanelTabBar.tsx

## 1. 结论与边界

右侧面板顶部 Tab 栏：切换「会话文件」「工作区文件」「文件改动」三个固定视图 + 条件出现的「预览」Tab，最右固定折叠按钮；管理“未查看改动”红点的清除语义与预览 Tab 的自动回退（`apps/electron/src/renderer/components/diff/DiffPanelTabBar.tsx:1-5`）。

边界：

- 不渲染各 Tab 的内容（内容归 SidePanel 各视图）；`activeTab`/`onTabChange` 状态归调用方。
- 不做真正的面板折叠动画（`onClose` 回调抛给调用方）。
- 探索分支 Tab 不在本文件（注释 `:180` 仅说明折叠钮固定右侧的原因）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0；`:17` 的 `type DiffPanelTab = AgentSidePanelTab` 未导出）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DiffPanelTabBar` | 函数（导出） | 99-197 | `({activeTab, onTabChange, onClose?}) => React.ReactElement` | Tab 栏本体 |
| `FileViewTabButton` | 内部组件 | 38-97 | `({active,isClassic,label,icon,onClick,compact?,badge?})` | 单 Tab（文字/图标两形态） |
| `DiffPanelTabBarProps` | 内部接口 | 19-23 | `{activeTab; onTabChange; onClose?}` | props |
| `PreviousTabState` | 内部接口 | 25-28 | `{sessionId: string\|null; activeTab}` | 上一帧状态（供 effect 比较） |
| `DiffPanelTab` | 内部类型别名 | 17 | `= AgentSidePanelTab` | Tab 枚举取自 agent-atoms |
| `clearUnseen` | 内部（useCallback） | 110-118 | `(sessionId?) => void` | 清当前会话未读标记 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/DiffPanelTabBar.tsx:99-197`：

1. 派生（`:100-107`）：`unseenChanges`（`agentDiffUnseenChangesAtom` 按 `currentAgentSessionIdAtom` 查，缺省 false）、`isClassic`（`interfaceVariantAtom === 'classic'`）、`previewFile`（`previewFileMapAtom` 当前会话项）、`previewLabel`（`预览：<basename>` 或「预览」）。
2. `clearUnseen`（`:110-118`）：无 sessionId 直接返回；map 里已是 false 则**保持原引用**返回（`:113`），否则复制 Map 置 false（幂等、避免无谓重渲）。
3. “看过即清” effect（`:121-127`）：同会话下上一帧 `activeTab==='changes'` 且当前切离 `changes` → `clearUnseen`（语义：从「文件改动」切走=已看过）；帧末更新 `prevTabStateRef`。
4. 预览回退 effect（`:130-134`）：`activeTab==='preview'` 且无 `previewFile` → `onTabChange('changes')`（防空占位视图）。
5. `handleChangesClick`（`:136-141`）：先 `clearUnseen()` 再按需切 Tab。
6. 渲染（`:143-195`）：标题栏拖拽区（`:145`）+ 三个固定 Tab（session/workspace/changes；changes 的 `badge={unseenChanges && activeTab !== 'changes'}`，`:166`）+ 预览 Tab 仅 `previewFile` 存在时渲染（`:170-178`）+ 折叠钮固定右侧（`onClose` 可选，`:181-194`，Tooltip 文案按 `navigator.platform.includes('Mac')` 显示 ⌘⇧B / Ctrl+Shift+B，`:192`）。

`FileViewTabButton`（`:38-97`）：常规形态 `flex-1` 文字 Tab（badge 圆点在标签前，`:82`）；compact 形态 `w-11` 图标 Tab（badge 绝对定位图标右上，`:76-78`），仅 compact 包 Tooltip（`:89-96`）；`aria-label` 恒有（`:59`）；isClassic 决定圆角与激活样式（`:64,68-70`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/agent/SidePanel.tsx:35`（import）、`SidePanel.tsx:603`（渲染，传 `activeTab/onTabChange/onClose`）。无测试引用（见 §9）。

出向：`@/atoms/agent-atoms`（`agentDiffUnseenChangesAtom`/`currentAgentSessionIdAtom`/`AgentSidePanelTab`）、`@/atoms/preview-atoms`（`previewFileMapAtom`）、`@/atoms/theme`（`interfaceVariantAtom`）、`@/lib/file-utils`（`getFileBaseName`）、`@profer/ui/primitives/tooltip`。

## 5. 数据 I/O、读写与副作用

- 无 IPC/磁盘；读写 Jotai atom：写 `agentDiffUnseenChangesAtom`（清未读，`:112-117`）。
- 副作用：effect 内触发 `onTabChange('changes')`（`:132`，预览回退）；无其它外部动作。
- 并发：状态全在 React/Jotai 单线程模型内；`prevTabStateRef` 保存上一帧（`:108,126`）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 无 sessionId 清未读 | 111 | 直接返回 |
| 已是 false 不重写 map | 113 | 保持引用 |
| 切离 changes（同会话） | 122-125 | 清未读 |
| preview Tab 但无预览文件 | 130-134 | 自动回退 changes |
| 无 `onClose` | 181 | 不渲染折叠钮 |
| 无 `previewFile` | 170 | 不渲染预览 Tab |

- 无异步/throw；无失败恢复语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC。未读标记（`agentDiffUnseenChangesAtom`）权威由写入方（改动监听链路）产生，本文件只消费与清除；`currentAgentSessionIdAtom` 是会话上下文权威。

## 8. 修改影响面

- 改 Tab 枚举（`AgentSidePanelTab`）需同步 `SidePanel.tsx` 的视图路由。
- 改未读清除语义（`:121-127`）影响红点行为（用户可见）。
- 改 `previewFileMapAtom` 契约影响预览 Tab 挂载/回退。
- 折叠快捷键文案（`:192`）需与真实全局快捷键实现同步（文案仅展示）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DiffPanelTabBar` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：未读清除时机、预览回退、badge 显隐均无自动化断言。维护者验证：有改动时看红点，切离/点击后红点消失；关闭预览验证 Tab 回退。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:99`） |
| 切离 changes 即清未读 | 已证实 | `:121-127` |
| preview 无文件自动回退 | 已证实 | `:130-134` |
| 清未读幂等保引用 | 已证实 | `:113` |
| 预览 Tab 条件渲染 | 已证实 | `:170-178` |
| 唯一调用点 SidePanel | 已证实（检索） | `SidePanel.tsx:35,603` |
| 快捷键真实绑定 | 未知 | 文案 `:192` 为展示，实际快捷键在别处未核 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `clearUnseen` | §3,§6 | 110-118 | covered |
| 看过即清 effect | §3,§6 | 121-127 | covered |
| 预览回退 effect | §3,§6 | 130-134 | covered |
| `handleChangesClick` | §3 | 136-141 | covered |
| 四 Tab 渲染 | §3 | 147-178 | covered |
| `FileViewTabButton` 两形态 | §2,§3 | 38-97 | covered |
| 折叠钮/快捷键文案 | §3,§6 | 181-194 | covered |
| 测试 | §9 | — | unknown |
