---
path: apps/electron/src/renderer/hooks/usePanelAutoLayout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22504c9368ab12d5c04829a61a57aa30532586c0
sha256: 07e04d293663901f7d1dd23afb6001cdbeb7ba812af62dc7923628a1854cc9f2
lines: 123
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/usePanelAutoLayout.ts

## 1. 结论与边界

**面板自适应可见性驱动**（123 行，注释 `:1-15`）：「展开意图 A」（agentSidePanelOpenAtom）与「实际可见 B」（panelVisibilityAtom）分离——窗口变窄只让 B=false，拉宽后 A=true 自动显示。状态收敛本模块（单 resize 监听+唯一计算 effect 防 MainArea/AppShell/TabBar 竞态）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `openFilePanel()` | 模块级函数 | `:62` | 置 A=true+重算；窗口不足 toast"拉大窗口后自动显示"（`:69-71`） |
| `UsePanelAutoLayoutOptions` | 接口 | `:74` | `filePanelActive?`（agent 个人视图作用域） |
| `usePanelAutoLayout(options)` | Hook | `:83` | 挂 AppShell 驱动 |

内部：`getCurrentLayout`（`:42`，sidebar 实际展开/filePanel 意图 A/mainPaneCount——组合 tab 双栏最小宽度翻倍，`:47-54` 与 MainArea 同 isGroupActive 判定防两套口径）；模块级 `store`（`:36`，与 React 共享实例）。

## 3. 内部逻辑与关键流程

hook 三 effect：①唯一 resize 监听→setWindowWidth（`:91-96`）②作用域同步（`:99-101`）③可见性计算（`:114-122`）：以当前可见性为 prev 走**滞后带**防临界横跳（注释 `:113`），仅 filePanel 变化才 set。

## 4. 调用者与调用链

- 入向：AppShell（注释 `:80`）；`openFilePanel` 被 TabBar 图标调用（域外）。
- 出向：panel-layout-atoms、agent/tab-group/app-mode atoms、`@/lib/panel-layout`（computeVisibility）。

## 5. 数据 I/O、读写与副作用

window resize 监听；写 windowWidthAtom/layoutScopeActiveAtom/panelVisibilityAtom；toast。

## 6. 分支、失败、取消与恢复

窗口不足 toast 分支（A 保持）；滞后带防抖；unmount 清监听。

## 7. 权限与权威状态

可见性权威=computeVisibility 纯函数（宽度预算+布局态）；A 意图永不变（用户手动权威）。

## 8. 修改影响面

右侧文件面板显隐（含拉宽自动恢复）；主区栏数参与宽度预算（组合 tab 场景）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| A/B 分离/滞后带/双栏预算 | 已证实 | `:1-123` 全文 |
| computeVisibility 阈值 | 边界 | lib 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+内部 | §2/§3 | 36-122 | covered |
