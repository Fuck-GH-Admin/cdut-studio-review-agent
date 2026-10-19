# Dev-B R24｜B4 原文冲突、实例语义、UNKNOWN 工程验收

**DEV-B-owned candidate engineering only，2026-10-20。** 本报告不是 Dev-C 裁决、校方审批或独立 Gold。工程 #142 Draft/open/unmerged，Release NO_GO；唯一 ABCI 协议仍在 #145。

## 固定历史基准和代码

R23 上一单线全绿 SHA：d96c3d176159cd12f4befd2a91bfeade44dca216；其原 PR CI/D2/Baseline 3/3 成功、4245 PASS/5 SKIP/0 FAIL。D4 原冻结 SHA：b68443b23293b4714e61a3b81383d3d3a56434fc，8 域 50 个 candidate-held 模板、3875 workspace Check，原件和 Gold 不改。

原 B4 字节校验器 Git blob 02565186990a7e67e5e1e37fb83931384be9fffd、R13 rule diff d725f339ac37b5974dbef039252418e81ec9a381、R14 高风险语义 verifier 86ffd95ee4537f6dd0b09bb5f677348c69ba0f28、R15 对象隔离 009c12382ddbc955965be0ce9b796739cc6905f8：本轮基于现有模块新增代码，未替换它们。

新增生产代码 review-v3-b4-conflict-and-instance-guard.ts 与同名 .test.ts。加上 B4-R24-THREE-CONFLICTED-ORIGINAL-RAW-REHASH.json 与本文共 4 个 B-owned 路径。没有改 Main/IPC/Preload/shared/Case/Run/Decision/SchoolPort 或 D4 frozen 输入。

## 三份实际原文独立重新 SHA256 与 Git blob 身份

本轮从用户授权 ChatGPT Library 取得三份完整 raw_file（不是提取后的文本、旧 SHA 或冻结 manifest 声明），在隔离容器里对全部原始字节分别计算 sha256(bytes) 与 sha1('blob '+byteCount+NUL+bytes)，没有执行换行、Unicode 或文件名规范化。没有上传任何原始 Markdown 业务文本到 GitHub。

| 模板 | Library 原件 | 字节数 | 本轮 RAW SHA256 | 本轮 Git blob SHA1 | D4 冻结 sourceSha256 |
|---|---|---:|---|---|---|
| g02-t03-review | G02-T03_正式业务模板_MD_v0.1.md | 104521 | b4b3a859d4d85d322347189d253e0e1a7fe4f6003a2a01a4a0c36ea877fe6040 | 54d1bca5f2f1923ad25dc87bcea0a40b7b549cd7 | e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380 |
| d4-g04-t06 | G04-T06_正式业务模板_MD_v0.1.md | 183268 | 1dba3e36f83efe3553ff1103aa199e4d7dc17acf2b196707a43289a981e2a9da | 3773cb3af097e62cb60add6299d2c35d6d34fad6 | d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2 |
| g08-t03 | G08-T03_正式业务模板_MD_v0.1.md | 92390 | 53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af | 1fc46546a6bc81f06cf5f9d7a10c4968f6d5d2cf | f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec |

三份实际观测原文 HASH 都与 R11 Library 历史记录一致，却与 D4 冻结 SHA256 全部不匹配。这证明 **确实取得不同的原文版本**，不证明已找回 D4 所用的三份冻结原文字节。全部 DIFFERENT_VERSION_QUARANTINED，保持分开，不可无提示替换旧 sourceVersion/原件，不发布到校方正式目录。47/50 其余历史匹配结论不受影响。

代码 inspectB4OriginalVersion 接受真正 Uint8Array，动态计算 SHA256 + Git SHA1；只返回 RAW_NOT_AVAILABLE / FROZEN_BYTES_MATCH_CANDIDATE_ONLY / DIFFERENT_VERSION_QUARANTINED，并附不可变 observed sha，canReplaceFrozenOriginal=false、publicationAllowed=false。没有实际字节时，即使有历史 SHA 宣称，仍不可谎称执行过当次 RAW verification。

## 32 条高风险源文语义 × 实例隔离

真实冻结证据：B4-R13-107-RAW-RULE-CHECK-ANCHOR-LEDGER.json 原文规则锚点 27+46+34，R14 high-risk JSON 7+14+11=32；原文标题、条款、Check ID 和来源引用不是语义等价/独立 Gold 证明。R24 的 inspectB4HighRiskInstanceEvidence 先调用现有 R14 验证器对 32 条冻结 Check/source 进行校验，再严格按以下完整实例 tuple 计算技术候选条件：

- G03 体育场馆/活动：scope_item_id × physical_venue_zone × time_interval × authorized_issuer。
- G04 实验室访问：person_uid × target_lab_uid × scope_kind × action × policy_snapshot_id。
- G06 宣传发布：release_action_id × channel_id × claim_id × asset_id × publication_version。

每域实际固定原文条款正例/反例合成矩阵覆盖同实例 true、证据齐全的 false、跨对象引用、UNKNOWN；其余缺任一 tuple dimension、丢失当前 provenance、旧 source SHA、证据实例不匹配，不能按 false/not-applicable 处理，保持技术 unknown。true/false 仅是候选技术断言；每条均 historicalInstanceSemanticsPreserved=false、schoolAuthorityVerified=false、semanticValidated=false、publicationAllowed=false。原 R14 的真实校方/目标机 Gold NOT_EXECUTED 不会被新合成测试改写。

## 50 个候选全部 UNKNOWN 和 G01 scope 不确定性

auditB4FrozenUnknownCoverage 从 8 个实际技术 archive 调用旧 validateB4TechnicalArchive + sumB4Technical，要求 source SHA exact，8 域、50 template、3875 Check、34 G01 scope 缺口、4163 条 unknown SourceRef。每个来源 gap 保留 domain/template/check/sourceId/documentVersionId/locator，每个 scope gap 保留 domain/template/checkId。未知来源擅自改 not-applicable/false 或 34 项中任一项私自填入假 CASE scope 都造成数量漂移并 fail closed。技术 source content-checked 不构成学校政策当前有效或校方签发 ACL。

## 失败保留、真实 Gate 和回滚

首个 R24 测试提交 dd4bbc147adee42e6d1ec6691b1ca675f6d67b9b：PR CI 39343168811 FAILED、D2 39343168886 FAILED，Baseline 39343168806 SUCCESS。原始失败是新模块 Rule find 后 TS18048 可能 undefined，并非测试断言差异。单独修复 SHA 5e005e0318b7f4efe1e6c524ce47d38e0d198406：显式 throw fail-closed 收窄，未 relax 校验。后续新增 RAW rehash 与固定 UNKNOWN 正反例后必须在新最终 SHA 重跑三套工作流；当前报告本身**不宣称最后新 SHA 绿灯**，以 #142 同 SHA 正式工程评论和原 CI 日志为最终依据。

本轮只新增四个 B-owned 路径，回滚到 R23 保留全部 R19–R23 的物理原件账本、作者版本恢复和保守路由功能。I 若需导入 R24 新来源，仍要 C 另签固定 SHA/blobs 和前置合同；不能因为此 R24 单线源码通过就自动 Main 接线。

Gate E：NOT_RUN；Gate L：BLOCKED_NO_AUTH；Gate P：NOT_RUN；Release：NO_GO。三份 D4 原冻结真原文字节、现行学校有效规则/权限主体、完整业务条件验证与独立 Gold 尚待授权取得；不能编造。
