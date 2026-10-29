"""Recover a prior run on the authorized runner; do not trust it as current evidence."""
import json
import os
import pathlib
import subprocess
import tempfile


def gh(*args):
    return subprocess.check_output(["gh", *args], text=True)


branch = os.environ["GITHUB_HEAD_REF"]
runs = json.loads(gh("run", "list", "--workflow", "CI", "--branch", branch,
                     "--status", "success", "--limit", "1", "--json", "databaseId,headSha"))
if not runs:
    raise SystemExit("No previous successful CI run to recover")
run = runs[0]
with tempfile.TemporaryDirectory(prefix="dmr-history-") as directory:
    subprocess.run(["gh", "run", "download", str(run["databaseId"]), "--pattern",
                    "browser-audit-*", "--dir", directory], check=True)
    summaries = list(pathlib.Path(directory).rglob("a11y-report/summary.json"))
    if len(summaries) != 1:
        raise SystemExit("Previous artifact has no unique accessibility summary")
    summary = json.loads(summaries[0].read_text())
    if summary["revision"] != run["headSha"]:
        raise SystemExit("Recovered summary does not match historical run SHA")
    print(f"Recovered historical run {run['databaseId']} at {run['headSha']}", flush=True)
    subprocess.run(["node", "scripts/publish-a11y-evidence.mjs",
                    str(summaries[0].parent), "historical"], check=True)
