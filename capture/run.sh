#!/bin/sh
# Re-captures every message in data/: feeds each input in inputs.json to the
# real JSON parser of each runtime and records what it says.
#   sh capture/run.sh
# Needs Docker. Containers run one at a time with a memory cap, so this is
# safe on a small machine.
set -eu
cd "$(dirname "$0")"
HERE=$(pwd)
RAW=$(mktemp -d)
trap 'rm -rf "$RAW"' EXIT

run() { docker run --rm --memory=512m -v "$HERE:/c:ro" "$@"; }

for v in 18 20 22 24; do
  run "node:$v-alpine" node /c/parse.mjs /c/inputs.json >"$RAW/node$v.json"
done
run oven/bun:alpine bun /c/parse.mjs /c/inputs.json >"$RAW/bun.json"
for v in 3.10 3.12 3.13; do
  run "python:$v-alpine" python /c/parse.py /c/inputs.json >"$RAW/python$v.json"
done
docker run --rm --memory=2g --ipc=host -v "$HERE:/c:ro" -w /tmp \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  sh -c 'npm install --silent --no-audit --no-fund playwright-core@1.62.1 >/dev/null && cp /c/browsers.mjs . && node browsers.mjs /c/inputs.json' \
  >"$RAW/browsers.json"

node merge.mjs "$RAW" ../data
