---
path: scripts/agent-fabric-pair.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3745ddde219cd89c8995b6cfbb1d16c721cbb085
sha256: ad2e2b3c05cd81126b2ad565bbc9fc5d71207518c15fe79bebc91a4e74d2fa72
lines: 93
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/agent-fabric-pair.mjs

## 1. 结论与边界

Agent Fabric 本地配对脚本（Phase 1「用户批准」动作，独立 node 脚本）：为外部客户端（Hermes 等）签发配对记录——写入与 Profer 应用相同的 `agent-fabric-clients.json`（token 只存 sha256 哈希，明文仅输出一次），支持 `--revoke` 撤销与 `--list` 列表（文件头 `scripts/agent-fabric-pair.mjs:1-14`）。

边界：不做任务操作（`agent-fabric-client.mjs`）；授权检查在服务端 `fabric-pairing`（非本批）；token 安全存储由调用方负责（`:12`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（CLI 脚本）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT_GRANTS` | 常量（内部） | 21 | `task.submit,task.read,task.cancel,artifact.read` |
| `parseArgs` | 函数（内部） | 23-35 | name/grants/revoke/dev/list |
| `getConfigDir` | 函数（内部） | 37-41 | PROFER_CONFIG_DIR 覆盖 > `--dev`/PROFER_DEV → `.profer-dev` > `.profer` |

## 3. 内部逻辑与关键流程

1. 参数门（`:44-47`）：help 或 name/revoke/list 全无 → 用法 exit 1。
2. 读 `agent-fabric-clients.json`（不存在→`{clients:[]}`；clients 非数组重置，`:49-53`）。
3. `--list`：逐条打印 `[已撤销]/[生效中]` + clientId/name/grants（`:55-60`）。
4. `--revoke`：按 clientId 找记录，未找到 exit 1（`:63-67`）；置 `revokedAt` 写回（`:68-71`）——**撤销即刻生效语义由服务端保证**（`:71` 文案）。
5. 配对（`:75-91`）：`clientId=client_<16hex>`、`token=两段 randomUUID 拼接`（`:75-76`）、只存 `sha256(token)`（`:80`）、grants 默认 4 项、`createdAt/lastSeenAt`；mkdir+写回；明文 token 打印一次（`:91`）。

## 4. 调用者与调用链

入向：无代码调用（独立 CLI）；`apps/electron/src/main/lib/agent-fabric/fabric-pairing.ts:10` 注释指向本脚本（共享同一配置文件，`:42` `agent-fabric-clients.json` 同名）；设计文档 `docs/plans/2026-09-27-profer-agent-fabric-design.md` 引用。

出向：`node:crypto`（sha256/randomUUID，`:16`）、`node:fs`/`node:os`/`node:path`（`:17-19`）。

## 5. 数据 I/O、读写与副作用

- 读写 `<configDir>/agent-fabric-clients.json`（`~/.profer`/`~/.profer-dev`/PROFER_CONFIG_DIR，`:37-49`）；写入为整文件覆盖 `writeFileSync`（`:70,86`，非原子）。
- 副作用：stdout 输出明文 token（一次性，`:91`）。并发：无锁（两脚本并发写会互相覆盖，推断）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 用法 | 参数不足 | 44-47 | 1/0 |
| list | --list | 55-60 | 0 |
| revoke 未命中 | clientId 不存在 | 64-67 | 1 |
| 配对 | 默认 | 75-91 | 0 |

JSON.parse 异常未捕获（坏文件冒泡 exit 1，推断）；撤销不可逆（重新配对生成新 clientId/token）。

## 7. 权限与权威状态

- 本脚本即「用户批准」动作：本地写配置文件=授出 grants（默认 4 项，`:21`）；token 只存哈希（`:80`）；撤销置 `revokedAt`（`:68`）。
- 配置目录同 `agent-fabric-pair.mjs:37-41` 的 `~/.profer`/`~/.profer-dev` 体系——与主应用 `config-paths.ts`（`~/.cdutai`）同 nb-141 所记矛盾一致（见 paths.ts.md §8 跨文件矛盾，本脚本亦认 `PROFER_CONFIG_DIR`，`:38-39`）。
- 无服务端鉴权（本地脚本）；权威=服务端读取该文件做授权（fabric-pairing，非本批）。

## 8. 修改影响面

- `agent-fabric-clients.json` 记录形状（clientId/clientName/tokenHash/grants/createdAt/lastSeenAt/revokedAt?）与 `fabric-pairing.ts` 解析耦合。
- grants 枚举是 Fabric 授权契约（task.submit/read/cancel、artifact.read）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `agent-fabric-pair` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 三模式全流程 | 已证实 | `:21-91` 逐行读 |
| token 只存 sha256/明文一次 | 已证实 | `:80,91` |
| 撤销置 revokedAt | 已证实 | `:68` |
| `~/.profer` 体系+PROFER_CONFIG_DIR | 已证实 | `:37-41` |
| 并发覆盖风险 | 推断 | 整文件写无锁 |
| 服务端授权实现 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseArgs/getConfigDir/DEFAULT_GRANTS | §2-3 | 21-41 | covered |
| 配对/撤销/列表 | §3, §6 | 49-91 | covered |
| 权限/目录体系 | §7 | 37-41, 80 | covered |
| 调用链 | §4 | - | covered |
| 运行期/服务端 | §10 | - | unknown（NOT_RUN/非本批） |
