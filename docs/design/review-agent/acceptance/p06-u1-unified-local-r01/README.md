# P06 L02-U1 统一本机验收 R01

本证据包对应固定候选 PR #116：SHA 9601bd2181ee1e25f599b1dd44d39bf23b1a924f，tree 6b0212090693d3686a41312e7b9490acfb8f865e。所有本机命令均在独立 worktree 与新建私有 profile 执行；本包只提交脱敏摘要；既有 runner 原始 stdout/stderr、配置、会话和合成材料留在本机 0700 证据目录。r12 的交互式认证输出没有被 runner 留存，只保留脱敏结构化回执。

统一结果是范围受限的实机证据，不构成完整 U1 接受。远程 #105/#108/#110/#113/#114/#115/#116 的固定提交 CI 均成功；本机 frozen install、typecheck、边界检查、一次 Electron build 和全仓测试也通过（4014 pass、5 skip、0 fail）。本机真实 Electron/Main/IPC 确认 Pi SDK active 与 model-facing 五工具一致，Owner 隔离、普通会话读/Preview、删除后的迟到 IPC、同名 Office 源解析/锚点、V2 SourceRef 跨案拒绝和重启持久化均通过限定范围检查。

Provider 测试凭据未授权且不可用，传输保护在发出网络请求前终止探针；真实 Provider 收据链与 A/B/C 未运行。挂载命名空间被拒绝，无法安全创建独立满卷测试卷；未填充宿主盘或共享 tmpfs。补充 r12 使用用户明确授权的校园账户完成真实 Renderer 表单→Preload→Main IPC 登录（记住密码关闭），随后进入 Material Review UI；Main 的 V1/V2 列表回执均为 0，未打开或创建案卷。logout 清理账户文件/认证分区并销毁隔离 profile。此项仅为 UI 路由 PASS_SCOPED，不解锁 Provider 或 A/B/C。

命令清单保留全部 runner 尝试、退出码和 stdout/stderr SHA-256，包括已修正的首败。一个早期手工检查命令未经过 runner，单独标注且披露未保存原始 runner 日志；r09/r10b Pi SDK 捕获文件在后续重启前未分别归档，但 Main/V2 查询输出已保留，且不用于宣称 Provider 调用。

状态保持：P06 PARTIAL / P06-S02 NOT ACCEPTED / U1_FULL NOT ACCEPTED / L02-00 EXIT NOT ACCEPTED / L02-01 NOT ADMITTED / MERGE NO-GO。详情见 79 号结果报告。
