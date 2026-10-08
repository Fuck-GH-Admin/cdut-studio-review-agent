"""直接使用固定版本 Docling，保留原始结构与位置，单独记录首次/再次转换。"""
import hashlib
import importlib.metadata
import json
import logging
import sys
import time
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import NativePdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.pipeline.native_pdf_pipeline import NativePdfPipeline

logging.basicConfig(level=logging.WARNING)

manifest = json.loads(Path(sys.argv[1]).read_text())
output = Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)
options = NativePdfPipelineOptions(generate_page_images=True, generate_picture_images=True, images_scale=1.5)
pdf = PdfFormatOption(pipeline_cls=NativePdfPipeline, pipeline_options=options)
converter = DocumentConverter(format_options={InputFormat.PDF: pdf})
records = []
for sample in manifest["samples"]:
    source = Path(sample["path"])
    target = output / sample["id"]
    target.mkdir(parents=True, exist_ok=True)
    record = {"id": sample["id"], "sha256": hashlib.sha256(source.read_bytes()).hexdigest()}
    try:
        durations = []
        for repeat in range(2):
            started = time.perf_counter()
            result = converter.convert(source, raises_on_error=False)
            durations.append(round((time.perf_counter() - started) * 1000, 2))
            if repeat == 0:
                doc = result.document
                (target / "document.json").write_text(json.dumps(doc.export_to_dict(), ensure_ascii=False, indent=2))
                markdown = doc.export_to_markdown()
                (target / "content.md").write_text(markdown)
                items = list(doc.iterate_items())
                record.update({
                    "status": result.status.value, "textChars": len(markdown),
                    "texts": len(doc.texts), "tables": len(doc.tables), "pictures": len(doc.pictures),
                    "pictureData": sum(p.image is not None for p in doc.pictures),
                    "provenanceItems": sum(bool(getattr(item, "prov", [])) for item, _ in items),
                    "pages": list(doc.pages),
                    "errors": [e.model_dump(mode="json") for e in result.errors],
                    "tableDimensions": [{"rows": t.data.num_rows, "cols": t.data.num_cols} for t in doc.tables],
                })
                for number, page in doc.pages.items():
                    if page.image is not None:
                        page.image.pil_image.save(target / f"page-{number:03}.png")
        record["elapsedMs"] = durations
    except Exception as error:
        record.update({"status": "error", "error": str(error)[:1000]})
    records.append(record)
    (output / "results.json").write_text(json.dumps({"doclingVersion": importlib.metadata.version("docling-slim"), "device": "cpu", "pdfMode": "native", "records": records}, ensure_ascii=False, indent=2))
    print(json.dumps(record, ensure_ascii=False), flush=True)
