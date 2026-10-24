---
path: apps/electron/src/renderer/components/cdut-zone/CdutQuickBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3109a418872921618ce081d05214f39f3bbd694f
sha256: aa76787b597fec525b12269b3f698728cd5d039c986a7913f58f60f859c35a18
lines: 73
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutQuickBar.tsx

## 1. 结论与边界

CDUT 专区**底部 4 大高频场景胶囊按钮条**（73 行）："左图标+右标题"格式、微质感胶囊、点击触发顶层抽屉卡片（`:2-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutQuickFeature` | `:18-23` | `{id, icon: LucideIcon, title, desc}`（按钮条与抽屉共用描述符 `:17`） |
| `CDUT_QUICK_FEATURES` | `:26-51` | 4 场景：today-schedule/grade-gpa/empty-classroom/final-exam（各带图标/标题/描述） |
| `CdutQuickBar` | `:57-73` | `({onSelect})`：map 渲染胶囊按钮（`onClick={() => onSelect(feature)}`），`data-tour="cdut-quickbar"` |

## 3. 内部逻辑与关键流程

静态清单+map 渲染；无状态。

## 4. 调用者与调用链

CDUT 专区首页（底部）；`CdutFeatureSheet` 也消费 `CdutQuickFeature` 类型（`:22`）。出向 `lucide-react`。

## 5. 数据 I/O、读写与副作用

纯渲染；点击回调给父级。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

`CDUT_QUICK_FEATURES` 是 4 场景的**单一清单源**（按钮与抽屉共用 id 契约）。

## 8. 修改影响面

改清单影响入口与抽屉分发（id 联动 CdutFeatureSheet switch）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/4 场景清单/id 契约 | 已证实 | 73 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
