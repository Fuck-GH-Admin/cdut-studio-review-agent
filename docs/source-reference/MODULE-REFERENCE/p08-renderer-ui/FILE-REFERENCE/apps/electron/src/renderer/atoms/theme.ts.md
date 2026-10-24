---
path: apps/electron/src/renderer/atoms/theme.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 593092c4cc03175da529e8487d8a63e7945ada86
sha256: b6d63eaee4b69760c73d858c83d72e7ef90dc35d35a4a71870acefc7125e9f16
lines: 469
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/theme.ts

## 1. 结论与边界

**主题状态原子**（`apps/electron/src/renderer/atoms/theme.ts:1-10`）：`themeModeAtom`（浅/深/跟随系统/特殊风格，**持久化 `~/.proma/settings.json`**，`:5`）、`themeStyleAtom`（特殊风格）、`systemIsDarkAtom`、`resolvedThemeAtom`（派生 light|dark）。**localStorage 作缓存避免加载闪烁**（`:10`）。

## 2. 导出与关键符号

`export` 共 **18 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `themeModeAtom` | const | `:94` | — |
| `themeStyleAtom` | const | `:97` | — |
| `interfaceVariantAtom` | const | `:128` | — |
| `systemIsDarkAtom` | const | `:131` | — |
| `skinsAtom` | const | `:138` | — |
| `activeSkinIdAtom` | const | `:146` | — |
| `resolvedThemeAtom` | const | `:162` | — |
| `loadSkins` | async | `:182` | — |
| `skinCssAppliedRevisionAtom` | const | `:215` | — |
| `whenSkinCssApplied` | function | `:218` | — |
| `refreshSkinRegistry` | async | `:264` | — |
| `handleSkinsChanged` | async | `:275` | — |
| `applyThemeToDOM` | function | `:299` | — |
| `applyInterfaceVariantToDOM` | function | `:364` | — |
| `initializeTheme` | async | `:389` | — |
| `updateThemeMode` | async | `:450` | — |
| `updateThemeStyle` | async | `:458` | — |
| `updateInterfaceVariant` | async | `:466` | — |

## 3. 内部逻辑与关键流程

- 主题四原子（`:5-8`）；localStorage 缓存（`:10`、`:16`）。
- 皮肤 tone 缓存（`:20-42`）：首帧防闪烁（皮肤注册表 IPC 不可及，本地缓存推断）。
- 持久化权威 `~/.proma/settings.json`（`:5`）。

## 4. 调用者与调用链

- 消费方：`<UiScaleContainer>` 同族（主题应用）、index.html 首帧脚本。
- 出向：localStorage、settings IPC。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

settings.json 权威+localStorage 缓存（防闪烁）双层；首帧 tone 推断（`:20`）。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

主题原子集/双层缓存契约已证实（`:1-42`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 主题原子集 | `:5-469` | covered |
| tone 缓存 | `:16-42` | covered |
