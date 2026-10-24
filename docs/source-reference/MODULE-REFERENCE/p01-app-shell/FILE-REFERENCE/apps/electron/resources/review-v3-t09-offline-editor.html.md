---
path: apps/electron/resources/review-v3-t09-offline-editor.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: efe882bef1052712db5e65124bbbc198df81a329
sha256: ff5c60ca58d6106029aa559d5df79a03921b1e5f1232ff23a2347b458015f88a
lines: 165
kind: template
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/review-v3-t09-offline-editor.html

## 1. 结论与边界

**独立离线回复编辑器**（165 行单页 HTML，`:24`）：无需联网/登录，本地填写不上传（头部声明）；打开 T09 任务包 JSON→填回复（学生补件/评委评分两型）→导出回复包交回负责人。**本地身份·非校方认证**（`:24` pill）；摘要校验防误改不代表实名（`:32`）。

## 2. 导出与关键符号

无导出（单页）。JS 关键函数（`:35-162`）：`canon`（`:40`，键排序规范化 JSON——摘要基准）、`sha`（`:45`，crypto.subtle SHA-256）、`verify`（`:52`，`format==='cdut-review-offline/1'`+hash 复核）、`readableFile`（`:59`，附件 base64+哈希）、`renderTask`（`:64`）。

## 3. 内部逻辑与关键流程

**事件与交互**（`:120-161`）：`taskFile` change 事件=打开任务包（摘要/完整性/附件哈希三层校验）；`upload` change 事件=附件装入（读取失败清空 `:106`）；`exportButton` click 事件=组包导出（校验失败 notice 不下载）；附件查看按钮 click=Blob 下载（`:80-86`）；N/A checkbox change=联动禁用分数输入（`:114`）。

- 打开（`:120-132`）：JSON 解析→`verify`（摘要不符拒）→任务完整性检查（caseId/recipient/kind 白名单 `:125`）→**逐附件哈希复核**（`:126-129`）。
- 渲染（`:64-119`）：公共字段/资料下载/两型表单——student-reply=补件说明+多附件（完整字节随包）；judge-rating-reply=维度分+N/A+公开/内部评语（范围校验 `:146-148`）。
- 导出（`:133-161`）：组 reply→base（packageId/actionId uuid、baseRevision/lock/requestHash/respondent 回链 `:154-156`）→`hash=sha(canon(base))`→下载；提示"尚未提交业务数据"（`:159`）。

## 4. 调用者与调用链

- 入向：审核负责人分发给学生/评委（离线打开，浏览器直接运行）。
- 出向：Web Crypto/Blob 下载（纯浏览器）。

## 5. 数据 I/O、读写与副作用

读本地任务包/附件；写回复包下载；**无网络上传**（声明 `:24`）。

## 6. 分支、失败、取消与恢复

摘要不符/信息不完整/附件哈希不符→拒开（`:124-128`）；校验失败 notice 红字；无自动提交。

## 7. 权限与权威状态

完整性权威=canon+SHA-256 双端摘要（任务包/附件/回复包三层）；身份边界=本地身份非认证（`:24,32`）。

## 8. 修改影响面

T09 离线回复流程的模板面；摘要算法/字段协议变更影响负责人导入端对账。

## 9. 测试证据

`NOT_RUN`。无直接测试（模板；未在浏览器运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三层摘要校验/两型表单/回链字段 | 已证实 | `:1-165` 全文 |
| 浏览器运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 页面+脚本 | §2/§3 | 35-161 | covered |
