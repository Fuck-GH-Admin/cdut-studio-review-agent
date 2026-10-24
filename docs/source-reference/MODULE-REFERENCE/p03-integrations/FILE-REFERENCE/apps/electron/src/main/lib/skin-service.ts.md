---
path: apps/electron/src/main/lib/skin-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6215761e6708c9e1eed8a4be1c821d320abe661
sha256: 01a07d2183d6cbd70b47152c146f981dce7f018d0c6149ca610c4e7618534c5f
lines: 620
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-service.ts

## 1. 结论与边界

皮肤服务（620 行）：扫描内置皮肤（`resources/skins/`，随应用打包）+ 用户皮肤（`~/.cdutai/skins/`）合并注册表；皮肤包=目录（id=目录名）：`manifest.json`+`skin.css`+`preview.*`（`:1-13`）。id 冲突策略：**用户皮肤不覆盖内置**（跳过告警）。CSS 内容三级缓存（内存 64/磁盘签名失效/预览 32）+ **`cdut-skin://` 协议**按需供图（`:537-539` P2 改造，弃 base64 内联）。

## 2. 导出与关键符号（13 项，主根 grep=13）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `MAX_SKIN_CSS_BYTES=512*1024` | `:116` | 安装+运行时共用上限 |
| `SkinCssAuditResult` | `:178-183` | `{ok, reason?, assetRefs[]}` |
| `auditSkinCss` | `:197-267` | **CSS 内容审计单一真源**（安装/读取共用 `:185-186`）；最小 CSS 词法扫描防两类绕过（注释混淆/转义 `\75 rl(` `:188-193`）；禁 @import/@font-face；url/src 参数必须小写 `assets/` 本地图片且禁转义 |
| `getUserSkinDir` | `:277` | `getConfigDir()/skins` |
| `getBuiltinSkinIds` | `:282-286` | 内置 id 集（防覆盖） |
| `invalidateSkinCache` | `:289-304` | 安装/删除后清缓存（内存+磁盘） |
| `SkinManifestRaw` | `:307-319` | 宽松 manifest 形状 |
| `parseSkinManifestText` | `:327-346` | 剥 BOM+JSON+id/tone 校验（与 skin-manager-service 共用 `:322-325`） |
| `readManifest` | `:349-401` | 单皮肤解析（符号链接拒 `:354`、id===basename `:372`、contractVersion 仅整数≥2 否则归 1 `:388`） |
| `scanSkins` | `:408-445` | 注册表（内置优先 `:415-418`、损坏条目降级跳过 `:405`） |
| `getSkinCss` | `:484-560` | 读取+审计+改写 `cdut-skin://`（超限/审计失败→负缓存拒注入 `:526-536`） |
| `handleProferSkinRequest` | `:567-593` | 协议 handler（命名遗留见矛盾②） |
| `getSkinPreview` | `:596-620` | 预览 data URL（签名失效） |

## 3. 内部逻辑与关键流程

- **词法扫描器**（`:124-176`）：CSS ident/字符串/注释/转义解码（`decodeCssEscapes:132`）——审计的地基。
- **getSkinCss 链**：内存缓存→findSkinDir（id 白名单 `:449`）→符号链接拒→磁盘缓存（`skinCssSignature:457` mtime+assets 列表；`meta.v===2 && sig` 复用）→读+上限+审计→`SKIN_ASSET_RE` 改写→双写缓存。
- **协议 handler**（`:562-593`）：URL→hostname（小写化）→`SKIN_ID_RE` 403→findSkinDir 404→路径白名单 `SKIN_ASSET_PATH_RE` 403→resolve 前缀二次穿越防御 403→符号链接/非普通文件 404→`net.fetch(file:)`。
- **预览**（`:595-620`）：`previewSignature`（扩展优先级 `.webp/.png/.svg/.jpg/.jpeg`）→缓存/负缓存→base64 data URL。

## 4. 调用者与调用链

`apps/electron/src/main/ipc.ts:252` import、`apps/electron/src/main/ipc.ts:2144-2146` GET_SKINS/GET_SKIN_CSS/GET_SKIN_PREVIEW、`apps/electron/src/main/ipc.ts:2167` invalidate）、`apps/electron/src/main/index.ts:80` scheme 注册、`apps/electron/src/main/index.ts:919` protocol.handle、skin-manager-service（安装校验共用 audit/parse）、preload。出向 electron（app/net）、`./config-paths`、`../../types`。

## 5. 数据 I/O、读写与副作用

读皮肤目录（内置+用户）；写磁盘缓存（`~/.cdutai/skin-cache/`）；`net.fetch(file:)` 供协议响应；无网络。

## 6. 分支、失败、取消与恢复

审计失败/超限→**负缓存空串**（避免重复扫盘刷警告 `:483`）；磁盘缓存写失败静默降级；损坏条目跳过不空表；符号链接三处拒绝（manifest/skin.css/assets）。

## 7. 权限与权威状态

- **auditSkinCss 单一真源**（`:185-186`）：安装+运行时同一审计，堵注释混淆/转义绕过（`:188-193`）。
- **协议白名单**（`:107`/`:562-565`）：kebab-case id + assets/ 图片路径 + resolve 前缀防穿越。
- **512KB 上限**（`:116`）；id 白名单防路径穿越（`:449`）。

## 8. 修改影响面

改审计规则影响安装+读取双面（单一真源）；改协议白名单需同步 `SKIN_ASSET_RE`/`SKIN_CSS_ASSET_RE`/handler（矛盾③ 双正则）；缓存签名口径影响皮肤热更新。

## 9. 测试证据

本批 2 测试文件共 2 个 `test(` + 1 个 `test.each`（预览缓存签名 2 例、manifest contractVersion 3 个 test 声明（含 test.each 6 子例））。**auditSkinCss/getSkinCss/协议 handler/scanSkins/invalidate 零直接单测**（详见测试手册 §4）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+主根抽查）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出/审计核心/协议链/缓存语义 | 已证实 | 620 行全读 + 主根抽查（exports=13、`:113`/`:116`/`:197`/`:327`/`:567` 命中、双正则字节相同=矛盾③ 实证） |
| **①** `:32`/`:501`"避免重复 base64 编码"理由过时（format v2 已改协议引用 `:537-538`，base64 仅存预览） | 已证实 | 三处注释对拍 |
| **②** `handleProferSkinRequest` 命名 Profer 遗留（协议/URL 全 cdut-skin） | 已证实 | `:567` + `apps/electron/src/main/index.ts:919` |
| **③** `SKIN_CSS_ASSET_RE` 与 `SKIN_ASSET_PATH_RE` 字节相同双写（与"单一真源"原则相悖） | 已证实 | 主根字节对拍 True |
| **④** 失败负缓存不对称（CSS 有/预览无）；**⑤** `:579` decodeURIComponent 不在 try 内，畸形编码抛 URIError 逃逸；**⑥** `invalidateSkinCache` skinId 未过白名单即拼 rmSync 路径（纵深缺口） | 已证实 | `:528`/`:534` vs `:616-618`、`:579`、`:296-297` |
| **⑧** 测试环境隔离不对称（文件 3 未设 PROFER_CONFIG_DIR） | 已证实 | 字节核对 |
| skin-manager-service.install 侧间接测试 | 未知 | 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 13 导出全量 | §2 | covered |
| 审计/协议/缓存三核心 | §3 | covered |
| 安全红线 | §7 | covered |
| 6 矛盾+测试缺口 | §9/§10 | covered |
