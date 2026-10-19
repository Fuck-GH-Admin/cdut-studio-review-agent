# 04｜Git 血缘补核、PR #97 资产与本地阻断

## 固定 GitHub compare 的**本轮独立结果**（VERIFIED_METADATA）

| 比较 | status | ahead / behind | merge-base | 返回文件数 | 可靠性 |
|---|---|---|---|---|---|
| main → D4 W1 | diverged | 333 / 170 | `98708f965f09f83541deef64f577767cb0c753b6` | 300 | **截断；不可认定完整文件集** |
| main → P06 R03 | ahead | 113 / 0 | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | 190 | metadata verified |
| D4 W1 → P06 R03 | diverged | 283 / 333 | `98708f965f09f83541deef64f577767cb0c753b6` | 300 | **截断** |
| P06 R02 → R03 | diverged | 5 / 4 | `85fdc1038751114a38a4cc396840d28f0032ba35` | 12 | metadata verified |

PR #97 的 **分页 changed filenames = 575**（本轮独立调用，不能用普通 compare 前 300 文件替代）；其中包含 G01 originals 与 G08 catalog。**文件存在**不证明 G01–G08 原始八分支的全部 blob/修复/语义资产都完整搬运。第一轮 #133 的 190 branch / 128 PR 是历史快照，不作为当前 GitHub 活动分支的动态总量。

## R02 → R03：专项来源核对（PARTIAL）

- R02 `c23789882aabf18689c314c77c270ac4a8ae4729`：`batch-run-provenance.ts` blob `17dfbf55580228e5f5045f6f5704841e4b80e23c`；测试 blob `1f0c2730c9e64dfbd03dea518f0117c3202067cb`，签约持久 `runId+runInputHash`。
- R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`：R02 独立 helper 与专项测试不在 R03 同路径，`batch-automation-service.ts` blob `4779a746eb18ce144fc991af4eb468ea20085fbe`、`workspace-business-service-v2.ts` blob `ec27b393618d96102ff9195fa1f036d82625c3fb` 分层按 runId+当前 hash 校验。
- **这是实现血缘差分，尚未证明等价，也未证明被后续代码完全覆盖**。新架构必须保留 R02 专项负例，不必机械恢复旧 helper 本身。

## 当前环境的实际阻断

本轮运行 `git --version` = `2.47.3`；`git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git HEAD` 返回 `fatal: Could not resolve host: github.com`（退出码 128）；不能本地 clone/worktree/cherry/patch-id。GitHub 连接器可复核远端 SHA、文件/函数和 PR 分页；不能据此伪造 `git cherry` 结果。是否缺 bun 和各测试依赖未作为 2D 已执行检查。

## 必须交给可联网本地 Agent 的完整核验命令

```bash
set -euo pipefail
git clone --no-single-branch https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git cdut-v3-lineage
cd cdut-v3-lineage
git fetch --all --prune
M=8989941b6fb5651564e32d11c4215b6a6d5a5209
D=c2f965d29022a42b3c32d6a4cb73aa8fd542329b
P=db0284879f75ce123b5d83cb6577a3cc7ad057da
R02=c23789882aabf18689c314c77c270ac4a8ae4729
R03=db0284879f75ce123b5d83cb6577a3cc7ad057da
for pair in "$M $D" "$M $P" "$D $P" "$R02 $R03"; do
  read -r BASE HEAD <<< "$pair"
  git merge-base "$BASE" "$HEAD"
  git rev-list --left-right --count "$BASE...$HEAD"
  git log --left-right --cherry-pick --oneline "$BASE...$HEAD" > "cherry-${BASE:0:8}-${HEAD:0:8}.txt"
  git cherry -v "$BASE" "$HEAD" > "patch-${BASE:0:8}-${HEAD:0:8}.txt"
  git diff --function-context "$BASE" "$HEAD" -- apps/electron/src/main/lib/review/review-ipc.ts apps/electron/src/main/lib/review/pi-case-review-service.ts apps/electron/src/main/lib/review/workspace-service-v2.ts > "functions-${BASE:0:8}-${HEAD:0:8}.patch"
done
git diff --name-status "$R02" "$R03" -- apps/electron/src/main/lib/review/batch-run-provenance.ts apps/electron/src/main/lib/review/batch-run-provenance.test.ts
```

**G01–G08 / #97 独有资产**：对 #95/#89/#96/#93/#91/#92/#90/#94 和 #97 分别固定当前或历史 HEAD（必须在执行日志列全 SHA），`git merge-base`、`git rev-list --left-right --count`、`git cherry -v`、`git diff --name-status`、独有文件 `git hash-object`/manifest sha256；输出逐领域 CSV：original path / original blob / #97 path / #97 blob / manifest listed / functionality delta / tests carried / evidence status。检查 catalog 50/50 candidate-held 与 G03 generated-not-run、G04/G07 未全部结构化的义务，不许把候选完整性当 Gold PASS。

**验收输出**：命令 exit code；完整 stdout/stderr；sha256sum 结果；所有比较的 git version、远端 URL、被固定的 input SHA；特别标明不同 SHA 相同 patch、独有修复、R02 helper 被替换后是否有等效负例。未完成者 `UNKNOWN`；禁止用 compare 前 300 文件“推断已删除”。
