---
path: apps/electron/src/renderer/components/settings/UsageSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a10f5c33139feac8cca4035e572e964d098867b7
sha256: 3d212df2971635ad3ef3a24d81a9de1b8f9b97913f02887cbbb71552d6e7d725
lines: 690
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/UsageSettings.tsx

## 1. 结论与边界

**使用偏好页**（`:1-12` 注释）：高频开关按五场景分区（通知与声音/对话浏览/Agent 执行展示/输入体验/语音输入占位）；**从「通用偏好」拆分而来，系统级与环境配置留在 GeneralSettings**（`:11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UsageSettings` | function（export） | `:87-469` | 五区设置页 |

内部：`SoundPicker`（**:486-586 三场景音效选择器**）、`AddSoundDialog`（`:591-690`）、`handleSoundFilePick`（**:118-170 音频校验**）、三 blur 归一化（`:227-251`）。

## 3. 内部逻辑与关键流程

1. **音效校验**（`:118-170`）：扩展名 7 种白名单（`:124-129`）；Audio 解码验时长 **≤10s**（`:153-158`）；`getPathForFile` 取真实路径（失败拒 `:144-151`）；默认名=去扩展名（`:161`）。
2. 自定义音效增删（`:173-205`）：`addCustomNotificationSound`/`removeCustomNotificationSound`（同时更新场景映射 `:197-199`）。
3. **矮窗口压缩输入框三字段**（**:98-108/:227-251，本地字符串草稿允许空/非法值，失焦归一化落盘**；空=回退默认、**0 合法=关闭紧凑档** `:225`；实时窗口内高提示触发态（退出需阈值 +60px 迟滞 `:426`））。
4. 五区 UI（`:264-452`）：通知（桌面/提示音/三场景 SoundPicker `:271-344`，disabled 级联）；对话浏览（自动归档 0/7/14/30/60 天+置顶条 `:347-379`）；Agent 展示（自动预览/保持展开 `:381-399`）；输入体验（**长文本 >2000 字转附件** `:408`、Markdown 实时渲染「关闭保留 @ 引用」`audio:417`、三高度字段 `:424-450`）。
5. SoundPicker（`:486-586`）：内置+自定义下拉、试听（自定义走 async `:503-507`）、行内删除、添加入口；`none`=无。
6. AddSoundDialog（`:591-690`）：accept 白名单、名称 30 字、Enter 确认、**添加按钮三条件禁用**（`:680`）。

## 4. 调用者与调用链

入向：设置页。出向：`@/atoms/notifications`/`ui-preferences`/`agent-atoms`/`preview-atoms`、`@/lib/composer-compact-height`、`@/hooks/use-window-inner-height`、`window.electronAPI`（getSettings/updateSettings/getPathForFile）、`./primitives`、sonner。

## 5. 数据 I/O、读写与副作用

写：设置（Main）；Audio 解码；音效播放。

## 6. 分支、失败、取消与恢复

校验失败 toast；三 blur 归一化容错。不适用取消/恢复。

## 7. 权限与权威状态

不适用（偏好层）；文件路径经 `getPathForFile` 合法获取（`:145`）。

## 8. 修改影响面

- 改音效校验（扩展名/10s/路径）→ 自定义音效安全与体验。
- 改三高度草稿/归一化逻辑 → 矮窗口输入框行为（文案与阈值耦合 `:426`）。
- 改通知 disabled 级联 → 设置项依赖关系。
- 改 SoundPicker 下拉结构 → 音效管理交互。
- 无测试锁定（§9）：改动需人工验证音效与紧凑档。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `UsageSettings|SoundPicker|AddSoundDialog` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+五区全链 | 已证实 | 逐行读 `:1-690` |
| atoms/紧凑档实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 五区+音效链 | §2/§3 | `:87-690` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
