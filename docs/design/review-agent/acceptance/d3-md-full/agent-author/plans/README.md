# D2计划状态：NOT-RUN

`selection.json`和`case.json`是实际CLI预览的**输入**，并不是实际D2输出。

为何不能提供`actual-d2-plan.json`：执行环境无法clone仓库（`git ls-remote`报`Could not resolve host: github.com`）。已经从已连接GitHub接口精确阅读了目标SHA上的CLI/TypeScript契约，但这不等于运行D2。

请运行`tests/replay.sh`；执行成功后保存stdout JSON，不允许通过手写fingerprint/RuleSpec伪造plan。高级阻断的D2_UNMAPPED_ADVANCED属于预期拒绝，但本次也未运行，不能写exit 1实测。
