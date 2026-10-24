---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3dce53f6583561e8cf0e6c60827c2b12ce9d59c1
sha256: d1679f6a266e6fb5738b0bf9b8fe78b8e35a458614aff58e7e54fe3efe287650
lines: 290
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetDialog.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

常驻灵动伴随卡片（290 行，头注 :1-10）：上栏（气泡或完整历史流）+下栏（紧凑输入条）；**默认气泡态无需操作即见输入框**（根治「输入框看不见」）；工具微胶囊；**回车上拦截隐藏特权指令 `/development-DevTool-MCC` 零 Token 消耗**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YANHU_DEV_COMMAND` | const | 21 | `/development-DevTool-MCC`（自动联想黑名单过滤，普通用户不可见） |
| `YanhuPetDialogProps` | interface | 23-54 | 消息/流/工具/回调群 |
| `YanhuPetDialog` | 组件 | 56-290 | 卡片主体 |

## 3. 内部逻辑与关键流程

1. **新手引导填充**（:78-85）：`fillRequest`（含 nonce 重复文本可触发）只填入不代发送+rAF 聚焦。
2. **特权指令拦截**（:110-125）：`submit` 中纯前端拦截 `YANHU_DEV_COMMAND`→清输入→`onDevCommand()`；**绝不向大模型发送**（注释 :112「Token 消耗恒等于 0」）。
3. **Enter 提交**（:128-134）：Shift+Enter 换行；中文输入法 `isComposing`/`keyCode 229` 拦截防误提交拼音。
4. **气泡模式判定**（:137-146）：streaming→executing（文本=最后工具 label/「正在读屏…」）；有 assistant→response；否则 idle。
5. **历史面板**（:152-224）：消息映射（user 右对齐/system 跳过/assistant 工具胶囊+MessageResponse+用量）；streaming 尾部追加工具胶囊+reasoning+streamText。
6. **输入条**（:233-286）：textarea 自适应高度（46-160px）；streaming 显示中止按钮否则发送。

## 4. 调用者与调用链

入向：`YanhuPetFloatingHost`（卡片内容）。出向：`./YanhuPetSpeechBubble`、`./pet-geometry`（BUBBLE/HISTORY_HEIGHT）、`@/components/ai-elements/message`。

## 5. 数据 I/O、读写与副作用

纯渲染（回调驱动宿主 IPC）。

## 6. 分支、失败、取消与恢复

空输入不发；composing 不提交；不抛。

## 7. 权限与权威状态

- 特权指令边界：`/development-DevTool-MCC` 前端拦截零 Token（:110-112）；黑名单过滤普通用户不可见（:20）。
- 输入可见性：默认态输入框常驻（头注 :7-8 口径）。

## 8. 修改影响面

- 受影响消费者：桌宠对话交互全链。
- 回归关注：特权指令零 Token、IME 拦截、fillRequest nonce。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/行号 | 已证实 | 逐行核对 |
| 特权指令/IME 拦截语义 | 已证实 | :110-134 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 特权拦截/提交/模式判定 | §3.2-3.4 | 56-146 | covered（未测） |
| 历史/输入条 UI | §3.5-3.6 | 152-290 | covered（未测） |
