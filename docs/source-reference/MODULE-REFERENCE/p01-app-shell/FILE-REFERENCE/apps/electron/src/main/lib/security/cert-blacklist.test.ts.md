---
path: apps/electron/src/main/lib/security/cert-blacklist.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef2351abca076aa45333809940a34e8b114768db
sha256: 55bd86e278545d364a65e53dba6a2900cdc98747fe66650cbb1eae5b39b7da05
lines: 263
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/security/cert-blacklist.test.ts

## 1. 测试目标

`cert-blacklist`（同批深读）的安全判定语义：eMudhra 泄露链特征（issuerName-only、多级链、防误伤）、临时放行生命周期、证书校验四分支（泄露链严格先于校内豁免）、阻断登记、插页 HTML 转义与哨兵回投。框架 `bun:test`；mock 边界=`fakeCert` 构造 `Certificate` 子集 + `resetCertSecurityStateForTest` 清态（纯逻辑，无 Electron 运行时）。

## 2. 用例清单

用例计数：`test(` **21**（5 describe：泄露判定 7、放行生命周期 3、四分支 7、阻断登记 1、插页 3），`it(` 0——与源码计数一致。

| describe | # | 用例要点（行段） |
| --- | --- | --- |
| eMudhra 泄露链特征判定（`:34-110`） | 7 | 精确 CN 两种 emSign G3 命中（`:35-44`）；大小写混合/含字样命中（`:46-55`）；叶子由泄露中间 CA 签发多级链命中（`:57-67`）；叶子 subject 撞名 LE 合法链不误伤（`:69-85`）；eMudhra BV 中间 CA 经 issuerName 命中（`:87-92`）；干净链/未知 issuer 不命中（`:94-102`）；自引用病态链深度终止（`:104-110`） |
| 临时放行登记生命周期 | 3 | 登记后查询为真；撤销/清空后为假（`:112-130` 段） |
| 证书校验四分支判定 | 7 | 泄露链拒+登记、临时放行放行、校内域名豁免、errorCode 0 接受、其余原码拒绝等（`:139-210` 段） |
| 阻断登记 | 1 | `recordCertBlocked`/`getCertBlockedRecord` 往返（`:222` 段） |
| 安全插页 HTML（`:239-263`） | 3 | 关键文案+哨兵 URL+`d &lt; 256` 转义（`:241-248`）；恶意字段 XSS 转义（`:251-258`）；畸形 URL 不抛原样展示（`:260-262`） |

## 3. 真实断言

（代表性引用，全 21 用例逐条已读）

- `expect(isCompromisedEmudhraCertificate(fakeCert({issuerName:'emSign ECC Root CA - G3'}))).toBe(true)`（`:36-39`）；LE 撞名链 `toBe(false)`（`:84`）。
- 四分支样例：`decideCertificateVerification` 泄露+未放行 → `verdict: CERT_VERIFY_REJECT` 且带 `recordBlocked`；临时放行 → `CERT_VERIFY_ACCEPT`（`:139-210` 段）。
- 插页：`expect(html).not.toContain('<script>alert(1)</script>')`、`expect(html).toContain('&lt;script&gt;')`（`:256-257`）；`toContain(BROWSER_CERT_INTERSTITIAL_ALLOW_URL)`/`BACK_URL`（`:245-246`）；`toContain('not-a-url')`（`:261`）。
- 生命周期：`allowDomainTemporarily`→`isDomainTemporarilyAllowed` true；`revokeTabGrants`/`wipeSessionGrants`→false（`:112-130` 段）。

## 4. 未覆盖与脆弱点

- 未覆盖：`installCertificateSecurityPolicy`（Electron `setCertificateVerifyProc` 装配）、跨 tab 放行边界（同会话其他 tab 受益）、真实证书链/verifyProc 回调时序。
- 脆弱点：`fakeCert` 为结构子集断言（`as unknown as Certificate`），真实 Electron `Certificate` 字段差异未测；插页断言为字符串包含（不测 DOM 行为/哨兵导航实际拦截）。
- 纯逻辑层完整，装配层留运行验证（NOT_RUN）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3（含 5 describe 结构） | 已证实 | `cert-blacklist.test.ts:34-262` |
| mock 边界=fakeCert+清态（无 Electron） | 已证实 | `:26-32`、import `resetCertSecurityStateForTest` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 装配/真实 TLS 行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isCompromisedEmudhraCertificate` | §2/§3 | 34-110 | covered |
| 临时放行生命周期 | §2/§3 | 112-130 | covered |
| `decideCertificateVerification` 四分支 | §2/§3 | 139-210 | covered |
| 阻断登记 | §2/§3 | 222 | covered |
| 插页转义/哨兵/畸形 URL | §2/§3 | 239-262 | covered |
| `installCertificateSecurityPolicy` | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
