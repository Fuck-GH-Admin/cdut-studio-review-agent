# G03-T08 D v2.1｜E r01 作者溯源与隔离补证（非敏感）

> 2026-10-15 补证；本文件是后续新增的来源说明，不是 2026-10-13 原 D 提交记录，更不是 E r02 通过证明。
>
> 原审计冻结 HEAD：`1be43d8bacc015e1fd21949796defcdd3ecb96fc`（E 审计提交，**绝非原 D 作者 SHA**）。
> 审计项：`E-G03-DEP-001`、`E-G03-DEP-003`；本轮只核对 G03-T08。

## 原始资产保留与字节指纹

| 原作者交付（仍保持原文件） | SHA-256 |
|---|---|
| `G03-T08_INPUT_ONLY.zip` | `13f01c053e368839ee900661e04b4fa4488155f91f50ae018d04f3b9e8ccc513` |
| `G03-T08_EVALUATION_ONLY.zip`（仅受控 E 使用） | `591a56b4af4282002a24b62b008bcf7265338f1020189d11ac651f84ec45d84f` |
| `G03-T08_D_REPORTS.zip` | `18ea496163cb9f6b3493de24eeaeb1a1be122793130b99915b655754b703112f` |
| `G03-T08_交付哈希校验.txt` | `810c890ed5ca82c8ad86319b1b0059093f1dbd425ae8e6a9b197e0cd118d685e` |

`FROZEN_GOLD_v1` 原冻结清单**记载**聚合摘要 `9bbca1904975531833f40b0e15628446aea7948cf193a31d6f1b12e4c2c58bd4`，自述冻结日期为 2026-10-13；它**不是独立可信时间戳**，本轮未重算其聚合算法，但逐件核对了31个隐藏Gold文件和31个mock文件的 SHA。

## A/B/C/D 上游与作者身份

- A v0.1 包 `G03_A_领域总调研_研究交接包_v0.1_20261011.zip`：SHA-256 `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3`，含 T08 交接卡。
- B v0.2 包 `G03-T08_B_第二轮校本补证交接包_v0.2_20261011.zip`：SHA-256 `4820da7558e2439a997f1d535f74a0c1fad6f9bb6f3ec5fe20fec1317a24f948`。
- D v2.1 规范 SHA-256 `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1`。
- C：**仅引用 E r01 E0 元数据，不读取 C 规则**。`G03-T08_正式业务模板_MD_v0.1.md` 在 E0 登记 SHA-256 `c807cc90a3e6fd2d083abba5bcc828348555d18b65d396e7fa909b30c4692662`；C v2.1迁移链未在此核定。
- 原 D 作者 Git commit：**NOT_AVAILABLE**。本新增补证 commit 仅能证明补证发生，不能冒充旧作者提交。
- D 作者独立性声明：旧 D 仅从 A/B 与原始官方来源创建 Gold，当前复核没有阅读 C 内容；原有声明不能替代 E 侧独立性调查。

## 隔离检查的实际结果与边界

- 对原三 ZIP 执行 CRC 检查，均通过；公开 INPUT 的249项全部与冻结清单逐文件 SHA 一致。
- 31个案卷、31份扫描 PDF 共62页，每页有光栅图像、可提取文字层页数为0。原 D 抽样视觉核查 12 页，不能冒称62页全部视觉语义检查完成。
- 公开 INPUT ZIP 成员路径和可读文本扫描未检出 `gold/`、`trusted_fixtures/`、`scoring/`、`expected_booking_status`、`expected_actual_operation_status` 等显式答案路径/评估字段。**这不是语义零泄漏的绝对证明**。
- 公开输入、隐藏 Gold、可信mock分属不同 ZIP；公开 Git 不含隐藏 Gold、可信底账、逐案预期或评分脚本。
- 当前 Gold 仍在普通 Library：`private ACL=NOT_VERIFIED`，`E-only allowed users=NOT_AVAILABLE`，`access logs=NOT_AVAILABLE`，`private destination=NOT_CONFIGURED`；绝不声称已隔离或泄漏已发生。

## 后续需由有权管理员/E执行

1. 配置真实私有Gold存储，给 E 特定成员设最小权限，记录正式ACL、成功/失败访问测试及审计日志；落点逐字节校验上述Gold ZIP SHA。
2. E r02 重跑 E0 隔离和作者版本固定；E1 独立来源/偏差核验；E2 在获权后做 C 与冻结 Gold 比对；E3 跨模板关联和隔离检查。
3. 成理校发〔2023〕13号全文和真实设备配置仍是 `SOURCE_PENDING`，不得改写成成理现行强制规则。
4. 原 E r01 阻断表及裁定不修改；本轮 `E r02: NOT_RUN`。

原资产变更：**NONE**。本文件：**新增非敏感证据，不含答案**。