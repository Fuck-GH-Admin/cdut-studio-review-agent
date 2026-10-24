---
path: packages/session-core/src/read-fs.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c9cbe17e940f2bf7b1d52e89f3d3cb8631e82580
sha256: f74acdf7cd5d6a048364724683336ede2ed6bf84745ed5e26b59fde36ee7d089
lines: 17
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/read-fs.ts

## 1. 结论与边界

文件 IO 层（17 行，头注释 :1-6）：**仅 Node 侧**（proma CLI/主进程）；import node:fs 因此不能进主 barrel，只经 `@profer/session-core/node` 暴露（防 Vite 打包 node:fs 进渲染层）。

## 2. 导出与关键符号

导出 1 条（`export` :14）：`readSessionMessages(filePath)`（:14-17）：`readFileSync(filePath,'utf-8')`（:15）→ `readSessionMessagesFromString(raw)`（:16）。

## 3. 内部逻辑与关键流程

单函数两步（§2）。不适用取消/恢复/权限：同步读文件。

## 4. 调用者与调用链

入向（子agent 交叉核）：`node.ts:8`；经 node 入口 4 个 CLI 命令调用（outline.ts:25、search.ts:26、info.ts:26、export.ts:35）。出向：`node:fs`（:7）、`@profer/shared`（type :8）、`./read`（:9）。

## 5. 数据 I/O、读写与副作用

只读磁盘文件（readFileSync）；路径由调用方传入（无校验，属 CLI 参数面）。

## 6. 分支、失败、取消与恢复

无分支；readFileSync 抛错向上传播（无 catch）。不适用取消/恢复。

## 7. 权限与权威状态

不适用，依据：无权限字段；浏览器禁入边界见头注释 :4-5。

## 8. 修改影响面

CLI 4 命令文件读取；主入口浏览器安全边界（勿移入 barrel）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；IO 隔离边界 | 已证实 | :1-17 |
| 4 CLI 消费点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readSessionMessages` | §2/§5 | :14-17 | covered |
