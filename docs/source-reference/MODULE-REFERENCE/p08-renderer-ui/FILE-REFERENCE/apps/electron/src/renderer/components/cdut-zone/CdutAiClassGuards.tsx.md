---
path: apps/electron/src/renderer/components/cdut-zone/CdutAiClassGuards.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 56d7b30e8d7c988f3a339ba74c06d56ca34d63aa
sha256: 580dd88e47176bf43f37f1b0a06edaded785276736eeb56a11f6fd7eb1087818
lines: 69
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutAiClassGuards.tsx

## 1. 结论与边界

AI 速课堂**访问管控展示组件**（69 行）：两个受控展示组件（**不含业务状态，由父级决定渲染时机** `:4`）——`CdutAiClassComposerLock`（已登录但从侧边栏进入时锁定输入区）、`CdutAiClassContentGuard`（未登录且已开课时替换对话内容防泄露 `:5-6`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutAiClassComposerLock` | `:30-46` | `({onEnter})`：锁定占位卡（Lock 图标+"AI速课堂 请在 CDUT 专区 内交互"+说明+「前往 CDUT 专区」按钮），替换整个 composer（模型/附件/发送不可用 `:28`） |
| `CdutAiClassContentGuard` | `:51-69` | 无 props：CdutLogo+"需要登录特区账户查看本课堂"+说明+跳转按钮（`useGoToCdutZone` `:17-20`→activeViewAtom） |

内部：`useGoToCdutZone:17-20`（useCallback→`setActiveView('cdut-zone')`）、`CdutAiClassComposerLockProps:22-25`。

## 3. 内部逻辑与关键流程

两个纯展示组件+一个跳转 hook；无数据获取（渲染时机由父级控制——安全语义在父级）。

## 4. 调用者与调用链

AgentView/课堂会话容器（按登录态条件渲染）；出向 `@profer/ui`（Button）、`@/components/shared/CdutLogo`、`@/atoms/active-view`。

## 5. 数据 I/O、读写与副作用

纯渲染+atom 跳转。

## 6. 分支、失败、取消与恢复

不适用（受控展示）。

## 7. 权限与权威状态

- **防泄露语义**（`:6`/`:49`）："替换消息区，彻底阻断内容展示"——但**渲染时机由父级裁决**（`:4`），本组件只是展示层闸。
- 文案红线："为防止学习内容外泄，仅支持在 CDUT 专区 内继续提问与上传资料"（`:38`）。

## 8. 修改影响面

改守卫文案/跳转影响访问管控体验；父级条件渲染逻辑才是安全关键（不在本文件）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件两组件+hook | 已证实 | 69 行全读 |
| **边界**：安全语义依赖父级条件渲染（本层无登录态判断） | 已证实 | `:4` |
| 父级裁决实现 | 未知 | 调用方不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；父级裁决/实效 unknown。
