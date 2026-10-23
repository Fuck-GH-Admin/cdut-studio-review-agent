# 02｜Git 血缘与资产差异

完整 `git log --left-right --cherry-pick`、`git cherry -v`、merge-base/ahead-behind 原始输出和五个目标源码文件的完整 `git diff --function-context` 已保存于本目录 `02-git-lineage-and-asset-delta/`。完整差异文件未截断；以下 SHA256 针对所保存的完整 function-context patch。

## 四组固定快照

| 比较 | merge-base | 左/右独有提交 | function-context diff（字节；SHA256） | 涉及文件 |
|---|---|---:|---|---|
| M–D | `98708f965f09f83541deef64f577767cb0c753b6` | 170 / 333 | 149,915；`373922247c0e52587252c68bb3d46b5a38c4eb929294e747c50a2f3fa0e15d6c` | batch automation/store、Pi review、IPC、workspace service |
| M–P | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | 0 / 113 | 80,224；`f329c1921f0d4c769c7745f10c76c74fa59b8e45440fe9dd360fed7afc79061f` | batch automation/store、IPC |
| D–P | `98708f965f09f83541deef64f577767cb0c753b6` | 333 / 283 | 157,569；`b26e8c5383237e3ea5d4fb23b9b6928c7c0f0220fee569910b3f80ef5d9d1433` | batch automation、store、Pi review、IPC、workspace service |
| R02–R03 | `85fdc1038751114a38a4cc396840d28f0032ba35` | 4 / 5 | 85,010；`35657d12ac73343f063d69ca72427aa71d1f6c0687aa6fca49e716cba2b00b2d` | batch automation/store、IPC |

M–P 是 M 作为共同基线的 113 个 P06 专有提交；D–P 不是线性“补丁升级”。完整左右提交、同 patch 检查和文件级差异请以机器输出为准。

## R02→R03：辅助文件消失不等于不变量全部消失

R02 的 `batch-run-provenance.ts` 和测试把批次归属校验拆成 helper：entry case/batch 成员、entry `runId` 与 `runInputHash`，再与 Run 的 case/run/template/version/input hash 对照。R03 没有该 helper 文件，但把一部分身份约束写入 automation/group transaction：R03 基线用例仍证明当前自动路径绑定 entry Run，且历史 `done` 但无绑定的 Run 不回退借用 `latestRun`。因此“helper 文件未保留”不能推出“自动路径全部丢失”。

实际差异在更窄的边界：R02 已有“entry 绑定 Run 与决定 `basedOnRunId` 不一致时不可定稿”的回归保护；R03 的公开 Main `BATCH_ACTION_V2 / finalize-completed` 与底层 `finalizeBatch()` 未重复检查这个最终绑定。L1-03 合成反例见 `03-high-risk-reproduction.md`。

## D4 / P06 IPC 与类型合同

| 维度 | D4 W1 | P06 R03 | 核验结论 |
|---|---|---|---|
| V2 主命令 actor | D4 的 CREATE/UPDATE/CORRECT/SET V2 handlers 同样从 DTO 接收 actor，本轮未证明它们由 Main 可信重绑定；单独新增的材料转换 handler 对 BrowserWindow owner 和 senderFrame === mainFrame 校验 | `CREATE_CASE_V2`、`UPDATE_FIELDS_V2`、`CORRECT_OBSERVATION_V2`、`SET_EVIDENCE_LINK_V2` 的 Main handler 将调用方 `actor` 传入领域服务；Preload 对 Renderer 暴露这些 API | P06 四条命令实测写入 Renderer 提供的合成 school/teacher actor 和 Receipt；不是只依据 `bindLocalReviewerCommand()` 单测推断 |
| 材料版本转换 | 新增 `RESOLVE_D4_MATERIAL_TRANSITION`，输入 case/new document/expected revision/keep-old-or-new；Main owner/frame 检查，服务再验原件大小与 SHA | 没有同名 D4 材料转换通道；使用 P06 案卷材料及 workspace projection | 主体流程及 DTO 并非同一个接口合同 |
| D2 target 类型 | 支持 `generic-object`、每 target 独立 `objectKey`、`conditions`、`fieldKey` 等，runtime 编译为 Check×target 映射 | R03 固定 schema 主要是档案/学籍等旧目标种类；以 scenario/目标拆分保存映射，不能接受 D4 本轮的 `generic-object` + unknown condition 输入 | D4 编译 6 个合成检查并在 prompt 保留完整 contract；P06 收到同类 target 以 `D2_TARGET_INVALID` 拒绝。属于 schema 不兼容，不能当成同输入业务输出 A/B |
| appeal | D4 本轮没有证明可信 school actor 的外部入口 | `RESOLVE_APPEAL_V2` 进入 `resolveAppealV2`；Main 可绑定 local reviewer，但领域 service 要求授权 teacher | 实测本地 reviewer 被拒，revision/Receipt/appeal 状态不变；正常 teacher 授权入口仍未证实 |
| batch finalize 输入 | D4 durable material-import batch 与 P06 review batch 不是同一个状态机 | review batch 的 Main handler 支持 `finalize-completed`；preload helper 的 TS 入参较窄（`finalize`/`reopen`），Renderer 等价 direct handler 测试证明 Main 入口可达，不是 live UI 证明 | 需第三轮确定公开 IPC DTO 和调用者如何统一；不可把低层函数测试单独解释为普通用户 UI 可达 |

以上事实来自固定 SHA 的 Main、Preload、shared DTO 和 Renderer 调用对照。完整源码 hunk 在随附 patch；表格不表示每条 IPC 都经过 live Electron 集成验收。

## PR #95/#89/#96/#93/#91/#92/#90/#94 → #97

对每个原开发 PR 固定 HEAD 与 I=`b68443b23293b4714e61a3b81383d3d3a56434fc` 比较，merge-base 均为 `a7a6a11d4840ad64cfc858c17b35f35180adf063`。完整提交/路径数据见 `02-git-lineage-and-asset-delta/asset-delta/pr-to-97-summary.json` 及每 PR 的 `asset-delta/PR-*.name-status.stdout.txt`。

| 原 PR | 固定 HEAD | 相同路径及 blob | 集成树新增/替换路径 | 原路径缺失 |
|---|---|---:|---:|---:|
| #95 | `258ffdc8b8b68015a65783d798d9f422986d2c3b` | 3134 | 504 | 0 |
| #89 | `5edb9bdfad77dd850e82fdcf162a382a203946e5` | 3092 | 546 | 0 |
| #96 | `c2f49f937b9768057e6e6b6975a832f9a11dfa03` | 3159 | 479 | 0 |
| #93 | `9349cfe666d7f3be6dcaf92c163c0890469b7f3b` | 3157 | 481 | 0 |
| #91 | `b7618958169120a5cec2f0ccaea512b13b7bd079` | 3122 | 502 | 0 |
| #92 | `1b19a03c7ec70a687280bf0f9ff497ef8be0158e` | 3159 | 479 | 0 |
| #90 | `891f4a2d5945b4c53422e83b27213691e15594ca` | 3146 | 492 | 0 |
| #94 | `fa3f561284e2395d0527790d725acb7587f6e7d8` | 3082 | 556 | 0 |

这里的“原路径缺失=0”只表示 tree/path/blob 比较未发现源 PR 独有路径完全丢失；路径迁移、同名语义替换和运行语义不由文件计数证明。PR #91 另有 14 个同路径 blob/mode 差异，需对照其源/集成 hunk。此范围不是 50 个模板的 Gold 语义验收，也不是对所有迁移的人工语义签名。
