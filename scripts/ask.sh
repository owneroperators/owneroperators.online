#!/usr/bin/env bash
# Ollama helper for the dev-agent / character-model workflow.
#
# `ollama run` writes terminal escape sequences (spinners, cursor hides) into
# stdout even when it's redirected. This wrapper runs the request and strips
# those codes so the captured output is clean, pipeable, and readable.
#
# Usage:
#   scripts/ask.sh <model> "<prompt>"          # prompt as arg
#   scripts/ask.sh <model>                     # prompt on stdin
#   scripts/ask.sh <model> < prompt.txt
#   echo "prompt" | scripts/ask.sh <model>
#
# Examples:
#   scripts/ask.sh margot-1.7b-q8-ft "ASCII masthead, <=60 cols, 5 rows"
#   scripts/ask.sh louuy-7b-q4-ft < /tmp/prompt.txt > /tmp/louuy.txt
#
# Exit code mirrors the underlying ollama invocation.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  printf 'usage: %s <model> [prompt]\n' "$0" >&2
  printf '       if no prompt arg, reads from stdin\n' >&2
  exit 2
fi

model="$1"; shift

if [[ $# -gt 0 ]]; then
  ollama run "$model" "$*"
else
  ollama run "$model"
fi 2>&1 | perl -CSDA -pe '
  s/\e\[[0-9;?]*[a-zA-Z]//g;      # CSI escape sequences
  s/[\x{2800}-\x{28FF}]+\s*//g;   # braille-pattern spinner glyphs
'
