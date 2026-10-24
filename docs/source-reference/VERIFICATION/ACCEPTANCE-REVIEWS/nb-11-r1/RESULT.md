# nb-11-r1 独立复验结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-11-r1`（revisionOf `nb-11`，T3，18 文件 / 3345 行）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 交付：`deliveries/nb-11-r1/`（sealId `seal-6fb9b3e1b81b4b6a`，`seal_delivery.py/1` / SEAL-DELIVERY **v2**）
- 父版本：`deliveries/nb-11/`（sealId `seal-bf9c915eb30296f4`，**未改动**，保留）
- 复验时间：2026-10-23T21:40:00Z
- **NOT_RUN**：产品测试 / typecheck / build / Electron-GUI / 真实模型 / 并发与故障注入

## 总判定

| 门 | 结论 |
| --- | --- |
| G0 完整性 | **PASS** |
| G1 结构与可读性 | **PASS** |
| G2 源码真实性 | **PASS** |
| 批次判定 | **accepted**（18 accepted / 0 revision_required / 0 unknown） |

## G0

- 18/18 源绑定与父批**逐字段一致**（源未变）；18/18 manualSha256 = stage = READY.`manualHashes`。
- **字节差异核**：与父批逐篇比对，**仅 1 篇字节不同**（`review-v3-main-sdk-turn-bridge.ts.md`），其余 17 篇与父批 accepted **逐字节相同**——符合「已 seal 不改」。
- ZIP `R07-nb-11-r1-05fb2565.zip` = `b6240d515d7013b438e68cb7f6eeacca1b3e4d8924b1499e02f56dc2f5a258b1`（79249 B / 21 条目，v2 布局不含 READY/DONE）；逐条目 0 mismatch、无穿越/符号链接、mtime 全 1980-01-01；哈希链自绑。

## G1/G2：F-01 修复复验

- **claim**（父批 blocking）：§2 摘要「3 个 type + 1 个接口 + 1 个类 = 5 个导出」与自身表格 6 行自相矛盾。
- **复验**：修复后摘要「**4 个 type + 1 个接口 + 1 个类 = 6 个导出**（函数/常量 0）」，与源码 `review-v3-main-sdk-turn-bridge.ts:29,33,36,48,59,65`（4 type + 1 interface + 1 class）**及手册自身 6 行表格三方一致**。
- before `540fea934ec6…` → after `411b789707e0…`；`changes.diff` 仅含该篇，未引入新声明。
- **F-01 = resolved**。

## 残留非阻断（2 条，≤2 不阻断）

| # | 手册 | claim | 实际 | 状态 |
| --- | --- | --- | --- | --- |
| N-01 | `review-v3-main-template-run.ts.md` §4 | `latestTemplateRuleRun` 全树 grep 0 命中 | 1 命中（自身定义 `:171`）；实质结论「无调用者」成立 | r1 未改，仍开 |
| N-02 | `review-v3-main-native-removal-observer.test.ts.md` §2/§5 | 用例 5 行号 `:82` | `:81` | r1 未改，仍开 |

## exact acceptedHashes（18）

见 `REVIEWED-HASHES.json.acceptedHashes`。其中 **17 篇 hash 与父批 accepted 相同**（字节未变，按 QUALITY-GATES「子批字节未变仍需子批 QA 记录同一 hash」），1 篇（sdk-turn-bridge）为 r1 新 hash。`rejectedHashes` 为空。

## 边界

未运行产品测试/typecheck/build/GUI/真实模型（NOT_RUN）；未改源码、作者正文、candidate、全局总账；父批交付字节未动；未 commit/push。
