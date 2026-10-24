---
path: apps/electron/src/renderer/hooks/use-is-dark-theme.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c8363fc4f2f2510412e08e5c30182eac7261948f
sha256: 60106096f3ecbf98e626f3cf75f70b9f39d1c118b56c05cc267f4f1605c69d40
lines: 18
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/use-is-dark-theme.ts

## 1. 结论与边界

**深色判定 hook**（18 行）：`DOM .dark 类 OR resolvedTheme==='dark'` 取或——首帧防闪烁（头注释 `:4-7`：冷启动 atom 未水合时 index.html 已同步写 .dark，DOM 视为"已生效事实"）。

## 2. 导出与关键符号

1 导出：`useIsDarkTheme(): boolean`（`:12`）。依赖 `resolvedThemeAtom`（`@/atoms/theme`）。

## 3. 内部逻辑与关键流程

（`:13-17`）：`document.documentElement.classList.contains('dark') || theme==='dark'`；SSR 安全（`typeof document` 判定回落纯 atom）。

## 4. 调用者与调用链

- 入向：logo 渲染等主题敏感组件（如 SessionMiniMap ItemIcon，nb-113 批）。
- 出向：theme atom。

## 5. 数据 I/O、读写与副作用

无（读 atom+DOM 类，只读）。

## 6. 分支、失败、取消与恢复

document 缺省（SSR）分支；无抛错。

## 7. 权限与权威状态

主题事实权威=DOM `.dark`（覆盖 atom 未水合窗口，注释 `:4-7`）。

## 8. 修改影响面

所有依赖深浅判定的资源选择（模型 logo/皮肤图）；判定口径变更会引发注释所述"亮→暗一帧跳变"回归。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 取或语义/SSR 回落/防闪烁意图 | 已证实 | `:1-18` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 12-17 | covered |
