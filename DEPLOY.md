# Deploy

## Vercel
- Project `ryan-ni` (already owns `ryunzz.tech` and `www.ryunzz.tech`; DNS already points at Vercel, so no DNS changes are needed).
- Build: `npm run build` (runs `scripts/build-index.ts` first). Node 22 (`engines` in package.json).
- Env: `NEXT_PUBLIC_MEDIA_BASE` = the public R2 URL (for example `https://media.ryunzz.tech` or the bucket's `https://pub-<id>.r2.dev`).
  Leave it unset until the bucket exists; missing media falls back to the procedural stand-ins.
  After changing it, redeploy (it is inlined at build time).

## Media on Cloudflare R2
1. Cloudflare dashboard > R2 > create bucket `reel-media`.
2. Public access: enable the `r2.dev` URL, or connect a custom domain `media.ryunzz.tech` (a custom domain needs the zone on Cloudflare; `ryunzz.tech` DNS is currently at the registrar's orderbox nameservers, so use r2.dev unless you move DNS).
3. CORS rule (bucket > Settings > CORS):
   ```json
   [{ "AllowedOrigins": ["https://ryunzz.tech", "https://www.ryunzz.tech", "https://*.vercel.app", "http://localhost:3000"],
      "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["Range"], "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"], "MaxAgeSeconds": 86400 }]
   ```
4. Encode (ffmpeg):
   ```sh
   ffmpeg -i master.mov -c:v libx264 -preset slow -b:v 5M -maxrate 6M -bufsize 10M -vf scale=-2:1080 -pix_fmt yuv420p -movflags +faststart -an video.mp4
   ffmpeg -i master.mov -c:v libx264 -crf 28 -vf scale=-2:480 -pix_fmt yuv420p -movflags +faststart -an preview.mp4
   ffmpeg -ss 1 -i video.mp4 -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 30 poster.avif
   ```
   Video files carry no audio: each audio track is its own file (`score.m4a`, voice takes) mixed in the browser.
5. Drop files into `content/media/<NN-slug>/` (see `content/README.md`), run `npm run index`, commit `content/media.manifest.json`.
6. `npx wrangler login` once, then `scripts/upload-media.sh` (or `--dry-run` first).
