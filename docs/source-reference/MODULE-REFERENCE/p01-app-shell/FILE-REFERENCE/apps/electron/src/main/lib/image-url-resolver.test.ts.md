---
path: apps/electron/src/main/lib/image-url-resolver.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69ac9b30623b459778d6035808cd2eec17be6f5e
sha256: 29f56ee2ba31a44c6395733bcd8ca52d3030b57dd38b25686ff4a5ff26a0dcb8
lines: 104
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/image-url-resolver.test.ts

## 1. 测试目标

`resolveRemoteImageUrl`（`./image-url-resolver`，同批深读）的确认链路：content-type/扩展名双通道确认、not-image 拒绝、SSRF 私有主机拦截、协议门禁、content-length 超大拦截、结果缓存去重。框架 `bun:test`；mock 边界=全局 `fetch`（不发真实网络）。

## 2. 用例清单

用例计数：`it(` **7**（`:49`、`:57`、`:64`、`:71`、`:81`、`:87`、`:98`），`test(` 0——与源码计数一致。单一 `describe('resolveRemoteImageUrl')`（`:48`）。

公共装置（非用例）：
- `realFetch` 保存原 fetch（`:8`）；`fetchCalls` 计数器 + `fetchImpl` 可替换实现（`:10-11`）。
- `PNG_BYTES`：8 字节 PNG 魔数 + 4 填充（`:13`）。
- `makeResponse(opts)`（`:15-33`）：构造假 `Response`——`headers`（content-type/content-length）、`arrayBuffer()` 返回字节 buffer、**`body: null`**（`res.body?.cancel()` 在测试中为 no-op）。
- `beforeEach`（`:35-42`）：计数清零、默认 `fetchImpl` 返回 404、`globalThis.fetch` 替换为计数包装。
- `afterEach`（`:44-46`）：还原 `globalThis.fetch = realFetch`。

| # | 用例（it 名） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | `扩展名与 content-type 均命中时返回 data URL`（`:49-55`） | fetchImpl → image/png + PNG_BYTES | `resolveRemoteImageUrl('https://example.com/a/photo.png')` | 独立 |
| 2 | `仅有 content-type（无图片扩展名）也能确认`（`:57-62`） | image/jpeg + `FF D8 FF 00` | `.../download?id=42` | 独立 |
| 3 | `既非图片 content-type 也不是图片扩展名时拒绝`（`:64-69`） | text/html | `.../page` | 独立 |
| 4 | `拒绝私有/本地地址（SSRF 防护）`（`:71-79`） | 默认 fetchImpl（不会被调用） | `http://localhost/a.png` 与 `http://127.0.0.1/a.png` | 独立 |
| 5 | `拒绝非 http(s) 协议`（`:81-85`） | — | `file:///etc/passwd` | 独立 |
| 6 | `按 content-length 拦截超大图片`（`:87-96`） | image/png + content-length `String(20*1024*1024)` + PNG_BYTES | `.../huge.png` | 独立 |
| 7 | `命中缓存时不重复请求`（`:98-103`） | image/png + PNG_BYTES | 同 URL 调用两次 | 独立 |

无 `beforeEach` 级顺序依赖；每用例独立 `fetchImpl` 赋值。

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(result.ok).toBe(true)`；`expect(result.mediaType).toBe('image/png')`；`expect(result.dataUrl?.startsWith('data:image/png;base64,')).toBe(true)`（`:52-54`）。
2. `expect(result.ok).toBe(true)`；`expect(result.mediaType).toBe('image/jpeg')`（`:60-61`）。
3. `expect(result.ok).toBe(false)`；`expect(result.reason).toBe('not-image')`（`:67-68`）。
4. `expect(localhost.ok).toBe(false)` + `expect(localhost.reason).toBe('private-host-blocked')`；loopback 同（`:73-78`）。
5. `expect(result.ok).toBe(false)`；`expect(result.reason).toBe('unsupported-protocol')`（`:83-84`）。
6. `expect(result.ok).toBe(false)`；`expect(result.reason).toBe('too-large')`（`:94-95`）。
7. `expect(fetchCalls).toBe(1)`（`:102`）。

## 4. 未覆盖与脆弱点

- 未覆盖失败分支（对照被测源码）：`empty-url`、`invalid-url`、`http-<status>`（用例 1-7 未断言 404 分支结果）、`empty-body`、`unsupported-format`（魔数不匹配）、`timeout`、`fetch-failed`（fetch 抛错）。
- 未覆盖：重定向跟随（含目标私有主机不复检的缺口）、缓存 TTL 过期、容量逐出（>24）、dataUrl >4MiB 不缓存、IPv6 私有地址（`::1` 之外）。
- 脆弱点：`makeResponse` 的 `body: null` 使 `res.body?.cancel()` 为空操作——真实流取消行为未测；用例 4/5 不触达 fetch（隐式断言无网络调用，但未显式断言 `fetchCalls`）。
- 模块级 `cache` 跨用例共享：用例 7 依赖 `CACHE_TTL_MS` 内命中；若用例间 URL 复用会互相干扰（当前 URL 各异，未触发）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 it/0 test 计数 | 已证实 | 全文件 `it(`/`test(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `image-url-resolver.test.ts:52-102` |
| mock 边界=全局 fetch（无真实网络） | 已证实 | `:8-11`、`:35-46` |
| `body: null` 致 cancel no-op | 已证实 | `:31` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 重定向/超时/魔数拒绝行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| data URL 成功路径（双通道确认） | §2/§3 | 49-62 | covered |
| not-image 拒绝 | §2/§3 | 64-69 | covered |
| SSRF 私有主机拦截 | §2/§3 | 71-79 | covered |
| 协议门禁 | §2/§3 | 81-85 | covered |
| content-length 拦截 | §2/§3 | 87-96 | covered |
| 缓存去重 | §2/§3 | 98-103 | covered |
| timeout/fetch-failed/魔数拒绝/重定向 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
