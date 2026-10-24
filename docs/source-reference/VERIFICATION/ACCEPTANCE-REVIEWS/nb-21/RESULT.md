# nb-21 独立复核结果（accepted）

- 批次 `nb-21`（`p05-review-engine · p05.review-services`，18 文件：4 source + 14 test）；冻结 `05fb2565e2…`；复核者 `docs-r07-qa-ui-20261023`；2026-10-23T17:25:00Z
- **batchVerdict: accepted（18/18）**。2 条低级计数备注（N21-1/N21-2）G4 前关闭，不阻断。
- NOT_RUN（产品测试/typecheck/构建/GUI/真实模型）；测试断言不等于已运行。

## 封版绑定（seal v2）

READY `be8f2b10…`、DONE `5da45b9e…`、MANIFEST `25481010…`、ZIP `8b7409b1…`（59842 B，21 entries）。G0 PASS：18 篇四方哈希一致；源 18/18 blob+sha+行数复算一致；SCOPE==MANIFEST 唯一；ZIP 安全、元数据一致、无漂移、链自洽。

## G1

8 source 11 章 / 14 test 6 章（test 模板合规）；front matter 复算一致；三态/NOT_RUN 齐；§2 符号行号**严格内容核验** 6/6 全过（无 nb-13 式偏移）；行号引用全部可解析。

## G2 真值核验

- **exports 全对**：review-ipc 1（`registerReviewIpc :107`）+ 内部 `SOURCE_ROLES :70`/`CASE_TYPES :73`/`requireString :76-81`/`assertLegacyChannelNotSuperseded :87` 逐行属实；review-json 1（三级提取 `:5-9`/`:10-17`/`:18-26` 及裸数组注意属实）；model-identity 2（`:9-19`/`:22-38`）；pi-admission 4（自纠计数属实）；owner-adapter 9；principal-service 13（计数声明见 N21-2）。
- **review-ipc 通道表抽核逐行相符**：CREATE_CASE `:159`/`:161`/`:166-174`/`:182-184`/`:187`、CONFIRM_RULE_PACK `:386-388`/`:392`、IMPORT_DOCUMENT `:403`/`:408`（选择框期间窗口可变注释）/`:414-415`/`:428`。
- **测试**：88 用例计数全对（7/23/12/5/1/7/5/8/2/4/6/8）；generalization 用例 6/17/18 以 prose+覆盖表完整收录；§3 真实断言抽核（3×4 引用）均落 expect/throws 行段。

## 低级备注（非阻断，G4 前关闭）

1. **N21-1**：review-identity-authority.test 手册「8 test」应为 12（覆盖完整，仅计数声明错）。
2. **N21-2**：principal-service §2 计数自相矛盾（10/12/14 三处互斥，真实 13 = type 3/interface 3/const 1/class 1/function 5）；owner-adapter「5 type/interface」分解应为 6（总数 9 正确）。全部符号列名定位正确。

## acceptedHashes（18，exact 见 REVIEWED-HASHES.json）

review-ipc / review-json / review-model-identity / review-pi-admission / review-pi-owner-adapter / review-principal-service + 12 test 手册（hash 明细在 `reviews/nb-21/REVIEWED-HASHES.json` 与 RESULT.json `acceptedHashes`）。

## 边界

未改源码/作者正文/candidate/全局总账；已 seal 不回写；accepted 仅限静态文档 scope；运行期行为未知。
