# L02-U0 / Office 同名索引冲突：离线最小复现

**结果：5 项 source-derived harness 断言 PASS；其中 3 项明确复现索引冲突或来源错误。** 此处 PASS 指“观测到了预期的缺陷特征”，不是“产品测试通过”。

**源码**：我方 `main@8989941b6fb5651564e32d11c4215b6a6d5a5209` 的 `apps/electron/src/main/lib/document-parse-tools.ts`，主要涉及 `allocateSessionFileId`（309–342）和 `materializeToWorkspace`（355–490）。该文件的 Git Blob 与上游 `c179f2575d5bb5abdc883268fb885d1a6449325e` 完全一致。

- `results.json`: 5 组控制/反例、真实 Node 版本、退出码及 SHA-256。
- `repro-minimal.cjs`: 可独立使用 Node 22 执行的最小脚本。**这是从生产代码转写的函数及精简缓存/写入路径，不是导入完整上游源码**；可在本机运行 `node repro-minimal.cjs`。
- `repro-minimal.stdout`: 该脚本本次实测 stdout，exit 0。
- 完整 5 例测试的本地原脚本和 JSON 哈希见 `results.json`；本目录保留简化的可运行证明，不冒充完整生产代码导入测试。

测试构造：两份不同目录的同名 DOCX 内容不同、内容相同、同名不同格式 DOCX/XLSX，对照组不同文件名、同一文件更新。5 例使用内容 SHA-256 作为 revision；同内容样本严格相同，因此相同 revision 是合法条件。

**结论**：这是上游通用 Office 索引路径的可复现缺陷特征；我们的审核模块 SourceRef 是否受其影响、完整 Office v2 及 Electron 的真实入口均 **NOT-RUN**。现行 U0 仍是 PARTIAL/BLOCKED_ENV，不准入 U1。未更改源码、Gold、main、上游，未推进 P07/P08。
