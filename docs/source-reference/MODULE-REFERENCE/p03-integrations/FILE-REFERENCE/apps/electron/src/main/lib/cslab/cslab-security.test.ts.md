---
path: apps/electron/src/main/lib/cslab/cslab-security.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10cf21b7d31c9b3cf59b71ef96fafa373be15fa6
sha256: 994d1e34f8a3be3ec36b49b88685fb3f70f9d662d88b21aa4514fb33e3eb1d59
lines: 189
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-security.test.ts

## 1. 测试目标

`cslab-security.ts` 本机门禁（`:1-6` 注释八覆盖：未初始化/长度校验/单向摘要落盘/重复初始化/验密/旧凭据迁移/锁定与重启/硬门禁断言）。`PROFER_CONFIG_DIR` 逐用例隔离（`:28-32`）。

## 2. 用例清单

1 个 describe + **11 个 `test()`**：未初始化状态（`:45`）、短密码拒绝不落盘（`:49`）、初始化落盘单向摘要+自动解锁（`:56`）、重复初始化拒绝且原密码有效（`:79`）、验密对错（`:90`）、5 次错误锁 30s 且期内正确密码也拒（`:104`）、锁定=模拟重启（`:125`）、非法参数/未初始化验密（`:132`）、v1 可逆密文透明迁移 v2（`:139`）、凭据截断不抛 RangeError（`:166`）、硬门禁三态（`:177`）。

## 3. 真实断言

- `:53/:62/:73-76` 短密码不落盘；落盘文件 `not.toContain(PASSWORD)`；`version` `toBe(2)`、`passwordHash` `/^[a-f0-9]{64}$/`、`salt` `/^[a-f0-9]{32}$/`、**`encryptedPassword` `toBeUndefined()`**。
- `:84/:87` 重复初始化拒绝（'已设置'）；原密码仍过。
- `:95-101/:114-122` 错误→'密码不正确'；第 5 次→'尝试次数过多'；**锁定期内正确密码也拒**。
- `:129` 锁定后 `{isInitialized:true, isVerified:false}`。
- `:134-136` 类型非法/空串/未初始化均失败。
- `:150-163` v1 迁移后 `version:2`+摘要+盐、无 encryptedPassword。
- `:170-174` passwordHash='deadbeef' 截断 → 失败而非抛。
- `:178-187` 硬门禁：未设抛'尚未设置'→初始化后不抛→锁定抛'已锁定'→验密后不抛。

## 4. 未覆盖与脆弱点

未覆盖：锁定 30s 后自动解锁（时间推进）、v1 密文损坏提示（`:188` 分支）。错误文案断言（'已设置'等）与实现耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例断言如 §3 | 已证实 | 逐行读 `:1-189` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 初始化/摘要落盘 | 3 | covered |
| 验密/锁定 | 3 | covered |
| 迁移/健壮/硬门禁 | 5 | covered |
