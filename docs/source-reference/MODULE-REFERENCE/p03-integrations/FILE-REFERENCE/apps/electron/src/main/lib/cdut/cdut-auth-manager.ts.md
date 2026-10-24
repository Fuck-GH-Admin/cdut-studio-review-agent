---
path: apps/electron/src/main/lib/cdut/cdut-auth-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd6188c71df10d6b91761e9ebbb5eefd3ba18e07
sha256: b7e9f9ba1093ade701ab41043867cfc2691a470028e1aeb3c02312077c9a2d31
lines: 1305
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-auth-manager.ts

## 1. 结论与边界

CDUT **特区账户认证管理器**（运行时代码）：`persist:cdut-auth-zone` 隔离分区后台不可见窗口驱动 CAS 登录（`:5`）；落点收敛教务主框架 `/jsxsd/framework/xsMainV` 杜绝 SSO 中间阶段过早结算（`:6`）；登录后双轨抓画像（顶栏 DOM 姓名+学籍卡片/证件照 Base64，`:7`）；10 分钟静默保活、失效标 expired（`:8`）；仅密码经 token-crypto 加密持久化 `~/.cdutai/cdut-account.json`（`:9`）。范围声明：不解码 CAS Cookie（`:12`）、「active」=最近认证成功且心跳未检失效（`:13`）、暂不处理风控分支（`:14`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CDUT_AUTH_PARTITION` | 常量 | 45 | `'persist:cdut-auth-zone'` 隔离分区 |
| `CDUT_AUTH_CERT_SESSION_ID` | 常量 | 51 | 证书安全策略会话标识（须与 verifyProc sessionId 一致，`:47-50`） |
| `CdutAuthManager` | 类 | 678 | 主类 |
| `cdutAuthManager` | 单例 | 1305 | |

内部：`CAS_LOGIN_URL:38-39`、`JW_HOME_URL:42`、`KEEP_ALIVE_INTERVAL_MS=10min:94`、`LOGIN_TIMEOUT_MS=25s:97`、`PROFILE_HARVEST_TIMEOUT_MS=45s:100`、`StoredCdutAccount:103-116`、头像缓存工具 `:54-91`、`isMainHomeUrl:126-135`/`isCasLoginUrl:142-150`（落点判定）、`buildVantInjectScript:157-225`（Vue2+Vant/Element 兜底定位表单+原生 setter 写凭证，25×200ms 重试 `:198`）、`EXTRACT_*` 三注入脚本（报错 `:228`/顶栏姓名 `:239`/窗口主轨画像 `:266-445`/已加载页提取 `:451-676`）。

## 3. 内部逻辑与关键流程

- 状态机：`disconnected`（启动恒定 `:695/:732`）→`active`（登录结算 `:1106`）→`expired`（心跳检失效 `:825`）。
- 登录链（`login:855`）：演示账户旁路（不保活不落盘，`:856-865`）→并发守卫 `:871`→25s 硬超时 `:898`→隐藏窗口（contextIsolation:true `:906-909`）→CAS 注入提交（仅一次 `:1171-1193`）→停留 CAS 读错误文案 `:1197`→落点主框架 `:1153`→`harvestProfileAndFinish:931-1143`（顶栏姓名→窗口主轨画像 12s race→备用导航 /grxx/xsxx→/xsxj/xjxxgl.do 补头像→Node 兜底 `fetchJwProfileSummary` 轮询≤10s→persistAccount→finish）。
- 登出（`logout:1228-1275`）：停保活→删头像缓存→删凭据含 .bak/.tmp→清分区→复位广播。
- **无自动会话恢复**：`loadPersistedAccount:716-741` 仅载元数据恒 disconnected（`:712-714`）；`resetOnStartup:791-802`。
- 保活（`:805-843`）：10min 定时+8s AbortSignal 探活 `JW_HOME_URL`；重定向 CAS/401/403→expired 停心跳（`:821-827`）；仅 200 刷新活跃时间（`:828-831`）。

## 4. 调用者与调用链

入向（baseline 树逐一核实 6 处）：`main/index.ts:11`、`main/ipc.ts:150`、`lib/adapters/pi-builtin-tools.ts:124`、`cdut-gatekeeper.ts:22`、`yanhu/yanhu-express-manager.ts:36`、本文件测试 `:21`。出向：electron、`../{config-paths,token-crypto,safe-file}`、`./cdut-jw-client`（fetchJwProfileSummary/fetchImageAsBase64/stripStaleRuiShuCookies）、`./cdut-demo/demo-service`。

## 5. 数据 I/O 与副作用

读写 `~/.cdutai/cdut-account.json`（writeJsonFileAtomic）+头像缓存 `~/.cdutai/cache/avatars/`；分区 Session Cookie/Cache 清理；隐藏 BrowserWindow 导航；定时器 unref。

## 6. 分支、失败、取消与恢复

错误分类：CAS 阻断页「未认证授权的服务」→blockedReason 失败（`:164-170/:1184`）；停留 CAS→提取真实报错结算（`:1195-1203`）；`did-fail-load` 忽略 -3 与 harvesting 阶段（`:1207-1216`）；**画像异常→settleWithFallbackProfile 绝不报登录失败**（`:915-928/:1140`）；400/5xx 保活不刷新活跃时间（`:832-837`）。

## 7. 权限与权威状态

安全红线：仅密码加密落盘（`:9/:1277-1285`）、不解码 Cookie（`:12`）、启动恒未登录防假在线（`:694-695`）、getRememberedPassword 仅记住时返明文（`:743-756`）、登出删 .bak/.tmp 防密文残留（`:1224-1226`）。

## 8. 修改影响面

改状态机影响门禁（gatekeeper 消费 getProfile）与渲染层同步；分区常量被 index/ipc/pi-builtin-tools/yanhu-express-manager 共用（须同步）。

## 9. 测试证据

`cdut-auth-manager.test.ts`（260 行 9 用例，另篇；登录全流程无单测——如实声明）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+状态机+登录/登出/保活链 | 已证实 | 三段逐行（1-1305 全读） |
| 疑点 6 条照实记录 | 已证实 | 见 UNVERIFIED：头像双份存储 vs 注释、StoredCdutAccount 缺 'expired'、窗口销毁结算口径不一、'2.5 秒' 无实现、明文密码入渲染脚本（`:214-215`）、演示态不参与心跳 |
| 真实 CAS 登录行为 | 未知 | NOT_RUN（GUI/网络） |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/状态机/主链 | §2/§3 | 45-1305 | covered |
| 错误分类/红线 | §6/§7 | — | covered |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
