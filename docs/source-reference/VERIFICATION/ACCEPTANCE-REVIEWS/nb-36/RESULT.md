# nb-36 独立复核结果（accepted）

- 批次 `nb-36`（`p07-shared-libs · p07.core-providers`，11 文件：8 source + 3 test）；冻结 `05fb2565e2…`；复核者 `docs-r07-qa-ui-20261023`；2026-10-23T17:45:00Z
- **batchVerdict: accepted（11/11）**。2 条低级计数备注（N36-1/N36-2）G4 前关闭，不阻断。
- NOT_RUN（产品测试/typecheck/构建/GUI/真实模型）；测试断言不等于已运行。

## 封版绑定（seal v2）

READY `b037e19e…`、DONE `a383955d…`、MANIFEST `27ad308a…`、ZIP `bb343d78…`（33037 B，14 entries）。G0 PASS：11 篇四方哈希一致；源 11/11 blob+sha+行数复算一致；SCOPE==MANIFEST；ZIP 安全、元数据一致、无漂移、链自洽。

## G1/G2

- 8 source 11 章 / 3 test 6 章；front matter 复算一致；§2 符号行号严格内容核验 8/8 全过；行号引用可解析。
- **exports 对账**：sse-reader 5/5、thinking-capability 4/4、url-utils 13/13、user-agent 3/3、url-nul-safety 2/2、runtime 35/35、wechat 11/11 精确；study 声明 45 实为 **44**（N36-1）。
- wechat §2 行号（`:11/:25/:37/:46/:59/:68/:74/:81/:91/:99/:112`）与源逐行相符；url-nul-safety 双重检查（CONTROL_CHARS `:15`、编码 NUL、hostname 复检、吞掉其它 URL 错）与源一致。
- **测试**：sse-reader 7/7、usage-parsing 5/5 行段覆盖；url-utils.test 12 describe 行段全覆盖 65 用例（表 12 行正确）。

## 低级备注（非阻断，G4 前关闭）

1. **N36-1**：`study.ts.md`「export 共 45 个」及 §10 已证实行——真实 **44**（const 5/interface 29/type 10）；§2 八组 44/44 覆盖完整、无幻影符号；所引 `grep -n "^export"` 实际输出 44 行。
2. **N36-2**：`url-utils.test.ts.md`「11 describe / 约 52 test」——真实 **12 describe / 65 test**（§2 表 12 行与 describe 逐段对应、覆盖完整）。

## acceptedHashes（11，exact 见 `reviews/nb-36/REVIEWED-HASHES.json`）

sse-reader `7efc5c88…`（test `8cb87f49…`）、thinking-capability `fe2c0793…`、url-utils `ba749ed0…`（test `13bd47b2…`）、usage-parsing `a129629c…`、user-agent `1d53c18e…`、url-nul-safety `99c9015f…`、runtime `fc9f588e…`、study `d64bda48…`、wechat `269470b3…`（完整 64 位见 REVIEWED-HASHES.json 与 RESULT.json `acceptedHashes`，已与 READY 逐项校验一致）。

## 边界

未改源码/作者正文/candidate/全局总账；已 seal 不回写；accepted 仅限静态文档 scope；运行期行为未知。
