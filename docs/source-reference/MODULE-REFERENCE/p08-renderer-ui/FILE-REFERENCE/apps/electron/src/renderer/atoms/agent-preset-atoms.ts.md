---
path: apps/electron/src/renderer/atoms/agent-preset-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c4c8b5af9043d4abf5e38c0058d428a202136f4
sha256: 03c1a249537a27edf02fdef27a33928ff8cad2dafe1b6a5dc3cd1fc912261f3c
lines: 54
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-preset-atoms.ts

## 1. 结论与边界

按工作区缓存的预设列表与绑定映射（头注释 :2-7）：预设为工作区级配置按需加载缓存；无工作区会话用独立缓存键仍可选内置元预设。

## 2. 导出与关键符号

导出 5 条（`export` :15/:19/:29/:34/:51）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `agentPresetsAtom` | `:15` | Map<workspaceSlug, AgentPreset[]> |
| `agentPresetsLoadedAtom` | `:19-25` | 已加载键集合（注释 :17：空列表须加载完成才代表真没有） |
| `agentPresetCacheKey(slug?)` | `:29-31` | 无工作区→`'__no_workspace__'`（:27） |
| `workspacePresetsAtom` | `:34-44` | atomFamily 每工作区缓存读写 |
| `presetOf(presets, presetId?)` | `:51-54` | 解析：**不能用 shared normalizePresetId（只认内置），自定义 ID 直接匹配**（:48-50 注释）；缺省回 DEFAULT_PRESET_ID |

## 3. 内部逻辑与关键流程

presetOf 二分支（:52-53）；atomFamily 缓存 Map 不可变更新（:39-41）。

## 4. 调用者与调用链

入向：技能视图/会话工具栏（头注释 :4-5）。出向：jotai/utils（atomFamily）、`@profer/shared`（DEFAULT_PRESET_ID :12）。

## 5-7. 数据/分支/权限

纯状态；presetOf 分支；不适用。

## 8. 修改影响面

- 消费面：预设选择/绑定链。
- 依赖面：AgentPreset 形状。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；自定义 ID 直配契约 | 已证实 | :48-54 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+presetOf | §2/§3 | :15-54 | covered |
