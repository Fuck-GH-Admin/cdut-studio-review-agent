# CI / failure 原始账（追加，不修改旧失败）

| 对象 | GitHub Actions | 在本文件编制时观察到的事实 |
| --- | --- | --- |
| `4c274b1` PR CI | #39146078030 | SUCCESS |
| `4c274b1` Review batch | #39146078031 | SUCCESS |
| `4c274b1` Review Baseline | #39146078202 | SUCCESS |
| `4c274b1` D2 Scoped Pi | #39146078029 | SUCCESS |
| `a879fd9` D2 Scoped Pi | #39146455098 | FAIL — TypeScript TS2451 redeclared `changed`，进一步 TS2339；`c372d4b` 修复 |
| `c372d4b` / `ac20088` | 每次提交独立 Actions | 结果需以对应提交查询，不拼接旧绿灯 |

除上表，84 号的权限首败、修复顺序回归、旧 E01 replay 原始 RED 均在各自 PR CI 链接中原样保留。

实际命令由 GitHub 现行 workflows 自动执行。未在本地独立运行 Bun/Electron/真实 Provider；无本地命令退出码，不能补造。**本 r02 新文档最终 HEAD 的四项 CI 需要单独复查和记录。**
