# P06 U1 本机独立实机证据 R01

应用固定源 `1c6deadfc0d51644aed6152463f78fdae662cdb6`，tree `987cc106b4952f01231f46698800f4f58f94ed40`。本分支只增加 QA 与验收材料；详细结论见 [65 号报告](../../65-p06-l02-u1-local-real-result-20261018.md)。

完整 U1 未签收。23 项：3 PASS、1 FAIL、4 BLOCKED_UPSTREAM、15 BLOCKED_ENV。普通删除后迟到 metadata 复活是本轮 P02 实机首败；Office #71 在合法文件、真实 Main 中复现。S0 无合法 provider 完整见证，S2 A/B/C 未启动。保留 P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO。

- `candidate-lock.json`：应用固定源、父子关系、合并 CI 同树、QA 源码哈希。应用源码没有修改，命令期间新增 QA 导致 dirty，未声称整树 clean gate。
- `environment-redacted.json`：隔离路径别名、真实 Electron/Bun/Node、Xvfb、PID 重启、provider 与 tmpfs 限制。
- `remote-ci.json`：同 SHA 工件、43 项专项、标准 PR CI 的实际 merge checkout、历史失败/取消记录。
- `command-ledger.json`、`commands-summary.txt`：实际命令、UTC、退出码、原始 stdout/stderr 哈希；服务的 143 是本任务显式 SIGTERM。
- `u1-matrix.json`、`s0-matrix.json`：逐项合同、实际范围、缺项、原始/公开引用与哈希。PASS 只签该行范围。
- `client/`、`office/`：脱敏机器摘要，`rawEvidence` 指向完整私有原件；普通 Office 索引只保留两个样例 block，原件不裁减。部分文件内有失败，不能用其余子断言 PASS 覆盖。
- `case-provenance-redacted.json`：本轮诊断身份与实际 inputManifest；两条失败诊断 run 不是 S2 A/B/C，不分配虚构用量或引用。
- `history/nine-case-rerun.json`：本机重新核对的九案历史。仍为 ARCHIVED。
- `known-failures.json`：远端及本地首败、夹具/驱动失效、产品失败、环境阻断，均不抹除。
- `evidence-index.json`、`SHA256SUMS`：原件和公开文件 SHA-256；原始 profile、完整 transcript、截图与二进制留在本机，未加入 Git。

在本目录执行 `sha256sum -c SHA256SUMS`。日志中 `<PRIVATE_RAW_ROOT>` 对应本机 `evidence/local-u1-raw-20261018T033000Z`；`<AUDIT_WORKTREE>` 对应本次独立工作树。先阅读命令账本和每项状态，不把退出 0 的已知碰撞诊断当产品安全 PASS。

安全复演使用独立目录、全新配置和 loopback 端口。最小命令形态：

```bash
# 首先设置 QA_RAW_ROOT、QA_PROFILE_ROOT、PROFER_CONFIG_DIR、PROFER_USER_DATA_DIR
# 到新建专用目录；不得复用本轮或用户 profile。端口先检查占用。
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun run electron:build
bun test --isolate --timeout 30000

QA_MATERIAL_ROOT="$QA_RAW_ROOT/profile/materials" bun scripts/qa/p06-u1-real-materials.ts generate
# scan.pdf 使用 Pillow 创建纯图片 PDF；实际字节 hash 见 input-manifest.json。
QA_MATERIAL_ROOT="$QA_RAW_ROOT/profile/materials" bun scripts/qa/p06-u1-real-materials.ts office2
QA_MATERIAL_ROOT="$QA_RAW_ROOT/profile/materials" bun scripts/qa/p06-u1-real-materials.ts body-pdf

# diagnostic Main 的完整构建 argv 见 24-diagnostic-observers 命令记录。
# 指定 QA_MAIN_PORT、QA_CDP_PORT、PROFER_VITE_PORT；独立 Xvfb 启动真实 Electron。
bun scripts/qa/p06-u1-client.mjs prepare
bun scripts/qa/p06-u1-client.mjs guard
bun scripts/qa/p06-u1-owner-events.mjs  # 当前候选预期复现 FAIL，不能改断言求绿
# 实际终止本任务 Electron，再用同专用 profile 启动新的 PID：
bun scripts/qa/p06-u1-client.mjs restore
```

上述驱动不访问学校账号；不调用旧 `ensureReviewPage` 的自动登录，不恢复退役 Preview Tab。`p06-u1-main.ts` 仅用于独立诊断构建，包装真实方法并透传，未替换 executor、Pi 或权限回调。无授权 provider 时，不签 SDK 注册/真实工具成功，不启动 S2。IO 仅在非 root 有界 8MiB tmpfs 安全前置条件满足后单独复演。
