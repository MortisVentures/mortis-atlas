import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
];

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="Mortis Atlas"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold text-lg bg-gradient-to-r from-[#8AFF53] via-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
              Mortis Atlas
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
