---
path: apps/electron/src/main/lib/cdut/cdut-waf-instrumentor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e8477b0e257717636c66fb059bccddd4bf7f0d9
sha256: d13cec9502cadf9281c71b73a7e292f38935f50bb1b896291615260d241c7cd1
lines: 161
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-waf-instrumentor.ts

## 1. 结论与边界

**CDP 运行时内存插桩与动态瑞数 WAF 捕获器**（运行时代码，对应规格书 5.2）：`Page.addScriptToEvaluateOnNewDocument` 注入钩子 Hook `document.cookie` setter，动态监听瑞数 WAF `*P`/`*O` 会话 Cookie 赋值，自动截获最新有效凭证到 `window.__cdut_waf_captured_signature`，无需人工逆向（`apps/electron/src/main/lib/cdut/cdut-waf-instrumentor.ts:1-8`）。设计约定（与 yanhu-devtools-hub 一致）：attach 前判 `isAttached()`、每条 CDP 命令硬超时失败静默降级、不主动 detach 共享调试器（`:9-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `WAF_SIGNATURE_GLOBAL` | 导出常量 | 20 | `'__cdut_waf_captured_signature'` | 捕获结果全局变量名 |
| `installRuiShuWafInstrumentor` | 导出异步函数 | 117-136 | `(webContents): Promise<void>` | 安装插桩（失败静默） |
| `readCapturedWafSignature` | 导出异步函数 | 143-161 | `(webContents): Promise<string \| null>` | 读最近捕获值 |

内部：`RUI_SHU_SESSION_COOKIE='sMLAeTqisZbFO'`/`RUI_SHU_SIGNATURE_COOKIE='sMLAeTqisZbFP'`（`:16/:18`，以 O/P 结尾的前缀）、`CDP_TIMEOUT_MS=6000`（`:23`）、`INJECTION_SCRIPT`（`:32-65`，幂等标记 `__cdut_waf_hooked__`、**getter 透传仅覆写 setter**——红线：只定义 set 会让页面读 cookie 恒 undefined 破坏站点逻辑，`:28-29`）、`isUsable`（`:68-70`）、`ensureAttached`（`:73-81`）、`sendCommand`（`:86-107`，硬超时 Promise）。

## 3. 内部逻辑与关键流程

- `installRuiShuWafInstrumentor`（`:117-136`）：isUsable→ensureAttached→`Page.enable`/`Runtime.enable`（单个失败忽略，`:122-128`）→`Page.addScriptToEvaluateOnNewDocument` 注入（`:130-132`）；全链 try/catch 静默。
- 注入脚本（`:32-65`）：幂等检查→取 cookie descriptor（Document/HTMLDocument 回退 `:41-42`）→保留 origGet 透传（`:49`）→setter 内检测瑞数前缀命中则写全局（`:52-56`）→原 setter 继续（`:58`）。
- `readCapturedWafSignature`（`:143-161`）：未附加/失败→null；`Runtime.evaluate` 读全局（returnByValue+silent），字符串非空才返回。

## 4. 调用者与调用链

入向：CDUT 登录/请求链路（挂载点非本批；与 `yanhu-devtools-hub.ts` 共享 CDP 约定——该文件非本批）。出向：Electron WebContents debugger（CDP 1.3）。

## 5. 数据 I/O 与副作用

CDP 命令（Page/Runtime 域）；页面内存全局变量写入；无磁盘/网络。

## 6. 分支、失败、取消与恢复

全链静默降级：不可用/未附加/超时/命令失败皆不影响页面访问（`:115/:133-135/:157-160`）；`sendCommand` 6s 硬超时 reject（`:95`）。

## 7. 权限与权威状态

捕获的 WAF 凭证为敏感运行时数据（仅存页面内存全局，读取经 CDP）；红线注释 `:28-29`（getter 透传）。

## 8. 修改影响面

改注入脚本影响瑞数站点兼容性（cookie 语义）；改全局变量名与读取侧契约同步。

## 9. 测试证据

无专属测试（冻结树 glob `**/cdut-waf*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+注入脚本+降级链 | 已证实 | `:1-161` |
| 瑞数 Cookie 前缀有效性 | 推断 | `:15-18` 注释（实网未验证） |
| 运行行为 | 未知 | NOT_RUN（GUI/CDP） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/脚本/降级 | §2/§3/§6 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
