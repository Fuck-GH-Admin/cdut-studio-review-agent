---
path: packages/ui/src/primitives/tabs.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a9cebd1ce7f51c181f794b8b386a219aead58d2c
sha256: 14d96c6fe1da09f95b99b5fcb212af36bef6fb55a323bf81594077f16a7d926b
lines: 53
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/tabs.tsx

## 1. 结论与边界

Radix Tabs 的**纯 UI 样式包装**：Root 直接别名 + List/Trigger/Content 三个 forwardRef 样式组件，无逻辑/状态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Tabs` | 导出常量 | 6 | `TabsPrimitive.Root`（原样别名，无样式包装） | |
| `TabsList` | 导出组件 | 8-21 | `forwardRef<TabsPrimitive.List>` | displayName 继承（`:21`） |
| `TabsTrigger` | 导出组件 | 23-36 | `forwardRef<TabsPrimitive.Trigger>` | displayName 继承（`:36`） |
| `TabsContent` | 导出组件 | 38-51 | `forwardRef<TabsPrimitive.Content>` | displayName 继承（`:51`） |

统一导出 `:53`。依赖 `@radix-ui/react-tabs`、`../lib/cn`（`:1-4`）。

## 3. 内部逻辑与关键流程

List（`:12-19`）：`h-9 rounded-lg bg-surface-sunken`；Trigger（`:27-34`）：`data-[state=active]:bg-surface-raised/…:shadow`，disabled 态禁用；Content（`:42-49`）：`mt-2` + focus ring。全部 `className,...props` 透传。

## 4. 调用者与调用链

入向：1 个消费文件——`apps/electron/src/renderer/components/agent-skills/SkillDetailSheet.tsx:17`（Tabs 全家桶）。出向：Radix、`cn`。

## 5. 数据 I/O、读写与副作用

无（受控/非控语义由 Radix Root props 决定）。

## 6. 分支、失败、取消与恢复

仅 active/disabled 样式分支；无错误路径。

## 7. 权限与权威状态

无权限分支（纯展示）。

## 8. 修改影响面

改样式影响 SkillDetailSheet 的选项卡外观；`Tabs` 为原样别名——改包装行为会改变受控接口。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出与样式分支 | 已证实 | `packages/ui/src/primitives/tabs.tsx:6-53` |
| 唯一消费者 | 已证实（静态） | 冻结树检索 `primitives/tabs`（单双引号）仅 SkillDetailSheet.tsx:17 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Tabs/TabsList/TabsTrigger/TabsContent | §2/§3 | 6-53 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
