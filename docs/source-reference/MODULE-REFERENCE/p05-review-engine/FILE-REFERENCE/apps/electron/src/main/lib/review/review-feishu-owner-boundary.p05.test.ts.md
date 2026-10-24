---
path: apps/electron/src/main/lib/review/review-feishu-owner-boundary.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f19fad3301587653a4c6ea2a3de4f3c79e31dc16
sha256: 46eccc86b48b37b928d8a0e4b390df668c448d538f479fc9aa129856a1d001da
lines: 159
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-feishu-owner-boundary.p05.test.ts

## 1. 测试目标

P05-S02：受控的 **Feishu Owner 隔离**测试（「No real Feishu network connection」，`apps/electron/src/main/lib/review/review-feishu-owner-boundary.p05.test.ts:1-2`）——评审私有会话（owner）在 Feishu 绑定恢复、镜像创建、命令处理、事件分发、manager 派发各处被隔离，普通会话不受影响。

## 2. 用例清单

1 describe / 7 test。夹具 `fixture()`：workspace + owned（`createReviewOwnedAgentSession`）+ normal + `FeishuBridge`（`enabled:false` 空凭据，不联网，`:37-51`）；`internal(bridge)` 强转取内部面（`:36`）。spyOn 隔离 `createSessionMirrorGroup`/`sendMessage`/`updateSessionMirrorGroupName`/`ensureSessionMirror` 等。

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 旧持久绑定恢复跳过活跃 owner、保留普通绑定 | 写 bindings 文件（owned+normal）→ `loadBindings` | `listBindings()==['normal-chat']`；`sessionToChat` 无 owned、有 normal | `:53-64` |
| 2 | 已删 owner 的旧绑定继续被抑制 | 置两绑定 → `deleteAgentSession(owned)` | `listBindings()==[normal.id]`；`getStatus().activeBindings===1` | `:66-74` |
| 3 | 绑定更新不能指向隐藏 owner/改陈旧隐藏绑定 | `updateBinding` 三种 | 均 `null` 或不生效；normal 更新成功 | `:76-86` |
| 4 | 直接镜像创建/流式不能绑定活跃或已删 owner | `ensureSessionMirror`/`startSessionMirrorRun`（owned 去 owner 字段、删后 owned、normal） | create 对 owned 不调用；normal 1 次；删后仍 1 次 | `:88-105` |
| 5 | 隐藏聊天不能停运行/从消息启动/披露 `/now`/改模型 | 四命令对 hidden | `sendMessage` 4 次均含「当前会话不可用」；无 session buffer；绑定未变 | `:107-122` |
| 6 | Agent EventBus 拒私有/墓碑 owner 后才更镜像/缓冲 | `handleAgentPayload`（owned/normal/删后 owned） | rename 只对 normal 1 次 | `:124-138` |
| 7 | manager 与 bridge 镜像守卫不向 owner 派发 | `feishuBridgeManager` 三方法对 owned/normal | owned 全不调用；normal `stop` 1 次 | `:140-158` |

## 3. 真实断言

- `expect(bridge.listBindings().map(x => x.chatId)).toEqual(['normal-chat'])`（`:61`）。
- `expect(send.mock.calls.every(([, message]) => message.includes('当前会话不可用'))).toBe(true)`（`:120`）。
- `expect(mirror).not.toHaveBeenCalled()`（`:152`）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Feishu 网络（明确不连，`:2`）；`chatType:'p2p'` 路径；绑定文件损坏。
- 脆弱点：`internal()` 强转依赖 `FeishuBridge` 私有字段名（`:20-35`）；mock 的 `createSessionMirrorGroup` 返回合成 chatId。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖 7 处隔离点 | 已证实 | `:53-158` |
| 不联网 | 已证实 | `:2` 声明 + `enabled:false` 空凭据夹具 |
| 测试实际通过 | 未知 | NOT_RUN |
| 真实 Feishu 行为 | 未知 | 未测 |

## 6. 覆盖表

| 隔离点 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 绑定恢复 | 1 | `:53-64` | covered |
| 墓碑抑制 | 2 | `:66-74` | covered |
| 更新拒绝 | 3 | `:76-86` | covered |
| 镜像/流式 | 4 | `:88-105` | covered |
| 命令处理 | 5 | `:107-122` | covered |
| EventBus | 6 | `:124-138` | covered |
| manager 派发 | 7 | `:140-158` | covered |
