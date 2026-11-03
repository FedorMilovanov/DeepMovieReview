#!/usr/bin/env python3
"""Inspect PDFs made by reading-quality-audit.mjs, including raster evidence.

Requires Poppler's pdftotext + pdftoppm, or PyMuPDF. Extracted text alone does
not prove that text is legible: the rendered PNGs must also be viewed. The
script deliberately reports short-text pages rather than calling an image-only
page blank. Nothing here asserts a physical printer or another browser worked.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

try:
    import fitz  # Optional local backend; CI uses Poppler.
except ImportError:
    fitz = None


def norm(value):
    return "".join(char for char in unicodedata.normalize("NFKC", value).casefold() if char.isalnum())


def sha(value):
    return hashlib.sha256(value).hexdigest()


def pages_for(path):
    if fitz:
        with fitz.open(path) as document:
            return [page.get_text() for page in document]
    if not shutil.which("pdftotext"):
        raise RuntimeError("Install poppler-utils or PyMuPDF to extract PDF text")
    # Raw content order keeps each table cell together; -layout interleaves
    # the columns line by line and creates false missing-cell failures.
    text = subprocess.run(["pdftotext", "-raw", "-enc", "UTF-8", str(path), "-"], check=True, capture_output=True, text=True).stdout
    pages = text.split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    return pages


def render(path, page_number, output):
    if fitz:
        with fitz.open(path) as document:
            document[page_number - 1].get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(output)
    elif shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-f", str(page_number), "-l", str(page_number), "-png", "-r", "108", "-singlefile", str(path), str(output.with_suffix(""))], check=True, capture_output=True)
    else:
        raise RuntimeError("Install poppler-utils or PyMuPDF to rasterize PDF pages")
    return sha(output.read_bytes())


def ink_fraction(path, page_number, directory):
    """Approximate coverage for a suspiciously short-text page, images included."""
    if fitz:
        with fitz.open(path) as document:
            pixmap = document[page_number - 1].get_pixmap(matrix=fitz.Matrix(0.5, 0.5), colorspace=fitz.csGRAY, alpha=False)
            pixels = pixmap.samples
    else:
        if not shutil.which("pdftoppm"):
            raise RuntimeError("pdftoppm is required to inspect short PDF pages")
        stem = directory / f".ink-{path.stem}-{page_number}"
        subprocess.run(["pdftoppm", "-f", str(page_number), "-l", str(page_number), "-gray", "-scale-to", "600", "-singlefile", str(path), str(stem)], check=True, capture_output=True)
        pgm = stem.with_suffix(".pgm")
        data = pgm.read_bytes()
        pgm.unlink()
        header = re.match(rb"P5\s+(?:\#[^\n]*\n\s*)?\d+\s+\d+\s+255\s", data)
        if not header:
            raise RuntimeError("Unexpected pdftoppm grayscale format")
        pixels = data[header.end():]
    return sum(pixel < 235 for pixel in pixels) / max(1, len(pixels))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path, help="Directory containing pdf-manifest.json and the PDFs")
    parser.add_argument("--prune", action="store_true", help="After successful inspection keep two representative PDFs and all PNGs")
    args = parser.parse_args()
    directory = args.directory.resolve()
    manifest = json.loads((directory / "pdf-manifest.json").read_text(encoding="utf-8"))
    if manifest.get("browser") != "chromium" or len(manifest.get("files", [])) != 17:
        raise RuntimeError("Expected the completed Chromium 8-variant matrix plus 9 spoiler/no-JS PDFs")
    required = [
        "Фильм насыщен сценами страха и психологического давления",
        "Античность, гностицизм и платоновская пещера",
        "Исходный файл в этой проверке недоступен, а выборочные кадры и субтитры не заменяют просмотр со звуком",
    ]
    full_titles = manifest["fullSections"]
    assert len(full_titles) >= 10, "The full article's section manifest is incomplete"
    output = {"rasterizer": "PyMuPDF" if fitz else "Poppler", "files": [], "errors": [], "matrixTextHashes": {}, "matrixPageHashes": {}}
    all_files = manifest["files"]
    for entry in all_files:
        file = entry["file"]
        path = directory / file
        try:
            pages = pages_for(path)
            assert pages, f"{file}: no pages"
            text = norm(" ".join(pages))
            visible_ids = {section["id"] for section in entry["sections"]}
            assert visible_ids, f"{file}: no projected sections"
            for section in entry["sections"]:
                assert norm(section["title"]) in text, f"{file}: missing section heading {section['id']}"
            for section in full_titles:
                # Very short, ordinary words such as «Вердикт» may legitimately
                # occur in another paragraph. Use unique long headings instead.
                if section["id"] not in visible_ids and len(norm(section["title"])) >= 15:
                    assert norm(section["title"]) not in text, f"{file}: filtered section leaked: {section['id']}"
            for group in ("supportItems", "decisionItems", "tableCells"):
                for index, item in enumerate(entry[group]):
                    assert norm(item) in text, f"{file}: missing {group}[{index}]: {item[:120]}"
            if entry["skipLink"]:
                assert norm(entry["skipLink"]) not in text, f"{file}: screen skip link printed"
            if entry["level"] == "FULL":
                assert len(entry["qualifications"]) == 3, f"{file}: expected three qualifications"
                for item in entry["qualifications"] + required:
                    assert norm(item) in text, f"{file}: missing qualification: {item[:120]}"
                assert entry["verdict"] and norm(entry["verdict"]) in text, f"{file}: missing textual verdict"
                editorial_page = next((page for page in pages if norm("Редакционная записка") in norm(page)), None)
                assert editorial_page, f"{file}: missing editorial note"
                assert any(norm(line) == norm("Редакция") for line in editorial_page.splitlines()), \
                    f"{file}: editorial kicker is stranded on another page"
            else:
                for item in required:
                    assert norm(item) not in text, f"{file}: full-only qualification leaked"
            short_pages = [{"page": number, "characters": len(norm(content)), "inkFraction": ink_fraction(path, number, directory)}
                           for number, content in enumerate(pages, 1) if len(norm(content)) < 120]
            for short in short_pages:
                # A final page with just a stranded source line is not a useful
                # page. A full-page image, by contrast, is not a blank page.
                assert short["page"] != len(pages) or short["inkFraction"] >= 0.01, f"{file}: nearly empty final page: {short}"
            record = {"file": file, "level": entry["level"], "javascript": entry["javascript"],
                      "pages": len(pages), "sectionCount": len(visible_ids),
                      "supportCount": len(entry["supportItems"]), "decisionCount": len(entry["decisionItems"]),
                      "tableCells": len(entry["tableCells"]), "textSha256": sha(text.encode()),
                      "shortTextPagesForManualReview": short_pages, "renders": []}
            matrix = not file.startswith("level-")
            # Render every light/dark × background × disclosure verdict page,
            # plus no-JS's verdict and the two pages of the long correction table.
            if entry["level"] == "FULL":
                qualification_page = next(i for i, page in enumerate(pages, 1) if norm(required[0]) in norm(page))
                render_path = directory / f"{path.stem}-verdict-p{qualification_page}.png"
                image_hash = render(path, qualification_page, render_path)
                record["renders"].append({"page": qualification_page, "file": render_path.name, "sha256": image_hash})
                if matrix:
                    output["matrixTextHashes"][file] = record["textSha256"]
                    output["matrixPageHashes"][file] = image_hash
                if file == "dark-no-backgrounds-closed.pdf":
                    for number, page in enumerate(pages, 1):
                        if norm("Ходовое утверждение") in norm(page):
                            table_path = directory / f"table-p{number}.png"
                            record["renders"].append({"page": number, "file": table_path.name, "sha256": render(path, number, table_path)})
            output["files"].append(record)
            print(f"PASS {file}: {len(pages)} pages, {len(visible_ids)} sections, {len(entry['supportItems'])} support items")
        except (AssertionError, StopIteration, OSError, subprocess.CalledProcessError) as error:
            output["errors"].append({"file": file, "error": str(error)})
            print(f"FAIL {file}: {error}", file=sys.stderr)
    if len(output["matrixTextHashes"]) != 8 or len(set(output["matrixTextHashes"].values())) != 1:
        output["errors"].append({"file": "matrix", "error": "Open/closed and theme/background PDFs differ in normalized text"})
    (directory / "pdf-inspection.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if output["errors"]:
        print(json.dumps(output["errors"], ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    if args.prune:
        keep = {"dark-no-backgrounds-closed.pdf", "dark-no-backgrounds-open.pdf"}
        for entry in all_files:
            if entry["file"] not in keep:
                (directory / entry["file"]).unlink()
    print(f"PASS text matrix; {len(set(output['matrixPageHashes'].values()))} distinct verdict-page PNG hashes (view the rendered pages)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
