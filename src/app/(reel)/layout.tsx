import { Reel } from "@/components/Reel";

/* one Reel for every route, so moving between them in the app never remounts it;
 * each page adds its own metadata and the plain text crawlers read */
export default function ReelLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Reel />
      {children}
    </main>
  );
}
