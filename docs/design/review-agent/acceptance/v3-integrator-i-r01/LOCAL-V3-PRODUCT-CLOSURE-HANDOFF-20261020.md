# CDUT Studio Review V3｜本地 Agent 接手与产品闭环

**更新日期**：2026-10-20。**执行方式**：本地主 Agent 负责整体产品跑通、集成、签收与合入；子 Agent 在各自 worktree 定点解决问题。不要重复分支考古、重造业务系统或为测试数字拖慢开发。

**唯一产品目标**：V3 原生案卷 → PDF/DOCX 选取或拖入 → D4 50 套模板/第 51 套自定义 → 对象与 Plan 固定 → 真实 Provider/Pi → 持久 Run/Check/原件引用 → 人工复核 → MD 导出 → 重启恢复。学校正式授权后置，不妨碍本地技术预审，但不得冒充学校审批。

## 1. 版本、进度与证据

- **本文核查的远端 main**：`598c1094b5ec09afc759390be3043cbdc9b3d19a`。接手前重新 fetch 并固定真实 origin/main SHA。
- **用户上传的本地测试报告受测版本**：`16e987a896c9a7d3e623791fd5f7a14da18fdf5c`；它早于当前 main。报告文件名：`02_CDUT_Studio_V3_本地产品测试记录.md`。不同 SHA 的 PASS/FAIL 不得混写。
- **当前 main 构建**：[GitHub Actions 39418576664](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39418576664)：TypeScript、包边界、Main/Preload/Renderer build 通过；unit/regression 在 `Expected promise that rejects` 失败。**编译可过 ≠ 产品实机闭环 PASS**。
- **已有源码/接线**：原生 Case/Receipt、真实材料导入通道、D4 50 套资产、D2/D3/D4 Plan 编译、路由工作台、B1 第 51 套作者/冻结/安装适配、Pi 桥接、Run 历史与重审、人工事项、报告。它们并不自动等于已运行成功。
- **本地报告证实**：原生创建 Case 的 Main/IPC 通过；D2 编译、Pi 结果、作者存储及恢复的部分服务测试通过；真实 Pi 使用 mock，未请求 Provider；没有完成 GUI 拖放、V3 报告与重启验收。旧报告的 59/0、30/1、40/0 为不同重叠测试批次，不可相加。

## 2. 当前最重要的真实阻塞

| 级别 | 阻塞 | 已掌握证据 | 完成标准 |
|---|---|---|---|
| P0-A | D4 50 套目录不能完整读取 | 旧 SHA 上 `LOCAL_D4_LIST_V3` 报 `ENOENT`：`docs/design/review-agent/acceptance/d4-g01-build/I/fixtures/selections.json`；当前 main Git tree 确实没有此文件 | 真实入口返回 50/50；G01-I 不靠伪造空选择跳过对象/条件；一套真实模板生成非零 Plan |
| P0-B | 真实 PDF 导入 IPC 卡住 | 旧 SHA 的 `REGISTER_MATERIAL_PATH_V2` 登记真实 572 KB、26 页 PDF 30 秒无返回；不能直接判定为 GUI、解析器或测试 harness 问题 | 在当前 SHA 的 Electron 中 PDF+DOCX 实际登记/解析、重开仍能读取；拖拽也通过 |
| P0-C | 真 Pi/Provider 和 E2E 尚未测通 | 旧测试桥接使用 mock `runAgent`，没有真实模型调用 | 同一案卷真实 Provider 返回、非零 Run/Check、来源与状态持久，失败可追踪 |
| P1-D | B1 第 51 套、人工复核、报告、重启 | 功能与服务部分存在，但没有同一 V3 案卷的 UI 联测 | 用户能完成编辑→冻结→安装→Pi，人工复核、导出 MD、冷重启恢复 |
| P1-E | 旧拖拽拒绝断言可能过期 | 旧 `review-v3-legacy-entry-gates.test.ts` 仍期待 `SOURCE_CAPABILITY_REQUIRED`，而 main 已将拖拽转入原生材料服务；最新回归首败尚未准确关联到该断言 | 先证明新功能正确，再定点修正旧断言；绝不为绿灯撤销真实拖拽功能 |

**结论：目前产品 E2E=NOT_VERIFIED，不得报闭环完成。** 旧 SHA 阻塞先在当前 main 复现，不能把历史失败当作最新代码必败。

## 3. 本地主 Agent 的分工与合并规则

| Owner | 负责 | 交付 |
|---|---|---|
| **主 Agent（唯一集成/合并 Owner）** | 固定 origin/main、唯一集成分支、分派子代理、验收真实 GUI+Provider、处理跨文件冲突、向 main 最终合入 | 唯一候选 SHA、完整业务操作记录、真实 PASS/FAIL 与回滚点 |
| 子 Agent A：D4-50 | 修 `LOCAL_D4_LIST_V3` G01-I 缺输入、50 套可选择及 Plan 安装 | 独立 commit；50/50 与非零真实 Plan 证据 |
| 子 Agent B：材料 | 查 PDF IPC 30 秒未返回，修真实 DOCX/拖拽/来源登记 | 独立 commit；同一 Case 原件列表与来源读回 |
| 子 Agent C：Pi/Run | 实际 Provider/Host→Pi→Run，停止/重审/来源证据 | 独立 commit；真模型请求与非零 Check 证据 |
| 子 Agent D：B1-51 | 新建模板→修订→冻结→绑定 Case 的实际工作流 | 独立 commit；可重新打开并执行 |
| 子 Agent E：工作台/报告 | Run 历史、人工复核、MD 输出及冷重启 | 独立 commit；截图/输出与可复现操作 |
| 按需子 Agent F：编译问题 | 只修明确的构建或真实运行阻断 | 最小补丁，禁止新造测试基础设施 |

**立即派 A/B/C 并行**，D/E 在独立文件范围内可同时推进。每个子 Agent 独立 worktree/branch，不能直接改 main、不能修改其他 Agent 工作树、不能创建第二套 Case/Run/Decision。需要改共享 Main/Preload/正式业务持久化时，只提交精确 diff 给主 Agent，由主 Agent 裁决。主 Agent 哪个修复先可验收就先集成，不等所有人齐步走。

**主 Agent 循环**：`fetch 最新 main → 冻结基线 → 派子 Agent → 接受具体 commit → 集成并在真实 Electron 操作复演 → 定点修正 → 形成唯一可运行快照 → 验证后合并 main`。不要强推、不要覆盖别人远端提交；合并前对比最新 main。学校 Gate L 后置，本地结果标技术预审。

## 4. 实机最短验收顺序

1. `bun install && bun run dev`，进「材料审核 → 本地候选模板」，能创建并重新打开原生 Case。
2. 使用真实 PDF 和合成 DOCX，通过文件选择器、OS 拖拽分别导入；检查来源、解析、重开仍存在。
3. `LOCAL_D4_LIST_V3` 真实有 50 套，任选可用模板，填对象条件并固定 **非零 Check Plan**。
4. 使用可用的真实 Provider 启动 Pi，取得 Run ID、非零 Check 和原件引用；切页回来能继续读取。
5. 人工复核并保存；重新审核生成新 Run，旧 Run 可查；导出 MD 并打开确认内容。
6. 彻底退出 Electron 再启动，恢复 Case/材料/Plan/Run/复核记录。
7. 使用**另一个新 Case**做 B1 第 51 套编辑、保存、冻结、安装并跑真实 Pi。

每条汇报：`基准 SHA / OS / 案卷 ID / 操作 / 实际结果 / 错误日志 / 修复 commit / 复测是否 PASS`。主 Agent 只汇报「真实业务已到哪一步、当前阻塞、谁在修、下一个可合入的提交」，不以 CI 数量或写文档代替业务进度。

## 5. 可直接发给本地主 Agent 的启动指令

> 你现在是 CDUT Studio Review V3 的**唯一产品总集成 Agent**，不是架构调查员。请先读取本文件、`origin/main` 和用户旧 SHA 为 `16e987a8` 的本地实测记录，保持版本边界。立即在独立集成 worktree 建候选分支并派 3 个互不共享工作树的子 Agent：A 修 D4 G01-I 缺 selections 文件造成目录失败，B 查真实 PDF IPC 30 秒超时并核对 DOCX，C 用真实 Provider 打通 Pi→Run。你只负责持续集成和**自己亲手跑同一真实 Electron 案卷**；每位子 Agent 交固定 commit、改动文件、证据与真实 PASS/FAIL，不得直接写 main。其余 B1-51、工作台/报告/重启可再派定点子 Agent。优先复用已有 V3 代码，禁止新造业务真值、重做历史考古和无关测试。收到任一可用成果就集成并实际运行；修复共享接口由你最终裁决。学校授权不阻塞本地技术预审，但不伪造校方批准。真实 GUI+Provider+报告+重启完成之前不得报 E2E PASS。最终只有你合并经验证候选到 main，禁止 force-push。持续用简洁四项状态汇报，不要沉默。

## 6. 最新状态（以后只更新本节，不堆叠历史流水）

- `main` 快照：`598c1094b5ec09afc759390be3043cbdc9b3d19a`；本地 Agent **尚未启动**、子 Agent **尚未派发**（本文只是交接，不是假装执行）。
- 已确认缺失：G01-I 的 `fixtures/selections.json`。旧 SHA PDF IPC 30 秒卡住，须在最新 SHA 定点复现。
- 当前构建：TypeScript、boundaries、三端 build PASS，旧回归 FAIL；真 Electron E2E 与真实 Pi NOT_RUN。
- 下一步：本地主 Agent 拉取本文，立刻并行派发 A/B/C，合并真实修复，执行本文件第 4 节。
