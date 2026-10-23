# 06｜正反例验证、证据门禁及未运行说明

> **本轮结果：SOURCE/TEST STATIC INSPECTION；TESTS_NOT_RUN_THIS_ROUND。** GitHub 远端已能读取固定 SHA 文件，但当前执行容器不能对 github.com DNS 解析、无法取得可执行完整 Git 树，故**未建立本地 Git worktree，未重跑单测、Electron GUI、Office 真实文件、OCR、Provider、Gold 或学校系统**。在独立远端 docs-only 审计分支提交不等于本地 worktree 验收。第一轮未补齐的 merge-base/cherry/patch-id 仍 UNKNOWN。不能写“独立回归 PASS”。

## 一、已有源码测试与历史边界

| 能力/文件 | 实际测试断言（通过源码静态核对） | 本轮状态与缺证 |
| --- | --- | --- |
| D3 freeze/digest/upgrade | [review-d3-module-library.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-module-library.test.ts) 有重复冻结幂等、缺依赖、digest 篡改、重算 bundle 仍 mismatch、删除责任未经 ACK 原子拒止、隔离配置下导入/导出/CLI | 存在可执行断言；**未执行**；循环依赖实际构造及多模块深链需集中负例 |
| COMMON unknown/Subject | [review-d4-common.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-common.test.ts) 测试同案多对象独立 Check、unknown 不允许提交 compliant、来源对错对象/版本拒止、缺条件和错 primary 失败 | 静态有拒止用例，未证实多 Subject 实际 GUI/Provider；跨分支同 Check 去重语义待测 |
| D4 统一目录 | [review-d4-unified.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-unified.test.ts) 50 D1 校验、50 D3 携包，D2 个数**大于等于45**，candidate shell 50 可见且不可发布、错 sourceversion 失败 | 非 50 项业务验收或50独立 Gold；本轮未重跑 |
| ZIP/文件 | [review-d4-batch-staging.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-batch-staging.test.ts) 测试普通/嵌套目录、ZIP safe name、symlink、同 SHA 去重、坏 ZIP 隔离与101份显式跳过 | 本轮未执行；需异常 ZIP/大小谎报/Windows 真平台及并发失败 |
| 临时 Owner | [review-d4-intake-token.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-intake-token.test.ts) 对 forgery、跨 owner、in-flight 复用、consumed replay、cancel 作负例 | 本轮未执行；窗口销毁/返回迟到/20分钟 TTL/等长替换 TOCTOU 应补 |
| Office #71 | [document-parse-tools.office71.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/document-parse-tools.office71.test.ts) 分离同名不同物理源、同字节异路径、源文件改版、格式同 stem 与 legacy index；其说明**不是实际 OOXML ZIP 解析测试** | 在 P06 R03 固定树可见；D4 W1 真实新文件输入路径上尚缺端到端证据 |
| Office→V2 SourceRef | [review-office-v2-sourceref-boundary.l02.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-office-v2-sourceref-boundary.l02.test.ts) 非本案 documentVersion/block/quote 和普通 Office anchor/fN 无法冒充正式 SourceRef | 本轮未运行；需真实 DOCX/XLSX/PDF 跨案测试、阅后换源 |
| 来源阅读覆盖 | [document-capability-library.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/document-capability-library.ts) 的 `isFullyRead`、`readRanges` 和 `markImageRead` 直接表现为 parsed/partial 与块已读逻辑；[coverage-ledger.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/coverage-ledger.test.ts) 可定位 | 真实 OCR/多页扫描/视觉 Provider 无独立覆盖证据 |

远端历史 CI/PR 已报告部分 success，但验证语义必须细分：**运行状态观察 ≠ 本轮本机测试 ≠ 真实 GUI ≠ 模型准确率 ≠ 校务授权**。全部 Gold ACL 未读取，禁止用测试构造材料去反推隐藏期望值。

## 二、集中测试矩阵（留给独立本地 Agent）

| ID | 输入条件和反例 | 应观察到的拒止/状态 | 需要的环境和最小证据 | 当前证明 |
| --- | --- | --- | --- | --- |
| TB-01 | 篡改 frozen module digest，同 ID 同版重写 | `D3_FROZEN_CONFLICT/D3_LOCK_DIGEST`，原件不变 | D3 store 独立 temp config、原文 digest/返回码 | 测试代码已见，未跑 |
| TB-02 | 缺依赖/依赖摘要不符/跨层循环 | `D3_DEPENDENCY_MISSING/DIGEST/CYCLE`，不部分导入 | deep module fixtures、无污染临时目录 | 部分测试已有，循环要补 |
| TB-03 | 升版删除一条 Check 而不 ACK | `D3_UPGRADE_REMOVAL_NOT_ACKNOWLEDGED`，旧 revision 与 Run 未变 | 原旧新 Check 集合、sourceBindings diff、持久快照 | 作者侧断言有，旧 Run 影响未测 |
| TB-04 | primary 未定、复合条件缺项/unknown、来源 policy 候选 | 保留 unknown Check；禁止 compliant/pass，不认定政策有效 | Plan JSON + provenance + submit receipt | COMMON 测试部分存在 |
| TB-05 | 两 Subject 同证据、假 supportsFact 或 wrong `sourceRef` | 不允许跨 Subject 引用自动覆盖；具体拒绝码 | CaseV2 同案两个对象、EvidenceLinks、Run | COMMON 静态有 |
| TB-06 | A 案 `docVersionId`/B 案相同文件名、伪 block/旧 parseRevision | 只承认本案当前真实 block / quote；普通 Office fN 不可作为 SourceRef | 两案、Office 物化/真实 DOCX XLSX PDF 原件、索引及拒收日志 | Office 边界代码有，真实多格式未跑 |
| TB-07 | ZIP `../`、absolute、backslash、符号链接，文件大小宣称与实际不一致 | skip/reject，根目录外没有写入，不误导已有文件 hash | 临时 ZIP 和 OS 构造、输出完整 skip 清单 | 部分静态测试有，大小攻击未完整 |
| TB-08 | stage 期间同名/等长内容替换，owner 互抢、 token 重播 | 原件 hash 与最终导入内容一致，否则显式拒绝/需重新选择 | Main native picker + temp 层、多窗口、原件原始 hash | owner/replay 有断言，等长替换未跑 |
| TB-09 | append/replace 与 retry 的归档中断，原件已替换 | 旧 SourceRef/CheckRun/Outcome 必须标 stale，新版未审不得沿用“合格” | 真实原件新旧 hash、revision、事件/ledger 前后 | 原件 retry/hash 代码有，跨事务未证明 |
| TB-10 | 多份文件分别命中 G03 与 G08，另混无法识别文件 | `multiple-tasks` 禁止自动建案；单候选也需人工确认 | staged previews、实际建案数量 | 路由源码支持，GUI未跑 |
| TB-11 | 模板原文有未编译 BR/非 R 职责却 JSON validate PASS | `conversion-ledger` 明确未实现，不能签业务完整；无 Gold 访问不得写 PASS | source catalog、原文 anchor、D2 mapping、独立评审结果 | MD-Q1 历史负例存在，不是 50 份全检 |
| TB-12 | P06 轮次撤权、`await` 后返回视觉页，跨案原件路径 | 禁止旧 session/run/assignment 记录新回执，绝不允许任意路径 | Main Pi strict-tool + controlled delayed preview | 源码后置 recheck 存在；本轮 Provider 未验 |
| TB-13 | Scan-only PDF、Word 内截图、Excel 未计算公式 | `partial`/视觉部分覆盖/警告，而非全读与自动符合 | 实样脱敏、多图、页数/表格/公式真实定位 | 原解析设计与单样例 Docling 报告；未跑 |
| TB-14 | 0 个有效 Check、1/2 遗漏提交、文档未读，完成标志 | `not-executed/pending/partial`，不产生完整审核成功 | 固定 Plan/Run、coverage both ledgers、结构化 Submit | 历史回归存在，本轮未运行 |
| TB-15 | 中断批量执行与 import batch 混淆 | import checkpoint 不可冒充审核 Run；不同批 Run 不能复用旧证据 | 两批次、同案跨 Run、原子恢复日志 | 2B 源码分层证据有，2C/P06 实测待核 |

## 三、实验成果能继承什么，不该夸大什么

- [13-single-agent-framework-trial.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/13-single-agent-framework-trial.md) 的受控小样本：Pi 6 次和 Deep Agents 6 次、二者事实/证据点在测试集合中一致；Deep Agents 比 Pi 多约 21.3% token（总 61,479 vs 50,699），不支持“换框架即降成本”。沿用 Pi 单主 Agent、按需分块、短工具结果、真实长文证据恢复值得继续验证。
- Docling：对 DOCX 结构图表、PDF 页坐标有额外价值；原生 PDF/Office 转换成功不表示 OCR 成功，扫描证书 PDF 文本仍为 0。Excel 数据缓存不能当作公式计算证明。作为**按需、可配置的解析层**保留实验，不默认替换当前解析。
- 单份扫描证书视觉读取 5/5 字段在那个样本与人工一致，是“链路可用”证据，**不是识别准确率或批量覆盖率**。视觉预览能看见内容，不能自动产生精确文字 SourceRef。
- [32-md-to-modular-template-agent-quality-protocol.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/docs/design/review-agent/32-md-to-modular-template-agent-quality-protocol.md) 的 MD-Q1 漏 R08/R33 是独立负例；`review-d3-md-coverage.py` 检查目录覆盖，`gate=PASS` 也不宣称业务语义无损。应在 50 模板独立原文责任样本中扩展，不得读/泄露限制 Gold。

## 四、执行顺序与验收权责

**第一道：**离线 deterministic（D1/D2/D3/COMMON、bad digest、stale source、ZIP、owner）。**第二道：**真实 Electron GUI+Native picker/drag/drop/窗口重复点击/Office71，独立保存版本、hash、artifact/receipt。**第三道：**真实解析/多模态 Provider，逐次记录 model/transport/tool receipt，区分 `partial` 和完成。**第四道：**领域原文义务独立验收及有效政策/责任主体确认，隐藏 Gold 与实现 Agent 隔离。**第五道：**学校 API、身份/签署人、审批与状态最终决定才准正式发布。

任何一道阻断，要写 `BLOCKED_INPUT` 或 `NOT_RUN`，不可让 CI success 或合成 pending-only 替代后一道签署。记录 SHA/原件摘要/首个失败/复现/工具权限/案卷+SourceRef/Check分母/实测环境，严禁把敏感原件、Gold、任意路径明文推入公共 PR。
