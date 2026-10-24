---
path: apps/electron/src/main/lib/app-theme-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8ac211c5b1443a8d067b40f41ce3dd5d99d67893
sha256: 348d12eed83b8da29591131bec149bbaad14610631aeba90fc7ec9cba210830b
lines: 43
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/app-theme-service.ts

## 1. 结论与边界

**主进程侧明暗解析**（43 行）：viewer 页（无 preload 沙箱 webContents）主题只能"打开时烘进 URL"（`:4-5`）；Agent `BrowserPreviewOpen` 等只有主进程上下文的入口必须在此兜底（`:6-8`）。口径与渲染进程 `resolvedThemeAtom` 一致（`:10`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `resolveAppThemeIsDark` | `:28-43` | light/dark/system（`nativeTheme`）直接判定；special（皮肤）→注册表 `tone` 优先→id 后缀启发式回退（`:12-13`）；注册表失败 warn 后回退 |

内部：`inferSkinToneIsDark:24-26`（非 `-light` 后缀即 dark，与渲染层同向 `:23`）。

## 3. 内部逻辑与关键流程

settings 读取→四分支（三模式+皮肤 tone 链）→启发式兜底。

## 4. 调用者与调用链

BrowserPreviewOpen 工具/预览 URL 构造；出向 `./settings-service`、`./skin-service`、`electron` nativeTheme。

## 5. 数据 I/O、读写与副作用

读 settings/皮肤注册表；无写。

## 6. 分支、失败、取消与恢复

scanSkins 抛错→warn+id 后缀推断（`:39-42`）。

## 7. 权限与权威状态

- **仅解析明暗**（`:15-16`）：皮肤配色只有渲染层算得出，兜底入口拿"该明暗默认配色"（能力边界照实）。
- 口径对齐渲染层（跨层一致契约 `:10`）。

## 8. 修改影响面

改判定影响沙箱预览主题一致性；启发式与 index.html 首帧脚本/`inferSkinToneFromStyle` 同向联动。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/口径契约/能力边界 | 已证实 | 43 行全读 |
| 渲染层口径实际一致性 | 未知 | 渲染层不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；跨层一致性/实效 unknown。
