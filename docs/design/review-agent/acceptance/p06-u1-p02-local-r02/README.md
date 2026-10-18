# P06 U1 P02 R02 本机独立复验

固定 PR #106 HEAD 6b96dbda8258c64033c0d9158f4fae578f7f66a1；从该 SHA 独立建 worktree 和私有 profile。真实 Electron 43.7.7/Main/Preload/Renderer IPC 下 P02-R01～R07 最终均 PASS。R01 与 R03 均完成删除后释放旧 Main meta 回执的竞态；R03 使用同 profile 的不同 Main PID 重启后再次通过。R02 的旧 projection 和迟到 SDK 事件也未复活 session/Preview。R04/R05 覆盖普通只读 Preview 正例与隐藏审核 owner/路径隔离，R06 覆盖真实隔离目录权限导致的索引持久化失败，R07 覆盖 workspace 级联删除和默认项目拒删。

结论仅为 P02_REMOTE_CONTROLLED_PASS / P02_LOCAL_PASS_SCOPED。PR #106 的 GitHub Actions 实际合并签名 checkout tree 与固定 HEAD tree 相同，CI 3997 PASS / 5 SKIP / 0 FAIL；本轮查询未发现可下载 CI artifact。U1_FULL remains NOT ACCEPTED：Office #71、本地 Pi/provider 五工具授权和 L02 的其他门禁未由本任务复验。L02-00 EXIT 保持 PARTIAL / NOT ACCEPTED；L02-01 ENTRY NOT ADMITTED；P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO。

R07 第一次退出码 1 是新 QA 驱动将“仅剩 default”错误断言成两个 workspace；该首败 JSON、日志和 SHA 已保留。只修正 QA 数量 oracle 后用新合成 ID 重跑，产品 IPC 正确拒绝默认项目删除且所有 R07 检查通过，没有修改产品源码和原始任务断言。R01～R07 原始完整 JSON、屏幕截图、profile 和全部命令输出留在本机权限 0700 的证据目录；验收结束时已关闭本轮 Electron/Vite 进程组并确认隔离端口空闲；仓库只含经脱敏的结论、摘要和哈希索引。PR #105 的原始失败证据保持不变并在矩阵/known-failures 中按 SHA 引用。

## 证据文件

- candidate-lock.json: fixed SHA/tree, PR #106 CI merge SHA/tree, runtime Electron binary SHA-256, diagnostic Main bundle lock.
- environment-redacted.json: ports, isolated profile categories, tool/runtime versions, authorization and fixture boundaries.
- command-ledger.json: every command, UTC, exit code, sanitized argv/cwd, private stdout/stderr SHA-256; all initial failures retained.
- p02-real-matrix.json: R01–R07 expected/actual/status and per-case raw SHA references.
- event-timeline-redacted.json: Main meta/delete revision, Renderer revoke/session/Preview state, and late response outcomes.
- known-failures.json: immutable #105 product RED plus this run's harness/setup first failures and scope gaps.
- evidence-index.json: SHA-256 list of private client JSON and command records/logs referenced here.
- fixture-digests.json: SHA-256 for synthetic text/PDF fixtures from the isolated test profile; no fixture contents are published.
- SHA256SUMS: checksums for all published files except this manifest.

Raw local records use relative names client/<name>.json and commands/<name>.*; absolute machine paths are intentionally absent. Verify public files with:

    sha256sum -c SHA256SUMS
