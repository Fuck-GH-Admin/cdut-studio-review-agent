---
path: apps/electron/src/main/lib/cdut/cdut-demo/demo-avatar.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7d45abf2c064fdd9688c7b673277d30aaa0c04c7
sha256: c14246416bc2e8778c02f81f9e515179c9c90a45d56e4b25d3854e59ee5c1269
lines: 7
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-demo/demo-avatar.ts

## 1. 结论与边界

7 行文件：演示账户头像 **Base64 DataURL 常量**（完全离线不走网络；由 `assets/CDUT/ZhangChengYi/ZhangChengYi.jpg` 离线缩放 256px 生成，请勿手工编辑——`apps/electron/src/main/lib/cdut/cdut-demo/demo-avatar.ts:1-5` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEMO_AVATAR_DATA_URL` | 导出常量 | 6-7 | `data:image/jpeg;base64,…`（长字符串单行） |

## 3. 内部逻辑

无（字面量）。

## 4. 调用者与调用链

入向：`cdut-demo/demo-account.ts:11`（`buildDemoProfile` 的 avatar 字段）。出向：无。

## 5. 数据 I/O 与副作用

无（内存常量；生成来源 jpg 不在本批）。

## 6-7. 分支/权限

无；不适用。

## 8. 修改影响面

换头像需重新生成 DataURL（注释禁手工编辑）。

## 9. 测试证据

`demo-service.test.ts:42`（avatar 前缀断言）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单常量+来源注释 | 已证实 | `:1-7` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部内容 | §2 | covered |
