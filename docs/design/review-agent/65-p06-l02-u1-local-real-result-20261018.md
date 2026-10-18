# 65｜P06 L02-U1 本机独立实机验收 R01（2026-10-18）

**结论：U1 未通过。P02 真实迟到 lookup 失败；Office #71 真实影响确认；合法 provider 与安全故障卷缺失。保留 P06 PARTIAL、P06-S02 NOT ACCEPTED、MERGE NO-GO，P07/P08 NOT STARTED。** 本报告不修改 29 唯一 LIVE、历史证据或任何现有 PR。

固定应用源：PR #103 `1c6deadfc0d51644aed6152463f78fdae662cdb6`；tree `987cc106b4952f01231f46698800f4f58f94ed40`。本机分支 `audit/p06-l02-u1-local-real-r01` 从该提交建立。原工作区已有 CenterPanel 未提交修改，未操作原工作区。AGENTS、55/56、59/60/61、62/63/64 已阅读；本轮不改应用生产源码、共享 Office、权限白名单、SourceRef 或 owner 授权。

| 独立判定 | 状态 | 可签范围 / 缺项 |
| --- | --- | --- |
| REMOTE_CONTROLLED | PASS | 同 HEAD 专项 43/43；标准 CI 实际 merge commit 与固定 HEAD 同 tree，3991 PASS / 5 SKIP / 0 FAIL |
| S0_MAIN_IPC_PI | NOT-RUN / BLOCKED_ENV | Main/IPC 有实际子集；没有合法 provider 成功 turn、五工具最终注册及有效 binding 撤权全套见证，不能签 S0 |
| S1_OFFICE_PREVIEW_IO | FAIL | P02 实际失败；O01/02/03/05 BLOCKED_UPSTREAM；IO BLOCKED_ENV；其余按矩阵独立签署 |
| S2_NEW_SYNTHETIC_C | NOT-RUN | S0 未准入，未运行新版 A/B/C 业务复演；诊断案卷不能冒充三案 |
| L02-00 EXIT | FAIL / PARTIAL / NOT ACCEPTED | 九案历史重核 PASS；新版业务 LIVE 未运行，不能总签收 |
| L02-01 ENTRY | FAIL / NOT ADMITTED | 安全、Office 与业务证据门禁未满足，不代签补件回流、人工审批或幂等闭环 |

23 项原合同的独立判词为 **3 PASS、1 FAIL、4 BLOCKED_UPSTREAM、15 BLOCKED_ENV**。逐项预期、实际、命令、退出码、原件/公开哈希见 [u1-matrix.json](acceptance/p06-u1-local-r01/u1-matrix.json)。环境与全部机器材料入口见 [证据目录](acceptance/p06-u1-local-r01/README.md)。

## 远端与工程门禁

接手和完成前两次核远端：main=`8989941b`、#98=`2d9e93f3`、#99=`66dc3f09`、#101=`0524604c`、#103=`1c6deadf`，均未漂移。相关 PR 保持 Draft/Open；检查时整个测试仓库的 Actions in_progress=0、queued=0。另有独立 D4 工作树/PR，未并入本轮。

已实际下载 [专项 #39092396363](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39092396363) 的 [工件 #12123565948](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39092396363/artifacts/12123565948)，ZIP SHA-256 `060549124823d90003431c0060d55a8f0a9429402e61aee1951f74d50bfc6c75`。检验内部 SHA256SUMS、checkout commit/tree、commands.tsv：安装、typecheck、43 tests、已知 Office 六行碰撞复现、overall 均 exit0，工作树 clean。Office 复现 exit0 表示缺陷仍在。

[标准 PR CI #39092396304](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39092396304) 没有可下载 artifact，已取回完整 job log。实际 checkout=`b2181314b51e4a906324fb491e03e77fea006515`；独立 fetch 后确认与固定 HEAD **tree 完全相同**，并明确记录 merge 身份。安装、类型、边界、皮肤、Main/Preload/Renderer 构建与 3991/5/0 全部通过。没有将其他 SHA 的 CI 转用。

同时下载 #103 的三次历史失败工件和原日志：#39091866164、#39091960604、#39092153167，均 42 PASS / 1 FAIL；实际原因是驱动/受控夹具用了不可解析的 `presetId=default`。前两次 commands.tsv 未捕获测试 exit，不能补写；job 原失败仍在。其余 superseded CANCELLED 也逐条保留，见 [remote-ci.json](acceptance/p06-u1-local-r01/remote-ci.json)。56 的安装 mode 与 inactive SourceRef 首败、61 九案历史及 37/38/44/46 原记录均未覆盖。

本机 Bun 1.4.0、Node v22.23.2、Linux、Electron **43.7.7（实际 lock 解析版本，不按 AGENTS 中旧示例猜测）**，独立 Xvfb。Electron ZIP 与锁定包 checksums.json 校验一致。全新 config/userData/材料目录，端口 18574/19222/19230；未读取真实用户配置，未使用环境中未授权的凭证。仅创建指向 `127.0.0.1:1` 的无效合成诊断渠道；它不能证明 provider。

本机实际 frozen install、全仓 typecheck、边界、electron:build、43 项定向与全仓 **3991 PASS / 5 SKIP / 0 FAIL** 均 exit0。提交前再次 typecheck。命令期间新增 QA，保留 dirty 标志，不把应用源码冻结等同整棵验收分支 clean gate。九案审查首次缺历史 Git 对象 exit1，fetch 固定 d24/b95 后重新运行 exit0；首败保留。

## 本轮真实 Main/IPC 与 UI

真实 Main/Preload/Renderer 创建合成案卷并导入八份材料。普通 create/list/meta/读取/归档/取消归档/搜索正例可用；review owner 不进入普通 list/meta/search/SDK 历史或普通 send。审核 owner 原件的直接路径、目录/文件 symlink、父目录绕行、rename 和假/删除身份拒止均有真实 IPC 输出。

诊断渠道存在时，Main 在真实 ownership 后返回 ACK，含业务 case/run，不暴露 session/assignment；随后因无有效模型执行失败。此链只签 ACK 子集，不能签 provider 成功。真实 `runAgent` 下无 binding、预设切为 `standard`、非用户触发三种内部 owner 均报“拒绝降级为普通 Agent 权限”，且该 session 的 Pi query 增量为零。没有用 fake adapter 代替这三次 Main 调用，但有效 binding 的正例、运行中 revoke、最终 SDK 五工具注册、CompactContext、普通 Pi Read/MCP 仍缺。

普通只读侧栏强制 readOnly，不新增 Preview Tab；文本通过实际 Shadow DOM 核验精确标记，DOCX/PPTX 页面可见合成文字，XLSX canvas 显示双 Sheet，扫描 PDF 的真实 iframe canvas 有非零尺寸。实际 PID 从 `2173621` 重启为 `2201360` 后重新执行六项预览/持久化子集，全部通过。截图与完整原始日志留在本机，哈希入索引，未公开含本机路径的原始截图。

## P02 新首败：删除后迟到 metadata 实际复活

用真实 `createAgentSession` 创建独立普通临时会话；调用生产 `openFilePreviewTabAuthorized`，在 loader 中截获**真实 Main getAgentSessionMeta** 回执后等待显式闸门。随后通过真实 `deleteAgentSession` 删除，Main meta 读取为 `null`。释放旧回执后，生产 Renderer 接受旧 metadata，返回非空预览路径，`agentSessionsAtom` 又含已删除 ID，`previewFileMapAtom` 又有只读槽。

最初 #36 只证明删除撤销通知等待超时；#37 释放回执得到上述直接失败，实际 exit1；真实 Electron 重启后的 #39 新临时会话再次重现，exit1。两次均 `deletionNotificationObserved=false`、`rendererAfter.sessionPresent=true`，不是仅靠超时猜测。普通 owner metadata/预览状态复活已经证实；审核 owner 私有文件读取仍被 Main 拒绝，**没有证据宣称审核原件泄露或新审核 run 被结束**。

定位依据：Main 删除 handler 调用 deletion coordinator/SessionManager，当前生产调用点没有发布 `publishAgentSessionDeletion`；Renderer 的 `ensureOrdinaryWorkTabOwner` 依赖本地 revoked 标志与旧 lookup，没有重新核当前 Main 存在性。这是冻结候选上确认的现存缺陷，未确定引入提交。责任为普通会话 Main 删除投影 + Renderer 延迟授权的独立修复分支；本验收分支不修生产逻辑、不改 FAIL 断言。原始与重启复现分别见 [前次](acceptance/p06-u1-local-r01/client/deleted-lookup-before-restart.json)、[重启后](acceptance/p06-u1-local-r01/client/deleted-lookup-after-restart.json)。

## Office / PDF / I/O

新建合法 DOCX（两段和表格）、XLSX（Budget/Details 两 Sheet、多 Cell）、PPTX（两页），A/B 相同 basename 不同目录/字节，另复制相同字节。实际解析生产函数执行正序/反序、同字节、跨格式同 stem、同物理源 unchanged、三格式改版与独立进程重启；再由真实 Electron Main 的生产 parser 执行 DOCX/XLSX/PPTX × same/different 六行，重启后再执行。

观察到不同物理源共用 f1、相同字节的新路径返回先前 sourcePath，不同内容导入覆盖同 stem registry/index。#71 由 post-parse 风险升级为真实文件/Main 影响证据，O01/O02/O03/O05 均 BLOCKED_UPSTREAM。未修改共享 Office，后续按约定先独立上游 Office PR，必要时另开审核侧修复。

正文 PDF 的 Main 导入为 parsed、有可回溯文字块；扫描/空白为 partial、零文字块，损坏为 failed、零块。最早 readable.pdf 的唯一短行在 y=740，`pdftotext` 可读但引擎按页眉过滤；保留原件，另建 y=500 正文对照成功，并记录原 AST kind=header。此差异不归为模型幻觉或确定的 parser bug，不凭空补 OCR 文字。

uid=1000 的 `unshare -Urnm true` exit1：`uid_map: Operation not permitted`。不能建立安全的非 root 8MiB tmpfs，因此没有尝试填满宿主文件系统、ENOSPC、双失写或故障保持重启。P07 的机器状态 BLOCKED_ENV，细分类 NOT-RUN_ENV；普通进程重启 PASS 不能替代故障恢复。

## 证据边界与后续责任

本轮没有合法专用 provider，未挪用宿主凭证；没有满足 S0，未创建 S2 A/B/C。诊断 run 的实际 case/run/assignment/turn/inputManifest/材料版本保存在 [provenance](acceptance/p06-u1-local-r01/case-provenance-redacted.json)，缺失 quote/location/tool input/output/providerUsage 明确写 MISSING。两条失败诊断 run 不作三案业务结论，也不虚构 token 或新的 UUID。

本机九案历史审查独立 exit0：旧 corrected 的直接退出因为用量断言，witness 因过期组拒止传播，selected 没有错误 fallback；C 的 awaiting-supplement 仍是业务未完成。未将旧九案身份改成新诊断案。

旧脚本 20261014 profile、5176/9222/9230、旧 Preview Tab、账号自动登录、旧 Atom/API 与 UI DOM 假设均已审查；新增驱动显式指定本轮环境。安装、历史对象、驱动表达式、Shadow DOM/canvas、无效 default 夹具、普通预览策略与摘要器失败，均保存原始命令/输出并分别归为 HARNESS_INVALID/ENV，不能抹除。早期失败截图命名共用，部分原像已被覆盖；未将这些截图伪称完整首败，首败使用仍在的原始日志/命令/备份 JSON。

必须先修 P02、在独立上游修复 #71 并复验，再补合法 provider 的完整五工具/SourceRef/Owner/stop/restart 与安全故障卷；S0 通过后才执行新版 A/B/C。L02-01 人工补件/审批闭环仍不得启动。P05 Relay/Pocket 外部门禁不因本轮放行；P04 tombstone/UUID journal 未做 GC。没有修改 main、#21/#72/#98/#99/#101/#103、权威 LIVE 或隐藏 Gold，没有合并或进入 P07/P08。
