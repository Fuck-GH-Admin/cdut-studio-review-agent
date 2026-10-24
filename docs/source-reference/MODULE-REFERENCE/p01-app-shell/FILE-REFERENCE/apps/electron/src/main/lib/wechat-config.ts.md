---
path: apps/electron/src/main/lib/wechat-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e451f64eccc7316c5dcea2e2d1122330a839571
sha256: fb6a602ebb92b2dff8ed7fe651e6dbc4814c9cb72102a3898f6fafee3246c225
lines: 87
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/wechat-config.ts

## 1. 结论与边界

微信 iLink 凭证持久化（87 行，头注释 `:1-7`）：`~/.proma/wechat.json`；**botToken 经 token-crypto 加密**（明文进、密文存），ilinkBotId/baseUrl/ilinkUserId 明文存。读失败降级默认。

**边界**：加密实现=token-crypto（本批手册）；路径=config-paths（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getWeChatConfig` | 函数（导出） | 33-44 | `() => WeChatConfig` | 读（botToken 为密文） |
| `saveWeChatCredentials` | 函数（导出） | 47-62 | `(creds: WeChatCredentials, defaultWorkspaceId?: string) => WeChatConfig` | 保存（自动加密） |
| `getDecryptedCredentials` | 函数（导出） | 65-72 | `() => WeChatCredentials \| null` | 解密还原 |
| `updateWeChatDefaultWorkspace` | 函数（导出） | 75-79 | `(workspaceId: string) => void` | 仅改工作区 |
| `clearWeChatCredentials` | 函数（导出） | 82-87 | `() => void` | 清凭证（登出） |

内部：`DEFAULT_CONFIG = {enabled:false, credentials:null}`（`:15-18`）、`encryptToken`/`decryptToken` 包装（`:22-28`）。导出合计 5。

## 3. 内部逻辑与关键流程

1. `getWeChatConfig`（`:33-44`）：文件缺失/解析失败 → `{...DEFAULT_CONFIG}`（合并语义 `:39`：`{...DEFAULT_CONFIG, ...data}`）。
2. `saveWeChatCredentials`（`:47-62`）：构造 `{enabled:true, credentials:{botToken: encrypt(明文), ilinkBotId, baseUrl, ilinkUserId}, defaultWorkspaceId}`——**整体重写配置文件**（`:59`）。注意（照实）：`defaultWorkspaceId` 参数不传时写 `undefined`（JSON.stringify 丢弃该键），**会清掉既有工作区值**；调用方 wechat-bridge.startLogin 的调用未传第二参（本批 wechat-bridge 手册同记），更新工作区走 `updateWeChatDefaultWorkspace`。
3. `getDecryptedCredentials`（`:65-72`）：无凭证 → null；否则 `{...credentials, botToken: decrypt(...)`}`。
4. `updateWeChatDefaultWorkspace`（`:75-79`）：读-改-写（只覆 `defaultWorkspaceId` 键）。
5. `clearWeChatCredentials`（`:82-87`）：写空配置 `{enabled:false, credentials:null}`（**不含 defaultWorkspaceId**，一并清掉）。

## 4. 调用者与调用链

入向（全冻结树检索 `wechat-config`，3 文件）：`lib/wechat-bridge.ts:20`（5 符号全用）、`main/index.ts:241`（`getWeChatConfig`）、`main/ipc.ts:453`（`getWeChatConfig`）。出向：`node:fs`、`./config-paths`、`./token-crypto`（`:11`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

- 读写：`~/.proma/wechat.json`（writeFileSync 整文件覆盖，无原子写——照实）。
- 加密：botToken 进出 token-crypto（安全面见其手册：加密失败落明文）。
- 副作用：console.log/error 三条。

## 6. 分支、失败、取消与恢复

- 读失败（缺失/坏 JSON）→ 默认配置（不抛，`:40-43`）。
- 写失败：`writeFileSync` 异常直接传播（无 catch，`:59`/`:78`/`:85`）。
- 解密失败：token-crypto `decryptToken` 对 GCM 密文失败 throw（传播给调用方）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。凭证安全边界=token-crypto 加密（仅 botToken 字段；其余三字段明文照实）。

## 8. 修改影响面

3 个消费方的微信登录/凭证读写；`WeChatConfig`/`WeChatCredentials` 形状是契约；`saveWeChatCredentials` 的整体重写语义（§3.2）是隐含坑面（清工作区值）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `wechat-config` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/加密面/整体重写/清工作区语义 | 已证实 | `:1-87` 全文逐行 |
| 3 个消费方 | 已证实 | 全树检索（§4） |
| wechat-bridge.startLogin 未传 defaultWorkspaceId 的后果 | 已证实（代码事实）+意图推断 | `:47` 签名 + wechat-bridge 调用（本批 §4 已核） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getWeChatConfig` | §3.1 | 33-44 | covered |
| `saveWeChatCredentials`（重写语义） | §3.2/§6 | 47-62 | covered |
| `getDecryptedCredentials`/`updateWeChatDefaultWorkspace`/`clearWeChatCredentials` | §3.3-3.5 | 65-87 | covered |
