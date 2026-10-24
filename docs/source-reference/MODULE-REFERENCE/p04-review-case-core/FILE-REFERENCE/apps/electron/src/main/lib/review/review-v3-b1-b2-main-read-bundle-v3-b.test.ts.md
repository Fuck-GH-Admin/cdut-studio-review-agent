---
path: apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 65fc1149b6bd73b2e51f0e0e960541204055128d
sha256: 07c01cf4877cff410bb5cbe61b1fbc58ae271decca3f23478e15bd0af47394b8
lines: 374
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.test.ts

## 1. 测试目标

验证 B R20 只读组合门面 `readB20CurrentCandidateBundle`（`review-v3-b1-b2-main-read-bundle-v3-b.ts:122-213`）：真实持久 B1 作者链 + 物理 B2 ZIP/解析/回执 + B19 溯源的联合读取，且不发布、不泄露身份、失败关闭（`apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.test.ts:146`）。

## 2. 用例清单

1 describe / 12 test。夹具（`:21-145`）：`fixture()` 建真实 B2 四组件 + 真实 ZIP（2 文件）`saveAndStage`→逐条 `ledger.decide(accepted)`→`parser.parse`→`saveB1AuthorRevision(author,0,principalId)`→`freezeB1Candidate(templateId,1)`；`authority` 三方法接线（`nativeArchiveKey` 只对真 archiveId 返回 picker）；`read(f)` 封装调用。`ctx={senderId:17,frameId:4,ownerId:'real-owner',ownerGeneration:8,caseCandidateId:'candidate-b20',principalId,sessionId,authorityEpoch:42}`（`:30-34`）。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| R20-01 | 保存修订+全历史+冻结+真实 ZIP/解析/回执联合不发布 | `read(f)` | `authorRevision===1`、digest/fingerprint/描述符对齐；3 bindings 全 linked；5 false 标志；**输出无 `principalId`/`physicalArchiveKey`/`schoolIssuer`**；重读相等；作者库未被改写 | `:147-167` |
| R20-02 | 未保存文本绝不入冻结 Plan；新修订使旧期望失效 | 改 dirty 文档；`saveB1AuthorRevision(dirty,1)`；`freezeB1Candidate(…,2)` | 旧断言 `requirement==='A source'`；旧期望 `B_R20_AUTHOR_REVISION_CONFLICT`；旧修订保留原值；新修订+旧冻结→`B_R20_FROZEN_AUTHOR_MISMATCH` | `:168-183` |
| R20-03 | 父修订损坏/缺失不可用合法最新快照绕过 | 保存修订 2；改坏 `1.json`；再删 `1.json` | `B1_HISTORY_BROKEN`；`B1_HISTORY_BROKEN_MISSING_PARENT` | `:184-202` |
| R20-04 | 伪造冻结 JSON/删文件/错模板/错 digest 失败关闭 | 篡改冻结文件；错 revisionDigest；错 templateId；删冻结 | `B1_FROZEN_DIGEST_MISMATCH`；`B_R20_AUTHOR_REVISION_CONFLICT`；`B_R20_CURRENT_AUTHOR_MISSING`；`B_R20_FROZEN_CANDIDATE_MISSING` | `:203-219` |
| R20-05 | Main 权威/Owner/帧/注册表必需，无默认放行 | 缺 authority/sources/双缺；`currentScope:null`；`frameId:-1`；`currentSelections:null`；`nativeArchiveKey:null` | 前四 `B_R20_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED`；后二 `B_R20_SOURCE_REGISTRY_NOT_INSTALLED`/`B_R20_NATIVE_PICKER_PROVENANCE_NOT_INSTALLED` | `:220-240` |
| R20-06 | key 伪造/跨条目/错角色主体不可链接 | `'fake-picker'`；`entryIndex:1`；`requiredRole:'application'`；改 subjectId 保存 | `B_R19_NATIVE_ARCHIVE_KEY_MISMATCH`；`B_R19_ZIP_STAGED_ENTRY_IDENTITY_MISMATCH`；`needs-human-confirmation`；`B_R20_AUTHOR_REVISION_CONFLICT` | `:241-260` |
| R20-07 | 过期解析/缺块/空选择/撤销 Owner 安全失败 | `parseRevision:'previous-revision'`；`blockId:'forged-block'`；空选择；`revoke` | 两 `stale`；空注册表全 `unknown`；`B2_OWNER_INVALID_OR_REVOKED` | `:261-280` |
| R20-08 | 读中 scope epoch/帧/Owner 重绑被拒 | `currentScope` 第二次返回改 epoch / 改 frameId / 全程 foreign case | `B_R20_MAIN_SCOPE_CHANGED_DURING_READ` ×2；第三次抛 | `:281-302` |
| R20-09 | 篡改真实 ZIP 字节/账本回执绝不铸 linked | 改 `ledger.json`；换 `archive.zip` 字节；还原 | `B2_LEDGER_CORRUPT`；`/B2_ARCHIVE_/`；还原后全 linked | `:303-318` |
| R20-10 | 同名同字节不同物理句柄不继承冻结身份 | 新 `saveAndStage` 不同 picker；选择指新候选 | rawSha 相同、versionId 不同；binding `stale` | `:319-337` |
| R20-11 | 前审计仅影响相关源；无关 Check 保持 linked | 2 选择改旧 parseRevision + previous | 2 条失效；check-b 仍 linked；旧快照全 linked；篡改 prior→`B_R19_PRIOR_SNAPSHOT_UNTRUSTED` | `:338-355` |
| R20-12 | 非法外部期望/发布方声明不能绕过持久源 | `frozenFingerprint:'falsified'`；scope 塞 `schoolPublisher`/`sourceIdentity` | `B_R20_FROZEN_EXPECTATION_REQUIRED`；结果 `schoolPolicyVerified:false`、无 `schoolPublisher`/`sourceIdentity` 字段；rawSha 对齐 | `:356-373` |

**依赖顺序**：`fixture()` 每用例独立（`n` 递增）；R20-09 内部按篡改→断言→还原→断言。

## 3. 真实断言

- R20-01：`expect('principalId' in result).toBe(false)`（`:162`）、`expect('physicalArchiveKey' in result).toBe(false)`（`:163`）。
- R20-02：`expect(()=>read(f)).toThrow('B_R20_AUTHOR_REVISION_CONFLICT')`（`:175`）；`expect(next.parentDigest).toBe(f.saved.digest)`（`:174`）。
- R20-07：`expect(empty.candidateProvenance.bindings.every(b=>b.state==='unknown')).toBe(true)`（`:277`）。
- R20-08：`expect(() => …).toThrow('B_R20_MAIN_SCOPE_CHANGED_DURING_READ')`（`:290-298`）。
- R20-12：`expect('schoolPublisher' in result).toBe(false)`（`:370`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`previous` 为 undefined 的失效比对（用例 3/11 之外）、多 archive 并存、`revisionDigest` 全零等边界、`readB20CurrentCandidateBundle` 在 `review-v3-main-b20-physical-composition.ts` 的接线行为。
- 脆弱点：`fixture()` 依赖 `PROFER_CONFIG_DIR` 重定向与 `afterAll` 恢复（`:21-28`）；手写 ZIP 构造器（`:43-66`）耦合 vault 解析。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例对应 R20 全部错误码与输出边界 | 已证实 | 只读核对本文件与 bundle 源 |
| 输出字段不泄露身份 | 已证实（断言） | `:162-164`、`:370-371` |
| 测试实际通过 | 未知 | NOT_RUN |
| C 侧适配器双侧复核 | 未知 | 本测试不覆盖 `b20-physical-composition` |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 联合读取+不发布+不泄露 | R20-01 | `:147-167` | covered |
| 未保存文本/修订冲突 | R20-02 | `:168-183` | covered |
| 历史链完整性 | R20-03 | `:184-202` | covered |
| 冻结失败关闭 | R20-04 | `:203-219` | covered |
| 注入必需 | R20-05 | `:220-240` | covered |
| B19 阻断贯通 | R20-06 | `:241-260` | covered |
| 解析/注册表失败态 | R20-07 | `:261-280` | covered |
| 读中 scope 变化 | R20-08 | `:281-302` | covered |
| 字节篡改 | R20-09 | `:303-318` | covered |
| 物理身份不继承 | R20-10 | `:319-337` | covered |
| 前审计粒度 | R20-11 | `:338-355` | covered |
| 期望/声明不绕过 | R20-12 | `:356-373` | covered |
