# P06 E05 + E06 集中实机验收 r01

- 候选：PR #127 固定 SHA `bc228f64750714e70c73cbd115d2f169c610a517`，tree `0536edcf57a1350d2f2f777a6bab55c6e8ca731f`。
- 结果：`P06 PARTIAL`；`L02-01 E05 LIVE NOT ADMITTED`；`P06 E06 LIVE PARTIAL`；`MERGE NO-GO`；`P07/P08 NOT STARTED`。
- 本报告没有修改 29 号权威 LIVE 台账、PR #118/#121/#127、历史 RED 或 Gold。

## E05 独立结论

在独立 Electron profile 中创建了合成 A/B/C 与批次，并调用真实 Pi Provider。A 完成合规结果并带 1 条 SourceRef；B 完成不合规结果并带 1 条 SourceRef；C 的 Run 技术失败，0 条 check，诊断指出 1 项计划检查未执行与 Agent 24 轮上限。C 不能被记作业务不合规。A/B/C 是新建合成材料，不是正式原始材料或隐藏 Gold。

另在新合成案卷验证了 Main ACK、真实 `review_read_documents` 工具调用、运行中停止、页面卸载期间交付旧 `listRunsV2` 回调、另一个 Main Run 受理以及旧响应没有覆盖新 Run。此竞态子场景通过；它没有产生正式决定。

真实 Renderer 的批次管理中，多批次操作对话框没有目标批次选择器，因此 E05-08/09 为 `BLOCKED_PRODUCT`。逐案 group preview 做了只读预检，但未执行确认。没有授权校方审批者、原始 A/B/C 与 Gold；正式签批、补件、多批回流、逐批自动授权、定稿/重开/outbox、扫描原件审核都未获得 LIVE 证据。没有将技术 `done` 视为业务批准。

**E05 判定：`PARTIAL / LIVE NOT ADMITTED`。**

## E06 独立结论

真实 Pi 普通会话的 Read（SDK 回执含本轮合成 marker）、Write 拒绝后不落盘/再授权后真实写入、运行中 Stop 均通过。官方组合驱动首跑因 onboarding 和 Renderer 尚未选中真实普通会话而在预览断言失败；完成首轮设置并从 Renderer 选中该会话后，Main 授权读取、Shadow DOM marker 与返回审核工作台均通过，首败保留。

普通 DOCX marker 与栅格 PDF canvas 在 Main/Renderer 正常预览；PDF 驱动的页面切换 helper 首次失败，手动真实 Renderer 复核确认工作台可见。Owner 子集验证普通 list/meta/search 不暴露审核会话、preview 被拒、archive 拒绝且 owner 状态不变。随后对 profile 副本进行 SIGKILL 和新 PID 重启，两个普通会话维持原集合，两个 review owner 仍不可见，旧 cancelled Run 未复活。完整 owner Tab、fork、双窗和预览 Tab 恢复仍未测。

Claude、Windows/macOS、Relay/Pocket 缺少授权或设备/外部 actor。基础四项通过不升级为 E06 FULL。

**E06 判定：`PARTIAL`。**

## U0/U1/U3

PR #127 远端 HEAD/tree 及同 SHA CI 在测试开始和收尾前核对一致，CI 为 4034 PASS / 5 SKIP / 0 FAIL。两个规定的本地 E06 检查通过；`review-live-gates.py` 的 22 个子命令均为 0。实际 Electron Main/preload/Renderer 与候选 worktree build hash 已记录。

在可还原的合成 profile 副本上完成了 Main SIGKILL→新 PID 重启，持久会话集合与 owner 隔离保持。SIGKILL 前的隔离快照全部文件 SHA-256 复核通过。第一次快照验证命令错误地对比了启动后已正常变化的活动 profile，首败保留并由只读验证不可变 pre-crash snapshot 通过复测。没有专用有界 tmpfs/虚拟卷，所以 ENOSPC、双失写/outbox 故障注入未运行；没有填满宿主系统盘。Xvfb 只代表 Linux 虚拟显示下的真实 Electron/Renderer，不代表 macOS/Windows 原生窗口验收。

## 29 号 LIVE-01～08 差分建议（不改权威状态）

| 编号 | 本轮新增可复核事实 | 状态建议 |
| --- | --- | --- |
| LIVE-01 | 当前候选真实 Pi 合成 A/B 有 SourceRef；C 技术失败；未完成工具权限负例全集与 PNG 审核 | 保持 PARTIAL |
| LIVE-02 | 普通预览渲染了合成栅格 PDF；未调用 `review_inspect_original`，不能升级原件审计 | 保持 NOT-RUN |
| LIVE-03 | 未测试 CompactContext/长轮次续交 | 保持 NOT-RUN |
| LIVE-04 | 未覆盖 HTML/EML 逐事项准备和 Main ACK 前门禁 | 保持 PARTIAL |
| LIVE-05 | 新增旧 ACK/迟到响应不覆盖新 Run 的真实 Main/Renderer 子场景 | 保持 PARTIAL，附本轮证据 |
| LIVE-06 | 新增普通 list/meta/preview/search/archive 拒止及 crash restart owner 隔离子集 | 保持 PARTIAL |
| LIVE-07 | 新增真实迟到回调竞态和隔离副本 Main 崩溃恢复子集 | 保持 PARTIAL |
| LIVE-08 | 新增普通 Pi Read/Write/Stop、文本/DOCX/PDF 预览与普通会话跨 PID 保持；Claude/fork/双窗/外部场景仍缺 | 保持 PARTIAL |

## 缺陷、测试工具和阻断分类

- **产品功能缺口**：真实 Batch Manager 没有多批次补件回流目标选择/确认 GUI；Main IPC 存在不代表 GUI 业务入口存在。
- **待归因的运行失败**：合成 C 达到 Agent 24 轮上限且没有提交检查结果。它是技术执行失败，现有证据不足以判为产品代码缺陷或业务不合规。
- **测试工具问题**：E06 首次预览未完成 onboarding/选择 session；PDF helper 假定从任意页面都已处于审核工作台；E05 helper 的页面、按钮假设和初始竞态 fixture 构造不匹配。全部首败均在 `first-failures.json` 保留。
- **环境/授权阻断**：缺少原始授权 A/B/C 与 Gold、SchoolPort 签批人、Claude、Windows/macOS、Relay/Pocket 接入和专用有界故障卷。
- **未实现/未验范围**：正式补件多门控、多批幂等回流、自动批准撤权、finalize/reopen/outbox、review_inspect_original 原件回执、ENOSPC/双失写、fork/双窗/Tab 恢复。

## 公开与私有证据

本目录仅含已审查的脱敏 JSON 与本报告，不包含 Provider 原始对话、profile、学校账号、原件或真实路径。原始命令日志、Electron 截图、合成 profile 快照和 raw evidence 的 SHA-256 清单保存在执行机的私有目录；公开文件与私有文件分别散列。
