---
path: apps/electron/src/renderer/components/content-review/review-actions-controller.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 64f8a7efcdd429509bf3801b080fb2c52720daac
sha256: ef88d8d23f868e8abac101e3efcc8098e4592588022961d438fc62ee01b0f473
lines: 1055
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-actions-controller.test.ts

## 1. 测试目标

**review-actions-controller（M0/H05 并发与按案写入）**（`apps/electron/src/renderer/components/content-review/review-actions-controller.test.ts:133`）+ **Main 后台审核前台接线**（`:743`）：按案写入、并发/代次/互斥、错误隔离、选择恢复、一键审核链、ACK 语义。

## 2. 用例清单

**6 describe / 39 test**（1055 行）。

**「M0/H05 并发与按案写入」（`:133-742`，24 用例）**

| 主题 | 代表用例（行） |
| --- | --- |
| 导入/设置/缓存 | 多选导入保留成功文件报单文件失败（`:134`）；辅助审核设置按案保存（`:155`）；规则摘要改写即时入缓存（`:171`）；人工修正 AI 事项按案落缓存（`:189`） |
| 选择恢复 UI-09/H09 | 恢复上次明确选择（`:224`）；**无恢复目标不自动设首案**（`:238`）；selectCase 拉回运行+过期（`:322`） |
| 过期核验 | 导入/切领域不切案即时核验（`:266`）；审核中输入变化旧快照仍标过期（`:281`） |
| K05 并发/代次 | A 切 B 只落 A 不污染 B（`:292`）；慢 selectCase(A) 不切回（`:360`）；同案大纲/识别交错互不覆盖（`:332`） |
| 互斥 M0/H05 | 审核中拒再发起且切走不解守卫（`:388`）；同类二次点击被拒（`:695`） |
| 一键审核 | 复用中间产物只调一次最终审核（`:412`）；沿用会话更新/新建会话（`:430`）；先识别申报事项（`:461`）；自动重解析旧 HTML/EML（`:508`）；提交同 ID V2 案卷写 V2 run（`:602`）；**无审核依据不启动**（`:636`）；大纲失败不伪装缺材料（`:650`）；人工复核/缺口标部分完成（`:665`）；重启恢复一致（`:684`） |
| 错误/领域隔离 | 失败已切走不污染当前视图（`:712`）；领域包切换按案落位（`:727`） |

**「Main 后台审核前台接线」（`:743-1055`，3+ 用例）**：ACK 前不显示已受理、ACK 后释放等待且切案不污染（`:760`）；新页面从持久 V2 回读 running/failed（`:783`）。


**「Main 后台审核前台接线」（`:743-894`，7 用例）**：ACK 前不显示已受理、ACK 后释放等待且切案不污染（`:760`）；新页面从持久 V2 回读 running/failed（`:783`）；V2 running 不覆盖 Main 未受理（`:796`）；停止只发案卷+本轮 ID 回读取消（`:808`）；慢首快照不重绘新 run（`:826`）；迟到首受理不替换二轮 UI（`:852`）；预检失败只显示原因不显示 IPC 包装（`:878`）。

**「C1 native archive discovery + explicit workbench restore」（`:895-935`，2 用例）**：只列归档 V2 摘要、native 恢复用 revision 不发明 V1 影子（`:896`）；失败恢复不报成功不改选中案（`:924`）。

**「C1 manual Subject uses Main V2 source and revision」（`:936-995`，2 用例）**：人工创建绑定当前案卷/revision 并刷新真实投影（`:937`）；旧/缺 native Case 身份防不受信人工动作（`:972`）。

**「C1-R09 switch-race safety」（`:996-1023`，1 用例）**：聚合读期间切案不写旧 Case（`:997`）。

**「C1-R09 same-intent retry identity」（`:1024-1055`，1 用例）**：IPC 瞬时错误下幂等 ID 不变（`:1025`）。

## 3. 真实断言

- `:238`（UI-09 不自动设首案）；`:360`（慢选择不切回）；`:388`（互斥守卫）；`:636`（无依据不启动）；`:760`（ACK 语义）——均为 BDD 场景断言组。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Electron/IPC（mock 注入）；模型调用。
- 脆弱点：1055 行 BDD 夹具与 mock 顺序强相关。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 39 用例覆盖并发/代次/互斥/恢复/审核链 | 已证实 | `:133-1055` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例段 | 行 | 状态 |
| --- | --- | --- | --- |
| 并发/代次/互斥 | K05/M0/H05 组 | `:292-412`、`:695` | covered |
| 选择恢复 | UI-09/H09 | `:224-332` | covered |
| 一键审核链 | 阶段 2/3 组 | `:412-684` | covered |
| 错误隔离 | — | `:712-727` | covered |
| ACK 接线 | 第 2 describe | `:760-783` | covered |
