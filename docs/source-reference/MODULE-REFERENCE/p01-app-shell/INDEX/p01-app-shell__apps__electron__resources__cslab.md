# p01-app-shell__apps__electron__resources__cslab 索引（CDUT Science Python 增强脚本资源）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__apps__electron__resources__cslab`（owner `p01-app-shell`，family `apps/electron/resources/cslab`）共 19 个文件（2 binary 字节码缓存 + 13 resource 演示数据 + 4 docs 依赖清单），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（实读证实）：`resources/cslab/` 是「CDUT Science 可选 Python 增强脚本」资源根，`electron-builder.yml:118-121` 注释「CDUT Science 可选 Python 增强脚本（TS 主实现缺失能力时的增强通道）」，`from: resources/cslab to: cslab filter **/*` 整目录进包（含 `__pycache__` 与 `demo/`、`requirements/`）。加载点三族：①演示数据 `cslab-demo.ts:62-64`（prod `process.resourcesPath/cslab/demo` / dev `appPath/resources/cslab/demo`），`assertDemoFiles :67-80` 对 DEMO_DATA_FILES（:36-50）与 DEMO_FIGURE_FILES（:52）逐个校验，缺失即抛「演示数据缺失」；`createDemoLab :136-178` 建演示实验室（测试 `cslab-demo.test.ts:24/:36` 同源加载）。②pip 依赖清单 `cslab-python-runtime.ts:82-89`（`resourcesPath/cslab/requirements/<profile>.txt` 多候选解析）→ `:330/:342` `pip install -r`；合法 profile 恰 4 个=`plot/formula/formula-ocr/instrument`（`cslab-router.ts:1944`）。③科学格式识别映射 `cslab-mol.ts:41-54`（`.cif/.pdb/.poscar/.cube/.chgcar/.locpot`）。

## apps--electron--resources--cslab--__pycache__--cslab-formula-verifier.cpython-313.pyc

- 职责：`resources/cslab/cslab-formula-verifier.py`（化学式校验 Python 增强脚本，源文件在树）的 CPython 3.13 字节码缓存（13135 字节，binary）。
- 消费：CPython import 机制——该脚本被 Python 运行/导入时按 `__pycache__/<mod>.cpython-313.pyc` 命名校验并复用缓存（CPython 约定=推断）；直接代码消费者=Python 解释器，TS 侧只经 `cslab-python-runtime.ts` 以脚本路径起进程（不直接引用 .pyc）。全树检索无显式 .pyc 引用（证实）。
- 来源：CPython 3.13 自动生成（时间戳校验模式）；`change=unchanged_since_093f`。sourceBlob `83ce986b4c3d4a88fab6fac4d33b64ac05317bdd`；sourceSha256 `2690653dc61d15ed85a3f69f677cae35886111ad543421346fc5bd4ffa90e5a2`。
- 打包：进产物——`resources/cslab`→`cslab` filter `**/*`（electron-builder.yml:119-121），随包带到 `resources/cslab/__pycache__/`（证实打包映射；stale 随包=记录项）。
- 影响：删除无功能影响（Python 自动重编译）；改动=伪造缓存在源 mtime 匹配时可能被执行（时间戳校验下风险受限，推断）。
- 验证：①`file`/pyc 头复核 CPython 3.13 magic；②核源脚本 `cslab-formula-verifier.py` 存在；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/Python 执行（本轮统一 NOT_RUN）。
- 证实/推断/未知：打包与零显式引用=**证实**；import 复用行为=**推断**（CPython 惯例）；缓存新旧=**未知**（未比对源 mtime）。

## apps--electron--resources--cslab--__pycache__--cslab-plot-digitizer.cpython-313.pyc

- 职责：`resources/cslab/cslab-plot-digitizer.py`（谱图/曲线数字化提取 Python 增强脚本，源文件在树）的 CPython 3.13 字节码缓存（18158 字节，binary）。
- 消费：同上——CPython import 缓存机制（推断）；无显式 .pyc 引用（证实）；运行入口为 cslab-python-runtime 的脚本执行通道。
- 来源：CPython 3.13 自动生成；`change=r03_pr44`。sourceBlob `eedcf230272782cc62d728b943e7192677eb6d79`；sourceSha256 `fe695fb89ad8bfe5767774051dfa03aa6741c70452576ab1fc81a2ca75dd07d5`。
- 打包：进产物——`cslab` 目录 filter `**/*`（electron-builder.yml:119-121）。
- 影响：删除无功能影响（自动重编译）；改动=同上低风险注入面（推断）。
- 验证：pyc 头复核、源脚本存在、hash 一致；NOT_RUN：Python 执行。
- 证实/推断/未知：打包=**证实**；import 行为=**推断**；缓存新旧=**未知**。

## apps--electron--resources--cslab--demo--1792573114138-6ac8d0---_Y_Al_O____YAG____Ia-3d_--.cif

- 职责：演示晶体结构数据（CIF，8853 字节）：钇铝石榴石 YAG（Y₃Al₅O₁₂，Ia-3d 立方晶胞）结构文件，文件名带导入时间戳前缀 `1792573114138-6ac8d0`，`cslab-demo.ts:48` DEMO_DATA_FILES 第 12 项（原名 `1792573114138-6ac8d0-石榴石_Y_Al_O____YAG____Ia-3d_完整立方晶胞.cif`）。
- 消费：`cslab-demo.ts:48`（演示资产清单）→ `assertDemoFiles :67-80` 缺失即抛错 → `createDemoLab :136-178` 作为演示实验室资产登记（≥16 资产之一，`cslab-demo.test.ts:68`）；格式走 `cslab-mol.ts:41` `.cif→cif` 可视化通道。
- 来源：晶体学演示数据（YAG 标准结构导出）；`change=r03_pr44`。sourceBlob `5e78ff7d70bc5905165339d017662bb38d97f070`；sourceSha256 `2c1bc1039e904b7ae2ad691de98e7da8b62ed3e7f56266e042e99bc07c5f030d`。
- 打包：进产物——`cslab/demo/` 随目录 filter `**/*`（electron-builder.yml:119-121），运行时解析 `resourcesPath/cslab/demo`（cslab-demo.ts:62-64）。
- 影响：删除→`assertDemoFiles` 抛「演示数据缺失」、演示实验室构建失败（硬依赖）；改动→演示结构展示变化。
- 验证：①核 cslab-demo.ts:48 清单与 :67-80 校验；②CIF 头可解析；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：清单/校验/打包=**证实**；结构数据与 YAG 标准谱一致性=**未知**（未做晶体学比对）。

## apps--electron--resources--cslab--demo--demo-digitizer-spectrum.png

- 职责：曲线数字化（Plot Digitizer）演示用谱图位图（4502 字节 PNG），`cslab-demo.ts:52` DEMO_FIGURE_FILES 唯一项——演示「从图片提取曲线数据」的输入图。
- 消费：`cslab-demo.ts:52`（演示图片清单）→ `assertDemoFiles :67-80` 校验存在 → `createDemoLab` 登记为演示图（figure）资产；digitizer 处理链为 `cslab-plot-digitizer.py` 增强脚本（推断自任务族）。
- 来源：演示谱图资产（人工制作）；`change=r03_pr44`。sourceBlob `422b10cd2331e1aa335005019070f60295fc5a4c`；sourceSha256 `9fc2910a866a870c7fe3d316e381212212590231362771af64d2121eb0041321`。
- 打包：进产物——`cslab/demo/` filter `**/*`（electron-builder.yml:119-121）。
- 影响：删除→演示图片缺失，`assertDemoFiles` 抛错、演示实验室构建失败；改动→数字化演示输入变化。
- 验证：核 :52 清单、PNG 头、hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：清单/打包=**证实**；图片内容=**未逐像素核对**；与 digitizer 脚本的配对=**推断**。

## apps--electron--resources--cslab--demo--gold-fcc-nanoparticle.pdb

- 职责：演示分子/晶体结构数据（PDB，182971 字节）：金 FCC 纳米颗粒结构，`cslab-demo.ts:40` DEMO_DATA_FILES 第 4 项。
- 消费：`cslab-demo.ts:40` → `assertDemoFiles :67-80` → `createDemoLab` 登记；格式走 `cslab-mol.ts:42` `.pdb→pdb` 可视化。
- 来源：纳米颗粒结构演示数据（模拟导出）；`change=unchanged_since_093f`。sourceBlob `2172705db0ceeecd6f4d3d49c569ecbb129d398b`；sourceSha256 `57ca3587d13dc976de119bd227a3faaa6a8546266d5c714829e8d45ceaf59094`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错、演示实验室构建失败；改动→纳米颗粒演示变化。
- 验证：核 :40 清单、PDB 头、hash；NOT_RUN。
- 证实/推断/未知：清单/打包=**证实**；结构来源模拟参数=**未知**。

## apps--electron--resources--cslab--demo--rutile-chgcar-sample.chgcar

- 职责：演示电荷密度数据（VASP CHGCAR 采样，10398 字节）：金红石 TiO₂ 电荷密度，`cslab-demo.ts:42` DEMO_DATA_FILES 第 6 项。
- 消费：`cslab-demo.ts:42` → `assertDemoFiles :67-80` → `createDemoLab` 登记；格式走 `cslab-mol.ts:53` `.chgcar→chgcar`。
- 来源：VASP 计算输出采样（截断示例）；`change=r03_pr44`。sourceBlob `5dd1d1d238c52ecca5d3d6426cf40ba59dd51d78`；sourceSha256 `7b7fff8217409b11169cfbe61663cc28e781dab843dca1f094ba1cc2fe4dc651`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错；改动→电荷密度演示变化。
- 验证：核 :42 清单、文件头、hash；NOT_RUN。
- 证实/推断/未知：清单/打包=**证实**；采样截断方式=**未知**。

## apps--electron--resources--cslab--demo--rutile-diff-charge.cube

- 职责：演示差分电荷密度数据（Gaussian cube，38859 字节）：金红石差分电荷，`cslab-demo.ts:41` DEMO_DATA_FILES 第 5 项。
- 消费：`cslab-demo.ts:41` → `assertDemoFiles :67-80` → `createDemoLab` 登记；格式走 `cslab-mol.ts:51` `.cube→cube`。
- 来源：第一性原理计算输出演示数据；`change=unchanged_since_093f`。sourceBlob `e039958b14f021b7c74b9d0abd584e88e785cf4b`；sourceSha256 `85dc6b8086dae68f87d75d672d1bf5179f5231f051c751bfde639b8ac2c25a89`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错；改动→差分电荷演示变化。
- 验证：核 :41 清单、cube 头、hash；NOT_RUN。
- 证实/推断/未知：清单/打包=**证实**；计算参数=**未知**。

## apps--electron--resources--cslab--demo--rutile-locpot-sample.locpot

- 职责：演示静电势数据（VASP LOCPOT 采样，10398 字节）：金红石局域势，`cslab-demo.ts:43` DEMO_DATA_FILES 第 7 项。
- 消费：`cslab-demo.ts:43` → `assertDemoFiles :67-80` → `createDemoLab` 登记；格式走 `cslab-mol.ts:54` `.locpot→locpot`。
- 来源：VASP 计算输出采样；`change=r03_pr44`。sourceBlob `6da77b1690b0aca3bb81fd4c76f57b10b7f463ef`；sourceSha256 `f8e7ffffcc5d5514800a0a72bcb6873e0cd675b78cd00137d589a229f69a3035`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错；改动→静电势演示变化。
- 验证：核 :43 清单、文件头、hash；NOT_RUN。
- 证实/推断/未知：清单/打包=**证实**；采样方式=**未知**。

## apps--electron--resources--cslab--demo--rutile-raman-532nm.csv

- 职责：演示拉曼光谱数据（CSV，16210 字节）：金红石 532nm 激发拉曼谱，`cslab-demo.ts:46` DEMO_DATA_FILES 第 10 项，且被 `createDemoLab :173` `tableSeriesFor('rutile-raman-532nm.csv')` 构造成演示图表序列（拟合演示 `demo-rutile-raman-fit`，测试断言 `cslab-demo.test.ts:144` R²>0.95、面积相对误差<0.015）。
- 消费：`cslab-demo.ts:46`（资产清单）+ `:173`（表格序列构造）→ `assertDemoFiles :67-80`；`cslab-demo.test.ts:144-147` 直接验证其拟合指标。
- 来源：拉曼光谱演示数据（仪器导出/模拟）；`change=unchanged_since_093f`。sourceBlob `9899b0687b32f2db3b4f74d953cbc911626b1126`；sourceSha256 `084d3063b81229846cd1f28d126388fc6be8a10e12121b57e1a243b265d6b419`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错 + Raman 拟合演示/测试断言失败；改动→拟合指标可能漂移（测试 :144-145 有阈值）。
- 验证：核 :46/:173、CSV 头、hash；NOT_RUN：产品测试（含 cslab-demo.test 阈值断言）本轮 NOT_RUN。
- 证实/推断/未知：清单/消费/打包=**证实**；数据真实性=**未知**。

## apps--electron--resources--cslab--demo--rutile-tio2.cif

- 职责：演示晶体结构数据（CIF，961 字节）：金红石 TiO₂ 结构，`cslab-demo.ts:37` DEMO_DATA_FILES 首项，`cslab-demo-plates.ts:407` 以 `fs.readFile(join(demoDir,'rutile-tio2.cif'))` 直读用于演示板块（VESTA 晶体学）。
- 消费：①`cslab-demo.ts:37` 清单 + `assertDemoFiles` 校验；②`cslab-demo-plates.ts:407` 直读构造晶体学演示；③`cslab-demo.test.ts` DEMO_DIR 全量加载（:24/:36）。注意根 `demo-data/cdut-science-rutile/rutile-tio2.cif` 是**另一份**测试用副本（`cslab-cif.test.ts:5` 等引用，不指向本文件）。
- 来源：金红石标准晶体结构（CIF）；`change=unchanged_since_093f`。sourceBlob `b62271a399c3faf3ac2c909604069e10e8f201c8`；sourceSha256 `848e6b8784d118f854c1a800407b1a78974f19cc360aabd450929bfddfda6ba1`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错、晶体学演示板块失败；改动→金红石演示结构变化。
- 验证：核 :37/:407 引用、CIF 可解析、hash；NOT_RUN。
- 证实/推断/未知：引用与打包=**证实**；与 demo-data 测试副本内容一致性=**未知**（未比对）。

## apps--electron--resources--cslab--demo--rutile-xrd-co-ka.csv

- 职责：演示 XRD 衍射数据（CSV，48102 字节）：金红石 XRD（Co Kα 靶），`cslab-demo.ts:45` DEMO_DATA_FILES 第 9 项，`createDemoLab :172` `tableSeriesFor('rutile-xrd-co-ka.csv')` 构成演示谱线。
- 消费：`cslab-demo.ts:45`（清单）+ `:172`（表格序列）→ `assertDemoFiles :67-80`；演示 plot `demo-rutile-xrd`（`cslab-demo-plates.ts:52` PLOT_IDS）。
- 来源：XRD 衍射演示数据；`change=unchanged_since_093f`。sourceBlob `b1b78ee3bd5d272c7134d3267f516233447028cc`；sourceSha256 `02225cda1fc00f3780437cc0e2f94cb643d8892633fee71380aaf2b97fe67742`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错 + XRD 演示谱缺 Co Kα 线；改动→演示谱变化。
- 验证：核 :45/:172、CSV 头、hash；NOT_RUN。
- 证实/推断/未知：清单/消费/打包=**证实**；数据真实性=**未知**。

## apps--electron--resources--cslab--demo--rutile-xrd-cu-ka.csv

- 职责：演示 XRD 衍射数据（CSV，48104 字节）：金红石 XRD（Cu Kα 靶），`cslab-demo.ts:44` DEMO_DATA_FILES 第 8 项，`createDemoLab :171` `tableSeriesFor('rutile-xrd-cu-ka.csv')`；与 Co Kα 对照演示不同靶材谱（NIST 偏差指标 `cslab-demo.test.ts:87/:139` maxDeviationDeg<0.05）。
- 消费：`cslab-demo.ts:44`（清单）+ `:171`（表格序列）→ `assertDemoFiles`；`cslab-demo-plates.ts:52` `demo-rutile-xrd`。
- 来源：XRD 衍射演示数据；`change=unchanged_since_093f`。sourceBlob `69637ece8d698e5eb241e3ff1260364cd09299a9`；sourceSha256 `62c8b29eb498c9528356a72988be6662c98a77e5fe7982ffa1d85f481ae3d953`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错 + XRD 演示缺 Cu Kα 线、NIST 偏差演示失败；改动→偏差指标可能漂移。
- 验证：核 :44/:171、CSV 头、hash；NOT_RUN（含测试阈值断言）。
- 证实/推断/未知：清单/消费/打包=**证实**；数据真实性=**未知**。

## apps--electron--resources--cslab--demo--silicon-diamond.poscar

- 职责：演示晶体结构数据（VASP POSCAR，246 字节）：金刚石硅结构，`cslab-demo.ts:39` DEMO_DATA_FILES 第 3 项，`cslab-demo-plates.ts:248` 直读 + `cslab-demo.test.ts:118` 用于 `clusterPeaks` 峰聚类演示。
- 消费：`cslab-demo.ts:39`（清单）+ `cslab-demo-plates.ts:248`（`fs.readFile(join(demoDir,'silicon-diamond.poscar'))`）+ 测试 `cslab-demo.test.ts:118`；格式走 `cslab-mol.ts:45` `.poscar→poscar`。
- 来源：金刚石结构硅的 POSCAR 演示数据；`change=unchanged_since_093f`。sourceBlob `8a987007b9258aba5805fdeddd289b4b4a8e6c03`；sourceSha256 `28bb7716f1a9db7e8e60787f91ffdfb5596fd011cf5fd41fa21bbf49fa9a61f4`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错、峰聚类演示/测试失败；改动→结构演示变化。
- 验证：核 :39/:248/测试 :118、POSCAR 头、hash；NOT_RUN。
- 证实/推断/未知：消费链=**证实**；结构参数=**未知**。

## apps--electron--resources--cslab--demo--silicon-srm640-benchmark.csv

- 职责：演示基准数据（CSV，74 字节）：NIST SRM640 硅标样峰位基准，`cslab-demo.ts:47` DEMO_DATA_FILES 第 11 项，`cslab-demo-plates.ts:249` 直读，用于 XRD 峰位偏差校验演示（`cslab-demo.test.ts:128/:139` nistMaxDeviationDeg<0.05）。
- 消费：`cslab-demo.ts:47` + `cslab-demo-plates.ts:249` + `cslab-demo.test.ts:128`；`assertDemoFiles` 硬校验。
- 来源：NIST SRM640 标准参考数据（峰位基准表）；`change=r03_pr44`。sourceBlob `2f7050fd509f15f31b628641b0a1f322e2c5531a`；sourceSha256 `37472b1e2a94497df9423279b171b3ca0bc83feddf80fd9c48c4f6b49b573928`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错、NIST 偏差演示/测试失败；改动→偏差指标漂移。
- 验证：核 :47/:249/测试 :128、CSV 头、hash；NOT_RUN。
- 证实/推断/未知：消费链=**证实**；与 NIST 官方值一致性=**未知**（未对外部基准核对）。

## apps--electron--resources--cslab--demo--srtio3-perovskite.cif

- 职责：演示晶体结构数据（CIF，697 字节）：SrTiO₃ 钙钛矿结构，`cslab-demo.ts:38` DEMO_DATA_FILES 第 2 项。
- 消费：`cslab-demo.ts:38` → `assertDemoFiles :67-80` → `createDemoLab` 登记；格式走 `cslab-mol.ts:41` `.cif→cif`。
- 来源：钙钛矿标准晶体结构（CIF）；`change=unchanged_since_093f`。sourceBlob `5e42a7ea8debe3379eef2eb03a7199072d4ccd0c`；sourceSha256 `d135b076c13b815fea660c7f0e320c04e74c6cadae2d76521593df7632172dc9`。
- 打包：进产物——`cslab/demo/` filter `**/*`（yml:119-121）。
- 影响：删除→演示数据缺失抛错；改动→钙钛矿演示变化。
- 验证：核 :38 清单、CIF 可解析、hash；NOT_RUN。
- 证实/推断/未知：清单/打包=**证实**；结构数据精度=**未知**。

## apps--electron--resources--cslab--requirements--formula-ocr.txt

- 职责：Python 增强通道「公式 OCR」profile 的 pip 依赖清单（38 字节）：`cslab-python-runtime.ts:33` `'formula-ocr': ['pix2text']`（额外包 Pix2Text）、`:40` 显示名「公式 OCR（Pix2Text，体积较大）」。
- 消费：`cslab-python-runtime.ts:82-89` `resolveRequirementsPath('formula-ocr')` 解析 `resourcesPath/cslab/requirements/formula-ocr.txt`（多候选 :84-:89）→ `:257-258` 缺失即失败 → `:330/:342` `pip install -r <requirements>` 装入 venv；profile 合法性由 `cslab-router.ts:1944`（`value === 'formula-ocr'` 等四值白名单）守卫。
- 来源：依赖清单（团队维护）；`change=unchanged_since_093f`。sourceBlob `b41174a503ef57a94156f853a22c2b9830290212`；sourceSha256 `2dd8442c9050800f3cdb12237135ccd7dda9705e18f207239827822ec161b77e`。
- 打包：进产物——`cslab/requirements/` 随目录 filter `**/*`（yml:119-121）。
- 影响：删除→公式 OCR 增强通道 pip 安装失败（:257-258 fail）；改动→安装的包集合/版本变化（含体积，:40 提示「体积较大」）。
- 验证：①核 :33/:82-89/:1944 引用链；②清单文本可解析；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/pip 实装（本轮统一 NOT_RUN）。
- 证实/推断/未知：解析与安装链=**证实**；清单内版本可安装性=**未知**（未跑 pip）。

## apps--electron--resources--cslab--requirements--formula.txt

- 职责：Python 增强通道「化学式解析」profile 的 pip 依赖清单（65 字节）。
- 消费：`cslab-python-runtime.ts:82-89` 解析 `requirements/formula.txt` → `:330/:342` `pip install -r`；profile 白名单 `cslab-router.ts:1944`（`'formula'`）。
- 来源：依赖清单（团队维护）；`change=unchanged_since_093f`。sourceBlob `f2f1faac5521a4f0ed1013aaf28f06cedde884ce`；sourceSha256 `39b519524f9cf67f044ca29a5871d73a5cdd121b210229db5ceeabaff0a76217`。
- 打包：进产物——`cslab/requirements/` filter `**/*`（yml:119-121）。
- 影响：删除→formula profile 安装失败；改动→依赖集合变化。
- 验证：核 :82-89/:1944 链、文本、hash；NOT_RUN。
- 证实/推断/未知：解析链=**证实**；可安装性=**未知**。

## apps--electron--resources--cslab--requirements--instrument.txt

- 职责：Python 增强通道「仪器数据提取」profile 的 pip 依赖清单（44 字节）；对应 `cslab-instrument-extractor.py` 脚本族（cslab-python.ts:28-29 解析该脚本路径）。
- 消费：`cslab-python-runtime.ts:82-89` 解析 `requirements/instrument.txt` → `:330/:342` `pip install -r`；profile 白名单 `cslab-router.ts:1944`（`'instrument'`）。
- 来源：依赖清单（团队维护）；`change=unchanged_since_093f`。sourceBlob `5f94e1feb447579ee5e9b94a829c5e076fc27576`；sourceSha256 `f41f20e85c5014c63cd99d592f377887469f243a047d38471d475ced4d9e8cd2`。
- 打包：进产物——`cslab/requirements/` filter `**/*`（yml:119-121）。
- 影响：删除→instrument profile 安装失败；改动→依赖集合变化。
- 验证：核 :82-89/:1944 链、文本、hash；NOT_RUN。
- 证实/推断/未知：解析链=**证实**；与脚本依赖匹配度=**未知**（未核 import 面）。

## apps--electron--resources--cslab--requirements--plot.txt

- 职责：Python 增强通道「绘图/数字化」profile 的 pip 依赖清单（83 字节）；对应 plot digitizer 脚本族（`cslab-plot-digitizer.py`）。
- 消费：`cslab-python-runtime.ts:82-89` 解析 `requirements/plot.txt` → `:330/:342` `pip install -r`；profile 白名单 `cslab-router.ts:1944`（`'plot'`）。
- 来源：依赖清单（团队维护）；`change=unchanged_since_093f`。sourceBlob `cf20f750c7c48d2efa01ae4384ba2ec2e37d26b2`；sourceSha256 `3532af8b96f1676ae6b023c722a10d8dd9b83ae3cf1812baa0b5cfcf53f636e8`。
- 打包：进产物——`cslab/requirements/` filter `**/*`（yml:119-121）。
- 影响：删除→plot profile 安装失败、数字化增强不可用；改动→依赖集合变化。
- 验证：核 :82-89/:1944 链、文本、hash；NOT_RUN。
- 证实/推断/未知：解析链=**证实**；可安装性=**未知**。
