---
path: apps/electron/src/main/lib/skill-path-security.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72c854844b64779e10022369ab86aae0c65b2bf4
sha256: cc1253ce3cd14f93d324881b0247fd148c1dca2945c46835679bdc7025f6cd61
lines: 52
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-path-security.ts

## 1. 结论与边界

Skill 路径边界校验（头注释 :1：所有外部 slug 与运行时目录名共用）：跨平台唯一键+片段白名单+拼接后二次越界校验。

## 2. 导出与关键符号

导出 4 条（`export` :13/:17/:33/:44）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `canonicalSkillSegmentKey(value)` | `:13-15` | NFC+小写+NFC（:8-12 注释：防 macOS 可并存名投影 Windows 相撞） |
| `assertSafeSkillSegment(value, fieldName)` | `:17-30` | 拒：空/`.`/`..`/Windows 非法字符（:4）/绝对路径（三平台 :23）/控制字符/尾点空格/Windows 保留设备名（:5，含 com1-9¹²³ 变体） |
| `safeSkillPath(root, segment, fieldName)` | `:33-42` | 拼接后再验 root 内（:32 注释：防未来放宽 segment 留越界） |
| `assertSafeSkillRootChild(root, child, fieldName)` | `:44-52` | 目标必须在 root 内（posix/win32 双分隔符判断 :48） |

## 3. 内部逻辑与关键流程

四函数全 throw 显式消息；relative 越界判定双平台（:38/:48）。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 5 文件**——`global-skill-manager.ts:10`（4 符号全量）、`agent-workspace-manager.ts:25`（20+ 调用点）、`ipc.ts:426`（18+ 处）、`skill-routing.ts:7`、`migration-service.ts:41`；测试 `skill-path-security.test.ts:2`。出向：仅 `node:path`（:2），零业务依赖。

## 5-7. 数据/分支/权限

纯函数；路径边界即权限权威。

## 8. 修改影响面

全部 skill 路径操作（workspace-manager/skill-master-manager）。需同步测试（32 行）。

## 9. 测试证据

`skill-path-security.test.ts`（批内，32 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；跨平台判定 | 已证实 | :13-52 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+双平台校验 | §2/§3 | :13-52 | covered |
