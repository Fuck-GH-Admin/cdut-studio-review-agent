---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-domain-gatekeeper.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd5fad8cf00d48a194295d808b465b6c8a42191d
sha256: 60e12072f69ff852a62bf493e7925eddc139b6e6469cdbf75f11441e8073d1fb
lines: 110
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-domain-gatekeeper.ts

## 1. 结论与边界

智联万站**安全网关**（110 行）：校验导航目标为可访问 http/https 网页地址 + 规范化地址栏输入，供 `will-navigate`/`setWindowOpenHandler`/地址栏三处统一裁决（`:4-5`）。访问范围（`:7-8`）："已解除仅限校内域名限制，站外 http/https 一律放行，仅拦截非网页协议（mailto:/javascript:/file: 等）与无法规范化输入"。纯逻辑不加载页面（`:10`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `isCdutDomain` | `:25-34` | 校内域判定（正则快门+URL 解析双重校验防伪装域 `:19-20`）；**不再参与放行裁决**，仅供瑞数 *P 清洗等专属逻辑复用（`:22-23`） |
| `isInternalYanhuUrl` | `:40-42` | 内部哨兵协议（`isYanhuBlockedUrl`）——永不真导航，视为放行 |
| `isWebUrl` | `:49-57` | URL 解析确认 http/https 协议（杜绝 javascript:/file:/自定义） |
| `normalizeInputUrl` | `:66-72` | 带协议原样；裸域名补 `https://`（`^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(:\d+)?(/.*)?$`）；其余 null（**不提供搜索** `:64`） |
| `YanhuGatekeeperDecision` | `:75-80` | `{allowed, url}`（放行与阻断都回传规范化绝对地址） |
| `YanhuDomainGatekeeper`（class） | `:87-107` | `isAllowed`（哨兵\|\|网页）、`evaluate`、`resolveAddressInput`（null=忽略输入）；无状态设计（`:85`） |
| `yanhuDomainGatekeeper` | `:110` | 全局单例 |

## 3. 内部逻辑与关键流程

裁决链：`isAllowed = isInternalYanhuUrl || isWebUrl`（`:90`）；地址栏：`normalizeInputUrl`→`evaluate`（`:102-106`）。`isCdutDomain` 双重校验（正则→URL hostname 严格匹配 `cdut.edu.cn`/`*.cdut.edu.cn`，`:30`）。

## 4. 调用者与调用链

main 导航三处裁决（`:5`）；出向 `@profer/shared`（isYanhuBlockedUrl）、`./yanhu-constants`（CDUT_DOMAIN_REGEX）。

## 5. 数据 I/O、读写与副作用

纯函数/无状态类；无 I/O。

## 6. 分支、失败、取消与恢复

URL 解析异常→false（`:31-33`/`:54-56`）；normalize 不可规范化→null（上层忽略）。

## 7. 权限与权威状态

- **放行策略权威**（`:7-8`）：站外放行+仅拦非网页协议。
- 伪装域防线（`evil-cdut.edu.cn.phishing.com` 判 false，`:19-20`/测试 `:32-33`）。
- 不猜搜索（`:64`）——输入纯文本返回 null。

## 8. 修改影响面

改裁决影响全部智联万站导航；`isCdutDomain` 语义影响瑞数专属逻辑；normalize 正则影响地址栏行为。

## 9. 测试证据

`yanhu-domain-gatekeeper.test.ts`（同批，9 个 `test(`）：校内 7 子域放行/8 伪域拒绝、isWebUrl 3 放行/5 阻断、normalize 原样/补全/null、类裁决 4 组。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/裁决链/红线 | 已证实 | 110 行全读 |
| 访问范围解除的历史陈述 | 已证实（注释） | `:7-8` |
| 三处调用点实现 | 未知 | main 不在本批 |

## 11. 覆盖表

全文件 covered；测试 §9；调用点 unknown。
