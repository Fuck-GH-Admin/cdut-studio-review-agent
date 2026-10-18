# Office #71 本机真实验收 R02

本记录固定在 PR #110 HEAD `6c8ee997da1f0fd781e3bd11cbc7fcc97867e918`。所有 Office 输入均为本轮生成的合成 DOCX/XLSX/PPTX/PDF；Electron 使用全新隔离 profile、config、user-data、workspace、Xvfb 与 loopback 端口，没有使用 provider 凭证、真实校方材料或 Gold。

真实 Electron Main 解析与只读 UI 中，同 basename 的 DOCX/XLSX/PPTX A/B 均映射到独立 fileId、artifactId、索引和缓存身份；正反序、同字节异路径、改版、同 size/mtime、跨格式同 stem、restart、旧笔记、读取歧义和锚点场景通过。真实 Main 重启后 PID 从 `3396991` 变为 `3408759`，身份、revision、切片和索引保持。真实 Renderer 预览中 A/B Office 标记或画布摘要不同，PDF iframe 有效，预览只读且不增顶栏 Tab。

SourceRef 边界专项的 6 项测试通过：普通 Office fileId、revision 与 fN anchor 不足以授权审核结论；只接受有效案卷版次、block 和 quote，旧版 SourceRef 关闭。普通 index 与正式审核 SourceRef 仍分层验证。

PR #110 固定 SHA 的 Actions run `39105979654` / job `117611851730` 为 success，记录 4007 pass、5 skip、0 fail，没有上传工件。run API head SHA 与候选一致；job 日志显示实际 checkout 的合并提交以 `f387c2e` 为 head，而候选 `6c8ee997` 在它之上只新增了 70 号任务书，`apps/electron` 树一致。完整日志仅保留在本机 raw evidence，公开清单记录其 SHA-256。

P02 R01 删除后迟到 lookup 最小兼容烟测在真实 Electron/Main/Preload/Renderer 中通过。真实删除发布递增 revision 的 delete 投影；旧 lookup 释放后 session、preview 与 SDK cache 均不复活。本轮没有重跑 P02 R02–R07 或完整 U1。

首轮夹具/断言问题、错误桥接入口和重试均保留在 `known-failures.json` 与本机原始命令日志。上游 `Nya-Angle/CDUT-Studio` 源码差异已核对，独立分支创建再次被 GitHub integration 以 403 拒绝；没有上游 PR，因此上游移植状态为 `BLOCKED_UPSTREAM`。

结论：`OFFICE71_REMOTE_CONTROLLED=PASS`；`OFFICE71_LOCAL_REAL=PASS`（O71-01–08 的受限范围）；`OFFICE71_UPSTREAM_PORT=BLOCKED_UPSTREAM`；`U1_FULL=NOT ACCEPTED`；`L02-00 EXIT=PARTIAL / NOT ACCEPTED`；`L02-01 ENTRY=NOT ADMITTED`。保持 **P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO**，不进入 P07/P08。

原始日志、截图、profile 和合成文件均保留在本机 `evidence/p06-office71-local-r02-20261018T073319Z/`，未提交。`command-ledger.json` 中绝对本机目录已替换为占位路径。

脱敏输入清单、逐命令记录、Office/Main/Renderer 矩阵、历史首败和候选锁定信息分别见同目录的 `input-manifest.json`、`command-ledger.json`、`office71-real-matrix.json`、`known-failures.json` 与 `candidate-lock.json`。`office71-real-matrix.json` 的 `rawEvidenceIndex` 为本机结果 JSON 与截图提供 SHA-256；命令日志哈希在 `command-ledger.json`。从仓库根目录运行 `sha256sum -c docs/design/review-agent/acceptance/p06-u1-office71-local-r02/SHA256SUMS` 可核验本次提交的所有公开验收文件和 QA 驱动。完整结果报告在 [71 号结果文件](../../71-p06-l02-u1-office71-local-result-20261018.md)。
