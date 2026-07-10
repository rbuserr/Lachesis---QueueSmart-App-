"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SnakeLogo from "@/components/ui/snake-logo.png";
import { cn } from "@/lib/utils";

export interface PortalNavLink {
  href: string;
  label: string;
}

interface PortalNavProps {
  title: string;
  subtitle: string;
  userPrimary: string;
  userSecondary: string;
  links: PortalNavLink[];
}

export function PortalNav({
  title,
  subtitle,
  userPrimary,
  userSecondary,
  links,
}: PortalNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <Image
            src={SnakeLogo}
            alt="QueueSmart logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{userPrimary}</p>
          <p className="text-xs text-muted-foreground">{userSecondary}</p>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-8">
        {links.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
