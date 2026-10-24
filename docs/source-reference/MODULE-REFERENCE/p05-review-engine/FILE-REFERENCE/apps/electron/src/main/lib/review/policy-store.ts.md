---
path: apps/electron/src/main/lib/review/policy-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 670e8c1692017adae475bcf4e2de46bcf32f528e
sha256: 15be2ce8885d541f4216ee9e41c78f8f340f370de41b8aa252a0cc15c9a9adea
lines: 167
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/policy-store.ts

## 1. 结论与边界

政策仓库（N1b，头注 :1-8）：`review-policies/{policyId}/versions/{version}.json` 不可变发布版；模板引用精确到 policyId+version+contentHash（`validatePolicyRef`）；**发布要求至少一条负责人确认记录（AI 起草不自动确认）**；纯 Node 无数据库。

边界：规则编译为简单行编译（`compileOwnerRules`，不做语义理解）；引用消费在 `effective-rules`/`template-store`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isSafePolicyId` | fn | 19-22 | `^[\p{L}\p{N}_-]{1,120}$`（防 `../` 逃逸） |
| `canonicalContentHash` | fn | 40-43 | 内容 sha256 |
| `savePolicyDraft` | fn | 51-66 | 存草稿（不覆盖已发布） |
| `getPolicy` | fn | 67-86 | 读版本（缺省取最新） |
| `listPolicies` | fn | 87-98 | 每政策最新版列表 |
| `publishPolicy` | fn | 99-112 | 发布（需确认记录；published 不可变） |
| `PolicyRefCheck`/`validatePolicyRef` | interface/fn | 113-137 | 引用校验（存在+已发布+hash 一致） |
| `compileOwnerRules` | fn | 138-167 | 行文本→RuleSpec（确定性） |

内部：`SAFE_POLICY_ID`（:14）、`assertPolicyIdentity`（:20-23）、`policiesRoot`（:25-29）、`policyPath`（:31-33）、`writeAtomic`（:38-42，随机 tmp+rename）。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. **身份守卫**：`assertPolicyIdentity`（:20-23）ID 合法 + version 安全整数 ≥1。
2. **`savePolicyDraft`**（:47-65）：只接受 `status==='draft'`（:49）；已发布版本不可覆盖 `政策版本 X 已发布不可覆盖；请提升版本号`（:51）；`contentHash` 必须等于实际内容 hash `政策内容 hash 不一致：声明…，实际…`（:53-56）；原子写（:57-60）。
3. **`getPolicy`**（:67-84）：非法 id/version → undefined；无目录 → undefined；版本号解析降序取最新（:73-77）；解析失败 `console.warn` + undefined（:81-83）。
4. **`publishPolicy`**（:96-108）：不存在 throw `政策不存在: …`；已发布幂等返回（:100）；`confirmations.length===0` → throw `政策发布前至少需要一条负责人确认记录（AI 起草不自动确认）`（:101-103）；置 `published`+publishedAt 原子写（:104-106）。
5. **`validatePolicyRef`**（:114-129）：ID/版本合法、存在、已发布、`contentHash` 一致，否则 `{ok:false, reason}`（中文）。
6. **`compileOwnerRules`**（:133-167）：逐非空行；`[高|中|低|high|medium|low]` 前缀 → 严重度（:141-145）；`[A-Z]{1,4}\d{1,3}` 或 `第 N 条` 编号，否则 `R{index+1}`（:146-147）；产出 `execution:'semantic'`、`semanticOutputEnum:['compliant','non-compliant']`、`onFail:'manual-review'`、`onUnknown:'needs-confirmation'`、`priority:index+1`、`confirmation:'confirmed'`（:148-162）。

## 4. 调用者与调用链

入向（生产）：`effective-rules.ts:7`（canonicalContentHash/getPolicy）、`template-store.ts:15`（validatePolicyRef）、`application-service.ts:15`（validatePolicyRef）、`batch-automation-gates.ts:8`（getPolicy）。测试/夹具：`effective-rules.test.ts`、`template-asset-contract.test.ts`、`fixtures/*`。`compileOwnerRules` 被 `review-ipc.ts:1178`（动态 require）/:1181（政策编辑通道 `compiledRules` 编译）生产消费（另有 `owner-rules.test.ts` 测试）；`listPolicies`/`isSafePolicyId` 生产零消费者（否定范围：`apps/electron/src` 全部 `.ts` 含动态 require/import，仅定义/测试/夹具命中）。（r1 校订 NB17-F-02）出向：`../config-paths`（:12）、`node:fs`/`node:crypto`（:10-11）。

## 5. 数据 I/O、读写与副作用

- 读写 `review-policies/{policyId}/versions/{version}.json`（随机 tmp+rename 原子写，:38-42）。
- 副作用：`console.warn`（:82）、`console.log`（:107）、mkdir（:27/:59）。

## 6. 分支、失败、取消与恢复

- 5 类 throw（身份不合法/版本不合法/只接受草稿/已发布不可覆盖/hash 不一致/政策不存在/无确认记录）；读失败返 undefined（fail-safe）。
- 不可变性：published 版本文件不再改写（:100 幂等返回）。
- 无取消概念。

## 7. 权限与权威状态

- 发布权威：**至少一条负责人确认记录**才可发布（:101-103）——AI 起草不自动确认（头注 :5）。
- 引用权威：`validatePolicyRef` 三性（存在/已发布/hash 一致）是模板发布前置（07 §2.2）。
- 路径权威：`isSafePolicyId` 禁路径分隔符/点号（:14-18，注释 :13 防 `../` 规范化逃逸）。
- 编译权威：`compileOwnerRules` 是确定性文本编译，复杂条件由负责人在原文说明（注释 :130-132）。

## 8. 修改影响面

- `effective-rules` 的 F03_* 校验、`template-store` 发布检查、`batch-automation-gates`。
- `compileOwnerRules` 生产消费方=政策编辑通道（`review-ipc.ts:1178` 动态 require/:1181 `compiledRules` 编译）；产出的 id/confirmation 另被 F03/规则链消费。（r1 校订 NB17-F-02：原「三符号生产零消费者」混写已更正——`listPolicies`/`isSafePolicyId` 确为零非测试消费者。）
- 同测：`effective-rules.test.ts`/`template-asset-contract.test.ts`（间接）。

## 9. 测试证据

无专属测试文件；间接：`effective-rules.test.ts`（真实 savePolicyDraft/publishPolicy/canonicalContentHash 流程，:36-99）、`template-asset-contract.test.ts` TAR-18（`savePolicyDraft` 对 `['../outside','a/b','has.dot','']` 全部 throw 且 `getPolicy` undefined，:64-66）。缺口：`publishPolicy` 无确认分支、hash 不一致分支、`compileOwnerRules`、`listPolicies`。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出/内部符号存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 发布需确认记录（AI 不自动确认） | 已证实 | :101-103 |
| 路径守卫（TAR-18） | 已证实 | :14-18 + 测试 |
| published 不可变 | 已证实 | :100 |
| `compileOwnerRules` 行为 | 未知（未测） | :133-167 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `savePolicyDraft`/`getPolicy`/`publishPolicy` | §3.2-3.4 | 47-108 | covered（间接） |
| `validatePolicyRef` | §3.5 | 114-129 | covered（间接） |
| `compileOwnerRules` | §3.6 | 133-167 | covered（未测） |
| 路径守卫 | §3.1 | 14-23 | covered（TAR-18） |
