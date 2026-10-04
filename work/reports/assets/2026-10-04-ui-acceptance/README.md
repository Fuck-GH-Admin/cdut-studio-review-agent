# 验收证据

对应 [验收报告](../../2026-10-04-ui-functional-acceptance.md)。截图来自实际 Electron dev；业务 QA 输入虚构，受控 AI 回复只验证通信/状态/上下文，不提供模型准确率证据。

- `manifest.json`：代码基线、修改文件 SHA256、案卷材料清单，以及公开 RDA 样本的本地来源和解析结果。
- `verification-summary.txt`：最终测试、类型、边界及构建结果；不收录宿主环境变量或完整日志。
- `fixtures/`：两份虚构依据、申请与补充说明、文本证明、损坏 DOCX、9 张可解码的 1×1 PNG。PNG 用于请求上限测试，不是 OCR 样本。
- `actions-sanitized.jsonl`：操作轨迹，密钥输入占位值已隐藏。鼠标输入记录本身不代表功能断言通过，需结合报告、截图和持久化数据复核。
- `scripts/`：当时使用的测试辅助脚本。只操作独立 QA 实例，不加入产品运行时或构建链。

## 复核前提

脚本中的工作目录是 `/tmp/cdut-ui-acceptance-20261003`，仓库路径是本机 `CDUT-Studio`；迁移机器需先调整这两个路径。安装依赖用项目既有环境，本轮未新增测试依赖。

1. 在上述目录创建 `config`、`userdata`、`fixtures`、`screenshots`，复制虚构夹具；保持真实个人配置独立。
2. 运行 `mock-model.mjs`，仅监听本机 `127.0.0.1:9249`。从模型设置添加 OpenAI 兼容渠道，地址 `http://127.0.0.1:9249/v1`、模型 `gpt-4o-mini`，密钥填无效 QA 占位值。它的答复明确标为受控联调内容。
3. 用独立配置启动 `bun run dev`，Vite 端口 5188。`electron-flags.cjs` 只用于这个验收实例，给 Electron 添加本机 CDP 端口 9237。Linux 无显示环境时使用 Xvfb/Openbox，记录 DISPLAY 到 QA 目录的 `display` 文件。
4. 通过 UI 创建标题为“验收-A-双依据申请”的案卷并导入材料；受控服务通过这份 QA 案卷的真实文档/块 ID 生成引用，不适用于其他案卷。
5. `ui.mjs snapshot` 读取界面；`click`/`contains`/`input`/`editable`/`key` 使用鼠标键盘事件。`import.py` 打开实际文件选择框。不要把 `eval` 或日志中的输入动作作为业务成功依据。
6. 在 QA 目录写 `model-mode.json` 可切换 `{ "fail": true }`（503）、`{ "empty": true }`（合法空发现）、`{ "delay": 8000 }`（并发/停止）和 `{}`（恢复）。

不提供个人目录截图、渠道配置文件、真实密钥、完整 Agent 系统提示词或学校数据。RDA 原件留在已有 `references/rda-tiger-17734784`，本证据目录不重复分发。
