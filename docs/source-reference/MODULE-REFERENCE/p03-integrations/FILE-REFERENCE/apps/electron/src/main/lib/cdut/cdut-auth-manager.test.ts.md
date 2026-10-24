---
path: apps/electron/src/main/lib/cdut/cdut-auth-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f23b42db9d39b019ee407dc0b30988289c7cf69e
sha256: 75099059bea992ea19b7434521262e43861b148079f9d191afc50a6b96950386
lines: 260
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-auth-manager.test.ts

## 1. 测试目标

特区账户认证管理器单元测试（文件头 `apps/electron/src/main/lib/cdut/cdut-auth-manager.test.ts:1-12`）：loadPersistedAccount（重启默认 disconnected）/getSavedAccount（脱敏元数据+记住密码）/logout（清状态+删文件+复位）/persistAccount（仅密码经 token-crypto 加密落盘）；隐藏认证窗口全流程依赖真实 Electron 导航无法单测（`:10-11` 如实声明）。另含证件照定位解析（`extractProfilePhotoUrl`，来自 `./cdut-jw-client`——跨文件归属登记）。

mock 边界：`PROFER_CONFIG_DIR` 临时目录隔离（`beforeEach` `:69-72`，`afterEach` 还原+删临时树 `:74-78`）；私有 `persistAccount` 经类型断言触达（`:53-67` 注释：生产代码不暴露写入口，单测受控调用）；无 mock 模块。

## 2. 用例清单

2 describe、9 test：

- `CdutAuthManager 特区账户持久化`（`:80`）4 用例：`:81` 加载加密账户元数据+状态复位 disconnected、`:116` getSavedAccount 脱敏+savedPassword、`:142` logout 清状态/删文件/回调广播、`:171` 记住密码仅密文落盘（未勾选则空串）。
- `青果教务证件照定位解析`（`:204`）5 用例：`:205` img#xjkp、`:217` img#xszp、`:226` showzp.do 相对路径（trailing slash 不漏匹）、`:237` 排除 logo/占位图、`:251` 链接兜底。

## 3. 真实断言

- `:102-113` 元数据 6 字段+`status==='disconnected'`（`:109`，重启必须复位）+密文可解密回明文+`getRememberedPassword()`。
- `:134-139` hasSaved/savedPassword 明文（一键填充）。
- `:164-168` logout 后 profile 复位、`existsSync` false、回调广播 disconnected。
- `:184-200` `encryptedPassword` 非明文、`proferv1:` 前缀（AES-GCM 格式）、可解密；未勾选→`encryptedPassword===''`（`:200`）。
- `:214/:223/:234/:248/:257` 证件照地址提取五形态。

## 4. 未覆盖与脆弱点

未覆盖：登录全流程（头注释如实声明依赖真实导航）、setStatusCallback 之外的 IPC 面、token-crypto 内部（`../token-crypto` 非本批）。私有方法触达依赖类型断言（源码重构会碎）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例行号与断言文本 | 已证实 | `:81-258` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 持久化 4 路径+照片解析 5 形态 | §3 | covered |
| 登录全流程 | §4 | unknown（如实声明） |
| 实际运行 | §5 | unknown（NOT_RUN） |
