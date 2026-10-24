---
path: apps/electron/src/main/lib/system-proxy-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 337787a4ad8db7a6def5ddcf7d6b37d2bbb7d5c2
sha256: a2b19587c1b91b0003eebbbb02e6f85df3ac1d7e45887e5bf0e020faaf32e121
lines: 203
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/system-proxy-detector.ts

## 1. 结论与边界

三平台系统代理自动检测（203 行，头注释 `:1-5`）：macOS networksetup / Windows 注册表 / Linux 环境变量。全链 catch 返回 `success:false` 不抛。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectSystemProxy` | 异步函数（导出） | 14-38 | `() => Promise<SystemProxyDetectResult>` | 唯一入口 |

内部：`detectMacOSProxy`（`:45-109`）、`detectWindowsProxy`（`:116-177`）、`detectLinuxProxy`（`:184-203`）。导出合计 1。`SystemProxyDetectResult` 形状：`{success, proxyUrl?, message}`。

## 3. 内部逻辑与关键流程

1. **detectSystemProxy**（`:14-38`）：`process.platform` switch——darwin/win32/linux；其他平台 → `success:false, '不支持的平台: <platform>'`（`:26-29`）；总 catch → `success:false`+message（`:31-37`）。
2. **detectMacOSProxy**（`:45-109`）：`execSync('networksetup -listallnetworkservices')` 过滤 `*` 开头（禁用服务，`:54`）；优先 Wi-Fi→Ethernet→首个（`:57-63`）；`networksetup -getwebproxy "<svc>"` 解析 `Enabled: Yes`/`Server:`/`Port:` 三行（`:79-87`）；齐备 → `http://server:port`（`:89-96`）；否则 '系统未配置代理'。注意（照实）：`Server` 行 `line.split(':')[1]` 取值（`:83`）——IPv6 或含冒号地址会被截断（事实局限）。
3. **detectWindowsProxy**（`:116-177`）：`reg query ...\Internet Settings /v ProxyEnable` 含 `'0x1'` 判启用（`:126`）→ `/v ProxyServer`，`ProxyServer\s+REG_SZ\s+(.+)` 提取（`:142`）；含 `=` 走 `https?=([^;]+)` 取协议段（`:147-151`）；无协议前缀补 `http://`（`:155-157`）。
4. **detectLinuxProxy**（`:184-203`）：环境变量优先级 `HTTPS_PROXY > https_proxy > HTTP_PROXY > http_proxy`（`:185-189`）；有值 → success+原值；无 → '系统未配置代理环境变量'。

## 4. 调用者与调用链

入向（全冻结树检索 `system-proxy-detector`，2 文件）：`lib/proxy-settings-service.ts:11`（`detectSystemProxy`）、`main/ipc.ts:266`（同）。出向：`node:child_process`（动态 import `:48`/`:118`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

- 读：networksetup/reg 子进程（只读）、`process.env`（Linux）。
- 副作用：console.error 三条（平台检测失败日志）。

## 6. 分支、失败、取消与恢复

- 三分支平台 + 不支持平台分支（§3.1）。
- macOS 服务列表获取失败→回退默认 Wi-Fi（`:64-66`）。
- 各平台 catch → `success:false`+平台文案（不抛，`:102-108`/`:170-176`）。
- 无取消机制（execSync 同步阻塞）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=系统代理配置（用户设置）；读取为只读。

## 8. 修改影响面

proxy-settings-service 与 ipc 的"检测系统代理"入口；三平台解析规则各有限制（macOS Server 切分局限、Windows REG_SZ 格式假设、Linux 只看大小写四变量）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `system-proxy-detector` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出/三分支行为/优先级/局限 | 已证实 | `:1-203` 全文逐行 |
| 2 个消费方 | 已证实 | 全树检索（§4） |
| macOS Server 行冒号切分局限（IPv6 截断） | 已证实（代码事实） | `:83` |
| networksetup/reg 真实输出 | 边界（系统工具） | `:79-87`/`:142` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `detectSystemProxy` 分派 | §3.1 | 14-38 | covered |
| `detectMacOSProxy`（含切分局限） | §3.2/§10 | 45-109 | covered |
| `detectWindowsProxy` | §3.3 | 116-177 | covered |
| `detectLinuxProxy` 优先级 | §3.4 | 184-203 | covered |
