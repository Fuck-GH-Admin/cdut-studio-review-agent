# p01-app-shell____pycache__ 索引（仓根 __pycache__/ 字节码缓存）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell____pycache__`（owner `p01-app-shell`，family `__pycache__`）共 1 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## __pycache__--verify_doc.cpython-313.pyc

- 职责：CPython 3.13 的模块字节码缓存（binary，2471 字节）：`file` 判定 `Byte-compiled Python module for CPython 3.13 (magic: 3571), timestamp-based`；pyc 头实读=flags 0（时间戳校验模式）、源 `.py` mtime `2026-10-23 01:26:59 UTC`、源大小 1095 字节——即仓根脚本 `verify_doc.py` 的编译缓存。模块名 `verify_doc`（文档核对脚本，由命名推断）。
- 消费：①正常导入机制：Python 在 `sys.path` 含仓根且 `import verify_doc` 时按 `__pycache__/<mod>.cpython-313.pyc` 命名规则加载它（CPython import 约定=推断）；②实际消费者=**无**——全树检索 `verify_doc` 仅命中本 .pyc 自身（证实），且其源 `verify_doc.py` 不在冻结树（全树文件清单 3083 项无此文件，证实），缓存处于 stale 状态。
- 来源：CPython 3.13 解释器自动生成（时间戳模式缓存，源脚本约 1095 字节、2026-10-23 01:26:59 UTC 时编译）；生成方=`verify_doc.py` 被 CPython 运行的那次执行（推断：源文件已删，未见生成脚本）。sourceBlob `bdb21ac626363030693ba20e2ee3b83cee2a51fe`；sourceSha256 `303368816bb62789b6787480ec7f699bcfb2af24131e6267469e8f7af6eceeec`。
- 打包：不进安装包（electron-builder.yml:44-68 `files:` 仅 dist/package.json/node_modules、:70-122 `extraResources:` 清单无 `__pycache__`；Python 缓存不属任何产物通道）。
- 影响：删除对构建/运行**无影响**（无消费者、无源文件）；改动=伪造字节码可能在有人重建同名 `verify_doc.py` 并被导入时造成混淆（时间戳校验下源 mtime 不匹配会自动失效重编译，故实际风险低）。
- 验证：①`file` 与 pyc 头（magic `f30d0d0a`、flags 0、mtime/size）复核；②全树检索确认 `verify_doc.py` 缺失且无 import 者；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/Python 导入执行（本轮统一 NOT_RUN，且无源可执行）。
- 证实/推断/未知：字节码头信息、无消费者、无源=**证实**；模块用途「文档核对脚本」=**推断**（仅凭模块名 verify_doc 与 mtime 时点）；脚本原始行为/为何被删=**未知**（源不在树，查过全树文件清单与 `verify_doc` 全文检索，仅命中自身）。
