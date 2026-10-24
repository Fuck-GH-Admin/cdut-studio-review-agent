---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6c143e7a76adcfa7aa790d9f0fd1b47e340b55b2
sha256: 70ae3750a6b0239f572822486a83d77785b0179fa3c6272d159763126af8f5c5
lines: 195
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-prompt.ts

## 1. 结论与边界

砚小龙**系统提示词组装器**（195 行）：基础人设常量 + 条件化能力指引（视觉/开发者工具）+ 真实挂载工具清单。设计原则（`:179` 注释）：basePrompt **不含任何"以下工具可用"式静态清单**——工具清单动态生成，防"提示词宣传未挂载工具"（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts:519` 历史问题）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `YANHU_PET_SYSTEM_PROMPT` | 中段常量 | 基础人设与工作流约束（用户称呼/任务守则等） |
| `YANHU_VISION_GUIDANCE` | 常量 | 视觉截图辅助指引（仅视觉双工具齐挂时注入） |
| `buildDeveloperGuidance` | `:166-174` | 开发者级回退工具段（`<developer_tools>` 块，enabled 时） |
| `buildYanhuPetSystemPrompt` | `:182-195` | `(basePrompt, tools) => string`：base + 视觉指引（VISION_TOOL_PAIR 全挂才加 `:188`）+ 开发者指引 + 挂载工具清单段 |

内部：`VISION_TOOL_PAIR`（视觉工具对）、`DEVELOPER_TOOL_BRIEFS`（开发者工具简述表）、`buildMountedToolsSection`（清单段生成）、`YanhuPromptTool` 类型。

## 3. 内部逻辑与关键流程

四段拼接（`\n\n` 连接）：basePrompt.trimEnd() → 条件视觉段 → 条件开发者段 → 恒定挂载清单段。纯函数无副作用。

## 4. 调用者与调用链

`yanhu-pi-runtime` sendToModel（`:38-40` import，组装系统提示词）；出向 `@profer/shared` 工具定义类型。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

条件注入二分支（视觉对齐齐才注入、开发者 bullets 空→null）。

## 7. 权限与权威状态

**动态清单契约**（`:179`）：工具可用性以真实挂载为准；开发者级默认关（指引仅 enabled 时出现）。

## 8. 修改影响面

改人设影响桌宠行为；清单段改动影响模型工具选择；与 pi-runtime 工具白名单联动。

## 9. 测试证据

**有直接测试** `apps/electron/test/yanhu-pet-prompt.test.ts`（批外，7 处引用本函数，主根 grep 复核——此前"0 命中"为检索失误）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/组装逻辑 | 已证实 | 195 行全读 |
| basePrompt 无静态清单 | 已证实 | `:179` 注释+结构 |
| 实际提示词文本 | 已证实 | 文件内常量（原文照抄于源码） |

## 11. 覆盖表

全文件 covered；测试 §9 unknown。
