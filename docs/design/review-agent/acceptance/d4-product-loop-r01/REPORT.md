# D4 本地产品闭环

`D4_PRODUCT_LOOP = PASS`，仅指本轮选定的 G08-T02 合成技术预审用户流程。不是 50 套业务准确率、正式校规授权或学校审批验收。

PR #97 开始及交付检查均为 `b68443b23293b4714e61a3b81383d3d3a56434fc`，未漂移；本轮没有跟随浮动分支。交付代码完整 SHA 以本后续 Draft PR 的 HEAD 为准，执行源文件哈希见 [verification.json](evidence/verification.json)。在线运行先于最终 Git 提交；最终 Renderer 的引文控件补丁和包 patch 版本递增没有改变已执行的 Pi/D2 服务源码。

## 用户操作与定向结果

| 环节 | 发现的阻断及修复/实测 |
|---|---|
| 事项 → D4 模板 | 原候选只在 CLI；普通向导仅接受发布模板，且已有建案上下文组件未挂载。恢复挂载并增加受控 D4 技术预审入口，50 项均可发现。 |
| 模板 → D1 → 对象/条件 | Main/CLI 共用冻结目录加载器，校验原始 Git blob；客户端逐对象选择主场景和三值条件，显式确认后提交。未修改冻结作者态。 |
| D2 compile/create/attach | 复用原服务及 candidate-held 管理；生成真实固定 Plan。G08 为 2 Subject/107 Check，G03 为 2 Subject/103 Check；G01-I 使用 student-field、独立合成 registry，2 Subject/60 Check。 |
| 上传与证据 | 原工作台同步会覆盖 D2 Subject/规则，现保留固定 Plan。证明关联可选择当前对象的具体责任事实；未确认关联不授予确定结论。 |
| Pi 执行 | 使用原 review-operator 会话、assignment、工具与来源门禁；DeepSeek Flash 真正调用读取和提交工具。没有第二审核引擎。 |
| 返回与定位 | 107/107 Check 带 SourceRef；工作台可见具体责任、对象、文件、第几段和引文，并可展开定位、打开原件。 |

G08 的 A：本人认领、电子凭证、登记特征一致，R-01 为 `compliant`；模型明确不因缺纸质发票机械报缺件。B：代领、委托材料缺失、部分条件未知，R-01 为 `non-compliant`，精确引用 B 原件第 4/5 段的“白色耳机 TEST-B-7788 / 绿色雨伞 TEST-B-9900”冲突。107 项均有来源，13 项 unknown 条件责任全部保持待核，没有跨 A/B 原件串引。[运行结果](evidence/g08-run.json)、[读取账本](evidence/g08-read-ledger.json)、[实际工具调用](evidence/g08-online-tools.jsonl)、[最终总结](evidence/g08-online-final.txt)。

G03 两对象分别选择 public/graduate 场景；修改一个 unknown 条件后，新案 Plan 指纹改变、证据和运行均为空。另对已有真实在线结果的 G08 修改条件创建新案，旧案保留 107 项结果，新案没有继承任何运行或关联。G01-I 一份合成证明通过客户端建立姓名/证号两条独立 EvidenceLink；未伪造普通 selection.json。[三场景实录](evidence/client-scenario-snapshots.json)。B/C 不声称做过在线模型语义验收。

在线模型为本机已有 `deepseek-flash`，1 次完整审核，1 次批量读取、6 次分批提交，约 2 分 52 秒。记录到 input=105996、output=43594、cache-read=845568（SDK 各字段分别记录，不是费用）。未找到“瓜瓜/赞助”渠道配置，因此没有宣称使用赞助模型。首次若干未知字段、缺关联/错误适用性提交被原门禁拒绝，模型修正后完成；拒绝与修正均保留在工具日志，最后无缺项。没有使用 pending-only 合成回执充作在线结果。

## 直接复测

在本后续 PR 的独立工作树根目录执行，参数只填写配置**目录**，不要填写 Key：

```bash
bun install --frozen-lockfile
cd apps/electron
bun run review:d4:dev --model-config /你的模型配置目录
```

启动器创建全新的 `/tmp/cdut-d4-product-loop-*`，只复制 channels/device/proxy 三类模型所需配置；不复制原模板、聊天或案卷，不修改原配置。选择赞助模型时，在启动后“审核专属设置”中选择复制进来的赞助渠道/模型。Linux 开发机若遇到已实测的 SUID helper 配置错误，可显式追加 `--no-sandbox`；本机用独立 Xvfb `:108` 验证启动。它不改变业务工具/审批权限。二次启动入口已实际执行成功。

1. 完成首次引导，进入 CDUT 专区 → 材料审核。仅本地测试可用仓库内置离线演示账户（见 `cdut-demo/demo-account.ts`），不使用真实校务账号。
2. 新建审核项目 → 勾选 D4 技术预审 → `g08-t02`。A 为 self，所有叠加条件不适用；B 为 proxy，valuable/dispute/sensitive/venue 未知、card/handover 不适用。填写标题/合成申请人并确认。
3. 向证明区拖入 [A 电子凭证](fixtures/A-电子购买凭证.md) 和 [B 冲突材料](fixtures/B-申报与登记冲突.md)。展开“管理关联”，A 只关联 lost-a、B 只关联 lost-b，证明责任均选 R-01；点击添加证明。自动化实测的文件导入复用现有开发 IPC `importDocumentFromPath`，与拖拽/文件选择共用解析器；不是声称操作过原生文件选择框。
4. 点击开始审核，等待真实 Pi 运行完成；返回材料审核工作台，查看 B 的 R-01 问题卡 → 定位引文/查看证明。对照 [预先固定的可观察预期](EXPECTATIONS.md)，不要只看一段总结。
5. G03 用 `g03-t01`；G01-I 用 `g01-student-identity-correction` 并显式勾选合成学籍快照，导入 [双字段证明](fixtures/G01-双字段证明.md)，为两个字段分别关联。条件变更必须新建技术案卷。

回归入口：`bun test --isolate --timeout 120000 apps/electron/src/main/lib/review/review-d4-client.test.ts`。完整本轮定向回归为 8 文件 **74 PASS/0 FAIL**；全仓 typecheck、boundaries、Main/Preload/resources 和 Renderer 构建通过。未重复跑 50 套业务模型或全仓业务调研。[检查日志](evidence/final-targeted-tests.log)、[类型检查](evidence/typecheck.log)、[运行日志](evidence/electron.log)、[构建摘要](evidence/build-summary.log)。

## 版本边界及最小后续工作

- 固定 PR #97 的直接审核仍由 Renderer 调用普通 Pi 会话并打开聊天。已阅读本地另一个工作树 `de1318c5d0d502b66e030e3500e83cc518d389e6` 的后台实现：Main `review-pi-run-bridge` 创建 `owner.kind=review-case`、主窗口 sender 校验、admission ACK 和状态投影。两者 IPC/owner 类型不同，未混装或取消其约束。迁入新版后台客户端时需将本轮 D4 建案接线接到该 Main 启动入口并定向复验；本轮没有声称后台 owner 版本已兼容。
- 日常业务输入仍是技术候选入口、合成初值及可编辑场景 JSON；还需业务对象/条件的正式输入表单。没有 D5 编辑器或自动发布。
- G01-I 可信数据仍为明确标记的合成快照；正式学籍/OA 等可信来源适配未实现。同案修改条件后重编译也未实现，目前用新案与新 Plan 保证旧结果不继承。
- 未确认制度、人工审批、真实权属/签章接口仍不能由材料或模型推定；候选保持 held。50 套业务准确率及正式授权未验收。

G04 历史 CI [39060217414](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39060217414) 的测试和 Artifact 步骤成功，最后反推提交因远端竞争拒绝；[原始完整日志](evidence/g04-39060217414-original.log) 保留。本轮移除回推步骤并降为 contents:read，只保留 Artifact，未归因为业务引擎失败。

首次后续 PR 的 Review Baseline CI [39073027029](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39073027029) 发现本轮包 patch 递增后 CHANGELOG 首项遗漏同步；打包守卫因 0.15.151/0.15.150 不一致失败。[原始失败日志](evidence/baseline-39073027029-original.log) 保留，补齐 0.15.151 变更记录后定向复跑守卫；最终远端状态以 PR #100 新 HEAD 的 Checks 为准，不把首次失败写成通过。

仓库要求改 AGENTS.md/根 README.md 前确认；已提出具体同步内容，未收到确认时保留原文件，本说明独立交付。

Q1：**能**，G08-T02 已从真实客户端选择、建案并执行固定责任。Q2：**有**，真实模型读取两份原件 18 个块并保存对应 Check/来源，而非合成 pending。Q3：最小后续是正式业务输入、可信外部数据适配，以及与新版后台 owner 的定向接合；现版本可用于受控技术预审。
