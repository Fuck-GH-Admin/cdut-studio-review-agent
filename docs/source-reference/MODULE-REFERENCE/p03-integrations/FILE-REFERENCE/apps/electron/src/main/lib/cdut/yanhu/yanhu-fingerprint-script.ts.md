---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint-script.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d5fb3f47a6eadcb0ac78f3b0598a4d3ed0eaf92
sha256: b2b106f287e057c9a452d771be1284545d2f64e10d044684fe55f6cf39c8647d
lines: 36
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint-script.ts

## 1. 结论与边界

指纹伪装**注入脚本生成器**（36 行，纯模块无 Electron 依赖）：`buildYanhuFingerprintScript()` 返回幂等 IIFE 源码字符串。设计红线（`:15-23` 注释）：①`navigator.webdriver` 抹除由 Chromium C++ 启动开关（`--disable-blink-features=AutomationControlled`）权威完成，脚本**不做** JS 原型链劫持（会被 `toString`/Realm 对比识破→瑞数 WAF 400）；②原生 PluginArray/MimeTypeArray/window.chrome 由 Chromium 提供，严禁伪造；③防泄漏兜底：`delete window.process/require/module`。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `buildYanhuFingerprintScript` | `:24-35` | 返回 `;(function(){ 'use strict'; try { delete window.process; … } catch(e){} })();`——仅删三个 Node 特权全局，全程 try/catch 永不抛 |

## 3. 内部逻辑与关键流程

单函数返回常量脚本。脚本幂等（`:9` 注释要求 + IIFE 形式）、`';('` 前缀防 ASI 串联（`apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts:65` 锁定）。

## 4. 调用者与调用链

`yanhu-preload.ts:15`（主世界注入）；`yanhu-fingerprint.test.ts:15`（内容断言）。出向：无。

## 5. 数据 I/O、读写与副作用

纯函数；副作用仅在注入后（delete 三个全局）。

## 6. 分支、失败、取消与恢复

不适用（无分支）；注入端失败静默（preload 侧）。

## 7. 权限与权威状态

`:15-23` 三红线（native 权威/原生对象保护/防泄漏）；`apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts:59-61` 断言不碰 `Function.prototype.constructor`/`window.eval`（防瑞数 6 熔断）。

## 8. 修改影响面

改动直接影响防侦检测过率（瑞数 5/6 动态 VM）；与 preload/启动开关三件套联动。

## 9. 测试证据

`yanhu-fingerprint.test.ts`（同批）：不劫持原型链断言（`not.toContain` webdriver/PDF Viewer/mimeTypes/Function.prototype.constructor/window.eval，`apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts:59-61`）+ 含三个 delete + 幂等 IIFE 断言（同文件 `apps/electron/src/main/lib/cdut/yanhu/yanhu-fingerprint.test.ts:65`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件（36 行）+ 三红线 | 已证实 | 文件全读 |
| 瑞数识破机制叙述 | 推断 | 注释自述（规格书 4.2 不在冻结树） |

## 11. 覆盖表

全文件 covered；瑞数对抗实效 §10 unknown。
