---
path: apps/electron/src/main/lib/local-resource-protocol.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 51d13d3258ab56cabc6bd4541dd8826cd7a13648
sha256: 6af7dae6d0c5cb67426b83e6c17835735b86ef370784c9fbc1fcc3230c128789
lines: 36
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/local-resource-protocol.ts

## 1. 结论与边界

安全本地资源协议：`cdut-resource://<path>` 映射到 `apps/electron/resources/<path>`（开发）或 `process.resourcesPath`（打包后）（文件头 `apps/electron/src/main/lib/local-resource-protocol.ts:1-3`）。薄文件（36 行）单一 handler。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `handleProferResourceRequest` | 函数（导出） | 11-36 | `(request:Request)=>Response\|Promise<Response>` | 协议处理器 |

## 3. 内部逻辑与关键流程

`:11-36`：URL 解析失败 400（`:13-18`）；`relativePath=decodeURIComponent((hostname+pathname).replace(/^\/+/,''))`（`:21`）；`resourcesDir = app.isPackaged ? process.resourcesPath : join(__dirname,'resources')`（`:22-24`）；`targetPath=resolve(resourcesDir,relativePath)`+`relative()` 复核，`rel.startsWith('..')||rel.includes(':\\')` → 403（**:27-30**，防 `..` 逃逸与 Windows 盘符注入）；不存在 404（`:32-34`）；否则 `net.fetch(pathToFileURL(targetPath))`（`:36`）。

## 4. 调用者与调用链

入向：Electron protocol 注册（资源加载/内联资源）；测试：本批无专属测试（scope 无 `.test.ts`）。出向：`node:fs/path/url`、`electron.app/net`。

## 5. 数据 I/O、读写与副作用

读：`existsSync`+`net.fetch(file://)`。无状态。

## 6. 分支、失败、取消与恢复

400（URL 非法）/403（逃逸或盘符）/404（缺失）/200 fetch。无取消概念。

## 7. 权限与权威状态

资源目录即信任边界（开发=构建产物 `resources/`，打包=`process.resourcesPath`）；`relative()` 复核拒绝任何越界（含 `:\` 盘符形式）。

## 8. 修改影响面

改边界判定影响资源加载安全；影响所有 `cdut-resource://` 消费方。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：逃逸/盘符/缺失分支无专属断言证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双模式资源根 | 已证实 | `:22-24` |
| 逃逸/盘符拒绝 | 已证实 | `:27-30` |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `handleProferResourceRequest` | §3 | 11-36 | covered |
| 断言 | §9,§10 | — | unknown |
