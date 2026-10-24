# nb-121 独立复核报告（QA：docs-r07-qa-extra-06-20261024）

- 批：nb-121（p08-renderer-ui · p08.renderer-lib，18 文件/2039 行）；sealId `seal-bdf6c0926e739f28`；复核时间 2026-10-23T20:26:24Z
- **batchVerdict：accepted（18/18）**；2 minor 转 ERRATA（无阻断）

## G0 — PASS
- 机械：DONE→READY/MANIFEST/ZIP 哈希链自洽；sealId 独立复算 `seal-bdf6c0926e739f28` 一致；18 manual 字节=READY=MANIFEST；源绑定 18/18==manager scope；ZIP 21 条目（18 manual+2 mechanical TSV+MANIFEST）无 READY/DONE/reviews。
- 格式 18/18：front matter 11 项全对、source 11 章/test 6 章、status=authored、evidence=static、NOT_RUN 齐。

## G1 — PASS
- UNVERIFIED.md 5 节显式披露与预读独立发现吻合；批外 dark-mode-guards.test.ts:119-131 静态守卫声明回源属实；34 test 计数（14/4/6/3/4/3）与 QA 独立计数一致。

## G2 — 逐文件事实（18 accepted）
- 机械复算全对：model-logo 四表键数 54/54（同键同序）/23/23/17/17 + 45 PNG import；node-zlib-stub 20 函数 7+7+6；ofv-extensions 44 项总数。
- 回源抽查命中：normalize-latex 调用点 reasoning.tsx:243/message.tsx:1245（含链式串接）；InteractivePreviewViewport.tsx:261 同名局部函数排除属实；model-logo 消费方 scroll-minimap:484/ModelSelector:445/ChannelForm:96；stub vite alias :56-57/:61-62。
- 照实记录项验证：ofv-extensions 两处注释/代码差异（"两处消费"vs 单消费点——preview-opener import 块逐行核属实、Office 家族注释宽于实集）；markdown-rich-text 测试用例 1-2 归属批外 CopyButton；#659 故意无 anthropic 域名规则；navigation-controller 同优先级倒序。

### Minor（转 ERRATA，须关闭）
- **NB121-N-01**（ofv-extensions §3.1）：Office 长尾标"15"实列 16 项；分组合计 43 ≠ §2 总数 44（总数正确）。
- **NB121-N-02**（navigation-controller §4）：4 处括注调用点路径误写为 use-left-sidebar.ts（实为 NavigationInputProvider.tsx:120/:306、ExitPlanModeBanner.tsx:148、AskUserBanner.tsx:299、ContentReviewView.tsx:155，行号正确）。

## 边界
NOT_RUN=产品测试/typecheck/build/GUI/真实渲染；未改源码/测试/依赖/作者正文/candidate/全局总账；未 commit/push。
