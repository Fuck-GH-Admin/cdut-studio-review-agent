# p03-integrations__demo-data 索引（CDUT Science 演示/基准数据集：金红石 TiO2 演示语料 + MATLAB 解析压测语料）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p03-integrations__demo-data`（owner `p03-integrations`，family `demo-data`）共 7 个 resource 文件（`demo-data/cdut-science-rutile/` 5 个 + `demo-data/matlab-benchmarks/` 2 个 .mat）。每文件七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（整组共同事实，逐文件小节引用不重复）：

- **两个子家族**：①`cdut-science-rutile/`＝CSLab「演示实验室 · Origin × VESTA」（`apps/electron/src/main/lib/cslab/cslab-demo.ts:30-32` DEMO_LAB_NAME）的内置演示数据语料（金红石 TiO2 CIF、金 FCC 纳米颗粒 PDB、Cu/Co Kα XRD 与 Raman 数据表，见 cslab-demo.ts:4-12 头注释）；②`matlab-benchmarks/`＝MATLAB .mat 解析链路的「理论最高复杂度」压测语料，由同目录 `generate_max_mat.py`（非本组文件）生成。
- **双副本映射（cdut-science-rutile 5 文件，sha256 实测）**：`demo-data/cdut-science-rutile/*`（树内源/测试副本）↔ `apps/electron/resources/cslab/demo/*`（打包副本）**5/5 逐字节一致**（sha256sum 实测）。运行时只加载打包副本：`electron-builder.yml:118-122` `extraResources` `from: resources/cslab to: cslab` → `resolveDemoDir()`（cslab-demo.ts:53-60）打包态取 `process.resourcesPath/cslab/demo`、开发态取 `<appPath>/resources/cslab/demo`（`CSLAB_DEMO_DIR` 环境变量可覆盖，:54-56）。
- **运行时加载链（谁加载→何时生效→行为约束）**：一键创建演示实验室时（IPC/入口至 `buildDemoLab` 流程），`DEMO_DATA_FILES` 白名单（cslab-demo.ts:34-48）逐文件 `join(demoDir, fileName)`，`assertDemoFiles()`（:62-78）`fs.access` 校验存在，**缺任何一个即 throw「演示数据缺失」整批失败**；随后 `tableSeriesFor()`（调用点 :171-173）把 XRD/Raman CSV 转 `CsLabTableSeries` 进演示图版（`buildDemoPlates`，cslab-demo-plates.ts）；CIF/PDB 走仪器格式嗅探与结构渲染（`cslab-mol.ts:42` `'.pdb': 'pdb'` 等格式映射）。树内 `demo-data/` 副本的直接消费者＝测试 `cslab-science.test.ts:17/:25`（new URL 相对路径读 `demo-data/cdut-science-rutile/rutile-tio2.cif` 后 `ingestFiles`）。
- **打包口径（整组）**：`demo-data/` 根目录本身**不在** electron-builder `files:`（:44-68 仅 dist/**、package.json、node_modules/**）或 `extraResources` 的任何 `from:` 路径；进产物的是 `resources/cslab/demo` 字节副本（cdut-science-rutile 5 文件）；`matlab-benchmarks/` 2 个 .mat **无任何打包路径**（resources/cslab/demo 实测无 .mat）。
- **.mat 解析链（matlab-benchmarks 共用）**：`cslab-formats/sniff.ts` 头部嗅探——v7.3(HDF5) 判定（:36-41，note「需要可选 Python 增强通道（h5py）才能提取数值」）、`isMatLevel5`（:43）、未知 .mat（:47-49）；Level-5 走纯 TS 解析器 `cslab-formats/mat-level5.ts`（:2 头注释「MATLAB Level 5 (.mat) 纯 TypeScript 解析器」，:5 注明 v7.3 仅识别交 Python）；v7.3 走 `cslab-iron-cage.ts:138-142` `tryParseWithPython(filePath,'mat-v73')`（可选 Python/h5py 增强通道 `cslab-python.ts:5`，通道缺失则仅登记原始文件元数据）。
- 7 文件均无 TS 硬编码 import（数据文件经路径 join/readFileSync/测试 URL 读取）；`inventory/INDEX-FACTS.tsv` 仅作检索线索，未抄入正文。

## demo-data--cdut-science-rutile--gold-fcc-nanoparticle.pdb

- 职责：金 FCC 纳米颗粒结构演示数据（PDB 文本，2318 行/182971 字节）——头部 `REMARK CDUT Science demo: FCC gold nanoparticle`、`REMARK atoms=2315 radius=21 A`（:1-2），2315 个 `ATOM ... AU` 金原子坐标（:3 起），供 Mol* 结构渲染演示。
- 消费：①`cslab-demo.ts:40` `DEMO_DATA_FILES` 白名单条目（一键演示实验室必需数据，缺失即 `assertDemoFiles` throw，cslab-demo.ts:62-78）；②新手引导教练行程 `apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-runner.ts:251` `{ kind: 'open-asset-by-title', title: 'gold-fcc-nanoparticle.pdb' }`（教练行程引导用户打开本资产）；③格式映射 `cslab-mol.ts:42` `'.pdb': 'pdb'`。树内 `demo-data/` 副本零代码直接读者（cslab-science.test.ts 只读 cif）。
- 来源：CDUT Science 演示数据集（REMARK 自述 demo 数据；生成脚本/仪器来源=未知）；`change=unchanged_since_093f`。sourceBlob `2172705db0ceeecd6f4d3d49c569ecbb129d398b`；sourceSha256 `57ca3587d13dc976de119bd227a3faaa6a8546266d5c714829e8d45ceaf59094`。
- 打包：本体不进产物（demo-data/ 不在 files/extraResources from 列表）；**打包副本** `apps/electron/resources/cslab/demo/gold-fcc-nanoparticle.pdb`（sha256 与本文件逐字节一致，实测）经 `electron-builder.yml:118-122` `resources/cslab→cslab` 进产物，运行时路径 `process.resourcesPath/cslab/demo/`（cslab-demo.ts:57）。
- 影响：删除打包副本→一键演示实验室 `assertDemoFiles` 抛「演示数据缺失」整流程失败（cslab-demo.ts:74-78）；教练行程 `open-asset-by-title` 打开失败（coach-tour-runner.ts:251）；删除树内副本→cslab-science.test 不涉本文件（仅 cif），但双副本映射断裂、演示语料源丢失。
- 验证：①`file`/头 3 行核 PDB 格式与 atoms=2315 自述；②`sha256sum` 与 lock 及 `resources/cslab/demo` 副本三方对照（已核一致）；③核 cslab-demo.ts:40、coach-tour-runner.ts:251 引用行；NOT_RUN：产品测试/typecheck/构建/GUI/演示实验室实际创建（本轮统一 NOT_RUN）。
- 证实/推断/未知：引用三处、双副本一致、打包链=**证实**（实读+hash 实测）；「2315 原子与 REMARK 一致」=**推断**（未逐行数 ATOM 记录）；数据生成来源=**未知**（无生成脚本/仪器记录，查过树内 demo-data 与 cslab 目录）。

## demo-data--cdut-science-rutile--rutile-raman-532nm.csv

- 职责：金红石 TiO2 Raman 532nm 激发谱数据表（CSV，1402 行/16210 字节，表头 `raman_shift,intensity`，100.0 起步进 0.5 cm⁻¹ 两列），供演示实验室「拉曼分峰」图版（cslab-demo.ts:11 头注释「Raman 数据表（Origin 绘图与拟合）」）。
- 消费：①`cslab-demo.ts:46` `DEMO_DATA_FILES` 白名单（缺失即 throw，:62-78）；②`cslab-demo.ts:173` `tableSeriesFor('rutile-raman-532nm.csv')` 转 `CsLabTableSeries` 进演示图版（对应演示图版 id `demo-rutile-raman-fit`，cslab-demo-plates.ts:54、cslab-demo.test.ts:28/:147）。
- 来源：CDUT Science 演示数据集（合成/实测来源=未知）；`change=unchanged_since_093f`。sourceBlob `9899b0687b32f2db3b4f74d953cbc911626b1126`；sourceSha256 `084d3063b81229846cd1f28d126388fc6be8a10e12121b57e1a243b265d6b419`。
- 打包：本体不进产物；打包副本 `apps/electron/resources/cslab/demo/rutile-raman-532nm.csv`（sha256 一致，实测）经 electron-builder.yml:118-122 进产物（`process.resourcesPath/cslab/demo/`）。
- 影响：删除打包副本→演示实验室整批数据校验失败（cslab-demo.ts:62-78）；`demo-rutile-raman-fit` 图版无数据（:173）；改数据→演示拟合图版数值变化（演示语义漂移）。
- 验证：①head 核表头/步进；②`sha256sum` 三方对照（lock/树内/打包副本，已核）；③核 cslab-demo.ts:46/:173 引用行；NOT_RUN：产品测试/typecheck/构建/GUI/实际绘图（统一 NOT_RUN）。
- 证实/推断/未知：引用、双副本一致、打包链=**证实**；「谱峰形态与金红石 Raman 特征相符」=**未知**（未做谱学核验，仅格式实读）；数据来源=**未知**。

## demo-data--cdut-science-rutile--rutile-tio2.cif

- 职责：金红石 TiO2 晶体结构演示 CIF（35 行/961 字节）——`data_rutile_tio2_demo`（:3），头注释自述「仅用于功能演示：常规晶胞显式列出 6 个原子，便于 Mol* 直接渲染」（:2），`_audit_creation_method 'CDUT Science demo dataset'`（:4）。
- 消费：①`cslab-demo.ts:37` `DEMO_DATA_FILES` 白名单（缺失即 throw，:62-78）；②`cslab-demo-plates.ts:407` `fs.readFile(join(input.demoDir,'rutile-tio2.cif'),'utf8')` 读文本构建演示图版（VESTA/PXRD 演示，cslab-demo.ts:6-7 头注释）；③测试 `cslab-science.test.ts:17/:25` 直接读**树内 demo-data 副本**（new URL 相对路径）`ingestFiles` 走科学数据入库链。
- 来源：CDUT Science 演示数据集（自述 demo dataset）；`change=unchanged_since_093f`。sourceBlob `b62271a399c3faf3ac2c909604069e10e8f201c8`；sourceSha256 `848e6b8784d118f854c1a800407b1a78974f19cc360aabd450929bfddfda6ba1`。
- 打包：本体不进产物；打包副本 `apps/electron/resources/cslab/demo/rutile-tio2.cif`（sha256 一致，实测）经 electron-builder.yml:118-122 进产物。
- 影响：删除打包副本→演示实验室数据校验失败、cslab-demo-plates.ts:407 readFile 抛错演示图版构建失败；删除树内副本→cslab-science.test.ts:17 路径失效测试红；改结构参数→Mol* 演示渲染与 PXRD 演示数值漂移。
- 验证：①通读 35 行核 data 块/6 原子自述；②`sha256sum` 三方对照（已核）；③核 cslab-demo.ts:37、cslab-demo-plates.ts:407、cslab-science.test.ts:17 三处引用行；NOT_RUN：产品测试/typecheck/构建/GUI/Mol* 渲染（统一 NOT_RUN）。
- 证实/推断/未知：三处引用、双副本一致、内容自述=**证实**；「6 原子晶胞与金红石 P1 设定一致」=**推断**（CIF 自述+格式实读，未跑晶体学校验）；数据来源=**未知**。

## demo-data--cdut-science-rutile--rutile-xrd-co-ka.csv

- 职责：金红石 TiO2 XRD（Co Kα 靶）数据表（CSV，4002 行/48102 字节，表头 `two_theta,intensity`，10.00° 起步进 0.02°），供演示实验室「双靶 XRD」图版的 Co 靶支（cslab-demo.ts:9-10 头注释「金红石 Cu/Co Kα XRD」）。
- 消费：①`cslab-demo.ts:45` `DEMO_DATA_FILES` 白名单（缺失即 throw，:62-78）；②`cslab-demo.ts:172` `tableSeriesFor('rutile-xrd-co-ka.csv')` 转数据系列进「双靶 XRD」演示图版（cslab-demo-plates.ts:52 `demo-rutile-xrd`）。
- 来源：CDUT Science 演示数据集（合成/实测来源=未知）；`change=unchanged_since_093f`。sourceBlob `b1b78ee3bd5d272c7134d3267f516233447028cc`；sourceSha256 `02225cda1fc00f3780437cc0e2f94cb643d8892633fee71380aaf2b97fe67742`。
- 打包：本体不进产物；打包副本 `apps/electron/resources/cslab/demo/rutile-xrd-co-ka.csv`（sha256 一致，实测）经 electron-builder.yml:118-122 进产物。
- 影响：删除打包副本→演示实验室数据校验失败（cslab-demo.ts:62-78）；`demo-rutile-xrd` 双靶图版缺 Co 靶系列（:172）；改数据→双靶对比演示漂移。
- 验证：①head 核表头/步进；②`sha256sum` 三方对照（已核）；③核 cslab-demo.ts:45/:172 引用行；NOT_RUN：产品测试/typecheck/构建/GUI/实际绘图（统一 NOT_RUN）。
- 证实/推断/未知：引用、双副本一致、打包链=**证实**；「Co Kα 波长换算正确性」=**未知**（未做谱学核验）；数据来源=**未知**。

## demo-data--cdut-science-rutile--rutile-xrd-cu-ka.csv

- 职责：金红石 TiO2 XRD（Cu Kα 靶）数据表（CSV，4002 行/48104 字节，表头 `two_theta,intensity`，10.00° 起步进 0.02°），供「双靶 XRD」演示图版的 Cu 靶支；亦是 cslab-molstar-math.test.ts:66-106 晶面/2θ 数学断言（rutile (110) d 与 2θ=27.44）所对照的数据族。
- 消费：①`cslab-demo.ts:44` `DEMO_DATA_FILES` 白名单（缺失即 throw，:62-78）；②`cslab-demo.ts:171` `tableSeriesFor('rutile-xrd-cu-ka.csv')` 进 `demo-rutile-xrd` 图版（cslab-demo-plates.ts:52、cslab-demo.test.ts:26/:86 断言 `demo.plotId==='demo-rutile-xrd'`）。
- 来源：CDUT Science 演示数据集（合成/实测来源=未知）；`change=unchanged_since_093f`。sourceBlob `69637ece8d698e5eb241e3ff1260364cd09299a9`；sourceSha256 `62c8b29eb498c9528356a72988be6662c98a77e5fe7982ffa1d85f481ae3d953`。
- 打包：本体不进产物；打包副本 `apps/electron/resources/cslab/demo/rutile-xrd-cu-ka.csv`（sha256 一致，实测）经 electron-builder.yml:118-122 进产物。
- 影响：删除打包副本→演示实验室数据校验失败；`demo-rutile-xrd` 图版缺 Cu 靶系列（:171）；改数据→双靶对比与 (110) 峰演示漂移。
- 验证：①head 核表头/步进；②`sha256sum` 三方对照（已核）；③核 cslab-demo.ts:44/:171 引用行；NOT_RUN：产品测试/typecheck/构建/GUI/实际绘图（统一 NOT_RUN）。
- 证实/推断/未知：引用、双副本一致、打包链=**证实**；「27.44° (110) 峰与数据表峰位一致」=**推断**（测试断言对照，未实测峰拟合）；数据来源=**未知**。

## demo-data--matlab-benchmarks--matlab_level5_max_compressed_complex.mat

- 职责：MATLAB Level 5 格式「理论最高复杂度」解析压测语料（二进制 .mat，1832064 字节；lines=0 非文本）——由同目录 `generate_max_mat.py:8-40` 生成：50000×4 `complex128` 矩阵 `sensor_stream_50k`（时间/5Hz 正弦/15Hz 阻尼余弦/复阻抗谱）+ 标量 `sample_rate_hz` + 元数据 `experiment_title`（"CDUT Science CSLab Benchmark 50k"），`sio.savemat(..., format="5", do_compression=True)` 全体 zlib 压缩（生成器 :32-40）。
- 消费：**未发现代码级消费者**（全树 grep `matlab_level5_max`/`matlab-benchmarks` 仅命中生成器 `demo-data/matlab-benchmarks/generate_max_mat.py` 自身；查过 apps/packages/scripts 的 ts/tsx/js/mjs/py/json/yml/md）——推断消费者＝Level-5 纯 TS 解析器 `cslab-formats/mat-level5.ts`（:2「纯 TypeScript 解析器」）的人工压测/基准语料（文件名 max_compressed_complex 与生成器注释「理论最高复杂度」互证）；解析入口链：CSLab 仪器铁笼 ingest `sniff.ts:43` `isMatLevel5` 判定 → mat-level5.ts 解析（格式 id `matlab-level5`，:273）。谁加载→何时生效→行为约束：无自动加载；用户/开发者把文件投入 ingest 流程时生效，约束=解析器须能解开 zlib 压缩复数矩阵（行主序/转置处理）。
- 来源：`generate_max_mat.py`（同目录生成器，scipy.io.savemat format5+do_compression；作者机器路径 `c:\Users\Belie\...`（生成器 :6）为生成时落盘路径，非运行时路径）；`change=unchanged_since_093f`。sourceBlob `ee415a4a4be6440574261897e6a223aabd480b87`；sourceSha256 `a447b7fbd76143484c9cafab28c3bf6e4d9b444f27455584da9241f1669d7db9`。
- 打包：**不进产物**——不在 electron-builder `files:`（:44-68）/`extraResources`（:70 起含 resources/cslab、resources/demo）任何清单；`resources/cslab/demo` 实测无 .mat（证实）。
- 影响：删除→失去 Level-5 压缩复数解析的压测基准（无代码断言依赖，无测试红）；改字节→压测结论失真；对产品功能无直接影响（零代码消费者）。
- 验证：①`file` 头实测 MATLAB 5.0 MAT 格式（Level-5 魔数）；②sha256=lock（封版实测）；③与生成器参数（50000×4 complex128、do_compression）对照；④解析器实跑=NOT_RUN（本轮统一不跑）。
- 证实/推断/未知：格式、生成器出处、零代码消费者=**证实**（实读+负向检索）；「mat-level5.ts 是其压测对象」=**推断**（命名+解析器职责对应，无基准脚本佐证）；历史压测结果/用途记录=**未知**（查过树内无 benchmark 报告）。

## demo-data--matlab-benchmarks--matlab_v73_max_hdf5_chunked.mat

- 职责：MATLAB v7.3（HDF5）「理论最高复杂度」解析压测语料（二进制 .mat，1501594 字节；lines=0）——由同目录 `generate_max_mat.py:42-68` 生成：严格 HDF5 容器（`\x89HDF\r\n\x1a\n`）、`telemetry_dataset_50k` 50000×4 float64（chunks=(1000,4) 分块 + gzip 压缩 :57-65）、`MATLAB_class`/`MATLAB_empty` 元数据属性（:50-62），生成器注释明言「CDUT Studio 提取器能自动处理并在行数<列数时转置回 (50000,4)」（:55-56）。
- 消费：**未发现代码级消费者**（全树 grep `matlab_v73_max`/`matlab-benchmarks` 仅命中生成器自身；查过 apps/packages/scripts）——推断消费者＝MAT v7.3 解析链的人工压测语料：`sniff.ts:36-41` 判 `mat-v73`（note「需要可选 Python 增强通道（h5py）才能提取数值」）→ `cslab-iron-cage.ts:138-142` `tryParseWithPython(filePath,'mat-v73')`（可选 Python/h5py 通道 `cslab-python.ts:5`；通道缺失仅登记元数据）。谁加载→何时生效→行为约束：无自动加载；投入 ingest 时生效，约束=分块+gzip 数据集须能提取并转置回行主序。
- 来源：`generate_max_mat.py`（h5py 写 HDF5，chunks=(1000,4)、compression=gzip level6）；`change=unchanged_since_093f`。sourceBlob `4d16d37ec4f30887c455d910a85784bae4a3aa6b`；sourceSha256 `93111ecda56fe3f72b6f7400d1b6492f5115a49de642032d68237e3163da4480`。
- 打包：**不进产物**（同上：不在 files/extraResources 任何清单，resources/cslab/demo 无 .mat）。
- 影响：删除→失去 v7.3/HDF5 通道的压测基准（无代码断言依赖）；改字节→压测失真；产品解析链不受直接影响。若 Python 增强通道实现回归，本语料是唯一现成的高复杂度 v7.3 样本（推断）。
- 验证：①`file`/头 8 字节实测 `\x89HDF` 魔数；②sha256=lock（封版实测）；③与生成器参数对照（chunks/gzip/MATLAB_class）；④h5py 通道实跑=NOT_RUN（统一 NOT_RUN）。
- 证实/推断/未知：格式、生成器出处、零代码消费者、v73 解析链路由=**证实**；「压测对象为 Python h5py 通道」=**推断**；历史压测结果=**未知**。

## 未运行 / 未知

- NOT_RUN（本轮统一）：产品测试（bun test/cslab 测试）、typecheck、构建、Electron/GUI、演示实验室实际创建、Mol*/Origin 图版渲染、.mat 解析实跑（含 Python h5py 通道）。
- 未知汇总：5 个 cdut-science-rutile 数据文件的生成来源（合成 or 仪器实测）；2 个 .mat 的历史压测记录；demo-data/ 与 resources/cslab/demo 双副本的维护/同步机制（树内无同步脚本，查过 scripts/copy-resources.ts 只拷 apps/electron/resources→dist/resources，与 demo-data/ 无关）。
- 依据边界：消费/打包结论均冻结树实读+hash 实测；`inventory/INDEX-FACTS.tsv` 仅作检索线索未抄入正文。
