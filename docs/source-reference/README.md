# CDUT Studio R07 源码与文档包

冻结源码：`05fb2565e20eb1760233696be1832f68196b37c2`。这是**静态源码核对与文档交付**；
Electron、模型、网络、Worker、Python、HPC 的真实运行均 **NOT_RUN**（实测由用户执行）。

生成时间（`date -u`）：`2026-10-23T23:23:36Z`

## 阅读入口与顺序

1. [代码与文档地图](CODEBASE-MAP.md) —— 入口、目录/模块边界、依赖、数据权威、逐文件导航
2. [当前架构](CURRENT-ARCHITECTURE.md) → [业务流程](BUSINESS-FLOW.md) → [设计与实现差异](DESIGN-VS-IMPLEMENTATION.md)
3. [接口参考](API-REFERENCE.md) —— 配套 API 注册表与模块 OVERVIEW 从该页继续
4. [全量逐文件索引](INDEXES/REPORT.md)、[3083 行机器索引](INDEXES/SOURCE-TO-DOCUMENT.tsv)
5. [交付状态](VERIFICATION/DELIVERY-STATUS.json)、[源/文档精确绑定](VERIFICATION/SOURCE-DOCUMENT-BINDINGS.json)、
   [逐手册字节保留证据](VERIFICATION/MANUAL-PRESERVATION.json)、[独立复审](VERIFICATION/GATES/)、
   [接受台账](VERIFICATION/ACCEPTANCE/)、[ROOT 转换 hash](VERIFICATION/ACCEPTANCE/ROOT-DOC-TRANSFORM.json)

## 五篇固定正文 hash

| 文档 | stage 原件 sha256[:16] | 包内（仅链接搬迁）sha256[:16] |
| --- | --- | --- |
| `CODEBASE-MAP.md` | `2cad6f0d171697fe` | `7009b9b07ee43d40` |
| `API-REFERENCE.md` | `a7b0674eb2df400d` | `3179ab8d28954df9` |
| `CURRENT-ARCHITECTURE.md` | `0f633ff9a470fb7a` | `5e1624f8087bbd1a` |
| `BUSINESS-FLOW.md` | `32847ccc17b85d94` | `15231e9bffa838c1` |
| `DESIGN-VS-IMPLEMENTATION.md` | `0d1b7485f81a36d8` | `da61cfabb67d2bfc` |

正文未改；差异仅来自 `rewrite_new` 的链接搬迁转换，stage 原件与转换 hash 全部保存在
`VERIFICATION/ACCEPTANCE/ROOT-DOC-TRANSFORM.json`。

## 接受数（实际，0 pending）

| 线 | 已接受 | 计划 | 说明 |
| --- | --- | --- | --- |
| deep | **2378** | 2378 | **0 pending**；唯一目标 = `FILES.tsv` manual |
| index-only | **705** | 705 | **37/37 group 全闭** |
| 逐文件/分组正文 | 2415 | 2415 | 2378 deep + 37 index group |
| 跟踪源文件 | 3083 | 3083 | `SOURCE/` 冻结基线全量 |

`PORTABLE-VALIDATION`：sourceMismatch `[]`、manualMismatch `[]`、
missingTargets `[]`、missingFragments `[]`；
本地链接 11078 条、锚点 705 条，均 **0 缺失**。
2415 篇手册副本 sha256 **逐篇等于已接受 hash**。

## 独立门禁

| 门禁 | 状态 |
| --- | --- |
| `STAGE4.json` | **PASS** |
| `STAGE5-DSH.json` | **S5PASS** |
| `CODEBASE-MAP.json` | **PASS** |
| `MODULE-API.json` | **PASS** |
| `INDEX.json` | **PASS** |

三份 ROOT 正文（CURRENT-ARCHITECTURE / BUSINESS-FLOW / DESIGN-VS-IMPLEMENTATION）由 Codex 亲写，
均通过**真实独立门禁**：STAGE4PASS + **STAGE5-DSH = S5PASS**（`0 事实错误`）。

`ROOT-DOC-ACTIONS` 4 项已关：源自旧 `STAGE4-FINDINGS` **初稿**（针对草稿 hash），
实际早已修复，并由 STAGE4PASS + S5PASS 逐条回源再次证实；**非当前待修**，禁止重写已正确正文。
历史来源完整保留于 `VERIFICATION/GATES/ROOT-DOC-ACTIONS.json.closedHistory`。

## 静态 / 实测边界

| 类别 | 内容 | 状态 |
| --- | --- | --- |
| **静态** | 源码 blob/SHA256 逐行登记、逐文件手册字节比对、链接与锚点解析、MANIFEST 逐条 + CRC | **已完成，全部通过** |
| **实测** | 产品测试 · typecheck · build · Electron GUI · 真实模型请求 · Worker/Python/HPC | **NOT_RUN**（用户接手） |

本包**不含任何实测结果**，也不以静态核对冒充运行验证。

## 范围与接受状态

包内 `SOURCE/` 只含冻结基线的 **3083 个跟踪文件**，不含 `.git`、`node_modules` 或未跟踪文件。

- **已接受正文** = 独立 QA 确认的最新字节，与 candidate 逐字节相同。
- 历史旧 **922** legacy **不计当前接受**，未复制为当前权威；不与当前新文档混作唯一主责。
- 原单文件手册正文保持**封版字节**，打包未改写；仅新地图/总览/API/索引的导航链接做了可移植路径调整。
- `sourceDefect`（源码缺陷，文档如实记）与 `docError`（文档真错，必须改）在
  `VERIFICATION/ACCEPTANCE/VERIFICATION-NOTES.json` 分开登记；历史问题不重复计为当前独立缺陷。
- `VERIFICATION/INITIAL-INDEX-GATE/` 保存**最初的索引 gate 快照**（14 件），原样未改，不追溯冒充当前状态。

## 离线使用与更新

解压后保留整个目录结构，从本 README 或 CODEBASE-MAP 开始。`SOURCE/` 为 `file:line` 引用的冻结源码；
`INDEXES/` 的点击链接已按本包目录调整。

**维护顺序**：

1. 冻结新 source commit，重登源 blob/SHA256、文件归属与受影响文档
2. 更新对应**单文件手册**（先单文件，再下游）
3. 再模块 OVERVIEW / API-REGISTRY / API-REFERENCE
4. 再 CODEBASE-MAP 与 CURRENT-ARCHITECTURE / BUSINESS-FLOW / DESIGN-VS-IMPLEMENTATION
5. 定期核新增文件、真实链接、heading 锚点与 hash
6. 重新包装后核对 `SOURCE-DOCUMENT-BINDINGS`、`MANUAL-PRESERVATION`、`SHA256SUMS`、ZIP 内 MANIFEST + CRC

**不要直接改写既有封版正文**以修补总览链接；链接问题用搬迁转换处理并保存 stage 原件与转换 hash。

## 运行验证

**NOT_RUN**。产品测试 · typecheck · build · Electron GUI · 真实模型请求均由用户接手执行。

本包最终发布状态：**FINAL_ROOT_VERIFIED**。
完成状态与未决缺口以 [交付状态](VERIFICATION/DELIVERY-STATUS.json) 和 [GitHub 发布说明](VERIFICATION/GITHUB-PUBLICATION.json) 为准。

## GitHub 文档分支

本目录发布到 `Fuck-GH-Admin/cdut-studio-review-agent` 的
`docs/source-reference-r07-20261024` 分支，分支基于远端 `main` 的
`7b6cdc843d26e926c0c63b8c51a451ff3925cfad`，此次提交仅新增本目录。

文档调查对应的源码仍是 `05fb2565e20eb1760233696be1832f68196b37c2`；
完整冻结内容保存在本目录 `SOURCE/`，文档中的源码链接指向该快照。
核对文档时请使用该快照，不以仓库根目录的另一版本代替。
原离线 ZIP 保持原样；本目录仅更新 README 发布状态、增加发布说明并重新生成清单。
