#!/usr/bin/env python3
"""Create the P1-C synthetic-only inputs used by the independent GUI run."""
from pathlib import Path
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/cdut-d4-p1c-fixtures")
out.mkdir(parents=True, exist_ok=True)
(out / "公共教学教室借用申请.md").write_text("申请临时借用公共教学教室。\n", encoding="utf-8")
(out / "失物认领申请.txt").write_text("本人申请认领一件合成测试失物。\n", encoding="utf-8")
(out / "失物招领申请.txt").write_text("合成测试：申请发布失物招领。\n", encoding="utf-8")
(out / "教室借用申请.md").write_text("合成测试：申请借用公共教室。\n", encoding="utf-8")
mixed = out / "mixed"
mixed.mkdir(exist_ok=True)
(mixed / "失物招领申请.txt").write_text("合成测试：申请发布失物招领。\n", encoding="utf-8")
(mixed / "教室借用申请.md").write_text("合成测试：申请借用公共教室。\n", encoding="utf-8")

# A valid one-page, neutral PDF. Routing must stay manual because the filename
# and the PDF body contain none of the explicit G03/G08 terms.
stream = b"BT /F1 12 Tf 72 720 Td (Synthetic neutral application material) Tj ET\n"
objects = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream",
    b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
]
pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for n, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f"{n} 0 obj\n".encode() + obj + b"\nendobj\n")
xref = len(pdf)
pdf.extend(f"xref\n0 {len(offsets)}\n".encode())
pdf.extend(b"0000000000 65535 f \n")
for offset in offsets[1:]:
    pdf.extend(f"{offset:010d} 00000 n \n".encode())
pdf.extend(f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
(out / "申请.pdf").write_bytes(pdf)

too_many = out / "too-many"
too_many.mkdir(exist_ok=True)
for i in range(1, 10):
    (too_many / f"synthetic-{i:02d}.txt").write_text("合成测试占位材料。\n", encoding="utf-8")
(out / "invalid-empty.txt").write_bytes(b"")
with (out / "invalid-over-50mb.txt").open("wb") as f:
    f.truncate(50 * 1024 * 1024 + 1)
print(f"synthetic fixtures created in {out}")
