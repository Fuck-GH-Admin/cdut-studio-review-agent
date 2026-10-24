---
path: apps/electron/src/renderer/hooks/useConversationSettings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f7fb809dadaa017bd546ff2aa8bf1b470d4de816
sha256: 687a3c14b5fee5d928345a1ccc891e59ab9814d9c004a722c052e798f46c76e8
lines: 115
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useConversationSettings.ts

## 1. 结论与边界

**per-conversation 设置读写 hooks**（115 行，注释 `:1-6`）：从 Map atoms 按 conversationId 读取缺省回全局默认；conversationId 经 Context 获取免 props 透传。

## 2. 导出与关键符号

5 导出 hook：`useConversationModel`（`:57`）/`useConversationModelOptional`（`:66`，Provider 外返回 null，ModelSelector 双模式）/`useConversationContextLength`（`:90`）/`useConversationThinkingEnabled`（`:99`）/`useConversationParallelMode`（`:108`）。内部通用辅助：`useMapValue`（`:26`）/`useMapSetter`（`:31`，函数式更新取当前值兜底默认）。

## 3. 内部逻辑与关键流程

模式统一（`:57-63` 等）：`useConversationId()`→Map 读（缺省=全局 atom 默认）+Map setter（不变式：set 新 Map 保不可变）。Optional 变体（`:66-87`）：无 conversationId→value null+setter null（短路写入 `:75`）。

## 4. 调用者与调用链

- 入向：对话输入区（模型选择器/上下文长度/思考/并排开关，域外）。
- 出向：conversation-atoms（7 个 Map/默认 atom）、`@/contexts/session-context`。

## 5. 数据 I/O、读写与副作用

写 per-conversation Map atoms（会话级设置覆盖）。

## 6. 分支、失败、取消与恢复

Provider 外 Optional 分支；函数式 setter 兜底默认值（`:42-44`）。

## 7. 权限与权威状态

设置优先级权威=会话覆盖 > 全局默认（`map.get(key) ?? defaultValue`）。

## 8. 修改影响面

会话级模型/上下文/思考/并排设置的隔离与回落；ModelSelector 双模式依赖 Optional 语义。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 hook/回落语义/Optional 短路 | 已证实 | `:1-115` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+2 辅助 | §2/§3 | 26-113 | covered |
