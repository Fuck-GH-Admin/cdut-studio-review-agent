"""让同一个 Deep Agents 主 Agent 通过 read_file 读取 Docling 页图，无额外视觉 Agent。"""
import json
import re
import shutil
import sys
import time
from pathlib import Path

from agent_trial import load_channel, Metrics
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from deepagents.middleware.filesystem import FilesystemMiddleware
from deepagents.profiles import GeneralPurposeSubagentProfile, HarnessProfile, register_harness_profile
from langchain_openai import ChatOpenAI


def sanitize(value):
    if isinstance(value, list):
        return [sanitize(v) for v in value]
    if isinstance(value, dict):
        return {key: sanitize(v) for key, v in value.items()}
    if isinstance(value, str) and (value.startswith("data:image/") or len(value) > 10000):
        return f"[二进制内容已省略，原字段 {len(value)} 字符]"
    return value


output = Path(sys.argv[1]).resolve()
page = Path(sys.argv[2]).resolve()
workspace = Path(sys.argv[3]).resolve()
materials = workspace / "materials"
materials.mkdir(parents=True, exist_ok=True)
shutil.copy2(page, materials / "certificate-page-001.png")
metrics = Metrics()
token, url = load_channel()
model = ChatOpenAI(model="deepseek-flash", api_key=token, base_url=url, temperature=0,
    max_tokens=32000, timeout=60, max_retries=0, extra_body={"thinking": {"type": "disabled"}},
    profile={"max_input_tokens": 400000, "max_output_tokens": 32000})
register_harness_profile("openai:deepseek-flash", HarnessProfile(general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False)))
backend = FilesystemBackend(root_dir=workspace, virtual_mode=True)
agent = create_deep_agent(model=model, backend=backend,
    system_prompt="读取授权材料的图片原件，报告图片中真实写出的事实，不把样张当正式证书。只输出 JSON。",
    middleware=[FilesystemMiddleware(backend=backend, tools=["ls", "read_file"])])
started = time.perf_counter()
record = {"engine": "deepagents-single-vision", "input": "Docling NativePdfPipeline 的扫描 PDF 第 1 页图像", "sourcePage": 1}
try:
    result = agent.invoke({"messages": [{"role": "user", "content": "读取 /materials/certificate-page-001.png，提取成果编号 eventId、获奖等级 award、成员数组 members、颁发日期 date（YYYY-MM-DD）以及是否正式证书 official（布尔值）。返回上述字段的 JSON，不能根据文件名猜测。"}]}, {"callbacks": [metrics], "recursion_limit": 20})
    final = result["messages"][-1].content
    try:
        parsed = json.loads(final)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", final)
        parsed = json.loads(match[1]) if match else None
    expected = {"eventId": "TEST-EVENT-02", "award": "校级选拔赛三等奖", "members": ["TEST-STU-A", "TEST-STU-B", "TEST-STU-C"], "date": "2026-08-15", "official": False}
    record.update({"answer": parsed, "expected": expected, "passed": parsed == expected,
        "calls": [{"tool": c["name"], "args": c["args"]} for m in result["messages"] for c in getattr(m, "tool_calls", [])],
        "messages": sanitize([m.model_dump(mode="json") for m in result["messages"]])})
except Exception as error:
    record.update({"passed": False, "error": str(error).replace(token, "[已隐藏]")[:1000]})
record.update({"elapsedMs": (time.perf_counter()-started)*1000, "apiCalls": metrics.calls, "usage": metrics.usage})
output.write_text(json.dumps(record, ensure_ascii=False, indent=2))
print(json.dumps({k: v for k, v in record.items() if k != "messages"}, ensure_ascii=False))
