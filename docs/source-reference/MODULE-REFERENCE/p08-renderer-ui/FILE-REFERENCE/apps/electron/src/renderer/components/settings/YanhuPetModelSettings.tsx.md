---
path: apps/electron/src/renderer/components/settings/YanhuPetModelSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf0545ef929280ed5722b4a32de849d0cddfd4f2
sha256: c6290bc59587fb35692cba040297ae999f7479b730ce517093160a2ead499dba
lines: 150
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/YanhuPetModelSettings.tsx

## 1. 结论与边界

**智联万站「砚小龙」专属模型配置**（`:1-6` 注释）：为桌宠单独指定渠道/模型；**未配置时无缝继承全局默认激活渠道**；持久化 `~/.cdutai/yanhu-pet-history.json` 经主进程 `yanhuExpress.petSaveConfig` 写入（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuPetModelSettingsProps` | interface（export） | `:13-15` | `{channels: Channel[]}` |
| `YanhuPetModelSettings` | function（export） | `:20-150` | 三控件设置卡 |

内部：`SELECT_CLASS`（`:17-18`）、`enabledChannels/targetChannel/models`（仅启用项 `:50-55`）、`persist`（`:57-68`）。

## 3. 内部逻辑与关键流程

1. 加载（`:27-48`）：`petGetConfig` 取三值；alive 防泄漏；无 api 直接 loaded。
2. **回落逻辑**（**:70-84，渠道/模型被停用或删除后回落「继承全局默认」，防下拉空白并连带禁用模型下拉**）。
3. 三控件：对话渠道（空=继承全局 `:116`）、对话模型（空=渠道默认 `:131`）、**视觉截图辅助感知**（页面信息不足时触发视口截图交多模态模型；**需所选渠道支持 Vision** 提示 `:139-146`）。
4. 变更即 `petSaveConfig`（`selectedChannelId/selectedModelId/enableVision`；enableVision 关闭时存 `undefined` `:100`）。

## 4. 调用者与调用链

入向：设置页。出向：`./primitives`、`window.electronAPI.yanhuExpress`（petGetConfig/petSaveConfig）、`@profer/shared`（PROVIDER_LABELS）。

## 5. 数据 I/O、读写与副作用

读写桌宠配置（经 Main）；console 无。

## 6. 分支、失败、取消与恢复

加载/回落/空值分支；catch 静默（`:41/:65/:100`）。不适用取消/恢复。

## 7. 权限与权威状态

不适用（配置面）；继承语义=空值即全局默认（`:106/:116`）。

## 8. 修改影响面

- 改回落逻辑（`:70-84`）→ 渠道删除后的下拉行为。
- 改 persist 载荷（undefined 语义）→ 桌宠配置存储口径。
- 改视觉开关接线 → 截图辅助感知行为与多模态前提。
- 改渠道/模型过滤（仅 enabled）→ 可选范围。
- 无测试锁定（§9）：改动需人工验证桌宠配置。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `YanhuPetModelSettings` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+回落/持久化全链 | 已证实 | 逐行读 `:1-150` |
| yanhuExpress 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+三控件 | §2/§3 | `:20-150` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
