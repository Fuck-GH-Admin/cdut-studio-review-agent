"""同材料试用 Pi 与 Deep Agents 单 Agent；凭据只在内存或子进程环境中传递。"""
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import time
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from deepagents.middleware.filesystem import FilesystemMiddleware
from deepagents.profiles import GeneralPurposeSubagentProfile, HarnessProfile, register_harness_profile
from langchain_core.callbacks import BaseCallbackHandler
from langchain_openai import ChatOpenAI


def load_channel():
    root = Path(os.environ.get("REVIEW_TRIAL_CONFIG_DIR", str(Path.home() / ".cdutai-dev")))
    channels = json.loads((root / "channels.json").read_text())["channels"]
    matches = [c for c in channels if c.get("enabled") and any(m.get("id") == "deepseek-flash" and m.get("enabled") for m in c.get("models", []))]
    if len(matches) != 1:
        raise ValueError("需要一个已启用的 DeepSeek Flash 试用渠道")
    channel = matches[0]
    encrypted = channel["apiKey"]
    if not encrypted.startswith("proferv1:"):
        raise ValueError("本地脚本只读取项目 AES-GCM 凭据；其他格式请通过应用运行")
    device = json.loads((root / "device.json").read_text())["deviceId"]
    key = hashlib.pbkdf2_hmac("sha512", device.encode(), b"profer-token-v1", 100000, dklen=32)
    raw = base64.b64decode(encrypted.removeprefix("proferv1:"))
    token = AESGCM(key).decrypt(raw[:16], raw[32:] + raw[16:32], None).decode()
    url = channel["baseUrl"].rstrip("/")
    if not url.endswith("/v1"):
        url += "/v1"
    return token, url


class Metrics(BaseCallbackHandler):
    raise_error = True

    def __init__(self):
        self.calls = 0
        self.usage = {"inputTokens": 0, "outputTokens": 0, "cacheReadTokens": 0}
        self.request_sizes = []

    def on_chat_model_start(self, serialized, messages, **kwargs):
        self.calls += 1
        if self.calls > 12:
            raise RuntimeError("达到试用请求上限 12")
        tools = kwargs.get("invocation_params", {}).get("tools", [])
        self.request_sizes.append({
            "apiCall": self.calls,
            "toolSchemaChars": len(json.dumps(tools, ensure_ascii=False)),
            "messageChars": len(json.dumps([[m.model_dump(mode="json") for m in batch] for batch in messages], ensure_ascii=False)),
        })

    def on_llm_end(self, response, **kwargs):
        for batch in response.generations:
            for generation in batch:
                message = getattr(generation, "message", None)
                usage = getattr(message, "usage_metadata", None)
                if usage:
                    # LangChain input_tokens 已包含缓存命中；不能再把 cache_read 加一次。
                    self.usage["inputTokens"] += usage.get("input_tokens", 0)
                    self.usage["outputTokens"] += usage.get("output_tokens", 0)
                    self.usage["cacheReadTokens"] += usage.get("input_token_details", {}).get("cache_read", 0)


def run_deepagents(workspace, system, token, url):
    metrics = Metrics()
    model = ChatOpenAI(
        model="deepseek-flash", api_key=token, base_url=url, temperature=0,
        max_tokens=32000, timeout=60, max_retries=0,
        extra_body={"thinking": {"type": "disabled"}},
        profile={"max_input_tokens": 400000, "max_output_tokens": 32000},
    )
    register_harness_profile("openai:deepseek-flash", HarnessProfile(
        general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False),
    ))
    backend = FilesystemBackend(root_dir=workspace, virtual_mode=True)
    agent = create_deep_agent(model=model, system_prompt=system, backend=backend,
        middleware=[FilesystemMiddleware(backend=backend, tools=["ls", "read_file", "grep"])])
    started = time.perf_counter()
    result = agent.invoke({"messages": [{"role": "user", "content": "审核 /materials 中的申请与附件，完成 budget、duplicate、approval 三项检查，并返回规定的 JSON 和最终摘要。"}]}, {"callbacks": [metrics], "recursion_limit": 30})
    elapsed = (time.perf_counter() - started) * 1000
    messages = result["messages"]
    calls = [{"tool": call["name"], "args": call["args"]} for m in messages for call in getattr(m, "tool_calls", [])]
    final = messages[-1].content
    if not isinstance(final, str):
        final = "\n".join(b.get("text", "") for b in final if isinstance(b, dict))
    return {"engine": "deepagents-single", "elapsedMs": elapsed, "apiCalls": metrics.calls, "usage": metrics.usage, "requestSizes": metrics.request_sizes, "calls": calls, "final": final, "messages": [m.model_dump(mode="json") for m in messages]}


def evaluate(record, case):
    format_ok = True
    try:
        text = record.get("final", "").strip()
        try:
            answer = json.loads(text)
        except json.JSONDecodeError:
            # 单独记录格式违约；不把前言/代码围栏和事实判断混成同一个指标。
            blocks = re.findall(r"```json\s*([\s\S]*?)\s*```", text)
            if len(blocks) != 1:
                raise
            answer = json.loads(blocks[0])
            format_ok = False
    except (json.JSONDecodeError, TypeError):
        return {"passed": False, "error": "没有返回可解析的最终 JSON", "checks": []}
    expected = case["expected"]
    checks = answer.get("checks", [])
    ids = [c.get("id") for c in checks]
    rows = []
    root = Path(case["workspace"]).resolve()
    for check_id, expectation in expected.items():
        candidates = [c for c in checks if c.get("id") == check_id]
        if len(candidates) != 1:
            rows.append({"id": check_id, "passed": False, "error": "检查缺失或重复"})
            continue
        check = candidates[0]
        fields_ok = all(check.get(key) == value for key, value in expectation.items())
        references = []
        for ref in check.get("refs", []):
            path = (root / str(ref.get("path", "")).lstrip("/")).resolve()
            valid = False
            if path.is_relative_to(root) and path.is_file():
                lines = path.read_text().splitlines()
                number = ref.get("line")
                quote = ref.get("quote", "")
                valid = isinstance(number, int) and 1 <= number <= len(lines) and bool(quote.strip()) and quote in lines[number - 1]
            references.append({"path": ref.get("path"), "line": ref.get("line"), "valid": valid})
        refs_ok = bool(references) and all(ref["valid"] for ref in references)
        # 数字比较必须覆盖申请值和 3 个明细操作数；重复必须引用不同支出行。
        ledger_lines = {ref["line"] for ref in references if str(ref["path"]).endswith("ledger.csv") and ref["valid"]}
        if check_id == "budget":
            refs_ok = refs_ok and any(str(ref["path"]).endswith("application.md") and ref["valid"] for ref in references)
            if expectation["actual"] is not None:
                refs_ok = refs_ok and {2, 3, 4}.issubset(ledger_lines)
            else:
                refs_ok = refs_ok and 4 in ledger_lines
        if check_id == "duplicate" and expectation["status"] == "conflict":
            refs_ok = refs_ok and {3, 4}.issubset(ledger_lines)
        rows.append({"id": check_id, "passed": fields_ok and refs_ok, "fieldsCorrect": fields_ok, "referencesCorrect": refs_ok, "references": references})
    summary_ok = isinstance(answer.get("summary"), str) and bool(answer["summary"].strip())
    passed = bool(ids) and set(ids) == set(expected) and len(ids) == len(expected) and all(row["passed"] for row in rows) and summary_ok
    return {"passed": passed, "formatCompliant": format_ok, "integrationReady": passed and format_ok, "summaryPresent": summary_ok, "checks": rows, "answer": answer}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--repeats", type=int, default=2)
    parser.add_argument("--engines", nargs="+", default=["pi-minimal", "deepagents-single"])
    args = parser.parse_args()
    output = args.output.resolve()
    if (output / "agent-results.json").exists():
        raise SystemExit("该目录已有实验结果，请重新准备一个目录，保留此前运行记录。")
    repo = Path(__file__).resolve().parents[2]
    manifest = json.loads((output / "agent-manifest.json").read_text())
    system = (output / "system-prompt.txt").read_text()
    token, url = load_channel()
    records = []
    for repeat in range(args.repeats):
        for case in manifest["cases"]:
            # 两轮交换引擎顺序，减少相邻缓存和服务负载造成的固定顺序偏差。
            engines = args.engines if repeat % 2 == 0 else list(reversed(args.engines))
            for engine in engines:
                path = output / "agent-runs" / f"{case['id']}-{engine}-{repeat+1}.json"
                path.parent.mkdir(parents=True, exist_ok=True)
                print(f"开始 {case['id']} {engine} 第 {repeat+1} 轮", flush=True)
                started = time.perf_counter()
                try:
                    if engine == "pi-minimal":
                        env = {**os.environ, "REVIEW_TRIAL_API_KEY": token, "REVIEW_TRIAL_BASE_URL": url}
                        process = subprocess.run(["bun", "run", "work/pi-framework-trial.ts", case["workspace"], str(output / "system-prompt.txt"), str(path)], cwd=repo / "apps/electron", env=env, capture_output=True, text=True, timeout=200)
                        if process.returncode or not path.exists():
                            raise RuntimeError((process.stderr or process.stdout)[-1800:])
                        record = json.loads(path.read_text())
                    else:
                        record = run_deepagents(case["workspace"], system, token, url)
                    record["evaluation"] = evaluate(record, case)
                except Exception as error:
                    record = {"engine": engine, "elapsedMs": (time.perf_counter()-started)*1000, "error": str(error).replace(token, "[已隐藏]")[:1800], "evaluation": {"passed": False}}
                record.update({"caseId": case["id"], "repeat": repeat+1})
                changed = [name for name, original in case["inputHashes"].items() if hashlib.sha256((Path(case["workspace"]) / name).read_bytes()).hexdigest() != original]
                record["inputsUnchanged"] = not changed
                if changed:
                    record["evaluation"]["passed"] = False
                    record["evaluation"]["changedInputs"] = changed
                path.write_text(json.dumps(record, ensure_ascii=False, indent=2))
                summary = {k: v for k, v in record.items() if k not in ["messages", "final"]}
                records.append(summary)
                (output / "agent-results.json").write_text(json.dumps(records, ensure_ascii=False, indent=2))
                print(json.dumps({k: summary.get(k) for k in ["caseId", "engine", "repeat", "elapsedMs", "apiCalls", "usage", "error"]} | {"passed": record["evaluation"].get("passed", False)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
