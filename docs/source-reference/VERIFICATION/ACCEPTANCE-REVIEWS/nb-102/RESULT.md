# nb-102 独立复核结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-102`（T7，p08-renderer-ui · **p08.cdut-zone-ui**，18 文件 / 4907 行）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 交付：`deliveries/nb-102/`（sealId `seal-c89f5d80c65554f4`，`seal_delivery.py/1` / SEAL-DELIVERY **v2**）
- 预读：`reviews/nb-102/PRE_READ_DONE.json`（封版前 18/18 读完）；封版后按新 manualSha256 逐条回源
- 复核时间：2026-10-25T00:15:00Z
- **NOT_RUN**：产品测试 / typecheck / build / Electron-GUI / 真实模型 / 并发与故障注入

## 总判定

| 门 | 结论 |
| --- | --- |
| G0 完整性 | **PASS** |
| G1 结构与可读性 | **PASS**（计数 18/18、行号 0 越界） |
| G2 源码真实性 | **PASS** |
| 批次判定 | **accepted**（18 accepted / 0 revision_required / 0 unknown） |

## G0

18/18 源绑定（blob/lines/sha256）= MANIFEST = scope 逐项实算 **0 失败**；18/18 manualSha256 = stage = READY.`manualHashes`。ZIP `232e62b69539…`（50796 B / 21 条目，v2）逐条目 0 mismatch、无穿越/符号链接、mtime 全 1980-01-01；哈希链自绑。

## G1/G2

- **计数 18/18 全对**（17 源文件各「1 组件/类 = 1 导出」+ test 3 用例）；**行号 0 越界**——两类历史缺陷（计数/行号偏移）均未出现。
- 语义与预读基线逐条一致：**写操作安全链**（MutationConfirmModal 30s 倒计时到点自动 `respond(false)` 拒绝、仅确认后主进程才 POST 青果教务、`useGlobalOverlay` 让位）；**门禁**（Gatekeeper navigate_login **先切视图再回传**、8+1 工具、凭据本地加密文案）；**ErrorBoundary 熔断**（getDerivedStateFromError/componentDidCatch/handleReset 三态、fallbackTitle 兜底）；**SWR 防御式调用**（`typeof api?.readDomainCache !== 'function'` 防 TypeError 白屏历史 Bug）；**北京时区**（周次/星期与宿主时区无关，`weekTouchedRef` 用户选择绝不被自动值覆盖）；**RightTabs 取消令牌**（「会话#序号」跨会话互不影响、渠道/模型继承 会话>全局>settings、先归档隔离缓存再展示、切会话仅 Toast、finally 仅最新一次解锁）；FSRS 弱项轮/已判分不可重答；溯源胶囊降级纯文本不丢信息；Yanhu 三按钮/净化重试；水印双模（深色真透明不 invert）。

## exact acceptedHashes（18）

| manual | manualSha256 |
| --- | --- |
| `CdutWatermarkBackground.tsx.md` | `27d245131ee4209db26c3e72cfd9f269c223d0aed0ef0c2e3b39f502f38ee8ba` |
| `CdutZoneErrorBoundary.test.ts.md` | `d0586fd220a04fce5ce3e20fb30b80e305f96ed22bddd91b2781937ebd0e87a1` |
| `CdutZoneErrorBoundary.tsx.md` | `75c4b099f908d830ddb565426a82f96d0627f3b0e49d6c62d134f64abb94d54f` |
| `CdutZoneView.tsx.md` | `bb394bfcba30f9c0b9bebb6d10e9f68bc45da6e7af879906bd0c9b4304a17d3f` |
| `GatekeeperNoticeModal.tsx.md` | `91e50d2636e362b62876e98ec759be17fcb5b1c358d9e5b32936a9fb7301e6bb` |
| `MutationConfirmModal.tsx.md` | `a40f995626542559c4d87d5260dbe876aaed200ffe081a71a0f3b249dfd59ffa` |
| `AiClassArtifactFormModal.tsx.md` | `6f181823895461ff80e75fa598deec0f8436efd0947c58e43e8e3c2f0c86f3ef` |
| `AiClassFlashcardTab.tsx.md` | `daf131c685a3a48201a526f47e4e8c633fad04b70c9759a7729f19aa3ae23e54` |
| `AiClassMindMapTab.tsx.md` | `677c5e921cdea8e205b01a30a094d9683c60de7201524362d63569027b32aa9c` |
| `AiClassQuizTab.tsx.md` | `48d600ecf13e4bc8e20b3904bf104480758a2381b2469d433cd914239ef2ee2a` |
| `AiClassRightTabs.tsx.md` | `2372aa135af2b5d615a21fc3eef44bc2bc4bce9fa80896fa6b57181e062a70a5` |
| `StudySourceTrace.tsx.md` | `1a64b2f9c8c3db000828ca9251d855935332f1414fd61e703ca5d67cc0e01cc7` |
| `ClassroomDomainSheet.tsx.md` | `f06676a16ccd8f5817987024d25d2a5c3e5c73ac0244aa1f4ac379b248647c61` |
| `ExamDomainSheet.tsx.md` | `6cf90d7ffa3beb59819a8454061c44748389288daa46955af365b3d606d400c4` |
| `GradesDomainSheet.tsx.md` | `d2ba4383f761befa983554efae66367b05b69cb1656ebb8f32571fc832251a8b` |
| `ScheduleDomainSheet.tsx.md` | `9e8a42eb24d407a6f520b6d52cf451c99901931d04c6fdbb09ae6ea0c03a56b1` |
| `YanhuBlockedPage.tsx.md` | `7dd1fe56a3533288fda8b1d6ba95ea351d4dfbc0d701e718d0ec07441a768e01` |
| `YanhuErrorPage.tsx.md` | `ac9e7f945ce8eaa496ce53df9c7af5a2c55da419117f328311ace885fbe9c74d` |

`rejectedHashes` 为空。

## 边界

未运行产品测试/typecheck/build/GUI/真实模型（NOT_RUN）；未改源码、作者正文、candidate、全局总账；交付字节未动；未 commit/push。
