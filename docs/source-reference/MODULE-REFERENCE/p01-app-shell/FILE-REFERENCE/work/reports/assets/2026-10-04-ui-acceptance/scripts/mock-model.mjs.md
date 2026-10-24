---
path: work/reports/assets/2026-10-04-ui-acceptance/scripts/mock-model.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 726f823d199d4e3de135e7e652bb762154659b56
sha256: 8eefe2835298a890e87cfb02c86adab37f939689865c562afcf0440261041210
lines: 33
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-ui-acceptance/scripts/mock-model.mjs

## 1. 结论与边界

**QA 受控 OpenAI 兼容模型服务**（33 行，监听 `127.0.0.1:9249`，`:33`）：按 system 提示关键词返回受控协议回复（审核规则大纲/可审核事项/问题清单/通用答复），供 UI 验收回放联调。请求全量落 `model-requests.jsonl`（`:14`）。

## 2. 导出与关键符号

无导出（http 服务）。受控模式开关 `model-mode.json`（`:15`）：`delay`（延时）/`fail`（503 暂不可用）/`empty`（问题清单回空数组）。数据源=`config/review-cases/*/case.json`（`cases()` `:6`）。

## 3. 内部逻辑与关键流程

（`:7-32`）：GET /models→单模型列表；POST→解析 body（坏 JSON→400）→**按 system 含键分派**（`:20,24,27`）：'提取审核规则大纲'→规则 JSON（按 user 中规则包名选包）、'识别可审核事项'→事项 JSON、'产出问题清单'→findings（含 date-out-of-range 红线样例+受控协议声明 `:29`）、默认→带**核验码 QA-PROOF-UNIQUE-4488** 的固定文案（`:30`）→stream（SSE 三分片）或非 stream JSON（`:31-32`）。

## 4. 调用者与调用链

- 入向：UI 验收被测应用（配置指向 9249，域外）。
- 出向：node http/fs。

## 5. 数据 I/O、读写与副作用

读 review-cases fixtures+model-mode.json；写 model-requests.jsonl（审计全量）。

## 6. 分支、失败、取消与恢复

mode 三开关/坏 JSON 400/四路提示分派；无持久状态。

## 7. 权限与权威状态

受控协议权威=固定回复内容（"此为受控协议测试回复" `:29`）；核验码=防误认真实模型。

## 8. 修改影响面

UI 验收的模型侧行为面（规则提取/事项识别/问题清单三链路回放）。

## 9. 测试证据

`NOT_RUN`。无直接测试（验收资产；未运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四路分派/mode 开关/审计落盘 | 已证实 | `:1-33` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 服务体 | §2/§3 | 5-33 | covered |
