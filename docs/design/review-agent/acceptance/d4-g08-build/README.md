# D4 G08 真实模块化技术候选

固定COMMON父提交：`a7a6a11d4840ad64cfc858c17b35f35180adf063`（Draft PR #88）。本目录提供两套完整来源对应的 `ReviewAuthoringWorkspaceV1`，各有局部模块、逐实例 `genericScope`、原文责任索引、业务字段/材料/阶段原文合同、双对象合成案例、逐模板Manifest。没有接触隐藏Gold、真实学生记录或学校内部系统。

- G08-T02 源母版 SHA256 `7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418`，R-01~R-51，6条额外跨规则不变量。
- G08-T03 选择**作者修订新候选 v0.1.1-R31-r01** SHA256 `f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec`，52规则和7条非规则不变量；旧版SHA `53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af` 留存，**不与旧 R31 混用**。新版仅适用于山东平台首轮“一般/不满意+继续”建议，成都理工是否有此能力仍未知。

- `workspace.json` D1/D3 作者态与 G08 本地语义模块；`source-catalog.json` 原文每条责任定位及技术check映射；`conversion-ledger.json` 初始转换账本（实测后另以测试/CI证据标记）；`business-contract.json` 保存完整字段/材料槽/EV/分支/输出等关键原文结构；`synthetic-selection.json` 与 `synthetic-case.json` 供 COMMON-01/02 真实D2运行。
- 没有直接复用 synthetic B01/B02，因为其测试语义不构成正式失物代理或投诉旧单授权；模块属于 workspace-local，`sharedModuleLocks:[]` 是显式结果，未来验证复用必须冻结新版本。

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
ROOT=docs/design/review-agent/acceptance/d4-g08-build
for t in g08-t02 g08-t03; do
 bun apps/electron/scripts/review-authoring-v1.ts validate "$ROOT/$t/workspace.json"
 bun apps/electron/scripts/review-d3-library.ts export "$ROOT/$t/workspace.json" "$PROFER_CONFIG_DIR/$t.bundle.json"
 bun apps/electron/scripts/review-d3-library.ts import "$PROFER_CONFIG_DIR/$t.bundle.json" "$PROFER_CONFIG_DIR/$t.imported.json"
 bun apps/electron/scripts/review-d2-plan.ts preview "$PROFER_CONFIG_DIR/$t.imported.json" "$ROOT/$t/synthetic-selection.json" "$ROOT/$t/synthetic-case.json"
done
```

**技术边界**：未知条件仅待核；申请人材料和模型推测不是权威后台证据；生成合成Pi pending回执不表示103条真实业务判对或学校允许自动放货、受理、续办、办结。检验结果必须见同HEAD的实际测试/CI，未测不可写PASS。
