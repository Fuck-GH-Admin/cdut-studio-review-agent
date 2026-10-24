---
path: apps/electron/src/main/lib/cslab/cslab-tool-trust.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 127d29a229de004cab15f21f2b08e540d2331b23
sha256: 51ccea51ecb64371cce43f980337b799a093a91e09cdabae3e250f10304f7b6d
lines: 144
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tool-trust.test.ts

## 1. 测试目标

`cslab-tool-trust.ts` 内存信任层（`:1-4` 注释四覆盖：显式授权/撤销、实验室切换失效、根会话上溯、双轨门禁矩阵）。`PROFER_CONFIG_DIR` 隔离（`:14-17`）。

## 2. 用例清单

3 个 describe + **6 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| 信任生命周期（4） | 授权放行/撤销失效、切实验室清空重开不清、同实验多会话并存、跨实验室隔离 | `:29-87` |
| 根会话上溯（1） | 子/孙追溯到根；根/缺失自返 | `:91-110` |
| 双轨门禁矩阵（1） | 7 组合逐 label 断言 | `:114-143` |

## 3. 真实断言

- `:35-40` 授权后同 lab `true`、他 lab/他会话 `false`；撤销后 `false`。
- `:54-57` 重开同 lab 保留、切 lab-b 后失效。
- `:69-71/:83-86` 多会话并存互不覆盖；跨 lab 四象限隔离。
- `:107-109` `resolveRootSessionId('trust-grandchild')` `toBe('trust-root')`（经 createDelegatedChildSessionMeta 建两层 `:93-104`）；根/缺失自返。
- `:124-141` 门禁 7 组合：auto 主→prompt、auto 子→deny、bypass 未授权→prompt/deny、bypass 已授权→allow（主+子）、plan→deny（带 label 断言 `:140`）。

## 4. 未覆盖与脆弱点

未覆盖：`grantCsLabToolTrust` 无 labId 绑定 activeLabId 路径（经间接）；`MAX_LINEAGE_DEPTH` 环形数据。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §3 | 已证实 | 逐行读 `:1-144` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 信任生命周期 | 4 | covered |
| 根上溯/门禁矩阵 | 2 | covered |
