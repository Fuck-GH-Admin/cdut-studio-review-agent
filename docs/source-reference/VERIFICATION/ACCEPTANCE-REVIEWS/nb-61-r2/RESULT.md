# NB-61-r2 独立复核（docs-r07-qa-nb-05，MiMo/max）— nb-61 链 r0→r1→r2 闭合

**对象**：18 手册（修订批；sealId `seal-83f905f6ad193c57`）｜**冻结** `05fb2565e2…37c2`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**。**F-01~F-03 全部字节级关闭**（15 键+差集门语义/11 项四处统一/ins 整删-del 还原），N-01~N-04 一并关闭；残留 N-05（redlining §11"3 方法"实 2）不阻断。12 篇未改、6 篇修订无新错误。

## 合入（18 篇，exact manualSha256，以 r2 为准）

| manual（…/pptx/scripts/…） | manualSha256 |
| --- | --- |
| `apps/electron/default-skills/pptx/scripts/__init__.py.md` | `f83a275946a12605f0da68012d83d18d9826e79b7940c1813cb43fb2bde0a0d1` |
| `apps/electron/default-skills/pptx/scripts/add_slide.py.md` | `44878896839468c054ecb0dee91ee741e5ee0f2f75e7b5e1c5929d531b04b77b` |
| `apps/electron/default-skills/pptx/scripts/chartlib.py.md` | `f0fe4ca4dea8e611fb282c14fb840a2a418a568be366aa6deadd557a2601f051` |
| `apps/electron/default-skills/pptx/scripts/clean.py.md` | `b006a32b5c58ddb97ce82a0317b31e5e381b8d89a4295d87601ef3b66e859389` |
| `apps/electron/default-skills/pptx/scripts/gradient.js.md` | `991fb1d20c5a8e135ec4f83319637fbd55a95b5d7469e2d471dae1258ca8b8df` |
| `apps/electron/default-skills/pptx/scripts/office/helpers/__init__.py.md` | `100968170367ed13ef048ee5f63d8588face3e4c0a19f23f373f70fbf958e48c` |
| `apps/electron/default-skills/pptx/scripts/office/helpers/merge_runs.py.md` | `73aaa07fa1ca7dfb8ff30170d6a99b3beab554a76520296fd614edbf2ca875c3` |
| `apps/electron/default-skills/pptx/scripts/office/helpers/simplify_redlines.py.md` | `52c0d25f5c3c222412b3945350f7543cd6c054bf9ac1f26836a033621ba28781` |
| `apps/electron/default-skills/pptx/scripts/office/pack.py.md` | `c87839c74f29e944c3c5b9de5b7ad62ae5a1c263c2f109109a1a754527ac483c` |
| `apps/electron/default-skills/pptx/scripts/office/pptx2png.ps1.md` | `c8611e16c40ba17b4ea44389590b562d2cc9cb2d5bd1b1cb561a3be2cc022b49` |
| `apps/electron/default-skills/pptx/scripts/office/soffice.py.md` | `14907ba46eb75c12d144fe1795bc789d0e8ca102e0b0bd603d60a6022da1ba50` |
| `apps/electron/default-skills/pptx/scripts/office/unpack.py.md` | `5692f9243c5ed6e5054c0f21c39f4d8719456798cda109864c322d83ecb857f7` |
| `apps/electron/default-skills/pptx/scripts/office/validate.py.md` | `368027d4f8e75f0a7b24aedfcd193d00ff21105ea5c30ce39b7ba3ecb30f3818` |
| `apps/electron/default-skills/pptx/scripts/office/validators/__init__.py.md` | `63a04a26abf282ce3dbeb4320710b44bf9e1e5a98542630b5a8223d42c097462` |
| `apps/electron/default-skills/pptx/scripts/office/validators/base.py.md` | `a93597ce4d74083f6684c0a545421459750e90fb5d4fdfc8f3dd74fc8fe14e4f` |
| `apps/electron/default-skills/pptx/scripts/office/validators/docx.py.md` | `c8cfbce090f14bbf6e838618ee2ccb3d794454d5bf89b7b9c2eada00157dad7a` |
| `apps/electron/default-skills/pptx/scripts/office/validators/pptx.py.md` | `33db0749f7f40fbb6e705fd24a3249dc8cbb3275e4483023d24411231389a371` |
| `apps/electron/default-skills/pptx/scripts/office/validators/redlining.py.md` | `f5463f2f3ae8f2725161e40015f187fe9b5d4ba54bfc4b298f7ad6200e99200d` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账；r1 报告保留不回写。
