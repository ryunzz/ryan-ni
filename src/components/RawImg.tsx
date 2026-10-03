/* eslint-disable @next/next/no-img-element -- theater layers are pre-encoded (AVIF/WebP) on R2 and sized by CSS */
import type { ImgHTMLAttributes } from "react";

export function RawImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt="" {...props} />;
}
