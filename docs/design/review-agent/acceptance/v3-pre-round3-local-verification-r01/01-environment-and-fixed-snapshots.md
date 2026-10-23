# 01｜环境与固定快照

环境采样时间：2026-10-19T15:21:57+08:00（Asia/Shanghai）。验证遵循任务包固定 SHA；未切换到之后的远端 HEAD。全部新测试只加在隔离 worktree 中，未修改产品源码。

## 环境

| 项目 | 记录 |
|---|---|
| OS / 内核 / 架构 | Linux，`7.0.0-38-generic`，x86_64 |
| CPU | 12 logical CPUs |
| Git | 2.53.0 |
| Bun | 1.4.0 |
| Node | v22.23.2 |
| Electron | `electron` 命令不可用；未启动 Electron GUI |
| 可用磁盘 | 约 97 GB（记录时） |
| 网络/代理 | 存在代理环境变量；未记录或输出其值、凭据 |
| 私有证据目录 | `/home/miku/Bot/CDUTStudio/.workdir/v3-evidence-profiles/` |
| 审计报告 worktree | `/home/miku/Bot/CDUTStudio/.workdir/v3-audit-report`，报告分支 `audit/v3-pre-round3-local-verification-r01`，基于 M |

原开发工作树 `/home/miku/Bot/CDUTStudio/CDUT-Studio` 当时已有未提交更改：`CenterPanel.tsx` 修改及 `.workdir/` 未跟踪目录。本次没有在其中 checkout、安装依赖或写文件。隔离验证 worktree 为：

| 快照 | SHA | Worktree |
|---|---|---|
| M | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | `/home/miku/Bot/CDUTStudio/.workdir/v3-verify-main` |
| D4 W1 | `c2f965d29022a42b3c32d6a4cb73aa8fd542329b` | `/home/miku/Bot/CDUTStudio/.workdir/v3-verify-d4` |
| P06 R03 | `db0284879f75ce123b5d83cb6577a3cc7ad057da` | `/home/miku/Bot/CDUTStudio/.workdir/v3-verify-p06` |
| P06 R02 | `c23789882aabf18689c314c77c270ac4a8ae4729` | `/home/miku/Bot/CDUTStudio/.workdir/v3-verify-r02` |
| G01–G08 集成 I | `b68443b23293b4714e61a3b81383d3d3a56434fc` | 仅用于固定树/资产比较；未另建运行 worktree |

每个可运行快照各自执行 `bun install --frozen-lockfile`：M 1207 packages、D4 1263、P06 R03 1207、R02 1207。没有改 lockfile。

## 固定审计材料

本次阅读了任务包指定的 PR #133–#138 审计材料；#138 九类文件及 #135/#136/#137 的专项门禁用于定义本轮范围。固定审计文档 SHA：

- #133 `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071`
- #134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`
- #135 `9147b0c6240fc866ea98b489c37c8738714d5e9f`
- #136 `87e1d2636403f8f0ccceb4fd786ee4b7097bbfb6`
- #137 `082fafb3f1df7d19af25bf52cc93135190ff102c`
- #138 `e2ee1d738c43ee193bb8812389a148fd2d3ad479`

固定生产代码快照仍为上表 M/D/P/R02/I；报告没有用 #138 文档 HEAD 替换生产代码基线。

## 边界

使用合成案卷、合成 Run/Batch、合成 DOCX/XLSX。没有真实学生材料、真实 Provider 请求、学校接口写入、真实账户或正式证书。没有启动 Electron；Main IPC 负例通过注册真实 `registerReviewIpc()` 的受控 harness 调用，不等同于已完成 live Renderer→Preload→Main GUI 验收。

本次选择了固定测试文件与新增高风险反例；没有执行全仓 `typecheck`、`check:boundaries`、完整 GUI/Provider 验收或 L1-07 owner 撤权场景。原始测试日志留在私有证据目录；本报告提交经过筛选的合成证据摘要、日志 SHA256 与测试代码索引。


审计 clone remotes：mine 指向 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git；origin 与 upstream 指向 https://github.com/Nya-Angle/CDUT-Studio.git。除上表四个验证 worktree 和报告 worktree 外，原开发仓库在开始时已有其他并行 worktree；本轮未对其执行 checkout 或写操作。报告分支为 M 的独立 worktree。
