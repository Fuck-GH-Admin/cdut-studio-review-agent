---
path: apps/electron/src/renderer/components/cdut-zone/CdutHeroSection.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f11ca7e9b478d84e662969a90cae28003be5bd9
sha256: 1f5164ad02e57f49fa3197552453151a15e68b4107d2a0dc7152913e937202d4
lines: 119
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutHeroSection.tsx

## 1. 结论与边界

CDUT 专区**正中央校标与三大 Bento 毛玻璃战略板块**（119 行）：居中校徽（CDUT-CE.png）+横向三大板块卡（AI 速课堂/智联万站/材料审核，`:2-6`）；每卡专属微光晕/3D Hover 浮起、深浅主题自适应。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutHeroSection` | `:65-119` | `({onSelect?})`：校徽区（双层 blur 晕影+`CdutLogo`）+`BENTO_MODULES.map` 渲染卡片（`onClick={() => onSelect?.(mod.id)}` `:95`、`data-tour={cdut-module-${id}}` `:94`、hover 浮起/glow） |

内部：`CdutHeroSectionProps:13-16`（onSelect 可选——"预留给后续自动化流程或多智能体通道对接" `:14`）、`BentoModule:18-30`（id/icon/title/tag/desc/surface/accent/glow）、`BENTO_MODULES:32-63`（3 板块：ai-class/yanhu-express/material-review，各带文案与配色 token）。

## 3. 内部逻辑与关键流程

静态清单+map 渲染；`onSelect?.` 可选回调。

## 4. 调用者与调用链

CDUT 专区首页（居中主视觉）；出向 `lucide-react`、`@/components/shared/CdutLogo`。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

`BENTO_MODULES` 3 板块 id 契约（与专区路由/子视图联动）。

## 8. 修改影响面

改卡片影响专区首页导航与视觉；BENTO_MODULES 的 id 契约联动子视图路由（ai-class/yanhu-express/material-review）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/3 板块清单/回调契约 | 已证实 | 119 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
