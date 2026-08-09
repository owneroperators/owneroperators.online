#!/bin/sh
# cast.sh <role> "<prompt>" — invoke a cast member by role, resolving the live
# ollama tag (canonical first, vanilla fallback; tags drift). Pipes stdin
# through, so `cat file | cast.sh jester "roast this"` works.
#
# Roles: silas margot ren june jester gloria louuy reader nathan mote
# Character models (gloria/louuy/reader/nathan) have NO vanilla fallback on
# purpose — a vanilla model can't hold the voice. Missing tag = stop, tell Eric.
#
# Table mirrors references/models.md — update both together.

ROLE=$1
[ -z "$ROLE" ] && { echo "usage: cast.sh <role> \"<prompt>\"" >&2; exit 1; }
shift

case "$ROLE" in
  silas)  TAGS="silas-7b-q8-ft:latest silas:latest qwen2.5-coder:7b" ;;
  margot) TAGS="margot-1.7b-q8-ft:latest margot:latest qwen3:1.7b" ;;
  ren)    TAGS="ren-1.7b-q8-ft:latest qwen3:1.7b" ;;
  june)   TAGS="june-1.7b-q8-ft:latest smollm2:1.7b-instruct" ;;
  jester) TAGS="jester-1.7b-q8-ft:latest qwen3:1.7b" ;;
  gloria) TAGS="gloria-7b-q8-ft:latest" ;;
  louuy)  TAGS="louuy-7b-q4-ft:latest" ;;
  reader) TAGS="reader-7b-q8-ft:latest" ;;
  nathan) TAGS="nathan-7b-q8-ft:latest nathan:latest" ;;
  mote)   TAGS="mote-14b-q3-ft:latest mote-9b-q35-vanilla:latest" ;;
  *) echo "cast.sh: unknown role '$ROLE'" >&2; exit 1 ;;
esac

LIVE=$(ollama list 2>/dev/null | awk 'NR>1 {print $1}')
[ -z "$LIVE" ] && { echo "cast.sh: ollama not reachable" >&2; exit 1; }

TAG=""
for t in $TAGS; do
  if echo "$LIVE" | grep -qx "$t"; then TAG=$t; break; fi
done
[ -z "$TAG" ] && { echo "cast.sh: no live tag for '$ROLE' (tried: $TAGS)" >&2; exit 1; }

echo "[cast] $ROLE -> $TAG" >&2
exec ollama run "$TAG" "$@"
