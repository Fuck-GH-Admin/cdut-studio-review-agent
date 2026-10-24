# NB-140 独立真值审查报告（RESULT）— p01-app-shell · p01.release-meta（发布说明/教程/规格/资产/CI 索引）

- 审查者：`docs-r07-qa-extra-02-20261024`（extra-02 组独立 QA）｜作者：`docs-r07-author-extra-02-20261024`
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）｜seal：`seal-8d935dad88327e41`（2026-10-23T19:06:12Z）
- **batchVerdict：revision_required**（10/10 手册内容 accepted；阻断项仅 D0 链 author/reviewer 错标 NB140-B-01）
- 复用证据：`reviews/nb-140/SOURCE-CHECKLIST.md` + `PRE_READ_DONE.json`（本 QA 独立整读 10 文件 579 行，绑定独立重算 0 差异）；新声明均回源验证。

## 一、G0（范围/基线/hash/ZIP/格式）

| 项 | 结果 |
| --- | --- |
| scope 覆盖 | 10/10 全等（无缺无越，counts lines=579 对齐） |
| 三方 hash | MANIFEST/READY/DONE 互链 sha256 全对；sealId 一致 |
| ZIP | 13 条目=10 手册+MANIFEST+COVERAGE.mechanical+SOURCE-EVIDENCE.mechanical；ZIP↔磁盘逐字节全等；ZIP 内 MANIFEST=磁盘 MANIFEST（seal v2 无 READY/DONE 免自 hash，合规） |
| manual↔source 绑定 | 10/10 manualSha256=stage 实算；10/10 source sha256=baseline@05fb 实算 |
| 格式 | frontmatter 10 项齐、status=authored、11 章齐非空、NOT_RUN 明示 |
| **D0 链归属** | **FAIL**：READY/MANIFEST/DONE author/reviewer=旧会话（nb-03 组），与团队 JSON/START/STATUS/10 篇 frontmatter（extra-02）矛盾 → **NB140-B-01** |

## 二、G1（证据层）

- `UNVERIFIED.md` 显式列 NOT_RUN（8 workflow+2 cmd 全未运行）、未知项、边界、负向检索范围——诚实，无隐藏。
- `SOURCE-EVIDENCE.tsv` 逐文件 readSegments+人工证据（含 19 条 paths、18 步、11 throw 点等计数）；`COVERAGE.tsv` 10/10。
- 自报 3 条措辞级备注（§5）→ QA 复核为措辞级非事实错误（NB140-N-04）。

## 三、G2（逐篇事实，对照独立预读+回源抽查）

- **10/10 手册内容 accepted**：触发/权限/并发/步骤数/行号引用/脚本映射/失败语义逐项对源命中。抽查锚点全对：根 `package.json:15/18/24/25`、`apps/electron/package.json:10/17/20/27/28/30/33/35/36/39/42/49/60/62/63`、release.yml 11 个 throw 点、6 测试文件行号、`package-closure.test.ts:29`、`work/reports/2026-10-0{2,3}-*.md:119/:18`、`release-notes/v0.9.8.md:13`、`19-d2-…md:38-55/:68`。
- 负向检索独立复核成立：workflow_call/`uses: ./.github` 零命中；`review-batch-tests` 无外部引用；review-* 测试文件 33/33 存在（与作者计数一致）。
- 本 QA 预读发现 Q1(bun 1.4.0/1.4.2 分叉)、Q2(.cmd 机器路径)、Q3(4 workflow 无 concurrency)、Q4(darwin frozen 降级) 均已被手册如实收录；Q5/Q6/Q7 未收录 → 非阻断可选项 NB140-N-01..N-03。
- QA 侧勘误：预读清单 §6 "paths 24 条" 实为 19 条（作者正确，NB140-R-01）。

## 四、findings

| id | 级别 | 摘要 | 处置 |
| --- | --- | --- | --- |
| NB140-B-01 | **blocking** | D0 链 author/reviewer 错标旧会话（根因：6 个 SCOPE 的 author/reviewer 沿用改派前会话，seal 照抄；对照 nb-132 同类改派用实际会话名） | 开 `nb-140-r1` 重封：手册字节不动，链字段改实际会话，SUPERSEDED-BY 指针保留旧 seal；修后按新 hash 链复验 |
| NB140-N-01 | minor | macos-package 未记 6144 与 build-renderer 8192 叠加语义 | 可选补充 |
| NB140-N-02 | minor | release.yml 未对照 CHANGELOG 核验面差异 | 可选补充 |
| NB140-N-03 | minor | review-batch-tests 触发面/执行面不对齐未注明 | 可选补充 |
| NB140-N-04 | info | 作者自报 3 条措辞备注复核成立 | 留档 |
| NB140-R-01 | info | QA 预读笔误 24→19 条更正 | 留档 |

## 五、边界（NOT_RUN）

产品测试/typecheck/build/electron-builder/签名/Electron-GUI/8 个 workflow 与 2 个 cmd 真实执行/真实模型网络全部 **NOT_RUN**。本审查只读复核：未改作者正文/源码/测试/依赖/candidate/全局总账/旧 seal；未 push。
