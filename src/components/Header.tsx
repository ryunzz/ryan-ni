import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/Button";
const navLinks = [
  {
    name: "home",
    href: "/",
  },
  {
    name: "projects",
    href: "/projects",
  },
  {
    name: "blog (comming soon)",
    href: "/blog",
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/75 py-6 backdrop-blur-sm">
      <nav className="flex items-center justify-between">
        <ul className="flex gap-4 sm:gap-8">
        
            {navLinks.map((nav, id) => (
              
              <li key={id} className="link">
                <Button
                  size="sm"
                  variant="ghost"
                >
                  <Link href={nav.href}>{nav.name}</Link>
                </Button>
              </li>
              
            ))}
        
        </ul>
        <div className="flex gap-0 sm:gap-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
