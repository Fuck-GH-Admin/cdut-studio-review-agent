---
path: apps/electron/src/renderer/lib/model-logo.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2765e52e95257bd2a5c95d2e42ebb632e4e73481
sha256: fa76467d0674ffa29daa76758ca9fae49671cbfd0aeef8aa8669160b8b49362e
lines: 51
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/model-logo.test.ts

## 1. 测试目标

`model-logo` 的渠道/深色 Logo 解析契约（51 行，bun:test）：①渠道 Logo 四级回退中的三级（模型品牌→familyId 继承→provider 回退）；②深色资源命中与无暗色资源回退亮色。mock 边界：**无 mock**——`await import('@/assets/models/*.png')` 对**真实字节资源**断言（`:15` 等，`.default` 为 Vite 资源 URL 模块默认导出）。

## 2. 用例清单

前置：fixture 工厂 `channel(overrides)`（`:4-11`，`{provider:'openai', baseUrl:'https://api.profer.cn/v1', models: [], ...overrides}`）。依赖顺序：无（6 用例独立）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | OpenAI-compatible Kimi 模型池按模型品牌显示 Kimi Logo | 14-19 | `channel({models:[{id:'kimi-k3'}]})` | `getChannelLogo` | toBe `moonshot.png` 模块 default |
| 2 | 模型别名不含品牌名时按 familyId 继承 Kimi Logo | 21-28 | `channel({name:'Kimi', familyId:'kimi', models:[{id:'k3'}]})` | `getChannelLogo` | toBe `moonshot.png` default |
| 3 | 没有可识别模型时仍按明确 provider 显示 Logo | 30-33 | `channel()`（models 空，provider openai） | `getChannelLogo` | toBe `openai.png` default |
| 4 | Claude 模型深色下使用反色图标 | 37-40 | `getModelLogo('claude-3-opus-20240229','anthropic',true)` | 同上 | toBe `claude_dark.png` default |
| 5 | GPT 模型深色下使用反色图标 | 42-45 | `getModelLogo('gpt-4o','openai',true)` | 同上 | toBe `gpt_dark.png` default |
| 6 | 没有暗色资源的品牌深色下回退亮色图标 | 47-50 | `getModelLogo('kimi-k3','kimi-api',true)` | 同上 | toBe `moonshot.png` default（亮色） |

声明合计 **6 test / 0 it**（机械计数）。

## 3. 真实断言

- `:16-18`/`:23-27` `expect(getChannelLogo(...)).toBe(kimiLogo.default)`（`await import('@/assets/models/moonshot.png')`）。
- `:32` `toBe(openaiLogo.default)`（`openai.png`）。
- `:39` `getModelLogo('claude-3-opus-20240229','anthropic',true)` toBe `claude_dark.png` default。
- `:44` `getModelLogo('gpt-4o','openai',true)` toBe `gpt_dark.png` default。
- `:49` `getModelLogo('kimi-k3','kimi-api',true)` toBe `moonshot.png` default（无暗色回退）。

## 4. 未覆盖与脆弱点

- **未覆盖**：`getModelLogoById` 直接调用/未命中 undefined；`resolveModelDisplayName`/`resolveModelProvider`；URL 域名表回退（泛化 provider+baseUrl 分支，`model-logo.ts:526-532`）；`familyId`/`name` 之外的别名语义；`text-embedding` 族。
- **脆弱点**：断言绑定 Vite 资源模块形态（`import().default` 为 URL 字符串）——非 Vite 测试环境会失败；`channel()` 的 `baseUrl` 域名 `api.profer.cn` 在泛化 provider 下会命中 URL 表（本测试 provider 为具体类型，不触发）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例设置/动作/断言如上 | 已证实 | `:1-51` 全文逐行 |
| 声明计数 6 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 资源断言=真实字节资源模块（无 mock） | 已证实 | `:15` 等 `await import('@/assets/models/*.png')` |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| getChannelLogo 模型品牌/familyId/provider 三级 | §2.1-2.3/§3 | 14-33 | covered |
| 深色命中（claude/gpt）+无暗色回退 | §2.4-2.6/§3 | 37-50 | covered |
| getModelLogoById/URL 表/resolve* | §4 | - | unknown（未覆盖） |
