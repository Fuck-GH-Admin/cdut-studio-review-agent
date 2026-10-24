# nb-135-r1 返修复验报告（QA：docs-r07-qa-extra-04-20261024）

- 批次：nb-135-r1（revisionOf nb-135；13 文件 / 1479 行）
- 封版：sealId `seal-671737026912a957`（revisionOf=nb-135）
- **batchVerdict：`accepted`（13/13）**；G0 PASS / G1 PASS / G2 PASS

## 复验要点

- **修订面审计**：恰 2 篇改动、**11/11 篇逐字节一致**（独立 filecmp）；r0 封版（`seal-0e48f3131713205a`）未动。
- **F-02 resolved**：settings.ts.md AppSettings「56 字段」→「60 字段」恰两处（§2.2 `:62` / §11 `:164`）；QA 独立程序化计数源 :233-353 = 60 ✓（before `2ea63b11…`→after `77ae3e53…` 与 FINDINGS-RESPONSE/实测一致）。
- **F-03 resolved**：node-sqlite.d.ts.md §4 引用补全为 `apps/electron/src/main/lib/adapters/pi-builtin-tools.test.ts:4`（恰单行；事实内容未动）（before `31ad4123…`→after `9516993d…`）。
- **F-01 闭合**：r1 `SCOPE.json` 仅改 author/reviewer/note，封版元数据已记本组会话；manager scope 未动（正确）。
- 链复算全对；sealId 复算一致；ZIP 16 条目合规、zip=stage。
- 11 篇同字节文件沿用 r0 G2 真值结论（'pi' vs 「回退 Claude」矛盾入册、trusted 三函数缺口、identity/officeparser 双零消费、9 处动态 require 行号等），hash 重录。

## 逐文件 verdict

- accepted 13/13（2 篇新 hash 复验 + 11 篇同字节重录）。acceptedHashes 见 RESULT.json（与 r0 表差异恰 2 篇）。

## NOT_RUN

产品测试/typecheck/构建/GUI/真实模型网络 IPC。

## 边界

仅 nb-135-r1 复验；reviews/nb-135/（r0）保留不改；不含 nb-108 链/nb-127。
