---
path: apps/electron/src/renderer/components/cdut-zone/CdutSubViewContainer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a080960298e876372185ef28e2d60de6f9318bb2
sha256: 6924606b6d3d2e4a6cd368803a15b12fd2a6388d65ba2bf50183583739f6e4af
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutSubViewContainer.tsx

## 1. 结论与边界

CDUT 专区三大板块**通用子页面容器**（65 行）：统一顶栏（左校徽/中标题/右 Apple 风格关闭钮）+主体填充（`:2-5`）；不显示 70 周年横幅（横幅仅首页，`:7`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutSubViewContainer` | `:27-65` | `({title, onClose, actions?, leftAction?, children})`：header（`titlebar-no-drag` `:34`）+Windows 窗口按钮避让（`paddingRight: resolveWindowControlsRightInset(isWindows)+12` `:35`）+左操作插槽（`:40`）+居中标题+右操作区+关闭按钮（svg 叉、`aria-label` `:53`）；主体 `{children}` |

内部 props：`CdutSubViewContainerProps:15-25`。

## 3. 内部逻辑与关键流程

`detectIsWindows()` useMemo（`:29`）→条件 padding 避让窗口控制钮→slots 组合。

## 4. 调用者与调用链

AiClassView/智联万站/材料审核子页面；出向 `@profer/ui`（detectIsWindows）、`@/components/shared/CdutLogo`、`@/lib/window-controls-layout`。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

isWindows 分支 style；slots 可选渲染。

## 7. 权限与权威状态

**窗口控制钮安全区契约**（`:28`）：顶栏按钮簇不得伸入 Windows 右上角安全区；`titlebar-no-drag` 防拖拽区误触。

## 8. 修改影响面

改容器影响三板块统一顶栏；安全区计算联动 window-controls-layout。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/slots/安全区契约 | 已证实 | 65 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
