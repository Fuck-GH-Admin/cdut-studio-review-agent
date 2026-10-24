---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-tabs-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11cded8e581825bf17d295569b1cf78df315e501
sha256: 5f57bfc88b40af0b079a88afbadd1b58b1d3344911af893f5bd1599700f23f3f
lines: 170
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-tabs-store.ts

## 1. 结论与边界

智联万站标签拓扑持久化（文件头 `:1-9`）：标签顺序/URL/标题/激活项落盘 `~/.cdutai/yanhu-express/tabs.json`，读取时对损坏/半损坏数据兜底修复（重建默认办事大厅首页）。设计约束（AGENTS.md）：本地存储优先配置文件、原子写入（safe-file）、**绝不引入本地数据库**。运行时模块。

不做的事：不管理 WebContents（tabs-store 只管元数据）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `StoredYanhuTabs` | interface | `:18-23` | `{version; activeTabId; updatedAt; tabs[]}`（规格书 4.3.1） |
| `createYanhuTabId` | function | `:28-31` | `yanhu-tab-{ts}-{单调序号}`（杜绝同毫秒碰撞） |
| `createYanhuTab` | function | `:36-51` | 默认非休眠、缩放 1.0、导航态 false |
| `createDefaultTabsState` | function | `:54-57` | 单“办事大厅”标签并激活 |
| `normalizeStoredTabsState` | function | `:96-112` | 任意损坏回退默认；activeTabId 必指向存在标签 |
| `YanhuTabsStore` | class | `:119-167` | `load()`/`save()`（路径可注入） |
| `yanhuTabsStore` | const | `:170` | 全局单例 |

内部：`tabIdSequence`（`:25`，进程内单调）；`isValidStoredTab`（`:60-69`，缺 id/url 丢弃）；`normalizeStoredTab`（`:72-88`，补齐字段、loading/canGo* 强制 false）。

## 3. 内部逻辑与关键流程

### 3.1 归一化（`:96-112`）

非对象/tabs 非数组/全部非法 → 默认拓扑；过滤+归一后 activeTabId 不在集合 → 回落首个标签。

### 3.2 `YanhuTabsStore`（`:119-167`）

- `load()`：不存在 → 默认；`readJsonFileSafe` → 归一化；异常 warn 回退默认（`:127-136`）。
- `save()`：mkdir 父目录；**落盘剥离纯运行时态**（loading/canGoBack/canGoForward，`:144-154`）；`writeJsonFileAtomic`（保留 .bak）；异常 `console.error`（`:163-165`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站标签管理（browser-tools/视图层）读写拓扑；直接测试不在本批（tabs-store 测试文件不属本批 18 文件）。出向：`safe-file.{readJsonFileSafe,writeJsonFileAtomic}`、`yanhu-constants`、`@profer/shared`（`YanhuTabItem/YanhuTabsState`）。

## 5. 数据 I/O、读写与副作用

读写 `tabs.json`（原子写+.bak）；warn/error 日志。无网络/数据库。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 文件缺失/损坏/全非法 | `:97-102/:129-134` | 回退默认首页拓扑 |
| activeTabId 失配 | `:106-109` | 回落首个 |
| save 异常 | `:163-165` | console.error（不抛） |
| 取消/恢复 | 无 | 同步读写 |

## 7. 权限与权威状态

无权限分支；损坏兜底口径（“回退默认首页”）+ 运行时态不落盘（文件语义稳定）。

## 8. 修改影响面

改结构/归一化 → 影响标签恢复链路；`safe-file` 原子写契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批无直接测试文件。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 损坏任意层回退默认 | 已证实 | `:96-112` |
| 原子写+运行时态剥离 | 已证实 | `:138-162` |
| 稳定 ID 生成 | 已证实 | `:25-31` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 接口/构造族 | 2 | `:18-57` | covered |
| 校验/归一化 | 3.1 | `:60-112` | covered |
| `YanhuTabsStore` | 3.2 | `:119-167` | covered |
