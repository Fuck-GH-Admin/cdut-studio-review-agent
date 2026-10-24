# NB-139 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05）— 全组 12/12 收口

**对象**：p01-app-shell 运行时资源索引 18 文件/1744 行 + 18 手册/1180 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-aba7249849fe2e24`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**，3 条 minor（N-01~N-03）不阻断。18 篇全部可按 exact hash 合入。**本批完成后 team author-nb-05 十二批全部收口。**

## 核验摘要

- **G0**：链一致、ZIP 21 条目 0 mismatch、18/18 源绑定独立实算。
- **G2（全文件）**：18 源 1744 行逐行 + 18 手册逐篇。红线注释群全对（sympify 禁用/绝不伪造数据/rotationDeg 恒 0/UNC 禁令/不设沙箱照实）；instrument-extractor 的 yadg 占位、ui.mjs 绝对路径耦合、import.py sleep 魔法值均被照实记录；pack.json 数值/结构逐项核对。

## Findings（均 minor）

| id | 范围 | 摘要 |
| --- | --- | --- |
| N-01 | 全 18 篇 frontmatter | `reviewer: p02-agent-runtime` 模板残留 |
| N-02 | formula-verifier.py.md | "SAFE_FUNCTIONS 20 个"→实 18 |
| N-03 | plot-digitizer.py.md | "六种降级"→实 7（⑥⑦独立 emit） |

## 合入（18 篇 accepted）

| manual（…/p01-app-shell/…） | manualSha256 |
| --- | --- |
| `apps/electron/resources/cslab/cslab-formula-verifier.py.md` | `614895d9c9e39b39e49c170e8e801bf179e73603b1f6a2f77703047dc881fb15` |
| `apps/electron/resources/cslab/cslab-instrument-extractor.py.md` | `2daa01a7d2f2b4c9958aac5b2e23fc65ff1e8c12ec7698dda0e00a4425c0cf29` |
| `apps/electron/resources/cslab/cslab-lease-copy.ps1.md` | `2f2897ec0f9b9e232aad13da8b30377f717c55e91d75e02bcd82098a796e205c` |
| `apps/electron/resources/cslab/cslab-plot-digitizer.py.md` | `efe5ef415362275b6286bdda5400c6d8c18e717aa770fceb30bed16cc102a0ed` |
| `apps/electron/resources/cslab/cslab-tool-runner.py.md` | `300729121732575f33473868b41fd7c4389f2f8796f9fad06d2a56900d613e59` |
| `apps/electron/resources/cslab/cslab-tool-scanner.py.md` | `d69988aebfa2c8ae0b6a25aeac98e4ead55ab5b66a58cade6296903e00256b6b` |
| `apps/electron/resources/entitlements.mac.plist.md` | `69f5a98777a2253eaff985189bcd83a0a885f9b352ba43a4233c827764997e34` |
| `apps/electron/resources/generate-icons.sh.md` | `60a56c0a3817fae6aee4b22eb76065fa71809611ef944e884e473d8fa0679f60` |
| `apps/electron/resources/ppt-style-packs/academic-editorial/pack.json.md` | `c9dbcbe659c0b2a2cce55f6017e96f7ff25c65aa68a300bec5f7e35a51bc78ad` |
| `apps/electron/resources/ppt-style-packs/profer-cloud-dancer/pack.json.md` | `9ce68df1e44dbb245964980a88927d1586665b2c6b95ba6ac939a50495a2ce71` |
| `apps/electron/resources/review-v3-t09-offline-editor.html.md` | `a7e756a17ad1f8876074f5a5af7bcaf354a4dd1baa50bf81cad6965372155a61` |
| `work/reports/assets/2026-10-04-g-stage-recheck/service-probe.ts.md` | `2f3ff76dfa6cbadd8c377d8d7c0aaeec4944083389535edfaa86e4bacb8d1689` |
| `work/reports/assets/2026-10-04-n-stage-recheck/rating-outbox-probe.ts.md` | `f73ca250057b778c9659754791895d4b881aa98b27b6be58c8b95c70653a2c20` |
| `work/reports/assets/2026-10-04-n-stage-recheck/service-probe.ts.md` | `32088da043ced1202a0eb52b0cb1a715968d8d3757c68e5aac2ecf01fc8a4dbd` |
| `work/reports/assets/2026-10-04-ui-acceptance/scripts/electron-flags.cjs.md` | `da201a8de62ebc8fb4027731c19ea326ee8b79f8217906a7f01dd4ef709575fd` |
| `work/reports/assets/2026-10-04-ui-acceptance/scripts/import.py.md` | `4d0b900eff64fcaa48095db6da831a83ccf4b882632d8beedbef64ea93263704` |
| `work/reports/assets/2026-10-04-ui-acceptance/scripts/mock-model.mjs.md` | `afc220ded43eb3993f64eaf927e5051b15a9b4fdfb631ec819992117328360dd` |
| `work/reports/assets/2026-10-04-ui-acceptance/scripts/ui.mjs.md` | `21f71d1e57fb056856078ef457b92701c2a2632658acb8a5800fe380cbdd091a` |

NOT_RUN 全部（含 cslab/探针实跑）；未改源码/作者正文/candidate/全局账。
