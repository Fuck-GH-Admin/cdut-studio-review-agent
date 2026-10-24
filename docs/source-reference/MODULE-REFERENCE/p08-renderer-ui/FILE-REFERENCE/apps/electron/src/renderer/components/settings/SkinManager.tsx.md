---
path: apps/electron/src/renderer/components/settings/SkinManager.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f69a227d0d88fb4a75ae53978b2453f039387e94
sha256: 640a0a071fba1d931302a13c42c0e67259918ad8fa9366e15a4f752843f016e9
lines: 88
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/SkinManager.tsx

## 1. 结论与边界

**皮肤管理器设置区**：导入 ZIP/文件夹、内置/用户皮肤选择、制作指南。红线：**官方磁盘模板是唯一真源**——设置页复制内容与「打开官方模板目录」完全一致（`:8`）；描述明示「用户皮肤存放在本机，不会同步到云端」（`:31`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkinManager` | function（export） | `:12-43` | skins/themeMode/themeStyle/busy + 四回调 |

内部：`SkinGroup`（`:45-69`）、`SkinPreview`（`:71-80`）、`CopyTemplate`（`:82-84`）、`SkinAuthoringGuide`（`:86-88`）；模板文本 `?raw` 导入（`manifest.json`/`skin.css` `:9-10`）。

## 3. 内部逻辑与关键流程

1. 分组（`:24-25/:35-36`）：builtin/user 两卡；空态提示。
2. 选择/删除（`:60-64`）：active 判定 `themeMode==='special' && themeStyle===skin.id`（`:58`）；删除按钮 aria-label 包名。
3. 预览（`:71-80`）：`getSkinPreview` 异步取图（cancelled 防泄漏）；scale/position 按 skin 配置。
4. 制作指南（`:86-88`）：目录结构、manifest（kebab-case/tone/Surface Contract v2）、skin.css（`:root` HSL token）、消息样式语义（**`--message-surface` 是可选 token，修改不自动卡片化**，需显式 `.message-item` 规则）、**图片安全规则**（assets 白名单格式/4MB、预览 2MB、`cdut-skin://` 协议改写、**禁外链/file:/data:/@import/@font-face/`../`**、包 5MB/CSS 512KB）——与 skin-manager-service 校验口径一致。

## 4. 调用者与调用链

入向：外观设置页。出向：`./primitives`、`window.electronAPI`（getSkinPreview/openSkinTemplateFolder）、clipboard、sonner。

## 5. 数据 I/O、读写与副作用

读预览图；clipboard 写；导入/删除经回调（Main）。

## 6. 分支、失败、取消与恢复

预览失败静默占位（`:75`）；复制失败 toast。不适用取消/恢复。

## 7. 权限与权威状态

红线：官方模板唯一真源（`:8`）；安全规则文案与 Main 校验一致（§3.4）。

## 8. 修改影响面

- 改导入/删除回调接线 → 皮肤库管理链。
- 改模板文本导入（`?raw`）→ 复制内容与官方模板一致性（红线）。
- 改安全规则文案 → 与 skin-manager-service 校验口径的一致性。
- 改预览取图/active 判定 → 皮肤选择 UX。
- 无测试锁定（§9）：改动需人工验证皮肤管理。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SkinManager` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部 | 已证实 | 逐行读 `:1-88` |
| 皮肤服务链 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+指南 | §2/§3 | `:12-88` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
