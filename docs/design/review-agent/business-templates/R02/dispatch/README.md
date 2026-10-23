# R02 GitHub 原件与派发总索引

本目录是 CDUT Studio Review R02「统一审核 + V3 实现」任务的权威资料入口。子会话只需取得自己的 `{BATCH_ID}_TASK_PROMPT.md`，即可定位所有原件和要求；**不得要求用户重新上传 ZIP**。

## 固定仓库与分支

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`
- 资料/集成分支：`feat/v3-r02-template-library`
- 当前原件与提示词提交：`9a07a9d61f71deafcc779af0992c0e5226872e04`
- 实现契约：[`R02-V3-IMPLEMENTATION-CONTRACT-20261023.md`](../../../R02-V3-IMPLEMENTATION-CONTRACT-20261023.md)

## 权威资料路径

| 资料 | 仓库内路径 |
|---|---|
| 128 份原始业务模板 | `docs/design/review-agent/business-templates/R02/research-original/{TEMPLATE_ID}.md` |
| 31 份定向任务提示词 | `docs/design/review-agent/business-templates/R02/dispatch/prompts/{BATCH_ID}_TASK_PROMPT.md` |
| 统一审查标准 | `docs/design/review-agent/business-templates/R02/dispatch/00_统一审查标准.md` |
| 文件所有权与集成分工 | `docs/design/review-agent/business-templates/R02/dispatch/00_集成分工与文件所有权.md` |
| 128 项模板清单 | `docs/design/review-agent/business-templates/R02/dispatch/00_模板清单_128.tsv` |
| 未找到正式源 MD 的 16 项 | `docs/design/review-agent/business-templates/R02/dispatch/01_未纳入的16项.md` |
| 总集成会话提示词 | `docs/design/review-agent/business-templates/R02/dispatch/00_总集成会话提示词.md` |
| 派发说明 | `docs/design/review-agent/business-templates/R02/dispatch/README_派发说明.md` |
| 实现契约副本 | `docs/design/review-agent/business-templates/R02/dispatch/00_V3实现与提交契约.md` |

## 覆盖与核验

- 原始模板 Markdown：128 份，128 个唯一 `template_id`，每个文件以 ID 命名。
- 定向子会话提示词：31 份，全部加入 GitHub 原件定位段。
- 128 项清单：128 条模板数据行。
- 另有 16 项未取得正式源 Markdown：只在缺口清单登记，不生成占位模板，不阻塞已取得的 128 项。
- 原始模板是研究原件，不等于已审阅版本；审阅修订稿必须写入契约指定的 `business-templates/R02/{TEMPLATE_ID}.md`，并在审查报告中记录来源和差异。

## 子会话执行步骤

1. 打开自己批次的 `prompts/{BATCH_ID}_TASK_PROMPT.md`。
2. 先读取实现契约、统一审查标准、文件所有权和本批每个模板 ID 对应的原始 MD。
3. 若当前分支没有原件，读取 `feat/v3-r02-template-library` 上的指定路径；本地 Git 可用时先 `git fetch origin feat/v3-r02-template-library`，再用 `git show origin/feat/v3-r02-template-library:<path>`。
4. 按提示词要求在 `feat/v3-r02/templates-{BATCH_ID}` 独立分支提交审阅后的 Markdown、V3 原生模板定义、专项测试、审查报告与问题台账。
5. 创建 PR，base 必须是 `feat/v3-r02-template-library`，不得直接合并到 `main`。
6. 校本制度/授权未确认不是停止工作的理由；未知规则标记待确认/人工复核，禁止虚构政策、签批人或自动正式决定。

## 注意

部分旧提示词仍保留“本 ZIP 已包含文件”的历史措辞。提示词开头的「权威 GitHub 原件定位」段优先于这些历史表述。ZIP 仅为备用副本，GitHub 上本索引列出的文件才是本轮可供新会话直接读取的持久原件。
