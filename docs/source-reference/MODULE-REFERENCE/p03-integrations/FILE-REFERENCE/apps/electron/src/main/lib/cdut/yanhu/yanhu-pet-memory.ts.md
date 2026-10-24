---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-memory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c6d8b8a36f36da37c3d48f1c80b277013b75b1e7
sha256: c7e3866223994f9bcf8c48796f115b9331cddece75d1ba791de9684a7877bcff
lines: 289
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-memory.ts

## 1. 结论与边界

砚小龙**记忆库与配置**（289 行）：0~1000 条滑动窗口、原子落盘 `~/.cdutai/yanhu-pet-history.json`；刻意不依赖 Electron/适配器便于纯函数单测（`:5`）。落盘版本 v3（v2 常驻伴随模式、v3 坐标迁移复位，`:13-17`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `YANHU_PET_STORE_VERSION=3` | `:18` | 落盘结构版本 |
| `MAX_YANHU_MEMORY=1000`/`DEFAULT_MEMORY_LIMIT=50` | `:20`/`:22` | 硬上限/默认窗口 |
| `YanhuPetStoreData` | `:25-29` | `{version, config, messages}` |
| `createDefaultYanhuPetConfig` | `:32-39` | `{dialogPosition:'right', isCollapsed:false, memoryLimit:50, petPosition:{24,24}}` |
| `normalizeYanhuPetConfig` | `:42-73` | 收敛非法值：memoryLimit clamp 0-1000 截断、isCollapsed 仅显式 true、petPosition 取整、devTools/enableVision 仅显式 true 否则 undefined（`:68-71` 缺省关闭红线） |
| `normalizeYanhuPetMessageUsage` | `:76-90` | 6 数值字段逐个有限性校验，全空→undefined |
| `normalizeYanhuPetMessage` | `:93-…` | role 白名单（user/assistant/system）损坏丢弃 |
| `normalizeYanhuPetConfig` 族 + `nextYanhuMessageId`/`resolveInjectedHistory`/`toChatMessages`/`healYanhuMessages` | `:130-248` | 消息归一/注入历史/转 Chat 格式/自愈 |
| `YanhuPetMemoryStore` | `:251-286` | `open()`（读+归一+迁移）、`upsertMessage`、`rewrite`（原子写）、`clear`；`getYanhuPetHistoryPath` |
| `getYanhuPetHistoryPath` | `:288-289` | `getConfigDir()/yanhu-pet-history.json` |

## 3. 内部逻辑与关键流程

装载链：readJsonFileSafe → version 判定/迁移 → normalize 逐条（损坏丢弃）→ 记忆窗口截断（`messages.slice(-memoryLimit)` `:278-279`）→ rewrite 原子写（writeJsonFileAtomic）。配置归一如 §2。

## 4. 调用者与调用链

`yanhu-pi-runtime`（ensureCache/saveMemory/updateConfig）、`yanhu-pet-window-manager`（配置持久化）、测试（pi-runtime.test 大部分用例）；出向 `../../config-paths`、`../../safe-file`、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

本地 JSON 读+原子写（safe-file 族）；无网络。

## 6. 分支、失败、取消与恢复

损坏条目丢弃不抛；文件缺失→默认配置空消息；writeJsonFileAtomic 原子性由 safe-file 保证。

## 7. 权限与权威状态

- **默认关闭红线**（`:68-71`）：devToolsEnabled/enableVision 仅显式 true 才暴露；isCollapsed 仅显式 true 才收起。
- 记忆上限权威（MAX_YANHU_MEMORY clamp）；v3 坐标复位（`:16-17`）。

## 8. 修改影响面

改归一影响落盘兼容（version 3）；窗口上限影响记忆行为；`YanhuPetStoreData` 形状是落盘契约。

## 9. 测试证据

`yanhu-pi-runtime.test.ts`（同批，**归属矛盾见 pi-runtime 手册 §10**）：`resolveInjectedHistory` 1 用例、`normalizeYanhuPetConfig` 1 用例（memoryLimit 收敛）、`toChatMessages` 1、`YanhuPetMemoryStore` 2（滑窗/损坏丢弃）、`healYanhuMessages` 1。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/归一/滑窗/原子写 | 已证实 | 289 行全读 |
| 默认关闭红线 | 已证实 | `:53`、`:68-71` |
| safe-file 原子性 | 未知 | safe-file 不在本批 |

## 11. 覆盖表

全文件 covered；测试 §9；safe-file 实现 unknown。
