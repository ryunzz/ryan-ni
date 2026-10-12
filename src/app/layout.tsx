import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../../design/reel/tokens.css";
import "../generated/type.css";
import "./globals.css";
import index from "@/generated/index.json";

config.autoAddCss = false;

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--nf-display", display: "swap" });
const ui = Geist({ subsets: ["latin"], variable: "--nf-ui", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--nf-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ryunzz.tech"),
  title: "Ryan Ni",
  description: "Ryan Ni: AI research, prev SWE @ Apple, Founder @ Lightyear (S26), 18x hackathon winner, CS @ UCSD.",
  openGraph: { title: "Ryan Ni", description: "AI research · prev SWE @ Apple · Founder @ Lightyear (S26) · 18x hackathon winner · CS @ UCSD", url: "https://ryunzz.tech", siteName: "Ryan Ni", type: "website" },
};

export const viewport: Viewport = { themeColor: "#070708", colorScheme: "dark", width: "device-width", initialScale: 1 };

/* repeat visits in the same tab skip act one; set before first paint so the theater never flashes */
/* tells search engines who the site is about; profile links come from content/about.json */
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ryan Ni",
  url: "https://ryunzz.tech",
  email: `mailto:${index.about.contact.email}`,
  description: metadata.description,
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of California San Diego" },
  sameAs: index.about.contact.links.map((l) => l.href),
};

const seen = `try{if(sessionStorage.getItem("reel-seen"))document.documentElement.setAttribute("data-seen","")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${mono.variable} fonts`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: seen }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
