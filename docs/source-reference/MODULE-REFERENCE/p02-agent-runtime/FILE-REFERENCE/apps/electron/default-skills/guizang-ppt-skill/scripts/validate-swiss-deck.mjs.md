---
path: apps/electron/default-skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c378476c3b4c595b424f586bd71db06c7dcdd205
sha256: 66158ce5ce763b5886567a073a15d9b189521e5ac8e109782cb2451686dbeca1
lines: 110
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs

## 1. 结论与边界

Swiss 模式 PPT deck 的**锁定规则校验器**（Node ESM 单文件，`apps/electron/default-skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs:1-110`）：读生成的 index.html，按 swiss-layout-lock.md 注册的布局集合校验每页 slide。CLI：`node scripts/validate-swiss-deck.mjs <index.html> [--allow-experimental]`（`:7-10`，无文件参数 exit 2；校验失败 exit 1）。

## 2. 导出与关键符号

无导出（脚本）。常量/逻辑：

| 项 | 行 | 说明 |
| --- | --- | --- |
| `allowedLayouts` | 17-21 | `SWISS-COVER-ASCII`/`SWISS-CLOSING-ASCII` + `S01`-`S22`（程序生成） |
| `slideRe` | 23-24 | `<section class="...slide...">...</section>` 提取（先剥 HTML 注释 `:13`） |
| 布局锁 | 31-37 | 缺 `data-layout`/未注册布局→error |
| 实验结构拦截 | 39-41 | P23/P24、Swiss Image Split、swiss-img-split/grid 等→error（`--allow-experimental` 豁免） |
| statement 页 | 43 | S03/S09/S10/封面/封底 豁免居中限制 |
| 排版约束 | 44-56 | 非 statement 页 top 1800 字符内 `text-align:center`→error；`align-self:center`+h1/h2→error；fr/fr grid+h1/h2→warning |
| SVG 约束 | 58-60 | SVG 含可见 `<text>`→error（标签走 HTML） |
| 图片槽绑定 | 62-68 | 本地 `images/` 图缺 `data-image-slot`→error |
| S15/S16 21:9 框 | 70-87 | `s15/s16-(grid|brief)-21x9` 槽：`fit-contain`→error、缺 `r-21x9`→error、固定 vh 高→error |
| S22 约束 | 89-96 | 必须 `s22-hero-21x9`；`object-position:top center`→error（裁脸，建议 center 35%） |
| 汇总 | 99-110 | warnings 走 stderr；errors→`Swiss deck validation failed`+逐条+exit 1；通过→`passed: N slide(s)` |

## 3. 输入输出契约

输入=生成的 HTML 文本；输出=stdout/stderr 文案（agent 消费修复）+退出码（0/1/2）。

## 4. 失败与降级

无 try/except：读文件失败即抛（静态）；`--allow-experimental` 为唯一豁免开关。

## 5. 修改影响面

guizang-ppt-skill 的 Swiss 锁定模式质量门；与 `template-swiss.html` 的布局 API 与 `swiss-layout-lock.md`（非本批）三方契约同步。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部 10 组校验规则/退出码 | 已证实 | `:17-110` |
| swiss-layout-lock.md 注册清单 | 推断 | `:36` 文案引用（该 md 未读） |
| 运行结果 | 未知 | NOT_RUN |

## 7. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全规则/分支 | §2 | covered |
| 运行 | §6 | unknown（NOT_RUN） |
