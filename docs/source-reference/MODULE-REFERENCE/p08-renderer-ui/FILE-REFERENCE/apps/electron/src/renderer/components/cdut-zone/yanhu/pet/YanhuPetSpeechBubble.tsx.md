---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetSpeechBubble.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a869bbd0bb1e45a9cc6cbad33e4539077c06f1a
sha256: 316e9711b8cd89e35edee3c63e9d9b31429c4cff181fb5c0c9ff6be9baa61471
lines: 254
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetSpeechBubble.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

灵动说话气泡（254 行，头注 :1-8）：漫画式尖角指向桌宠；闲置态萌系问候（点击换句、打哈欠切闲聊）、执行态微胶囊动作流、回复态最新结论、右上角展开/收起历史。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuToolCapsule` | 组件 | 62-105 | 工具微胶囊（点击展开入参/出参） |
| `YanhuUsageBadge` | 组件 | 137-166 | 用量徽章（Tooltip 明细） |
| `YanhuPetSpeechBubble` | 组件 | 168-254 | 气泡主体 |
| `YanhuPetSpeechBubbleProps` | interface | 38-59 | mode/text/streaming/activeTools/… |

内部：`IDLE_GREETINGS`（:17-23）、`SLEEPY_LINES`（:26-30）、`formatPetDuration`（:108-113）、`buildPetUsageTooltip`（:116-125）。

## 3. 内部逻辑与关键流程

1. **微胶囊**（:62-105）：status 三色调（error 红/running 主色脉动/普通灰）；展开显示 `入参: JSON`/`出参` pre 块。
2. **用量**（:108-166）：耗时格式（ms/s/m）与主视图口径一致（注释 :107）；Tooltip 展开耗时+输入/输出/缓存 tokens。
3. **气泡**（:168-254）：尖角 `tailSide` 旋转 45° 小方块；顶栏状态点（streaming 脉动/绿）；idle 问候点击 `setGreetingIndex+1`（pool 按 sleepy 切换）；executing 文本+微胶囊流；response `MessageResponse` 渲染+用量徽章。

## 4. 调用者与调用链

入向：`YanhuPetDialog`（气泡态上栏）。出向：`@/components/ai-elements/message`（MessageResponse）、`@profer/ui/primitives/tooltip`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

无 I/O 分支；usage 双缺省→徽章 null。

## 7. 权限与权威状态

- 口径一致权威：耗时/用量格式与主视图一致（:107/:115 注释）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：桌宠气泡/历史列表（微胶囊与徽章共用）。
- 回归关注：尖角指向、微胶囊展开、用量口径。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 口径一致注释约定 | 已证实 | :107/:115 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 微胶囊/用量/气泡 | §3 | 62-254 | covered（未测） |
