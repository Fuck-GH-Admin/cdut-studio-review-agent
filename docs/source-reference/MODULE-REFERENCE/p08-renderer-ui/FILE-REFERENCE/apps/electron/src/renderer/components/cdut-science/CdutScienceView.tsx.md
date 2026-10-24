---
path: apps/electron/src/renderer/components/cdut-science/CdutScienceView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3614bc8a4c5072415afdf2aaa22f758ff3df1a52
sha256: ff51afad47fbd9162e24cb3442cf411a3d6095c01e8bc243cd4535550ccb32fe
lines: 98
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CdutScienceView.tsx

## 1. 结论与边界

**CDUT Science 专区全屏独立视图**（`apps/electron/src/renderer/components/cdut-science/CdutScienceView.tsx:1-9`，模块代号 CSLab）：①本机访问密码门禁（`<CsLabAuthGate>` 首次设密/后续验密）②授权后进实验室选择页（`CsLabPreparationView`），AppShell 完全隐藏主侧边栏③暖调编辑式极简视觉（羊皮纸+赤陶+发丝边框）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutScienceView` | 组件 | `:21-98` | 全屏视图 |

## 3. 内部逻辑与关键流程

- 门禁同步（`:28-44`）：`window.electronAPI.cslab.getAuthStatus()` 首屏同步真实门禁；**失败安全降级「需要验密」**（`:36`）。
- 三态渲染（`:66-95`）：未水合「读取门禁状态…」→已验证（`activeLabId`→`CsLabWorkspaceView`/否则 `CsLabPreparationView`）→门禁页（`CsLabAuthGate`）。
- 顶栏冲突隔离（`:58-64`）：titlebar-drag-region + `WindowControlsHost`（priority 20）。

## 4. 调用者与调用链

- 消费方：AppShell（全屏专区）。
- 出向：`CsLabAuthGate`/`CsLabPreparationView`/`CsLabWorkspaceView`（同族）、`cslab-atoms`、`window.electronAPI.cslab`。

## 5. 数据 I/O、读写与副作用

IPC 读门禁状态；Jotai 状态。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 同步失败 | `:35-37` | 降级「需要验密」（安全侧） |
| 未水合 | `:66-69` | 加载文案 |

## 7. 权限与权威状态

**失败安全降级为需验密**（`:27`、`:36`）——门禁失败不放行；AppShell 隐藏主侧边栏（`:7`）。

## 8. 修改影响面

- `cslabAuthAtom`/`cslabActiveLabIdAtom` 协议；`getAuthStatus` IPC。
- 顶栏冲突隔离布局（`:58-64`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、门禁三态 | 已证实 | `:1-98` |
| 失败降级安全侧 | 已证实 | `:27`、`:36` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CdutScienceView` | `:21-98` | covered |
| 门禁同步/三态 | `:28-95` | covered |
