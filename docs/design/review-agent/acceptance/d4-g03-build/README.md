# G03 D4｜十套完整业务模块化候选

本目录是 **实际工程候选产物**（COMMON-01/02 固定代码 `a7a6a11d4840ad64cfc858c17b35f35180adf063`），不是再次适配检查、C 原文修订或校方批准。

- `catalog.json`：十份 C v0.1 原始 Markdown 的唯一版本与 SHA、原文 277 条 R 的模块分组、每对象主条件与叠加条件。历史 T04/T05 只在 T03 中保留，不另建模板。
- `g03-tXX/workspace.json`：实生成的 `ReviewAuthoringWorkspaceV1`、本地模块（显式 version=1）、Use 组合、每条 Check 的 sourceBindings、条件轴。共享 B01/B02 未复用，因为其合成示例不等于 G03 所需学校行政授权；不是缺少模块版本锁（`sharedModuleLocks: []` 明确记录无冻结依赖）。
- `g03-tXX/selection.json`：两个合成对象，`generic-object`，不同 main 场景，按对象全部声明条件（包含 `unknown`）。
- `g03-tXX/case.json`：独立合成 D2 案卷入口。
- `g03-tXX/coverage.json`：全部原始 R 规则和非 R 的 §1–18 原文章节，以模块/Check/sourceId 反向定位，并逐节索引 F/M/MS/EV/EG/BR/AX/ST/CFG。非 R 原文以实际正文分块加入作者态，**不是仅记录标题**。各层完成/测试状态分开核实。
- `g03-tXX/manifest.json`：单套稳定来源与技术版本及产物计数。
- `generate.cjs`、`rebuild.cjs`：确定性转换器及离线重建入口；原文件必须从用户 Library/原制作包读取，原字节 SHA 不符直接拒止，不写原业务文本或隐藏 Gold 到公共仓库。

## 独立复建（需要原始私有 C 文件）
```bash
node docs/design/review-agent/acceptance/d4-g03-build/rebuild.cjs /path/to/G03-original-md /tmp/G03-generated
```
该命令仅对十份业务母版做源字节验证，不会读取 D Gold、改变校方业务事实或自动赋予任何政策权威。

## 真实公共接口集成测试
```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
export D4_G03_OUTPUT_DIR="$(mktemp -d)"
bun test --isolate --timeout 120000 apps/electron/src/main/lib/review/review-d4-g03-modular.test.ts
```
测试包含：十套 D1 validate、D3 export/import、逐对象 D2 Plan、来源及未知分支拒止，以及十次合成材料注册、精确 EvidenceLink、Pi 服务端 pending-only 检查回执、verifyD2PiRun。输出运行事实到 `D4_G03_OUTPUT_DIR/<templateId>/`，日志打印 Plan/Run 指纹以供 CI 归档。以上命令的存在不等于已经执行成功，状态以该提交 CI/实际结果为准。

## 安全和未完成边界
十套 C 母版状态均为 `BUSINESS_MD_DRAFT_WITH_GAPS`。逐资源/设备/成员与条件/对象的**结构编译正确性**和**真实校方行政权限**属于不同问题；2026 当期 OA、场馆/设备台账、政策原文与审批事件缺失时，一律 `POLICY_HOLD` / `HUMAN_ONLY`，不让 Pi 输出正式“批准使用”。T06 原 E 旧 Gold 独立性失效问题保持 E 专线处理，本任务绝不改 Gold。

**材料阶段映射守门**：原文中的申请人材料、机主/场馆管理者审批记录、发生时点和合法替代均完整保留在相应 R 与章节责任正文；但具体校本审批阶段尚未与 D2 `CaseStage` 取得可核实的一一对应。因此本轮 **不额外编造 `gate.material` 的到期阶段**，只使用 COMMON 已支持的逐对象证据隔离、固定来源版本和三态适用性保护。各模板 `POLICY_HOLD`，需校方权威资料及独立复核后才能逐条配置真实材料阶段门禁。这样避免因错误的时间映射制造提前缺件或错误准用。\n\n特别注意：COMMON 对每对象只提供一个结构化 primary 情景加有限 additive 条件。原文还存在其它独立互斥轴（如 T10 载体、点位及动作、T11 屏幕主管与播放模型、T02 房间主管与会议性质），完整的 §4 原文已被完整保存在语义责任中，但**并非全部额外互斥维度都已程序化验证**；该限制必须在模板集成状态中单独揭示，不应宣称所有自然语言条件已经获得机器强校验。
