---
path: apps/electron/src/main/lib/security/cert-blacklist.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef791ef854421ad9e7b55dd5a2331f6e52ec2e60
sha256: 81b7137cbfc8755b3f0ad34a734d12cdca43967b26052ce98b17026852c2befe
lines: 376
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/security/cert-blacklist.ts

## 1. 结论与边界

**eMudhra 泄露证书链拦截与内置浏览器安全插页**（376 行，2026-10 全球 PKI 事件专项防御）：`setCertificateVerifyProc` 接管证书校验——泄露链严格先于校内豁免拒绝并登记，用户可临时放行（内存态）；命中阻断时由内置浏览器渲染红色盾牌插页。

边界：判定/登记/插页生成为纯逻辑（Electron 仅 `import type`，注释 `:16-17` 保证 Bun 测试可直跑）；仅 `installCertificateSecurityPolicy` 触运行时；域名判定复用 `isCdutDomain`（yanhu-domain-gatekeeper 域外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isCompromisedEmudhraCertificate` | 导出函数 | 59-70 | `(cert: Certificate) => boolean` | 链上任一级泄露特征 |
| `allowDomainTemporarily` | 导出函数 | 80-93 | `(sessionId, tabId, hostname): void` | 登记临时放行 |
| `isDomainTemporarilyAllowed` | 导出函数 | 99-101 | `(sessionId, hostname) => boolean` | 查询（任一 tab 授权即真） |
| `revokeTabGrants` | 导出函数 | 104-112 | `(sessionId, tabId): void` | 关标签撤销 |
| `wipeSessionGrants` | 导出函数 | 115-117 | `(sessionId): void` | 会话级清空 |
| `resetCertSecurityStateForTest` | 导出函数 | 120-123 | `(): void` | 测试专用清空 |
| `CertBlockedRecord` | 导出接口 | 129-135 | url/hostname/issuerName/subjectName/blockedAt | |
| `recordCertBlocked` | 导出函数 | 139-146 | `(sessionId, record): void` | 阻断登记 |
| `getCertBlockedRecord` | 导出函数 | 148-150 | `(sessionId, hostname) => Record\|undefined` | did-fail-load 判定用 |
| `CERT_VERIFY_ACCEPT`/`CERT_VERIFY_REJECT` | 导出常量 | 157-158 | `0`/`-2` | Electron verifyProc 约定 |
| `CertVerifyDecision` | 导出接口 | 160-164 | `{verdict, recordBlocked?}` | |
| `CertVerifyInput` | 导出接口 | 166-176 | `{url, errorCode, certificate, sessionId}` | 伪 URL 约定见注释 |
| `decideCertificateVerification` | 导出函数 | 193-215 | `(input) => CertVerifyDecision` | 四分支判定核心 |
| `installCertificateSecurityPolicy` | 导出函数 | 230-247 | `(ses, sessionId?): void` | 幂等装配 verifyProc |
| `InterstitialCertInfo` | 导出接口 | 253-256 | `{issuerName, subjectName}` | |
| `buildSecurityInterstitialHtml` | 导出函数 | 280-376 | `(blockedUrl, certInfo) => string` | 插页 HTML |
| `matchesCompromisedIssuerName`/`extractHostname`/`escapeHtml`/`displayHost` | 内部函数 | 40-46、178-184、258-273 | | |
| 常量 | 内部 | 31-37 | `EMUDHRA_COMPROMISED_EXACT_CNS`（2 精确 CN）、`MAX_CERT_CHAIN_DEPTH=8` | |

导出计数：`export` **17 条**（`:59`、`:80`、`:99`、`:104`、`:115`、`:120`、`:129`、`:139`、`:148`、`:157`、`:158`、`:160`、`:166`、`:193`、`:230`、`:253`、`:280`），与源码逐条一致。

## 3. 内部逻辑与关键流程

- **泄露特征**（`:40-70`）：仅匹配各级 **issuerName**（不匹配 subjectName，注释 `:48-58` 论证：中间 CA 的 subject 会作为下级 issuer 出现可覆盖全链；叶子 subject 由站点任意命名会与官方测试站撞名产生假阳性）；`matchesCompromisedIssuerName` = 精确 CN 集合（小写）或含 `emudhra`/`emsign`；迭代 `issuerCert` 链深度 ≤8、自引用终止（`:61-68`）。
- **临时放行**（`:76-123`）：`temporaryGrants: Map<sessionId, Map<hostname, Set<tabId>>>`（仅内存，重启失效）；`isDomainTemporarilyAllowed` 任一 tab 授权即真（注释 `:96-98`：verifyProc 无标签上下文，同会话其他 tab 受益为已知边界）；`revokeTabGrants` 关 tab 失效（`:103` 注释决策）；`wipeSessionGrants` 会话级清空。
- **四分支判定**（`:193-215`，顺序即安全，注释 `:186-192`）：①泄露链 → 临时放行则 ACCEPT，否则 REJECT+`recordBlocked`（`:197-210`）；②`isCdutDomain(url)` → ACCEPT（**仅在未命中泄露链时**，`:212`——泄露链严格先于校内豁免）；③`errorCode === 0` → ACCEPT（`:213`）；④其余 → 原错误码拒绝（`:214`）。
- **装配**（`:230-247`）：`WeakSet` 幂等；`setCertificateVerifyProc` 内以 `https://<hostname>/` 伪 URL 调判定（注释 `:236-237`：request 仅 hostname）；命中阻断 `recordCertBlocked` 登记后 `callback(verdict)`。
- **插页 HTML**（`:280-376`）：`escapeHtml` 三字段防注入（`:258-265`）；深浅主题自适应；双按钮经哨兵 URL 回投（`SENTINEL_ALLOW_URL/BACK_URL` 来自 shared，`:22`）——`location.href` 顶层导航（主进程 will-navigate 拦截不触网）+ 250ms 后 `window.open` 回退（setWindowOpenHandler 拦截），注释 `:363-370`。

## 4. 调用者与调用链

- 入向（全冻结树 `grep cert-blacklist|六导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/index.ts:12` import；`:925-926` `installCertificateSecurityPolicy(defaultSession)` + `fromPartition(CDUT_AUTH_PARTITION)`（sessionId=`CDUT_AUTH_CERT_SESSION_ID`）。
  - `apps/electron/src/main/lib/browser-controller.ts`（did-fail-load → `getCertBlockedRecord` → `buildSecurityInterstitialHtml` 渲染插页）。
  - `apps/electron/src/main/lib/cdut/yanhu/yanhu-cert-interstitial.ts` + `yanhu-cert-interstitial.test.ts`（桌宠 WebView 插页消费）、`yanhu-express-manager.ts`（域外消费方）。
  - **直接测试**：`security/cert-blacklist.test.ts`（263 行，**21 test**，同批）。
- 出向：`electron` 类型（仅 `import type`，`:20`）、`@profer/shared` 哨兵常量（`:22`）、`../cdut/yanhu/yanhu-domain-gatekeeper.isCdutDomain`（`:24`）。

## 5. 数据 I/O、读写与副作用

- 磁盘：**无**（全内存态：`temporaryGrants`/`blockedCertRecords`，重启即清）。
- 副作用：`setCertificateVerifyProc`（接管会话证书校验，注释 `:228`：安装后 `certificate-error` 链路即被接管）；插页 HTML 由浏览器窗口渲染。

## 6. 分支、失败、取消与恢复

- 分支即 §3 四分支；无 throw 路径（`extractHostname` 解析失败回退原串，`:178-184`）。
- 恢复：临时放行不持久化（设计决策，`:79`）；会话销毁由 `wipeSessionGrants` 清理（调用方域外）。
- 自引用病态链：深度上限 8 终止（`:36`、`:66`）。
- 取消：不适用（纯判定）。

## 7. 权限与权威状态

- 安全权威：eMudhra/emSign 泄露特征表（硬编码 2 精确 CN + 子串匹配）；判定严格先于 `isCdutDomain` 豁免（注释 `:10-14`：`*.cdut.edu.cn` 命中泄露链同样拒止）。
- 用户决策权：插页「忽略并继续访问」→ 临时放行（内存态、tab 级撤销）。
- 临时放行为**同会话全 tab 生效**（已知边界，`:96-98`）。

## 8. 修改影响面

- `index.ts:925-926` 双会话装配；`browser-controller`/`yanhu-cert-interstitial` 插页链。
- `isCdutDomain`（域外）与哨兵 URL（shared）为契约。
- 测试：`cert-blacklist.test.ts`（21 用例）覆盖判定/放行生命周期/插页转义，改动需同步。

## 9. 测试证据

- 直接测试：`security/cert-blacklist.test.ts`（263 行，bun:test，**21 test**，NOT_RUN）。mock 边界：`fakeCert` 构造 `Certificate` 子集（`:26-32`）；`resetCertSecurityStateForTest` 清态；纯逻辑无 Electron 运行时。
- 断言摘要（5 describe）：①泄露判定 7（精确 CN×2 命中 `:35-44`、大小写混合 `:46-55`、多级链遍历 `:57-67`、叶子 subject 撞名 LE 链不误伤 `:69-85`、eMudhra BV 中间 CA 命中 `:87-92`、干净链/未知 issuer 不命中 `:94-102`、自引用不死循环 `:104-`）；②临时放行生命周期 3（`:112-130` 段）；③四分支判定 7（`:139-210` 段：泄露拒/放行、校内豁免、errorCode 0、其余原码拒绝等）；④阻断登记 1（`:222` 段）；⑤插页 HTML 3（含关键文案/哨兵 URL/`d &lt; 256` 转义断言 `:241-248`、XSS 转义 `:251-258`、畸形 URL 不抛 `:260-262`）。
- 未覆盖：`installCertificateSecurityPolicy` 装配（需 Electron session）、`revokeTabGrants` 与 `isDomainTemporarilyAllowed` 跨 tab 边界组合、真实证书链。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实 TLS；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 导出逐条 | 已证实 | `:59-280` |
| issuerName-only 匹配论证 | 已证实 | `:48-58` 注释 |
| 泄露链严格先于校内豁免 | 已证实 | `:197-212` 顺序 |
| 四分支（含其余原错误码拒绝） | 已证实 | `:193-215` |
| 临时放行内存态/同会话跨 tab 边界 | 已证实 | `:76-101` |
| 哨兵双通道回投（location.href+window.open） | 已证实 | `:362-373` |
| 21 用例断言 | 已证实 | `cert-blacklist.test.ts:34-262` |
| 插页 XSS 转义 | 已证实 | `:258-265`（测试 `:251-258`） |
| 真实 TLS 校验行为 | 未知 | NOT_RUN |
| 测试通过与否/运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isCompromisedEmudhraCertificate` | §3/§9 | 40-70 | covered |
| 临时放行四函数 | §3/§9 | 76-123 | covered |
| 阻断登记 | §3/§9 | 129-150 | covered |
| `decideCertificateVerification` | §3/§9 | 193-215 | covered |
| `installCertificateSecurityPolicy` | §3 | 230-247 | covered（无测试） |
| `buildSecurityInterstitialHtml` | §3/§9 | 280-376 | covered |
| 真实 TLS/会话行为 | §10 | — | unknown（NOT_RUN） |
