# NB-138 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05）

**对象**：p01-app-shell 构建/打包脚本 11 文件/694 行 + 11 手册/725 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-b14eaac1007db937`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（11/11）**，1 条 minor（N-01 frontmatter 模板残留，本次值 `p02-agent-runtime`）不阻断。11 篇全部可按 exact hash 合入。

## 核验摘要

- **G0**：链一致、ZIP 14 条目 0 mismatch、11/11 源绑定独立实算；test( 2 机械核。
- **G2（全文件）**：11 源 694 行逐行 + 11 手册逐篇。门禁语义全对：sync-runtime-deps 7 包清单+冲突/环/绝对 symlink 三护栏、verify-build-target 三元探针（minify-syntax 约定）、macos-signature DR 唯一硬门槛（spctl 明确排除）、macos-package 七段链+包自身 ABI 探针、update-assets 五段对账、ps1 GUI 等待+JSON 兜底、release-assets 双模式+Authenticode。

## Findings

| id | 范围 | 摘要 |
| --- | --- | --- |
| N-01 | 全 11 篇 frontmatter | `reviewer: p02-agent-runtime` 模板残留（值随包名漂移，与 nb-113/125 同类） |

## 合入（11 篇 accepted）

| manual（…/apps/electron/scripts/…） | manualSha256 |
| --- | --- |
| `apps/electron/scripts/sleep.ts.md` | `317571d5431fe558267cc2455eb625e1dfe242221eb9feb5d19b271fdfba3aba` |
| `apps/electron/scripts/sync-runtime-deps.ts.md` | `f615b966b6f8484846c54edf6bbd1ad20a6ba919f0a9371646fce32f496e01e8` |
| `apps/electron/scripts/ui-workspace-contract.test.ts.md` | `8b25fb31c65de6b993f39d294cb591e30c0a8daf30f1294cb0e5eac5d85a2050` |
| `apps/electron/scripts/verify-build-target.cjs.md` | `1e0dc21fe954cb6ebebbbe26e34fd63564ae6fb5382bb0eb5b28a1a432f3ca0a` |
| `apps/electron/scripts/verify-macos-package.cjs.md` | `28eec00103172c6e7b9d43f9ebc32351eae9e80405b55fe0de00649fd87c33ab` |
| `apps/electron/scripts/verify-macos-signature.cjs.md` | `52d4355d067a0e7d8a76b275b79aea20d6b36be2819200495eea8dca80c9617c` |
| `apps/electron/scripts/verify-macos-update-assets.cjs.md` | `afe0aee16b221ea523607213582b7ed31312f2eb9bc6b86412f7b7f6b814c169` |
| `apps/electron/scripts/verify-packaged-pi-runtime.ps1.md` | `45bc1045e7ecf2f55678c1829458ea06683b72990f67c95637adf3d724e5ba57` |
| `apps/electron/scripts/verify-release-assets-unsigned.cjs.md` | `9f02b156e6304bbd7c4e8a38297f31d303fc66976be1a50e0ad97547537fa3be` |
| `apps/electron/scripts/verify-release-assets.cjs.md` | `397a4ccd0e5c90388b1e9d885c11d461a12f8f3348ca091f9686263c9e5037cc` |
| `apps/electron/scripts/verify-update-metadata.cjs.md` | `3c8e05e5ec540f8420a823a7b953e9342300951c60ab8a599add6182d85ffe32` |

NOT_RUN 全部（含各 verify 脚本实跑——平台门禁 darwin/win）；未改源码/作者正文/candidate/全局账。
