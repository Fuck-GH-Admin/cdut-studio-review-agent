---
path: apps/electron/src/renderer/components/shared/ModelSelector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 955be5ee2d9a0646acd9f25de222fffa20a4b565
sha256: 2d4bae86337692501e2a95614ebece98d7e38d90989243f2c35268699b41a95c
lines: 540
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/ModelSelector.tsx

## 1. 结论与边界

模型选择器（文件头 `:1-8`，Dialog+Command 搜索）：大尺寸 Dialog、按渠道分组（灰色供应商标题行）、选中项左侧绿竖条高亮、触发按钮=模型 logo+名+Chevron。选择器含渠道订阅额度徽章（与上下文 Popover 共享态）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CompactModelSelectorCtx` | React.Context | `:41` | 紧凑模式（窄面板只显圆形 logo） |
| `ModelSelector` | function 组件 | `:133-540` | 主选择器 |

内部：`buildModelOptions`（`:50-96`）——**去重口径**（`:44-48`）：官方托管渠道可能同属一个平台网关（多个 New API 渠道），同名模型 UI 只出现一次；**用户自配渠道始终独立选项**（不同自配端点不视为同一路由）。`groupByChannel`（`:98-109`）；`ModelSelectorProps`（`:112-`）。

## 3. 内部逻辑与关键流程

1. **选项构建**：渠道列表→扁平选项（官方同名去重、自配保留）。
2. **分组渲染**：Command 列表按渠道分组（供应商标题行）。
3. **选择/搜索**：Command 过滤；选中回写；选中态绿竖条。
4. **额度徽章**：`ChannelPlanQuotaBadge` 挂渠道行（共享 usePlanQuota）。

### 3.1 选择器细节（源证补录）

- **未登录隐藏服务端托管官方渠道**（`:182`，防残留缓存渠道泄漏给未登录用户）。
- **strictProtocolFilter**：过滤不支持 preferredProtocol 的渠道（`:65`）；同名去重时 preferredProtocol 优先保留（`:78`）——**标签显示 preferredProtocol 防 DeepSeek 双协议误导**。
- **外部请求 seq 消费**（`:161-166`）：挂载记录当前 seq **不弹窗**，仅 seq+1 的新请求（ErrorMessage select_model 恢复操作）触发 Dialog。
- **multiplier 倍率口径**：选项携带 `model.multiplier`（`:87`）——计费倍率与模型能力分列。
- **stableModelInfoRef 防闪烁**（`:249-251`）：currentModelInfo 短暂为空时用最近有效值显示。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：输入区/设置（模型切换）。出向：`@profer/ui`（Dialog/Command）、`./ChannelPlanQuotaBadge`、`@profer/shared`（Channel/Model 类型）、jotai。

## 5. 数据 I/O、读写与副作用

经 props/atom 读渠道与当前模型；选择回调。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 官方同名 | `:44-48` | 去重一次 |
| 自配渠道 | `:47-48` | 恒独立 |
| 紧凑模式 | `:41` | 只显 logo |

## 7. 权限与权威状态

去重口径如实（防用户把不同自配端点误认为同一路由）。

## 8. 修改影响面

改选择器 → 影响模型切换全链；`ChannelPlanQuotaBadge`/shared 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 去重口径（官方/自配） | 已证实 | `:44-48` |
| 分组/紧凑模式 | 已证实 | `:98-109/:41` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Context/构建/分组/主组件 | 2/3 | `:41-540` | covered |
