---
path: apps/electron/default-skills/pdf/scripts/create_validation_image.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10eadd8124b1f94f9b1a78708c2d947a3f6773e7
sha256: 8fa9fd7962c9f940045b81cf6b991e7c1057c1838e3f9cc6d305007a222ffebf
lines: 37
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/create_validation_image.py

## 1. 结论与边界

在页面图上**叠加边界框**生成校验图（`apps/electron/default-skills/pdf/scripts/create_validation_image.py:9-26`）。CLI：`create_validation_image.py [page number] [fields.json] [input image] [output image]`（`:29-37`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

- `create_validation_image(page_number, fields_json_path, input_path, output_path)`（`:9-26`）：读 fields.json；对该页字段画 `entry_bounding_box` 红框、`label_bounding_box` 蓝框（width=2，`:21-22`）；每字段 +2 框；保存并 print 框数（`:25-26`）。

## 3. 内部逻辑与关键流程

主链路：`create_validation_image(page_number, fields_json_path, input_path, output_path)`（`:9-26`）→ 读 fields.json 筛该页字段 → 逐字段画 `entry_bounding_box` 红框 + `label_bounding_box` 蓝框（width=2，`:21-22`）→ 保存输出图并 print 框数（`:25-26`）。
## 4. 调用者与调用链

入向：无代码级调用方（冻结树检索零命中；PDF 技能指令链产物消费，推断）。出向：pypdf、Pillow（按 §2 图像绘制语义，静态）。
## 5. 数据 I/O、读写与副作用

输入=页码+fields.json+页面 PNG（来自 convert_pdf_to_images）；输出=叠框 PNG。

## 6. 分支、失败、取消与恢复

无 try/except（静态）：JSON/图像缺失即抛。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

视觉校验环节（agent 看图核对字段定位），与 check_bounding_boxes 文本校验互补。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双色框/计数逻辑 | 已证实 | `:9-26` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全逻辑 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
