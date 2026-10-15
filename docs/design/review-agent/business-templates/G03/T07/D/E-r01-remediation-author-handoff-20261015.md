# G03-T07 D 原作者｜E r01 DEP-001/DEP-003 证据补齐

> 记录日期：2026-10-15。此处仅公开来源/哈希/隔离待办，不修改原 E r01 判决，不是新的 Gold 版本，也不证明私有 ACL 已配置。
> 责任域仅 G03-T07（指定仪器培训、考核与独立操作资格申请）。

## 正式审计与归因边界

- 来源：`audit/g03-e-v1-r01` @ `1be43d8bacc015e1fd21949796defcdd3ecb96fc` 的 `E0-E1-blockers.md`、`E0-input-manifest.json` 和 `E0-coverage-and-isolation.md`。
- `E-G03-DEP-001` 为普通 Library 内隐藏 Gold 的访问控制/ACL **未核实**，并非已查实的 Gold 外泄。
- `E-G03-DEP-003` 为原作者提交链与配套来源补锁需求，并非 T07 原交付损坏。
- E审计 HEAD 是审计提交，**不是** A/B/C/D 原作者提交。T07 D 原作者 Git commit：`NOT_AVAILABLE`；本增量提交不能倒称原 D 提交。

## 原 D 资产复验（旧包字节不改）

| 原产物 | SHA-256 | 本轮结论 |
|---|---|---|
| `G03-T07_INPUT_ONLY.zip` | `3955cc620259399de3c2491857c06c83771dceb259702802c2de2830905a48f5` | 与 E0 一致；105 个公开输入成员逐件哈希一致 |
| `G03-T07_EVALUATION_ONLY.zip` | `e3481e2b44e5e0557c87725af6547d0703427e6816d50ca3adc805f9d7c3e8d7` | 与 E0 一致；仅供受控存储，**本仓库绝不上传** |
| `G03-T07_D_REPORTS.zip` | `cf4c106785961f4984a089801a8cf136ef378a5e071aa6fcf1ccc7a48973d0a6` | 与 E0 一致 |
| Gold 原核心 JSON（仅摘要） | `0508f3f04e519425e09ceafddb9d334171f49eccb176a2bf4a81f8e8d221dc99` | 原 `FROZEN_GOLD_v1`；原 manifest 记 `2026-10-13`，没有重冻或回填时间 |

原 26 案、52 个图像型 PDF/104 页不变。检查了输入 ZIP 路径、JSON/Markdown、PDF 文字层及元数据；未见逐案答案、隐藏 Gold 文件、可信 fixture 或 scoring 文件进入输入包。PDF 结构逐页检查均为图像型、无可提取文字层；**未**人工重验全部 104 页视觉内容。公开 `README.md` 中的通用“无审核答案”说明不是逐案预期。

## A/B 来源、独立性和 C 引用

- A 总调研 v0.1 原 ZIP SHA：`4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3`；A 内 T07 交接卡成员 SHA：`eea26beb72c3c17a2a59ea9a4bd03c4ad3e957d8cef5cbe4281940078a46eeee`。
- B T07 二轮补证 v0.2 ZIP SHA：`fe7c8e36ece4c419b9fda68394ff300749df2cd9a37c894d558ee8cd20db37de`；B 内 C/D 交接卡成员 SHA：`29ec9e6e23038de90f8ccb6baf8bb6faa5aa57a9ac88fee8f3da6540948570cc`。
- 以上 A/B 全包本轮重新取得且完整校验；原 D0 当时未完全恢复的个别附件直到 **2026-10-15** 才核实，不得倒填为 D0 当日已阅读。
- 原 D 作者自报只在搜索中见过 C **文件名**，没有读取 C 正文；本轮也未打开 C 规则或自检。独立性状态：`C_FILENAME_METADATA_EXPOSED; C_SUBSTANTIVE_CONTENT_NOT_READ`。
- C 原 MD SHA 仅引用 E0 已公开**元数据** `d166e3f118b63e54ead87e82a38e6684e42dd83cd3d57b3684ddc29cea4da862`；C 原作者 Git SHA 仍须 C 原作者核实。
- 成理 2023 年 13 号大仪共享管理办法全文及 2026 设备配置：`SOURCE_PENDING`。Gold 使用明确标识的**模拟高校规则**，不能作为本校强制拒件依据。

## DEP-001 私有 Gold 交接（尚未成功，不可宣称已修复）

- 私有存储对象URI：`NOT_CONFIGURED`；ACL/允许名单：`ACL_UNVERIFIED`；可读/拒绝双向访问测试：`NOT_TESTED`；授权访问日志：`NOT_AVAILABLE`。
- **待 G03 有权管理员执行**：建立只允许指定 E 审计者读取的受控位置，写入原字节包、固定对象版本/SHA，测试授权读取与非授权拒绝，并导出访问审计记录；处理普通 Library 源副本的留存/隔离。
- 存储迁移后 Gold 原 ZIP SHA **必须仍等于** `e3481e2b44e5e0557c87725af6547d0703427e6816d50ca3adc805f9d7c3e8d7`。没有这些证据时隔离状态仍 `BLOCKED_INPUT`。

## 增量影响与 E r02 接手

- 本次只新增非敏感来源证据与对接摘要，不改 A/B、C、原 D Gold、D 输入或 E r01 判决；旧文件 SHA 全部保留。
- E0：核旧包版本与真实 ACL、源包迁移后的 SHA；E1：独立核验 A/B 事实与独立性；E2：在受控私有 Gold 就绪且 C 来源固定后正式做 C/D 审查；E3：受控复核图像、fixture 和案例边界。
- 本次 **未执行 E r02**、未配置 ACL、未运行产品，结论仍按 E r01 open 保留；不把新补证提交当作 Gold 作者冻结 commit。
- 公共 Git/PR **严禁**上传 `G03-T07_EVALUATION_ONLY.zip` 或 `gold/`、`trusted_fixtures/`、`coverage/matrix.json`、`scoring/`、`frozen_manifest.json` 及逐案答案索引。
