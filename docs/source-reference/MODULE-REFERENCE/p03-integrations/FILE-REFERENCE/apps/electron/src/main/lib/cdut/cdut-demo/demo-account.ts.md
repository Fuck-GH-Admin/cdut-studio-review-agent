---
path: apps/electron/src/main/lib/cdut/cdut-demo/demo-account.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 61daeb0cbb02bde55cec87c6728912bd2f2a0715
sha256: a1a4ebd52b891afaaf58a092a1833f925306caa97fb342fdae13ce6206cece0b
lines: 48
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-demo/demo-account.ts

## 1. 结论与边界

CDUT 演示特区账户的**凭证与画像定义**（运行时常量+纯函数）：命中演示凭据后旁路真实 CAS，不发网络/不保活/不落盘（仅内存会话）；红线「仅在演示态生效，绝不参与真实登录判定」（`apps/electron/src/main/lib/cdut/cdut-demo/demo-account.ts:1-8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEMO_CREDENTIALS` | 导出常量 | 14-17 | `{studentId:'202520260101', password:'Nya315'}` | 双字段**精确同时命中**才入演示态（`:13`） |
| `DEMO_ACCOUNT_FIELDS` | 导出常量 | 20-27 | 张澄一/环境与土木工程/地下水科学与工程/2025202601/学生 | 离线画像字段 |
| `buildDemoProfile` | 导出函数 | 33-48 | `(): CdutAccountProfile` | 构造画像（status:'active'、**rememberPassword 固定 false** `:44`、lastLogin/lastActive=now、avatar=内置 DataURL） |

出向：`@profer/shared`（`CdutAccountProfile` 类型，`:10`）、`./demo-avatar`（`:11`）。

## 3. 内部逻辑

`buildDemoProfile`：字段映射 + 时间戳（`:34-47`）；无分支（除对象构造）。

## 4. 调用者与调用链

入向：`cdut-demo/demo-service.ts:19`（`buildDemoProfile`/`DEMO_CREDENTIALS`，`tryLogin` 命中判定）；`cdut-demo/demo-service.test.ts:13`。出向见上。

## 5. 数据 I/O 与副作用

无（纯常量+纯函数；不落盘由 rememberPassword:false 保证）。

## 6. 分支、失败与恢复

无 throw；不适用。

## 7. 权限与权威状态

演示凭据为公开演示账号（非真实凭据）；红线=不参与真实登录判定（`:7`）。

## 8. 修改影响面

改凭据/画像影响演示态登录与 8 域演示数据的头部信息；与 `demo-service.tryLogin` 判定耦合。

## 9. 测试证据

`demo-service.test.ts:27-46`（画像字段断言+rememberPassword false+avatar DataURL 前缀）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+红线注释 | 已证实 | `:1-48` |
| 测试断言 | 已证实 | demo-service.test.ts（另篇） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 3 导出 | §2 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
