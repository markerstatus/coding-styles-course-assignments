"""Run task1.py through task8.py on test-input.html.

Stdout is saved to outputs/taskN.txt. Tasks 1, 6, and 7 ignore stdout and
write output.html, so this script copies that file to the matching task
file and then restores whatever output.html was there before the run.
"""

import subprocess
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "outputs"
HTML_NAME = "test-input.html"
WRITES_OUTPUT_HTML = {1, 6, 7}
OUTPUT_HTML = ROOT / "output.html"


def run_task(number):
    dest = OUT / f"task{number}.txt"
    command = [sys.executable, f"task{number}.py", HTML_NAME]
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
    except Exception:
        dest.write_text(traceback.format_exc(), encoding="utf-8")
        return 1

    if completed.returncode == 0 and number in WRITES_OUTPUT_HTML:
        if OUTPUT_HTML.exists():
            dest.write_bytes(OUTPUT_HTML.read_bytes())
        else:
            dest.write_text(
                "exited 0 but did not create output.html\n"
                + completed.stdout
                + completed.stderr,
                encoding="utf-8",
            )
    elif completed.returncode == 0:
        dest.write_text(completed.stdout, encoding="utf-8")
    else:
        dest.write_text(completed.stdout + completed.stderr, encoding="utf-8")
    return completed.returncode


def main():
    OUT.mkdir(exist_ok=True)
    previous = OUTPUT_HTML.read_bytes() if OUTPUT_HTML.exists() else None
    statuses = []
    try:
        for number in range(1, 9):
            code = run_task(number)
            statuses.append((number, code))
            print(f"task{number}: exit {code}")
    finally:
        if previous is None:
            if OUTPUT_HTML.exists():
                OUTPUT_HTML.unlink()
        else:
            OUTPUT_HTML.write_bytes(previous)
    return 0 if all(code == 0 for _, code in statuses) else 1


if __name__ == "__main__":
    sys.exit(main())
