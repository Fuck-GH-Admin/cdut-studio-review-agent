---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetAvatar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 705829b5fa694d0a3cb9db8312224f1d7b00e8e1
sha256: 284b03ba3410677f5e256fe2bb096da7b3b924d1dc67c27abe3bd1326e41ea7c
lines: 67
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetAvatar.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

桌宠立绘组件（67 行，头注 :1-6）：四态精灵（blinking/breathing/walking/yawning），**挂载时预加载全部帧杜绝切换白闪**；右键菜单由父级 ContextMenuTrigger 承担保持纯展示。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuPetAvatarProps` | interface | 33-38 | state/size?/className? |
| `YanhuPetAvatar` | 组件 | 40-67 | 立绘渲染 |

内部：`SPRITE_SOURCES`（:17-22，4 PNG `@assets/IP/Cute_IP/`）、`SPRITE_LABELS`（:25-30，无障碍中文标签）。

## 3. 内部逻辑与关键流程

挂载 effect `new Image()` 预载 4 帧（:42-47）；容器 `pointer-events-none`、`role="img"`+`aria-label`；walking 态 `scale-[1.03]` 脉动（注释 :34）；img `object-bottom`+投影。

## 4. 调用者与调用链

入向：`YanhuPetFloatingHost`（立绘位）。出向：静态资源 PNG、`@profer/shared`（YanhuPetSpriteState）。

## 5. 数据 I/O、读写与副作用

静态资源加载（预载）；无网络。

## 6. 分支、失败、取消与恢复

无逻辑分支。

## 7. 权限与权威状态

- 纯展示边界：交互全在父级（头注 :4-5）；无障碍标签随态（:25-30）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：桌宠立绘显示/四态切换。
- 回归关注：预载防白闪、pointer-events-none（事件由父容器接管）。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| 预载语义 | 已证实 | :42-47 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `YanhuPetAvatar` | §3 | 40-67 | covered（未测） |
