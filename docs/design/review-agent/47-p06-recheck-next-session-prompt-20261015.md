# 47｜P06-RECHECK 新会话可复制提示词（2026-10-15）

> 本提示基于 [46 当前会话交接](46-p06-recheck-live-running-handoff-20261015.md)。**先读 46，再执行下面的步骤**；42/43 是较早冻结的历史交接，不可覆盖最新代码。

```text
宝宝，我们接手 CDUT Studio 审核模块的 P06-RECHECK 当前运行中验收，不重新做已经完成的 P06-FIX-01/02/03。

公开测试仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
实际开发分支：feat/review-owned-background-sessions
Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21
本次只读交接分支：handoff/p06-recheck-20261015
本次会话交接入口：docs/design/review-agent/46-p06-recheck-live-running-handoff-20261015.md
正式提示词：docs/design/review-agent/47-p06-recheck-next-session-prompt-20261015.md

第一步：先打开交接分支 46/47，再在实际开发分支阅读 45、44、29、30、31。查 FIX-01～03 细节读 39/40/41，查真实失败读 37/38。文件路径均在 docs/design/review-agent/ 下。先获取当前远程 PR HEAD/最近提交/对应 Actions 和独立自托管 workflow 的真实状态；交接快照是 3227bc715fc99005d54495967dbcbe8b277c8295，绝对不能假设仍是最新。

本会话已做什么：此前会话针对 FIX-01 仅读代码、追踪了旧 .bak 恢复丢 owner 的原因，未由该会话提交修复或执行真实 Electron；其他并行会话已经实际完成 FIX-01（9/9）、FIX-02（5/5）、FIX-03（7/7）的受控修复，并做 R1 精确旧探针复演（旧 3 PASS/1 FAIL exit 1、当前 Hook 等效 2/2 PASS）。最新版 3227bc71 再加 R1B 当前生产写入者四种场景与双轨证据门禁，同时已有近期 Pi 授权/终态持久化/case-scoped 批量路径补丁和 review-live-* 真机驱动。不要重做已有阶段、不要替旧审计脚本改 verdict。

本地现在在跑什么：用户明确说本地 Agent 仍在运行，但当前会话不能查看它实际的命令、进程、授权模型或 JSON 结果。云端的自托管 Linux Runner 与多套 Actions 也在排队/执行，某些 PR/focused run 已显示 cancelled。新会话先辨认本地进程、独立 profile、工作树 SHA、报告目录、正在执行的脚本/CI；如果仍运行，不要在相同 profile、端口和工作树重复启动。脚本存在不代表被执行，当前 R1B 新四项和最新 HEAD CI 必须重新核实，真实 E05/E03/E04/E06 未取得新证据时保留 NOT-RUN。

接手任务按顺序：
1. R0：检查 GitHub PR #21 最新 HEAD/Draft 状态，独立 self-hosted Runner 工作流及本地现有任务；若与交接 SHA 不一致先比对新增代码和文档，不覆盖并行更改。
2. R1B：读取 45 号和 .github/workflows/p06-recheck-independent.yml，核查四个 R1_EQUIV_* 当前真实 Controller/Hook 写入者的实际执行见证、退出码、CI 日志与 artifact SHA256；原 38 四项必须原样运行且保留老 WORKSPACE-WRITER 裸 store.set 失败，SETTLE chmod 的 fault injection 判 INVALID，未知失败不可豁免。
3. R2/R3：优先利用本地已在跑的结果，然后在隔离 profile + 授权真实 Electron/Pi 中复验 37 号 E05，补真实 E03 stop-in-flight / E04 旧回调 / E06 普通 Pi、Claude、批量、预览等；再按安全授权核查 ENOSPC 与双持久化失败重启。没有实际运行则标 NOT-RUN，不用 SSR/mock/静态合同充当实机 PASS。
4. R4：发现缺陷才最小修复并加入能证明真实路径被调用的保护负例和普通 Agent 正例；固定最新代码 SHA、真实全仓/专项 CI、类型/边界/Electron build；按证据更新 29 唯一台账、30/31 和 PR 正文及新报告。不得借前一提交 CI 替新 HEAD 签收。

工作原则：只在公开测试仓 PR 分支工作，不改上游/main；不 force push、不扰动正在运行的本地任务；保持 Draft/Open/不合并；不启动 P07/P08。现有 owner、V2 run、assignment、Pi ACK、共享 Jotai write token 必须复用，不新增并行数据库/runner。异常及权限默认 fail-closed；保留旧 37/38 首败和旧工作流原始退出码；FIX-01 UUID owner journal 与 P04 永久 tombstone 禁止不安全 TTL/GC；P05 Relay BLOCKED、Pocket PATCH READY/TARGET NOT-RUN 保持。仅使用隔离合成案卷，禁止上传 API key、真实档案、原始 transcript 或私有 owner ID。每项报告 PASS/FAIL/PARTIAL/NOT-RUN/BLOCKED、真实 SHA、命令、日志/exit/UTC/sha256。

当前冻结结论：P06-S02 NOT ACCEPTED、P06 PARTIAL、LIVE-07 PARTIAL、PR MERGE NO-GO。你无需每小步再问我，但每个小批次必须严格验收并写回 29、30/31；实机未完成或并行任务仍在执行，绝不谎报完成。最终告诉我最新 HEAD、哪几项确实通过/失败、原始证据、还有哪些本地工作在跑、下一步能否开始及是否允许合并（默认 NO-GO）。
```
