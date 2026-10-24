---
path: apps/electron/src/renderer/components/agent/render-window.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7a1181a44cb7842df32cb801518980cce32549f
sha256: 95eea430fb51cff6dfff947c019a44ce7ae550a537967e8cf0d29298961b8e4b
lines: 76
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/render-window.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

渲染窗口（76 行，头注 :1-9）：一轮回复拆「过程」（思考+工具）与「回复」两段**各自独立尾部窗口**——过程几百段不把回复挤出可视区。只做渲染裁剪不改数据/派生计算。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RenderWindowLimits` | interface | 12-16 | replySegments/processSegments |
| `DEFAULT_RENDER_WINDOW` | const | 19-22 | 30/20（注释 :18「按实测调整」） |
| `WindowedTurnItems` | interface | 24-30 | items+foldedProcessItems+foldedReplyItems |
| `applyRenderWindow` | fn | 38-76 | 裁剪主入口 |

## 3. 内部逻辑与关键流程

`applyRenderWindow`（:38-76）：回复项（type='block'）取尾部窗口、更早进 `foldedReplyItems`；过程组（至多一个）尾部 `processLimit` 段保留、更早进 `foldedProcessItems`（`keepFrom===0` 时整组折叠）；不修改入参（返回新数组，注释 :35）；折叠段保留**原始 index**（测试断言展开配对依赖）。

## 4. 调用者与调用链

入向：过程分组渲染（`./ProcessBlockGroup` 类型来源，:10）。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无（新数组构造）。

## 6. 分支、失败、取消与恢复

limit 负值 clamp 0；空输入返回空三元组；不抛。

## 7. 权限与权威状态

- 完整性权威：窗口+折叠段=原始全集（不丢段，测试锁定）；索引保原位。无 sender/role 检查。

## 8. 修改影响面

长会话渲染性能/展开行为。同测：`render-window.test.ts`（12 用例 / 4 describe）。

## 9. 测试证据

直接测试 `render-window.test.ts`（12 用例 / 4 describe；纯函数+构造夹具；NOT_RUN）：
- 基本裁剪（3）：未超窗不折叠（:35-42）；过程超窗留最新 20 折叠最早 30（:44-55）；回复超窗折叠最早（:57-67）。
- 独立计数（2）：过程 300 段不挤 10 段回复（:71-79）；回复 200 段不挤 8 段过程（:81-86）。
- 完整性（2）：两侧超窗合并=原始 130 段无重复保序（:90-105）；折叠段 index 原位（:107-114）。
- 边界/纯函数（5）：空输入（:118-124）；仅回复（:126-131）；自定义上限（:133-140）；入参不被修改（:142-149）；过程组在前回复在后（:151-158）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/行号 | 已证实 | 逐行核对 |
| 独立窗口/不丢段/原位索引 | 已证实 | 测试族逐条 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `applyRenderWindow` 全分支 | §3/§9 | 38-76 | covered |
| 默认/自定义上限 | §2/§9 | 19-22 | covered |
