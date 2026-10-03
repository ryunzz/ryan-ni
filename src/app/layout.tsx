import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../../design/reel/tokens.css";
import "../generated/type.css";
import "./globals.css";

config.autoAddCss = false;

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--nf-display", display: "swap" });
const ui = Geist({ subsets: ["latin"], variable: "--nf-ui", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--nf-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ryunzz.tech"),
  title: "Ryan Ni",
  description: "Ryan Ni studies Computer Science and Film at UCSD, does AI research and builds things. A portfolio presented as a film.",
  openGraph: { title: "Ryan Ni", description: "Written and Directed by Ryan Ni.", url: "https://ryunzz.tech", siteName: "Ryan Ni", type: "website" },
};

export const viewport: Viewport = { themeColor: "#070708", colorScheme: "dark", width: "device-width", initialScale: 1 };

/* repeat visits in the same tab skip act one; set before first paint so the theater never flashes */
const seen = `try{if(sessionStorage.getItem("reel-seen"))document.documentElement.setAttribute("data-seen","")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${mono.variable} fonts`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: seen }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
