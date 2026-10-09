# Python's side of parse.mjs: the exact json.loads error for every input.
import json
import platform
import sys

inputs = json.load(open(sys.argv[1], encoding="utf-8"))
messages = {}
for key, text in inputs.items():
    try:
        json.loads(text)
        messages[key] = None
    except json.JSONDecodeError as e:
        messages[key] = f"JSONDecodeError: {e}"
print(json.dumps({"version": platform.python_version(), "messages": messages}))
