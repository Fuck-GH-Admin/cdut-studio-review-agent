# 独立金标 → Agent A 真实 D2 Check 绑定指引（统一验收者专用）

**禁止提前绑定**：本 PR 只使用原 MD 的 Rxx/Bxx/Sxx/Exx/Pxx；`independent-oracle.json.requirements[*].requiredCheckIds=[]` 是故意保持独立，不是说不需真实 Check。任何 Agent A 的原始 JSON、模块名称、Check ID、Run ID 只能在双方完成后由第三方读。

## 适配数据

统一验收者建立独立的 **adapter map**，每条关系至少有：`sourceDutyId`、`authorLedgerDisposition`、`templateId`、`workspaceId`、`templateVersion`、`planFingerprint`、`checkIds[]`、`subjectIds[]`、`compiledRuleIds[]`、`sourceIds[]`、`authority`、`runRefs[]`、`gapId`、`evidenceWhy`。确保这些值都是读取真实产物所得，而非由金标猜测。

### 具体映射顺序

1. **源锚点**：校验原 SHA 与 source-catalog 103 条；以 Rxx 等为事实责任键。
2. **作者声明**：逐条读取 ledger，包括未制作、待政策、manual-only、tooling-blocked；未列出的义务判漏项，不能默认不适用。
3. **真实 D2**：读取 `plan.mapping`/`rules`/`subjects`/`fingerprint`，以真实 `checkId` 与 `subjectId` 做双向核对。引用同一共享模块只能算复用，不是不同责任都真正做了检查。
4. **可观察性**：R08 与 R09/R10、R21–R25、R32 与 R33 必须能分别得到事实/状态；两个职责可共享实现节点但不可丢独立结论。比较作者方案是否满足业务合同，不要求固定模块 ID。
5. **权限来源**：核对 `sourceIds` 及 SourceBinding 的学校/时间/角色/操作范围和权威级别；学校未确认的规则不得编成可信现行校规。
6. **用例运行**：只给模型 `tests/cases/archive-cases.json` 中单个合成案；模型回执写在验收者独立运行目录，后用 `tests/expected` 评分。记录真实 Case/Run/SourceRef、日志和手工复核结果。
7. **回填验证**：在第三方输出中对 `gold.requiredCheckIds / checkSubjects / checkSourceIds / checkRuleTerms` 填入已核实实际值；**不要更改这份独立 gold 的原始基线**。允许另存生成的 `adapted-independent-gold.json`。

## 对已有质量门禁脚本的使用

固定基线中 **已存在** `apps/electron/scripts/review-d3-md-coverage.py`。因此 Agent B 不重复创建/覆盖该公共文件。它要求 `--source --catalog --ledger --gold --plan`，可附 `--gaps`。该脚本的 `full` 模式会检查 Rxx 覆盖、非表格锚点及 compiled Check 关联；它不能证明文本业务语义等价。由于本 gold 是 103 责任全量，适配 ledger 要对 103 条逐项写明状态；B/S/E/P 的 `condition/slot/exception/invariant` 可以归入适当的实现映射或具名非-Check 去向，**不可为讨好门禁而伪造 Check**。必要时独立对照报告先分别给 Rxx 可执行性和 B/S/E/P 不变量覆盖；适配层允许表达方式差异，不改变原文义务。

示意命令（仅在双方完成且拿到真实 D2 后运行）：

```bash
python3 apps/electron/scripts/review-d3-md-coverage.py \
  --source /PRIVATE/PATH/g01_archive_utilization_template_editor_spec_v1_5.md \
  --catalog docs/design/review-agent/acceptance/d3-md-full/agent-oracle/source-catalog.json \
  --ledger /PRIVATE/third-party/adapted-conversion-ledger.json \
  --gold /PRIVATE/third-party/adapted-independent-gold.json \
  --plan /PRIVATE/third-party/actual-d2-preview.json \
  --gaps /PRIVATE/third-party/gaps.json \
  --output /PRIVATE/third-party/coverage-report.json
```

**不能从门禁 PASS 推出 Pi 已读材料、在线模型准确率、有效现行校规或档案馆批准**；所有 Run/Case/SourceRef 必须逐项人工核实。反过来，工具拒止高级关系是有效安全结果，但义务仍 TOOLING-BLOCKED。
