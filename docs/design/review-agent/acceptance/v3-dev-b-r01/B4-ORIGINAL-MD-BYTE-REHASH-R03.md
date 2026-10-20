# Dev-B B4-R03｜历史 Markdown Git 原文字节再校验（12/38）

**来源基准**：D4 PR #97 @ `b68443b23293b4714e61a3b81383d3d3a56434fc`；上一轮 R02 记录 `9/1/40` 原文可得性。本报告是增量新证据，**不篡改 R02 历史快照**。所有来源仍是 `candidate-held / publicationAllowed=false`。

## 本批真实操作和收口结果

通过 GitHub Git Blob **对象 SHA**直接读取 12 份历史原始 Markdown 内容（而非仅比较 manifest SHA256 文本字段）；针对返回的 UTF-8 原文字节重新计算 SHA-256，与 D4 候选目录 `sourceSha256` 固定声明逐项比对。SHA-256 算法使用标准 `abc` 测试向量校验（结果 `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`）。

- **12/12 已取回 Git 对象的原文 SHA256 与来源目录完全匹配**：G01 5 套 + G07 7 套。
- 其中 G01 `g01-political-procedure` 与 `g01-special-proof-seal` 在 R02 曾记为 `SHA256_METADATA_MATCH_ORIGINAL_ABSENT`，本批直接用历史 manifest 的 Git Blob SHA 成功取回并重新哈希。
- G01 `g01-student-identity-correction` 在 R02 为“取得 Git Blob 但无 manifest 预期 Blob”，本批独立 SHA256 一致，**仍保持未预钉 manifest Git Blob 的 provenance 限制**。
- 其余 **38 套**本批仍无可重新计算的原文对象字节，继续标 `UNAVAILABLE_ORIGINAL_BYTES / BLOCKED_INPUT`，不等于不存在，也不能当已验原文。
- 逐模板取回 Blob ID、R02 老分类、SHA256 声明、重新计算结果、candidate-only 状态见 `B4-50-ORIGINAL-MD-BYTE-AUDIT-R03.csv`；由 `review-v3-b4-original-byte-verifier.ts` 提供本地/CI 可复用的 raw bytes → Git SHA1 对象校验 → SHA256 双校验，拒绝 metadata-only 冒充原文。
- R03 verification 是**历史内容字节身份**，不证明 12 套规则对校方当前有效，不证明旧内容对每一条 D4 Check 业务无损，也不证明取得学校签名或独立 Gold。

## G01 34 条 Scope 仍未关闭

本轮原文重核成功不能自动为 `g01-student-identity-correction` 的 34 条 Check 推导 `genericScope/object/caseScopeJustification`。源文本中的“申请人”“材料”描述不构成每条 `Check×target×object×subject` 的已签署作用域。继续保留 `B4-G01-34-SCOPE-GAPS-R02.csv` 全部 34 条 `MISSING_EXPLICIT_OBJECT_SCOPE`；按原任务、原始 MD 段、适用对象、条件和人工授权逐一独立核实后才能缩减缺口。本批未捏造 Scope。

## 验证和门禁

新增 `review-v3-b4-original-byte-verifier.ts` 和 Bun 单测：正例同时要求 Git object hash 与 SHA256；负例覆盖错字节、复制假哈希、假预期 Git Blob、非法字段和空字节；R03 CSV 50 套严格分为 12/38，全部拒发布。**该代码尚须在最新 #142 exact SHA Gate O CI 运行后才可标 GREEN。**

Gate E = NOT_RUN（目标机真实文件路径/Office71/多 PID）；Gate L = BLOCKED_NO_AUTH（校方签署、当前政策、独立 Gold）；Gate P = PARTIAL（34 Scope、38 原文字节、第 51 套非开发用户 UAT、50 套逐义务业务无损性）。

给 I 的切片：`B4-ORIGINAL-BYTES-R03` 只包含纯验证器、测试与候选原始来源只读审计；须锁定新 B SHA、新 Gate O，并独立请求集成，不取代 I1 旧 B 绿灯来源，也不授予任何正式发布权限。
