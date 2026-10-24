# nb-05b 独立复验结论（QA：docs-r07-qa-models-20261023）

- 交付 `deliveries/nb-05b/`（seal v2 `seal-2b5c5cf7f7cd4fb5`）；冻结 `05fb2565…37c2` 已核。
- **批次判定：accepted（4 accepted / 0 revision / 0 unknown）**；G0/G1/G2 全 PASS。
- 产品测试/typecheck/GUI/真实模型：`NOT_RUN`。

## 逐文件

| source | manualSha256 | verdict | 核验要点 |
| --- | --- | --- | --- |
| `main/index.ts`（1282L） | `b9cc38bc6fb0cb…` | accepted | 单导出 getMainWindow:373；证书策略 :135-156 顺序；隔离配置 :515-516；导航拦截 :798-824；close=隐藏/before-quit :1223-1282；bootstrap :909-1163；:770/:779 常量 vs 裸串差异如实 |
| `preload/index.ts`（5105L） | `da67f6e83c7060…` | accepted | 834/79/6/2/1/1 计数实测吻合；3 次 exposeInMainWorld；5 处现存矛盾逐一证实（孤儿注释 :494-498/:538、chat:send-message 无消费者、键值不符 :2058-2059、PET_TOUR_FILL 双用、:4874/:5080 重复封装） |
| `config-paths.ts`（1385L） | `249288f3aeb350…` | accepted | 94 导出；seed 决策树 :956-1041 与 12+2 测试断言逐条吻合；143 importers；穿越闸门 :1221-1249 抛错语义 |
| `lightweight-completion.ts`（117L） | `b579624ce58681…` | accepted | 失败即 null 不抛；OAuth 排除 :55/:65-67；代理覆盖 :95；唯一调用点 agent-orchestrator:823；warn 四处精确 |

## 结论

作者对 main/preload/config-paths/lightweight 四篇的事实、行号、计数、调用链、失败分支、测试边界均与冻结源吻合；preload 篇把 5 处现存实现矛盾如实登记（QA 逐条回源证实真实存在），符合 FACT-CHECKING-NOTES"不隐去源代码实际矛盾"。无 finding。4 篇可按 `REVIEWED-HASHES.json` 合入。
