# 第一轮分支与 PR 工程考古（只读调查）
调查日期：2026-10-19。原始快照 main: [`8989941b6fb5651564e32d11c4215b6a6d5a5209`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/8989941b6fb5651564e32d11c4215b6a6d5a5209)。
- 原始远端分支 190 条，PR 128 条（open 115、closed 13、merged 11、closed-unmerged 2）。
- 本审计分支 `audit/branch-archaeology-20261019-r01` **在清点之后创建，故不计入原始分支 190 条**。PR 亦以建审计 PR 之前为界；不要将后生成的本 PR 计作缺行。
- 01、02 为 100% 原始列表页登记；07 是抽样 **已验证** compare；08 是机器索引。
- **重要限制**：执行环境无法直接对仓库执行本地 `git fetch/merge-base/cherry`。利用 GitHub 逐页 REST branches/pulls、compare、树对象、PR 全文件名单、HEAD 与 CI 作远程交叉核验。**未核验的逐支父提交、merge-base、patch-id 全部 UNKNOWN**。不把 filename 启发分类等同于验收或删除授权。
- 禁止据此自动 merge、删除、变基或发布。第二轮独立读取源码和 CI。
