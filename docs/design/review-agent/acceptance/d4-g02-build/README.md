# D4｜G02 三套完整业务 Markdown 模块化技术候选

> 固定父代码：`a7a6a11d4840ad64cfc858c17b35f35180adf063`（COMMON-01/02 PR #88）；此目录是 **D4 可读、可编辑、可组合的 D1 作者态及合成技术运行资产**，不是学校官方审批模板。Draft PR #89。不得把源码转换/技术预审等同 E PASS。

## 当前资产与原文版本

| 模板 | 原始业务母版（ChatGPT Library，已独立 SHA256） | 规则 | 实际 local modules | COMMON 条件轴 |
|---|---|---:|---:|---:|
| T01 部门数据共享 | `G02-T01_正式业务模板_MD_v0.1.md` `9d16ba80053266dfee3c89e4fbccf1bbd8b408d58c4189e8f7f12bc0a7b235cb` | 32 | 18 | 4 主动作 + 9 可叠加 |
| T02 部门公共邮箱 | `G02-T02_正式业务模板_MD_v0.1.md` `4494cfd81dfde4af1fdcb127b342ed0452be6a7704fe317a123cbe589fff78bc` | 32 | 15 | 4 主动作 + 6 可叠加 |
| T03 专项网络准入 | `G02-T03_正式业务模板_MD_v0.1.1.md` `e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380` | 36 | 17 | 3 主方向 + 8 可叠加 |

T03 旧版 v0.1 的 E0 固定 SHA 为 `b4b3a859d4d85d322347189d253e0e1a7fe4f6003a2a01a4a0c36ea877fe6040`；此 D4 制作**显式采用后续 v0.1.1**，绝不声称旧 D Gold 或 E 审计对新版已覆盖。

## 实际文件与技术含义

每套模板具备：
- `workspace.json`：**真正符合 `ReviewAuthoringWorkspaceV1` 的 JSON**，独立局部模块@1、模板组合、原 R 条的原文必核说明、非 R 章节原文、SourceBinding 精确 Check、caseScope 和 genericScope。候选无正式发布权。
- `condition-map.json`：把原始 BR 多轴与 COMMON-02 有界主场景、附加条件逐项追溯。非每个原文条件都已机器验证；业务规则正文仍定义触发/例外/阶段。
- `selection.json`：两个互不相同的 `generic-object` 技术审核对象、各自场景、合成来源版本与 `unknown`；不是读申请人 caseFields 推导。
- `case.json`：完全合成、隔离的技术案卷。
- `coverage-ledger.json`：全部 R 原子义务及 F/M/BR/EV/ST/FACT/CL 等可识别稳定 ID、来源行定位、技术 Check/分支关系；字段材料不一刀切变必交。
- `manifest.json`：原文及版本哈希、模块版本、Lock 列表、数量与安全限制。共享 B01/B02 **未盲目复用**：本域数据源授权、账户成员及网络访问是独立业务权限，先采用 local 模块并锁定版本，待跨业务语义和来源真正一致才升级冻结共享资产。

原 C 正文不复制为业务原件文件，也不覆盖 Library 冻结件；实际转换义务和段落文本已绑定至 workspace/coverage，且引用精确文件哈希。对象间 EvidenceLink 必须逐 subject + 文档版本确认，禁止从另一对象继承。

## 真实运行与重现

现有 COMMON 固定代码下，运行：

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun install --frozen-lockfile
bun run typecheck
bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d4-g02-build.test.ts

# 例：T01（T02/T03 更换目录与文件名）
D=docs/design/review-agent/acceptance/d4-g02-build/T01
bun apps/electron/scripts/review-authoring-v1.ts validate "$D/workspace.json"
bun apps/electron/scripts/review-d3-library.ts export "$D/workspace.json" "$PROFER_CONFIG_DIR/bundle.json"
bun apps/electron/scripts/review-d3-library.ts import "$PROFER_CONFIG_DIR/bundle.json" "$PROFER_CONFIG_DIR/imported.json"
bun apps/electron/scripts/review-d2-plan.ts preview "$PROFER_CONFIG_DIR/imported.json" "$D/selection.json" "$D/case.json"
```

`review-d4-g02-build.test.ts` 进一步实际运行 D1 保存/读取、D3 export/import、D2 Preview/register/create、registerMaterial、setEvidenceLink、逐对象反例、Pi prepare/submit/verify。CI 工作流 `.github/workflows/review-d4-g02.yml` 在 GitHub 真实 Ubuntu+Bun 上运行并上传 **D2 计划和 Pi 收据 JSON**，不使用任何真实校内账户和 Gold。

## 不能声明的能力与集成方式

1. 校本 2026 规章和部门权限未完成独立 E 认证。本域 C 规则来源一律 `policy-candidate / applicability=unknown`，不得伪装成已确认校规；技术 Pi 结果应当 `awaiting-confirmation`。
2. COMMON-02 只提供有限场景互斥、叠加及 per-Subject 三值判定；T01 复杂数据源批准、T02 邮箱生命周期、T03 VPN/堡垒机两级真实权利链，以及法律等价证据的高级图关系仍需可信学校来源/有权人，不能用 synthetic case 条件证明。
3. 原文 F/M/EV/阶段已纳入完整 Markdown 检查合同及 ledger，但结构化校务阶段、真实政策权威、OA/邮件目录/VPN 系统状态**未实现正式集成**；此等责任按 `POLICY_HOLD` / `EXTERNAL` / `HUMAN_ONLY` 保留，不删除。
4. 独立 D/E Gold、在线 LLM 真实漏检率、正式批准和行政发放全部 **NOT_RUN/NOT_AUTHORIZED**。不修改冻结 A/B/C/D/E。
5. 只允许在统一集成负责人明确接受冻结源码和技术结果后转下一轮，不在此 PR 合并 COMMON、创建官方模板或宣布 D5 准入。

**报告状态由真实 Actions 结论决定。** 历史首次 G02 专项 CI #39050473411 的 D1/D3/D2 部分为绿、Pi case-scope 回执目标集合错误导致 10/13 测试通过；随后已按真实 `ruleTargets` 契约修订 G02 测试而未修改公共引擎。复验必须读取**最新 HEAD** 的工作流结果；不得沿用旧运行冒充完成。
