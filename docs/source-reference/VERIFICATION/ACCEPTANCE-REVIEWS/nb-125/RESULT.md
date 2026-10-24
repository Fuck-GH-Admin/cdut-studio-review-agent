# NB-125 独立复核（docs-r07-qa-nb-05，MiMo/max，team author-nb-05）

**对象**：p08.hooks-workers 18 文件/3365 行 + 18 手册/1210 行｜**冻结** `05fb2565e2…37c2`｜sealId `seal-d498dea67ce96158`

## 结论

**G0/G1/G2 PASS → batchVerdict = accepted（18/18）**，1 条 minor（N-01 frontmatter 模板残留）不阻断。18 篇全部可按 exact hash 合入。

## 核验摘要

- **G0**：链一致、ZIP 21 条目 0 mismatch、18/18 源绑定独立实算；test( 6 机械核。
- **G2（全文件）**：18 源 3365 行逐行（useGlobalAgentListeners 1842 四段全链）+18 手册逐篇；独立基线 `reviews/nb-125/SOURCE-CHECKLIST.md`。
- **准确面**：useGlobalAgentListeners 全链语义与竞态矩阵（未知 ID 有界队列/终态专用 IPC/提交屏障/三重竞态核/恢复闸门/#985 单条 upsert/通知仅正常响铃）全部吻合；useOpenSession 三重门禁+绿标幂等消费；useCloseTab 防竞态约定；公告三层竞态防护；默认 App 缓存防污染；reduce 三边界（6 测试逐条）。

## Findings

| id | 范围 | 摘要 |
| --- | --- | --- |
| N-01 | 全 18 篇 frontmatter | `reviewer: p03-integrations` 系统性模板残留（与 nb-113 同源） |

## 合入（18 篇 accepted）

| manual（…/renderer/hooks/…） | manualSha256 |
| --- | --- |
| `apps/electron/src/renderer/hooks/use-is-dark-theme.ts.md` | `d1bdba10e3aa9dc0eb95a57957c8b6903de1eb79fcfb32c0c3bff269f26a83eb` |
| `apps/electron/src/renderer/hooks/use-plan-quota.ts.md` | `7aa6dbf83fd2489e28a9d0e3e3627cda8324e116e9925d2a6e9245f2c836082c` |
| `apps/electron/src/renderer/hooks/use-window-inner-height.ts.md` | `a158a39084569581886abb44e57e99187e4a48bc074b2ad17934926f17bf4b72` |
| `apps/electron/src/renderer/hooks/useBackgroundTasks.ts.md` | `8bf42ae83b892128ca019ca3e4770863f06fbdd0b0cfcb57223b9c09505a022c` |
| `apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.test.ts.md` | `7d9ecf16cd4b3856449758cab8b8e1289d43e58efe6ff91bccafd5c8382b6011` |
| `apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.ts.md` | `d1ed2fe35475af127688eabdc2e4e02f004ec603db51e1641af168f36c50df83` |
| `apps/electron/src/renderer/hooks/useBrowserPreviewThemeSync.ts.md` | `e2b24c10983ae02bf6a57964366448dc638cea74f2049a9207e29765e7e4a450` |
| `apps/electron/src/renderer/hooks/useBulletinStartupTrigger.ts.md` | `3eefcf9d320983959605e94ada756429aa236957c02197e98ff995804a470739` |
| `apps/electron/src/renderer/hooks/useCdutAccountHydration.ts.md` | `e0c84e120162b7256f7576264258eab1bf8a57f9beae23d1ed3c18465dec90f6` |
| `apps/electron/src/renderer/hooks/useCloseTab.tsx.md` | `16ee27c615ebccbf85b7800357bebd32e57914dd3b61367130e9ad10d17ab7c9` |
| `apps/electron/src/renderer/hooks/useConversationSettings.ts.md` | `7dda91b569facee8ba56281bbec4804186f8378f16d17dbfd95920b4551ea555` |
| `apps/electron/src/renderer/hooks/useCreateSession.ts.md` | `2ea791364c78f42f59e3cc2073bcbf1b8d4b902ab1b4ca63632f9a18c7089765` |
| `apps/electron/src/renderer/hooks/useDefaultAppForFile.ts.md` | `39b0cc89e0555520ff6d2c636f5214cf6b894dcc4275b4069980587d3e0c57f9` |
| `apps/electron/src/renderer/hooks/useEnterCdutAiClass.ts.md` | `18c567475726a2c19db231f601a5f373f63c4259f0db32752d991a98a5edb224` |
| `apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts.md` | `7a964fd34793bda86d5a531c39ba709242c34f82eaa6128efc656173b8fa0f0a` |
| `apps/electron/src/renderer/hooks/useMigrationImport.ts.md` | `a828ad4ff72c1eeb510ce886f43c43fb7d308262c2de3c77436647eb8390a714` |
| `apps/electron/src/renderer/hooks/useOpenSession.ts.md` | `cf3f819390ce0b54e923f78d77d29aaad2b00954f6ac6a7f5548c6543ea40ef4` |
| `apps/electron/src/renderer/hooks/usePanelAutoLayout.ts.md` | `25c66eb955680c01bc7699b60f8b41579ce34328fabea8619be06b7fb2a44ad2` |

NOT_RUN 全部；未改源码/作者正文/candidate/全局账。
