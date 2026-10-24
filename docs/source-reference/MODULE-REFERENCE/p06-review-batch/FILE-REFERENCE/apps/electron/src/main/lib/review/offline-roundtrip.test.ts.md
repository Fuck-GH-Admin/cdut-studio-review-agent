---
path: apps/electron/src/main/lib/review/offline-roundtrip.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a9fb2e4d0c059cf77ea1f3871a335552d84b099
sha256: b15ae2205b50b800165d0c1299db2943742e6745e0940db58f4056aaad583eb6
lines: 119
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/offline-roundtrip.test.ts

## 1. 测试目标

N6 单测（文件头 `:1-3`，U12/R12）：角色投影不泄漏、独立副本往返、重复包去重。被测：`offline-roundtrip.{projectForRole,exportRoundTripPackage,importRoundTripPackage,anonymizeName,buildPublicReport}`。夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/profer-test-rt-<时间戳>`（`:13-15`）；聚合含 `studentName/internalMemo`（public/internal）+ subject `declaredScore/internalFlag` + 一条 `waived` 处置（内部豁免理由）。本轮 `NOT_RUN`。

## 2. 用例清单

4 describe、**11 test**：

### 2.1 角色投影（R12，3，`:26-45`）
1. `:27-33` student：`studentName==='张三'`、`internalMemo`/`internalFlag` undefined、`internalNotes` undefined。
2. `:35-39` 未声明可见性的 `ghostNewField` 默认 internal 不泄漏（undefined）。
3. `:41-44` organizer：`internalNotes` 含“内部豁免理由”。

### 2.2 独立副本往返（G07/G08，3，`:47-77`）
4. `:48-63` 学生补件回复：导出→导入 `accepted`（`responses` 1 条、`status:'responded'`——事务真实落盘）；重复导入 `duplicate`（message 含“不重复计票”）且 responses 仍 1。
5. `:65-69` 缺补件目标 → `rejected`（不冒充已应用）。
6. `:71-76` 篡改 reply（“被改”）→ `rejected`（哈希校验）。

### 2.3 公开报告投影（G09，3，`:79-104`）
7. `:88-93` student 报告：含“符合规定”、**不含“处分记录”**、含“内部审核意见不在公开版本”。
8. `:95-99` judge 报告：不含“张三”、匹配 `/学员#[0-9a-f]{6}/`。
9. `:101-103` `anonymizeName('张三')` 两次相等（稳定映射）。

### 2.4 投影共用策略（复查 §5.6，2，`:106-119`）
10. `:107-112` student 的决定 `reason===''`（内部调查细节不公开）、`result` 保留。
11. `:114-118` judge 带 ratings：`ownRating` 来自 `ratings`（`toMatchObject({scores:{d1:4}})`）而非 dispositions。

## 3. 真实断言

- #4 是真实聚合事务（`createAggregate`+`submitCommand` 种子补件+导入落盘），断言 `responses` 计数证明“事务落盘/不重复计票”双语义。
- #7/#8 用 `not.toContain` 断言泄漏面（内部意见/实名）。
- #11 断言 ownRating 数据源（ratings 而非 dispositions，复查 §5.6）。

## 4. 未覆盖与脆弱点

**未覆盖**：`judge-rating-reply` 往返（`castRating` 路径）；`importRoundTripPackage` 载荷漂移分支（outbox replyHash）；`applyRoundTripPackage` HASH_MISMATCH 直拒；`exportRoundTripPackage` judge 视角导出。

**脆弱点**：`as typeof aggregate` 强转扩展 ratings/decisions；`emptyAggregate` 夹具依赖 case-store-v2 导出；文案断言（“不重复计票”“内部审核意见不在公开版本”）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 describe、11 test、真实事务 | 已证实 | `:26/:47/:79/:106`；`grep -c test(`=11 |
| 未知字段默认 internal | 已证实 | `:35-39` |
| 往返事务落盘+持久去重 | 已证实 | `:48-63` |
| 无目标/篡改拒绝 | 已证实 | `:65-76` |
| 公开报告不泄内部/实名 | 已证实 | `:88-99` |
| 决定 reason 清空/ownRating 数据源 | 已证实 | `:107-118` |
| judge 往返/漂移分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `projectForRole` 学生/organizer/judge | #1-#3/#10/#11 | 多处 | covered |
| `importRoundTripPackage` 学生链+去重 | #4 | `:48-63` | covered |
| 无目标/篡改拒绝 | #5/#6 | `:65-76` | covered |
| `buildPublicReport`/`anonymizeName` | #7-#9 | `:88-103` | covered |
| judge 往返/漂移/HASH_MISMATCH | — | — | unknown |
