---
path: apps/electron/src/renderer/components/settings/DeveloperSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0573e152985e7e8575520271246abcb2489cce00
sha256: 3e429ca6a1cd9a281e3135c443b8e76a9fe88e550bdace26c7b7f6932e1ae1b1
lines: 150
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/DeveloperSettings.tsx

## 1. 结论与边界

**开发者模式面板**：开放认识论开关、双检索引擎（HippoRAG/GraphRAG）切换、运行时边界说明、退出开发者模式（`:1-8` 组件语义）。写路径=`updateSettings`（乐观更新+失败回滚）。注意文案边界声明：这些开关"不会绕过权限、安全规则或模型服务端约束"（`:102,137-139`）。

## 2. 导出与关键符号

1 导出：`DeveloperSettings`（`:9`）。状态：`memoryEngine:'classic'|'hipporag'`、`studyEngine:'classic'|'graphrag'`（`:15-16`）、`saving`。atoms：`developerModeEnabledAtom`/`openEpistemicModeEnabledAtom`/`settingsTabAtom`。

## 3. 内部逻辑与关键流程

- 加载（`:18-28`）：`getSettings` 归一两引擎（读失败保持 classic，`:25-27`）。
- `updateMemoryEngine`（`:30-45`）/`updateStudyEngine`（`:47-62`）：乐观 set→`updateSettings`→按返回值校正→toast；失败**回滚 previous**（`:40,57`）。
- `updateOpenEpistemicMode`（`:64-78`）：同构；文案声明"从下一轮 Agent 消息起生效"（`:71`）。
- `exitDeveloperMode`（`:80-96`）：`updateSettings({developerModeEnabled:false, openEpistemicModeEnabled:false})`→跳回 general 标签（`:89`）。
- 渲染（`:98-148`）：认识论开关（`:105-111`）+双引擎开关（`:120-133`）+运行时边界说明（Claude 开认识论时不叠加本地 preset 改用自管 system prompt；Pi 恒自管，`:137-140`）+退出按钮。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（developer 标签，developerModeEnabled 时显示，本批）。
- 出向：jotai atoms、`window.electronAPI.getSettings/updateSettings`。

## 5. 数据 I/O、读写与副作用

读写 `settings.json`（memoryRetrievalEngine/studyRetrievalEngine/openEpistemicModeEnabled/developerModeEnabled）；toast 反馈。

## 6. 分支、失败、取消与恢复

三处保存失败→回滚 previous+toast；无取消。

## 7. 权限与权威状态

**边界声明**（`:102,137-139`）：开关改变注入姿态，不移除模型服务端安全/法律规则——权威不在本组件（照实记录为声明）。

## 8. 修改影响面

检索引擎链路切换（全局、立即/下轮生效语义按文案）；开发者模式入口。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三开关语义/回滚/边界文案 | 已证实 | `:1-150` 全文 |
| 引擎切换实际生效语义（立即 vs 下轮） | 推断（文案声明） | `:71,122,129` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+4 处理函数 | §2/§3 | 9-148 | covered |
