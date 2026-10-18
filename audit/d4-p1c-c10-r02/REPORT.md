# D4 P1-C C10 R02 独立 Electron/Xvfb 实机复验

**判词：`C10_GUI_FAIL`。** C10-A、C10-C、C10-D、C10-F 的实机路径通过；C10-B 的任务书硬断言没有满足。没有确认到生产功能缺陷，但不能据此签 `C10_GUI_PASS`。

受测目标是 PR #124 分支 `fix/d4-p1c-c10-lifecycle-r02` 的固定 HEAD `fc5100b339d1f097aea4ee60bd2d912276bf8429`，生产父提交为 `026cfe0f4905bf10f46291bdd7451788c60df5f9`。验收期间本地 HEAD 与远端分支保持一致。该提交在 PR #124 上的既有 CI 为成功（3751 pass、6 skip、0 fail）；本机冻结 HEAD 另行通过安装、类型检查、边界检查、Electron 三段构建及规定的提交生命周期测试。见 `evidence/logs/prescribed-commands.json` 与各命令原始日志。

## 隔离环境和执行方式

在 detached worktree 中启动真实 Electron 43.7.7 客户端，运行于 Xvfb `:120`（1600×1000×24）和 Openbox，使用全新临时 user-data/config；模型配置为 0 项。通过内置离线演示入口登录，没有 CAS、Provider、在线模型或 P06。原生系统文件选择框选择 40 字节合成 fixture；建案全部经可见 GUI 完成。选择后的暂存界面保存在 `16-intake-staged.png`。原生选择器的四张中间截图曾显示个人 Downloads 列表和 home 路径，已剔除以免发布无关本机信息；相应的选择结果和暂存状态日志保留。只读 Main IPC 用于回读 `listCases/getCase/getAggregateV2/listRunsV2`。为了计数，在隔离工作树的 `CREATE_CASE` handler 入口临时记录无材料内容的递增序号，已保留补丁并在提交前回滚。

fixture `公共教学教室借用申请.md` 的 SHA-256 为 `57bdcc65f42a3c551601e2d23ddf7e72ae474b1d621192e75496d8b2a951684e`。登录标识、临时 profile 的具体路径和其他敏感环境值未写入证据；材料是合成数据。

## 用例结果

| 用例 | 结果 | 观察与证据 |
| --- | --- | --- |
| C10-A 鼠标双击 | PASS | 通过原生选择器导入 fixture；自动路由到 `g03-t01`，GUI 确认 1 个 `p-public-classroom` Subject，8 项条件保留 unknown。约 40ms 鼠标双击产生 1 次 form submit 和 1 次 Main CREATE_CASE；只有成功提示。见 `20-c10-a-pre-submit.png`、`21-c10-a-post-submit.png` 与 `c10-a-*` 日志/读回。 |
| C10-B Enter+Click | FAIL（硬断言未满足） | 按原归档脚本，在可见按钮上发送可信 Enter keyDown/up 后再发送 pointerDown/up/click。记录到 Enter keydown 和鼠标 click，但仅有 1 次 form submit、1 次 Main 创建、无虚假失败提示。任务书要求验证 2 次 form-submit 事件而仅 1 次 Main create，因此该硬断言未复现。见 `25-c10-b-retry-post-scroll.png`、`26-c10-b-retry-post-submit.png`、`c10-b-retry-*`。 |
| 实际键盘 Enter 补充路径 | PASS（补充证据） | 另用 Xvfb 键盘发送真实 Return，浏览器触发可信默认 button click（detail=0）和 1 次 form submit，Main 创建 1 案、无失败提示。证明键盘 Enter 建案可用，但不能替代 C10-B 的 Enter+Click 双 submit 断言。见 `41-c10-b-actual-enter-pre-submit.png`、`42-c10-b-actual-enter-post.png` 和对应事件/入口日志。 |
| C10-C 失败后重试、取消重开 | PASS（部分子项未运行） | 在 GUI 暂存后，将隔离临时目录中的 staged 副本移开，造成真实 Main 暂存文件存在性拒绝 `D4_INTAKE_TOKEN_INVALID`；显示失败提示、对话框保留、案卷数不增。重新用原生选择器选择原 fixture 后重试成功。取消并重开后再建独立案卷成功。打开/关闭期间 Main 回包竞态子项未运行。见 `27–35-c10-c-*.png` 与 `c10-c-*` 日志。 |
| C10-D Main 持久化 | PASS | 创建后的只读 Main 读回确认 5 个 C10-R02 D4 案卷；每案恰好 1 个 40 字节 application，源副本哈希均与 fixture 相同；每案 1 个 Subject、`g03-t01`、52 条规则、8 项条件全 unknown、`publicationAllowed=false`、0 EvidenceLink、0 PiRun。reload 前后总案卷数、匹配数和结构稳定。见 `c10-d-final-main-api-readback.json`、`c10-d-final-stored-source-hashes.json`、`c10-d-final-verification.json`、`c10-d-reload-ui-confirmation.json` 和 `44-c10-d-reload-material-review.png`。 |
| C10-E Main 安全拒止 | PARTIAL | `review-d4-client.test.ts` 已运行（5 pass、45 assertions）；C10-C 也验证失效 staged 文件由 Main 明确拒绝。目标 SHA 上没有覆盖跨 sender 与已消费 token 重放的专门回归测试；GUI 手动重放子项未执行，也没有绕过 Main 保护。 |
| C10-F 已发布模板兼容 | PASS | GUI 通过已发布模板创建两个独立合成案卷；各自仅一次提交，连续双击未重复建案，重新打开后允许创建第二案。见 `36–39-c10-f-*.png` 和 `c10-f-*` 日志。 |

## 判定依据和未执行项

C10-B-01 首次脚本尝试时创建按钮位于视口外，鼠标坐标落到页面背景并关闭对话框，没有触发 Main；该 harness 定位失败原始截图和事件日志已保留。滚动至按钮可见后按原脚本重测，仍只产生 1 个 form submit。真实 Return 单独通过，但任务书要求的是 Enter+Click 造成两个 submit callback 的特定序列。当前证据无法区分这是归档 CDP 事件构造没有触发 Enter 默认行为，还是该合并序列下另有产品行为；不将其表述为已确认的产品缺陷。

未执行：C10-C pending Main reply 时关闭/重开竞态；C10-E 跨 sender / consumed-token 手动重放；真实 CAS、Provider、在线模型、P06；完整 P2 复验及独立 D2/D3/COMMON 全工作流。无真实用户材料、真实审批、发布动作或模型调用。

依任务书，任一硬断言未满足即为 `C10_GUI_FAIL`。不建议以本轮结果关闭 C10 或解除候选冻结。应先使原 Enter+Click 驱动确实产生两次可信 submit callback，再按原断言重跑；同时为 Main 的跨 sender 和 consumed-token 拒止补足可验证证据。没有擅自修改生产代码。

## 证据导航

- 逐步截图：`evidence/screenshots/`
- 原始 GUI/CDP/入口日志与本机命令输出：`evidence/logs/`
- 去除材料正文后的 Main 读回：`evidence/readback/`
- 环境、固定 SHA 与临时插桩回滚补丁：`evidence/environment/`
- 合成 fixture、驱动与安全事件插桩脚本：`evidence/fixtures/`、`evidence/scripts/`
- 完整 SHA-256 清单：`SHA256SUMS`，清单自身摘要：`SHA256SUMS.sha256`

任务书：[P1-C-C10-R02 本地 GUI 复验任务书](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/fix/d4-p1c-c10-lifecycle-r02/docs/design/review-agent/acceptance/d4-product-loop-r01/P1-C-C10-R02-LOCAL-GUI-RETEST-TASK-20261018.md)；工程记录：[P1-C-C10 R02 Engineering Result](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/fix/d4-p1c-c10-lifecycle-r02/docs/design/review-agent/acceptance/d4-product-loop-r01/P1-C-C10-R02-ENGINEERING-RESULT-20261018.md)。

为避免发布离线演示登录后的账户标识，主页个人资料视图截图 `24`、`40`、`43` 已从证据包剔除；C10-D 的 reload 后界面改由 `44-c10-d-reload-material-review.png` 记录，该图显示重载后仍可见同一案卷及 1 份材料，Main 读回明细保留在上述 JSON。
