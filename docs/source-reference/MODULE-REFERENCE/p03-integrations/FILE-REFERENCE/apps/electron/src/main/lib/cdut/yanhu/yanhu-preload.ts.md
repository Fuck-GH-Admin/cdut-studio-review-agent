---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-preload.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5688bfe3583892dd4c4352cf381ebeefff58b577
sha256: b4cba8d49eb477cf0ae98c8ec24be8325db12f562547c875d9b106d1fd0e7ca3
lines: 29
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-preload.ts

## 1. 结论与边界

智联万站独立 Preload（29 行）：`WebContentsView` 以 `preload` 加载，在页面任何脚本前把指纹脚本注入**主世界**（`webFrame.executeJavaScript`）。与主进程 CDP `Page.addScriptToEvaluateOnNewDocument` **互为兜底**（`:7-9`）。安全边界（`:11`）："不向页面暴露任何特权 API，只做单向环境伪装"。

## 2. 导出与关键符号

无导出。内部 `applyYanhuFingerprint:17-27`：`webFrame.executeJavaScript(buildYanhuFingerprintScript())` + `.catch(() => {})`（页面未就绪/已销毁忽略）+ 外层 try/catch（绝不因注入异常影响加载）。模块末自动执行（`:29`）。

## 3. 内部逻辑与关键流程

单函数自执行：构造脚本（`./yanhu-fingerprint-script`）→ 注入主世界 → 双层失败静默。幂等性由脚本自身保证（脚本为幂等 IIFE）。

## 4. 调用者与调用链

Electron `webPreferences.preload`（`apps/electron/src/main/lib/cdut/yanhu/yanhu-pet-window-manager.ts:590` 等视图）；出向 `electron.webFrame`、`./yanhu-fingerprint-script`。

## 5. 数据 I/O、读写与副作用

副作用=一次 `executeJavaScript`（主世界注入）；无 I/O。

## 6. 分支、失败、取消与恢复

注入失败→warn/静默（`:23-26`、`:21`），页面加载不受影响；无恢复概念（下次导航重注入）。

## 7. 权限与权威状态

`:11` 不暴露特权 API；与 CDP 双保险语义（`:7-9`：CDP 权威 document-start，本 preload 兜底调试器被占用场景）。

## 8. 修改影响面

改注入内容影响防侦测面（配合 `--disable-blink-features=AutomationControlled` 启动开关）；删除会失去 CDP 不可用时的兜底。

## 9. 测试证据

无直接测试（`yanhu-fingerprint.test.ts` 测脚本内容不测注入时序）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件（29 行）行为/红线 | 已证实 | 文件全读 |
| 主世界注入实际生效 | 未知 | NOT_RUN（Electron 运行时） |

## 11. 覆盖表

全文件 §1-§8 covered；测试/运行时 §9/§10 unknown。
