---
path: apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2ff051fc5d18a2c0ef9465188a3611a71a0989ee
sha256: d6ff1ce6f62dff45f85801757bb203447be11a212100b4d987c01dbde5e5b1ef
lines: 213
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.ts

## 1. 结论与边界

Dev-B R20：**只读组合门面**——把「B1 作者修订+冻结产物」与「B2 原件/解析/输入回执」与「B19 Check×target 溯源」合成一份供 C-owned Main 读取器使用的当前快照（`readB20CurrentCandidateBundle`，`:122-213`）。

文件头强调（`:1-9`）：**依赖注入不是 Main 认证**——C 消费方必须自行提供真实 Principal/帧/Owner/epoch 与原生选择器溯源，并在**每个 await/IPC 跳**前后重新校验；本服务绝不把渲染层声明变成可信来源。

明确不做的事：

- **不做认证**：`B20CurrentMainReadAuthority` 由 C 安装，缺失即失败关闭（`:130-135`）。
- **不接受原始 IPC 选择**：注释明示 raw IPC body selections 绝不入内（`:154-155`）。
- **输出不含敏感身份**：结果不含 Principal/会话/帧/物理 key/未保存文档/发布方（`:210-211`）。

## 2. 导出与关键符号

`export` 共 **7 个**（6 interface + 1 函数）。

| 符号 | 行 | 形状要点 | 说明 |
| --- | --- | --- | --- |
| `B20MainReadScope` | `:31-35` | `B2MainContext + {principalId,sessionId,authorityEpoch}` | C 必须自派生 |
| `B20ReadAuthorExpectation` | `:36-42` | `{templateId,revision,revisionDigest,frozenFingerprint}` | 冻结期望（digest 是持久修订 JSON 摘要，非描述符 authorDigest，`:39`） |
| `B20CurrentMainReadAuthority` | `:43-58` | 3 方法：`currentScope`/`currentSelections`/`nativeArchiveKey` | 认证能力接口（空有效注册表=全 UNKNOWN，`:49`） |
| `B20ReadOnlySources` | `:59-64` | `{staging,parser,vault,ledger}` | B2 只读组件 |
| `B20CurrentCandidateRead` | `:65-84` | 含 5 个恒 false 标志 + `frozenDescriptor` + `candidateProvenance` | 输出 |
| `B20ReadOnlyDependencies` | `:85-88` | `{authority?,sources?}` | 注入容器 |
| `readB20CurrentCandidateBundle` | `:122-213` | `(expected, dependencies, previous?) => B20CurrentCandidateRead` | 唯一函数导出 |

内部：`refuse`/`sha`/`validText`（`:21-24`）、`verifiedScope`（`:89-99`）、`sameScope`（`:100-105`）、`validateExpectation`（`:106-112`）。

## 3. 内部逻辑与关键流程

**严格同步**（`:113-114` 注释：本函数内无 await；C 适配器须在调用前后自行复核身份）。

1. `validateExpectation`（`:127`）：templateId 非空、revision ≥1 安全整数、两个 64 位 hex（`:106-112`），否则 `B_R20_FROZEN_EXPECTATION_REQUIRED`。
2. 依赖完整性（`:128-135`）：authority 三方法 + sources 四组件全缺一不可，否则 `B_R20_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED`。
3. `verifiedScope(authority.currentScope())`（`:136`）：8 字段全有效否则同上错误；`structuredClone` 隔离（`:89-99`）。
4. `staging.assertStillGranted(scope)`（`:137`）。
5. **作者修订校验**（`:138-143`）：`readB1AuthorRevision` 缺失 → `B_R20_CURRENT_AUTHOR_MISSING`；templateId/revision/digest 任一不符 → `B_R20_AUTHOR_REVISION_CONFLICT`。
6. **冻结产物校验**（`:144-152`）：缺失 → `B_R20_FROZEN_CANDIDATE_MISSING`；revision/status/`publicationAllowed===false`/authorDigest 自洽/指纹匹配，任一不符 → `B_R20_FROZEN_AUTHOR_MISMATCH`。
7. `verifyReviewB1Descriptor(author.document, frozen.descriptor)`（`:153`）。
8. **来源注册表**（`:156-158`）：`currentSelections` 非数组 → `B_R20_SOURCE_REGISTRY_NOT_INSTALLED`；`structuredClone` 后收集 archiveId。
9. **原生 key 溯源**（`:159-170`）：逐 archiveId 调 `nativeArchiveKey`，非非空字符串 → `B_R20_NATIVE_PICKER_PROVENANCE_NOT_INSTALLED`。
10. `buildB19CandidateSourceBindings`（`:171-175`）。
11. **读后复核四连**（`:176-197`）：作者修订再读（`B_R20_AUTHOR_CHANGED_DURING_READ`，`:178-182`）→ 冻结再读（`B_R20_FROZEN_CHANGED_DURING_READ`，`:183-188`）→ `sameScope` 复核（`B_R20_MAIN_SCOPE_CHANGED_DURING_READ`，`:189-190`）→ `assertStillGranted` + 溯源归属比对（`B_R20_PROVENANCE_SCOPE_CHANGED`，`:191-197`）。
12. 组装结果并 `structuredClone` 返回（`:198-212`）。

## 4. 调用者与调用链

- **生产调用者唯一**：`review-v3-main-b20-physical-composition.ts`（import + 2 处调用）。
- **测试**：`review-v3-b1-b2-main-read-bundle-v3-b.test.ts`（28 处引用，12 用例）。
- **出向**：`review-template-author-store-v3-b1`（`readB1AuthorRevision`/`readB1FrozenCandidate`）、`review-template-plan-adapter-v3-b1`（`verifyReviewB1Descriptor`）、B2 四组件、`buildB19CandidateSourceBindings`（`review-v3-b1-b2-candidate-source-bridge.ts:267`）。

## 5. 数据 I/O、读写与副作用

- **只读**：B1 作者库（修订/冻结 JSON）、B2 vault/ledger/解析器。**无写入**、无网络、无定时器。
- 返回值 `structuredClone`；输入 scope/selections 亦 clone 隔离（`:98`、`:158`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 错误 |
| --- | --- | --- |
| 期望字段非法 | `:106-112` | `B_R20_FROZEN_EXPECTATION_REQUIRED` |
| 注入缺失/字段非法 | `:130-135`、`:89-97` | `B_R20_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED` |
| 作者缺失/不符 | `:139-143` | `B_R20_CURRENT_AUTHOR_MISSING` / `B_R20_AUTHOR_REVISION_CONFLICT` |
| 冻结缺失/不符 | `:145-152` | `B_R20_FROZEN_CANDIDATE_MISSING` / `B_R20_FROZEN_AUTHOR_MISMATCH` |
| 注册表非数组 | `:157` | `B_R20_SOURCE_REGISTRY_NOT_INSTALLED` |
| key 缺失 | `:166-168` | `B_R20_NATIVE_PICKER_PROVENANCE_NOT_INSTALLED` |
| 读中作者/冻结变化 | `:178-188` | `B_R20_AUTHOR_CHANGED_DURING_READ` / `B_R20_FROZEN_CHANGED_DURING_READ` |
| 读中 scope 变化 | `:189-197` | `B_R20_MAIN_SCOPE_CHANGED_DURING_READ` / `B_R20_PROVENANCE_SCOPE_CHANGED` |
| B19 层错误 | `:171` | `B_R19_*` 原样上抛（测试 R20-06 断言） |

全部失败关闭、无部分输出；无取消机制（同步）。

## 7. 权限与权威状态

- 注释反复强调 DI≠认证（`:5-8`、`:26-30`、`:44-49`、`:53-56`）；输出恒带 `authorityInstalledByB:false`（`:71`）。
- 权威=持久 B1 修订链+冻结描述符+B2 溯源交集；空注册表=全 UNKNOWN 不是批准（`:49`）。
- 5 个 false 标志（candidateOnly/publicationAllowed/businessWriteAllowed/schoolPolicyVerified/authorityInstalledByB）。

## 8. 修改影响面

- `review-v3-main-b20-physical-composition.ts` 是唯一生产消费方；错误码在 R20 测试中逐条断言。
- `sameScope` 8 字段比对决定「读中 scope 变化」判定；增删字段需同步 `verifiedScope`。
- 输出形状（`B20CurrentCandidateRead`）被 renderer 侧 `review-v3-product-workflow.ts` 等以类型引用（`B20CurrentCandidateRead`，`:65-84`）。
- 无存储格式迁移。

## 9. 测试证据

- `review-v3-b1-b2-main-read-bundle-v3-b.test.ts`（374 行，1 describe / 12 test）：真实持久链联合且不发布（R20-01）、未保存文本不入冻结 Plan（02）、父修订损坏不可绕过（03）、伪造冻结/删文件/错 digest 失败关闭（04）、Main 权威必需无默认放行（05）、key 伪造/跨条目/错角色主体（06）、过期解析/假块/空选择/撤销（07）、epoch/帧/Owner 重绑拒绝（08）、篡改 ZIP/账本（09）、同名同字节不同物理句柄不继承（10）、前审计仅影响相关源（11）、伪造期望/发布方声明不绕过（12）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出 | 已证实 | `:31-88`、`:122` |
| 函数严格同步无 await | 已证实 | `:122-213` 全文 |
| 读后复核四连 | 已证实 | `:176-197` |
| 输出不含 Principal/物理 key | 已证实 | `:210-211`；测试 R20-01 `:162-164` |
| 唯一生产调用者 | 已证实 | 全树检索 |
| C 侧适配器是否真的双侧复核 | 未知 | `review-v3-main-b20-physical-composition.ts` 未逐行读 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 个导出 | 2 | — | covered |
| `readB20CurrentCandidateBundle` 12 步 | 3 | `:122-213` | covered |
| 内部校验函数 | 2、3 | `:89-112` | covered |
| 全部错误分支 | 6 | — | covered |
| 权限边界 | 7 | — | covered |
| 调用链 | 4 | — | covered |
| 测试证据 | 9 | — | covered |
