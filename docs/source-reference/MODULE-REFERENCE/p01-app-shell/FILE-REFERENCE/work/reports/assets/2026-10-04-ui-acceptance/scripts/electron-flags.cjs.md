---
path: work/reports/assets/2026-10-04-ui-acceptance/scripts/electron-flags.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6f923f2d92c64015002ce15d9fd278699812ca8
sha256: fc3f344627059ce3efa420acfe8f12387a5ef06bf44c9e63e04bf3f348cbe798
lines: 6
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-ui-acceptance/scripts/electron-flags.cjs

## 1. 结论与边界

**UI 验收 Electron 启动标志注入器**（6 行）：仅当 `argv[1]` realpath 以 `/electron/cli.js` 结尾时向 argv 追加调试/降级标志（`electron-flags.cjs:3-5`）。

## 2. 导出与关键符号

无导出（require 副作用脚本）。注入 4 标志（`:4`）：`--remote-debugging-port=9237`、`--remote-debugging-address=127.0.0.1`、`--no-sandbox`、`--disable-gpu`。

## 3. 内部逻辑与关键流程

try 包裹 realpathSync 判定+push（失败静默 catch{} `:6`）。

## 4. 调用者与调用链

- 入向：ui-acceptance 验收启动链（NODE_OPTIONS --require 注入，域外——配套 ui.mjs 连 9237 CDP）。
- 出向：node fs。

## 5. 数据 I/O、读写与副作用

改进程 argv（启动参数注入）。

## 6. 分支、失败、取消与恢复

判定不符/异常→静默不动。

## 7. 权限与权威状态

仅验收用途（--no-sandbox/调试端口为本地联调便利，域外声明）。

## 8. 修改影响面

UI 验收环境的 CDP 可达性（ui.mjs 依赖 9237）；产品运行不受影响（判定限定 electron/cli.js）。

## 9. 测试证据

`NOT_RUN`。无直接测试（验收资产；未运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 判定/4 标志/静默失败 | 已证实 | `:1-6` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 2-6 | covered |
