# C0 源文件 SHA256 独立复算补充（冻结后新增，冻结文件不改动）

2026-10-17，Agent C 从原始固定提交 `8989941b6fb5651564e32d11c4215b6a6d5a5209` 读取 `docs/design/review-agent/business-templates/G01/originals/g01_student_identity_complete_template_v1.7.md` 全文，采用独立实现的 UTF-8 编码 + 标准 SHA-256 分块算法计算摘要。

计算器先使用标准 `abc` 向量，自检结果为 `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`（PASS）。

原文读出字符串长度 26223（JavaScript UTF-16 code units）。**实际 SHA-256 为 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`，与约定原始文档摘要完全一致。** Git Blob `aec737f471d4e648ab98a9243dcf4bc9939ce8a5`。

本条为 `pre-gold-freeze.json` 之后的追加验证，只补充 C0 来源真实性证据，不修改已冻结快照、输入包、Agent A 或 Gold。未读取任何 Gold。