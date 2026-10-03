import Link from "next/link";
import Socials from "./Socials";

const currentYear = new Date().getFullYear();

export default function Footer() {
  

  return (
    <footer className="flex flex-col items-center justify-center pb-32 sm:flex-row-reverse sm:justify-between">
      
      <Socials />
      
      <section className="mt-8 sm:mt-0">
        <p className="text-center text-xs text-muted-foreground">
          <span>&copy; {currentYear}</span>{" "}

          <Link className="link" href="/">
            ryan-ni.vercel.app
          </Link>

        </p>
      </section>
    </footer>
  );
}
