# 70｜P06 L02-U1 Office #71：独立真实 Office/Main 验收任务书（R02）

> 目标不是重跑 P02，也不是整套 U1；用已经复现问题的 **PR #105** 合法 DOCX/XLSX/PPTX fixture/真实 Electron 工具路径，在 **PR #110 修复候选** 的新工作树和隔离 profile 下逐案得到对应 GREEN、发现其他影响，并提交可复核证据。没有实际运行和结果时绝不称 PASS。

## 0. 冻结与安全

- 读取：`AGENTS.md`、69 号修复说明、65 号真实 RED、`acceptance/p06-u1-local-r01/office/`、PR #110 当前固定 HEAD/tree、Issue #71、PR #108 P02 验收报告 68。
- 记录 `main`、PR #105/#106/#108/#110 实际 HEAD，不合并任何 PR，不更新旧实机材料；PR #110 的实际 CI/job SHA、日志、任何首败和重试必须归档。
- 从 PR #110 最新 HEAD 建 **独立 worktree、独立本机 branch `audit/p06-u1-office71-local-r02`**。配置新 `PROFER_CONFIG_DIR`、`PROFER_USER_DATA_DIR`、workspace、真实 Office 合成材料、独立 Xvfb/loopback，杜绝已有用户账号/profile/凭证/学校文档。任何旧脚本中固定 5176/9222/9230 和日期路径都要先检查并显式替换。
- 所有日志记录命令、时间、原始 stdout/stderr 与 SHA-256、软件/文件输入 hash。应用生产源码固定 PR110，不为追绿修改业务代码或 SourceRef 判词。

## 1. 必须经过的 Gate

1. 冻结安装 `bun install --frozen-lockfile`，`bun run typecheck`，`bun run check:boundaries`，`bun run electron:build`，`bun test --isolate --timeout 30000 apps/electron/src/main/lib/document-parse-tools.office71.test.ts apps/electron/src/main/lib/document-parse-tools.test.ts`。独立记录 exit。若全仓 regressions 负载可接受则同时执行并登记。
2. 在新 workspace 实际构造有效 DOCX（≥2 段+1 表）、XLSX（≥2 Sheets、多 Cell）、PPTX（≥2 Slides），A/B 为不同 sourcePath、相同 basename、A/B 不同正文；另有相同字节异路径、内容改版、跨格式同 stem 对照。请优先复用 PR #105 的 `scripts/qa/p06-u1-real-materials.ts`，但要独立确认实际 ZIP 文件有效、内容真实不同、hash 匹配。
3. 用**真实** `executeParseDocumentTool` 与真实 Electron Main `__p06Live.executeParseDocumentTool` / 已审核的 Main 诊断桥，检查各次返回的 `sourcePath`、`fileId`、`artifactId`、`revision`、`cleanMarkdownPath`、`anchoredMarkdownPath`，以及 `.context/artifacts/manifest.json`、`registry.json`、`*.index.json` 实际内容。确保每个物理源独立，不被后导入源覆盖。
4. 复用 PR #105 的真实 RED 案例，但不要直接断言同名 `fileId` 碰撞为真来得到 success；反例必须改为**要求不发生**碰撞。更新的只有这轮独立测试 driver，历史 RED/源文件/失败截图不改动。
5. 进程彻底退出并用**相同隔离 profile 与不同 PID**重启后重复 Main 解析/切片/manifest/registry；按新 HASH 对照缓存与内容。支持真实无 provider 正反例，不需要校方服务。

## 2. 精确真实签收矩阵

| ID | 真正执行步骤 | PASS 必要条件 |
| --- | --- | --- |
| O71-01 | A/B 合法 DOCX、XLSX、PPTX × 不同字节，同名异绝对目录；正向导入和反向导入 | 每格式两个源的 `fileId`、`artifactId`、clean/index/anchored 物理路径**互异**，双方内容和 sourcePath 均正确；不得返回旧原件或覆盖任一索引 |
| O71-02 | A/B 相同字节、不同源路径且同名 | 依然分别有独立源 ID 与路径，查询 B 不返回 A sourcePath；同一路径重复导入则稳定复用该源身份 |
| O71-03 | A 改版、B 不变，改时间/大小与同大小内容修改各做一次 | A 同 `fileId`/artifactId，新 revision/正文正确；B hash 与内容保持；如上层 mtime/size 缓存对同时间同大小内容不变，则明确登记另一个未收口风险，不得把该案例判为 PASS |
| O71-04 | 三种格式共用 stem；异目录、正序、反序、独立进程重启 | manifest/registry、实际索引数量与唯一映射一致；新/旧 PID 有明确记录，不被缓存归并 |
| O71-05 | `read_document_artifact` 按 `fN`、绝对源路径、同名 basename 检索；带锚点点击到源文件 | fN 与全路径回到相应物理源/正确段落或 Sheet/Slide；存在多份同名文档时 basename 必须明确拒绝歧义，不可静默取第一项 |
| O71-06 | 同 stem 旧单文档 v2 manifest/index（或新建单文件兼容 fixture）、人工笔记同名，重复导入、重启 | 可读且保持旧路径、fileId（如原有效）；不得覆盖用户手写笔记。原已被旧版本覆盖的来源必须标 `REINDEX_NEEDED`，不能声称可无原件恢复 |
| O71-07 | 向第二源提交已被 A 占用的 `preferredFileId`、伪造/旧 registry、强行请求 A 的 SourceRef | 普通 index 不得共享/挟持别的源 ID；正式审核 SourceRef 的案卷/版次/quote 校验不放宽，普通 `fN` 绝不可直接升级为审核 SourceRef |
| O71-08 | 主窗口真实只读 Office/PDF 预览及旧 P02 已删会话延迟回执最小烟测 | 普通合法预览可用、已删除 owner 不复活；没有把已通过 P02 改坏。此项是兼容冒烟，不复验完整 U1 |
| O71-09 | 记录现有上游 `Nya-Angle/CDUT-Studio` 与本仓库源码差异，并在有写权限的上游独立 fork/branch 上移植最小共享补丁和独立 CI | 仅有上游实际 PR 和其固定 SHA/CI 时才可 `UPSTREAM_PR_OPEN`；当前连接创建上游分支 403，若没有维护者权限如实写 `BLOCKED_UPSTREAM_ACCESS`，不可发明 PR |

如果没有安全、有效的同大小/mtime 内容改版驱动，应把 O71-03 的该子项写明 `NOT-RUN`，不把其他子项通过扩展为该子项通过。实际 Office 解析失败属于产品/环境/fixture 哪一类必须保留原始错误与输入 hash，不要修改期望。

## 3. 交付与严格范围

- 单独的本地验收分支 + Draft PR，在 `docs/design/review-agent/acceptance/p06-u1-office71-local-r02/` 只提交脱敏 `README.md`、`candidate-lock.json`、`environment-redacted.json`、`input-manifest.json`、`command-ledger.json`、`office71-real-matrix.json`、`known-failures.json`、`SHA256SUMS`，必要时新独立 QA scripts。正式结果 `71-p06-l02-u1-office71-local-result-20261018.md`。
- 各用例状态 `PASS/FAIL/NOT-RUN/BLOCKED_ENV/BLOCKED_UPSTREAM`；提交的 source SHA、parseRevision、documentVersion、Main version、原始日志 SHA 与脱敏 public index 必须对应。raw/截图/真实路径保留在本机，若 ZIP/材料含私人信息则禁止上传。
- P02 验收 PR #108 和 #105 的旧失败工件始终不可修改；Office 上游移植与我方审核修复不混一个 PR。不得把普通文档文件 ID 视为审核 `SourceRef`，不触碰隐藏 Gold、29、真实校方数据。
- 总结分别给出 `OFFICE71_REMOTE_CONTROLLED`、`OFFICE71_LOCAL_REAL`、`OFFICE71_UPSTREAM_PORT`、`U1_FULL`、`L02-00 EXIT`、`L02-01 ENTRY`。没有真实上游 PR 不能签完整交付；Pi/provider 和 I/O 门禁未完成则 U1/P06 依旧 NO-GO，不进入 P07/P08。
