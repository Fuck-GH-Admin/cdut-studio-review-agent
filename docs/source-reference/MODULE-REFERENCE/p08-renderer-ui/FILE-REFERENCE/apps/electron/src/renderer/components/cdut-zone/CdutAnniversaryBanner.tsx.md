---
path: apps/electron/src/renderer/components/cdut-zone/CdutAnniversaryBanner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4cbf889ce581b66cd95eeb92bb37b6c679810ff0
sha256: ede3113f1a7c7dbe9e60d4b397d6a5d7d0485212e7093c772c423cdc3df1394d
lines: 29
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutAnniversaryBanner.tsx

## 1. 结论与边界

成理 70 周年**庆典通栏横幅**（29 行）：专区内容区顶部通栏——深绯红→暗酒红渐变+金线+星芒图标+鎏金文案+右侧 1956-2026 校庆徽标（`:2-5`）。纯静态展示组件。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `CdutAnniversaryBanner` | `:11-29` | 无 props 纯静态 JSX：左侧 Sparkles（animate-pulse）+"七十年星河滚烫，成理依旧浪漫"+副文案；右侧 Heart+"1956 - 2026 · 砥砺七十载" |

## 3. 内部逻辑与关键流程

无状态静态渲染。

## 4. 调用者与调用链

CDUT 专区首页（内容区顶部）；出向 `lucide-react`。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

不适用（无分支）。

## 7. 权限与权威状态

文案为庆典性质内容（2026 校庆）。

## 8. 修改影响面

纯视觉；改文案/样式不影响逻辑，但作为专区首页顶部通栏，改动直接影响首页视觉基调与校庆呈现。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 29 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
