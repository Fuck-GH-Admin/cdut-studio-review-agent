---
path: apps/electron/src/main/lib/dingtalk-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac22e842d5cac2f688e035c2294b03d2ed03ecbc
sha256: f98bb54bdb9789d8b575856ef6ddc56ab36d8d6c75848524d156c2a5ca0809ed
lines: 206
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/dingtalk-config.ts

## 1. 结论与边界

钉钉配置管理（多 Bot 版）（文件头 `apps/electron/src/main/lib/dingtalk-config.ts:1-9`）：多 Bot CRUD + Client Secret 加密/解密（`token-crypto`）；持久化 `dingtalk.json`（v2：`{version:2,bots:[]}`）；**向后兼容自动迁移 v1 单 Bot**。

## 2. 导出与关键符号

`export` 逐条核对：8 个函数 = 8 个导出（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getDingTalkMultiBotConfig` | 函数（导出） | 90-92 | 读多 Bot 配置 |
| `getDingTalkBotById` | 函数（导出） | 95-98 | 单查 |
| `saveDingTalkBotConfig` | 函数（导出） | 101-143 | 新建/更新（`input.id` 分支）；secret 空保留旧值（`:117`）；不存在抛 `Bot X 不存在` |
| `removeDingTalkBot` | 函数（导出） | 145-154 | 删除（不存在返回 false） |
| `getDecryptedBotClientSecret` | 函数（导出） | 156-161 | 解密（不存在抛） |
| `getDingTalkConfig` | 函数（导出，`@deprecated`） | 165-178 | 兼容 API→`bots[0]`（无则空配置） |
| `saveDingTalkConfig` | 函数（导出，`@deprecated`） | 180-199 | 委托 `saveDingTalkBotConfig`（`bots[0]`） |
| `getDecryptedClientSecret` | 函数（导出，`@deprecated`） | 201-206 | `bots[0]` 解密（无则 `''`） |
| `encryptSecret`/`decryptSecret`/`migrateV1ToV2`/`readRawConfig`/`writeMultiConfig` | 内部 | 25-85 | `token-crypto` 包装；v1→v2 迁移（无 clientId→空配置，`:40-42`）；读容错回空配置 |

## 3. 内部逻辑与关键流程

`readRawConfig`（`:54-80`）：缺失→空配置；v2 直读；v1→`migrateV1ToV2`（生成 `钉钉助手` bot）**写回迁移格式**（`:73`）；坏 JSON→`console.error`+空配置。`saveDingTalkBotConfig`（`:101-143`）：更新分支（id 不存在抛）——secret 提供则加密否则**保留既有密文**；新建分支（`randomUUID`、secret 空则 `''`）。

## 4. 调用者与调用链

入向：钉钉配置 IPC + `dingtalk-bridge(-manager)`（消费解密 secret）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`node:crypto/fs`、`./config-paths.ts:13`、`./token-crypto.ts:14`、`@profer/shared`（类型）。

## 5. 数据 I/O、读写与副作用

读写：`dingtalk.json`（`writeFileSync`）；副作用：v1 迁移写回、`console.log/error`。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 配置缺失/坏 JSON | 空配置 | 56-58,76-79 |
| v1 | 迁移+写回 | 69-75 |
| 更新 id 不存在 | 抛 `Bot X 不存在` | 108-109 |
| secret 空 | 保留旧密文 | 117 |
| 删除不存在 | false | 149 |
| 解密无 bot | 抛/`''` | 159,205 |

## 7. 权限与权威状态

- Secret 加密权威=`token-crypto`（`encryptToken/decryptToken`）；解密仅按需（`getDecrypted*`）。
- v1→v2 迁移为持久化格式权威。

## 8. 修改影响面

改密文格式影响既有配置兼容；改 CRUD 影响桥接供给；影响 `dingtalk-bridge`。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| v1→v2 自动迁移+写回 | 已证实 | `:69-75` |
| secret 保留/加密 | 已证实 | `:117,134` |
| 读容错回空配置 | 已证实 | `:76-79` |
| deprecated 兼容族 | 已证实 | `:163-206` |
| token-crypto 内部 | 未知 | 文件外 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 读写/迁移 | §2,§3 | 25-85 | covered |
| 多 Bot API | §2 | 90-161 | covered |
| 兼容 API | §2 | 165-206 | covered |
| 断言 | §9,§10 | — | unknown |
