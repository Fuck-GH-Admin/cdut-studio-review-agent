---
path: apps/electron/src/main/lib/feishu-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6d00417dd2641a67a257f1d56fd2d23fa33f37f
sha256: df2ff378ea71f04f6f7b3531f4732984aef00a07a39fb6f2498b23eb7bb91482
lines: 220
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-config.ts

## 1. 结论与边界

**飞书配置管理（多 Bot）**（220 行）：CRUD+App Secret 加密（safeStorage 经 token-crypto `:5`）；持久化 `~/.proma/feishu.json` v2 `{version:2, bots:[]}`；**v1 单 Bot 自动迁移**（`:7-8`）。

## 2. 导出与关键符号（9 个 export）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `getFeishuMultiBotConfig` | `:90` | 每次现读磁盘 |
| `getFeishuBotById` | `:95` | 查找 |
| `saveFeishuBotConfig` | `:101-141` | 更新（**appSecret 空则保留旧值** `:116`，无法清除）/新建 |
| `removeFeishuBot` | `:145` | 删除（不存在 false 不写盘） |
| `getDecryptedBotAppSecret` | `:156` | 解密（不存在 throw） |
| **@deprecated 族**：`getFeishuConfig:165`（返回密文！）、`saveFeishuConfig:180`、`getDecryptedAppSecret:203`、`updateFeishuConfigPartial:211` | | v1 形状兼容（映射 bots[0]） |

内部：`encryptSecret/decryptSecret:25-31`、`EMPTY_MULTI_CONFIG:36`、`migrateV1ToV2:39-50`、`readRawConfig:54-79`（**读取有写副作用**：v1 迁移写回 `:73`）、`writeMultiConfig:82`。

## 3. 内部逻辑与关键流程

读（宽版本判定 `:65`）→迁移→CRUD（白名单重建 `:111-120`）→写盘。

## 4. 调用者与调用链

feishu-bridge（getDecryptedBotAppSecret）/feishu-bridge-manager/settings IPC；出向 config-paths/token-crypto。

## 5. 数据 I/O、读写与副作用

JSON 读写（**非原子** `:82-85` 无 try/catch 照实）；加解密。

## 6. 分支、失败、取消与恢复

文件缺失→空配置；解析失败→error+空配置（**并吞掉迁移写回失败** `:76-79` 照实）；更新不存在 throw。

## 7. 权限与权威状态

- **Secret 密文存储契约**（token-crypto 链）。
- appSecret 空=不修改（`:116`，口头契约照实）。

## 8. 修改影响面

改 v2 结构/迁移影响存量 Bot 配置；deprecated 族联动旧调用方。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出/迁移/加密链 | 已证实 | 220 行全读 |
| **① EMPTY_MULTI_CONFIG 共享数组别名（潜在真实缺陷）**：`:36` `bots:[]` 与 `:41`/`:57`/`:78` 三处浅拷贝共享引用，`saveFeishuBotConfig` push 永久污染模块常量 | 已证实 | 三处语句字节一致 |
| **②** 迁移只搬 defaultWorkspaceId 不搬 ChannelId/ModelId（与 `:190-191` 口径不一）；**③** getFeishuConfig 返回密文易误用；**④** 白名单重建丢未来字段+appId trim/name 不 trim；**⑤** 非原子写+无锁 | 已证实 | `:43-50`/`:165`/`:111-120`/`:82-85` |
| token-crypto decrypt('') 行为 | 未知 | 未验证（照实） |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 导出/迁移/加密 | §2/§3 | covered |
| 5 矛盾（含别名缺陷） | §10 | covered |
