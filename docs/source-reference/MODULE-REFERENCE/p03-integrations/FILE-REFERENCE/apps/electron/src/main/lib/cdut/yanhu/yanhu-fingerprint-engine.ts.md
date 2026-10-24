---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7983fd183127a57982120ea1b5c393884ed4d6c
sha256: 0b51789e434e7b0ff9ac06d0fda23d16ecf906c60a42a88b97aadce3f27caceb
lines: 123
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint-engine.ts

## 1. 结论与边界

智联万站**指纹伪装引擎**（会话层，123 行）：User-Agent 对齐桌面 Chrome 133 + Client Hints 请求头注入。核心红线（`:6-7`/`:77-79`）："**严禁篡改、正则匹配或剥离任何 Cookie**——页面级 Cookie 与瑞数动态签名 100% 交由 Chromium 原生网络栈与 WAF 运行时管理"。`navigator.webdriver` 抹除由 C++ 启动开关权威完成（`:9-12`），本文件不做原型链劫持。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `YANHU_ACCEPT_LANGUAGES` | `:26` | `zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7` |
| `YANHU_USER_AGENT_METADATA` | `:32-51` | CDP `Emulation.setUserAgentOverride` 元数据（brands Not(A:Brand/Google Chrome/Chromium、platform 按 IS_MAC、bitness 64） |
| `STATIC_ASSET_REGEX` | `:54` | 静态资源后缀正则 |
| `STATIC_RESOURCE_TYPES` | `:62` | Set(stylesheet/script/image/font/media)——**严禁含 xhr/webSocket**（`:58-61`：瑞数校验业务 API 的 *P 签名，剥离致未授权/白屏） |
| `isCdutDomain` | `:65-70` | 域名级判定（cdut.edu.cn 主域+子域） |
| `applyYanhuSessionIdentity` | `:81-103` | `ses.setUserAgent` + `webRequest.onBeforeSendHeaders` 覆写 UA/Accept-Language/无条件对齐 Client Hints（`:93-96`），**不动 Cookie** |
| `YanhuFingerprintEngine` | `:111-120` | WeakSet 幂等会话配置 |
| `yanhuFingerprintEngine` | `:123` | 全局单例 |

## 3. 内部逻辑与关键流程

`applyYanhuSessionIdentity` 两步（各自 try/catch warn 不抛）：setUserAgent→onBeforeSendHeaders 头覆写。幂等由类 WeakSet 保证（`:115-117`）。

## 4. 调用者与调用链

express-manager/视图创建侧（configureSession）；出向 `./yanhu-constants`（UA/版本/Client Hints 常量）、`electron.Session`。配套：`yanhu-fingerprint-script.ts`（运行时层）、`yanhu-preload.ts`（注入时序）三件套。

## 5. 数据 I/O、读写与副作用

副作用=会话 UA/请求头配置（网络层协议头对齐）；无持久化。

## 6. 分支、失败、取消与恢复

两处 try/catch warn（`:84-86`/`:100-102`）——设置失败不崩；无恢复（下次 configureSession 重试，WeakSet 已标记则跳过——**照实：失败后同会话不重试**）。

## 7. 权限与权威状态

- **零 Cookie 操纵**红线（`:77-79`）；STATIC_RESOURCE_TYPES 不含业务请求类型（`:58-61`）。
- 高熵提示对齐策略（`:30` 注释：userAgentMetadata 让 Chromium 自行生成一致 sec-ch-ua*；`onBeforeSendHeaders` 无条件覆盖内核高版本提示 `:93`）。

## 8. 修改影响面

改 UA/CH 影响瑞数放行；误动 Cookie 会瘫痪同步 AJAX（红线）；与启动开关/preload/script 联动。

## 9. 测试证据

`yanhu-fingerprint.test.ts`（同批）：UA 含 Chrome/133 不含 Electron/Profer、平台对齐、Client Hints 低熵-only（`sec-ch-ua-platform-version` undefined 断言）、isCdutDomain 判定。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 8 导出/红线 | 已证实 | 文件全读 |
| 瑞数 WAF 行为叙述 | 推断 | 注释自述（规格书 4.2 不在冻结树） |
| WeakSet 失败不重试的实效 | 推断 | `:115-117` 代码语义 |

## 11. 覆盖表

全文件 covered；测试 §9；WAF 实效 unknown。
