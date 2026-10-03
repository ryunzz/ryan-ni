import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ADLaM_Display, Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const adlam = ADLaM_Display({ 
    subsets: ['latin'], 
    variable: '--font-adlam',
    weight: ['400'], 
  });

export const metadata: Metadata = {
  openGraph: {
    title: "Ryan Ni Portfolio",
    description: "Hi, I'm Ryan Ni, this is my portoflio of my software engineering experience/projects",
    images: ["/image/ryan.jpg"],
  },
  icons:{ 
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "mx-auto flex min-h-screen max-w-3xl flex-col px-8 font-sans antialiased",
          inter.variable,
          adlam.variable,
        )}
      >
        <Providers>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
