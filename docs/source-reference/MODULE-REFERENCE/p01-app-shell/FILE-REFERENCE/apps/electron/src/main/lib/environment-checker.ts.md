---
path: apps/electron/src/main/lib/environment-checker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b1a208234c557b1bdb8c356616d22f73b9c161e
sha256: 1df2c47145b60bbeff85b38c709df4c60eb06ac426ced7f7ff9aec10d8c337f2
lines: 125
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/environment-checker.ts

## 1. 结论与边界

**环境检测服务**（125 行）：整合 Node.js 和 Git 检测统一接口（`:3`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `checkEnvironment` | `:78-125` | 并行检测 Node/Git→版本判定（Node 最低 18/推荐 22、Git ≥2.0.0）→下载链接→hasIssues 汇总 |

内部：`getDownloadUrls:17-45`（平台下载链接，NODEJS_VERSION=22.13.1）、`meetsVersion:54-71`（分段比较）。

## 3. 内部逻辑与关键流程

Promise.all 并行检测→结果组装→问题判定。

## 4. 调用者与调用链

设置页环境检测；出向 `./node-detector`、`./git-detector`。

## 5. 数据 I/O、读写与副作用

子进程检测（detector 层）。

## 6. 分支、失败、取消与恢复

未安装/版本不足→hasIssues+下载链接。

## 7. 权限与权威状态

检测口径（18 最低/22 推荐/Git 2.0）即产品契约。

## 8. 修改影响面

改阈值影响环境提示；版本判定（18 最低/22 推荐/Git 2.0）联动 node-detector/git-detector 输出与设置页下载引导文案。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 125 行全读 |
| **照实**：meetsVersion 对非数字段 parseInt→NaN 比较未防御（`:56`） | 已证实 | `:54-71` |
| node/git-detector 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。
