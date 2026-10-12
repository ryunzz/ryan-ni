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
  title: { default: "Ryan Ni", template: "%s · Ryan Ni" },
  description: "Ryan Ni: AI research, prev SWE @ Apple, Founder @ Lightyear (S26), 18x hackathon winner, CS @ UCSD.",
  openGraph: { title: "Ryan Ni", description: "AI research · prev SWE @ Apple · Founder @ Lightyear (S26) · 18x hackathon winner · CS @ UCSD", url: "https://ryunzz.tech", siteName: "Ryan Ni", type: "website" },
};

export const viewport: Viewport = { themeColor: "#070708", colorScheme: "dark", width: "device-width", initialScale: 1 };

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

/* repeat visits in the same tab, and every route but /, skip act one; set before first paint so the theater never flashes */
const seen = `try{if(sessionStorage.getItem("reel-seen")||location.pathname!=="/")document.documentElement.setAttribute("data-seen","")}catch(e){}`;

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
