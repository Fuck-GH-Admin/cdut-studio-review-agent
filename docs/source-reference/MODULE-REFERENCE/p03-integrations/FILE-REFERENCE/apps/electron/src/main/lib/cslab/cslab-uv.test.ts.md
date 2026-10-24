---
path: apps/electron/src/main/lib/cslab/cslab-uv.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe41a96167323acf2a804beb7a90f92f54698b32
sha256: ab96faf31b749eadf9305bac749f827e1b1a88eccb130169db9e3200a9524b8e
lines: 95
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-uv.test.ts

## 1. 测试目标

uv 自举**纯函数测试**（`apps/electron/src/main/lib/cslab/cslab-uv.test.ts:1-3`）：目标映射/校验解析/安装路径/校验分级判定。被测 `./cslab-uv`（`resolveUvTarget/parseUvChecksum/getUvInstallDir/getUvBinaryName/classifyUvChecksum`）与 `./cslab-python-runtime`（`getVenvPythonPath`，`:59`——**非本批**，跨文件归属）。mock 边界：`beforeAll` 临时目录+`PROFER_CONFIG_DIR` 隔离（`:12-15`）、afterAll 清理（`:17-23`）；被测函数经 `await import` 动态载入。

## 2. 用例清单

3 describe、8 test：

- `uv 目标映射`（`:25`）2：`:26` 六平台/架构资产名精确映射、`:36` 未知平台返 null。
- `校验与安装路径`（`:42`）3：`:43` .sha256 文本解析（64hex 小写化+非哈希 null）、`:50` 安装目录=配置目录 tools/uv/...+二进制名平台感知、`:58` venv Python 路径平台感知。
- `uv 校验分级判定`（`:65`）4：`:69` **官方指纹权威**（不符即 reject 且不可被 pinned/mirror 降级放行，`:74-76`）、`:79` 内嵌命中=pinned 强信任、`:84` 内嵌未中退镜像自证=mirror-consent（镜像不符 reject）、`:90` 无任何指纹=reject。

## 3. 真实断言

`:28-33` 六资产名；`:38` freebsd null；`:46-47` 哈希解析两路；`:53-55` 路径/二进制名；`:60-61` win32→Scripts/python.exe、linux→bin/python；`:71-76` official/reject/不可降级；`:81` pinned；`:86-87` mirror-consent/reject；`:92-93` 双 reject。

## 4. 未覆盖与脆弱点

未覆盖：下载/解压/审计/弹窗（I/O 面）、`ensureUv` 编排、镜像源轮换、60s 总熔断。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例锚点与断言文本 | 已证实 | `:25-94` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 纯函数 5 个 | §2/§3 | covered |
| I/O/编排 | §4 | unknown（未覆盖） |
| 实际运行 | §5 | unknown（NOT_RUN） |
