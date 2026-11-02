"""Re-export a completed historical native artifact; never call it current evidence."""
import json
import os
import pathlib
import subprocess
import tempfile


def gh(*args):
    return subprocess.check_output(["gh", *args], text=True)


def is_successful_voiceover(jobs, revision):
    """Cancelled jobs may upload partial artifacts. Never promote those."""
    matches = [job for job in jobs if job.get("name") == "Actual AT (macos-15)"
               and job.get("head_sha") == revision]
    return (len(matches) == 1 and matches[0].get("status") == "completed"
            and matches[0].get("conclusion") == "success")


def main():
    repository = os.environ["GITHUB_REPOSITORY"]
    branch = os.environ["GITHUB_HEAD_REF"]
    current = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    # REST avoids relying on optional gh CLI filters and returns cancelled runs too;
    # eligibility is decided by the VoiceOver job itself, not the overall run.
    response = json.loads(gh("api", "--method", "GET", f"repos/{repository}/actions/workflows/ci.yml/runs",
                             "-f", f"branch={branch}", "-f", "status=completed", "-F", "per_page=20"))
    for run in response["workflow_runs"]:
        head = run["head_sha"]
        if head == current:
            continue
        run_id = run["id"]
        jobs = json.loads(gh("api", f"repos/{repository}/actions/runs/{run_id}/jobs?per_page=100"))["jobs"]
        if not is_successful_voiceover(jobs, head):
            continue
        artifacts = json.loads(gh("api", f"repos/{repository}/actions/runs/{run_id}/artifacts?per_page=100"))["artifacts"]
        matches = [item for item in artifacts if not item["expired"] and
                   item["name"] == f"actual-at-safari-voiceover-{head}"]
        if not matches:
            continue
        if len(matches) != 1:
            raise SystemExit("Ambiguous historical native artifact")
        artifact = matches[0]
        with tempfile.TemporaryDirectory(prefix="dmr-native-history-") as directory:
            subprocess.run(["gh", "run", "download", str(run_id), "--name",
                            artifact["name"], "--dir", directory], check=True)
            summaries = list(pathlib.Path(directory).rglob("safari-voiceover/summary.json"))
            if len(summaries) != 1:
                raise SystemExit("No unique historical VoiceOver summary")
            file = summaries[0]
            summary = json.loads(file.read_text())
            if summary["revision"] != head:
                raise SystemExit("Historical native artifact revision mismatch")
            summary["recoveredFrom"] = {"runId": run_id, "artifactId": artifact["id"],
                                        "headSha": head, "url": run["html_url"]}
            file.write_text(json.dumps(summary))
            print(f"Historical native evidence: {summary['recoveredFrom']}", flush=True)
            subprocess.run(["node", "scripts/publish-a11y-evidence.mjs", str(file.parent),
                            "native-historical"], check=True)
        break
    else:
        print("No retained successful prior VoiceOver artifact found; no historical result claimed", flush=True)


if __name__ == "__main__":
    main()
