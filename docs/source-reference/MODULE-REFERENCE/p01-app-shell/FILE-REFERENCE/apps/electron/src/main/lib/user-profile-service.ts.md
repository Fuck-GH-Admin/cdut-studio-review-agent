---
path: apps/electron/src/main/lib/user-profile-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d7efaf836cfafecfb25cb92d1798ff37d57df68
sha256: e24f39915d491e88c4001ba4103131b7af92f24686423221a34458aa60f374c0
lines: 67
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/user-profile-service.ts

## 1. 结论与边界

用户档案（用户名+头像）读写（67 行，头注释 `:1-6`）：存 `~/.proma/user-profile.json`（经 `config-paths`）。读失败降级默认；写失败抛错。

**边界**：路径函数在 `config-paths`（跨批）；默认值在 `../../types`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getUserProfile` | 函数（导出） | 18-42 | `() => UserProfile` | 读（缺失/坏→默认） |
| `updateUserProfile` | 函数（导出） | 49-67 | `(updates: Partial<UserProfile>) => UserProfile` | 合并写（失败 throw） |

导出合计 2。

## 3. 内部逻辑与关键流程

1. `getUserProfile`（`:18-42`）：文件不存在 → 默认（`:21-26`）；`readFileSync`+`JSON.parse`，字段 `userName||DEFAULT_USER_NAME`/`avatar||DEFAULT_USER_AVATAR`（`:31-34`）；catch → console.error + 默认（`:35-41`）。
2. `updateUserProfile`（`:49-67`）：`getUserProfile()` 基底合并 updates（`:50-54`）；`writeFileSync(JSON.stringify(…, null, 2))`（`:59`）；catch → console.error + **throw `写入用户档案失败`**（`:63`）。

## 4. 调用者与调用链

入向（全冻结树检索 `user-profile-service`，4 处）：
- `lib/remote-service.ts:37`（`getUserProfile`）。
- `lib/agent-prompt-builder.ts:19`（`getUserProfile`）。
- `main/ipc.ts:250`（两者）。
- `lib/identity-service.ts:115`（`const { getUserProfilePath } = require('./user-profile-service')`——**本模块并未导出 `getUserProfilePath`**（它来自 `config-paths`），该惰性 require 解构将得到 undefined（照实记录，identity-service 为跨批文件，其调用面行为未深读）。
出向：`node:fs`、`./config-paths`（`:9`）、`../../types`（`:10-11`）。

## 5. 数据 I/O、读写与副作用

- 读：`~/.proma/user-profile.json`（`getUserProfilePath()`）。
- 写：`updateUserProfile` 整文件 JSON 覆盖（2 空格缩进，无原子写/tmp+rename——照实）。
- 副作用：console.error/log 三条（`:36`/`:60`/`:62`）。

## 6. 分支、失败、取消与恢复

- 读失败（缺失/坏 JSON/异常）→ 默认档案（不抛）。
- 写失败 → throw `'写入用户档案失败'`（`:63`）；无回滚。
- 无并发保护（读-改-写竞态面照实：两次 update 并发会互相覆盖）。

## 7. 权限与权威状态

无权限分支（不适用，依据：无 sender/role 检查）。权威=本地 JSON 文件。

## 8. 修改影响面

3 个正常消费方（remote-service/agent-prompt-builder/ipc）+1 个异常引用（identity-service:115，见 §4）；`UserProfile` 形状与默认值是契约；写失败文案用户可见（经 ipc）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `user-profile-service` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/降默认/写 throw/无原子写 | 已证实 | `:1-67` 全文逐行 |
| 4 处引用（含 identity-service 解构未导出符号） | 已证实 | 全树检索（§4）+ 两文件实读 |
| identity-service:115 解构 undefined 的运行后果 | 推断 | `user-profile-service` 导出面（仅 2 函数）+ require 语义 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getUserProfile` | §3.1 | 18-42 | covered |
| `updateUserProfile` | §3.2/§6 | 49-67 | covered |
| 异常引用面 | §4/§10 | - | covered |
