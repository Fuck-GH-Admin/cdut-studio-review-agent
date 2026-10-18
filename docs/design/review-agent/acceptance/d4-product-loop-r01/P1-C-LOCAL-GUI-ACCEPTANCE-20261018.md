# D4 P1-C｜Electron/Xvfb 独立真实操作验收（执行任务书）

> **独立验收说明，不是通过声明。** 这轮用户只授权测试/验收 P1-C 的技术产品路径；不可借本轮触发在线 Pi/校方真实审批。必须先确认 PR #109 的实际固定 HEAD 和其 CI，再从该 HEAD 建独立 worktree。

## 固定前提

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`。
- 本轮代码 PR：<https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/109>，base 为 `feat/d4-p1-real-case-input-r01`，PR #104 代码与实机已由 PR #107 验收。
- 目标不是再次做 P1-A/B，也不是审查 50 套业务准确率；只验证 Main 原生文件选择器→建议与倒计时→P1-A/B 对象/条件确认→实际案卷文件导入的闭环。
- **实机正常环境不需要模型配置**，新临时 profile、仅合成材料。可沿用 `apps/electron/scripts/review-d4-product-loop.ts` 的全隔离启动方式；配置目录使用新的空目录，CDP 只监听 loopback，新 Xvfb `DISPLAY`。严禁复制、清空或修改宿主个人配置/真实校务凭证。
- GUI 操作可以使用 Xvfb + CDP/Playwright + xdotool 对原生 GTK 系统文件选择框点击；**单独创建新案必须通过真实 UI**。只读 `window.reviewAPI.getAggregateV2`、`getCase`、`listCases` 可对账，不能直接调用 write IPC 冒充 UI。
- 每次操作必须保留原始截图/日志和实际失败；不修生产代码、不改 Gold、不可在本机未经授权执行签章/审批操作。

## 所用合成材料与执行步骤

1. 先检查并记录 `git status --short`、`git rev-parse HEAD`、该 HEAD 的实际 CI；从固定 SHA 开 worktree。运行 `bun install --frozen-lockfile` 和隔离启动器。完成离线演示入口，打开 **CDUT 专区 → 材料审核 → 新建审核项目**。
2. 新建 D4 模式；用系统原生选择框选择一个只有合成描述的文本文件 `公共教学教室借用申请.md`，内容一句“申请临时借用公共教学教室”；记录 Main 返回的 `D4IntakePreview` 仅有 token、匿名文件名/体积、候选及关键词，**无绝对路径或原文**。
3. C-02：检查推荐模板 `g03-t01`、可信原因显示“文件名关键词/文本片段关键词”；查看倒计时剩余值及停止逻辑。
4. C-03：不操作 20 秒，确认系统**只自动选择 g03-t01**，未添加对象、未确认表单、更未建立案卷；创建按钮保持禁用。
5. 完成独立案卷：标题 `P1C-GUI-G03-20261018`，合成申请人，一名业务对象“教室上午时段”，主场景 `p-public-classroom`，至少保留一个 unknown。人工确认后点“创建项目”。只读 Main IPC 记录 `caseId`、`d2Plan.templateId`、`fingerprint`、Subjects、application 文档名/解析状态、`publicationAllowed=false`、证据关联数与 Run 数。应有 1 个 Subject、原件 1 份 application、0 Pi run。尤其不能把暂存当成 EvidenceLink 的逐对象已确认来源。
6. C-04：新开 D4 对话框，文件 `失物认领申请.txt`（纯合成），检查倒计时启动后，在 20 秒内**人工改选另一套模板**，保持超过剩余 20 秒，保证不会被推荐重新覆盖。直接取消，不建案。
7. C-05：原生多选两个明确不同事项的合成文本材料 `失物招领申请.txt` 和 `教室借用申请.md`；界面提示多个事项不可同批审核，创建案卷禁用，Main 一次性 token 不得被消费进新案。
8. C-06：原生选择一个命名 `申请.pdf` 的非空、无敏感信息测试 PDF；页面提示材料不足需人工选择，而不是宣传识别了 PDF 正文。无需创建此案卷。
9. C-08/C-09：受控测试 token 重放、伪造或跨 sender 调用（若安全环境难做，则明确 `NOT_RUN`），校验 Main 早期拒止；空文件/超限/文件数超限拒止后不得留下新案。
10. C-10：在真实主窗口 Ctrl+R 重载已创建 G03 案卷，校验原件/Plan/Subject 不丢失且未重复导入或生成另一个案卷。对于暂存失效和关闭弹窗，截图与日志记录是否清理成功。

## 重要观察

- 原文件经 **Main 原生文件选择器** 取得授权，并复制到临时受控目录。拖入区域当前只用作触发再打开系统对话框的快捷方式：**不会直接信任拖入路径**，不能把它写成已实现无二次确认的原生拖放。
- 20 秒仅默认选模板，不会自动建案或确认任何业务事实；用户手选优先。
- 识别策略是固定词表保守候选：G03-T01、G08-T02 + 候选精确 ID；未知材料人工改选。不能声称 50 个领域已经达到 AI 语义自动匹配。
- 原件经原有 application 导入链复制/解析，不等于 EvidenceLink 已人工关联某个对象；若原件解析失败，必须有明确 GUI 错误和异常回执。
- 当前 Main 暂存 token 与主窗口绑定、限时，系统正常退出时同步清除暂存；若机器断电/进程崩溃留下 tmp 文件，应记录为后续遗留问题，禁止自动清理任何无关 /tmp 文件。

## 独立交付

- 另建 `audit/d4-p1c-gui-r01` 分支并建以 #109 分支为 base 的 Draft PR；只提交**脱敏**截图、`REPORT.md`、`verification.json`、读回 JSON、`SHA256SUMS` 和必要运行命令，不修改原 PR #109。
- 报告逐项列出 `C-01...C-10` 为 `PASS` / `FAIL` / `BLOCKED_ENV` / `NOT_RUN`，每项提供截图、实际系统 IPC 回执或者具体拒止日志。留存失败前后原日志。
- 最终判词：`PASS_P1C_GUI_D2`、`PARTIAL`、`FAIL`、`BLOCKED_ENV`。只有真实文件入案和倒计时的 GUI 证据同时通过才能签第一个；CI 不能充当实机 PASS。
- 独立指出：是否适合进入 P2；P06 Live/Main owner 仍完全不在本轮范围。
