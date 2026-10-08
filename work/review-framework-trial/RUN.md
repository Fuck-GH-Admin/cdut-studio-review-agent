# 隔离复跑

在仓库根目录执行。脚本只生成实验材料和结果，不修改用户案卷；使用开发配置中已经启用的 DeepSeek Flash 渠道，密钥只保留在内存/子进程环境中。支持的凭据格式是当前 Linux 开发配置的 `proferv1:`，其他格式需通过应用提供凭据，脚本不会把密文当 key 使用。

```bash
uv venv --python 3.12 work/tmp/review-framework-trial/.venv
uv pip sync --python work/tmp/review-framework-trial/.venv/bin/python work/review-framework-trial/requirements.lock

# 使用新的目录；prepare 和 agent_trial 拒绝覆盖已有正式结果。
python3 work/review-framework-trial/prepare.py work/tmp/review-framework-trial/rerun

bun run work/review-framework-trial/current-parser.ts work/tmp/review-framework-trial/rerun/parser-manifest.json work/tmp/review-framework-trial/rerun/current
work/tmp/review-framework-trial/.venv/bin/python work/review-framework-trial/docling-parser.py work/tmp/review-framework-trial/rerun/parser-manifest.json work/tmp/review-framework-trial/rerun/docling

work/tmp/review-framework-trial/.venv/bin/python work/review-framework-trial/agent_trial.py work/tmp/review-framework-trial/rerun --repeats 2
work/tmp/review-framework-trial/.venv/bin/python work/review-framework-trial/vision-trial.py work/tmp/review-framework-trial/rerun/vision-result.json work/tmp/review-framework-trial/rerun/docling/scan/page-001.png work/tmp/review-framework-trial/rerun/vision-workspace
work/tmp/review-framework-trial/.venv/bin/python work/review-framework-trial/offload-check.py work/tmp/review-framework-trial/rerun/offload work/tmp/review-framework-trial/rerun/offload-check.json
```

`REVIEW_TRIAL_CONFIG_DIR` 可以指定配置目录，默认 `~/.cdutai-dev`。不把它设置为 Agent 工作区；实验工作区只包含本场景材料。

正式记录保存在 `outputs/review-framework-trial-2026-10-08`。试用说明、发现及限制见 [13-single-agent-framework-trial.md](../../docs/design/review-agent/13-single-agent-framework-trial.md)。

当前锁定环境只包含原生 PDF 与 Office 路径；完整 PDF OCR/布局模型管线尚未安装和验证。

复跑会使用真实模型 API。Pi 每次最多 12 次请求、180 秒主动中止；Deep Agents 最多 12 次模型调用、单次请求 60 秒，不重试传输错误。输入/输出 token 分开保存，缓存命中是输入的子集，不再重复相加。
