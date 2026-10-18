# 71｜P06 L02-U1 Office #71 本机真实验收结果（R02）

本轮从 PR #110 固定 HEAD `6c8ee997da1f0fd781e3bd11cbc7fcc97867e918` 建立独立 worktree 与 `audit/p06-u1-office71-local-r02` 分支，使用全新隔离 Electron profile、配置目录、user-data、workspace、合成 Office/PDF 材料和本机 loopback/Xvfb。生产源码保持固定候选；没有使用真实校方材料、隐藏 Gold、原用户 profile、provider 凭证或 Pi/provider。

真实 Electron Main 的 DOCX、XLSX、PPTX 同名 A/B 问题通过。三种文件均进行了正序/反序、同字节异路径、常规改版、同 size/mtime 内容改版、跨格式同 stem 和 SourceRef 边界检查。A/B 的 `fileId`、artifact、manifest/index/anchored 路径、版本 hash 和读取内容保持独立；`fN` 与绝对路径读取到各自原件，歧义 basename 被拒绝。DOCX/XLSX/PPTX 合成文件分别通过 ZIP 与结构校验。O71-01 至 O71-07 本轮覆盖项以及同一隔离 profile 的重启检查通过；Main PID 从 `3396991` 更换到 `3408759`，重启后 manifest、registry、三份索引、源身份、revision 与切片均保留，legacy note 未被覆盖。

真实 Main 主窗口的只读 Office DOCX/XLSX/PPTX A/B 与 PDF 预览通过。Office A/B 的文本标记或画布像素 SHA 能区分内容；PDF 由隔离 `cdut-file://` iframe 展示。预览保持只读且没有新增顶栏 Tab，普通会话读取仍可用。两个 SourceRef 专项测试 6 pass、0 fail、33 assertions，确认普通文件 ID、revision 与 fN anchor 不会授权审核结论，且退休案卷版本 fail closed。

按任务书要求保留了历史失败和本轮全部首败。command 17 的 XLSX 夹具和 O71-07 断言问题、首轮预览等待/会话选择/Canvas 判据问题、P02 诊断桥准备问题均归为 QA/环境问题；未修改产品实现以追绿。修正后 O71 主矩阵与 Renderer 预览通过。PR #110 CI run `39105979654` / job `117611851730` 为 success（4007 pass、5 skip、0 fail、10 steps）；该 run 没有上传工件。job 日志显示 checkout 合并提交的 head 为 `f387c2e`，与固定候选相比只缺任务书文档 70 号；实际 `apps/electron` 源码树与候选一致。完整 CI 日志仅本机保留并有 SHA-256。

PR #105 的删除后迟到 metadata 回执只做 P02 R01 最小兼容烟测：真实 Main `getAgentSessionMeta` IPC 扣留旧回执，真实 delete IPC 完成后 Main 返回 null 并发布 revision 递增的 delete projection；Renderer 清除普通列表和只读预览，释放旧 lookup 后 session、preview 与 SDK cache 不复活。此结果不替代 P02 R02–R07 或完整 P02/U1。

对上游 `Nya-Angle/CDUT-Studio` 的 Office parser 差异完成核对；创建独立移植分支时 GitHub integration 返回 `403 Resource not accessible by integration`，因此没有上游 PR 或上游 CI，判定为 `BLOCKED_UPSTREAM`。

| 判定项 | 结果 |
| --- | --- |
| `OFFICE71_REMOTE_CONTROLLED` | `PASS`（PR #110 固定 SHA 的远程 CI） |
| `OFFICE71_LOCAL_REAL` | `PASS`（O71-01–08 的本轮范围；真实 Main/Renderer；P02 仅 R01 兼容烟测） |
| `OFFICE71_UPSTREAM_PORT` | `BLOCKED_UPSTREAM`（GitHub integration 403；没有上游 PR） |
| `U1_FULL` | `NOT ACCEPTED`（本轮明确未执行完整 U1、Pi/provider 或业务复演） |
| `L02-00 EXIT` | `PARTIAL / NOT ACCEPTED` |
| `L02-01 ENTRY` | `NOT ADMITTED` |

继续保持 **P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO**。不合并，不更新权威 LIVE 台账，不进入 P07/P08。完整的脱敏证据索引见 [本轮证据目录](acceptance/p06-u1-office71-local-r02/README.md)；本地原始日志、截图、合成材料和隔离 profile 未提交。
