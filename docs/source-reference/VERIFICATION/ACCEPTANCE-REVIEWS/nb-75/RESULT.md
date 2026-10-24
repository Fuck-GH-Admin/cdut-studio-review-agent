# NB-75 独立 QA 验收报告（D0）

- 批次 `nb-75`（p03-integrations · p03.cslab，18 文件 / 5060 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-55d8ed22f35e1b91`（18:07:55Z）；QA `docs-r07-qa-nb-06-20261023`（06:30:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（7 minor，每文件恰 1 条）
- **NOT_RUN**（批内 51 个测试用例静态读断言）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-75-SCOPE。

## G2 — 逐文件（18 文件 5060 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| cslab-share-watcher.ts | accepted | NB75-N6（"16 条" vs 19 导出） |
| cslab-tool-registry.ts | accepted | NB75-N7（"11 导出" vs 12） |
| cslab-share-db.ts | accepted | NB75-N4（"16 导出" vs 18） |
| cslab-track-changes.ts | accepted | NB75-N1（测试归属表述误导） |
| cslab-tool-trust.ts | accepted | NB75-N2（"2 内部" vs 自列 3） |
| cslab-tool-audit.ts | accepted | NB75-N3（"4 内部" vs 自列 6 组 8 名） |
| cslab-scientific-tools.ts | accepted | NB75-N5（"3 内部" vs 自列 4） |
| 其余 11 篇 | accepted | — |

复算命中：7 测试文件 **51 用例**（11/14/3/1/6/6/10）行号全对；红线逐条对源——security 五红线（PBKDF2-SHA256 310k 异步/timingSafeEqual 等长比对/5 次锁 30s/v1→v2 透明迁移）、tool-trust 四红线+门禁四分支矩阵、share-watcher 三红线（复验才 published/租约等级如实/异常收敛 retry）、tool-registry"绝不伪造结果"、tool-audit"失败不改结果"；独立复算 TIFF IFD 12 条目/alpha 白底合成、assertSafeShareHost 拦截清单（云元数据/回环/WPAD/ISATAP 拦、10/172.16/192.168 放行）、指纹 size:mtime、SHA 幂等复用 assetUri 等全部吻合。

## findings（7 minor）

计数/表述口径类（grep 计数定案），含 1 条测试归属表述误导（NB75-N1：同批测试实测切片计划而手册称"非本批"）。无行为/红线/测试存在性错误。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-75/RESULT.json.acceptedHashes`，脚本生成三方核验）；7 findings 记 ACCEPTED-ERRATA，G4 前关闭。
