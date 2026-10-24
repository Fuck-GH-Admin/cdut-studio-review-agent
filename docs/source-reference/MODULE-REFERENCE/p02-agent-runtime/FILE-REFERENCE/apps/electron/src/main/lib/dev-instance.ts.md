---
path: apps/electron/src/main/lib/dev-instance.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f12cabbf20db4a9441279e8ac5e1cde93277150e
sha256: 36dab366173f2d04397b5b58308964f5e8461d0633ac88f0f09320e0536e927a
lines: 62
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-instance.ts

## 1. 结论与边界

**开发实例隔离参数解析**：`PROFER_DEV_INSTANCE` 只允许安全文件名字符（**避免环境变量变成路径穿越入口** `:21`）；`resolveDevUserDataPath` **正式版永远不读开发隔离参数**（`:30`）；Vite 端口仅显式合法 TCP 端口才覆盖默认（`:50`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DevInstanceEnvironment`/`DevPathOperations` | interface（export） | `:6-16` | env/路径操作注入（可测） |
| `getDevInstanceId` | function（export） | `:23-27` | 标识正则 `:4`，不合法→undefined |
| `resolveDevUserDataPath` | function（export） | `:32-47` | userData 解析（§3） |
| `resolveDevVitePort` | function（export） | `:52-57` | 默认 5174；合法区间 1024-65535 |
| `resolveDevAppName` | function（export） | `:59-62` | `cdutai-dev[-instanceId]`（锁名隔离） |

内部：`DEFAULT_DEV_USER_DATA_DIR`（`:3`）、`DEV_INSTANCE_PATTERN=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/`（`:4`）、`hostPathOperations`（`:18`）。

## 3. 内部逻辑与关键流程

`resolveDevUserDataPath`（`:32-47`）优先级：**isPackaged → `@cdutai/electron`（忽略一切开发参数）** > `PROFER_USER_DATA_DIR` 显式（`:40-41`） > instanceId 派生 `electron-dev-<id>`（`:43-45`） > 默认 `@cdutai/electron-dev`（`:46`）。

## 4. 调用者与调用链

入向：Electron 主进程启动链（跨文件）；测试 `dev-instance.test.ts`（同批 4 用例）。出向：`node:path`（可注入）。

## 5. 数据 I/O、读写与副作用

纯函数；无副作用。

## 6. 分支、失败、取消与恢复

优先级链四分支（§3）；不抛错。不适用取消/恢复。

## 7. 权限与权威状态

安全红线：标识正则防路径穿越（`:21`）；打包态忽略开发覆盖（`:30/:38`）。

## 8. 修改影响面

改解析 → 开发多实例隔离/userData 落点/锁名；4 用例锁定。

## 9. 测试证据

**直接测试 `dev-instance.test.ts`（4 用例，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+优先级链 | 已证实 | 逐行读 `:1-62` |
| 测试 4 用例断言 | 已证实 | 测试 `:6-39`；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+优先级 | §2/§3 | `:23-62` | covered |
| 测试 | §9 | 测试行号 | covered（NOT_RUN） |
