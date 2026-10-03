# 协作者更新同步与本地适配检查

日期：2026-10-03。检查仓库：CDUT-Studio。当前分支：`fix/ci-gate-and-version-sync`，HEAD：`d0793f38`；本次修复留在工作树，Electron 版本为 `0.15.91`。

## 1. 实际同步结果

- 两次获取 origin，确认远端 main=`d1924d4a`、testBuild=`3bd8c338`。它们已是当前 HEAD 的祖先，没有新的源码需要重复合并；HEAD 比 main 多 4 个提交、比 testBuild 多 5 个提交。
- 本地 main 从 `32aa2007` 快进到 `d1924d4a`；upstream/main 从 `65caf20a` 同步到 `d1924d4a`。origin 与 upstream 当前指向同一个 GitHub 仓库。
- 保留当前工作分支和之前未提交的设计文档、业务审查报告、旧计划删除；没有重置、覆盖或暂存这些内容。
- CDUTServer 是没有远端配置的本地 master 仓库，本次没有可获取的协作者更新，也没有修改它。

协作者最近的品牌/设置调整（`cd586a8a`）已经包含在当前代码中。检查重点是改名、配置根目录、被删除的设置组件和 Pi-only 运行基座是否仍有未适配调用。

## 2. 已修复的适配问题

| 问题 | 实际影响 | 本次修改 |
| --- | --- | --- |
| CI/release 的 `bun --cwd apps/electron run …` 在本机 Bun 1.4.0 只输出帮助，退出码仍为 0 | 皮肤检查、主进程/preload/renderer 构建可能漏执行，成功状态不足以证明检查完成 | [CI](../../.github/workflows/ci.yml) 和 [Windows 验证](../../.github/workflows/release.yml) 改为明确 working-directory 后执行 `bun run …`；本地实际执行各命令验证 |
| Windows 验证仍查 `Profer.exe`、`Profer-Setup-…` | electron-builder 已产出 CDUT Studio 名称，冒烟、Pi 探针和资产检查找错文件 | 主程序改为 `CDUT Studio.exe`，安装包改为 `CDUT-Studio-Setup-…`；新增打包配置与 workflow 文件名的一致性回归 |
| macOS 校验仍找 Profer.app/Profer 主程序 | 新品牌包找不到；out 中旧产物可能掩盖错误 | [共享签名模块](../../apps/electron/scripts/macos-signature.cjs) 提供当前产品目录查找，两个校验器共用；主程序名读取 Info.plist；workflow 产物展示名同步 |
| macOS 闭包校验强制要求已移除的 Claude SDK CLI | Pi-only 安装包即使正确也会被拒绝 | [包校验器](../../apps/electron/scripts/verify-macos-package.cjs) 检查随包 CLI/native 文件，并用安装包 Electron 执行既有 Pi 探针；不依赖 Claude CLI |
| Ollama 认证测试假定宿主认证变量为空 | 在已有环境中误报，与真实请求隔离行为无关 | [认证测试](../../apps/electron/src/main/lib/agent-sdk-auth-env.test.ts) 检查全局值保持不变；布尔断言避免失败时输出宿主认证值 |
| Prompt 测试绕过 PROFER_CONFIG_DIR 拼默认路径 | 隔离配置下预期路径错误，无法安全运行整套测试 | [提示测试](../../apps/electron/src/main/lib/agent-prompt-builder.test.ts) 使用统一的 resolveConfigDir；仍检查工作区资料与用户项目指令分开 |

Bun 的 `--cwd` 用于指定命令工作目录；这里用 workflow 的工作目录字段消除调用顺序差异，而不依赖帮助输出的退出码。[Bun 官方文档](https://bun.com/docs/runtime)

Electron package、Bun lock 的 workspace 版本和 CHANGELOG 首条已同步为 `0.15.91`。没有新增依赖、审核专用模型管理或第二套 Agent 内核；没有改变审核业务规则和正式决定语义。

## 3. 对审核模块的结论

审核主进程服务、IPC/preload 类型和三栏页面可以继续使用现有基座：本次类型检查、构建和现有回归没有发现新增接口冲突；未引用协作者删除的 Login/Prompt/Team/Devices/Pocket 设置组件。内部 `@profer/*` 包名及导航属性仍是兼容标识，不能为了改名随意删掉。

原先发现的证明漏审、多依据遗漏、失败/空结果混淆、串案、过期报告、伪出处等业务问题没有在这次协作者更新中修复。审核业务源码相对本日审查基线没有相关变动，继续按 [设计差距 H01–H16](../../docs/design/review-agent/01-research-and-gap.md#6-补强计划合并与严重性校准) 与 [M0 修复契约](../../docs/design/review-agent/03-architecture-and-delivery.md#111-m0-修复契约) 实施。全量单元测试通过不能代替这些业务验收。

## 4. 尚需确认配置或平台验证的部分

1. **旧商业发布链路仍属于原项目配置**：`scripts/push-mac-release.cjs`、`scripts/verify-release-preflight.cjs`、`scripts/build-releases-json.cjs` 指向 `Yuan-lai-ru-ci/ProferAI`；其中 mac 上传文件和 `release-asset-contract.cjs` 也仍使用 Profer 资产命名及旧更新服务器。electron-builder 的 GitHub owner 仍为 `Yuan-lai-ru-ci`，与当前 origin 的 `Nya-Angle` 不一致。真实发布前需统一 CDUT 发布仓库、更新源、签名和上传权限；本次没有执行这些发布脚本或向旧服务上传。当前本地构建/验证流程不依赖它们。
2. **原生平台验收未执行**：本轮宿主 Linux，未进行 Windows 安装包、PowerShell、Authenticode 或 macOS arm64、PlistBuddy、codesign、安装包 Pi 探针实测。相关修改经过源码检查、目录/名称契约回归和语法验证，但不标为目标平台通过。
3. **Bun 版本边界**：本轮实际使用 Bun 1.4.0；workflow 仍固定 1.3.14，未在本轮执行该版本的 GitHub runner。改后的命令采用普通 `bun run` 和明确工作目录，不变更 CI 的版本策略。
4. **Renderer 体积提示**：Vite 构建成功但仍有大于 500 kB 的 chunk 提示，这是已有依赖/分包体积问题，本次没有把它认定为审核接口不兼容；性能需按设计验收记录实测。

## 5. 已执行验证

| 验证 | 结果与证据 |
| --- | --- |
| 修复前全量测试 | 2827 pass / 2 fail / 5 skip；失败为上表两项环境假设，原始输出中的宿主认证值已隐藏 |
| 定向回归 | 49 pass / 0 fail，覆盖认证、Prompt、打包目录/名称和 Pi 闭包契约；`/tmp/cdut-sync-targeted-20261003.log` |
| 修复后全量 `bun test --isolate --timeout 30000` | **2831 pass / 0 fail / 5 skip**，324 文件、7838 断言、15.42 秒；`/tmp/cdut-sync-tests-final-20261003.log` |
| 全 workspace 类型检查 | 8 包通过；`/tmp/cdut-sync-typecheck-final-20261003.log` |
| 包边界与皮肤契约 | 无边界违规；8 内置皮肤及模板通过；`/tmp/cdut-sync-skin-final-20261003.log` |
| 0.15.91 main/preload/renderer 构建 | 全部成功，renderer 约 66 秒；`/tmp/cdut-sync-renderer-final-20261003.log` |
| 静态文件检查 | 3 个 workflow YAML 可解析；修改的 CJS 语法通过；版本/CHANGELOG 一致；git diff --check 通过 |

测试使用独立 PROFER_CONFIG_DIR，不拿用户案卷和配置做测试输入。5 个跳过项为 macOS shell 和 4 个 Windows PowerShell 专属行为；没有将它们计为通过。临时日志用于本轮复核，不作为永久发布验收产物。
