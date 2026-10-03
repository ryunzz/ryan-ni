#!/usr/bin/env bash
# Upload content/media/** to the Cloudflare R2 bucket with wrangler.
#   scripts/upload-media.sh            upload everything
#   scripts/upload-media.sh --dry-run  list what would be uploaded
#   BUCKET=reel-media scripts/upload-media.sh 05-iris   only one project folder
# Needs `npx wrangler login` once. Objects keep their path: content/media/05-iris/stills/a.avif -> <bucket>/05-iris/stills/a.avif
set -euo pipefail

BUCKET="${BUCKET:-reel-media}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA="$ROOT/content/media"
DRY=0
ONLY=""
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    *) ONLY="$a" ;;
  esac
done

[ -d "$MEDIA" ] || { echo "No $MEDIA folder. Drop media into content/media/<NN-slug>/ first." >&2; exit 1; }

type_of() {
  case "$(echo "${1##*.}" | tr '[:upper:]' '[:lower:]')" in
    mp4|m4v) echo video/mp4 ;; webm) echo video/webm ;; mov) echo video/quicktime ;;
    avif) echo image/avif ;; webp) echo image/webp ;; jpg|jpeg) echo image/jpeg ;; png) echo image/png ;; gif) echo image/gif ;;
    m4a) echo audio/mp4 ;; mp3) echo audio/mpeg ;; aac) echo audio/aac ;; ogg) echo audio/ogg ;; wav) echo audio/wav ;; flac) echo audio/flac ;;
    *) echo application/octet-stream ;;
  esac
}

# refresh the manifest so the committed index matches what is uploaded
(cd "$ROOT" && npx tsx scripts/build-index.ts >/dev/null)

count=0
while IFS= read -r -d '' f; do
  rel="${f#"$MEDIA"/}"
  [ -n "$ONLY" ] && [[ "$rel" != "$ONLY"/* ]] && continue
  ct="$(type_of "$f")"
  if [ "$DRY" = 1 ]; then
    echo "would upload $BUCKET/$rel ($ct)"
  else
    echo "upload $BUCKET/$rel ($ct)"
    npx wrangler r2 object put "$BUCKET/$rel" --file "$f" --content-type "$ct" --cache-control "public, max-age=31536000, immutable" --remote
  fi
  count=$((count + 1))
done < <(find "$MEDIA" -type f ! -name '.*' -print0 | sort -z)

echo "$count file(s). Commit content/media.manifest.json so the site knows which files exist."
