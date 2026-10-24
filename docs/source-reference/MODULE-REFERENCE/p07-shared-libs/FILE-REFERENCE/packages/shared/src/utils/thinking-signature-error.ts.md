---
path: packages/shared/src/utils/thinking-signature-error.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1a2d345bbefd4074349f7cb17a424a09988b912b
sha256: e9860c5236d55379e106781cf16bc35d4b37c7fe6a35af6c6e41dd2efa6732ff
lines: 24
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/thinking-signature-error.ts

## 1. 结论与边界

思考签名错误（thinking signature invalid）的**识别与用户文案归一**：24 行薄模块，3 常量 + 3 函数。业务语义（`:3-4`）：多因中途切换模型、思考标签不互认；提示切回原模型或在新对话引用当前会话。

边界：只做消息匹配与文案替换，不做重试/恢复（调用方职责）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `THINKING_SIGNATURE_ERROR_CODE` | const | 1 | `'thinking_signature_invalid'` | |
| `THINKING_SIGNATURE_ERROR_TITLE` | const | 2 | `'思考内容无法继续'` | |
| `THINKING_SIGNATURE_ERROR_MESSAGE` | const | 3-4 | 完整用户提示文案 | |
| `isThinkingSignatureError` | function | 7-18 | `(...messages: Array<string\|null\|undefined>) => boolean` | |
| `formatThinkingSignatureError` | function | 20-22 | `() => string` | `title：message` |
| `normalizeThinkingSignatureError` | function | 24 | `(error: string) => string` | 命中→标准文案，否则原样 |

## 3. 内部逻辑与关键流程

`isThinkingSignatureError`（`:7-18`）：消息合并（过滤空）→ **剥反引号**（`:11`，注释：API 报错如 ``Invalid `signature` in `thinking` block`` 被反引号包裹，`\s+` 无法跨反引号）→ 三形态正则（`:15-17`）：① `invalid signature…thinking block`（原生 Anthropic）；② 顺序颠倒变体（间隔 ≤240 字符）；③ `signature: Field required`（中转/网关把 `content.N.thinking.signature` 路径脱敏成 `***` 后的 Pydantic 校验报错）。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：

- `THINKING_SIGNATURE_ERROR_CODE`：`apps/electron/src/main/lib/agent-orchestrator.ts:41,2930,3413`、`renderer/components/agent/SDKMessageRenderer.tsx:72,1450`。
- `TITLE`/`MESSAGE`：`agent-orchestrator.ts:42-43,3414-3418`、`SDKMessageRenderer.tsx:73-74,986,1452-1453`、`adapters/pi-agent-adapter.ts:41-42,661-662`。
- `isThinkingSignatureError`：`SDKMessageRenderer.tsx:75,985,1451`、`pi-agent-adapter.ts:43`（**别名 `matchesThinkingSignatureError`**，聚合 errorHelpers `:2554`）、`agent-orchestrator.ts:3316,3406`（经 errorHelpers）、`packages/shared/src/types/agent-provider.ts:108`（接口方法声明）。
- `formatThinkingSignatureError`/`normalizeThinkingSignatureError`：**零外部引用**（仅 barrel/模块内互调）。
- **同名碰撞警示**：`pi-agent-adapter.ts:553` 本地同名 `isThinkingSignatureError(message, originalError)`（签名不同，shared 版已别名并存）。
- 产品入口 main（agent-orchestrator/pi-agent-adapter）+ renderer（SDKMessageRenderer）；无测试。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径；「恢复」语义=文案引导（切回模型/新对话引用，`:3-4`）——执行由调用方。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

正则三形态是错误识别契约（漏配→用户看到原始报错；误配→普通错误被改写）；文案被 UI 错误面板展示（caller 见 §10）。

## 9. 测试证据

无同名测试文件（`url-nul-safety.test.ts` 不同主题）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三形态正则+反引号剥离 | 已证实 | `:11-17` |
| 归一入口（命中换文案） | 已证实 | `:24` |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 真实 API 错误形态覆盖 | 未知 | 三形态为已知枚举，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 常量 + 3 函数 | §2 | 1-24 | covered |
| 三形态匹配 | §3 | 7-18 | covered |
