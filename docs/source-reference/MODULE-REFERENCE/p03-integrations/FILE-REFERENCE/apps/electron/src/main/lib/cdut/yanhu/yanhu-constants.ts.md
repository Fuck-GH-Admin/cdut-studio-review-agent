---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-constants.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 04ea3d8a2095fd2c1ee9ec2272b580a1672ce889
sha256: 9efc76edd97fa695dafa0adbb35d64e8cff16c8ecc2e3be01efec9040a243084
lines: 165
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-constants.ts

## 1. 结论与边界

智联万站常量与基础契约（文件头 `:1-8`）：集中定义默认入口、域名白名单正则、指纹伪装 UA/Client Hints、惰性休眠阈值、持久化路径、主题兜底样式。**纯常量与纯函数，无副作用**（不创建窗口、不写盘）。

不做的事：不含逻辑分支（除三个纯函数）；不做放行裁决（`CDUT_DOMAIN_REGEX` 明示**不参与放行裁决**，`:43`）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `YANHU_HOME_URL` | `:15` | 砚湖易办入口（与 `@profer/shared.YANHU_DEFAULT_HOME_URL` 同源） |
| `YANHU_CHROME_VERSION`/`YANHU_CHROME_MAJOR` | `:18/:20` | `133.0.0.0`/`'133'`（对齐 Chromium 133 稳定版） |
| `YANHU_USER_AGENT` | `:28-30` | 按平台（Mac/Win）生成真实 Chrome 133 串；**严禁暴露 Electron/Profer 标识** |
| `YANHU_CLIENT_HINTS` | `:36-40` | sec-ch-ua 三头（值含引号字面量，序列化不可再包引号，`:34`） |
| `CDUT_DOMAIN_REGEX` | `:51` | 校内域正则（仅供瑞数清洗/主框架路由/证书豁免复用；`evil-cdut.edu.cn.phishing.com` 必然不匹配，`:49`） |
| `YANHU_ONE_TIME_TICKET_KEYS` | `:54` | `['ticket','qzticket']` |
| `hasOneTimeTicket` | `:57-59` | URL 是否携带一次性票据 |
| `stripOneTimeTicket` | `:68-83` | 剔除票据参数（持久化/唤醒重载/刷新前必用——一次性凭证消费后重导航致 SPA 空壳，`:61-67`） |
| `isYanhuSsoAppUrl` | `:92-95` | `/\/xsfw\/sys\//` 或 `/\/jsxsd\//` 命中（恢复时回站内入口防 CAS 踢回空壳，`:85-91`） |
| `YANHU_DORMANT_MAX_BACKGROUND`/`YANHU_DORMANT_IDLE_MS`/`YANHU_SOFT_TAB_LIMIT` | `:98/:100/:102` | 10 / 30 分钟 / 30 |
| `YANHU_WINDOW_OPEN_COALESCE_MS` | `:110` | 1500（同 origin+pathname 重复 window.open 合并激活既有标签） |
| `getYanhuTabsPath`/`getYanhuEventsLogPath` | `:117-131` | `~/.cdutai/yanhu-express/tabs.json` / `events.log` |
| `YANHU_EVENTS_LOG_MAX_BYTES` | `:134` | 2MB（滚动 events.log.1） |
| `YANHU_TABS_STORE_VERSION` | `:137` | 1 |
| `YANHU_DARK/LIGHT_SCROLLBAR_CSS` | `:140-155` | 主题降级细滚动条 CSS |
| `YANHU_DARK/LIGHT_VIEW_BACKGROUND` + `resolveYanhuViewBackground` | `:158-165` | `#09090b`/`#ffffff` + 明暗解析 |

## 3. 内部逻辑与关键流程

三个纯函数：`hasOneTimeTicket`（正则 `[?&](ticket|qzticket)=` 大小写不敏感）；`stripOneTimeTicket`（URL 解析后按小写匹配删除 searchParams，未变返回原串，解析失败返回原串）；`isYanhuSsoAppUrl`（两条路径正则）。其余为常量。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：yanhu 目录各服务（theme-service/tabs-store/browser-tools 等）共享引用；`CDUT_DOMAIN_REGEX`/票据函数由导航/持久化链路消费。出向：`@profer/shared.YANHU_DEFAULT_HOME_URL`、`config-paths.getConfigDir`、`node:path`。

## 5. 数据 I/O、读写与副作用

无（路径函数仅拼接字符串）。

## 6. 分支、失败、取消与恢复

`stripOneTimeTicket` 解析失败返回原串（`:80-82`）；其余无分支。

## 7. 权限与权威状态

- 指纹口径：UA/Client Hints 双重对齐真实 Chrome（防交叉校验识破）。
- 票据口径：一次性凭证不得复用（`stripOneTimeTicket`/`isYanhuSsoAppUrl` 的恢复语义）。
- `CDUT_DOMAIN_REGEX` 不参与放行裁决（防误当白名单）。

## 8. 修改影响面

改常量 → 影响指纹一致性/休眠/持久化/主题降级全链；`YANHU_DEFAULT_HOME_URL` 与 shared 同源联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-theme-service.test.ts`（常量口径部分）；票据/域名函数测试不在本批 18 文件清单。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯常量/纯函数、零副作用 | 已证实 | 文件头 |
| 指纹双重对齐+禁露标识 | 已证实 | `:25-40` |
| 票据一次性语义 | 已证实 | `:61-95` |
| 域名正则防钓鱼域 | 已证实 | `:43-51` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量族（14 组） | 2 | `:15-165` | covered |
| 三个纯函数 | 3 | `:57-95` | covered |
