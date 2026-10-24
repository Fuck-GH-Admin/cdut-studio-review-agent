# NB-100-r1 独立复验报告 — batchVerdict: accepted（17/17）

- `nb-100-r1`（revisionOf nb-100，sealId `seal-67f861f96e6ac0b4`，sealedAtUtc 2026-10-23T23:15:11Z）；frozenSha `05fb2565…37c2`。
- **G0 PASS**：链一致、ZIP 20 条目逐字节、before/ 16 篇==父版（seal-37ffd93b）、changes.diff 重放 16/16；`settings/primitives/index.ts.md` 逐字节保留（61be3efd…）。
- **G2 PASS**：`reviews/nb-100-codex-r1` 的 **12 revision_required + 4 minor 全部关闭**（16 篇定点修订逐条对源独立复验；1 篇 barrel 继承）。
- 独立回源抽验 20+ 关键声明全吻合（events 零 try/catch、isovalue 非负 max(abs)×0.6、track-changes acceptAll 非对称+命令 380/431/474/506/546/559、vibrational 唯一直接消费者 CsLabMolstarViewer、canvas 自 setTransform(:118)、capability/tool-utils/capsule/molstar AST 范围、TOOL_ICONS 58 键、extractFilePath nullish 后置类型检、PeakFit busy 仅按钮禁用等）。
- 17 accepted；`acceptedHashes` 17 个 exact manualSha256。NOT_RUN；哈希脚本生成；未改作者手册/产品。

## 下一步
lead 按 `reviews/nb-100-r1/REVIEWED-HASHES.json` 合入；**nb-80-r2**（NB80R1-F-01 限引用）seal 后另行复验。
