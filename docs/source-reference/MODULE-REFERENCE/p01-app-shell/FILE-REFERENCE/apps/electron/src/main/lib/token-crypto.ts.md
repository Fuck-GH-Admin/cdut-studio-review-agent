---
path: apps/electron/src/main/lib/token-crypto.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a21f865c1c20e17a1f72ef487ea3d8b845aaee49
sha256: c1ac5f8565d31b2efc5edf8a28bcb3d2d1e613af9120c8f850dae46fadc98912
lines: 109
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/token-crypto.ts

## 1. 结论与边界

令牌加密模块（109 行，头注释 `:1-17`）：三级降级链——safeStorage（OS 级）→ AES-256-GCM（deviceId 派生密钥，当前生产）→ 明文（旧格式解密兜底）。**加密失败落明文不抛**（不能阻断登录，`:46`）；解密 GCM 失败抛错。

**边界**：密钥来源 deviceId 由 `identity-service.getOrCreateDeviceIdentity`（注册表/Keychain，跨批）；密文持久化由调用方做。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `encryptToken` | 函数（导出） | 48-70 | `(plaintext: string) => string` | 见 §3.1 |
| `decryptToken` | 函数（导出） | 78-109 | `(ciphertext: string) => string` | 见 §3.2 |

内部常量：`ALGO='aes-256-gcm'`（`:23`）、`KEY_SALT='profer-token-v1'`（`:24`）、`KEY_ITERATIONS=100000`（`:25`）、`KEY_LENGTH=32`（`:26`）、`AES_PREFIX='proferv1:'`（`:27`）；`deriveKey`（`:33-39`，PBKDF2-SHA512(deviceId)，缓存）；`_cachedDeviceId`/`_cachedKey`（`:30-31`）。导出合计 2。

## 3. 内部逻辑与关键流程

1. **encryptToken**（`:48-70`）：空串短路（`:49`）；`safeStorage.isEncryptionAvailable()` → `base64(safeStorage.encryptString(...))`（`:51-56`，catch 降级 warn）；否则/失败 → AES-GCM：`randomBytes(16)` iv，`proferv1:` + base64(**iv16+tag16+cipher**（`:65`））；再失败 → console.warn + **返回明文**（`:67-68`）。
2. **decryptToken**（`:78-109`）：`proferv1:` 前缀 → GCM 解密（`buf` 切 iv[0,16)/tag[16,32)/密文[32,]，`:85-88`）；失败 → console.error + **throw `'解密令牌失败'`**（`:93-94`）；无前缀且 safeStorage 可用 → base64→`decryptString`（catch 落回退 `:99-104`）；最终按旧明文返回（`:108`）。
3. **deriveKey**（`:33-39`）：`pbkdf2Sync(deviceId, KEY_SALT, 100000, 32, 'sha512')`，deviceId 不变走缓存（`:35`）。

## 4. 调用者与调用链

入向（全冻结树检索 `token-crypto`，**11 个生产消费点**）：`auth-service.ts:17`、`wechat-config.ts:11`、`chat-tool-config.ts:10`、`feishu-config.ts:14`、`dingtalk-config.ts:14`、`lark-mcp-service.ts:5`、`channel-manager.ts:12`、`cdut/cdut-auth-manager.ts:27`、`cslab/cslab-share-watcher.ts:51`、`cslab/cslab-security.ts:17`、`cslab/cslab-hpc.ts:60`。批外测试引用 4（`cdut-auth-manager.test.ts:20`、`cslab-security.test.ts:13` 真实 import；`chat-tool-config.test.ts:10`、`lark-mcp-service.test.ts:17` mock.module）。
出向：`node:crypto`、`electron.safeStorage`（`:19-20`）、`./identity-service`（`:21`）。

## 5. 数据 I/O、读写与副作用

- 无直接盘 IO（密文由调用方持久化）；deviceId 读取（identity-service，注册表/Keychain）。
- 副作用：console.warn/error 三条（`:55`/`:67`/`:93`）；PBKDF2 计算（缓存）。

## 6. 分支、失败、取消与恢复

- 加密：safeStorage 失败→AES-GCM→明文双降级（`:51-68`）。
- 解密：GCM 失败**抛**（唯一 throw）；safeStorage 解密失败→按明文返回（`:103` 注释：可能是旧明文或损坏数据）。
- 安全权衡照实：加密失败落明文=可用性优先（头注释 `:46` 明示取舍）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。安全模型（头注释 `:14-16`，属声明性说明〔推断〕强度）：deviceId 存 HKCU/Keychain 仅当前用户可读，不随备份泄露。

## 8. 修改影响面

**凭据加密枢纽**（11 消费点）：各配置文件的令牌/密码字段；`proferv1:` 布局与常量是持久化格式契约（改了旧密文不可解）；三级降级链是所有凭据读写的公共行为。

## 9. 测试证据

直接测试：**无本批测试**；批外间接：`cdut-auth-manager.test.ts`（"仅密码字段加密落盘+可解密还原"断言，:171/:188）、`cslab-security.test.ts:13`；`chat-tool-config.test`/`lark-mcp-service.test` mock 掉本模块（断言的是消费方）。断言≠运行。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三级链/布局/PBKDF2 参数/唯一 throw | 已证实 | `:1-109` 全文逐行 |
| 11 个生产消费点 | 已证实 | 全树检索（§4） |
| 安全模型声明（deviceId 保密性） | 推断 | 头注释 `:14-16` |
| safeStorage/OS 真实行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/deriveKey 缓存 | §2/§3.3 | 23-39 | covered |
| `encryptToken` 降级链 | §3.1 | 48-70 | covered |
| `decryptToken` 格式识别 | §3.2/§6 | 78-109 | covered |
| 11 消费点 | §4/§8 | - | covered |
