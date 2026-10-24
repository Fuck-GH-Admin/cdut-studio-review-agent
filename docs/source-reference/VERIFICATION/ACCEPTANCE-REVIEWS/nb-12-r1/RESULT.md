# nb-12-r1 独立复验结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-12-r1`（revisionOf `nb-12`，T3，18 文件 / 3115 行）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 交付：`deliveries/nb-12-r1/`（sealId `seal-fbee6a4c41d0ee4d`，`seal_delivery.py/1` / SEAL-DELIVERY **v2**）
- 父版本：`deliveries/nb-12/`（sealId `seal-3db5201ebe999d67`，**未改动**，保留）
- 复验时间：2026-10-23T22:05:00Z
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
- **字节差异核**：与父批逐篇比对，**仅 2 篇字节不同**（恰为 F-01/F-02 两篇），其余 16 篇与父批 accepted **逐字节相同**——符合「已 seal 不改」。
- ZIP `R07-nb-12-r1-05fb2565.zip` = `d69d884f047a271984aba9427b5012a57519dccea5c04cd4651d9fd036aeee71`（71052 B / 21 条目，v2 布局不含 READY/DONE）；逐条目 0 mismatch、无穿越/符号链接、mtime 全 1980-01-01；哈希链自绑。

## G1/G2：F-01 / F-02 修复复验

### F-01 `review-v3-f18-school-profile.ts.md` — resolved

- 修复后摘要「**3 个接口 + 1 个类型 + 3 个函数 = 7 个导出**」= 源码 `:7,17,32,59,60,70,92`（3 接口 + `MappedField` type + 3 函数）= 手册自身 7 行表格，**三方一致**。
- before `6234739a0d63…` → after `09a8d754a303…`（QA 实算一致）。

### F-02 `review-v3-t03-fact-workflow.ts.md` — resolved

- 修复后摘要「**4 个接口 + 6 个函数 = 10 个导出**」= 源码 10 个 export（`:8,18,31,58,91,154,192,205,232,239`）。表末 `T03RecheckImpact`/`planT03Recheck` 合并行作为排版保留，**计数已正**。
- before `87dcac908cea…` → after `d4fbde4b72c7…`（QA 实算一致）。

`changes.diff` 仅含该 2 篇，未引入新声明。

## exact acceptedHashes（18）

见 `REVIEWED-HASHES.json.acceptedHashes`。**16 篇 hash 与父批 accepted 相同**（字节未变，按 QUALITY-GATES「子批字节未变仍需子批 QA 记录同一 hash」），2 篇为 r1 新 hash。`rejectedHashes` 为空。

## 边界

未运行产品测试/typecheck/build/GUI/真实模型（NOT_RUN）；未改源码、作者正文、candidate、全局总账；父批交付字节未动；未 commit/push。
