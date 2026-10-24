---
path: apps/electron/src/main/lib/review/review-v3-main-plan-provenance.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e9d1be91ada606bb63669cf822a97dfb7ad6dd1c
sha256: 673fb19a9bb632d7e9532583a925faffbf9ef09c5e94b0345c045edc57ab8c5a
lines: 161
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-plan-provenance.ts

## 1. 结论与边界

Dev-C C2-R05：物理重核的 Main-only **已发布 Plan 来源**。它是可信消费者，不是模板/学校政策发布者；B1 `candidate-held` 描述符永远不算已发布证据；发布记录（含 issuer 与不可变源 SHA）必须由独立特权 Main 政策权威提供，不能从 Renderer 文本、作者草稿或 Plan DTO 合成（文件头 `apps/electron/src/main/lib/review/review-v3-main-plan-provenance.ts:1-15`）。

边界：

- 发布物字节钉到权威声明的原始 SHA256，**每次验证都从 Main 配置目录重读**；无内存证书，撤销/篡改/缺证据/冷重启全部拒绝（`:10-12`）。
- 真实 B/学校权威与原件发布者仍是独立生产前置（`:13-14`）。
- 不注册 IPC、不发 ACK（`:14`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个类 = 3 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2MainPublishedPlanRecord` | 接口（导出） | 26-35 | `{schemaVersion:'review-v3-plan-publication/1',publicationId,issuerAuthorityId,publishedSourceCommit,status:'published'\|'candidate-held'\|'revoked',fingerprint,artifactSha256}` | 发布记录；commit 是 Git 溯源不是签名（`:30`） |
| `C2MainPublishedPlanSource` | 接口（导出） | 37-44 | `artifactRoot`（钉死绝对根）/`getCurrentPublication`/`assertAuthorizedPublication` | 注入权威 |
| `C2MainPublishedPlanProvenance` | 类（导出） | 61-161 | 三个 assert 方法 | 刻意不缓存不建记录（`:60`） |
| `PublishedArtifact` | 内部 | 46-50 | `{schemaVersion:'review-v3-published-plan-artifact/1',publicationId,canonicalPlan}` | 磁盘发布物形状 |
| `sha`/`goodId`/`deny` | 内部 | 52-58 | 64hex；ID 正则；抛 `C0ContractError('RECOVERY_REQUIRED',…)` | |

## 3. 内部逻辑与关键流程

### 3.1 构造（`:64-72`）

要求 `artifactRoot` 为绝对路径 + 两方法存在，否则 `ACTOR_UNTRUSTED: Independent Main published-Plan authority and absolute pinned root required`（`:65-70`）。

### 3.2 `assertPublishedCanonicalPlan(plan)`（`:75-118`）

1. `assertC0CanonicalPlan(plan)`；`plan.fingerprint` 64hex（`:76-77`）。
2. 记录存在且 `schemaVersion`/`status==='published'`/两个 goodId/`publishedSourceCommit` 40hex/`fingerprint` 相等/`artifactSha256` 64hex，否则拒绝（`Published Plan current source record is missing, untrusted or revoked`，`:78-85`）。
3. `assertAuthorizedPublication(record)`：注释强调必须从 C/Main 信任根独立证明 issuer，**不得**在生产实现为空操作（`:86-88`）。
4. 物理发布物：根必须是目录、`<fingerprint>.json` 必须是普通文件、`realpath` 后仍在根内（`Published Plan artifact escapes pinned root`，`:89-100`）；读字节（`:101`）；异常 → `Published Plan physical artifact missing or path untrusted`（`:102-104`）。
5. 字节 0 < size ≤ 2MB 且 sha256 等于 `artifactSha256`，否则拒绝（`:105-108`）。
6. JSON 解析后：`schemaVersion`/`publicationId` 相等且 `isDeepStrictEqual(artifact.canonicalPlan,plan)`，否则 `Published Plan exact physical artifact does not match bound Plan`（`:109-116`）；再 `assertC0CanonicalPlan`（`:117`）。

### 3.3 `assertPublishedPlanForCase(plan,aggregate)`（`:121-134`）

模板 ID/版本与案卷一致（`Published Plan is for a different Case template`，`:122-125`）→ `assertPublishedCanonicalPlan`（`:126`）→ bindings 展开的 `sourceVersionIds` 非空（`Published Plan binds no physical Case source`，`:127-130`）→ 逐个 `assertC2PhysicalOriginalBytes`（`:131-133`）。

### 3.4 `assertPublishedPlan(aggregate,run)`（`:137-160`）

Run 与当前 Case Plan 六项绑定（`Run and current Case published Plan are not exactly bound`，`:138-145`）→ `assertPublishedPlanForCase`（`:146`）→ bindings 的 `checkKeys`/`sourceVersionIds` 集合与 run 全等且 run 来源无重复（`Published Plan binding set does not match frozen Run manifest`，`:147-156`）→ 逐原件重哈希（`:157-159`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`review-v3-main-author-plan-ipc.ts:30` 导入；`:136`（`validateWriter` 构造）、`:469`（`handleCMainUpgradeCanonicalPlan` 构造）。即经已注册的 `UPGRADE_CANONICAL_PLAN_V3` handler 使用（但该 handler 生产缺写源安装点，见 nb-10 手册）。
- 测试：`review-v3-main-plan-provenance.test.ts:9`（本批，8 例直接 `new`）。

出向：`@profer/shared`（`assertC0CanonicalPlan`、`C0ContractError`、类型）；`review-v3-main-trust-port.ts:24,132,158`（`assertC2PhysicalOriginalBytes`）；`node:crypto/fs/path/util`。

## 5. 数据 I/O、读写与副作用

- 读：`artifactRoot` 下 `<fingerprint>.json` 每次验证重读（`:89-104`）；无写、无缓存（`:60`）。
- 副作用：无 IPC/网络；拒绝抛 `C0ContractError('RECOVERY_REQUIRED',…)`（`:56-58`）。
- 幂等：无状态，验证可重复；冷重启无残留（无内存证书）。

## 6. 分支、失败、取消与恢复

| 拒绝（`RECOVERY_REQUIRED`） | 触发 | 行 |
| --- | --- | --- |
| `ACTOR_UNTRUSTED`（构造） | 非绝对根/缺方法 | 68 |
| `Published Plan fingerprint is not sha256` | 指纹非法 | 77 |
| `…record is missing, untrusted or revoked` | 记录缺失/非 published/字段非法 | 84 |
| `…artifact is not a file`/`…escapes pinned root`/`…missing or path untrusted` | 物理路径 | 95,99,103 |
| `…artifact changed or exceeds protected size limit` | 字节不匹配/超 2MB | 107 |
| `…JSON invalid` | 解析失败 | 111 |
| `…exact physical artifact does not match bound Plan` | 深度不等 | 115 |
| `…for a different Case template` | 模板不一致 | 124 |
| `…binds no physical Case source` | 无来源 | 129 |
| `…not exactly bound`（Run） | 绑定不齐 | 144 |
| `…binding set does not match frozen Run manifest` | 集合不等 | 155 |

- 失败后状态：纯校验无写；由调用方事务拒绝。
- 取消/恢复：无取消；`assertAuthorizedPublication` 失败/记录 revoked 后需权威侧重新发布才可通过。

## 7. 权限与权威状态

- `artifactRoot` 是钉死的特权目录（`:38`）；`getCurrentPublication`/`assertAuthorizedPublication` 是独立权威（`:40-43`）。
- `candidate-held`/`revoked` 状态记录一律拒绝（`:79-84`）；测试用 B1 frozen descriptor 冒充发布物也被拒（`review-v3-main-plan-provenance.test.ts:135-145` 区段 `:125` 例）。
- `publishedSourceCommit` 明确只是 Git 溯源、非签名（`:30`）。

## 8. 修改影响面

- 改接口形状影响 `review-v3-main-author-plan-ipc.ts` 的 `CMainV3PlanUpgradeAuthorities.publishedPlanSource`（其 `validateWriter` 在 `:131-133` 强制存在）。
- 改验证步骤影响 8 个测试与 `bindCanonicalPlanV3`/`upgradeCanonicalPlanV3` 的注入回调语义。
- 改 `assertPublishedPlanForCase` 影响 C1 bind/upgrade CAS（`:120` 注释）。

## 9. 测试证据

直接测试：`review-v3-main-plan-provenance.test.ts`（201 行，8 例，详见其手册）：真实发布物 + 案卷原件经真实 CAS 绑定一次、candidate-held/revoked/缺失拒绝、B1 frozen 冒充拒绝、publisher 未独立认证拒绝、发布物篡改/缺失/符号链接拒绝、原件篡改拒绝、绑定后撤销/原件变更/错误 check 范围阻断 Run、构造缺权威拒绝。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：2MB 上限边界、`goodId` 边界、`assertAuthorizedPublication` 生产实现（生产注入点在 `review-v3-main-author-plan-ipc.ts`，但该写源生产未安装）无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 每次验证重读物理发布物、无缓存 | 已证实 | `:60,89-104` |
| 深度比较钉住 plan↔artifact | 已证实 | `:112-116` |
| candidate-held/revoked 永不作发布证据 | 已证实 | `:79-84`；测试 8 例 |
| Run manifest 集合全等校验 | 已证实 | `:147-156` |
| 无 IPC | 已证实 | 全文无 ipcMain |
| 生产唯一使用点=author-plan-ipc | 已证实（检索：冻结树 `apps`+`packages` 非测试 `*.ts`） | 见 §4 |
| `assertAuthorizedPublication` 生产实现 | 未知 | 注入端未读全实现 |
| 冷重启/并发行为 | 未知 | 无状态推断为安全，无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造校验 | §3.1 | 64-72 | covered |
| `assertPublishedCanonicalPlan` | §3.2 | 75-118 | covered |
| `assertPublishedPlanForCase` | §3.3 | 121-134 | covered |
| `assertPublishedPlan` | §3.4 | 137-160 | covered |
| 权威/发布状态语义 | §7 | 26-44,79-88 | covered |
| 生产调用链 | §4 | 检索记录 | covered（范围已声明） |
| publisher 生产实现 | §10 | — | unknown |
