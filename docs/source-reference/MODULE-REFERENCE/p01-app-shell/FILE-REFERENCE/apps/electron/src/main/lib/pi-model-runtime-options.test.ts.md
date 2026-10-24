---
path: apps/electron/src/main/lib/pi-model-runtime-options.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a689e528fb826a86e2c59a63f4a651893ba1a708
sha256: 9b5b09a26688c121b34c810a9f23981a9c459e844cf12cdf9ff36bf6c20287b6
lines: 35
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-model-runtime-options.test.ts

## 1. 测试目标

验证 Pi ModelRuntime 隔离配置（`pi-model-runtime-options.ts`）：①默认凭据存储为进程内内存实现且禁用全局模型缓存/模型网络；②自定义凭据存储被原样保留；③同一 provider 的并发 `modify` 按提交顺序串行化。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 3 个（`describe` 1 个，`it(` 0 个）。

| # | 用例（`pi-model-runtime-options.test.ts`） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | Given 未指定凭据存储 When 创建配置 Then 凭据与模型缓存都只使用内存（`:5-11`） | 无 | `createIsolatedModelRuntimeOptions()` | 无 |
| 2 | Given OAuth 专用内存存储 When 创建配置 Then 保留该存储且禁用全局模型缓存（`:13-21`） | `new IsolatedInMemoryCredentialStore()` | 传入构造 | 无 |
| 3 | Given 同一 provider 的并发写入 When 修改凭据 Then 按提交顺序序列化（`:23-34`） | 同一 store | 先后两个 `modify('provider', …)`（第二 个读 `current`） | 3 依赖 1-2 的类存在；async 用例 |

## 3. 真实断言

- 用例 1（`:8-10`）：`expect(options.credentials).toBeInstanceOf(IsolatedInMemoryCredentialStore)`；`expect(options.modelsPath).toBeNull()`；`expect(options.allowModelNetwork).toBe(false)`。
- 用例 2（`:16-20`）：`expect(createIsolatedModelRuntimeOptions(credentials)).toEqual({credentials, modelsPath: null, allowModelNetwork: false})`。
- 用例 3（`:31-33`）：`await expect(first).resolves.toMatchObject({ key: 'first' })`；`await expect(second).resolves.toMatchObject({ key: 'first-second' })`（证明第二次 modify 看到第一次的结果）；`await expect(credentials.read('provider')).resolves.toMatchObject({ key: 'first-second' })`。

## 4. 未覆盖与脆弱点

- 未覆盖：`delete`、`list`、`modify` 回调抛错、`modify` 返回 undefined 的保持语义、链自清。
- 脆弱点：用例 3 断言顺序即串行语义，若实现改为并发 set，`first-second` 断言即失败（良好的回归锚点）；无 mock——被测对象纯内存，`Credential` 字面量 `{type:'api_key', key:…}` 未做类型级校验。
- mock 边界：无 mock/无 SDK 调用；`@earendil-works/pi-ai` 仅类型导入。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例与断言行号 | 已证实 | `:5-34` 逐行读 |
| 用例 3 证明串行化 | 已证实 | `:31-33` 断言链 |
| 无 mock/纯内存 | 已证实 | 全文读（无 mock API） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测符号 | 用例 | 状态 |
| --- | --- | --- |
| `createIsolatedModelRuntimeOptions` 默认值 | 1 | covered |
| 自定义 credentials 透传 | 2 | covered |
| `modify` 串行化 | 3 | covered |
| `delete`/`list`/错误路径 | - | unknown（未覆盖） |
