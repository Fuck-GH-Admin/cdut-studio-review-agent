# E02–E04 命令与提交账本
| 时间序/提交 | 内容 | 可复核证据 |
| --- | --- | --- |
| 初始 `095a00f6` | 81–83 交接，E01 已合并进开发支线，四项 CI SUCCESS | #39135380437 / #39135380405 / #39135380432 / #39135380399 |
| `0a2a318e` | E02 三个越权负例先入测试 | batch CI #39138285980：3 FAIL，首败 |
| `8e290cf1` | E02 权限/开放任务/模板与 Run 锁最小修复 | baseline #39138470324：新校验顺序打断旧诊断，FAIL |
| `4291a349` | 修复 readiness-first 诊断 | batch CI #39138669206：SUCCESS |
| `fb463363` | E03 虚假材料版本与 Run 同毫秒负例 | 该 SHA 的专项 CI 因后续快速推送取消，首败判词不可推断 |
| `54540e8d`, `23083086` | E03 版本校验与同毫秒 stale 拒止 | Git 提交；以最终 CI 查验 |
| `95347245`, `18f741a6` | E02 stage Agent 冒签回归/机器源拒止 | Git 提交 |
| `874b07d5`, `4ae2ec96` | E03 多历史批次入队负例与保守门禁 | 旧全仓 CI #39139316175：4 FAIL，见失败详情 |
| `9a9e54c2` | 技术 system auto-check 移交严格限界 | Git 提交 |
| `2ca0f37ade153f307b2b72077c7a3f9bfaf1c2d9` | 单案 MVP 补合法 system→reviewer 移交；当前代码父候选 | batch CI #39139858746：SUCCESS；完整四 CI 需核最终 HEAD |

读写者：仅本 Draft 分支；使用 GitHub connector 提交代码与 GitHub Actions 作为受控 CI。本环境未执行本机 Bun/GUI/真 Provider、未做外部 push。