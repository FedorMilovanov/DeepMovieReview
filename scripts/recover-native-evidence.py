"""Re-export the latest retained native artifact; never call it current evidence."""
import json
import os
import pathlib
import subprocess
import tempfile


def gh(*args):
    return subprocess.check_output(["gh", *args], text=True)


repository = os.environ["GITHUB_REPOSITORY"]
branch = os.environ["GITHUB_HEAD_REF"]
current = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
runs = json.loads(gh("run", "list", "--workflow", "CI", "--branch", branch,
                     "--status", "completed", "--limit", "5", "--json", "databaseId,headSha,url"))
for run in runs:
    if run["headSha"] == current:
        continue
    artifacts = json.loads(gh("api", f"repos/{repository}/actions/runs/{run['databaseId']}/artifacts"))["artifacts"]
    matches = [item for item in artifacts if not item["expired"] and
               item["name"] == f"actual-at-safari-voiceover-{run['headSha']}"]
    if not matches:
        continue
    if len(matches) != 1:
        raise SystemExit("Ambiguous historical native artifact")
    artifact = matches[0]
    with tempfile.TemporaryDirectory(prefix="dmr-native-history-") as directory:
        subprocess.run(["gh", "run", "download", str(run["databaseId"]), "--name",
                        artifact["name"], "--dir", directory], check=True)
        summaries = list(pathlib.Path(directory).rglob("safari-voiceover/summary.json"))
        if len(summaries) != 1:
            raise SystemExit("No unique historical VoiceOver summary")
        file = summaries[0]
        summary = json.loads(file.read_text())
        if summary["revision"] != run["headSha"]:
            raise SystemExit("Historical native artifact revision mismatch")
        summary["recoveredFrom"] = {"runId": run["databaseId"], "artifactId": artifact["id"],
                                    "headSha": run["headSha"], "url": run["url"]}
        file.write_text(json.dumps(summary))
        print(f"Historical native evidence: {summary['recoveredFrom']}", flush=True)
        subprocess.run(["node", "scripts/publish-a11y-evidence.mjs", str(file.parent),
                        "native-historical"], check=True)
    break
else:
    print("No retained prior native artifact found; no historical result claimed", flush=True)
