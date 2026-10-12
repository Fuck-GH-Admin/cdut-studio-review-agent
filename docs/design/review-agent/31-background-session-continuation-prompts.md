# 31｜后台案卷审核：新会话接手和小批次执行提示词

> 本文件的提示词用于 **Draft PR #21** 的连续工程工作。它不替代仓库源码、CI 或 [27](27-background-review-session-proposal.md)/[29](29-background-session-preflight-audit.md)/[30](30-background-session-handoff.md) 文档。任何阶段完成与否以**当次 PR HEAD、实际 GitHub CI 和证据**为准。

## A｜新会话第一次使用（直接复制粘贴）

```text
宝宝，接手我们的 cdut-studio-review-agent「直接案卷审核 Pi 后台会话」项目，继续以前一个会话的工程进度，不要重新从头设计。

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
正在开发的 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21
分支：feat/review-owned-background-sessions
最近一次 P05-S01 冻结代码 SHA 是 2a08e439d19a0d2eea572003b6ad2d71d33ca3c0（PR CI #38198346287 SUCCESS：3773 pass / 5 skip / 0 fail）；后续已有交接文档提交，必须以 GitHub 当前 HEAD 为准；这只是参照，不代表当前 HEAD，必须从 GitHub 重新核验。

开始前必须用 GitHub 连接器完整阅读下列 PR 分支内文档，不能只读 main：
- docs/design/review-agent/27-background-review-session-proposal.md
- docs/design/review-agent/29-background-session-preflight-audit.md
- docs/design/review-agent/30-background-session-handoff.md
- docs/design/review-agent/31-background-session-continuation-prompts.md
还要核对 PR 描述、最新 HEAD、实际 changed files 与 CI，针对下一批再阅读相关真实生产源码、测试和调用链。若文档与源码冲突，以当前源码/测试事实为准，同时指出并修正文档，不能凭记忆认定已实现。

现状：P01/P02 与 P03-S01～S03 已有受控测试；P04-S01 桌面主路径 8/8、S02 Tab 恢复/重开 7/7、S03 删除后 tombstone 5/5、S04 桌面 IPC/早到预览/旧队列 8/8 受控 PASS（全仓 3768 pass / 5 skip / 0 fail；D2 与 Review Baseline SUCCESS），PR #21 保持 Draft。P04 整体 PARTIAL，P05-S01 已受控 PASS，P05 整体及 P06～P08 与真实后台 IPC/跨页 E2E 仍未完成。29 号文档 LIVE-01～LIVE-08 的八项实机验收均 NOT-RUN，必须留到最终统一验证，不可自动勾选。

本轮只执行 P05-S02：独立审计飞书普通镜像创建、流式卡片、旧 chat binding 恢复/变更/列出、Agent EventBus 通知、聊天发送与 stop；保留正常普通会话正例，同时阻止 live/deleted review owner 被旧绑定或群镜像读取/操纵。P04-S04 已补 known-ID 桌面守卫与普通 Preview/Browser 的 Main 可信校验回填，但真实 Electron 多窗口 LIVE-06/08 均 NOT-RUN；29 号 P04-PATH-01 泛用路径 IPC 尚缺 review 私有沙箱的路径级隔离证明，必须保留并在解除 Draft 前关闭。P05-S01 Pocket 间接 requestId/旧版文件 ID/replay 已完成，不能反复改动；本次不顺手改桌面 UI、Pi 引擎或开发正式公共审核 IPC。 `P05-REMOTE-PATH-01` 和 `P04-PATH-01` 必须保留待审。

执行习惯：先看代码验证真实缺口，复用现有 owner、Session Manager、Tab/窗口现成机制，不另造会话系统。只改本批必要生产代码与测试，补已删除 owner 的异步事件/旧快照负例、可信 tombstone 的必要时序与普通会话不受影响的正反例。按实际冻结 SHA 查 GitHub CI（全仓、D2、Review baseline），失败必须修复后重跑，不能把未运行当 PASS。

每批结束必须更新 29 号文档的阶段状态、代码/CI SHA、通过/失败/NOT-RUN、P04 剩余入口及 LIVE-06 缺口；同步维护 27/30、PR #21 说明。不要改动 LIVE-01～08 的 NOT-RUN，除非真的取得对应实机证据。总结列出改动、测试证据、剩余风险、下一小批次建议；本轮完成即停止，不擅自推进 P05-S03、P06 或合并/解除 Draft。未经我明确验收，不合并 PR。

如果最新 HEAD 已包含本轮能力，先做差距核验，不重复造轮子；如果无法访问 GitHub 或 CI，要明确写未验证，不能推断成功。
```

## B｜后续每个小批次重复使用（替换尖括号）

```text
宝宝，按照仓库 Draft PR #21 的 27/29/30/31 号文档，继续 <阶段与小批次 ID>，仅做 <本批唯一目标>，不要跨阶段。

先重新核对 PR HEAD、已有源码、测试/CI、上一批已完成和未完成记录，避免重复实现；尤其验证与 P01～P04 既有 owner、Main ACK、V2、桌面/Pocket 保护的兼容性。

按「实际入口核验 → 最小复用实现 → 负例/旧普通会话回归 → 本 HEAD 全仓+专项 CI → 更新 29 号证据账本和 27/30 交接说明以及 PR」完成。给每一项写明 PASS/FAIL/NOT-RUN 与 SHA，不以旧提交的 CI 冒充新 HEAD。用户手工实机验证统一登记 29 号 LIVE-01～08，本轮没有实机证据就继续 NOT-RUN。

特别注意失败/取消/异步迟到、旧缓存恢复、缺失 owner 元数据、按 ID 绕过、跨窗口与普通 Agent 的正常路径。不要新造执行引擎、会话数据库或通用权限框架；不要开发未要求的 UI、模板/批量审核；不要合并或解除 Draft。完成 <小批次 ID> 后停止，向我汇报下一建议。
```

## C｜最终统一实机验收时使用（不是现在运行）

```text
宝宝，我们准备验收 PR #21。请从当前 Draft HEAD 读取 27/29/30/31 号文档，并逐条核验 29 号 LIVE-01～LIVE-08；先对照实际实现生成可执行的合成案卷测试步骤和证据要求，标明哪些可以 CI 完成、哪些只能我在实机完成。

严格使用隔离的 PROFER_CONFIG_DIR/PROFER_USER_DATA_DIR、合成材料和授权的真实 Pi provider，核对工具隔离、扫描 PDF 视觉回执、真实 ACK/跨页、Pocket 和桌面搜索/事件/恢复、取消/重启/删案竞态、普通 Pi/Claude 及原批量 A/B/C 回归。每项记录 PASS/FAIL/NOT-RUN、执行者、日期、SHA、日志/录像及缺陷复测。任何未通过不许将 PR 宣告已验收，更不能未经我明确确认合并。
```

## 新会话应该交回的固定结构

1. 当前 PR HEAD / Draft / CI 状态（区分当次与历史证据）。
2. 本批具体入口与风险、最小实现方案（代码可核查，不凭猜测）。
3. 修改清单、测试负例与普通 Agent 回归、实际运行证据和 SHA。
4. 29 号账本/27+30 交接/PR 是否已同步。
5. 明确列出 **NOT-RUN** 的 LIVE 项、P04/P05 剩余入口、下一小批次建议；本轮停止。

**警告**：`owner:review-case` 是隐藏内部会话的**元数据归属**，而 `runId/assignmentId` 是审核运行的**业务授权**，不能互相替代。不能只依赖 Renderer 把会话隐藏；普通 Main IPC、Pocket/Feishu、WS、历史快照及异步事件均要检查相应边界。
