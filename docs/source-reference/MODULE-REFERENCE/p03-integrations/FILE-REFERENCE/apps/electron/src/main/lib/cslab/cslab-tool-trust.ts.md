---
path: apps/electron/src/main/lib/cslab/cslab-tool-trust.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7049b4dea1b187f354e32596d8576d68cec83efb
sha256: 7c42d20a596d6c086f6fcbcf99fa942478c0d362ce4fad201460da80f3da4a1c
lines: 89
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tool-trust.ts

## 1. 结论与边界

**CSLab 自定义 Python 工具的会话级内存信任层**（`cslab-tool-trust.ts:1-9` 四条设计红线）：①信任只存主进程内存、**绝不写会话 meta/配置，重启即清**（`:5`）；②**仅用户显式激活 bypassPermissions 时授予，子代理不得自行提权**（`:6`）；③子代理经根会话继承信任、**切换实验室全部失效**（`:7`）；④判定为纯函数便于全模式测试（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `grantCsLabToolTrust` | function（export） | `:22-27` | 授予（sessionId 空/labId 无解→不授予，`:23-25`；未指定 lab 绑定当前 activeLabId） |
| `revokeCsLabToolTrust` | function（export） | `:30-32` | 单会话撤销 |
| `isCsLabToolTrusted` | function（export） | `:38-43` | 指定 labId 时要求绑定同实验室（**防跨实验室放行** `:36`） |
| `onCsLabOpened` | function（export） | `:46-51` | 切换实验室吊销其他实验室全部信任+更新 activeLabId |
| `resetCsLabToolTrustForTest` | function（export） | `:54-57` | 测试辅助重置 |
| `resolveRootSessionId` | function（export） | `:60-68` | 沿 parentSessionId 上溯**最多 5 层**（防成环 `:59`；自指/缺即停） |
| `CsLabToolGateDecision` | type（export） | `:70` | `'allow'\|'prompt'\|'deny'` |
| `decideCsLabToolGate` | function（export） | `:80-89` | 门禁纯函数（§3） |

内部：`MAX_LINEAGE_DEPTH=5`（`:14`）、`trustedLabBySession` Map（`:17`）、`activeLabId`（`:19`）。

## 3. 内部逻辑与关键流程

`decideCsLabToolGate`（`:80-89`，注释纲领 `:72-79`）顺序：`plan` → **deny**（沿用计划模式拒绝）；`bypassPermissions`+trusted → **allow**（子代理同样放行）；`nonInteractive` → **deny**（硬阻断）；其余 → **prompt**（单次人工审批）。

## 4. 调用者与调用链

入向：CSLab 工具执行门禁（tool-registry/service，同批）；测试 `cslab-tool-trust.test.ts`（同批 144 行）。出向：`../agent-session-manager`（getAgentSessionMeta `:12`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

模块内存态（Map/activeLabId）；读会话 meta（parentSessionId 上溯）。无持久化（红线①）。

## 6. 分支、失败、取消与恢复

四分支门禁（§3）；授予条件不满足即静默不授予（`:23-25`）；重启即清=恢复语义。不适用取消。

## 7. 权限与权威状态

**本文件即权限边界**：红线①-④（`:5-8`）；跨实验室防放行（`:36`）；上溯限深防环（`:59`）。

## 8. 修改影响面

改信任/门禁 → CSLab 自定义 Python 工具执行审批全链；纯函数性质使测试全模式覆盖。

## 9. 测试证据

**直接测试 `cslab-tool-trust.test.ts`（144 行，同批，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+2 内部+四分支+红线 | 已证实 | 逐行读 `:1-89` |
| 授予调用方遵守红线② | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+门禁 | §2/§3 | `:22-89` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
