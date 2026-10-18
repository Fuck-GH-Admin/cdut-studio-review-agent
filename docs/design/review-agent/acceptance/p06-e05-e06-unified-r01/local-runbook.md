# P06 E05 + E06 r01｜本机 Agent 实际执行手册

**定位**：一个隔离候选、一次前检、一次真实 Electron/Provider 启动；E05 和 E06 分开录屏/账本/判定。此文档可执行的是现有 QA 脚本及人工操作程序，不声称 E05 已有覆盖全部场景的一键 CLI。不可在 CI 复制用户的实际凭据。

## A. 冻结候选与安全红线（未通过不得启动）

1. 读取 27/29/46/47、84/85/86/87 与本目录矩阵；确认 PR #118 冻结、#121/#127 都是 Draft。用 GitHub 获取 **PR #127 最新 HEAD**；只在确认 PR 的 CI SUCCESS 后在隔离工作树检出完整 SHA。记录父 #121 SHA、tree、commit、CI run URL，执行期间不 follow branch。
2. `git status --porcelain` 需净；若有并发修改就另起独立 worktree。记录 `git rev-parse HEAD`、`git rev-parse HEAD^{tree}`、`sha256sum` 对应源码/构建；App Main/Renderer PID 和 CDP 端口是这套 commit 的构建。禁止用“设置了 `QA_APPLICATION_SHA` 环境变量”冒充真实应用版本证明。
3. 先识别已运行的 9222/9230 目标是否属于别的 Agent。存在目标 PID/工作目录不符，**停止**而不是杀他人进程或抢占端口。不得接入真实个人 `~/.cdutai`、校方真实学生材料、生产数据库、公开构建的秘密文件。
4. 创建一套**专用隔离**目录（命名含 `p06-recheck-live-` 兼容已有脚本的安全守卫），把只需的已授权模型配置安全复制到隔离 profile 中；保留私人目录访问限制，密钥/SDK transcript 只保留本地私有路径。未获授权不调用 Provider。
5. 真故障测试仅在独立 tmpfs/虚拟卷、受限容器或可还原 VM 上进行；不得主动填满系统盘、强杀非本试验 Main、对宿主用户目录 chmod、在无授权情况下 sudo/unmount。

### 最小检查命令（本机在独立 worktree）

~~~bash
# 当前 shell 的 cwd 必须是 PR #127 固定提交的完整仓库
git status --porcelain
git rev-parse HEAD
git rev-parse 'HEAD^{tree}'
node --version
bun --version
node --check scripts/qa/review-live-e06.mjs
bun test scripts/qa/review-live-e06-contract.test.ts
# 标准离线门禁使用项目已有采集脚本，隔离目录为私有文件目录：
python3 scripts/qa/review-live-gates.py --out "/absolute/private/p06-recheck-live-UNIQUE/gates"
~~~

此处用到的 `review-live-gates.py` 实际会执行冻结安装、TypeScript/边界、Electron 构建与聚焦/全量回归；完整命令和退出码以该脚本输出为准，不得自写“全部成功”。如果项目依赖/runner 缺失，记录 `BLOCKED_ENV`。

## B. 真 CDP/Provider 前检

- 优先复用已归档的隔离 Electron 启动逻辑：`scripts/qa/review-live-launch.py` 仅适用其规定的 `--private` 路径格式且要求事先存在 `authorized-profile/electron-dist/electron`；**不是可直接在空目录启动的万能入口**。`scripts/qa/review-live-main.ts` 是隔离诊断入口，不属于正式 Agent 引擎。
- 本轮启动可以用现有隔离 launch 脚本或本机 Agent 熟悉的受控方式，但必须能证明 Main 9230 与 Renderer 9222（`localhost:5176` target）确实由该 worktree 编译，不改变产品权限。记录 PID、工作目录、Profile root、构建 sha、CDP target URL 的脱敏版本；任一不匹配停止。
- 现场使用**独立 profile 下已经合法授权**的 Pi 模型；Claude/Windows/macOS/外部中心条件缺失就 `NOT-RUN/BLOCKED_EXTERNAL`。每次真模型调用前先尽量完成无需模型的检查与资料准备。
- `QA_REPORT_DIR` 和 `QA_PROFILE_ROOT` 均需绝对路径。E06 QA 驱动会做固定源码 HEAD/隔离 profile 预检；**它不验证已启动 App 二进制来自哪一 SHA**，该部分必须由人工证据补充。

### 真 Pi 四项执行（U2，环境前检成功后才运行）

~~~bash
export QA_APPLICATION_SHA="$(git rev-parse HEAD)"
export QA_E06_ISOLATED_PROFILE=1
export QA_PROFILE_ROOT="/absolute/private/p06-recheck-live-UNIQUE/authorized-profile"
export QA_REPORT_DIR="/absolute/private/p06-recheck-live-UNIQUE/live-e06"
mkdir -p "$QA_REPORT_DIR"
# 保存完整 stdout/stderr/退出码，私有记录不得直接上传 PR
python3 scripts/qa/review-live-command.py --out "$QA_REPORT_DIR/commands-private" \
  --name e06-real-pi -- node scripts/qa/review-live-e06.mjs
~~~

**不应在 E06 跑完后仅看 `e06-matrix.json.status` 就声称全量通过**：该 runner 即使本地 4 项全部成功也只能 `PARTIAL`，补齐其他场景见矩阵 E06-05～10。

## C. E05 业务闭环：真实 GUI + Main + V2（不可只跑旧 batch 脚本）

按 `acceptance-matrix.md` 的 E05-01～15 先后执行。准备三案与原始材料对应；人工操作和审批必须真实受授权，不能通过测试代码绕开生产业务门禁。至少保存：
- 提交前 / Pi 完成后 / 人工处理后 `case revision、case/run/assignment/stage/task IDs（脱敏别名）`；
- `inputManifest.hash`、`basedOnRunId`、template/policy version、documentVersion IDs、SourceRef、读原件工具回执（如果可用）；
- E05-06/07 多补件变化后的 Run 失效、新 Run + 新输入哈希、无重复 task、补件正确恢复；
- E05-08/09 双批次显示、显式选择、`confirmed=true`、Main 重排结果、其他历史批次绝不更改；若 GUI 不提供，记录 `BLOCKED_PRODUCT`，**不可用 IPC 合成结果假冒 GUI 操作成功**；
- E05-10～12 `auto approval` 的合法授权组合及反例、preview/operation hash、定稿快照、outbox/actionId 幂等，不能把辅助模式的“done”视作校方批准；
- E05-13 A/B/C 的业务值要对照独立隐藏 Gold（只读、不能写入测试材料正文）；任何旧 C `execution-failed` 需真实工具和 run 记录独立归因。

已有 `scripts/qa/review-live-batch.mjs` 可作为**历史基础队列/拒止子集**参考，不是 E05-01～13 全部合格的一键验收。`scripts/qa/review-live-e05.mjs` 主要是旧回调/页面切换竞态复演，也不是本轮 E05 全量业务 driver。不能以运行二者代替矩阵。

## D. 故障测试及跨 PID（U3）

1. **先快照独立 profile、收齐 E05/E06 非破坏性结果，再开始真故障子集**，避免恢复后失去已采集的 Provider witness。
2. 只对已确认的**测试卷内文件**测试磁盘满、原子写失败、Main 强杀/新 PID、旧 ACK/回调、outbox 重放、普通会话 Tab/Office 恢复。`scripts/qa/review-live-io.mjs` / `review-live-preview-restore.mjs` 可参考，但脚本含路径布局/实验依赖和危险 I/O 操作，**必须逐行核对后才运行**。
3. 如无合法 root/VM/独立 volume/进程归属证明：对相关场景写 `NOT-RUN` + 环境阻断，不执行“凑一个模拟结果”或强制 sudo。
4. 保留干预前/失败现场/恢复后原始 JSON hash、stdout/stderr、errno、旧/新 PID、Main 权限状态、读取能力；确认不可借旧会话或过期票据获得权限。

## E. 一次归档、三类独立结论（U4）

1. 用 [证据合同](evidence-contract.md) 写 `candidate-lock.json` / `command-ledger.json` / `scenario-matrix.json` / `first-failures.json` / `e05-case-ledger.json` / `e06-matrix.json` / `acceptance-verdict.md`，标全量缺失。
2. `raw/private` 与 `public/redacted` 隔离保存，公开素材二次复核（密钥、channelId、学生真实信息、文件系统绝对路径、模型完整 transcript）；分别生成 SHA256 清单。真实原始日志保存私有，不要把可公开的摘要说成“完整原始证据”。
3. 收尾仅停止**属于本轮的**测试 Main/Pi/CDP，清理测试卷并保留证据；禁止删除用户普通 Agent 会话或旧 U1 实机备份。
4. 如发现产品 BUG：写第一失败（RED）和影响范围，再在**另一个修复分支**提交最小 patch，跑定向+全量 CI/必要现场差分；现有 E05/E06 证据保留，不在原证据文件上“覆盖成绿”。
5. 形成**E05 独立 verdict / E06 独立 verdict / 29 LIVE 台账差分建议**。在正式权责审查与明确许可前，PR #121/#127 继续 Draft、MERGE NO-GO，P07/P08 保持 NOT STARTED。
