---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-owner.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f54af9424792eba2bb5f572002dcdae81de82b1
sha256: a97256e6ba5e40ead88e200ba9ce326a6bd90f5fc66a99f5512823073905d898
lines: 88
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-owner.ts

## 1. 结论与边界

**CoachTour 跨窗口单例锁**（88 行）：localStorage 互斥（同应用各窗口共享存储分区），保证多主窗口同时启动时只有一个窗口播放引导；含竞态回读校验、3s 心跳续期、8s 过期回收、storage 事件让位。

边界：只管「谁播」，不管播放内容（`CoachTourOverlay` 消费）；无 Electron/网络依赖（纯 Web 存储 API）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `claimCoachTourOwnership` | 导出函数 | 52-87 | `(onLost: () => void) => CoachTourOwnership \| null` | 抢锁；被持有返回 null |
| `CoachTourOwnership` | 导出接口 | 47-49 | `{ release: () => void }` | 释放句柄 |
| `OWNER_KEY` | 内部常量 | 15 | `'profer:coach-tour-owner'` | localStorage 键 |
| `STALE_MS`/`HEARTBEAT_MS`/`VERIFY_DELAY_MS` | 内部常量 | 16-18 | `8000`/`3000`/`120` | 过期/心跳/回读校验延迟 |
| `windowId` | 内部常量 | 20 | `crypto.randomUUID()` | 每窗口唯一 id |
| `readOwner`/`writeOwner` | 内部函数 | 27-45 | 锁记录读写（异常→null/静默） | |

导出计数：`export` 2 条（`:47` 接口、`:52` 函数），与源码一致。

## 3. 内部逻辑与关键流程

- **claim**（`:52-87`）：
  1. 读现存锁：`existing.owner !== windowId` 且 `now - ts < 8s`（新鲜）→ 返回 `null`（让位，`:53-56`）。
  2. `writeOwner()` 占位（`{owner: windowId, ts: Date.now()}`）；启动 3s 心跳 `setInterval(writeOwner)`（`:58-59`）。
  3. `storage` 事件监听（`:60-67`）：键匹配且是他人新鲜锁 → `onLost()`。
  4. **竞态回读**：120ms 后校验 `readOwner()`，owner 不是自己 → `onLost()`（注释 `:9-10`：双窗口几乎同时写时后写者赢）。
- **release**（`:74-86`）：清心跳/回读定时器/监听器；仅当锁仍属自己才 `removeItem`（`:78-85`）。
- **容错**：localStorage 读写异常均吞掉（`:34-36`、`:42-44`、`:82-84` 注释：存储不可用视为无锁单窗口环境，不阻断引导）。
- 过期回收：无主动清理——8s 后他人 claim 时视为陈旧直接覆盖（`:54` 条件）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep coach-tour-owner|claimCoachTourOwnership`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/onboarding/coach-tour/CoachTourOverlay.tsx:38` import、`:193` `claimCoachTourOwnership(() => close())`（open effect；cleanup `claim.release()`，`:199`）。
- 出向：Web `localStorage`/`window.setInterval`/`setTimeout`/`addEventListener('storage')`/`crypto.randomUUID`。

## 5. 数据 I/O、读写与副作用

- 存储：`localStorage['profer:coach-tour-owner']`（JSON `{owner, ts}`）——**跨窗口共享、非持久配置**（应用数据清理即消失）。
- 副作用：storage 事件监听、心跳定时器；无其他。
- 并发模型：多窗口写同一键，后写者赢 + 120ms 回读仲裁（`:68-71`）。

## 6. 分支、失败、取消与恢复

- 锁被抢（storage 事件/回读失败）：`onLost()` 由调用方执行让位 close（Overlay 侧同正常退出路径）。
- 心跳停止（窗口崩溃）：8s 后 `STALE_MS` 判定过期，后来者可回收（`:54`）。
- 存储异常：视作无锁环境继续播放（`:42-44`）。
- 取消：`release()` 全清理；无异步资源泄漏路径。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；锁是**尽力而为的 UI 互斥**，非安全边界（localStorage 可被任意同源脚本改写）。
- 权威状态：`OWNER_KEY` 记录的 `{owner, ts}`；心跳 `ts` 新鲜度是持锁判据。

## 8. 修改影响面

- 唯一消费者 `CoachTourOverlay.tsx:193`（回调语义 `onLost`）。
- `OWNER_KEY`/时序常量（8s/3s/120ms）改动影响多窗口仲裁行为；无测试覆盖。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树 `*.test.ts(x)` 引用（`coach-tour-owner|claimCoachTourOwnership`）0 命中。
- 间接证据：无。
- 未覆盖：竞态回读、心跳、过期回收、storage 让位、存储异常降级。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/多窗口实测；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出签名 | 已证实 | `:47-52` |
| 后写者赢+120ms 回读仲裁 | 已证实 | `:58-71` |
| 心跳 3s/过期 8s | 已证实 | `:16-17`、`:59` |
| release 仅清自己的锁 | 已证实 | `:78-85` |
| 存储异常=无锁环境 | 已证实 | `:42-44` |
| 多窗口实际仲裁效果 | 未知 | NOT_RUN（需多窗口实测） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `claimCoachTourOwnership` | §3 | 52-87 | covered |
| `readOwner`/`writeOwner` | §3/§5 | 27-45 | covered |
| 竞态/心跳/过期 | §3/§6 | 53-71 | covered |
| `release` | §6 | 74-86 | covered |
| 多窗口实际行为 | §10 | — | unknown（NOT_RUN） |
