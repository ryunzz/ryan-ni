# Deploy

## Vercel
- Project `ryan-ni` (already owns `ryunzz.tech` and `www.ryunzz.tech`; DNS already points at Vercel, so no DNS changes are needed).
- Build: `npm run build` (runs `scripts/build-index.ts` first). Node 22 (`engines` in package.json).
- Env: `NEXT_PUBLIC_MEDIA_BASE` is unset, so media is served from the deploy itself at `/media`.
  `content/media/` is committed to git, and on Vercel `scripts/build-index.ts` copies it into `public/media` (a symlink locally).
  Keep files small: H.264 at CRF 24 capped at 4 Mbps (see the encode commands below); GitHub rejects files over 100 MB.

## Later: media on Cloudflare R2 (not set up)
Move here if the media outgrows the repo; set `NEXT_PUBLIC_MEDIA_BASE` to the bucket URL and redeploy (it is inlined at build time).
1. Cloudflare dashboard > R2 > create bucket `reel-media`.
2. Public access: enable the `r2.dev` URL, or connect a custom domain `media.ryunzz.tech` (a custom domain needs the zone on Cloudflare; `ryunzz.tech` DNS is currently at the registrar's orderbox nameservers, so use r2.dev unless you move DNS).
3. CORS rule (bucket > Settings > CORS):
   ```json
   [{ "AllowedOrigins": ["https://ryunzz.tech", "https://www.ryunzz.tech", "https://*.vercel.app", "http://localhost:3000"],
      "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["Range"], "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"], "MaxAgeSeconds": 86400 }]
   ```
4. Encode (ffmpeg):
   ```sh
   ffmpeg -i master.mov -c:v libx264 -preset slow -crf 24 -maxrate 4M -bufsize 8M -vf 'scale=-2:min(1080\,ih)' -pix_fmt yuv420p -movflags +faststart -an video.mp4
   ffmpeg -i master.mov -vn -c:a aac -b:a 192k score.m4a
   ffmpeg -i master.mov -c:v libx264 -crf 28 -vf scale=-2:480 -pix_fmt yuv420p -movflags +faststart -an preview.mp4
   ffmpeg -ss 1 -i video.mp4 -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 30 poster.avif
   ```
   Video files carry no audio: each audio track is its own file (`score.m4a`, voice takes) mixed in the browser.
5. Drop files into `content/media/<NN-slug>/` (see `content/README.md`), run `npm run index`, commit `content/media.manifest.json`.
6. `npx wrangler login` once, then `scripts/upload-media.sh` (or `--dry-run` first).
