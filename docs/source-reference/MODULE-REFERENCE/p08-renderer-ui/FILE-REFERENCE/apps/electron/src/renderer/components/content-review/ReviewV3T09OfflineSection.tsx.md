---
path: apps/electron/src/renderer/components/content-review/ReviewV3T09OfflineSection.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73715987649db3f51c8b38bb06a3a4329189e72c
sha256: d20da93454ad02b0bb405a8822ab5bedd520c168184191cbc1d1f25ff1091ace
lines: 266
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T09OfflineSection.tsx

## 1. 结论与边界

**T09 离线任务包入口（Local-L04 桥接 UI 层）**（`:1-10`）：三件事全经 Main——签发学生应答包（真实案卷生成落盘）/下载离线 HTML 表单/回件预览校验后导入（**附件先登记原件再答复补件** `:7`）。身份红线：**包内 recipient 是声明，不是登录身份，也不因此获得校方权限**（`:9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T09OfflineSection` | function（export） | `:33-266` | 签发/回件导入面板 |

内部：`downloadOfflineFile`（`:22-31`）、`loadJudgeChoices`（`:73-103`）、`issue/issueJudge`（`:105-129`）、`doPreview/doImport`（`:131-177`）、`readReplyFile`（`:142-159`）。

## 3. 内部逻辑与关键流程

1. 学生包（`:184-205`）：选未关闭补件（open/insufficient `:48-51`）+recipientId→`issueT09StudentPackage`。
2. 评委包（`:207-229`）：`loadJudgeChoices` 从 Main 真实批次/当前轮次读分配（**未定稿轮次才可用** `:88`；序列号防陈旧 `:75/:93`）→`issueT09JudgePackage`（匿名评委）；「票据按现有 T07 修订号写入」（`:229`）。
3. 回件（`:244-253`）：`.cdutreply/.json`+80MB 限（`:146-147`）+**type==='reply' 校验**（`:150-151`）；预览校验→导入 `importT09Package`（**幂等 duplicate 提示** `:167`）；未过校验**不写任何业务状态**（`:172`）。
4. **OFF-16 切案清空**（`:59-71`）：清包/回件/预览，防前案任务误导（Main caseId 校验兜底 `:60`）。

## 4. 调用者与调用链

入向：T09 区。出向：`./V2CasePanel`/`review-v3-t09-offline-form`、`window.reviewAPI` 6 接口、sonner。

## 5. 数据 I/O、读写与副作用

写：任务包签发/回件导入（Main）；下载 HTML；读文件。

## 6. 分支、失败、取消与恢复

校验失败→message；busy 防重；lookupGeneration 竞态防护。不适用取消/恢复。

## 7. 权限与权威状态

红线：recipient=声明非身份（`:9`）；导入经 Main 校验；未过校验零写入（`:172`）。

## 8. 修改影响面

改面板 → 离线任务包签发/回件链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T09OfflineSection` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+5 内部+三链 | 已证实 | 逐行读 `:1-266` |
| Main 签发/导入实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+三链 | §2/§3 | `:33-266` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
