"""验证大工具结果落盘、逐字保存及尾部事实可恢复；不评估模型准确率。"""
import hashlib
import json
import sys
from pathlib import Path

from deepagents.backends import FilesystemBackend
from deepagents.middleware.filesystem import FilesystemMiddleware
from langchain_core.messages import ToolMessage

root = Path(sys.argv[1]).resolve()
root.mkdir(parents=True, exist_ok=True)
backend = FilesystemBackend(root_dir=root, virtual_mode=True)
middleware = FilesystemMiddleware(backend=backend, tools=["ls", "read_file", "grep"])
content = "归档资料用于索引。\n" * 10000 + "重要证据：CASE-OFFLOAD-01；申请金额 1680 元。\n"
message, offloaded = middleware._process_large_message(
    ToolMessage(content=content, tool_call_id="trial-large-result", name="parse_document"), backend)
files = [path for path in root.rglob("*") if path.is_file()]
restored = any(path.read_text() == content for path in files)
page = backend.read("/large_tool_results/trial-large-result", offset=10000, limit=2)
found = "CASE-OFFLOAD-01" in str(getattr(page, "content", page))
record = {
    "offloaded": offloaded, "originalChars": len(content), "inlineChars": len(str(message.content)),
    "persistedVerbatim": restored, "needleRecoveredViaRead": found,
    "files": [str(path.relative_to(root)) for path in files],
    "sha256": hashlib.sha256(content.encode()).hexdigest(),
}
Path(sys.argv[2]).write_text(json.dumps(record, ensure_ascii=False, indent=2))
print(json.dumps(record, ensure_ascii=False))
assert offloaded and restored and found
