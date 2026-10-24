---
path: apps/electron/src/main/lib/agent-prompt-builder.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 85f5367cb7d341624fa9f56b4ee888546d1ba1f9
sha256: d3b2a374fa6ee41eac30b54aaeb0fc867dab16ea93698b68756f8c5c842a4a44
lines: 1051
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-prompt-builder.test.ts

## 1. 测试目标

系统提示词装配契约（1051 行/41 test/3 describe）：认识论姿态、速课堂三档、能力/工具裁剪、Pi vs Claude runtime 差异、平台 overlay 不双份、管线模式隔离、近因提醒恒末段。不运行（`NOT_RUN`）。

## 2. 用例清单

41 用例：
- `buildSystemPrompt`（:43，32 用例）：默认求实姿态+不可变底线（:44）、索引模式 conversation_memory 去 transcript 路径（:65）、经典模式保留 transcript（:83）、开放认识论（:97/:124）、速课堂 balanced/fast/strict 三档（:140/:159/:179/:203）、/grill-me（:224）、能力组禁用不渲染关闭段（:236）、Pi 裁剪保留姿态（:260）、PPT 门禁（:283/:299）、workspace profile（:308）、PROFER_CONFIG_DIR 隔离路径（:331）、Context 恢复不默认读 note.md（:355）、Pi/Claude 段落差异（:372）、Todo 指引（:417）、预设意图 gate（:445/:483）、极简预设（:499）、automation suppress 三层一致（:543）、Pi composer 静态裁剪不随用户文本变化（:581）、禁 memory 无团队记忆（:647）、单工具裁剪（:661）、Browser/Preview SOP 精确拼装（:679）、代码预设保留能力（:750）、六类硬禁用（:774）、平台 overlay 不复制双份核心（:801）、MCP 摘要不泄命令 URL（:851）、团队记忆工具名按 runtime（:867）。
- `buildSystemPrompt 皮肤创建指引`（:893，3 用例）：create_skin 可用固定目录不全盘扫描（:902）/禁用不注入（:915）+空 activeToolGroups 100% 同构（:920）。
- `系统提示词管线模式隔离与近因`（:937，6 用例）：CSLab 科学家身份无开发者块（:938）、速课堂无 artifacts/slash/messaging（:960）、常规保留（:992）、双轨锚点 shared 文法禁自定义 XML/表格竖线（:1005）、appendSystemPromptSections 近因恒末+缺失补齐（:1021）、索引模式禁扫 .context/agent-workspaces（:1038）。

## 3. 真实断言

形态以 `toContain`/`not.toContain`/`toBe`（字节级提示词断言为主）；:159「与显式传入字节一致」为确定性断言；:1021 近因位置断言。

## 4. 未覆盖与脆弱点

脆弱点：大量提示词文案断言（模板改动会红）；electron mock 于 :6-38 先行（动态 import :39-41 避污染）。未覆盖：buildDynamicContext 浏览器上下文分支（:851 仅 MCP 摘要部分）。mock 边界：真 buildSystemPrompt+假 ctx 字面量。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 41 用例计数与主题分布 | 已证实 | grep+逐段读 |
| 断言要点如 §2-3 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测面 | describe | 状态 |
| --- | --- | --- |
| buildSystemPrompt 全主题 | :43 | covered |
| 皮肤指引 | :893 | covered |
| 管线隔离/近因 | :937 | covered |
| buildDynamicContext 浏览器分支 | — | partial |
